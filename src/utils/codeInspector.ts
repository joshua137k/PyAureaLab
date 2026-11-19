import type { DraftVariable, Lang, TraceStep } from '../types';

export interface HoverInspection {
  token: string;
  category: 'variable' | 'range' | 'function' | 'keyword' | 'operator';
  badge: string;
  title: string;
  liveValue?: string;
  historyChain?: string[];
  explanation: string;
  extraTip?: string;
}

// Resolve a numeric token or variable name from current scope
function resolveInt(raw: string, currentStep: TraceStep | null): number | null {
  const trimmed = raw.trim();
  const parsed = Number(trimmed);
  if (Number.isInteger(parsed)) return parsed;

  if (currentStep && currentStep.scopes.length > 0) {
    const scope = currentStep.scopes[currentStep.scopes.length - 1];
    const found = scope.variables.find((v) => v.name === trimmed);
    if (found && found.value.type === 'int') {
      const val = parseInt(found.value.repr, 10);
      if (!Number.isNaN(val)) return val;
    }
  }
  return null;
}

// Inspect range(...) calls on the hovered line and expand the actual sequence!
function inspectRangeCall(
  fullLine: string,
  lang: Lang,
  currentStep: TraceStep | null
): HoverInspection | null {
  const m = fullLine.match(/range\s*\(([^)]+)\)/);
  if (!m) return null;
  const rawArgs = m[1].split(',').map((s) => s.trim());
  const resolved = rawArgs.map((a) => resolveInt(a, currentStep));

  let start = 0;
  let stop: number | null = null;
  let step = 1;

  if (resolved.length === 1 && resolved[0] !== null) {
    stop = resolved[0];
  } else if (resolved.length === 2 && resolved[0] !== null && resolved[1] !== null) {
    start = resolved[0];
    stop = resolved[1];
  } else if (
    resolved.length >= 3 &&
    resolved[0] !== null &&
    resolved[1] !== null &&
    resolved[2] !== null &&
    resolved[2] !== 0
  ) {
    start = resolved[0];
    stop = resolved[1];
    step = resolved[2];
  }

  if (stop !== null) {
    const seq: number[] = [];
    if (step > 0) {
      for (let v = start; v < stop && seq.length < 15; v += step) seq.push(v);
    } else {
      for (let v = start; v > stop && seq.length < 15; v += step) seq.push(v);
    }
    const seqStr = `[${seq.join(', ')}${Math.abs((stop - start) / step) > 15 ? ', ...' : ''}]`;

    return {
      token: `range(${m[1]})`,
      category: 'range',
      badge: lang === 'pt' ? 'SEQUÊNCIA RANGE' : 'RANGE SEQUENCE',
      title: `range(${start}, ${stop}${resolved.length >= 3 ? `, ${step}` : ''})`,
      liveValue: seqStr,
      explanation:
        lang === 'pt'
          ? `Gera a sequência ${seqStr}. Começa em ${start} (incluído) e pára ANTES de ${stop} (o limite final ${stop} nunca entra!).`
          : `Generates sequence ${seqStr}. Starts at ${start} (inclusive) and stops BEFORE ${stop} (the stop value ${stop} is exclusive!).`,
      extraTip:
        step !== 1
          ? lang === 'pt'
            ? `Passo (step) = ${step}: salta de ${step} em ${step}.`
            : `Step = ${step}: jumps by ${step} each time.`
          : undefined,
    };
  }

  return {
    token: `range(${m[1]})`,
    category: 'range',
    badge: lang === 'pt' ? 'FUNÇÃO RANGE' : 'RANGE FUNCTION',
    title: `range(${m[1]})`,
    explanation:
      lang === 'pt'
        ? 'Gera uma sequência de números inteiros para o ciclo for. Lembre-se: o último número (limite de paragem) nunca é incluído!'
        : 'Generates a sequence of integers for a loop. Remember: the stop value is always exclusive!',
  };
}

