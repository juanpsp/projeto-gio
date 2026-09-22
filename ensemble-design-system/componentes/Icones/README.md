# Ícones

22 ícones de traço 2px com cantos redondos numa grade de 24px, incluindo croissant, boina, Torre Eiffel, baguete e café.

- Inline: `<svg class="en-icone" viewBox="0 0 24 24">…</svg>`, que herda a cor do texto (`currentColor`). Tamanhos `--sm` (20px), padrão (24px), `--lg` (32px).
- Os arquivos em `assets/Icones/` têm tinta fixa `encre` (#1b2545) para uso em `<img>`.
- `.en-icone-circulo` (tons padrão ciel/bleu, `--rose`, `--beurre`) para ícones em cards.
- As referências francesas (croissant, boina, torre, baguete, café) são tempero: no máximo uma ou duas por seção e nunca todas juntas, para não virar cartão-postal. Para funções da interface (relógio, calendário, check, seta) use os ícones neutros.
- Ícone sozinho precisa de `aria-label`; ao lado de texto, `aria-hidden="true"`.
