# Balão de fala

O elemento mais característico da marca: fala da professora, do aluno, destaques e diálogos.

**Formatos:** padrão (fala), `--pensamento` (bolinhas, para dúvidas e "hmm…"), `--cochicho` (borda tracejada, para dicas e segredinhos), `--grande` (Fredoka grande, para exclamações e destaques), `--carimbo` (sombra chapada, para chamar atenção) e `--sem-ponta`.
**Cores:** padrão `blanc`, `--ciel`, `--rose`, `--beurre`, `--bleu`, `--rouge` (usa `rouge-action`, texto branco).
**Ponta:** padrão embaixo à esquerda; `--bas-droite`, `--haut-gauche`, `--haut-droite`, `--gauche`, `--droite`. Ajuste a posição com as variáveis `--cauda-x` (ao longo da borda de baixo/cima) e `--cauda-y` (nas laterais).
**Partes:** `.en-bulle__titulo` (linha em Fredoka) e `.en-bulle__assinatura` (nome em Caveat).

```html
<div class="en-bulle en-bulle--ciel en-bulle--gauche">Vamos lá: como você se apresentaria?</div>
<div class="en-bulle en-bulle--rose en-bulle--droite">Je m'appelle… hum…</div>
```

- Convenção de cor em diálogos: professora em `ciel` com ponta à esquerda; aluno em `rose` com ponta à direita.
- O balão reserva espaço para a ponta com margem; em grids, deixe `gap` suficiente.
- Até ~25 palavras por balão. Mais que isso vira card.

**Microtextos:** "Bonjour! Tudo bem por aí?", "Oh là là, você acertou!", "psiu: ninguém nasce sabendo o *subjonctif*", "Errou? Ótimo. Agora a gente sabe o que treinar.", "On apprend ensemble."
