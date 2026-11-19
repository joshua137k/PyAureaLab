// Web Worker for Pyodide (CPython in WebAssembly) + Post-Execution AST/Trace Engine
/* eslint-disable no-undef */

importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js");

let pyodide = null;
let initPromise = null;

const TRACER_PYTHON_CODE = `
import ast
import sys
import io
import json
import re
import copy
import builtins

MAX_SERIALIZE_ITEMS = 24
SAFE_BUILTIN_CALLS = {"int", "float", "str", "bool", "len", "abs", "min", "max", "sum", "round", "ord", "chr"}

def _serialize_value(val, depth=0):
    if depth > 3:
        return {"type": "other", "repr": repr(val)[:40]}
    if val is None:
        return {"type": "none", "repr": "None"}
    if isinstance(val, bool):
        return {"type": "bool", "repr": "True" if val else "False"}
    if isinstance(val, int):
        return {"type": "int", "repr": str(val)}
    if isinstance(val, float):
        return {"type": "float", "repr": f"{val:.6g}"}
    if isinstance(val, str):
        r = repr(val)
        if len(r) > 36:
            r = r[:33] + "..."
        return {"type": "str", "repr": r}
    if isinstance(val, (list, tuple)):
        t = "list" if isinstance(val, list) else "tuple"
        items = [_serialize_value(x, depth + 1) for x in val[:MAX_SERIALIZE_ITEMS]]
        is_matrix = (
            depth == 0
            and len(val) > 0
            and len(val) <= 10
            and all(isinstance(row, (list, tuple)) and len(row) <= 10 for row in val)
        )
        return {
            "type": t,
            "repr": repr(val)[:60],
            "items": items,
            "isMatrix": is_matrix,
        }
    if isinstance(val, dict):
        entries = []
        for k, v in list(val.items())[:MAX_SERIALIZE_ITEMS]:
            entries.append({
                "key": str(k)[:24],
                "value": _serialize_value(v, depth + 1),
            })
        return {"type": "dict", "repr": repr(val)[:60], "entries": entries}
    if isinstance(val, set):
        items = [_serialize_value(x, depth + 1) for x in list(val)[:MAX_SERIALIZE_ITEMS]]
        return {"type": "set", "repr": repr(val)[:60], "items": items}
    return {"type": "other", "repr": repr(val)[:40]}


def _translate_error(exc_type, exc_msg, line):
    msg_lower = (exc_msg or "").lower()
    if exc_type == "SyntaxError" or exc_type == "IndentationError":
        if "expected ':'" in msg_lower:
            return {
                "pt": f"Faltou dois pontos (:) no final da linha {line}. Em Python, if, for, while e def terminam sempre com ':'.",
                "en": f"Missing colon (:) at the end of line {line}. In Python, if, for, while, and def must end with ':'.",
            }
        if "indent" in exc_type.lower() or "indent" in msg_lower:
            return {
                "pt": f"Erro de indentação na linha {line}. Verifique os espaços no início da linha para alinhar o bloco corretamente.",
                "en": f"Indentation error on line {line}. Check the leading spaces so the code block aligns properly.",
            }
        return {
            "pt": f"Erro de sintaxe na linha {line}: {exc_msg}. Confira parênteses, aspas ou dois pontos.",
            "en": f"Syntax error on line {line}: {exc_msg}. Check parentheses, quotes, or colons.",
        }
    if exc_type == "NameError":
        return {
            "pt": f"Variável ou função não encontrada ({exc_msg}). Será que escreveu o nome exatamente igual ou esqueceu de criar antes?",
            "en": f"Name not found ({exc_msg}). Did you spell it identically or forget to define it before using it?",
        }
    if exc_type == "IndexError":
        return {
            "pt": "Índice fora dos limites da lista! Lembre-se: em Python, os índices começam no 0 e vão até len(lista) - 1.",
            "en": "List index out of range! Remember: in Python, indices start at 0 and go up to len(list) - 1.",
        }
    if exc_type == "KeyError":
        return {
            "pt": f"A chave {exc_msg} não existe no dicionário.",
            "en": f"The key {exc_msg} does not exist in the dictionary.",
        }
    if exc_type == "TypeError":
        return {
            "pt": f"Tipos incompatíveis na operação ({exc_msg}). Ex.: não é possível somar texto (str) com número (int) sem converter.",
            "en": f"Incompatible types in operation ({exc_msg}). E.g., you cannot add text (str) and a number (int) without converting.",
        }
    if exc_type == "ZeroDivisionError":
        return {
            "pt": "Divisão por zero! O divisor não pode ser 0.",
            "en": "Division by zero! The divisor cannot be 0.",
        }
    if exc_type == "ValueError":
        return {
            "pt": f"Valor inválido ({exc_msg}). Verifique se a entrada de teste contém o número esperado.",
            "en": f"Invalid value ({exc_msg}). Check if the test input contains the expected number.",
        }
    if exc_type == "RecursionError":
        return {
            "pt": "Recursão infinita detetada! A função chamou-se a si mesma vezes demais sem condição de paragem.",
            "en": "Infinite recursion detected! The function called itself too many times without a base case.",
        }
    return {
        "pt": f"{exc_type}: {exc_msg}",
        "en": f"{exc_type}: {exc_msg}",
    }


def analyze_static(code_str):
    variables = []
    seen = set()
    try:
        tree = ast.parse(code_str)
    except SyntaxError as e:
        return json.dumps({
            "variables": [],
            "syntaxError": {
                "type": "SyntaxError",
                "line": e.lineno,
                "rawMessage": str(e.msg),
                "friendlyMessage": _translate_error("SyntaxError", str(e.msg), e.lineno or 1),
            }
        })

    def _walk(node, scope_name):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, ast.FunctionDef):
                _walk(child, child.name)
            elif isinstance(child, ast.Assign):
                for target in child.targets:
                    if isinstance(target, ast.Name):
                        key = (scope_name, target.id)
                        if key not in seen:
                            seen.add(key)
                            val_preview = "?"
                            inf_type = "var"
                            try:
                                lit = ast.literal_eval(child.value)
                                inf_type = type(lit).__name__
                                val_preview = repr(lit)[:24]
                            except Exception:
                                if isinstance(child.value, ast.List):
                                    inf_type = "list"
                                    val_preview = "[...]"
                                elif isinstance(child.value, ast.Dict):
                                    inf_type = "dict"
                                    val_preview = "{...}"
                            variables.append({
                                "name": target.id,
                                "inferredType": inf_type,
                                "previewValue": val_preview,
                                "scope": scope_name,
                            })
            elif isinstance(child, ast.For):
                if isinstance(child.target, ast.Name):
                    key = (scope_name, child.target.id)
                    if key not in seen:
                        seen.add(key)
                        variables.append({
                            "name": child.target.id,
                            "inferredType": "loop",
                            "previewValue": "?",
                            "scope": scope_name,
                        })
                _walk(child, scope_name)
            else:
                _walk(child, scope_name)

    _walk(tree, "main")
    return json.dumps({"variables": variables})


def _build_ast_line_map(tree):
    line_map = {}
    for node in ast.walk(tree):
        lineno = getattr(node, "lineno", None)
        if lineno is not None and lineno not in line_map:
            line_map[lineno] = node
        elif lineno is not None:
            if isinstance(node, (ast.Assign, ast.AugAssign, ast.If, ast.For, ast.While, ast.Return, ast.FunctionDef, ast.Break, ast.Continue)):
                line_map[lineno] = node
    return line_map


def _is_pure_expr(node):
    # Never evaluate expressions with side effects (input, pop, append, user functions)
    for sub in ast.walk(node):
        if isinstance(sub, ast.Call):
            if isinstance(sub.func, ast.Name) and sub.func.id in SAFE_BUILTIN_CALLS:
                continue
            return False
    return True


def _substitute_vars_in_expr(expr_src, f_locals, last_input_val=None):
    src = expr_src
    if last_input_val is not None:
        src = re.sub(r"\\binput\\s*\\([^)]*\\)", repr(last_input_val), src)

    def repl(match):
        word = match.group(0)
        if word in f_locals and not callable(f_locals[word]):
            v = f_locals[word]
            if isinstance(v, (int, float, bool, str)):
                return repr(v)
            if isinstance(v, (list, dict, tuple, set)):
                r = repr(v)
                return r if len(r) <= 28 else r[:25] + "..."
        return word
    return re.sub(r"\\b[a-zA-Z_][a-zA-Z0-9_]*\\b", repl, src)


def _op_label(node, parent_is_binop=False):
    if isinstance(node, ast.BinOp):
        op = node.op
        labels = {
            ast.Pow: ("Potência (**)", "Exponent (**)"),
            ast.Mult: ("Multiplicação (*)", "Multiplication (*)"),
            ast.FloorDiv: ("Divisão inteira (//)", "Floor division (//)"),
            ast.Div: ("Divisão (/)", "Division (/)"),
            ast.Mod: ("Resto da divisão (%)", "Modulo (%)"),
            ast.Add: ("Soma (+)", "Addition (+)"),
            ast.Sub: ("Subtração (-)", "Subtraction (-)"),
        }
        pt_l, en_l = labels.get(type(op), ("Operação", "Operation"))
        if parent_is_binop and isinstance(op, (ast.Add, ast.Sub)):
            pt_l += " [prioridade parênteses]"
            en_l += " [parentheses priority]"
        return {"pt": pt_l, "en": en_l}
    if isinstance(node, ast.UnaryOp):
        return {"pt": "Sinal / Unário", "en": "Unary operator"}
    if isinstance(node, ast.Compare):
        return {"pt": "Comparação lógica", "en": "Logical comparison"}
    if isinstance(node, ast.BoolOp):
        op_name = "AND" if isinstance(node.op, ast.And) else "OR"
        return {"pt": f"Operador lógico ({op_name})", "en": f"Logical operator ({op_name})"}
    if isinstance(node, ast.Subscript):
        return {"pt": "Acesso ao índice []", "en": "Index access []"}
    if isinstance(node, ast.Call):
        fn = ast.unparse(node.func)
        return {"pt": f"Função {fn}()", "en": f"Function {fn}()"}
    return {"pt": "Cálculo", "en": "Evaluation"}


def _op_reason(node, parent_is_binop=False):
    if parent_is_binop:
        return {
            "pt": "Prioridade máxima: está dentro de parênteses (), por isso resolve-se antes da operação externa.",
            "en": "Top priority: inside parentheses (), so it is solved before the outer operation.",
        }
    if isinstance(node, ast.BinOp):
        op = node.op
        if isinstance(op, ast.Pow):
            return {
                "pt": "A potência (**) tem prioridade superior a multiplicações, divisões e somas.",
                "en": "Exponentiation (**) has higher priority than multiplication, division, and addition.",
            }
        if isinstance(op, (ast.Mult, ast.Div, ast.FloorDiv, ast.Mod)):
            return {
                "pt": "Multiplicação (*), divisão (//) e resto (%) têm prioridade sobre soma (+) e subtração (-), da esquerda para a direita.",
                "en": "Multiplication (*), division (//), and modulo (%) have priority over + and -, evaluated left-to-right.",
            }
        if isinstance(op, (ast.Add, ast.Sub)):
            return {
                "pt": "Soma (+) e subtração (-) são calculadas após todas as multiplicações e divisões.",
                "en": "Addition (+) and subtraction (-) are evaluated after all multiplications and divisions.",
            }
    if isinstance(node, ast.Compare):
        return {
            "pt": "As comparações (==, !=, <, >) são avaliadas depois de resolver as contas matemáticas de cada lado.",
            "en": "Comparisons (==, !=, <, >) are evaluated after solving the math on both sides.",
        }
    if isinstance(node, ast.BoolOp):
        return {
            "pt": "Os operadores lógicos (and / or) juntam os resultados Verdadeiro/Falso das condições.",
            "en": "Logical operators (and / or) combine the True/False results of each condition.",
        }
    if isinstance(node, ast.Call):
        return {
            "pt": "As funções são executadas primeiro (de dentro para fora) para fornecer o valor.",
            "en": "Functions execute first (inside-out) to produce their return value.",
        }
    return {
        "pt": "Avalia esta parte da expressão segundo a ordem de precedência do Python.",
        "en": "Evaluates this part of the expression following Python operator precedence.",
    }


def _build_reduction_substeps(expr_node, f_locals, f_globals, prefix="", last_input_val=None):
    try:
        work = copy.deepcopy(expr_node)
    except Exception:
        return []

    substeps = []

    # Step 0: replace input() with the actual string just read, and replace variables with constants
    class PreSubstitutor(ast.NodeTransformer):
        def visit_Call(self, node):
            self.generic_visit(node)
            if isinstance(node.func, ast.Name) and node.func.id == "input" and last_input_val is not None:
                substeps.append({
                    "order": len(substeps) + 1,
                    "opLabel": {"pt": "Leitura input()", "en": "Read input()"},
                    "reason": {
                        "pt": "Primeiro lê o valor digitado na entrada de teste (input devolve sempre texto/str).",
                        "en": "First reads the value from test input (input always returns a text string).",
                    },
                    "highlightPart": "input()",
                    "computation": f"input() = {repr(last_input_val)}",
                    "afterExpr": "",
                })
                return ast.copy_location(ast.Constant(value=last_input_val), node)
            return node

        def visit_Name(self, node):
            if node.id in f_locals and not callable(f_locals[node.id]):
                val = f_locals[node.id]
                if isinstance(val, (int, float, bool, str)):
                    return ast.copy_location(ast.Constant(value=val), node)
            return node

    work = PreSubstitutor().visit(work)
    if substeps:
        after_str = ast.unparse(work)
        substeps[-1]["afterExpr"] = f"{prefix}{after_str}" if prefix else after_str

    if not _is_pure_expr(work):
        return substeps

    def is_const(n):
        return isinstance(n, ast.Constant)

    for _ in range(1, 12):
        if is_const(work):
            break
        reduced_one = False
        before_full_str = ast.unparse(work)

        class OneStepReducer(ast.NodeTransformer):
            def __init__(self):
                self.done = False

            def _try_reduce(self, node, parent_binop=False):
                if self.done or not _is_pure_expr(node):
                    return node
                try:
                    sub_src = ast.unparse(node)
                    expr_wrapper = ast.fix_missing_locations(ast.Expression(body=copy.deepcopy(node)))
                    val = eval(compile(expr_wrapper, "<expr>", "eval"), f_globals, f_locals)
                    if isinstance(val, (int, float, bool, str)):
                        self.done = True
                        val_repr = repr(val)
                        substeps.append({
                            "order": len(substeps) + 1,
                            "opLabel": _op_label(node, parent_binop),
                            "reason": _op_reason(node, parent_binop),
                            "beforeExpr": f"{prefix}{before_full_str}" if prefix else before_full_str,
                            "highlightPart": sub_src,
                            "computation": f"{sub_src} = {val_repr}",
                            "afterExpr": "",
                        })
                        return ast.copy_location(ast.Constant(value=val), node)
                except Exception:
                    pass
                return node

            def visit_Subscript(self, node):
                if self.done:
                    return node
                node.value = self.visit(node.value)
                node.slice = self.visit(node.slice)
                if not self.done:
                    return self._try_reduce(node)
                return node

            def visit_Call(self, node):
                if self.done:
                    return node
                node.args = [self.visit(a) for a in node.args]
                if not self.done and all(is_const(a) for a in node.args):
                    return self._try_reduce(node)
                return node

            def visit_UnaryOp(self, node):
                if self.done:
                    return node
                node.operand = self.visit(node.operand)
                if not self.done and is_const(node.operand):
                    return self._try_reduce(node)
                return node

            def visit_BinOp(self, node):
                if self.done:
                    return node
                left_is_paren = isinstance(node.left, ast.BinOp) and isinstance(node.op, (ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow))
                right_is_paren = isinstance(node.right, ast.BinOp) and isinstance(node.op, (ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow))

                if not is_const(node.left):
                    if left_is_paren and is_const(node.left.left) and is_const(node.left.right):
                        node.left = self._try_reduce(node.left, True)
                    else:
                        node.left = self.visit(node.left)
                if self.done:
                    return node

                if not is_const(node.right):
                    if right_is_paren and is_const(node.right.left) and is_const(node.right.right):
                        node.right = self._try_reduce(node.right, True)
                    else:
                        node.right = self.visit(node.right)
                if self.done:
                    return node

                if is_const(node.left) and is_const(node.right):
                    return self._try_reduce(node, False)
                return node

            def visit_Compare(self, node):
                if self.done:
                    return node
                node.left = self.visit(node.left)
                if self.done:
                    return node
                node.comparators = [self.visit(c) for c in node.comparators]
                if self.done:
                    return node
                if is_const(node.left) and all(is_const(c) for c in node.comparators):
                    return self._try_reduce(node)
                return node

            def visit_BoolOp(self, node):
                if self.done:
                    return node
                new_vals = []
                for v in node.values:
                    if not self.done and not is_const(v):
                        v = self.visit(v)
                    new_vals.append(v)
                node.values = new_vals
                if not self.done and all(is_const(v) for v in node.values):
                    return self._try_reduce(node)
                return node

        reducer = OneStepReducer()
        work = reducer.visit(work)
        if reducer.done:
            reduced_one = True
            after_str = ast.unparse(work)
            substeps[-1]["afterExpr"] = f"{prefix}{after_str}" if prefix else after_str
        if not reduced_one or is_const(work):
            break

    return substeps


def _explain_step(event, node, code_line, pre_locals, post_locals, f_globals, ret_val=None, last_input_val=None, step_out=""):
    stripped = code_line.strip()
    if event == "call":
        return (
            {
                "pt": f"Inicia chamada da função '{stripped}'",
                "en": f"Calling function '{stripped}'",
            },
            {"formula": stripped, "substituted": stripped, "result": "novo escopo", "kind": "call"},
        )
    if event == "return":
        r_str = repr(ret_val)[:30] if ret_val is not None else "None"
        return (
            {
                "pt": f"A função terminou e devolveu {r_str}",
                "en": f"Function finished and returned {r_str}",
            },
            {"formula": stripped, "substituted": f"return {r_str}", "result": r_str, "kind": "call"},
        )

    if stripped == "break" or isinstance(node, ast.Break):
        return (
            {
                "pt": "Comando 'break': interrompe e sai do ciclo imediatamente porque a condição foi atingida!",
                "en": "'break' statement: exits the loop immediately because the target condition was met!",
            },
            {"formula": "break", "substituted": "sai do ciclo / exit loop", "result": "parou ciclo", "kind": "control"},
        )

    if stripped == "continue" or isinstance(node, ast.Continue):
        return (
            {
                "pt": "Comando 'continue': salta o resto desta volta e avança para a próxima repetição do ciclo.",
                "en": "'continue' statement: skips the rest of this iteration and jumps to the next loop cycle.",
            },
            {"formula": "continue", "substituted": "próxima volta / next iter", "result": "saltou", "kind": "control"},
        )

    if isinstance(node, ast.If):
        try:
            test_src = ast.unparse(node.test)
            sub_src = _substitute_vars_in_expr(test_src, pre_locals, last_input_val)
            substeps = _build_reduction_substeps(node.test, pre_locals, f_globals, last_input_val=last_input_val)
            val = eval(compile(ast.Expression(node.test), "<expr>", "eval"), f_globals, pre_locals) if _is_pure_expr(node.test) else True
            res_str = "True ✓" if val else "False ✗"
            truth_pt = f"Verdadeira ({sub_src}) ✓ → entra no bloco if" if val else f"Falsa ({sub_src}) ✗ → salta este bloco if"
            truth_en = f"True ({sub_src}) ✓ → enters if block" if val else f"False ({sub_src}) ✗ → skips this if block"
            return (
                {
                    "pt": f"Testa se '{test_src}': condição é {truth_pt}",
                    "en": f"Tests if '{test_src}': condition is {truth_en}",
                },
                {"formula": test_src, "substituted": sub_src, "result": res_str, "kind": "condition", "subSteps": substeps},
            )
        except Exception:
            return (
                {"pt": f"Avalia condição: '{stripped}'", "en": f"Evaluating condition: '{stripped}'"},
                None,
            )

    if isinstance(node, ast.While):
        try:
            test_src = ast.unparse(node.test)
            sub_src = _substitute_vars_in_expr(test_src, pre_locals, last_input_val)
            substeps = _build_reduction_substeps(node.test, pre_locals, f_globals, last_input_val=last_input_val)
            val = eval(compile(ast.Expression(node.test), "<expr>", "eval"), f_globals, pre_locals) if _is_pure_expr(node.test) else True
            res_str = "True ✓" if val else "False ✗"
            if val:
                return (
                    {
                        "pt": f"Ciclo while: '{test_src}' ({sub_src}) é Verdadeiro ✓ → executa mais uma volta",
                        "en": f"While loop: '{test_src}' ({sub_src}) is True ✓ → runs another iteration",
                    },
                    {"formula": test_src, "substituted": sub_src, "result": res_str, "kind": "loop", "subSteps": substeps},
                )
            return (
                {
                    "pt": f"Ciclo while: '{test_src}' ({sub_src}) tornou-se Falso ✗ → termina o ciclo",
                    "en": f"While loop: '{test_src}' ({sub_src}) became False ✗ → exits loop",
                },
                {"formula": test_src, "substituted": sub_src, "result": res_str, "kind": "loop", "subSteps": substeps},
            )
        except Exception:
            return (
                {"pt": f"Avalia ciclo while: '{stripped}'", "en": f"Evaluating while loop: '{stripped}'"},
                None,
            )

    if isinstance(node, ast.For):
        target_src = ast.unparse(node.target)
        iter_src = ast.unparse(node.iter)
        new_val = repr(post_locals.get(target_src, "?")) if target_src in post_locals else "próximo"
        return (
            {
                "pt": f"Ciclo for: '{target_src}' recebe o elemento {new_val} de '{iter_src}'",
                "en": f"For loop: '{target_src}' receives item {new_val} from '{iter_src}'",
            },
            {"formula": f"for {target_src} in {iter_src}", "substituted": _substitute_vars_in_expr(iter_src, pre_locals), "result": f"{target_src} = {new_val}", "kind": "loop"},
        )

    if isinstance(node, ast.Assign):
        targets = ", ".join(ast.unparse(t) for t in node.targets)
        val_src = ast.unparse(node.value)
        sub_src = _substitute_vars_in_expr(val_src, pre_locals, last_input_val)
        substeps = _build_reduction_substeps(node.value, pre_locals, f_globals, prefix=f"{targets} = ", last_input_val=last_input_val)
        first_target = node.targets[0].id if isinstance(node.targets[0], ast.Name) else None
        if first_target and first_target in post_locals:
            res_str = repr(post_locals[first_target])[:32]
        else:
            res_str = sub_src[:32]
        return (
            {
                "pt": f"Calcula '{val_src}' ({sub_src} = {res_str}) e guarda em '{targets}'",
                "en": f"Computes '{val_src}' ({sub_src} = {res_str}) and stores it in '{targets}'",
            },
            {"formula": f"{targets} = {val_src}", "substituted": f"{targets} = {sub_src}", "result": res_str, "kind": "assign", "subSteps": substeps},
        )

    if isinstance(node, ast.AugAssign):
        target = ast.unparse(node.target)
        val_src = ast.unparse(node.value)
        op_map = {ast.Add: "+", ast.Sub: "-", ast.Mult: "*", ast.FloorDiv: "//", ast.Div: "/", ast.Mod: "%"}
        op_sym = op_map.get(type(node.op), "+")
        old_v = repr(pre_locals.get(target, "?"))
        sub_v = _substitute_vars_in_expr(val_src, pre_locals, last_input_val)
        new_v = repr(post_locals.get(target, "?"))
        return (
            {
                "pt": f"Atualiza '{target}': {old_v} {op_sym} {sub_v} = {new_v}",
                "en": f"Updates '{target}': {old_v} {op_sym} {sub_v} = {new_v}",
            },
            {
                "formula": f"{target} {op_sym}= {val_src}",
                "substituted": f"{old_v} {op_sym} {sub_v}",
                "result": f"{target} = {new_v}",
                "kind": "assign",
                "subSteps": [{
                    "order": 1,
                    "opLabel": {"pt": f"Operação ({op_sym}=)", "en": f"Operation ({op_sym}=)"},
                    "computation": f"{old_v} {op_sym} {sub_v} = {new_v}",
                    "afterExpr": f"{target} = {new_v}",
                }],
            },
        )

    if "print(" in stripped:
        out_clean = step_out.strip() if step_out else ""
        return (
            {
                "pt": f"Imprime no terminal: '{out_clean}'",
                "en": f"Prints to terminal: '{out_clean}'",
            },
            {"formula": stripped, "substituted": _substitute_vars_in_expr(stripped, pre_locals), "result": f"'{out_clean}'", "kind": "output"},
        )

    if isinstance(node, ast.Return):
        val_src = ast.unparse(node.value) if node.value else "None"
        sub_src = _substitute_vars_in_expr(val_src, pre_locals, last_input_val)
        return (
            {
                "pt": f"Retorna o resultado '{val_src}' ({sub_src})",
                "en": f"Returns result '{val_src}' ({sub_src})",
            },
            {"formula": stripped, "substituted": f"return {sub_src}", "result": sub_src, "kind": "call"},
        )

    return (
        {
            "pt": f"Executa: '{stripped}'",
            "en": f"Executes: '{stripped}'",
        },
        None,
    )


def run_with_trace(code_str, stdin_lines, max_steps=600):
    lines = code_str.splitlines()
    try:
        tree = ast.parse(code_str, filename="<student_code>")
    except SyntaxError as e:
        return json.dumps({
            "ok": False,
            "steps": [],
            "finalStdout": "",
            "error": {
                "type": type(e).__name__,
                "line": e.lineno,
                "rawMessage": str(e.msg),
                "friendlyMessage": _translate_error(type(e).__name__, str(e.msg), e.lineno or 1),
            },
        })

    line_map = _build_ast_line_map(tree)
    stdout_buf = io.StringIO()
    input_iter = iter(list(stdin_lines or []))
    steps = []
    prev_vars_by_scope = {}
    loop_counters = {}
    truncated = False
    runtime_error = None
    last_read_input = None

    def custom_input(prompt=""):
        nonlocal last_read_input
        if prompt:
            stdout_buf.write(str(prompt))
        try:
            val = str(next(input_iter))
            last_read_input = val
            return val
        except StopIteration:
            last_read_input = ""
            return ""

    def custom_print(*args, sep=" ", end="\\n", **kwargs):
        text = sep.join(str(a) for a in args) + end
        stdout_buf.write(text)

    user_globals = {
        "__name__": "__main__",
        "__builtins__": {
            **builtins.__dict__,
            "print": custom_print,
            "input": custom_input,
        },
    }

    last_stdout_len = 0
    pending_step = None

    def _snapshot_locals(raw_locals):
        snap = {}
        for k, v in raw_locals.items():
            if k.startswith("__") or callable(v) or isinstance(v, type(sys)):
                continue
            try:
                snap[k] = copy.deepcopy(v)
            except Exception:
                snap[k] = v
        return snap

    def _capture_scopes(frame):
        nonlocal prev_vars_by_scope
        frames_chain = []
        curr = frame
        while curr is not None:
            if curr.f_code.co_filename == "<student_code>":
                frames_chain.append(curr)
            curr = curr.f_back
        frames_chain.reverse()

        scopes = []
        diffs = []
        new_vars_by_scope = {}

        for fr in frames_chain:
            scope_name = "main()" if fr.f_code.co_name == "<module>" else f"{fr.f_code.co_name}()"
            raw_locals = fr.f_locals
            var_entries = []
            scope_snapshot = {}
            prev_scope = prev_vars_by_scope.get(scope_name, {})

            for k, v in raw_locals.items():
                if k.startswith("__") or callable(v) or isinstance(v, type(sys)):
                    continue
                ser = _serialize_value(v)
                scope_snapshot[k] = ser["repr"]
                changed = k in prev_scope and prev_scope[k] != ser["repr"]
                is_new = k not in prev_scope
                if changed:
                    diffs.append({
                        "name": k,
                        "oldRepr": prev_scope[k],
                        "newRepr": ser["repr"],
                    })
                elif is_new:
                    diffs.append({
                        "name": k,
                        "oldRepr": "novo",
                        "newRepr": ser["repr"],
                    })
                var_entries.append({
                    "name": k,
                    "value": ser,
                    "changed": changed or is_new,
                    "prevRepr": prev_scope.get(k),
                })

            new_vars_by_scope[scope_name] = scope_snapshot
            scopes.append({
                "name": scope_name,
                "variables": var_entries,
            })

        prev_vars_by_scope = new_vars_by_scope
        return scopes, diffs

    def _flush_pending(current_frame):
        nonlocal pending_step, last_stdout_len, last_read_input
        if not pending_step:
            return
        p = pending_step
        pending_step = None

        cur_stdout = stdout_buf.getvalue()
        step_out = cur_stdout[last_stdout_len:]
        last_stdout_len = len(cur_stdout)

        post_locals = _snapshot_locals(p["frame"].f_locals)
        scopes, diffs = _capture_scopes(p["frame"])

        expl, breakdown = _explain_step(
            p["event"],
            p["node"],
            p["code_line"],
            p["pre_locals"],
            post_locals,
            p["frame"].f_globals,
            ret_val=p["ret_val"],
            last_input_val=last_read_input,
            step_out=step_out,
        )
        last_read_input = None

        steps.append({
            "stepIndex": len(steps) + 1,
            "line": p["lineno"],
            "codeLine": p["code_line"].strip(),
            "event": p["event"],
            "explanation": expl,
            "breakdown": breakdown,
            "loopBadge": p["loop_badge"],
            "diffs": diffs,
            "scopes": scopes,
            "stdout": cur_stdout,
            "stepOutput": step_out if step_out else None,
        })

    def tracer(frame, event, arg):
        nonlocal pending_step, truncated
        if frame.f_code.co_filename != "<student_code>":
            return tracer

        # Flush the previous line now that it has finished executing!
        if event in ("line", "call", "return"):
            _flush_pending(frame)

        if len(steps) >= max_steps:
            truncated = True
            raise RuntimeError("__MAX_STEPS_REACHED__")

        if frame.f_code.co_name == "<module>" and event in ("call", "return"):
            return tracer

        lineno = frame.f_lineno
        code_line = lines[lineno - 1] if 1 <= lineno <= len(lines) else ""
        node = line_map.get(lineno)

        if event in ("line", "call", "return"):
            loop_badge = None
            if event == "line" and isinstance(node, (ast.For, ast.While)):
                loop_counters[lineno] = loop_counters.get(lineno, 0) + 1
                kind = "for" if isinstance(node, ast.For) else "while"
                cnt = loop_counters[lineno]
                loop_badge = {
                    "pt": f"{kind} • volta {cnt}",
                    "en": f"{kind} • iter {cnt}",
                }

            pending_step = {
                "frame": frame,
                "event": event,
                "lineno": lineno,
                "code_line": code_line,
                "node": node,
                "pre_locals": _snapshot_locals(frame.f_locals),
                "loop_badge": loop_badge,
                "ret_val": arg if event == "return" else None,
            }

        return tracer

    compiled = compile(tree, "<student_code>", "exec")
    sys.settrace(tracer)
    try:
        exec(compiled, user_globals)
    except Exception as e:
        pending_step = None
        if str(e) == "__MAX_STEPS_REACHED__":
            truncated = True
        else:
            tb = e.__traceback__
            err_line = None
            while tb is not None:
                if tb.tb_frame.f_code.co_filename == "<student_code>":
                    err_line = tb.tb_lineno
                tb = tb.tb_next
            exc_type = type(e).__name__
            exc_msg = str(e)
            runtime_error = {
                "type": exc_type,
                "line": err_line,
                "rawMessage": exc_msg,
                "friendlyMessage": _translate_error(exc_type, exc_msg, err_line or 1),
            }
    finally:
        sys.settrace(None)
        if pending_step is not None and runtime_error is None:
            _flush_pending(pending_step["frame"])

    return json.dumps({
        "ok": runtime_error is None,
        "steps": steps,
        "finalStdout": stdout_buf.getvalue(),
        "error": runtime_error,
        "truncated": truncated,
    })
`;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (!initPromise) {
    initPromise = (async () => {
      pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/",
      });
      await pyodide.runPythonAsync(TRACER_PYTHON_CODE);
      return pyodide;
    })();
  }
  return initPromise;
}

self.onmessage = async (event) => {
  const { id, type, code, stdinLines, maxSteps } = event.data;
  try {
    const py = await ensurePyodide();
    if (type === "init") {
      self.postMessage({ id, type: "ready" });
      return;
    }
    if (type === "analyze") {
      py.globals.set("_src_code", code || "");
      const resJson = await py.runPythonAsync("analyze_static(_src_code)");
      self.postMessage({ id, type: "analyze_result", data: JSON.parse(resJson) });
      return;
    }
    if (type === "run") {
      py.globals.set("_src_code", code || "");
      py.globals.set("_stdin_lines", py.toPy(stdinLines || []));
      py.globals.set("_max_steps", maxSteps || 600);
      const resJson = await py.runPythonAsync(
        "run_with_trace(_src_code, _stdin_lines, _max_steps)"
      );
      self.postMessage({ id, type: "run_result", data: JSON.parse(resJson) });
    }
  } catch (err) {
    self.postMessage({
      id,
      type: "worker_error",
      error: err && err.message ? err.message : String(err),
    });
  }
};
