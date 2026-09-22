Ensemble é a identidade de uma professora de francês que já esteve no lugar do aluno. Ela começou do zero, sabe o caminho e continua estudando todo dia, e isso é o coração da marca: **on apprend ensemble**, a gente aprende junto. Ela está do mesmo lado do aluno, sabe exatamente onde o francês trava, ensina a aprender e deixa o aprendizado leve. Tudo aqui deve fazer a pessoa se sentir à vontade para errar, rir e mandar uma piada, e ao mesmo tempo confiar que está em boas mãos, sem ficar infantil, bagunçado ou apelativo.

## A narrativa

Três ideias, nesta ordem de força:

1. **Eu estive no seu lugar.** Ela começou do zero, como o aluno, e fez o caminho inteiro. Por isso sabe o que confunde, em que ordem as coisas fazem sentido e o que destrava cada etapa.
2. **Eu continuo estudando.** Por dedicação de profissional: estuda todo dia e testa em si mesma o que leva pra aula. Nunca como desculpa ou justificativa.
3. **Eu te ensino a aprender.** Além do francês, ela mostra como estudar: o que revisar, como treinar o ouvido, como seguir evoluindo sozinho entre as aulas.

O aluno pode errar à vontade: isso é acolhimento. Quem **não** aparece errando, em dúvida ou se desculpando é a professora. Nada de "eu ainda sou aluna", "até eu fico em dúvida", "eu erro até hoje" ou "eu podia esconder isso".

## Tom de voz

- **Próxima, de igual para igual.** Fale com "você", em português do dia a dia ("pra", "a gente", "bora"). A professora fala em primeira pessoa, com a segurança de quem já fez o caminho: "eu também comecei do zero", "eu sei onde isso trava".
- **Uma pitada de francês por bloco.** Expressões curtas e fáceis de entender pelo contexto: "Bonjour!", "Oh là là", "C'est parti!", "On apprend ensemble", "Merci!", "Zéro stress". Se a expressão não é óbvia, traduza logo em seguida.
- **Humor leve, nunca às custas do aluno.** Pode rir do erro junto com o aluno, de falsos amigos, do *subjonctif*. Nunca ironia com quem não sabe.
- **Erro do aluno é bem-vindo.** Sempre trate o erro de quem está aprendendo como parte do caminho: "Errou? Ótimo, agora a gente sabe o que treinar."
- **Sem infantilizar.** Nada de "tia", diminutivos em excesso, "aprenda brincando" ou muitas exclamações (uma por frase, no máximo). Nada de emoji na interface: use os ícones e rabiscos.
- **Sem pressão de venda.** Nada de "últimas vagas!", contagem regressiva ou "método revolucionário". Convite, não empurrão.
- **Caixa de frase** em títulos e botões ("Como funcionam as aulas"), nunca TUDO EM MAIÚSCULAS, exceto no `rotulo`.

A seção **Tom de voz: microtextos** traz frases prontas para cada componente.

## Cores

