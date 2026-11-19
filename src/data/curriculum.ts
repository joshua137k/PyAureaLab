import type { FreeProgram, LearningModule } from '../types';

export const LEARNING_MODULES: LearningModule[] = [
  // ============================================================================
  // MODULE 1: FIRST STEPS (5 challenges)
  // ============================================================================
  {
    id: 'first-steps',
    title: { pt: 'Primeiros passos', en: 'First steps' },
    difficulty: 'beginner',
    icon: 'Rocket',
    challenges: [
      {
        id: 'hello-python',
        moduleId: 'first-steps',
        number: '1.1',
        difficulty: 'beginner',
        title: { pt: 'Olá, Python!', en: 'Hello, Python!' },
        description: {
          pt: 'Use a função print() para mostrar exatamente: Olá, PyAureaLab!',
          en: 'Use the print() function to display exactly: Olá, PyAureaLab!',
        },
        theory: {
          pt: 'Em Python, `print("texto")` escreve uma mensagem no terminal. Textos ficam sempre entre aspas simples ou duplas.',
          en: 'In Python, `print("text")` writes a message to the terminal. Text strings are always wrapped in single or double quotes.',
        },
        hint: {
          pt: 'print("Olá, PyAureaLab!")',
          en: 'print("Olá, PyAureaLab!")',
        },
        starterCode: '# Escreva seu código aqui / Write your code here\n',
        solutionCode: 'print("Olá, PyAureaLab!")\n',
        testInput: [],
        expectedOutput: 'Olá, PyAureaLab!',
      },
      {
        id: 'sum-two',
        moduleId: 'first-steps',
        number: '1.2',
        difficulty: 'beginner',
        title: { pt: 'Soma simples', en: 'Simple sum' },
        description: {
          pt: 'Crie duas variáveis `a = 7` e `b = 5`, calcule `soma = a + b` e mostre o resultado.',
          en: 'Create two variables `a = 7` and `b = 5`, compute `soma = a + b` and print the result.',
        },
        theory: {
          pt: 'Variáveis guardam valores na memória. Ao escrever `a = 7`, o Python cria um bloco chamado `a` com o valor `7`.',
          en: 'Variables store values in memory. Writing `a = 7` creates a block named `a` holding `7`.',
        },
        hint: {
          pt: 'a = 7\nb = 5\nsoma = a + b\nprint(soma)',
          en: 'a = 7\nb = 5\nsoma = a + b\nprint(soma)',
        },
        starterCode: 'a = 7\nb = 5\n# calcule soma e imprima\n',
        solutionCode: 'a = 7\nb = 5\nsoma = a + b\nprint(soma)\n',
        testInput: [],
        expectedOutput: '12',
      },
      {
        id: 'input-greeting',
        moduleId: 'first-steps',
        number: '1.3',
        difficulty: 'beginner',
        title: { pt: 'Saudação com Input', en: 'Input Greeting' },
        description: {
          pt: 'Leia um nome com `nome = input()` e imprima `Bem-vindo, Ana!` usando f-string.',
          en: 'Read a name with `nome = input()` and print `Bem-vindo, Ana!` using an f-string.',
        },
        theory: {
          pt: '`input()` lê uma linha da entrada. Com `f"Bem-vindo, {nome}!"`, o Python substitui `{nome}` pelo valor da variável.',
          en: '`input()` reads a line from input. With `f"Bem-vindo, {nome}!"`, Python replaces `{nome}` with the variable value.',
        },
        hint: {
          pt: 'nome = input()\nprint(f"Bem-vindo, {nome}!")',
          en: 'nome = input()\nprint(f"Bem-vindo, {nome}!")',
        },
        starterCode: 'nome = input()\n# mostre a saudação\n',
        solutionCode: 'nome = input()\nprint(f"Bem-vindo, {nome}!")\n',
        testInput: ['Ana'],
        expectedOutput: 'Bem-vindo, Ana!',
      },
      {
        id: 'swap-vars',
        moduleId: 'first-steps',
        number: '1.4',
        difficulty: 'beginner',
        title: { pt: 'Troca de variáveis', en: 'Swap variables' },
        description: {
          pt: 'Dados `x = 10` e `y = 99`, troque os valores entre eles e imprima `x` e `y` na mesma linha (`99 10`).',
          en: 'Given `x = 10` and `y = 99`, swap their values and print `x` and `y` on the same line (`99 10`).',
        },
        theory: {
          pt: 'Em Python podemos trocar duas variáveis numa só linha com desempacotamento: `x, y = y, x` (ou usando uma variável auxiliar `temp`).',
          en: 'In Python you can swap two variables in one line using tuple unpacking: `x, y = y, x` (or via a `temp` variable).',
        },
        hint: {
          pt: 'x, y = y, x\nprint(x, y)',
          en: 'x, y = y, x\nprint(x, y)',
        },
        starterCode: 'x = 10\ny = 99\n# troque os valores de x e y\n',
        solutionCode: 'x = 10\ny = 99\nx, y = y, x\nprint(x, y)\n',
        testInput: [],
        expectedOutput: '99 10',
      },
      {
        id: 'double-triple',
        moduleId: 'first-steps',
        number: '1.5',
        difficulty: 'beginner',
        title: { pt: 'Dobro e Triplo', en: 'Double and Triple' },
        description: {
          pt: 'Leia um número inteiro `n` (`6`), calcule `dobro = n * 2` e `triplo = n * 3` e imprima `12 18`.',
          en: 'Read an integer `n` (`6`), compute `dobro = n * 2` and `triplo = n * 3`, and print `12 18`.',
        },
        theory: {
          pt: 'Como `input()` devolve texto (`str`), usamos `int(input())` para converter para número inteiro (`int`).',
          en: 'Since `input()` returns a string (`str`), wrap it in `int(input())` to convert it to an integer (`int`).',
        },
        hint: {
          pt: 'dobro = n * 2\ntriplo = n * 3\nprint(dobro, triplo)',
          en: 'dobro = n * 2\ntriplo = n * 3\nprint(dobro, triplo)',
        },
        starterCode: 'n = int(input())\n# calcule dobro e triplo\n',
        solutionCode: 'n = int(input())\ndobro = n * 2\ntriplo = n * 3\nprint(dobro, triplo)\n',
        testInput: ['6'],
        expectedOutput: '12 18',
      },
    ],
  },

  // ============================================================================
  // MODULE 2: OPERATORS & MATH (5 challenges)
  // ============================================================================
  {
    id: 'operators-math',
    title: { pt: 'Operadores & Matemática', en: 'Operators & Math' },
    difficulty: 'beginner',
    icon: 'Calculator',
    challenges: [
      {
        id: 'rect-area',
        moduleId: 'operators-math',
        number: '2.1',
        difficulty: 'beginner',
        title: { pt: 'Área e Perímetro', en: 'Area and Perimeter' },
        description: {
          pt: 'Com `largura = 8` e `altura = 5`, calcule `area = largura * altura` e `perimetro = 2 * (largura + altura)` e imprima `40 26`.',
          en: 'Given `largura = 8` and `altura = 5`, compute `area = largura * altura` and `perimetro = 2 * (largura + altura)` and print `40 26`.',
        },
        theory: {
          pt: 'Parênteses `()` definem a prioridade matemática, exatamente como na álgebra.',
          en: 'Parentheses `()` control operator precedence, just like in standard algebra.',
        },
        hint: {
          pt: 'area = largura * altura\nperimetro = 2 * (largura + altura)\nprint(area, perimetro)',
          en: 'area = largura * altura\nperimetro = 2 * (largura + altura)\nprint(area, perimetro)',
        },
        starterCode: 'largura = 8\naltura = 5\n# calcule area e perimetro\n',
        solutionCode: 'largura = 8\naltura = 5\narea = largura * altura\nperimetro = 2 * (largura + altura)\nprint(area, perimetro)\n',
        testInput: [],
        expectedOutput: '40 26',
      },
      {
        id: 'hours-minutes',
        moduleId: 'operators-math',
        number: '2.2',
        difficulty: 'beginner',
        title: { pt: 'Minutos em Horas', en: 'Minutes to Hours' },
        description: {
          pt: 'Converta `total_min = 135` em `horas` (`// 60`) e `minutos` (`% 60`) e imprima `2h 15m`.',
          en: 'Convert `total_min = 135` into `horas` (`// 60`) and `minutos` (`% 60`) and print `2h 15m`.',
        },
        theory: {
          pt: '`//` faz a divisão inteira (descarta as casas decimais) e `%` devolve o resto da divisão.',
          en: '`//` performs integer floor division and `%` returns the remainder.',
        },
        hint: {
          pt: 'horas = total_min // 60\nminutos = total_min % 60\nprint(f"{horas}h {minutos}m")',
          en: 'horas = total_min // 60\nminutos = total_min % 60\nprint(f"{horas}h {minutos}m")',
        },
        starterCode: 'total_min = 135\n# calcule horas e minutos\n',
        solutionCode: 'total_min = 135\nhoras = total_min // 60\nminutos = total_min % 60\nprint(f"{horas}h {minutos}m")\n',
        testInput: [],
        expectedOutput: '2h 15m',
      },
      {
        id: 'power-two',
        moduleId: 'operators-math',
        number: '2.3',
        difficulty: 'beginner',
        title: { pt: 'Potência de 2', en: 'Power of 2' },
        description: {
          pt: 'Calcule $2^{10}$ usando o operador de exponenciação `**` e imprima `1024`.',
          en: 'Compute $2^{10}$ using the exponentiation operator `**` and print `1024`.',
        },
        theory: {
          pt: 'Em Python, `base ** expoente` eleva a base à potência indicada (`2 ** 10 = 1024`).',
          en: 'In Python, `base ** exponent` raises the base to the given power (`2 ** 10 = 1024`).',
        },
        hint: {
          pt: 'res = 2 ** 10\nprint(res)',
          en: 'res = 2 ** 10\nprint(res)',
        },
        starterCode: 'expoente = 10\n# calcule 2 elevado a expoente\n',
        solutionCode: 'expoente = 10\nres = 2 ** expoente\nprint(res)\n',
        testInput: [],
        expectedOutput: '1024',
      },
      {
        id: 'celsius-fahrenheit',
        moduleId: 'operators-math',
        number: '2.4',
        difficulty: 'beginner',
        title: { pt: 'Celsius para Fahrenheit', en: 'Celsius to Fahrenheit' },
        description: {
          pt: 'Converta `celsius = 25` para Fahrenheit com `f = celsius * 9 // 5 + 32` e imprima `77`.',
          en: 'Convert `celsius = 25` to Fahrenheit with `f = celsius * 9 // 5 + 32` and print `77`.',
        },
        theory: {
          pt: 'A fórmula clássica multiplica os graus Celsius por 9/5 e soma 32.',
          en: 'The standard formula multiplies Celsius by 9/5 and adds 32.',
        },
        hint: {
          pt: 'f = celsius * 9 // 5 + 32\nprint(f)',
          en: 'f = celsius * 9 // 5 + 32\nprint(f)',
        },
        starterCode: 'celsius = 25\n# converta para Fahrenheit\n',
        solutionCode: 'celsius = 25\nf = celsius * 9 // 5 + 32\nprint(f)\n',
        testInput: [],
        expectedOutput: '77',
      },
      {
        id: 'last-digit',
        moduleId: 'operators-math',
        number: '2.5',
        difficulty: 'beginner',
        title: { pt: 'Dezena e Unidade', en: 'Tens and Ones' },
        description: {
          pt: 'Dado `num = 47`, extraia o dígito das dezenas (`4`) e das unidades (`7`) e imprima `4 7`.',
          en: 'Given `num = 47`, extract the tens digit (`4`) and ones digit (`7`) and print `4 7`.',
        },
        theory: {
          pt: 'Em base 10, `num // 10` remove o último dígito e `num % 10` isola o último dígito.',
          en: 'In base 10, `num // 10` strips the last digit and `num % 10` isolates the last digit.',
        },
        hint: {
          pt: 'dezena = num // 10\nunidade = num % 10\nprint(dezena, unidade)',
          en: 'dezena = num // 10\nunidade = num % 10\nprint(dezena, unidade)',
        },
        starterCode: 'num = 47\n# extraia dezena e unidade\n',
        solutionCode: 'num = 47\ndezena = num // 10\nunidade = num % 10\nprint(dezena, unidade)\n',
        testInput: [],
        expectedOutput: '4 7',
      },
    ],
  },

  // ============================================================================
  // MODULE 3: CONDITIONALS (5 challenges)
  // ============================================================================
  {
    id: 'conditionals',
    title: { pt: 'Condicionais', en: 'Conditionals' },
    difficulty: 'beginner',
    icon: 'GitBranch',
    challenges: [
      {
        id: 'even-odd',
        moduleId: 'conditionals',
        number: '3.1',
        difficulty: 'beginner',
        title: { pt: 'Par ou Ímpar', en: 'Even or Odd' },
        description: {
          pt: 'Leia um número com `int(input())` e imprima `Par` se for divisível por 2, ou `Impar` caso contrário.',
          en: 'Read a number with `int(input())` and print `Par` if divisible by 2, or `Impar` otherwise.',
        },
        theory: {
          pt: 'O operador `%` calcula o resto da divisão. Se `n % 2 == 0`, o número é par!',
          en: 'The `%` operator returns the remainder of a division. If `n % 2 == 0`, the number is even!',
        },
        hint: {
          pt: 'if n % 2 == 0:\n    print("Par")\nelse:\n    print("Impar")',
          en: 'if n % 2 == 0:\n    print("Par")\nelse:\n    print("Impar")',
        },
        starterCode: 'n = int(input())\n# verifique se n é par ou ímpar\n',
        solutionCode: 'n = int(input())\nif n % 2 == 0:\n    print("Par")\nelse:\n    print("Impar")\n',
        testInput: ['8'],
        expectedOutput: 'Par',
      },
      {
        id: 'max-of-three',
        moduleId: 'conditionals',
        number: '3.2',
        difficulty: 'beginner',
        title: { pt: 'Maior de Três', en: 'Largest of Three' },
        description: {
          pt: 'Dados `a = 14`, `b = 29` e `c = 21`, encontre o maior usando `if / elif / else` e imprima `29`.',
          en: 'Given `a = 14`, `b = 29`, and `c = 21`, find the largest using `if / elif / else` and print `29`.',
        },
        theory: {
          pt: '`elif` (else if) testa uma nova condição quando o `if` anterior é falso. Podemos combinar condições com `and`.',
          en: '`elif` (else if) tests a new condition when the previous `if` is False. Combine conditions with `and`.',
        },
        hint: {
          pt: 'if a >= b and a >= c: maior = a\nelif b >= c: maior = b\nelse: maior = c',
          en: 'if a >= b and a >= c: maior = a\nelif b >= c: maior = b\nelse: maior = c',
        },
        starterCode: 'a = 14\nb = 29\nc = 21\n# descubra e imprima o maior\n',
        solutionCode: 'a = 14\nb = 29\nc = 21\nif a >= b and a >= c:\n    maior = a\nelif b >= c:\n    maior = b\nelse:\n    maior = c\nprint(maior)\n',
        testInput: [],
        expectedOutput: '29',
      },
      {
        id: 'grade-classifier',
        moduleId: 'conditionals',
        number: '3.3',
        difficulty: 'beginner',
        title: { pt: 'Classificação de Nota', en: 'Grade Classifier' },
        description: {
          pt: 'Para `nota = 85`, imprima `A` se `>= 90`, `B` se `>= 80`, `C` se `>= 70`, ou `D` caso contrário.',
          en: 'For `nota = 85`, print `A` if `>= 90`, `B` if `>= 80`, `C` if `>= 70`, or `D` otherwise.',
        },
        theory: {
          pt: 'Numa cadeia `if / elif / else`, apenas o primeiro bloco cuja condição seja verdadeira é executado.',
          en: 'In an `if / elif / else` chain, only the first block whose condition evaluates to True runs.',
        },
        hint: {
          pt: 'if nota >= 90: print("A")\nelif nota >= 80: print("B")...',
          en: 'if nota >= 90: print("A")\nelif nota >= 80: print("B")...',
        },
        starterCode: 'nota = 85\n# classifique a nota\n',
        solutionCode: 'nota = 85\nif nota >= 90:\n    print("A")\nelif nota >= 80:\n    print("B")\nelif nota >= 70:\n    print("C")\nelse:\n    print("D")\n',
        testInput: [],
        expectedOutput: 'B',
      },
      {
        id: 'leap-year',
        moduleId: 'conditionals',
        number: '3.4',
        difficulty: 'beginner',
        title: { pt: 'Ano Bissexto', en: 'Leap Year' },
        description: {
          pt: 'Verifique se `ano = 2024` é bissexto e imprima `Bissexto` ou `Normal`.',
          en: 'Check if `ano = 2024` is a leap year and print `Bissexto` or `Normal`.',
        },
        theory: {
          pt: 'Um ano é bissexto se for divisível por 4 e não por 100, exceto se também for divisível por 400.',
          en: 'A year is a leap year if divisible by 4 and not by 100, unless it is also divisible by 400.',
        },
        hint: {
          pt: 'if (ano % 4 == 0 and ano % 100 != 0) or (ano % 400 == 0):',
          en: 'if (ano % 4 == 0 and ano % 100 != 0) or (ano % 400 == 0):',
        },
        starterCode: 'ano = 2024\n# verifique se é bissexto\n',
        solutionCode: 'ano = 2024\nif (ano % 4 == 0 and ano % 100 != 0) or (ano % 400 == 0):\n    print("Bissexto")\nelse:\n    print("Normal")\n',
        testInput: [],
        expectedOutput: 'Bissexto',
      },
      {
        id: 'valid-triangle',
        moduleId: 'conditionals',
        number: '3.5',
        difficulty: 'beginner',
        title: { pt: 'Triângulo Válido', en: 'Valid Triangle' },
        description: {
          pt: 'Dados os lados `a = 3`, `b = 4`, `c = 5`, verifique a desigualdade triangular e imprima `Valido` ou `Invalido`.',
          en: 'Given sides `a = 3`, `b = 4`, `c = 5`, check the triangle inequality and print `Valido` or `Invalido`.',
        },
        theory: {
          pt: 'Três lados formam um triângulo se a soma de quaisquer dois lados for estritamente maior que o terceiro.',
          en: 'Three sides form a triangle if the sum of any two sides is strictly greater than the third.',
        },
        hint: {
          pt: 'if a + b > c and a + c > b and b + c > a:\n    print("Valido")',
          en: 'if a + b > c and a + c > b and b + c > a:\n    print("Valido")',
        },
        starterCode: 'a = 3\nb = 4\nc = 5\n# verifique se forma triângulo\n',
        solutionCode: 'a = 3\nb = 4\nc = 5\nif a + b > c and a + c > b and b + c > a:\n    print("Valido")\nelse:\n    print("Invalido")\n',
        testInput: [],
        expectedOutput: 'Valido',
      },
    ],
  },

  // ============================================================================
  // MODULE 4: LOOPS (5 challenges)
  // ============================================================================
  {
    id: 'loops',
    title: { pt: 'Laços de repetição', en: 'Loops' },
    difficulty: 'beginner',
    icon: 'Repeat',
    challenges: [
      {
        id: 'countdown',
        moduleId: 'loops',
        number: '4.1',
        difficulty: 'beginner',
        title: { pt: 'Contagem até 5', en: 'Count to 5' },
        description: {
          pt: 'Use um ciclo `for` com `range(1, 6)` para imprimir os números de 1 a 5 na mesma linha separados por espaço.',
          en: 'Use a `for` loop with `range(1, 6)` to print numbers 1 to 5 on the same line separated by spaces.',
        },
        theory: {
          pt: '`range(1, 6)` gera 1, 2, 3, 4, 5 (o último valor não é incluído). Use `print(i, end=" ")` para manter na mesma linha.',
          en: '`range(1, 6)` generates 1, 2, 3, 4, 5 (stop is exclusive). Use `print(i, end=" ")` to stay on the same line.',
        },
        hint: {
          pt: 'for i in range(1, 6):\n    print(i, end=" ")',
          en: 'for i in range(1, 6):\n    print(i, end=" ")',
        },
        starterCode: '# Imprima 1 2 3 4 5\n',
        solutionCode: 'for i in range(1, 6):\n    print(i, end=" ")\n',
        testInput: [],
        expectedOutput: '1 2 3 4 5',
      },
      {
        id: 'sum-1-to-n',
        moduleId: 'loops',
        number: '4.2',
        difficulty: 'beginner',
        title: { pt: 'Soma de 1 até 10', en: 'Sum 1 to 10' },
        description: {
          pt: 'Acumule a soma de todos os números de 1 a 10 numa variável `soma` e imprima `55`.',
          en: 'Accumulate the sum of all numbers from 1 to 10 in a variable `soma` and print `55`.',
        },
        theory: {
          pt: 'Uma variável acumuladora começa em `0` e, a cada volta do ciclo, recebe `soma += i`.',
          en: 'An accumulator variable starts at `0` and adds `soma += i` on every loop iteration.',
        },
        hint: {
          pt: 'soma = 0\nfor i in range(1, 11):\n    soma += i\nprint(soma)',
          en: 'soma = 0\nfor i in range(1, 11):\n    soma += i\nprint(soma)',
        },
        starterCode: 'soma = 0\n# some de 1 até 10\n',
        solutionCode: 'soma = 0\nfor i in range(1, 11):\n    soma += i\nprint(soma)\n',
        testInput: [],
        expectedOutput: '55',
      },
      {
        id: 'sum-evens',
        moduleId: 'loops',
        number: '4.3',
        difficulty: 'beginner',
        title: { pt: 'Soma dos Pares', en: 'Sum of Evens' },
        description: {
          pt: 'Some todos os números pares de 2 até 10 (`2 + 4 + 6 + 8 + 10`) e imprima `30`.',
          en: 'Sum all even numbers from 2 up to 10 (`2 + 4 + 6 + 8 + 10`) and print `30`.',
        },
        theory: {
          pt: '`range(inicio, fim, passo)` permite saltar de 2 em 2: `range(2, 11, 2)`.',
          en: '`range(start, stop, step)` lets you step by 2: `range(2, 11, 2)`.',
        },
        hint: {
          pt: 'for n in range(2, 11, 2):\n    soma += n',
          en: 'for n in range(2, 11, 2):\n    soma += n',
        },
        starterCode: 'soma = 0\n# some os pares de 2 a 10\n',
        solutionCode: 'soma = 0\nfor n in range(2, 11, 2):\n    soma += n\nprint(soma)\n',
        testInput: [],
        expectedOutput: '30',
      },
      {
        id: 'powers-loop',
        moduleId: 'loops',
        number: '4.4',
        difficulty: 'beginner',
        title: { pt: 'Sequência Dobrada', en: 'Doubling Sequence' },
        description: {
          pt: 'Começando com `val = 1`, dobre o valor 5 vezes num ciclo `while` (`while val <= 16:`) imprimindo `1 2 4 8 16`.',
          en: 'Starting with `val = 1`, double the value in a `while` loop (`while val <= 16:`) printing `1 2 4 8 16`.',
        },
        theory: {
          pt: 'O ciclo `while` repete enquanto a condição for verdadeira. Não se esqueça de atualizar `val *= 2` dentro do ciclo!',
          en: 'A `while` loop repeats while its condition is True. Always update `val *= 2` inside the loop!',
        },
        hint: {
          pt: 'while val <= 16:\n    print(val, end=" ")\n    val *= 2',
          en: 'while val <= 16:\n    print(val, end=" ")\n    val *= 2',
        },
        starterCode: 'val = 1\n# imprima 1 2 4 8 16\n',
        solutionCode: 'val = 1\nwhile val <= 16:\n    print(val, end=" ")\n    val *= 2\n',
        testInput: [],
        expectedOutput: '1 2 4 8 16',
      },
      {
        id: 'collatz-steps',
        moduleId: 'loops',
        number: '4.5',
        difficulty: 'intermediate',
        title: { pt: 'Conjectura de Collatz', en: 'Collatz Conjecture' },
        description: {
          pt: 'A partir de `n = 6`, enquanto `n != 1`, se for par faça `n = n // 2`, senão `n = 3 * n + 1`. Imprima a sequência `6 3 10 5 16 8 4 2 1`.',
          en: 'Starting at `n = 6`, while `n != 1`, if even do `n = n // 2`, else `n = 3 * n + 1`. Print `6 3 10 5 16 8 4 2 1`.',
        },
        theory: {
          pt: 'A conjectura de Collatz diz que qualquer inteiro positivo acaba por chegar a 1 seguindo estas duas regras.',
          en: 'The Collatz conjecture states that any positive integer eventually reaches 1 under these two rules.',
        },
        hint: {
          pt: 'while n != 1:\n    print(n, end=" ")\n    if n % 2 == 0: n = n // 2\n    else: n = 3 * n + 1\nprint(1)',
          en: 'while n != 1:\n    print(n, end=" ")\n    if n % 2 == 0: n = n // 2\n    else: n = 3 * n + 1\nprint(1)',
        },
        starterCode: 'n = 6\n# gere a sequência de Collatz\n',
        solutionCode: 'n = 6\nwhile n != 1:\n    print(n, end=" ")\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\nprint(1)\n',
        testInput: [],
        expectedOutput: '6 3 10 5 16 8 4 2 1',
      },
    ],
  },

  // ============================================================================
  // MODULE 5: LISTS & ARRAYS (5 challenges)
  // ============================================================================
  {
    id: 'lists',
    title: { pt: 'Listas (Vetores)', en: 'Lists (Arrays)' },
    difficulty: 'intermediate',
    icon: 'Layers',
    challenges: [
      {
        id: 'sum-vector',
        moduleId: 'lists',
        number: '5.1',
        difficulty: 'intermediate',
        title: { pt: 'Soma do vetor', en: 'Sum of array' },
        description: {
          pt: 'Dada a lista `numeros = [4, 7, 2, 9, 3]`, calcule a soma de todos os elementos passo a passo e imprima `25`.',
          en: 'Given `numeros = [4, 7, 2, 9, 3]`, compute the sum of all elements step by step and print `25`.',
        },
        theory: {
          pt: 'Listas guardam vários valores indexados a partir de `0`. Percorremos com `for num in numeros:` acumulando em `total += num`.',
          en: 'Lists store multiple values indexed from `0`. Iterate with `for num in numeros:` accumulating in `total += num`.',
        },
        hint: {
          pt: 'for num in numeros:\n    total += num\nprint(total)',
          en: 'for num in numeros:\n    total += num\nprint(total)',
        },
        starterCode: 'numeros = [4, 7, 2, 9, 3]\ntotal = 0\n# some os elementos\n',
        solutionCode: 'numeros = [4, 7, 2, 9, 3]\ntotal = 0\nfor num in numeros:\n    total += num\nprint(total)\n',
        testInput: [],
        expectedOutput: '25',
      },
      {
        id: 'max-in-list',
        moduleId: 'lists',
        number: '5.2',
        difficulty: 'intermediate',
        title: { pt: 'Maior Elemento', en: 'Largest Element' },
        description: {
          pt: 'Em `valores = [12, 45, 7, 89, 23]`, encontre o maior valor percorrendo a lista e imprima `89`.',
          en: 'In `valores = [12, 45, 7, 89, 23]`, find the maximum value by iterating through the list and print `89`.',
        },
        theory: {
          pt: 'Inicialize `maior = valores[0]` e compare cada elemento `v`: se `v > maior`, atualize `maior = v`.',
          en: 'Initialize `maior = valores[0]` and compare each element `v`: if `v > maior`, update `maior = v`.',
        },
        hint: {
          pt: 'for v in valores:\n    if v > maior:\n        maior = v',
          en: 'for v in valores:\n    if v > maior:\n        maior = v',
        },
        starterCode: 'valores = [12, 45, 7, 89, 23]\nmaior = valores[0]\n# encontre o maior\n',
        solutionCode: 'valores = [12, 45, 7, 89, 23]\nmaior = valores[0]\nfor v in valores:\n    if v > maior:\n        maior = v\nprint(maior)\n',
        testInput: [],
        expectedOutput: '89',
      },
      {
        id: 'reverse-list-inplace',
        moduleId: 'lists',
        number: '5.3',
        difficulty: 'intermediate',
        title: { pt: 'Inverter Lista In-Place', en: 'Reverse List In-Place' },
        description: {
          pt: 'Inverta `v = [10, 20, 30, 40, 50]` trocando as extremidades com dois ponteiros e imprima `[50, 40, 30, 20, 10]`.',
          en: 'Reverse `v = [10, 20, 30, 40, 50]` in-place by swapping ends with two pointers and print `[50, 40, 30, 20, 10]`.',
        },
        theory: {
          pt: 'Com `esq = 0` e `dir = len(v) - 1`, trocamos `v[esq], v[dir] = v[dir], v[esq]` enquanto `esq < dir`.',
          en: 'With `esq = 0` and `dir = len(v) - 1`, swap `v[esq], v[dir] = v[dir], v[esq]` while `esq < dir`.',
        },
        hint: {
          pt: 'while esq < dir:\n    v[esq], v[dir] = v[dir], v[esq]\n    esq += 1\n    dir -= 1',
          en: 'while esq < dir:\n    v[esq], v[dir] = v[dir], v[esq]\n    esq += 1\n    dir -= 1',
        },
        starterCode: 'v = [10, 20, 30, 40, 50]\nesq = 0\ndir = len(v) - 1\n# inverta a lista in-place\n',
        solutionCode: 'v = [10, 20, 30, 40, 50]\nesq = 0\ndir = len(v) - 1\nwhile esq < dir:\n    v[esq], v[dir] = v[dir], v[esq]\n    esq += 1\n    dir -= 1\nprint(v)\n',
        testInput: [],
        expectedOutput: '[50, 40, 30, 20, 10]',
      },
      {
        id: 'filter-positives',
        moduleId: 'lists',
        number: '5.4',
        difficulty: 'intermediate',
        title: { pt: 'Filtrar Positivos', en: 'Filter Positives' },
        description: {
          pt: 'Dada `dados = [-3, 5, -1, 8, 0, 4]`, adicione apenas os números `> 0` na lista `positivos` e imprima `[5, 8, 4]`.',
          en: 'Given `dados = [-3, 5, -1, 8, 0, 4]`, append only numbers `> 0` to `positivos` and print `[5, 8, 4]`.',
        },
        theory: {
          pt: 'O método `lista.append(x)` insere um novo elemento no final da lista. Veja a lista crescer no visualizador!',
          en: 'The `list.append(x)` method adds a new element to the end of the list. Watch it grow in the visualizer!',
        },
        hint: {
          pt: 'for x in dados:\n    if x > 0:\n        positivos.append(x)',
          en: 'for x in dados:\n    if x > 0:\n        positivos.append(x)',
        },
        starterCode: 'dados = [-3, 5, -1, 8, 0, 4]\npositivos = []\n# adicione apenas os maiores que zero\n',
        solutionCode: 'dados = [-3, 5, -1, 8, 0, 4]\npositivos = []\nfor x in dados:\n    if x > 0:\n        positivos.append(x)\nprint(positivos)\n',
        testInput: [],
        expectedOutput: '[5, 8, 4]',
      },
      {
        id: 'rotate-array',
        moduleId: 'lists',
        number: '5.5',
        difficulty: 'intermediate',
        title: { pt: 'Rotacionar à Direita', en: 'Rotate Right' },
        description: {
          pt: 'Mova o último elemento de `v = [1, 2, 3, 4, 5]` para o início usando `pop()` e `insert(0, ...)` e imprima `[5, 1, 2, 3, 4]`.',
          en: 'Move the last element of `v = [1, 2, 3, 4, 5]` to the front using `pop()` and `insert(0, ...)` and print `[5, 1, 2, 3, 4]`.',
        },
        theory: {
          pt: '`v.pop()` remove e devolve o último item; `v.insert(0, item)` coloca-o na posição `0`.',
          en: '`v.pop()` removes and returns the last item; `v.insert(0, item)` places it at index `0`.',
        },
        hint: {
          pt: 'ultimo = v.pop()\nv.insert(0, ultimo)\nprint(v)',
          en: 'ultimo = v.pop()\nv.insert(0, ultimo)\nprint(v)',
        },
        starterCode: 'v = [1, 2, 3, 4, 5]\n# rotacione 1 posição à direita\n',
        solutionCode: 'v = [1, 2, 3, 4, 5]\nultimo = v.pop()\nv.insert(0, ultimo)\nprint(v)\n',
        testInput: [],
        expectedOutput: '[5, 1, 2, 3, 4]',
      },
    ],
  },

  // ============================================================================
  // MODULE 6: STRINGS & TEXT (5 challenges)
  // ============================================================================
  {
    id: 'strings',
    title: { pt: 'Strings (Textos)', en: 'Strings (Text)' },
    difficulty: 'intermediate',
    icon: 'Type',
    challenges: [
      {
        id: 'count-vowels',
        moduleId: 'strings',
        number: '6.1',
        difficulty: 'beginner',
        title: { pt: 'Contar Vogais', en: 'Count Vowels' },
        description: {
          pt: 'Conte quantas vogais (`aeiou`) existem em `texto = "algoritmo"` e imprima `4`.',
          en: 'Count how many vowels (`aeiou`) exist in `texto = "algoritmo"` and print `4`.',
        },
        theory: {
          pt: 'Podemos percorrer cada letra `c` numa string com `for c in texto:` e testar `if c in "aeiou":`.',
          en: 'You can iterate over each character `c` in a string with `for c in texto:` and test `if c in "aeiou":`.',
        },
        hint: {
          pt: 'for c in texto:\n    if c in "aeiou":\n        cont += 1',
          en: 'for c in texto:\n    if c in "aeiou":\n        cont += 1',
        },
        starterCode: 'texto = "algoritmo"\ncont = 0\n# conte as vogais\n',
        solutionCode: 'texto = "algoritmo"\ncont = 0\nfor c in texto:\n    if c in "aeiou":\n        cont += 1\nprint(cont)\n',
        testInput: [],
        expectedOutput: '4',
      },
      {
        id: 'reverse-string',
        moduleId: 'strings',
        number: '6.2',
        difficulty: 'beginner',
        title: { pt: 'Inverter Palavra', en: 'Reverse Word' },
        description: {
          pt: 'Construa o inverso de `s = "python"` acumulando letra a letra em `inv` e imprima `nohtyp`.',
          en: 'Build the reverse of `s = "python"` character by character in `inv` and print `nohtyp`.',
        },
        theory: {
          pt: 'Se fizermos `inv = c + inv` a cada caractere `c`, cada nova letra entra à esquerda!',
          en: 'By doing `inv = c + inv` for each character `c`, every new letter is prepended to the left!',
        },
        hint: {
          pt: 'for c in s:\n    inv = c + inv\nprint(inv)',
          en: 'for c in s:\n    inv = c + inv\nprint(inv)',
        },
        starterCode: 's = "python"\ninv = ""\n# inverta a string\n',
        solutionCode: 's = "python"\ninv = ""\nfor c in s:\n    inv = c + inv\nprint(inv)\n',
        testInput: [],
        expectedOutput: 'nohtyp',
      },
      {
        id: 'word-count',
        moduleId: 'strings',
        number: '6.3',
        difficulty: 'intermediate',
        title: { pt: 'Contar Palavras', en: 'Word Count' },
        description: {
          pt: 'Divida `frase = "aprender python vendo a memoria"` com `.split()` e imprima a quantidade de palavras (`5`).',
          en: 'Split `frase = "aprender python vendo a memoria"` with `.split()` and print the word count (`5`).',
        },
        theory: {
          pt: '`frase.split()` separa o texto pelos espaços e devolve uma lista de palavras.',
          en: '`frase.split()` splits the text by whitespace and returns a list of words.',
        },
        hint: {
          pt: 'palavras = frase.split()\nprint(len(palavras))',
          en: 'palavras = frase.split()\nprint(len(palavras))',
        },
        starterCode: 'frase = "aprender python vendo a memoria"\n# separe as palavras e imprima o total\n',
        solutionCode: 'frase = "aprender python vendo a memoria"\npalavras = frase.split()\nprint(len(palavras))\n',
        testInput: [],
        expectedOutput: '5',
      },
      {
        id: 'caesar-cipher',
        moduleId: 'strings',
        number: '6.4',
        difficulty: 'intermediate',
        title: { pt: 'Cifra de César (+1)', en: 'Caesar Cipher (+1)' },
        description: {
          pt: 'Desloque cada letra de `msg = "abc"` uma posição à frente no alfabeto (`ord(c) + 1`) e imprima `bcd`.',
          en: 'Shift each letter in `msg = "abc"` one position forward in the alphabet (`ord(c) + 1`) and print `bcd`.',
        },
        theory: {
          pt: '`ord(c)` devolve o código numérico ASCII da letra e `chr(codigo)` reconverte o número em caractere.',
          en: '`ord(c)` returns the ASCII code of a character and `chr(code)` converts it back to a character.',
        },
        hint: {
          pt: 'for c in msg:\n    cifrada += chr(ord(c) + 1)',
          en: 'for c in msg:\n    cifrada += chr(ord(c) + 1)',
        },
        starterCode: 'msg = "abc"\ncifrada = ""\n# desloque cada letra em +1\n',
        solutionCode: 'msg = "abc"\ncifrada = ""\nfor c in msg:\n    cifrada += chr(ord(c) + 1)\nprint(cifrada)\n',
        testInput: [],
        expectedOutput: 'bcd',
      },
      {
        id: 'run-length-encoding',
        moduleId: 'strings',
        number: '6.5',
        difficulty: 'advanced',
        title: { pt: 'Compressão Run-Length', en: 'Run-Length Encoding' },
        description: {
          pt: 'Comprima `s = "aaabbc"` agrupando letras seguidas iguais no formato `"a3b2c1"`.',
          en: 'Compress `s = "aaabbc"` by grouping consecutive identical letters into `"a3b2c1"`.',
        },
        theory: {
          pt: 'Mantenha `cont = 1`. Enquanto a letra atual for igual à anterior, incremente `cont`; quando mudar, registe `letra + str(cont)`.',
          en: 'Track `cont = 1`. While the current character matches the previous one, increment `cont`; when it changes, append `char + str(cont)`.',
        },
        hint: {
          pt: 'Compare s[i] com s[i - 1] e no fim adicione o último grupo.',
          en: 'Compare s[i] with s[i - 1] and append the final group after the loop.',
        },
        starterCode: 's = "aaabbc"\nres = ""\ncont = 1\n# comprima em a3b2c1\n',
        solutionCode: 's = "aaabbc"\nres = ""\ncont = 1\nfor i in range(1, len(s)):\n    if s[i] == s[i - 1]:\n        cont += 1\n    else:\n        res += s[i - 1] + str(cont)\n        cont = 1\nres += s[-1] + str(cont)\nprint(res)\n',
        testInput: [],
        expectedOutput: 'a3b2c1',
      },
    ],
  },

  // ============================================================================
  // MODULE 7: DICTIONARIES & MAPS (5 challenges)
  // ============================================================================
  {
    id: 'dicts',
    title: { pt: 'Dicionários', en: 'Dictionaries' },
    difficulty: 'intermediate',
    icon: 'BookOpen',
    challenges: [
      {
        id: 'student-grades',
        moduleId: 'dicts',
        number: '7.1',
        difficulty: 'intermediate',
        title: { pt: 'Média do aluno', en: 'Student average' },
        description: {
          pt: 'No dicionário `notas = {"Ana": 16, "Bruno": 14, "Carla": 18}`, calcule a média inteira (`// 3`) e imprima `16`.',
          en: 'In `notas = {"Ana": 16, "Bruno": 14, "Carla": 18}`, compute the integer average (`// 3`) and print `16`.',
        },
        theory: {
          pt: 'Dicionários associam chaves a valores (`chave: valor`). `notas.values()` devolve todos os valores.',
          en: 'Dictionaries map keys to values (`key: value`). `notas.values()` returns all values.',
        },
        hint: {
          pt: 'for nota in notas.values():\n    soma += nota\nprint(soma // len(notas))',
          en: 'for nota in notas.values():\n    soma += nota\nprint(soma // len(notas))',
        },
        starterCode: 'notas = {"Ana": 16, "Bruno": 14, "Carla": 18}\nsoma = 0\n# calcule a média inteira\n',
        solutionCode: 'notas = {"Ana": 16, "Bruno": 14, "Carla": 18}\nsoma = 0\nfor nota in notas.values():\n    soma += nota\nmedia = soma // len(notas)\nprint(media)\n',
        testInput: [],
        expectedOutput: '16',
      },
      {
        id: 'char-frequency',
        moduleId: 'dicts',
        number: '7.2',
        difficulty: 'intermediate',
        title: { pt: 'Frequência de Letras', en: 'Character Frequency' },
        description: {
          pt: 'Conte a frequência de cada letra em `palavra = "banana"` num dicionário `freq` e imprima `freq["a"]` (`3`).',
          en: 'Count the frequency of each letter in `palavra = "banana"` in a dict `freq` and print `freq["a"]` (`3`).',
        },
        theory: {
          pt: '`freq[c] = freq.get(c, 0) + 1` soma 1 à contagem existente ou inicia em 1 se a chave ainda não existir!',
          en: '`freq[c] = freq.get(c, 0) + 1` adds 1 to the existing count or initializes it to 1 if missing!',
        },
        hint: {
          pt: 'for c in palavra:\n    freq[c] = freq.get(c, 0) + 1\nprint(freq["a"])',
          en: 'for c in palavra:\n    freq[c] = freq.get(c, 0) + 1\nprint(freq["a"])',
        },
        starterCode: 'palavra = "banana"\nfreq = {}\n# conte as letras e imprima freq["a"]\n',
        solutionCode: 'palavra = "banana"\nfreq = {}\nfor c in palavra:\n    freq[c] = freq.get(c, 0) + 1\nprint(freq["a"])\n',
        testInput: [],
        expectedOutput: '3',
      },
      {
        id: 'valid-anagram',
        moduleId: 'dicts',
        number: '7.3',
        difficulty: 'intermediate',
        title: { pt: 'Anagrama Válido', en: 'Valid Anagram' },
        description: {
          pt: 'Verifique se `s1 = "amor"` e `s2 = "roma"` têm exatamente as mesmas letras com a mesma frequência e imprima `True`.',
          en: 'Check if `s1 = "amor"` and `s2 = "roma"` have the exact same character frequencies and print `True`.',
        },
        theory: {
          pt: 'Duas palavras são anagramas se os seus dicionários de frequência de letras forem iguais (`c1 == c2`).',
          en: 'Two words are anagrams if their character frequency dictionaries are equal (`c1 == c2`).',
        },
        hint: {
          pt: 'Construa c1 e c2 com .get(c, 0) + 1 e faça print(c1 == c2).',
          en: 'Build c1 and c2 with .get(c, 0) + 1 and print(c1 == c2).',
        },
        starterCode: 's1 = "amor"\ns2 = "roma"\nc1 = {}\nc2 = {}\n# compare as frequências\n',
        solutionCode: 's1 = "amor"\ns2 = "roma"\nc1 = {}\nc2 = {}\nfor c in s1:\n    c1[c] = c1.get(c, 0) + 1\nfor c in s2:\n    c2[c] = c2.get(c, 0) + 1\nprint(c1 == c2)\n',
        testInput: [],
        expectedOutput: 'True',
      },
      {
        id: 'vote-winner',
        moduleId: 'dicts',
        number: '7.4',
        difficulty: 'intermediate',
        title: { pt: 'Vencedor da Votação', en: 'Election Winner' },
        description: {
          pt: 'Conte os votos em `votos = ["Py", "C", "Py", "JS", "Py", "C"]` e imprima o mais votado (`Py`).',
          en: 'Count the votes in `votos = ["Py", "C", "Py", "JS", "Py", "C"]` and print the winner (`Py`).',
        },
        theory: {
          pt: 'Primeiro acumulamos a contagem num dicionário `placar` e depois encontramos a chave com maior valor.',
          en: 'First accumulate counts in a `placar` dict, then find the key with the highest count.',
        },
        hint: {
          pt: 'Depois de preencher placar, percorra placar.items() guardando o vencedor.',
          en: 'After filling placar, iterate over placar.items() tracking the winner.',
        },
        starterCode: 'votos = ["Py", "C", "Py", "JS", "Py", "C"]\nplacar = {}\n# descubra o vencedor\n',
        solutionCode: 'votos = ["Py", "C", "Py", "JS", "Py", "C"]\nplacar = {}\nfor v in votos:\n    placar[v] = placar.get(v, 0) + 1\n\nvencedor = ""\nmax_v = 0\nfor nome, qtd in placar.items():\n    if qtd > max_v:\n        max_v = qtd\n        vencedor = nome\nprint(vencedor)\n',
        testInput: [],
        expectedOutput: 'Py',
      },
      {
        id: 'invert-dict',
        moduleId: 'dicts',
        number: '7.5',
        difficulty: 'intermediate',
        title: { pt: 'Inverter Dicionário', en: 'Invert Dictionary' },
        description: {
          pt: 'Inverta chaves e valores de `codigos = {"PT": 351, "BR": 55}` para `inv = {351: "PT", 55: "BR"}` e imprima `inv[351]`.',
          en: 'Invert keys and values of `codigos = {"PT": 351, "BR": 55}` into `inv = {351: "PT", 55: "BR"}` and print `inv[351]`.',
        },
        theory: {
          pt: 'Percorrendo `for chave, valor in codigos.items():`, basta atribuir `inv[valor] = chave`.',
          en: 'Iterating `for key, val in codigos.items():`, assign `inv[val] = key`.',
        },
        hint: {
          pt: 'for k, v in codigos.items():\n    inv[v] = k\nprint(inv[351])',
          en: 'for k, v in codigos.items():\n    inv[v] = k\nprint(inv[351])',
        },
        starterCode: 'codigos = {"PT": 351, "BR": 55}\ninv = {}\n# inverta e imprima inv[351]\n',
        solutionCode: 'codigos = {"PT": 351, "BR": 55}\ninv = {}\nfor k, v in codigos.items():\n    inv[v] = k\nprint(inv[351])\n',
        testInput: [],
        expectedOutput: 'PT',
      },
    ],
  },

  // ============================================================================
  // MODULE 8: FUNCTIONS & RECURSION (5 challenges)
  // ============================================================================
  {
    id: 'functions',
    title: { pt: 'Funções & Recursão', en: 'Functions & Recursion' },
    difficulty: 'intermediate',
    icon: 'Braces',
    challenges: [
      {
        id: 'factorial-fn',
        moduleId: 'functions',
        number: '8.1',
        difficulty: 'intermediate',
        title: { pt: 'Função Fatorial', en: 'Factorial Function' },
        description: {
          pt: 'Crie uma função `fatorial(n)` que retorna `n!` e imprima `fatorial(5)` (`120`).',
          en: 'Create a function `fatorial(n)` that returns `n!` and print `fatorial(5)` (`120`).',
        },
        theory: {
          pt: 'Funções criam um novo escopo na pilha de chamadas (Call Stack). No visualizador verá `fatorial()` abrir acima de `main()`.',
          en: 'Functions create a new frame on the Call Stack. In the visualizer you will see `fatorial()` open above `main()`.',
        },
        hint: {
          pt: 'for i in range(1, n + 1):\n    res *= i',
          en: 'for i in range(1, n + 1):\n    res *= i',
        },
        starterCode: 'def fatorial(n):\n    res = 1\n    # complete aqui\n    return res\n\nprint(fatorial(5))\n',
        solutionCode: 'def fatorial(n):\n    res = 1\n    for i in range(1, n + 1):\n        res *= i\n    return res\n\nprint(fatorial(5))\n',
        testInput: [],
        expectedOutput: '120',
      },
      {
        id: 'recursive-fib',
        moduleId: 'functions',
        number: '8.2',
        difficulty: 'intermediate',
        title: { pt: 'Fibonacci Recursivo', en: 'Recursive Fibonacci' },
        description: {
          pt: 'Implemente `fib(n)` recursivo (`fib(0)=0, fib(1)=1`) e imprima `fib(6)` (`8`). Veja a pilha de chamadas crescer!',
          en: 'Implement recursive `fib(n)` (`fib(0)=0, fib(1)=1`) and print `fib(6)` (`8`). Watch the Call Stack grow!',
        },
        theory: {
          pt: 'Na recursão, uma função chama-se a si mesma até atingir o caso base (`n <= 1`).',
          en: 'In recursion, a function calls itself until reaching the base case (`n <= 1`).',
        },
        hint: {
          pt: 'if n <= 1:\n    return n\nreturn fib(n - 1) + fib(n - 2)',
          en: 'if n <= 1:\n    return n\nreturn fib(n - 1) + fib(n - 2)',
        },
        starterCode: 'def fib(n):\n    if n <= 1:\n        return n\n    # chamada recursiva\n\nprint(fib(6))\n',
        solutionCode: 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(6))\n',
        testInput: [],
        expectedOutput: '8',
      },
      {
        id: 'gcd-euclid',
        moduleId: 'functions',
        number: '8.3',
        difficulty: 'intermediate',
        title: { pt: 'MDC de Euclides', en: 'Euclidean GCD' },
        description: {
          pt: 'Crie a função `mdc(a, b)` usando o algoritmo de Euclides e imprima `mdc(48, 18)` (`6`).',
          en: 'Create `mdc(a, b)` using the Euclidean algorithm and print `mdc(48, 18)` (`6`).',
        },
        theory: {
          pt: 'Enquanto `b != 0`, substituímos `a, b = b, a % b`. Quando `b` chega a `0`, `a` é o Máximo Divisor Comum!',
          en: 'While `b != 0`, update `a, b = b, a % b`. When `b` becomes `0`, `a` is the Greatest Common Divisor!',
        },
        hint: {
          pt: 'while b != 0:\n    a, b = b, a % b\nreturn a',
          en: 'while b != 0:\n    a, b = b, a % b\nreturn a',
        },
        starterCode: 'def mdc(a, b):\n    # aplique Euclides\n    return a\n\nprint(mdc(48, 18))\n',
        solutionCode: 'def mdc(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n\nprint(mdc(48, 18))\n',
        testInput: [],
        expectedOutput: '6',
      },
      {
        id: 'sum-of-digits-fn',
        moduleId: 'functions',
        number: '8.4',
        difficulty: 'intermediate',
        title: { pt: 'Soma dos Dígitos', en: 'Sum of Digits' },
        description: {
          pt: 'Escreva `soma_digitos(n)` que soma os algarismos de `n` usando `% 10` e `// 10` e imprima `soma_digitos(942)` (`15`).',
          en: 'Write `soma_digitos(n)` that sums the digits of `n` using `% 10` and `// 10` and print `soma_digitos(942)` (`15`).',
        },
        theory: {
          pt: 'A cada passo extraímos o último dígito com `n % 10` e removemo-lo com `n //= 10` até `n == 0`.',
          en: 'At each step extract the last digit with `n % 10` and strip it with `n //= 10` until `n == 0`.',
        },
        hint: {
          pt: 'while n > 0:\n    s += n % 10\n    n //= 10',
          en: 'while n > 0:\n    s += n % 10\n    n //= 10',
        },
        starterCode: 'def soma_digitos(n):\n    s = 0\n    # extraia cada dígito\n    return s\n\nprint(soma_digitos(942))\n',
        solutionCode: 'def soma_digitos(n):\n    s = 0\n    while n > 0:\n        s += n % 10\n        n //= 10\n    return s\n\nprint(soma_digitos(942))\n',
        testInput: [],
        expectedOutput: '15',
      },
      {
        id: 'is-prime-fn',
        moduleId: 'functions',
        number: '8.5',
        difficulty: 'intermediate',
        title: { pt: 'Função É Primo', en: 'Is Prime Function' },
        description: {
          pt: 'Crie `eh_primo(n)` que retorna `True` se `n` for primo e imprima `eh_primo(29)` (`True`).',
          en: 'Create `eh_primo(n)` returning `True` if `n` is prime and print `eh_primo(29)` (`True`).',
        },
        theory: {
          pt: 'Se algum divisor `d` entre `2` e `d * d <= n` dividir `n` (`n % d == 0`), a função pode retornar `False` imediatamente.',
          en: 'If any divisor `d` between `2` and `d * d <= n` divides `n` (`n % d == 0`), return `False` immediately.',
        },
        hint: {
          pt: 'd = 2\nwhile d * d <= n:\n    if n % d == 0: return False\n    d += 1\nreturn True',
          en: 'd = 2\nwhile d * d <= n:\n    if n % d == 0: return False\n    d += 1\nreturn True',
        },
        starterCode: 'def eh_primo(n):\n    d = 2\n    # teste divisores até d * d <= n\n    return True\n\nprint(eh_primo(29))\n',
        solutionCode: 'def eh_primo(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True\n\nprint(eh_primo(29))\n',
        testInput: [],
        expectedOutput: 'True',
      },
    ],
  },

  // ============================================================================
  // MODULE 9: CLASSIC ALGORITHMS & MATRICES (5 challenges)
  // ============================================================================
  {
    id: 'algorithms',
    title: { pt: 'Algoritmos clássicos', en: 'Classic algorithms' },
    difficulty: 'advanced',
    icon: 'Cpu',
    challenges: [
      {
        id: 'primes-30',
        moduleId: 'algorithms',
        number: '9.1',
        difficulty: 'advanced',
        title: { pt: 'Números primos', en: 'Prime numbers' },
        description: {
          pt: 'Mostre todos os números primos até 30, separados por espaço: `2 3 5 7 11 13 17 19 23 29`',
          en: 'Print all prime numbers up to 30, separated by space: `2 3 5 7 11 13 17 19 23 29`',
        },
        theory: {
          pt: 'Um número primo `n > 1` só é divisível por 1 e por ele mesmo. Basta testar divisores `d` enquanto `d * d <= n`.',
          en: 'A prime number `n > 1` is only divisible by 1 and itself. You only need to test divisors `d` while `d * d <= n`.',
        },
        hint: {
          pt: 'Para cada n de 2 a 30, assuma primo = True e teste d de 2 até d*d <= n.',
          en: 'For each n from 2 to 30, assume primo = True and test d from 2 while d*d <= n.',
        },
        starterCode: 'for n in range(2, 31):\n    primo = True\n    d = 2\n    # Enquanto d * d <= n, verifique se n é divisível por d\n    # Se for, primo passa a False e saia do while com break\n',
        solutionCode: 'for n in range(2, 31):\n    primo = True\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            primo = False\n            break\n        d += 1\n    if primo:\n        print(n, end=" ")\n',
        testInput: [],
        expectedOutput: '2 3 5 7 11 13 17 19 23 29',
      },
      {
        id: 'binary-search',
        moduleId: 'algorithms',
        number: '9.2',
        difficulty: 'advanced',
        title: { pt: 'Busca binária', en: 'Binary search' },
        description: {
          pt: 'Na lista ordenada `[1, 3, 5, 7, 9, 11, 13]`, procure o número lido (`9`) e imprima `Encontrado na posicao 4`.',
          en: 'In the sorted list `[1, 3, 5, 7, 9, 11, 13]`, search for the input (`9`) and print `Encontrado na posicao 4`.',
        },
        theory: {
          pt: 'A busca binária olha para o meio da lista (`meio = (esq + dir) // 2`) e descarta metade dos elementos a cada passo!',
          en: 'Binary search checks the middle (`mid = (left + right) // 2`) and discards half the elements at each step!',
        },
        hint: {
          pt: 'Use esq = 0, dir = len(v) - 1 e ajuste esq = meio + 1 ou dir = meio - 1.',
          en: 'Use esq = 0, dir = len(v) - 1 and update esq = meio + 1 or dir = meio - 1.',
        },
        starterCode: 'v = [1, 3, 5, 7, 9, 11, 13]\nalvo = int(input())\nesq = 0\ndir = len(v) - 1\npos = -1\n\n# Enquanto esq <= dir, calcule meio = (esq + dir) // 2\n# Compare v[meio] com alvo para decidir se corta a metade esquerda ou direita\n',
        solutionCode: 'v = [1, 3, 5, 7, 9, 11, 13]\nalvo = int(input())\nesq = 0\ndir = len(v) - 1\npos = -1\n\nwhile esq <= dir:\n    meio = (esq + dir) // 2\n    if v[meio] == alvo:\n        pos = meio\n        break\n    elif v[meio] < alvo:\n        esq = meio + 1\n    else:\n        dir = meio - 1\n\nprint(f"Encontrado na posicao {pos}")\n',
        testInput: ['9'],
        expectedOutput: 'Encontrado na posicao 4',
      },
      {
        id: 'matrix-diagonal',
        moduleId: 'algorithms',
        number: '9.3',
        difficulty: 'advanced',
        title: { pt: 'Diagonal da matriz', en: 'Matrix diagonal' },
        description: {
          pt: 'Com `m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`, some a diagonal principal e imprima `Diagonal = 15`.',
          en: 'Given `m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]`, sum the main diagonal and print `Diagonal = 15`.',
        },
        theory: {
          pt: 'Matrizes em Python são listas de listas (`m[linha][coluna]`). Na diagonal principal, `linha == coluna`.',
          en: 'Matrices in Python are lists of lists (`m[row][col]`). On the main diagonal, `row == col`.',
        },
        hint: {
          pt: 'Faça soma += m[i][i] para i em range(3).',
          en: 'Accumulate soma += m[i][i] for i in range(3).',
        },
        starterCode: 'm = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nsoma = 0\n# some a diagonal principal\n',
        solutionCode: 'm = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nsoma = 0\nfor i in range(3):\n    soma += m[i][i]\nprint(f"Diagonal = {soma}")\n',
        testInput: [],
        expectedOutput: 'Diagonal = 15',
      },
      {
        id: 'bubble-sort-challenge',
        moduleId: 'algorithms',
        number: '9.4',
        difficulty: 'advanced',
        title: { pt: 'Bubble Sort', en: 'Bubble Sort' },
        description: {
          pt: 'Ordene `v = [5, 1, 4, 2, 8]` comparando vizinhos `v[j] > v[j + 1]` e trocando-os até obter `[1, 2, 4, 5, 8]`.',
          en: 'Sort `v = [5, 1, 4, 2, 8]` by comparing neighbors `v[j] > v[j + 1]` and swapping them to get `[1, 2, 4, 5, 8]`.',
        },
        theory: {
          pt: 'A cada passagem completa do Bubble Sort, o maior elemento "flutua" para a última posição.',
          en: 'On each full pass of Bubble Sort, the largest element "bubbles up" to its final position.',
        },
        hint: {
          pt: 'for i in range(len(v)):\n    for j in range(len(v) - i - 1):\n        if v[j] > v[j+1]: v[j], v[j+1] = v[j+1], v[j]',
          en: 'for i in range(len(v)):\n    for j in range(len(v) - i - 1):\n        if v[j] > v[j+1]: v[j], v[j+1] = v[j+1], v[j]',
        },
        starterCode: 'v = [5, 1, 4, 2, 8]\nn = len(v)\n# ordene com Bubble Sort\n',
        solutionCode: 'v = [5, 1, 4, 2, 8]\nn = len(v)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if v[j] > v[j + 1]:\n            v[j], v[j + 1] = v[j + 1], v[j]\nprint(v)\n',
        testInput: [],
        expectedOutput: '[1, 2, 4, 5, 8]',
      },
      {
        id: 'matrix-transpose',
        moduleId: 'algorithms',
        number: '9.5',
        difficulty: 'advanced',
        title: { pt: 'Transpor Matriz 2x2', en: 'Transpose 2x2 Matrix' },
        description: {
          pt: 'Troque linhas por colunas em `m = [[1, 2], [3, 4]]` para obter `[[1, 3], [2, 4]]` e imprima `m`.',
          en: 'Swap rows and columns in `m = [[1, 2], [3, 4]]` to get `[[1, 3], [2, 4]]` and print `m`.',
        },
        theory: {
          pt: 'Transpor uma matriz quadrada consiste em trocar `m[i][j]` com `m[j][i]` acima da diagonal principal.',
          en: 'Transposing a square matrix swaps `m[i][j]` with `m[j][i]` above the main diagonal.',
        },
        hint: {
          pt: 'm[0][1], m[1][0] = m[1][0], m[0][1]\nprint(m)',
          en: 'm[0][1], m[1][0] = m[1][0], m[0][1]\nprint(m)',
        },
        starterCode: 'm = [[1, 2], [3, 4]]\n# transponha a matriz\n',
        solutionCode: 'm = [[1, 2], [3, 4]]\nm[0][1], m[1][0] = m[1][0], m[0][1]\nprint(m)\n',
        testInput: [],
        expectedOutput: '[[1, 3], [2, 4]]',
      },
    ],
  },

  // ============================================================================
  // MODULE 10: PURE LOGIC & ALGORITHMIC THINKING (10 challenges)
  // ============================================================================
  {
    id: 'logic-puzzles',
    title: { pt: 'Raciocínio Lógico & Puzzles', en: 'Logical Thinking & Puzzles' },
    difficulty: 'intermediate',
    icon: 'Cpu',
    challenges: [
      {
        id: 'logic-coin-change',
        moduleId: 'logic-puzzles',
        number: '10.1',
        difficulty: 'intermediate',
        title: { pt: 'Máquina de Troco (Lógica Gulosa)', en: 'Coin Change Machine (Greedy Logic)' },
        description: {
          pt: 'Para dar `troco = 87` usando moedas de `moedas = [50, 20, 10, 5, 2, 1]`, calcule a quantidade mínima total de moedas necessárias (`5`).',
          en: 'To give `troco = 87` using `moedas = [50, 20, 10, 5, 2, 1]`, compute the minimum total number of coins needed (`5`).',
        },
        theory: {
          pt: 'Lógica Gulosa: começamos pela maior moeda possível. Quantas cabem? `qtd = troco // m`. Quanto sobra para as próximas? `troco = troco % m`.',
          en: 'Greedy Logic: start with the largest coin. How many fit? `qtd = troco // m`. What remains? `troco = troco % m`.',
        },
        hint: {
          pt: 'for m in moedas:\n    total_moedas += troco // m\n    troco = troco % m',
          en: 'for m in moedas:\n    total_moedas += troco // m\n    troco = troco % m',
        },
        starterCode: 'troco = 87\nmoedas = [50, 20, 10, 5, 2, 1]\ntotal_moedas = 0\n\n# Para cada moeda m, veja quantas cabem no troco atual e atualize o resto\n',
        solutionCode: 'troco = 87\nmoedas = [50, 20, 10, 5, 2, 1]\ntotal_moedas = 0\nfor m in moedas:\n    qtd = troco // m\n    total_moedas += qtd\n    troco = troco % m\nprint(total_moedas)\n',
        testInput: [],
        expectedOutput: '5',
      },
      {
        id: 'logic-second-largest',
        moduleId: 'logic-puzzles',
        number: '10.2',
        difficulty: 'intermediate',
        title: { pt: 'Segundo Maior (Sem Ordenar!)', en: 'Second Largest (No Sorting!)' },
        description: {
          pt: 'Em `v = [14, 42, 28, 55, 39]`, encontre o SEGUNDO maior valor numa única passagem (sem usar `.sort()`) e imprima `42`.',
          en: 'In `v = [14, 42, 28, 55, 39]`, find the SECOND largest value in a single pass (without `.sort()`) and print `42`.',
        },
        theory: {
          pt: 'Pense em pódio de corrida: quando aparece um novo 1º lugar (`x > maior`), o antigo `maior` desce para `segundo` (`segundo = maior; maior = x`)! Se `x` apenas superar o `segundo`, atualizamos só o `segundo`.',
          en: 'Think of a race podium: when a new 1st place arrives (`x > maior`), the old `maior` drops to 2nd (`segundo = maior; maior = x`)! Otherwise if `x > segundo`, update only `segundo`.',
        },
        hint: {
          pt: 'if x > maior:\n    segundo = maior\n    maior = x\nelif x > segundo:\n    segundo = x',
          en: 'if x > maior:\n    segundo = maior\n    maior = x\nelif x > segundo:\n    segundo = x',
        },
        starterCode: 'v = [14, 42, 28, 55, 39]\nmaior = 0\nsegundo = 0\n\n# Percorra v e mantenha o 1º e o 2º colocados atualizados\n',
        solutionCode: 'v = [14, 42, 28, 55, 39]\nmaior = 0\nsegundo = 0\nfor x in v:\n    if x > maior:\n        segundo = maior\n        maior = x\n    elif x > segundo:\n        segundo = x\nprint(segundo)\n',
        testInput: [],
        expectedOutput: '42',
      },
      {
        id: 'logic-reverse-int-math',
        moduleId: 'logic-puzzles',
        number: '10.3',
        difficulty: 'intermediate',
        title: { pt: 'Inverter Número c/ Matemática', en: 'Reverse Integer with Pure Math' },
        description: {
          pt: 'Inverta o número `n = 1234` usando APENAS matemática (`% 10` e `// 10`, sem usar `str`) para obter `4321`.',
          en: 'Reverse `n = 1234` using ONLY math (`% 10` and `// 10`, no `str`) to get `4321`.',
        },
        theory: {
          pt: 'A cada passo: 1) Retire o último dígito com `digito = n % 10`. 2) Empurre os dígitos já invertidos para a esquerda multiplicando por 10: `inv = inv * 10 + digito`. 3) Corte o último dígito de `n` com `n //= 10`.',
          en: 'At each step: 1) Pop last digit `digito = n % 10`. 2) Shift reversed digits left: `inv = inv * 10 + digito`. 3) Chop last digit from `n` with `n //= 10`.',
        },
        hint: {
          pt: 'while n > 0:\n    inv = inv * 10 + (n % 10)\n    n //= 10',
          en: 'while n > 0:\n    inv = inv * 10 + (n % 10)\n    n //= 10',
        },
        starterCode: 'n = 1234\ninv = 0\n\n# Use um ciclo while n > 0 para construir inv matematicamente\n',
        solutionCode: 'n = 1234\ninv = 0\nwhile n > 0:\n    digito = n % 10\n    inv = inv * 10 + digito\n    n //= 10\nprint(inv)\n',
        testInput: [],
        expectedOutput: '4321',
      },
      {
        id: 'logic-robot-2d',
        moduleId: 'logic-puzzles',
        number: '10.4',
        difficulty: 'beginner',
        title: { pt: 'Simulador de Robô 2D', en: '2D Robot Simulator' },
        description: {
          pt: 'Um robô começa em `x = 0, y = 0`. Siga `comandos = "NNEESW"` (`N`: y+1, `S`: y-1, `E`: x+1, `W`: x-1) e imprima `1 1`.',
          en: 'A robot starts at `x = 0, y = 0`. Follow `comandos = "NNEESW"` (`N`: y+1, `S`: y-1, `E`: x+1, `W`: x-1) and print `1 1`.',
        },
        theory: {
          pt: 'Modelar estado com coordenadas cartesianas `(x, y)` é a base de jogos e simulações. Cada comando altera exatamente um eixo.',
          en: 'Modeling state with Cartesian coordinates `(x, y)` is the foundation of games and simulations. Each command updates one axis.',
        },
        hint: {
          pt: 'Para cada c em comandos, use if/elif para somar ou subtrair de x ou y.',
          en: 'For each c in comandos, use if/elif to increment or decrement x or y.',
        },
        starterCode: 'x = 0\ny = 0\ncomandos = "NNEESW"\n\n# Simule o movimento do robô letra por letra\n',
        solutionCode: 'x = 0\ny = 0\ncomandos = "NNEESW"\nfor c in comandos:\n    if c == "N":\n        y += 1\n    elif c == "S":\n        y -= 1\n    elif c == "E":\n        x += 1\n    elif c == "W":\n        x -= 1\nprint(x, y)\n',
        testInput: [],
        expectedOutput: '1 1',
      },
      {
        id: 'logic-strictly-increasing',
        moduleId: 'logic-puzzles',
        number: '10.5',
        difficulty: 'intermediate',
        title: { pt: 'Sequência Crescente (Flag)', en: 'Strictly Increasing (Flag)' },
        description: {
          pt: 'Verifique se `v = [3, 7, 11, 9, 15]` é estritamente crescente comparando cada item com o anterior e imprima `False`.',
          en: 'Check if `v = [3, 7, 11, 9, 15]` is strictly increasing by comparing each item with the previous one and print `False`.',
        },
        theory: {
          pt: 'Padrão Flag Sentinela: assumimos `crescente = True`. Basta encontrar UM único par onde `v[i] <= v[i - 1]` para provar que é `False` e parar com `break`!',
          en: 'Sentinel Flag pattern: assume `crescente = True`. Finding just ONE pair where `v[i] <= v[i - 1]` disproves it (`False`) and we `break`!',
        },
        hint: {
          pt: 'for i in range(1, len(v)):\n    if v[i] <= v[i - 1]:\n        crescente = False\n        break',
          en: 'for i in range(1, len(v)):\n    if v[i] <= v[i - 1]:\n        crescente = False\n        break',
        },
        starterCode: 'v = [3, 7, 11, 9, 15]\ncrescente = True\n\n# Compare cada posição i (a partir de 1) com a anterior i - 1\n',
        solutionCode: 'v = [3, 7, 11, 9, 15]\ncrescente = True\nfor i in range(1, len(v)):\n    if v[i] <= v[i - 1]:\n        crescente = False\n        break\nprint(crescente)\n',
        testInput: [],
        expectedOutput: 'False',
      },
      {
        id: 'logic-mountain-peaks',
        moduleId: 'logic-puzzles',
        number: '10.6',
        difficulty: 'intermediate',
        title: { pt: 'Picos da Montanha', en: 'Mountain Peaks' },
        description: {
          pt: 'Em `h = [1, 4, 2, 6, 3, 7, 1]`, conte quantos pontos são picos (maiores que o vizinho da esquerda E da direita) e imprima `3`.',
          en: 'In `h = [1, 4, 2, 6, 3, 7, 1]`, count how many elements are peaks (strictly greater than both left and right neighbors) and print `3`.',
        },
        theory: {
          pt: 'Atenção às bordas! O primeiro (`0`) e o último (`len(h)-1`) não têm dois vizinhos, por isso percorremos de `1` até `len(h) - 1`.',
          en: 'Watch the boundaries! The first (`0`) and last (`len(h)-1`) lack two neighbors, so loop `i` from `1` to `len(h) - 1`.',
        },
        hint: {
          pt: 'for i in range(1, len(h) - 1):\n    if h[i] > h[i - 1] and h[i] > h[i + 1]: picos += 1',
          en: 'for i in range(1, len(h) - 1):\n    if h[i] > h[i - 1] and h[i] > h[i + 1]: picos += 1',
        },
        starterCode: 'h = [1, 4, 2, 6, 3, 7, 1]\npicos = 0\n\n# Percorra apenas os índices internos que possuem vizinho à esquerda e à direita\n',
        solutionCode: 'h = [1, 4, 2, 6, 3, 7, 1]\npicos = 0\nfor i in range(1, len(h) - 1):\n    if h[i] > h[i - 1] and h[i] > h[i + 1]:\n        picos += 1\nprint(picos)\n',
        testInput: [],
        expectedOutput: '3',
      },
      {
        id: 'logic-fizzbuzz-count',
        moduleId: 'logic-puzzles',
        number: '10.7',
        difficulty: 'beginner',
        title: { pt: 'Lógica do FizzBuzz', en: 'FizzBuzz Logic' },
        description: {
          pt: 'De 1 a 15, imprima `FB` se divisível por 3 e 5, `F` se só por 3, `B` se só por 5, ou o número. Tudo na mesma linha com espaço.',
          en: 'From 1 to 15, print `FB` if divisible by 3 and 5, `F` if by 3, `B` if by 5, else the number, separated by spaces.',
        },
        theory: {
          pt: 'Armadilha clássica de lógica: se testar `n % 3 == 0` no primeiro `if`, o número `15` cairá nele e nunca chegará ao teste de `3 e 5`! A condição mais específica vem sempre primeiro.',
          en: 'Classic logic trap: if you test `n % 3 == 0` first, `15` will match it and never reach the `3 and 5` check! Always test the most specific condition first.',
        },
        hint: {
          pt: 'Comece com if n % 15 == 0: print("FB", end=" ")',
          en: 'Start with if n % 15 == 0: print("FB", end=" ")',
        },
        starterCode: 'for n in range(1, 16):\n    # Atenção à ordem dos ifs!\n    pass\n',
        solutionCode: 'for n in range(1, 16):\n    if n % 15 == 0:\n        print("FB", end=" ")\n    elif n % 3 == 0:\n        print("F", end=" ")\n    elif n % 5 == 0:\n        print("B", end=" ")\n    else:\n        print(n, end=" ")\n',
        testInput: [],
        expectedOutput: '1 2 F 4 B F 7 8 F B 11 F 13 14 FB',
      },
      {
        id: 'logic-balance-pivot',
        moduleId: 'logic-puzzles',
        number: '10.8',
        difficulty: 'advanced',
        title: { pt: 'Ponto de Equilíbrio', en: 'Balance Pivot Index' },
        description: {
          pt: 'Em `pesos = [1, 7, 3, 6, 5, 6]`, encontre o índice `i` onde a soma à esquerda é igual à soma à direita (`3`).',
          en: 'In `pesos = [1, 7, 3, 6, 5, 6]`, find the index `i` where the left sum equals the right sum (`3`).',
        },
        theory: {
          pt: 'Dedução algébrica: se sabemos `total = sum(pesos)` e mantemos `soma_esq`, então a soma à direita do índice `i` é simplesmente `total - soma_esq - pesos[i]`!',
          en: 'Algebraic deduction: knowing `total = sum(pesos)` and tracking `soma_esq`, the right sum at index `i` is simply `total - soma_esq - pesos[i]`!',
        },
        hint: {
          pt: 'soma_dir = total - soma_esq - pesos[i]\nif soma_esq == soma_dir: print(i); break\nsoma_esq += pesos[i]',
          en: 'soma_dir = total - soma_esq - pesos[i]\nif soma_esq == soma_dir: print(i); break\nsoma_esq += pesos[i]',
        },
        starterCode: 'pesos = [1, 7, 3, 6, 5, 6]\ntotal = sum(pesos)\nsoma_esq = 0\n\n# Para cada índice i, compare soma_esq com o que resta à direita\n',
        solutionCode: 'pesos = [1, 7, 3, 6, 5, 6]\ntotal = sum(pesos)\nsoma_esq = 0\nfor i in range(len(pesos)):\n    soma_dir = total - soma_esq - pesos[i]\n    if soma_esq == soma_dir:\n        print(i)\n        break\n    soma_esq += pesos[i]\n',
        testInput: [],
        expectedOutput: '3',
      },
      {
        id: 'logic-max-streak',
        moduleId: 'logic-puzzles',
        number: '10.9',
        difficulty: 'intermediate',
        title: { pt: 'Maior Sequência de Vitórias', en: 'Longest Winning Streak' },
        description: {
          pt: 'Em `jogos = [1, 1, 0, 1, 1, 1, 0, 1]`, conte o tamanho da maior sequência seguida de `1`s (`3`).',
          en: 'In `jogos = [1, 1, 0, 1, 1, 1, 0, 1]`, find the length of the longest consecutive run of `1`s (`3`).',
        },
        theory: {
          pt: 'Usamos duas variáveis: `atual` (que soma +1 quando vê `1`, mas ZERA `atual = 0` quando vê `0`!) e `recorde` (que guarda o maior `atual` já atingido).',
          en: 'Use two variables: `atual` (increments on `1`, resets to `0` on `0`!) and `recorde` (stores the highest `atual` seen so far).',
        },
        hint: {
          pt: 'if j == 1:\n    atual += 1\n    if atual > recorde: recorde = atual\nelse:\n    atual = 0',
          en: 'if j == 1:\n    atual += 1\n    if atual > recorde: recorde = atual\nelse:\n    atual = 0',
        },
        starterCode: 'jogos = [1, 1, 0, 1, 1, 1, 0, 1]\natual = 0\nrecorde = 0\n\n# Atualize a sequência atual e o recorde máximo\n',
        solutionCode: 'jogos = [1, 1, 0, 1, 1, 1, 0, 1]\natual = 0\nrecorde = 0\nfor j in jogos:\n    if j == 1:\n        atual += 1\n        if atual > recorde:\n            recorde = atual\n    else:\n        atual = 0\nprint(recorde)\n',
        testInput: [],
        expectedOutput: '3',
      },
      {
        id: 'logic-missing-number',
        moduleId: 'logic-puzzles',
        number: '10.10',
        difficulty: 'intermediate',
        title: { pt: 'O Número Desaparecido (Gauss)', en: 'The Missing Number (Gauss)' },
        description: {
          pt: 'A lista `v = [0, 1, 2, 4, 5]` deveria ter todos os números de `0` a `5`, mas falta um. Descubra qual falta usando a soma de Gauss (`3`).',
          en: 'The list `v = [0, 1, 2, 4, 5]` should contain all numbers from `0` to `5`, but one is missing. Find it using Gauss sum (`3`).',
        },
        theory: {
          pt: 'Soma de Gauss: a soma esperada de `0` até `n` é `n * (n + 1) // 2`. Se subtrairmos a soma real dos elementos da lista, sobra exatamente o número que falta!',
          en: 'Gauss Sum: the expected sum from `0` to `n` is `n * (n + 1) // 2`. Subtracting the actual sum of the list leaves the exact missing number!',
        },
        hint: {
          pt: 'soma_esperada = n * (n + 1) // 2\nprint(soma_esperada - sum(v))',
          en: 'soma_esperada = n * (n + 1) // 2\nprint(soma_esperada - sum(v))',
        },
        starterCode: 'v = [0, 1, 2, 4, 5]\nn = 5\n\n# Calcule a diferença entre a soma esperada de 0..5 e a soma real de v\n',
        solutionCode: 'v = [0, 1, 2, 4, 5]\nn = 5\nsoma_esperada = n * (n + 1) // 2\nsoma_real = 0\nfor x in v:\n    soma_real += x\nfalta = soma_esperada - soma_real\nprint(falta)\n',
        testInput: [],
        expectedOutput: '3',
      },
    ],
  },

  // ============================================================================
  // MODULE 11: LEETCODE ARENA (10 classic LeetCode challenges)
  // ============================================================================
  {
    id: 'leetcode-arena',
    title: { pt: 'Desafios LeetCode', en: 'LeetCode Challenges' },
    difficulty: 'advanced',
    icon: 'Trophy',
    challenges: [
      {
        id: 'lc-two-sum',
        moduleId: 'leetcode-arena',
        number: '10.1',
        difficulty: 'intermediate',
        title: { pt: '#1 Two Sum (Soma de Dois)', en: '#1 Two Sum' },
        description: {
          pt: 'Dada a lista `nums = [2, 7, 11, 15]` e `alvo = 9`, encontre os índices dos dois números cuja soma é 9 e imprima `[0, 1]`.',
          en: 'Given `nums = [2, 7, 11, 15]` and `alvo = 9`, find the indices of the two numbers that add up to 9 and print `[0, 1]`.',
        },
        theory: {
          pt: 'Padrão Hash Map: guardamos num dicionário `vistos[valor] = indice`. Para cada `num`, verificamos se `falta = alvo - num` já está em `vistos` em O(1)!',
          en: 'Hash Map pattern: store `vistos[value] = index` in a dictionary. For each `num`, check if `falta = alvo - num` is already in `vistos` in O(1)!',
        },
        hint: {
          pt: 'for i, num in enumerate(nums):\n    falta = alvo - num\n    if falta in vistos: print([vistos[falta], i]); break\n    vistos[num] = i',
          en: 'for i, num in enumerate(nums):\n    falta = alvo - num\n    if falta in vistos: print([vistos[falta], i]); break\n    vistos[num] = i',
        },
        starterCode: 'nums = [2, 7, 11, 15]\nalvo = 9\nvistos = {}\n# encontre os dois índices\n',
        solutionCode: 'nums = [2, 7, 11, 15]\nalvo = 9\nvistos = {}\n\nfor i, num in enumerate(nums):\n    falta = alvo - num\n    if falta in vistos:\n        print([vistos[falta], i])\n        break\n    vistos[num] = i\n',
        testInput: [],
        expectedOutput: '[0, 1]',
      },
      {
        id: 'lc-valid-palindrome',
        moduleId: 'leetcode-arena',
        number: '10.2',
        difficulty: 'beginner',
        title: { pt: '#125 Palíndromo Válido', en: '#125 Valid Palindrome' },
        description: {
          pt: 'Usando dois ponteiros (`esq` e `dir`), verifique se `palavra = "radar"` é um palíndromo e imprima `True`.',
          en: 'Using two pointers (`esq` and `dir`), check if `palavra = "radar"` is a palindrome and print `True`.',
        },
        theory: {
          pt: 'Padrão Two Pointers: começamos com `esq = 0` e `dir = len(palavra) - 1`, comparando as extremidades enquanto `esq < dir`.',
          en: 'Two Pointers pattern: start with `esq = 0` and `dir = len(palavra) - 1`, comparing both ends while `esq < dir`.',
        },
        hint: {
          pt: 'if palavra[esq] != palavra[dir]: eh_palindromo = False; break',
          en: 'if palavra[esq] != palavra[dir]: eh_palindromo = False; break',
        },
        starterCode: 'palavra = "radar"\nesq = 0\ndir = len(palavra) - 1\neh_palindromo = True\n# compare com dois ponteiros\n',
        solutionCode: 'palavra = "radar"\nesq = 0\ndir = len(palavra) - 1\neh_palindromo = True\n\nwhile esq < dir:\n    if palavra[esq] != palavra[dir]:\n        eh_palindromo = False\n        break\n    esq += 1\n    dir -= 1\n\nprint(eh_palindromo)\n',
        testInput: [],
        expectedOutput: 'True',
      },
      {
        id: 'lc-valid-parentheses',
        moduleId: 'leetcode-arena',
        number: '10.3',
        difficulty: 'intermediate',
        title: { pt: '#20 Parênteses Válidos', en: '#20 Valid Parentheses' },
        description: {
          pt: 'Verifique se `s = "{[()]}"` tem todos os parênteses fechados na ordem correta usando uma pilha (`pilha = []`) e imprima `True`.',
          en: 'Check if `s = "{[()]}"` has all brackets closed in the right order using a stack (`pilha = []`) and print `True`.',
        },
        theory: {
          pt: 'Padrão Stack (LIFO): ao abrir `(`, `[`, `{`, fazemos `pilha.append(c)`. Ao fechar, fazemos `pilha.pop()` e conferimos se corresponde!',
          en: 'Stack (LIFO) pattern: when opening `(`, `[`, `{`, push with `pilha.append(c)`. When closing, `pilha.pop()` and verify it matches!',
        },
        hint: {
          pt: 'Use pares = {")": "(", "]": "[", "}": "{"} para validar o topo da pilha.',
          en: 'Use pares = {")": "(", "]": "[", "}": "{"} to validate the top of the stack.',
        },
        starterCode: 's = "{[()]}"\npares = {")": "(", "]": "[", "}": "{"}\npilha = []\nvalido = True\n# processe cada caractere\n',
        solutionCode: 's = "{[()]}"\npares = {")": "(", "]": "[", "}": "{"}\npilha = []\nvalido = True\n\nfor c in s:\n    if c in "([{":\n        pilha.append(c)\n    else:\n        if not pilha or pilha.pop() != pares[c]:\n            valido = False\n            break\n\nprint(valido and len(pilha) == 0)\n',
        testInput: [],
        expectedOutput: 'True',
      },
      {
        id: 'lc-buy-sell-stock',
        moduleId: 'leetcode-arena',
        number: '10.4',
        difficulty: 'intermediate',
        title: { pt: '#121 Melhor Momento Ações', en: '#121 Best Time to Buy Stock' },
        description: {
          pt: 'Dados os preços diários `precos = [7, 1, 5, 3, 6, 4]`, calcule o lucro máximo comprando num dia e vendendo depois (`5`).',
          en: 'Given daily prices `precos = [7, 1, 5, 3, 6, 4]`, compute the maximum profit from buying one day and selling later (`5`).',
        },
        theory: {
          pt: 'Padrão Greedy: guarde o `min_preco` visto até agora. Em cada dia, o lucro possível é `p - min_preco`.',
          en: 'Greedy pattern: track `min_preco` seen so far. Each day, possible profit is `p - min_preco`.',
        },
        hint: {
          pt: 'if p < min_preco: min_preco = p\nelif p - min_preco > max_lucro: max_lucro = p - min_preco',
          en: 'if p < min_preco: min_preco = p\nelif p - min_preco > max_lucro: max_lucro = p - min_preco',
        },
        starterCode: 'precos = [7, 1, 5, 3, 6, 4]\nmin_preco = precos[0]\nmax_lucro = 0\n# encontre o lucro máximo\n',
        solutionCode: 'precos = [7, 1, 5, 3, 6, 4]\nmin_preco = precos[0]\nmax_lucro = 0\n\nfor p in precos:\n    if p < min_preco:\n        min_preco = p\n    elif p - min_preco > max_lucro:\n        max_lucro = p - min_preco\n\nprint(max_lucro)\n',
        testInput: [],
        expectedOutput: '5',
      },
      {
        id: 'lc-move-zeroes',
        moduleId: 'leetcode-arena',
        number: '10.5',
        difficulty: 'intermediate',
        title: { pt: '#283 Mover Zeros', en: '#283 Move Zeroes' },
        description: {
          pt: 'Mova todos os `0` da lista `nums = [0, 1, 0, 3, 12]` para o final mantendo a ordem dos outros números e imprima `[1, 3, 12, 0, 0]`.',
          en: 'Move all `0`s in `nums = [0, 1, 0, 3, 12]` to the end while keeping relative order and print `[1, 3, 12, 0, 0]`.',
        },
        theory: {
          pt: 'Use um ponteiro `pos = 0` para a próxima posição não-zero. Quando `nums[i] != 0`, troque `nums[pos]` com `nums[i]` e avance `pos`.',
          en: 'Use a pointer `pos = 0` for the next non-zero slot. When `nums[i] != 0`, swap `nums[pos]` with `nums[i]` and increment `pos`.',
        },
        hint: {
          pt: 'nums[pos], nums[i] = nums[i], nums[pos]\npos += 1',
          en: 'nums[pos], nums[i] = nums[i], nums[pos]\npos += 1',
        },
        starterCode: 'nums = [0, 1, 0, 3, 12]\npos = 0\n# mova os zeros in-place\n',
        solutionCode: 'nums = [0, 1, 0, 3, 12]\npos = 0\n\nfor i in range(len(nums)):\n    if nums[i] != 0:\n        nums[pos], nums[i] = nums[i], nums[pos]\n        pos += 1\n\nprint(nums)\n',
        testInput: [],
        expectedOutput: '[1, 3, 12, 0, 0]',
      },
      {
        id: 'lc-max-subarray',
        moduleId: 'leetcode-arena',
        number: '10.6',
        difficulty: 'advanced',
        title: { pt: '#53 Subarray Máximo (Kadane)', en: '#53 Maximum Subarray (Kadane)' },
        description: {
          pt: 'Encontre a maior soma possível de um subarray contíguo em `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` e imprima `6`.',
          en: 'Find the largest sum of a contiguous subarray in `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]` and print `6`.',
        },
        theory: {
          pt: 'Algoritmo de Kadane: em cada elemento, decidimos se continuamos o subarray anterior (`atual + n`) ou começamos um novo a partir de `n`.',
          en: "Kadane's Algorithm: at each element, decide whether to extend the previous subarray (`atual + n`) or start fresh at `n`.",
        },
        hint: {
          pt: 'atual = n if n > atual + n else atual + n\nif atual > melhor: melhor = atual',
          en: 'atual = n if n > atual + n else atual + n\nif atual > melhor: melhor = atual',
        },
        starterCode: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\natual = nums[0]\nmelhor = nums[0]\n# aplique Kadane\n',
        solutionCode: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\natual = nums[0]\nmelhor = nums[0]\n\nfor n in nums[1:]:\n    atual = n if n > atual + n else atual + n\n    if atual > melhor:\n        melhor = atual\n\nprint(melhor)\n',
        testInput: [],
        expectedOutput: '6',
      },
      {
        id: 'lc-contains-duplicate',
        moduleId: 'leetcode-arena',
        number: '10.7',
        difficulty: 'beginner',
        title: { pt: '#217 Contém Duplicado', en: '#217 Contains Duplicate' },
        description: {
          pt: 'Verifique se `nums = [4, 1, 7, 3, 1]` possui algum número repetido e imprima `True`.',
          en: 'Check if `nums = [4, 1, 7, 3, 1]` contains any duplicate number and print `True`.',
        },
        theory: {
          pt: 'Guardando os elementos vistos num dicionário/mapa `vistos`, detetamos uma repetição instantaneamente se `n in vistos`!',
          en: 'By recording seen elements in a dictionary/map `vistos`, you can detect duplicates in O(1) when `n in vistos`!',
        },
        hint: {
          pt: 'for n in nums:\n    if n in vistos: duplicado = True; break\n    vistos[n] = True',
          en: 'for n in nums:\n    if n in vistos: duplicado = True; break\n    vistos[n] = True',
        },
        starterCode: 'nums = [4, 1, 7, 3, 1]\nvistos = {}\nduplicado = False\n# verifique se há duplicado\n',
        solutionCode: 'nums = [4, 1, 7, 3, 1]\nvistos = {}\nduplicado = False\nfor n in nums:\n    if n in vistos:\n        duplicado = True\n        break\n    vistos[n] = True\nprint(duplicado)\n',
        testInput: [],
        expectedOutput: 'True',
      },
      {
        id: 'lc-majority-element',
        moduleId: 'leetcode-arena',
        number: '10.8',
        difficulty: 'intermediate',
        title: { pt: '#169 Elemento Maioritário', en: '#169 Majority Element' },
        description: {
          pt: 'Use o algoritmo de votação de Boyer-Moore em `nums = [2, 2, 1, 1, 1, 2, 2]` para encontrar o elemento que aparece mais da metade das vezes (`2`).',
          en: 'Use Boyer-Moore Voting on `nums = [2, 2, 1, 1, 1, 2, 2]` to find the element appearing more than half the time (`2`).',
        },
        theory: {
          pt: 'Boyer-Moore: se `votos == 0`, escolhemos `candidato = n`. Se `n == candidato`, somamos 1 voto; senão, subtraímos 1 voto!',
          en: 'Boyer-Moore: when `votos == 0`, pick `candidato = n`. If `n == candidato`, add 1 vote; otherwise subtract 1 vote!',
        },
        hint: {
          pt: 'if votos == 0: candidato = n\nvotos += 1 if n == candidato else -1',
          en: 'if votos == 0: candidato = n\nvotos += 1 if n == candidato else -1',
        },
        starterCode: 'nums = [2, 2, 1, 1, 1, 2, 2]\ncandidato = 0\nvotos = 0\n# aplique Boyer-Moore\n',
        solutionCode: 'nums = [2, 2, 1, 1, 1, 2, 2]\ncandidato = 0\nvotos = 0\nfor n in nums:\n    if votos == 0:\n        candidato = n\n    if n == candidato:\n        votos += 1\n    else:\n        votos -= 1\nprint(candidato)\n',
        testInput: [],
        expectedOutput: '2',
      },
      {
        id: 'lc-climbing-stairs',
        moduleId: 'leetcode-arena',
        number: '10.9',
        difficulty: 'intermediate',
        title: { pt: '#70 Subindo Escadas (DP)', en: '#70 Climbing Stairs (DP)' },
        description: {
          pt: 'Para subir `n = 5` degraus podendo dar passos de 1 ou 2 degraus, calcule de quantas formas distintas podemos chegar ao topo (`8`).',
          en: 'To climb `n = 5` steps taking 1 or 2 steps at a time, compute how many distinct ways reach the top (`8`).',
        },
        theory: {
          pt: 'Programação Dinâmica: `dp[i] = dp[i-1] + dp[i-2]`. Para 5 degraus a tabela `dp` evolui como `[1, 1, 2, 3, 5, 8]`.',
          en: 'Dynamic Programming: `dp[i] = dp[i-1] + dp[i-2]`. For 5 steps the `dp` table grows as `[1, 1, 2, 3, 5, 8]`.',
        },
        hint: {
          pt: 'for i in range(2, n + 1):\n    dp.append(dp[i - 1] + dp[i - 2])\nprint(dp[n])',
          en: 'for i in range(2, n + 1):\n    dp.append(dp[i - 1] + dp[i - 2])\nprint(dp[n])',
        },
        starterCode: 'n = 5\ndp = [1, 1]\n# preencha a tabela dp até n\n',
        solutionCode: 'n = 5\ndp = [1, 1]\nfor i in range(2, n + 1):\n    dp.append(dp[i - 1] + dp[i - 2])\nprint(dp[n])\n',
        testInput: [],
        expectedOutput: '8',
      },
      {
        id: 'lc-container-most-water',
        moduleId: 'leetcode-arena',
        number: '10.10',
        difficulty: 'advanced',
        title: { pt: '#11 Maior Reservatório Água', en: '#11 Container With Most Water' },
        description: {
          pt: 'Dadas as alturas `h = [1, 8, 6, 2, 5, 4, 8, 3, 7]`, encontre a maior área de água entre duas barras usando dois ponteiros (`49`).',
          en: 'Given heights `h = [1, 8, 6, 2, 5, 4, 8, 3, 7]`, find the max water area between two bars using two pointers (`49`).',
        },
        theory: {
          pt: 'Área = `(dir - esq) * min(h[esq], h[dir])`. A cada passo, movemos o ponteiro que tiver a menor barra!',
          en: 'Area = `(dir - esq) * min(h[esq], h[dir])`. At each step, move the pointer pointing to the shorter bar!',
        },
        hint: {
          pt: 'if h[esq] < h[dir]: esq += 1\nelse: dir -= 1',
          en: 'if h[esq] < h[dir]: esq += 1\nelse: dir -= 1',
        },
        starterCode: 'h = [1, 8, 6, 2, 5, 4, 8, 3, 7]\nesq = 0\ndir = len(h) - 1\nmax_area = 0\n# encontre a maior área com dois ponteiros\n',
        solutionCode: 'h = [1, 8, 6, 2, 5, 4, 8, 3, 7]\nesq = 0\ndir = len(h) - 1\nmax_area = 0\nwhile esq < dir:\n    altura = h[esq] if h[esq] < h[dir] else h[dir]\n    area = (dir - esq) * altura\n    if area > max_area:\n        max_area = area\n    if h[esq] < h[dir]:\n        esq += 1\n    else:\n        dir -= 1\nprint(max_area)\n',
        testInput: [],
        expectedOutput: '49',
      },
    ],
  },
];

