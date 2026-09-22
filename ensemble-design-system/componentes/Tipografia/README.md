# Tipografia

Três famílias com papéis fixos: Fredoka para títulos, Figtree para ler e Caveat para os recadinhos à mão.

Carregue as fontes com:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500..700&family=Figtree:ital,wght@0,400..800;1,400..700&family=Fredoka:wght@400..700&display=swap">
```

| Classe | Estilo (token) | Desktop → celular | Uso |
| --- | --- | --- | --- |
| `.en-display` | `titulo-display` | 56 → 40px | Título do topo, uma vez por página |
| `.en-h1` | `titulo-1` | 40 → 32px | Título de seção |
| `.en-h2` | `titulo-2` | 30 → 26px | Subtítulo, título de destaque |
| `.en-h3` | `titulo-3` | 22px | Título de card, pergunta de FAQ |
| `.en-rotulo` | `rotulo` | 13px, caixa alta | Chapéu acima do título de seção |
| `.en-lead` | `texto-grande` | 20 → 18px | Linha de apoio sob títulos |
| `.en-texto` | `texto` | 17px | Parágrafos |
| `.en-pequeno` | `texto-pequeno` | 15px | Apoio em cards e formulários |
| `.en-legenda` | `legenda` | 13px | Autoria, metadados |
| `.en-nota` | `nota` / `nota-grande` | 24 / 34px | Anotação manuscrita |

- Títulos em peso 600, sem ponto final (exceto frases de efeito como "On apprend ensemble.").
- Caveat no máximo 1 ou 2 vezes por tela, até ~8 palavras. Nunca em parágrafo, botão ou campo.
- Palavras em francês no meio do texto podem ir em itálico na primeira vez (*subjonctif*); expressões curtas e conhecidas ("Bonjour!") ficam sem itálico.
