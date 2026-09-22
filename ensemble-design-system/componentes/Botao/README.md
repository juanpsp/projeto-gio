# Botão

Pílula com um "degrau" embaixo que afunda quando você aperta; é a ação principal de cada bloco.

**Variantes:** `.en-btn--primario` (vermelho, a ação mais importante da tela, no máximo uma por bloco), `.en-btn--secundario` (azul), `.en-btn--contorno` (traço `encre`, ações de apoio) e `.en-btn--claro` (branco, sobre fundos azuis).
**Estados:** hover levanta 2px; pressionado afunda 4px e escurece; foco de teclado ganha o `anel-foco`. As classes `.is-hover`, `.is-pressed` e `.is-focus` existem só para documentação.
**Tamanhos:** `.en-btn--grande` (60px, topo da página), padrão (52px), `.en-btn--pequeno` (44px, o mínimo para toque). `.en-btn--bloco` ocupa a largura toda: use no celular para o CTA principal.
**Com ícone:** coloque o SVG antes do texto; para a seta que "anda" no hover, use a classe `en-btn__seta` no ícone depois do texto. Botão só com ícone: `.en-btn--icone` + `aria-label`.

```html
<a class="en-btn en-btn--primario" href="#contato">C'est parti! <svg class="en-icone en-btn__seta">…</svg></a>
<button class="en-btn en-btn--contorno">Ver formatos</button>
```

**Microtextos:** verbo primeiro, curto, com no máximo uma pitada de francês: "C'est parti!", "Quero começar", "Marcar conversa", "Ver formatos", "Mandar mensagem", "Envoyer!". Evite "Clique aqui", "Saiba mais" e urgência falsa ("Últimas vagas!").