- Fundo de tudo é `papier` (off-white quente). Alterne seções com `papier-fonce`. Cards, balões e campos em `blanc`.
- Texto em `encre`; apoio em `encre-douce`. Contornos desenhados (balões, adesivos, botão contorno) em `encre` com traço de 2px (`traco`).
- `bleu` (#0055A4) e `rouge` (#EF4135) são **detalhe e destaque**, não fundo de página. Proporção de referência: ~70% claros, ~20% `encre` + `bleu`, ~10% `rouge` + `beurre`.
- `rouge` só em decoração e texto de 24px ou mais. Botão primário e texto vermelho pequeno usam `rouge-action`; pressionado e texto sobre `rose` usam `rouge-fonce`.
- Tintas suaves para balões e blocos: `ciel` (azul, a voz da professora), `rose` (vermelho, a voz do aluno e os "erros comuns"), `beurre-clair` (dicas). `beurre` é a cor de apoio para marca-texto, adesivos e selos.
- Sobre `bleu`, `rouge-action` e `encre`, o texto é `texte-inverse`. Sobre `beurre`, sempre `encre`.
- Um único bloco inteiro em `bleu` por página (o CTA final). A página nunca deve parecer uma bandeira.

## Tipografia

- **Fredoka** (`titulo`) para títulos, números, botões e balões grandes: arredondada e amigável, peso 600.
- **Figtree** (`texto`) para todo texto corrido: corpo de 17px, entrelinha 27px.
- **Caveat** (`nota`) para recadinhos à mão: no máximo 1 ou 2 por tela, até ~8 palavras, nunca em parágrafo, botão ou campo.
- Hierarquia: `titulo-display` (uma vez, no topo) → `titulo-1` (seções) → `titulo-2` → `titulo-3` (cards) → `texto-grande` (apoio sob títulos) → `texto` → `texto-pequeno` → `legenda`. `rotulo` em caixa alta e `bleu` acima de títulos de seção.
- No celular os títulos encolhem (display 40px, titulo-1 32px, titulo-2 26px); as classes `.en-display`, `.en-h1`, `.en-h2` do CSS já fazem isso.

## Forma, espaço e profundidade

- Tudo arredondado: `raio-lg` em cards e balões, `raio-xl` em blocos de destaque, `raio-pilula` em botões e etiquetas, `raio-sm` em campos. Nada pontudo além da ponta dos balões.
- Espaçamento em base 4: `espaco-5` dentro de cards, `espaco-9` entre seções no desktop e `espaco-8` no celular, margem lateral `espaco-4` no celular.
- Profundidade: `sombra-suave` para cards; `sombra-carimbo` (sombra chapada deslocada + contorno `encre`) para o que é "adesivo": o card em destaque, adesivos, um depoimento. No máximo um elemento carimbado por seção.
- Foco de teclado: `anel-foco` (3px de `papier` + 3px de `bleu`) em tudo que é interativo.
- Movimento: pequeno e com mola (botão levanta 2px, adesivo vira, seta anda 4px). Sem animação de entrada chamativa. Tudo que se mexe para com `prefers-reduced-motion`.

## Decoração e referências francesas

- Rabiscos (sublinhado, círculo, setas, brilhos) destacam ou apontam algo. Um por título, três por tela no máximo.
- Referências à França entram com humor e em doses pequenas: croissant piscando, a Torre Eiffel de boina, o caderno escolar francês (pauta Seyès), as aspas « ». Nada de cartão-postal: sem foto de Paris ao pôr do sol, sem acordeão, sem fonte cursiva "romântica", sem bandeira inteira como fundo.
- A bandeira aparece como ritmo (azul, branco, vermelho), não como desenho literal.

## Ícones e imagens

- Ícones próprios de traço 2px, cantos redondos, grade 24px (`assets/Icones/`), em `encre` ou `bleu`; inline com `currentColor`.
- Ilustrações em 2 ou 3 cores da paleta com contorno `encre` (`assets/Ilustracoes/`): uma por seção no máximo.
- Fotos da professora: reais, com luz natural, em `.en-foto` (borda branca, fita adesiva, legenda à mão) ou recortadas sobre uma `.en-forma`. Evite banco de imagens.
- Não existe logotipo: o nome é escrito em Fredoka 600.

## Celular primeiro

- Tudo foi pensado para 360–400px de largura: grades viram uma coluna (`.en-grade`), o CTA principal vira `.en-btn--bloco`, balões ocupam até 100% da largura.
- Alvos de toque de no mínimo 44px (`.en-btn--pequeno` é o menor botão); campos com fonte de 17px para o iPhone não dar zoom.
- Adesivos e selos posicionados sobre outros elementos devem ficar dentro da tela: confira as bordas no celular.

## Como usar

Carregue as fontes do Google Fonts (Fredoka 400–700, Figtree 400–800, Caveat 500–700), depois `tokens.css` e `components/bundle.css`. Os componentes são HTML + CSS puro, com classes de prefixo `en-` (`en-btn`, `en-bulle`, `en-card`…), e funcionam em qualquer stack. Cada componente tem uma prévia e um guia com as classes e o HTML esperado.
