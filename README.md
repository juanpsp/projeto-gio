# Landing — Gio, professora de francês

Página única em HTML + CSS + JS puro, construída sobre o design system
**Ensemble** (`ensemble-design-system/`). Sem build, sem dependência: é só abrir.

## Premissas do produto

- **Só aula online, por vídeo chamada ao vivo.** Não existe presencial, não existe
  aula gravada. A página inteira diz isso: o selo "em chamada" no hero, a janela de
  chamada da seção 5, a meta dos cards e a resposta do FAQ.
- **Duas modalidades:** individual e em grupo. As duas por vídeo chamada.
- **Botão de ação em português.** O público é brasileiro procurando alguém que fale
  português; o francês fica nos balões, adesivos e no lema — nunca no botão que
  precisa ser entendido de primeira.

## Rodar

```bash
node "$TMP/servidor.js"
```

Ou qualquer servidor estático na raiz do projeto. Abrir direto o `index.html`
pelo `file://` também funciona, mas as fontes do Google só carregam com internet.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | A página inteira, as 12 seções |
| `css/pagina.css` | Layout da página + movimento + marcação de conteúdo provisório |
| `js/animacoes.js` | Todo o movimento. **A configuração fica no topo do arquivo.** |
| `img/` | Fotos. `gio-recorte.*` (fundo removido), `gio-retrato.*` (polaroid) |
| `ensemble-design-system/` | O design system. **Não editar a partir da landing.** |

A landing carrega os CSS do sistema por caminho relativo, então o sistema
continua sendo a fonte da verdade: corrigiu um componente lá, a página pega.

## O que falta para publicar

### 1. O número do WhatsApp

Em `js/animacoes.js`, no topo:

```js
var CONFIG = {
  whatsapp: '',   // ex.: '5511999999999' — DDI + DDD + número, só dígitos
  mensagem: 'Oi Gio! Vi seu site e quero saber mais sobre as aulas de francês.'
};
```

Enquanto estiver vazio, todos os botões rolam até a seção de contato.
Preenchido, os 9 botões viram link de WhatsApp de uma vez.

### 2. O conteúdo real

Tudo que só a Gio pode confirmar está marcado em amarelo com **A CONFIRMAR**,
e os blocos inteiros que dependem de dado real têm contorno vermelho tracejado.
O painel no canto inferior esquerdo liga e desliga essa marcação.

Falta, por seção:

- **2 · Apresentação** — idade, cidade, curso/faculdade, anos dando aula, nível atual, **foto 2**
- **3 · História** — os 5 marcos do caderno (começo, trajetória, formação, primeira aula, hoje)
- **4 · Números** — anos de aula, alunos atendidos, aulas dadas, alunos ativos
- **5 · Aulas** — acompanhamento entre aulas, frequência e duração
- **6 · Para quem** — até qual nível ela atende, se faz DELF/DALF
- **7 · Modalidades** — duração, frequência, tamanho da turma, aula experimental
- **8 · Diferenciais** — experiência profissional (escolas, cursos)
- **9 · Depoimentos** — 3 depoimentos reais + prints, **com autorização por escrito**
- **10 · Formação** — faculdade, certificações, proficiência, cursos, experiência
- **11 · FAQ** — plataforma da chamada, preço/tamanho da turma, duração, nível, experimental, pagamento
- **12 · CTA** — Instagram / e-mail, nome completo no rodapé

> O `CLAUDE.md` do design system é explícito: número, depoimento, nome e foto
> de aluno **não podem ser inventados**. Por isso nada foi preenchido no chute.

### 3. Tirar o painel de revisão

Antes de publicar, remover do `index.html`:

- o bloco `<aside class="painel" id="painel">`
- o bloco `/* Painel provisório */` no fim do `css/pagina.css`
- o bloco `7. Painel provisório de revisão` no `js/animacoes.js`
- o bloco `MARCAÇÃO DE CONTEÚDO PROVISÓRIO` no `css/pagina.css`
- o `:not(.testar-movimento)` do bloco `prefers-reduced-motion` no `css/pagina.css`

E escolher uma das duas versões de hero, apagando a outra (`#hero-a` ou `#hero-b`).

## O movimento

Tudo em `js/animacoes.js`, sem biblioteca:

| O quê | Onde |
| --- | --- |
| Entrada ao rolar | `[data-anima]` — 12px, 500ms. `data-anima="lado"`, `"lado-dir"`, `"pop"` mudam a direção. `--atraso:N` escalona |
| Mensagens chegando uma a uma | `.conversa-anima` — pontinhos de "digitando", depois a mensagem. Tempo varia com o tamanho do texto |
| Balões respirando | `.flutua` — `--rot` e `--atraso-f` dão o ângulo e o delay |
| Rabisco se desenhando | `.rabisco` — `stroke-dashoffset` nos `<path pathLength="1">` |
| Números contando | `[data-numero="123"]` |
| Parallax | `[data-parallax] data-p="0.05"` — positivo desce, negativo sobe |
| Rolagem entre seções | qualquer `a[href^="#"]` — ver abaixo |
| **A boina caindo** | `.boina` no hero A — ver abaixo |

### Rolagem entre seções