const KEYWORD_DOCS: Record<
  string,
  { badge: { pt: string; en: string }; pt: string; en: string; tip?: { pt: string; en: string } }
> = {
  for: {
    badge: { pt: 'CICLO DE REPETIÇÃO', en: 'LOOP KEYWORD' },
    pt: 'Percorre automaticamente cada elemento de uma lista, texto ou range(), executando o bloco indentado uma vez para cada item.',
    en: 'Automatically iterates over each item of a list, string, or range(), running the indented block once per item.',
  },
  while: {
    badge: { pt: 'CICLO CONDICIONAL', en: 'CONDITIONAL LOOP' },
    pt: 'Repete o bloco indentado enquanto a condição for Verdadeira (True). A condição é reavaliada antes de cada nova volta.',
    en: 'Repeats the indented block as long as the condition remains True. Re-evaluates the condition before each iteration.',
    tip: {
      pt: 'Certifique-se de alterar a variável da condição dentro do while para não criar um ciclo infinito!',
      en: 'Make sure to update the condition variable inside the while loop to avoid an infinite loop!',
    },
  },
  if: {
    badge: { pt: 'DECISÃO LÓGICA', en: 'CONDITIONAL' },
    pt: 'Testa uma condição lógica: se resultar em True (Verdadeiro), entra no bloco indentado; se for False, salta para o elif ou else.',
    en: 'Tests a logical condition: if True, enters the indented block; if False, skips to elif or else.',
  },
  elif: {
    badge: { pt: 'SENÃO SE', en: 'ELSE IF' },
    pt: 'Testa uma nova condição apenas quando os blocos if/elif anteriores deram False.',
    en: 'Tests a new condition only when all preceding if/elif blocks evaluated to False.',
  },
  else: {
    badge: { pt: 'CASO CONTRÁRIO', en: 'FALLBACK BRANCH' },
    pt: 'Bloco executado automaticamente quando todas as condições if e elif anteriores foram Falsas.',
    en: 'Executed automatically when all preceding if and elif conditions were False.',
  },
  in: {
    badge: { pt: 'OPERADOR DE PERTENÇA / ITERAÇÃO', en: 'MEMBERSHIP / ITERATION' },
    pt: 'Num ciclo "for x in seq:", retira um item de cada vez. Num "if x in col:", verifica se o valor existe dentro da lista, texto ou dicionário (True/False).',
    en: 'In "for x in seq:", pulls one item at a time. In "if x in col:", checks if the value exists inside the collection (True/False).',
  },
  break: {
    badge: { pt: 'CONTROLO DE CICLO', en: 'LOOP CONTROL' },
    pt: 'Interrompe o ciclo for ou while imediatamente e salta para a primeira linha após o ciclo.',
    en: 'Exits the current for or while loop immediately and jumps to the first line after the loop.',
  },
  continue: {
    badge: { pt: 'CONTROLO DE CICLO', en: 'LOOP CONTROL' },
    pt: 'Ignora as linhas seguintes desta volta e salta diretamente para a próxima repetição do ciclo.',
    en: 'Skips the remaining lines of the current iteration and jumps straight to the next loop cycle.',
  },
  def: {
    badge: { pt: 'DEFINIÇÃO DE FUNÇÃO', en: 'FUNCTION DEF' },
    pt: 'Cria uma nova função reutilizável com o seu próprio escopo de variáveis (Frame na Call Stack).',
    en: 'Defines a reusable function with its own local variable scope (Frame on the Call Stack).',
  },
  return: {
    badge: { pt: 'RETORNO DE FUNÇÃO', en: 'RETURN STATEMENT' },
    pt: 'Encerra a execução da função atual e devolve o valor calculado para quem chamou a função.',
    en: 'Finishes the current function execution and sends the computed value back to the caller.',
  },
  and: {
    badge: { pt: 'PORTA LÓGICA E (AND)', en: 'LOGICAL AND' },
    pt: 'Só dá True se AMBAS as condições (da esquerda E da direita) forem Verdadeiras ao mesmo tempo.',
    en: 'Returns True only if BOTH conditions (left AND right) are True at the same time.',
  },
  or: {
    badge: { pt: 'PORTA LÓGICA OU (OR)', en: 'LOGICAL OR' },
    pt: 'Dá True basta que PELO MENOS UMA das condições (esquerda OU direita) seja Verdadeira.',
    en: 'Returns True as long as AT LEAST ONE condition (left OR right) is True.',
  },
  not: {
    badge: { pt: 'INVERSOR LÓGICO (NOT)', en: 'LOGICAL NOT' },
    pt: 'Inverte o valor booleano: transforma True em False, e False em True (ou verifica se uma lista/pilha está vazia: "if not pilha:").',
    en: 'Inverts a boolean value: turns True into False, and False into True (or checks if a list/stack is empty: "if not stack:").',
  },
  True: {
    badge: { pt: 'BOOLEANO VERDADEIRO', en: 'BOOLEAN TRUE' },
    pt: 'Valor lógico Verdadeiro em Python (escreve-se sempre com T maiúsculo).',
    en: 'Logical True value in Python (always capitalized).',
  },
  False: {
    badge: { pt: 'BOOLEANO FALSO', en: 'BOOLEAN FALSE' },
    pt: 'Valor lógico Falso em Python (escreve-se sempre com F maiúsculo).',
    en: 'Logical False value in Python (always capitalized).',
  },
  print: {
    badge: { pt: 'SAÍDA NO TERMINAL', en: 'TERMINAL OUTPUT' },
    pt: 'Mostra valores ou textos no terminal. Se passar vários argumentos separados por vírgula, imprime-os separados por um espaço.',
    en: 'Displays values or text in the terminal. Multiple comma-separated arguments are printed with a space between them.',
    tip: {
      pt: 'Usando end=" ", o print não muda de linha no final e continua a escrever na mesma linha!',
      en: 'Using end=" " prevents print from adding a newline at the end, keeping output on the same line!',
    },
  },
  end: {
    badge: { pt: 'PARÂMETRO DO PRINT', en: 'PRINT PARAMETER' },
    pt: 'Por padrão o print() termina com uma quebra de linha ("\\n"). Ao definir end=" ", ele termina com um espaço e mantém o próximo print na mesma linha!',
    en: 'By default print() ends with a newline ("\\n"). Setting end=" " ends with a space so the next print stays on the same line!',
  },
  input: {
    badge: { pt: 'ENTRADA DE DADOS', en: 'USER / TEST INPUT' },
    pt: 'Lê a próxima linha da Entrada de Teste. Devolve SEMPRE um texto (str) — use int(input()) para converter para número inteiro.',
    en: 'Reads the next line from Test Input. ALWAYS returns a string (str) — wrap with int(input()) to convert to an integer.',
  },
  int: {
    badge: { pt: 'CONVERSÃO INTEIRA', en: 'INTEGER CONVERSION' },
    pt: 'Converte um texto numérico (como "42") ou número decimal num número inteiro (int) para fazer cálculos.',
    en: 'Converts a numeric string (like "42") or float into an integer (int) for math operations.',
  },
  str: {
    badge: { pt: 'CONVERSÃO PARA TEXTO', en: 'STRING CONVERSION' },
    pt: 'Converte qualquer número ou valor para texto (string), permitindo juntá-lo com outras letras usando +.',
    en: 'Converts any number or value into a text string so it can be concatenated with other text using +.',
  },
  len: {
    badge: { pt: 'TAMANHO / COMPRIMENTO', en: 'LENGTH FUNCTION' },
    pt: 'Devolve a quantidade total de elementos numa lista, caracteres num texto ou chaves num dicionário.',
    en: 'Returns the total number of items in a list, characters in a string, or keys in a dictionary.',
  },
  sum: {
    badge: { pt: 'SOMA DE COLEÇÃO', en: 'SUM FUNCTION' },
    pt: 'Soma automaticamente todos os números dentro de uma lista ou coleção.',
    en: 'Automatically adds up all numbers inside a list or collection.',
  },
  enumerate: {
    badge: { pt: 'ÍNDICE + VALOR', en: 'INDEX + VALUE' },
    pt: 'Em "for i, valor in enumerate(lista):", entrega ao mesmo tempo a posição (índice i) e o elemento (valor) a cada volta!',
    en: 'In "for i, val in enumerate(list):", yields both the index position (i) and the element (val) on each iteration!',
  },
  append: {
    badge: { pt: 'MÉTODO DE LISTA', en: 'LIST METHOD' },
    pt: 'Adiciona um novo elemento no final da lista (ou no topo de uma pilha/stack).',
    en: 'Adds a new item to the end of the list (or pushes onto the top of a stack).',
  },
  pop: {
    badge: { pt: 'REMOVER DA LISTA / PILHA', en: 'LIST / STACK POP' },
    pt: 'Remove e devolve o último elemento da lista (comportamento LIFO de uma Pilha/Stack).',
    en: 'Removes and returns the last item of the list (LIFO Stack behavior).',
  },
  insert: {
    badge: { pt: 'INSERIR NA POSIÇÃO', en: 'LIST INSERT' },
    pt: 'lista.insert(pos, item) insere o elemento exatamente no índice indicado, empurrando os restantes para a direita.',
    en: 'list.insert(pos, item) inserts the element at the given index, shifting subsequent items to the right.',
  },
  split: {
    badge: { pt: 'DIVIDIR TEXTO', en: 'STRING SPLIT' },
    pt: 'Corta uma frase pelos espaços em branco e devolve uma lista contendo cada palavra separada.',
    en: 'Splits a sentence by whitespace and returns a list of individual words.',
  },
  get: {
    badge: { pt: 'BUSCA SEGURA EM DICIONÁRIO', en: 'SAFE DICT LOOKUP' },
    pt: 'dict.get(chave, padrao) devolve o valor da chave se ela existir, ou devolve o valor padrão (ex.: 0) sem dar KeyError!',
    en: 'dict.get(key, default) returns the value for key if present, or the default value (e.g., 0) without raising KeyError!',
  },
  items: {
    badge: { pt: 'PARES DO DICIONÁRIO', en: 'DICT KEY-VALUE PAIRS' },
    pt: 'Devolve todos os pares (chave, valor) do dicionário para percorrer num ciclo for.',
    en: 'Returns all (key, value) pairs of the dictionary to iterate over in a for loop.',
  },
  values: {
    badge: { pt: 'VALORES DO DICIONÁRIO', en: 'DICT VALUES' },
    pt: 'Devolve apenas os valores guardados no dicionário (ignorando as chaves).',
    en: 'Returns only the values stored in the dictionary (ignoring keys).',
  },
  ord: {
    badge: { pt: 'CÓDIGO ASCII / UNICODE', en: 'ASCII / UNICODE CODE' },
    pt: 'Devolve o número inteiro correspondente ao caractere na tabela ASCII/Unicode (ex.: ord("a") = 97).',
    en: 'Returns the integer ASCII/Unicode code point of a character (e.g., ord("a") = 97).',
  },
  chr: {
    badge: { pt: 'CARACTERE DO CÓDIGO', en: 'CHAR FROM CODE' },
    pt: 'Converte um código numérico ASCII de volta na letra correspondente (ex.: chr(98) = "b").',
    en: 'Converts an integer ASCII code back into its character (e.g., chr(98) = "b").',
  },
};