export const EXAMPLE_SYSTEMS: FreeProgram[] = [
  {
    id: 'ex-boletim',
    name: 'Boletim da turma (Dicionários & Listas)',
    testInput: '',
    updatedAt: 1,
    code: `turma = {
    "Ana": [15, 17, 16],
    "Bruno": [12, 14, 13],
    "Carla": [18, 19, 17]
}

for nome, notas in turma.items():
    media = sum(notas) // len(notas)
    estado = "Aprovado" if media >= 14 else "Recuperação"
    print(f"{nome}: média {media} -> {estado}")
`,
  },
  {
    id: 'ex-bubblesort',
    name: 'Bubble Sort Visual',
    testInput: '',
    updatedAt: 2,
    code: `v = [5, 2, 8, 1, 4]
n = len(v)

for i in range(n):
    for j in range(0, n - i - 1):
        if v[j] > v[j + 1]:
            v[j], v[j + 1] = v[j + 1], v[j]

print("Ordenado:", v)
`,
  },
  {
    id: 'ex-sieve',
    name: 'Crivo de Eratóstenes (Primos Rápidos)',
    testInput: '',
    updatedAt: 3,
    code: `limite = 20
primo = [True] * (limite + 1)
primo[0] = False
primo[1] = False

for p in range(2, 5):
    if primo[p]:
        for mult in range(p * p, limite + 1, p):
            primo[mult] = False

res = [i for i in range(2, limite + 1) if primo[i]]
print("Primos:", res)
`,
  },
  {
    id: 'ex-estoque',
    name: 'Sistema de Loja & Carrinho',
    testInput: '',
    updatedAt: 4,
    code: `precos = {"Teclado": 45, "Rato": 25, "Monitor": 180}
carrinho = ["Teclado", "Rato", "Rato"]
total = 0

for item in carrinho:
    total += precos[item]

print(f"Total a pagar: {total} EUR")
`,
  },
  {
    id: 'ex-troco-guloso',
    name: 'Lógica: Máquina de Troco Passo a Passo',
    testInput: '',
    updatedAt: 5,
    code: `troco = 87
moedas = [50, 20, 10, 5, 2, 1]
entregues = []

for m in moedas:
    while troco >= m:
        entregues.append(m)
        troco -= m

print("Moedas entregues:", entregues)
`,
  },
  {
    id: 'ex-hanoi',
    name: 'Lógica Recursiva: Torre de Hanói (3 Discos)',
    testInput: '',
    updatedAt: 6,
    code: `passos = []

def hanoi(n, origem, destino, auxiliar):
    if n == 1:
        passos.append(f"{origem}->{destino}")
        return
    hanoi(n - 1, origem, auxiliar, destino)
    passos.append(f"{origem}->{destino}")
    hanoi(n - 1, auxiliar, destino, origem)

hanoi(3, "A", "C", "B")
print("Total movimentos:", len(passos))
print("Sequência:", passos)
`,
  },
];
