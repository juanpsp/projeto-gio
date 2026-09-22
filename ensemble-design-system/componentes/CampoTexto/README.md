# Campo de texto

Campos de formulário grandes, legíveis e simpáticos, com rótulo sempre visível.

- `.en-campo` > `label.en-campo__rotulo` + `.en-input` (em `input`, `textarea` ou `select`) + `.en-campo__ajuda` ou `.en-campo__erro`.
- Estados: repouso (borda `trait`), hover, foco (borda `bleu` + `anel-foco`), erro (`.en-campo--erro` ou `aria-invalid="true"`, borda `rouge-action`), desativado.
- Fonte de 17px nos campos: impede o zoom automático do iPhone.
- O rótulo pode ter uma nota em Caveat: "Comment tu t'appelles? (seu nome)".
- Mensagens de erro são gentis e dizem o que fazer: "Opa, parece que faltou um número. Confere pra mim?". Nunca "Campo inválido".
- Botão de envio: `.en-btn--primario` com "Envoyer!" ou "Quero começar".