const OPERATOR_DOCS: Record<string, { title: { pt: string; en: string }; pt: string; en: string }> = {
  '//': {
    title: { pt: 'Divisão Inteira (//)', en: 'Floor Division (//)' },
    pt: 'Divide dois números e descarta a parte decimal, ficando apenas com o quociente inteiro (ex.: 135 // 60 = 2). Tem a mesma prioridade que * e /.',
    en: 'Divides two numbers and drops the decimal remainder, keeping only the integer quotient (e.g., 135 // 60 = 2). Same precedence as * and /.',
  },
  '%': {
    title: { pt: 'Resto da Divisão / Módulo (%)', en: 'Modulo / Remainder (%)' },
    pt: 'Devolve o RESTO que sobra de uma divisão inteira (ex.: 8 % 2 = 0; 47 % 10 = 7). Essencial para testar divisibilidade e extrair dígitos!',
    en: 'Returns the REMAINDER left over after integer division (e.g., 8 % 2 = 0; 47 % 10 = 7). Essential for divisibility checks and extracting digits!',
  },
  '**': {
    title: { pt: 'Exponenciação / Potência (**)', en: 'Exponentiation (**)' },
    pt: 'Eleva a base (esquerda) ao expoente (direita). É o operador matemático com maior prioridade depois dos parênteses!',
    en: 'Raises the base (left) to the power of the exponent (right). Highest math precedence after parentheses!',
  },
  '==': {
    title: { pt: 'Comparação de Igualdade (==)', en: 'Equality Comparison (==)' },
    pt: 'Compara se o valor da esquerda é igual ao da direita, resultando em True ou False. (Não confundir com "=" que serve para guardar valor!).',
    en: 'Checks if the left value equals the right value, evaluating to True or False. (Do not confuse with single "=" used for assignment!).',
  },
  '!=': {
    title: { pt: 'Diferente de (!=)', en: 'Not Equal (!=)' },
    pt: 'Resulta em True se os dois valores comparados forem diferentes.',
    en: 'Evaluates to True if the two compared values are different.',
  },
  '+=': {
    title: { pt: 'Acumulador de Soma (+=)', en: 'Add & Assign (+=)' },
    pt: 'Soma o valor da direita ao valor atual da variável e guarda o novo resultado nela mesma (x += v equivale a x = x + v).',
    en: 'Adds the right value to the variable current value and stores the result back (x += v is short for x = x + v).',
  },
  '-=': {
    title: { pt: 'Acumulador de Subtração (-=)', en: 'Subtract & Assign (-=)' },
    pt: 'Subtrai o valor da direita do valor atual da variável (x -= v equivale a x = x - v).',
    en: 'Subtracts the right value from the variable current value (x -= v is short for x = x - v).',
  },
  '*=': {
    title: { pt: 'Acumulador de Multiplicação (*=)', en: 'Multiply & Assign (*=)' },
    pt: 'Multiplica o valor atual da variável pelo valor da direita (x *= v equivale a x = x * v).',
    en: 'Multiplies the variable current value by the right value (x *= v is short for x = x * v).',
  },
  '//=': {
    title: { pt: 'Divisão Inteira Atualizada (//=)', en: 'Floor Divide & Assign (//=)' },
    pt: 'Divide a variável por um número inteiro descartando a parte decimal (muito usado em n //= 10 para remover o último dígito!).',
    en: 'Floor-divides the variable in-place (often used as n //= 10 to strip the last digit!).',
  },
};