Clicar em "Ver como funciona" (ou em qualquer link do menu) faz a página
**descer rolando** até a seção, em vez de teleportar. Duração sublinear
(`√distância × 22`, entre 500ms e 1,6s), com aceleração e desaceleração, e a
pessoa interrompe a qualquer momento girando a rodinha, tocando a tela ou
apertando uma tecla.

É feito em JS, não com `scroll-behavior: smooth`, por dois motivos: o navegador
**ignora** `scroll-behavior` quando o sistema está com "reduzir movimento"
ligado (então não dá nem pra testar), e assim dá pra controlar a duração.

Três detalhes que custaram a achar e é bom não desfazer:

- **O destino é recalculado a cada quadro.** A página muda de altura no meio do
  caminho — fonte do Google entrando, imagem carregando — e com o alvo fixo a
  rolagem erra o ponto por dezenas de pixels.
- **A barra do topo é `position: sticky`.** Enquanto está grudada, tanto o
  `getBoundingClientRect()` quanto o `offsetTop` dela devolvem a posição colada,
  não a de origem. Por isso `posicaoDe()` trata `sticky`/`fixed` como "topo da
  página" — é o que o link do nome da marca quer dizer.
- **A conversa trava a própria altura enquanto roda.** Cada balão de "digitando"
  entra e sai do fluxo, empurrando tudo abaixo. A trava é solta no fim, porque é
  medida em px e não sobreviveria a um giro de tela.

Com movimento reduzido o salto continua seco, que é o correto — e aí o
`scroll-margin-top: 76px` do CSS é que desconta a barra fixa.

### A boina

SVG desenhado no estilo do sistema (`rouge` + `rouge-fonce`, contorno `encre` 3,2px).
Cai do céu conforme a rolagem, girando e balançando, e pousa na cabeça dela com
uma mola de amassa-e-volta. É reversível: rolando pra cima, ela sobe junto.

A posição foi medida no recorte, não chutada:

| Medida | Valor |
| --- | --- |
| Topo do crânio | 1,5% da altura |
| Centro da cabeça | 46% da largura |
| Largura do crânio | 25,9% da largura |

Daí saem o `left: 46%` e o `width: 37%` do `.boina` no `css/pagina.css`.
**Se a foto do hero trocar, essas três medidas precisam ser refeitas.** O script que
as calcula está em `img/_medir-cabeca.js` — ele lê o canal alpha do recorte e
imprime os valores. Precisa do `sharp` (`npm i sharp` numa pasta qualquer):

```bash
node img/_medir-cabeca.js
```

A queda é comandada pela rolagem em `js/animacoes.js` (bloco `6b`): começa quando
a foto assoma no rodapé da tela e termina com a cabeça a ~35% da altura. Com
movimento reduzido, a boina já aparece pousada, parada. No hero B (polaroid) ela
não existe.

**Movimento reduzido:** o JS só põe a classe `.movimento` no `<html>` quando o
visitante aceita animação. Sem JS ou com `prefers-reduced-motion: reduce`,
nenhuma regra de movimento existe e a página já nasce montada — não é um
"desligar depois", é não ligar.

### "As animações não estão funcionando"

Quase sempre é isso: **o navegador está com movimento reduzido**. O painel de
preview do app Claude força `prefers-reduced-motion: reduce`, então nele a boina
já nasce pousada, as mensagens aparecem todas juntas e nada se mexe. Não é
defeito — é o caminho de acessibilidade fazendo o que deve.

Para ver o movimento: o botão **Movimento · forçar** no painel de revisão
(a escolha fica guardada entre recarregamentos) ou `?movimento=1` na URL.
Quando o navegador está com movimento reduzido, o painel abre sozinho com um
aviso explicando isso.

No Chrome normal do Windows isso depende de *Configurações → Acessibilidade →
Efeitos visuais → Efeitos de animação*. Com esse botão ligado, as animações
rodam sem precisar forçar nada.

## As fotos

`img/lp-gio-foto-perfil-01.png` é o original (1448×1086, fundo branco). Dele saíram:

- `gio-recorte.webp` / `.png` — fundo removido por flood fill a partir das bordas,
  com suavização de borda e descontaminação do branco no cabelo. Usado no hero A,
  com uma máscara CSS que dissolve o corte reto dos ombros.
- `gio-retrato.webp` / `.jpg` — recorte 4:5 do original, para a polaroid do hero B.

Para trocar a foto depois, o script que fez o recorte está no scratchpad da
sessão; qualquer ferramenta de remoção de fundo serve, desde que saia PNG/WebP
com alpha.

## Regras do Ensemble que a página respeita

- Um único bloco inteiro em `bleu`: o CTA final (seção 12). Os outros destaques são `ciel` e `beurre`.
- `rouge` só em decoração e texto grande; botão primário e texto pequeno em `rouge-action`.
- Caveat no máximo 2 vezes por tela, nunca em parágrafo, botão ou campo.
- Um rabisco por título, três por tela.
- Nenhum emoji na interface.
- Testado em 375px, sem rolagem horizontal. Alvo de toque ≥44px, campo 17px.
- Foco de teclado visível em tudo que é interativo.
