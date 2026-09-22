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

## No ar

**https://juanpsp.github.io/projeto-gio/** — GitHub Pages, servindo a branch
`main` a partir da raiz. Cada `git push` republica sozinho em 1–2 minutos.
(O repositório se chamava `teacher-gio`; o link antigo não funciona mais.)

> ⚠️ **Ainda não é o lançamento.** O conteúdo provisório está no ar, e o
> repositório é **público** (GitHub Pages em conta gratuita exige isso) — a foto
> dela e os textos com `[a confirmar]` estão visíveis para quem tiver o link.
>
> Por isso a página leva `<meta name="robots" content="noindex, nofollow">`:
> o Google não indexa essa versão. **Apagar essa linha** quando o conteúdo real
> entrar e a página for pro ar de verdade.

## Rodar

```bash
node "$TMP/servidor.js"
```

Ou qualquer servidor estático na raiz do projeto. Abrir direto o `index.html`
pelo `file://` também funciona, mas as fontes do Google só carregam com internet.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | A página inteira: as 12 seções, mais o quadro do Sena (3b) e o "Você sabia?" (11b) |
| `css/pagina.css` | Layout da página + movimento + marcação de conteúdo provisório |
| `js/animacoes.js` | Todo o movimento. **A configuração fica no topo do arquivo.** |
| `img/` | Fotos. `gio-recorte.*` (fundo removido), `gio-retrato.*` (sem uso desde que o hero B saiu), `gio-selfie-esboco.*` (a Gio em grafite no quadro — **provisória**, sai quando chegar a ilustração definitiva) |
| `ferramentas/cena-sena.js` | Gera o desenho do quadro (Sena, Torre, Louvre, Arco) e injeta no `index.html`. Mudou o desenho? `node ferramentas/cena-sena.js` |
| `ensemble-design-system/` | O design system. **Não editar a partir da landing.** |

A landing carrega os CSS do sistema por caminho relativo, então o sistema
continua sendo a fonte da verdade: corrigiu um componente lá, a página pega.

## O que falta para publicar

### 1. O número do WhatsApp

Em `js/animacoes.js`, no topo:

```js
var CONFIG = {
  whatsapp: '',   // ex.: '5511999999999' — DDI + DDD + número, só dígitos
  mensagem: 'Oi Gio! Vi seu site e quero saber mais sobre as aulas de francês.',
  instagram: ''   // ex.: 'gio.frances' — só o usuário, sem o @
};
```

Enquanto estiver vazio, todos os botões rolam até a seção de contato.
Preenchido, os 9 botões viram link de WhatsApp de uma vez.

O `instagram` liga o ícone da barra de topo e o link do rodapé (que passa a
mostrar o @). Vazio, os dois apontam pra página inicial do Instagram e o
rodapé mostra `[Instagram]` marcado como pendente.

### 2. O conteúdo real

Tudo que só a Gio pode confirmar está marcado em amarelo com **A CONFIRMAR**,
e os blocos inteiros que dependem de dado real têm contorno vermelho tracejado.
A marcação some sozinha de cada trecho quando o conteúdo real entra no lugar.

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

### 3. Tirar o noindex

O painel de revisão já saiu (e com ele a versão B do hero — ficou a A, a da
boina). Falta, antes de publicar de verdade, remover o `<meta name="robots">`
do `<head>` (senão a página nunca aparece no Google) e, com todo o conteúdo
real no lugar, o bloco `MARCAÇÃO DE CONTEÚDO PROVISÓRIO` do `css/pagina.css`.

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

Sem JS o salto é seco — e aí o `scroll-margin-top: 76px` do CSS é que desconta
a barra fixa.

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
a foto assoma no rodapé da tela e termina com a cabeça a ~35% da altura.

### A página anima sempre

O JS põe a classe `.movimento` no `<html>` e, sem JS, nenhuma regra de
movimento existe e a página já nasce montada.

**Decisão do projeto:** a página **não** obedece ao pedido de "menos movimento"
do sistema (`prefers-reduced-motion`). No Windows, basta *Configurações →
Acessibilidade → Efeitos visuais → Efeitos de animação* estar desligado pra o
navegador pedir isso a todos os sites — e aí a boina, o quadro e a rota dos
países ficariam parados. Isso contraria a regra 7 do Ensemble, de propósito.

Para voltar a respeitar o pedido: no topo do `js/animacoes.js`, trocar
`var menosMovimento = false` por
`window.matchMedia('(prefers-reduced-motion: reduce)').matches`, e apagar o
bloco "Anima sempre" do `css/pagina.css` (ele religa transições que o Ensemble
desliga nesse caso).

## As fotos

`img/lp-gio-foto-perfil-01.png` é o original (1448×1086, fundo branco). Dele saíram:

- `gio-recorte.webp` / `.png` — fundo removido por flood fill a partir das bordas,
  com suavização de borda e descontaminação do branco no cabelo. Usado no hero A,
  com uma máscara CSS que dissolve o corte reto dos ombros.
- `gio-retrato.webp` / `.jpg` — recorte 4:5 do original, era da polaroid do hero B
  (que saiu junto com o painel de revisão); hoje não é usado pela página.

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