export function inspectHoveredToken(
  token: string,
  fullLine: string,
  lang: Lang,
  currentStep: TraceStep | null,
  allSteps: TraceStep[],
  draftVars: DraftVariable[]
): HoverInspection | null {
  const clean = token.trim();
  if (!clean) return null;

  // 1. If hovering `range`, expand the exact sequence!
  if (clean === 'range') {
    return inspectRangeCall(fullLine, lang, currentStep);
  }

  // 2. Check if token is a LIVE VARIABLE in currentStep (or latest finished step)
  if (currentStep && currentStep.scopes.length > 0) {
    for (let s = currentStep.scopes.length - 1; s >= 0; s--) {
      const scope = currentStep.scopes[s];
      const found = scope.variables.find((v) => v.name === clean);
      if (found) {
        // Build history of this variable up to currentStep
        const history: string[] = [];
        for (const st of allSteps) {
          if (st.stepIndex > currentStep.stepIndex) break;
          const sc = st.scopes.find((f) => f.name === scope.name);
          const fv = sc?.variables.find((v) => v.name === clean);
          if (fv && (history.length === 0 || history[history.length - 1] !== fv.value.repr)) {
            history.push(fv.value.repr);
          }
        }

        let extra = '';
        if (found.value.type === 'list' || found.value.type === 'tuple') {
          const count = found.value.items?.length ?? 0;
          extra =
            lang === 'pt'
              ? `Lista com ${count} elementos (índices de 0 até ${Math.max(0, count - 1)}).`
              : `List with ${count} items (indices from 0 to ${Math.max(0, count - 1)}).`;
        } else if (found.value.type === 'dict') {
          const count = found.value.entries?.length ?? 0;
          extra =
            lang === 'pt'
              ? `Dicionário contendo ${count} par(es) chave ➔ valor.`
              : `Dictionary holding ${count} key ➔ value pair(s).`;
        } else if (found.changed && found.prevRepr) {
          extra =
            lang === 'pt'
              ? `Alterada neste passo: era ${found.prevRepr} e passou a ${found.value.repr}.`
              : `Changed in this step: was ${found.prevRepr} and became ${found.value.repr}.`;
        }

        return {
          token: clean,
          category: 'variable',
          badge:
            lang === 'pt'
              ? `VARIÁVEL (${found.value.type.toUpperCase()}) • ${scope.name}`
              : `VARIABLE (${found.value.type.toUpperCase()}) • ${scope.name}`,
          title: `${clean} = ${found.value.repr}`,
          liveValue: found.value.repr,
          historyChain: history.length > 1 ? history : undefined,
          explanation:
            lang === 'pt'
              ? `A variável '${clean}' guarda atualmente o valor ${found.value.repr} (tipo ${found.value.type}) na memória.`
              : `Variable '${clean}' currently holds the value ${found.value.repr} (type ${found.value.type}) in memory.`,
          extraTip: extra || undefined,
        };
      }
    }
  }

  // 3. Check if token is an operator (`//`, `%`, `**`, `==`, `!=`, `+=`, `-=`, `*=`, `//=`)
  if (OPERATOR_DOCS[clean]) {
    const op = OPERATOR_DOCS[clean];
    return {
      token: clean,
      category: 'operator',
      badge: lang === 'pt' ? 'OPERADOR PYTHON' : 'PYTHON OPERATOR',
      title: op.title[lang],
      explanation: op[lang],
    };
  }

  // 4. Check if token is a Python keyword or built-in function
  if (KEYWORD_DOCS[clean]) {
    const kw = KEYWORD_DOCS[clean];
    return {
      token: clean,
      category: 'keyword',
      badge: kw.badge[lang],
      title: clean,
      explanation: kw[lang],
      extraTip: kw.tip ? kw.tip[lang] : undefined,
    };
  }

  // 5. Check if token is a static draft variable (before running the program)
  const draft = draftVars.find((d) => d.name === clean);
  if (draft) {
    return {
      token: clean,
      category: 'variable',
      badge: lang === 'pt' ? `VARIÁVEL (${draft.inferredType})` : `VARIABLE (${draft.inferredType})`,
      title: `${clean} (valor inicial: ${draft.previewValue})`,
      liveValue: draft.previewValue,
      explanation:
        lang === 'pt'
          ? `Variável detetada no código. Clique em Rodar (ou Passo a Passo) para acompanhar a evolução de '${clean}' na memória!`
          : `Variable detected in code. Press Run (or Step) to watch '${clean}' evolve in memory!`,
    };
  }

  return null;
}
