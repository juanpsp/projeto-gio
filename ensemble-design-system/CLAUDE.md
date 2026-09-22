# Ensemble — design system (instruções para o Claude Code)

Identidade de uma professora de francês que já esteve no lugar do aluno: começou do zero, sabe o caminho e continua estudando todo dia. A ideia central é **on apprend ensemble**: ela está do mesmo lado do aluno, sabe onde o francês trava, ensina a aprender e deixa o aprendizado leve. Acolhedor e descontraído, **nunca infantil, bagunçado ou apelativo**.

Ao construir qualquer tela, página ou componente deste projeto, **use este sistema em vez de inventar estilos**. Só crie algo novo se nada aqui servir, e então siga os tokens e o mesmo jeito de desenhar (contorno `encre` de 2px, cantos redondos, sombra chapada).

## Como carregar

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500..700&family=Figtree:ital,wght@0,400..800;1,400..700&family=Fredoka:wght@400..700&display=swap">
<link rel="stylesheet" href="css/tokens.css">    <!-- variáveis CSS -->
<link rel="stylesheet" href="css/ensemble.css">  <!-- componentes .en-* -->
```

Nesta ordem, sempre. É CSS puro: funciona em HTML estático, React, Vue, Astro, Next, o que for. Em React, use as mesmas classes (`className="en-btn en-btn--primario"`).

## Estrutura

| Caminho | O que é |
| --- | --- |
| `README.md` | O brand book: tom de voz, cores, tipografia, decoração, celular. **Leia antes de escrever qualquer texto ou tela.** |
| `tom-de-voz.md` | Microtextos prontos por componente e a lista do que evitar. |
| `css/tokens.css` | Todas as variáveis CSS (`--papier`, `--encre`, `--espaco-5`, `--raio-lg`…). |
| `css/ensemble.css` | Todos os componentes, com prefixo `en-`. |
| `tokens/tokens.json` | A fonte dos tokens, com nota de uso em cada um. Útil para gerar tema de Tailwind, JS, etc. |
| `componentes/<Nome>/README.md` | Guia do componente: variantes, estados, o que o consumidor fornece, microtextos. |
| `componentes/<Nome>/exemplo.html` | HTML real do componente com todas as variações. **Copie daqui em vez de escrever do zero.** |
| `assets/icones/` | 22 ícones SVG 24×24, traço 2px. |
| `assets/ilustracoes/` | 4 ilustrações com humor (croissant piscando, Torre Eiffel de boina, balão "travei", caderno francês). |
| `assets/rabiscos/` | Sublinhados, círculo, setas, brilhos, formas, divisores, fita adesiva. |
| `vitrine.html` | Página local com tudo junto (abra com `python3 -m http.server`). |
| `template-base.html` | Esqueleto de página já com fontes e CSS ligados. |

## Regras inegociáveis

1. **Cores só dos tokens.** Fundo `papier`; superfícies `blanc`; texto `encre` e `encre-douce`. Azul e vermelho são detalhe: ~70% claros, ~20% `encre`+`bleu`, ~10% `rouge`+`beurre`. Nunca invente cor nova nem gradiente.
2. **`rouge` (#EF4135) nunca em texto pequeno** e nunca como fundo de texto pequeno: ele só passa no contraste a partir de 24px. Botão primário, texto de erro e texto vermelho pequeno usam `rouge-action`; sobre `rose`, use `rouge-fonce`.
3. **Um bloco inteiro em `bleu` por página** (o CTA final). A página não pode parecer uma bandeira.
4. **Fontes:** Fredoka (títulos, botões, números), Figtree (texto, corpo 17px), Caveat (anotações à mão). Caveat no máximo 1–2 vezes por tela, até ~8 palavras, nunca em parágrafo, botão ou campo.
5. **Rabiscos apontam ou destacam algo:** um por título, três por tela no máximo. Referências francesas em doses pequenas (uma ou duas por seção) e com humor: sem foto de Paris, sem acordeão, sem fonte "romântica".
6. **Celular primeiro:** testar em 375px. Alvo de toque ≥44px, fonte de campo 17px (evita zoom no iPhone), CTA principal com `.en-btn--bloco`, `.en-grade` para grades que viram uma coluna.
7. **Acessibilidade:** foco de teclado sempre visível (`--anel-foco`, já embutido nos componentes), contraste mínimo 4.5:1 em texto, `aria-label` em botão só com ícone, `aria-hidden="true"` em ícone decorativo. Tudo que anima respeita `prefers-reduced-motion`.
8. **Sem emoji na interface** — use os ícones e as ilustrações.

## Componentes (classe base → variantes)

| Componente | Classe | Variantes principais |
| --- | --- | --- |
| Botão | `.en-btn` | `--primario` `--secundario` `--contorno` `--claro` · `--grande` `--pequeno` `--bloco` `--icone` |
| Link | `.en-link` | `--seta` `--inverso` |
| Balão de fala | `.en-bulle` | formato: `--pensamento` `--cochicho` `--grande` `--carimbo` `--sem-ponta` · cor: `--ciel` `--rose` `--beurre` `--bleu` `--rouge` · ponta: `--bas-droite` `--haut-gauche` `--haut-droite` `--gauche` `--droite` |
| Conversa (chat) | `.en-dialogo` + `.en-msg` | `--ela` `--voce` `--digitando` |
| Card | `.en-card` | `--depoimento` `--info` `--numero` `--formato` · `--carimbo` `--ciel` `--beurre` `--rose` |
| Etiqueta | `.en-tag` | `--rouge` `--beurre` `--neutra` `--contorno` `--solida` `--ponto` |
| Selo | `.en-selo`, `.en-selo-giratorio` | `--rouge` `--bleu` `--grande` |
| Adesivo | `.en-adesivo` | `--rouge` `--bleu` `--blanc` `--ciel` · `--dir` `--reto` `--titulo` |
| Bloco de destaque | `.en-destaque` | `--beurre` `--ciel` |
| Dica / erro comum | `.en-dica` | `--erro` `--info` `--reta` |
| Citação | `.en-citacao` | `--centro` |
| Campos | `.en-campo` + `.en-input` | `.en-campo--erro`, `.en-escolhas`/`.en-escolha`, `.en-check` |
| Decoração | `.en-sublinhado` `.en-circulado` `.en-marca-texto` `.en-anotacao` `.en-fita` `.en-foto` `.en-forma` `.en-fundo-caderno` `.en-divisor` | ver `componentes/Rabiscos`, `FormasEFundos`, `Divisores` |
| Tipografia | `.en-display` `.en-h1` `.en-h2` `.en-h3` `.en-rotulo` `.en-lead` `.en-texto` `.en-pequeno` `.en-legenda` `.en-nota` | `.en-numero`, `.en-nota--grande` |
| Layout | `.en-grade` `.en-linha` | grade que vira uma coluna no celular |

Antes de usar um componente, leia `componentes/<Nome>/README.md` e copie o HTML de `componentes/<Nome>/exemplo.html`.

## Ícones

Inline, herdando a cor do texto:

```html
<svg class="en-icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><!-- paths de assets/icones/<nome>.svg --></svg>
```

Tamanhos: `--sm` 20px, padrão 24px, `--lg` 32px. Em card, use `.en-icone-circulo`. Os arquivos em `assets/icones/` têm a tinta fixa `encre` para uso direto em `<img>`.

## Textos

Siga o tom de voz do `README.md` e pegue frases em `tom-de-voz.md`: curto, próximo, com uma pitada de francês por bloco ("Bonjour!", "C'est parti!", "Oh là là", "On apprend ensemble"), erro do aluno sempre tratado como parte do caminho, a professora sempre com a segurança de quem já fez o caminho (nunca errando, em dúvida ou se desculpando por ainda estudar — ver "A narrativa" no `README.md`), zero pressão de venda ("últimas vagas!", "método revolucionário" estão proibidos).

## Atenção ao conteúdo de exemplo

Números (anos de aula, alunos), depoimentos, nomes, formatos e durações nos exemplos são **fictícios**, só para mostrar os componentes. Ao montar a página de verdade, peça os dados reais e nunca publique depoimento inventado.
