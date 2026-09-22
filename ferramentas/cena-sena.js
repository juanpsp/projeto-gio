/* ==========================================================================
   Quadro da viagem — o Sena desenhado a lápis
   Gera o cenário em camadas SVG e injeta no index.html, entre
   <!-- sena:inicio --> e <!-- sena:fim -->.

     node ferramentas/cena-sena.js

   A câmera está numa ponte, olhando rio abaixo (perspectiva de um ponto).
   O cenário base é só o rio; a Torre Eiffel, o Louvre e o Arco do Triunfo
   são desenhados à parte, cada um no seu <g class="monumento">, e a
   rolagem vai passando o lápis neles um por um (js/animacoes.js, bloco 6c).

   Tudo é traço em currentColor (a página pinta de encre). O desenho sai
   igual a cada geração: a "sorte" tem semente fixa.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

// O quadro é 4:3 no desktop. No celular ele vira 1:1 e mostra só a faixa
// x 150–1050: tudo que importa (monumentos, ponte, barco) mora nela.
const W = 1200, H = 900;
const FX = 560, FY = 560;          // ponto de fuga (altura do olho)

/* ───────── sorte com semente ───────── */
let semente = 1789;
function sorte() {
  semente ^= semente << 13; semente >>>= 0;
  semente ^= semente >>> 17;
  semente ^= semente << 5;  semente >>>= 0;
  return semente / 4294967296;
}
const r = (a, b) => a + (b - a) * sorte();
const n = v => Math.round(v * 10) / 10;

/* ───────── perspectiva ─────────
   z = distância (1 ≈ 40 m). X = afastamento lateral e A = altura em
   relação ao olho, ambos em px vistos a z = 1 (25 px = 1 m).
   A positivo fica ABAIXO do olho. */
const px = (z, X) => FX + X / z;
const py = (z, A) => FY + A / z;

const ALT = { agua: 300, rua: 125, cornija: -330 };
const LAT = { cais: 1000, arvore: 1150, poste: 1030, fachada: 1500 };

/* ───────── traço a lápis ───────── */

// Reta com leve barriga, pontas que passam um pouco do alvo e tremor.
function linha(x1, y1, x2, y2, o = {}) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const j = o.j ?? 0.35;
  if (L < 3) return `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
  const ov = o.ov ?? Math.min(2.4, L * 0.05);
  const a = r(-0.2, 1) * ov, b = r(-0.2, 1) * ov;
  const sx = x1 - ux * a + r(-j, j), sy = y1 - uy * a + r(-j, j);
  const ex = x2 + ux * b + r(-j, j), ey = y2 + uy * b + r(-j, j);
  const bow = (o.bow ?? 0.012) * L * r(-1, 1);
  const mx = (sx + ex) / 2 - uy * bow, my = (sy + ey) / 2 + ux * bow;
  return `M${n(sx)} ${n(sy)}Q${n(mx)} ${n(my)} ${n(ex)} ${n(ey)}`;
}

// Mesma reta passada duas vezes, como quem reforça o traço.
function linha2(x1, y1, x2, y2, o = {}) {
  return linha(x1, y1, x2, y2, o) + linha(x1, y1 + r(-0.6, 0.6), x2, y2 + r(-0.6, 0.6), { ...o, ov: (o.ov ?? 2) * 1.4 });
}
const primeiro = d => 'M' + d.split('M').filter(Boolean)[0];

// Curva suave pelos pontos (Catmull-Rom), com tremor.
function curva(pts, o = {}) {
  const j = o.j ?? 0.4;
  const p = pts.map(([x, y]) => [x + r(-j, j), y + r(-j, j)]);
  let d = `M${n(p[0][0])} ${n(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ` +
         `${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}

// Quadrilátero fechado (janela), tremido.
function quad(p, j = 0.22) {
  const q = p.map(([x, y]) => [x + r(-j, j), y + r(-j, j)]);
  return `M${q.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;
}
const poligono = p => `M${p.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;

// Hachura: paralelas recortadas dentro de um polígono qualquer.
function hachura(poli, ang, esp, o = {}) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const rot = poli.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
  const ys = rot.map(p => p[1]);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  let d = '';
  for (let yy = y0 + esp * r(0.3, 0.8); yy < y1; yy += esp * r(0.8, 1.2)) {
    const xs = [];
    for (let i = 0; i < rot.length; i++) {
      const [ax, ay] = rot[i], [bx, by] = rot[(i + 1) % rot.length];
      if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + (yy - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      if (o.falha && sorte() < o.falha) continue;
      let xa = xs[k], xb = xs[k + 1];
      const folga = (xb - xa) * (o.folga ?? 0.1);
      xa += r(0, folga); xb -= r(0, folga);
      if (xb - xa < 1.2) continue;
      d += linha(xa * ca - yy * sa, xa * sa + yy * ca, xb * ca - yy * sa, xb * sa + yy * ca,
                 { ov: 0.5, j: 0.2, bow: 0.02 });
    }
  }
  return d;
}

// Rabisco de copa de árvore: laçadas que giram em volta do centro.
function copa(cx, cy, rx, ry, o = {}) {
  const voltas = o.voltas ?? 2.4;
  const N = Math.max(26, Math.round((rx + ry) * voltas * 0.9));
  const fase = r(0, Math.PI * 2), laco = o.laco ?? 0.2;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = fase + t * Math.PI * 2 * voltas;
    const rr = 0.35 + 0.65 * Math.abs(Math.sin(t * Math.PI * voltas * 1.3 + fase));
    const q = i * 2.3;
    pts.push([
      cx + Math.cos(th) * rx * rr + Math.cos(q) * rx * laco,
      cy + Math.sin(th) * ry * rr + Math.sin(q) * ry * laco * 0.9,
    ]);
  }
  return curva(pts, { j: Math.max(0.25, rx * 0.03) });
}

// Bolha lisa (preenchida de papel) para a copa tapar o que está atrás.
function bolha(cx, cy, rx, ry) {
  const pts = [];
  for (let i = 0; i < 14; i++) {
    const th = (i / 14) * Math.PI * 2, k = 0.9 + 0.12 * Math.sin(i * 2.7);
    pts.push([cx + Math.cos(th) * rx * k, cy + Math.sin(th) * ry * k]);
  }
  pts.push(pts[0], pts[1]);
  return curva(pts, { j: 0 }) + 'Z';
}

/* ───────── camadas e folhas ─────────
   Cada camada é um <svg>. Dentro, o desenho vai em FOLHAS, na ordem de
   quem está mais longe pra quem está mais perto: cada folha começa com o
   papel que tapa o que ficou atrás (prédio, copa, ponte, barco) e depois
   os traços dela. Os traços de uma folha são juntados por estilo
   (espessura + tom de grafite) num único <path>, pra página ficar leve.
   Os marcados com `desenha` saem avulsos: são os contornos que o lápis
   passa na entrada. */
function camada(nome) {
  const c = { nome, folhas: [] };
  folha(c);
  return c;
}
function folha(c) { c.folhas.push({ estilos: new Map(), desenhos: [], fundos: [] }); }
const atual = c => c.folhas[c.folhas.length - 1];
const TOM = { forte: 0.82, medio: 0.6, leve: 0.42, sopro: 0.26 };
function poe(c, d, largura = 1.1, tom = TOM.medio) {
  if (!d) return;
  const f = atual(c), chave = `${largura}|${tom}`;
  if (!f.estilos.has(chave)) f.estilos.set(chave, []);
  f.estilos.get(chave).push(d);
}
function desenha(c, d, largura = 1.2, tom = TOM.forte) { atual(c).desenhos.push({ d, largura, tom }); }
function fundo(c, d) { atual(c).fundos.push(d); }

let contaTracos = 0;
function svgDaCamada(c, extra = '') {
  const folhas = c.folhas.map(f => {
    const papel = f.fundos.length
      ? `<path class="cena__papel" d="${f.fundos.join('')}" fill="#fcf8f1" stroke="none"/>` : '';
    const tracos = [...f.estilos].map(([chave, partes]) => {
      const [largura, tom] = chave.split('|');
      return `<path d="${partes.join('')}" stroke-width="${largura}" stroke-opacity="${tom}"/>`;
    }).join('');
    const desenhos = f.desenhos.map(t =>
      `<path class="cena__traco" style="--i:${contaTracos++}" pathLength="1" d="${t.d}" stroke-width="${t.largura}" stroke-opacity="${t.tom}"/>`).join('');
    if (!papel && !tracos && !desenhos) return '';
    return `${papel}<g class="cena__det">${tracos}</g>${desenhos}`;
  }).join('');
  return `<svg class="cena__camada cena__camada--${c.nome}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">` +
    `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${folhas}${extra}</g></svg>`;
}

/* ==========================================================================
   CÉU — quase vazio. Nuvens em traço solto e três pássaros.
   ========================================================================== */
const ceu = camada('ceu');
(function desenhaCeu() {
  const nuvens = [
    { x: 175, y: 128, L: 230, k: 3 },
    { x: 235, y: 156, L: 150, k: 2 },
    { x: 800, y: 92, L: 260, k: 3 },
    { x: 880, y: 120, L: 160, k: 2 },
  ];
  nuvens.forEach(nv => {
    for (let k = 0; k < nv.k; k++) {
      const y = nv.y + k * 9 + r(-2, 2), x0 = nv.x + r(-14, 14), L = nv.L * r(0.55, 1);
      const pts = [];
      for (let i = 0; i <= 8; i++) pts.push([x0 + (L * i) / 8, y + Math.sin(i * 0.9 + k) * 2.2]);
      poe(ceu, curva(pts, { j: 0.6 }), 0.9, k === 0 ? TOM.leve : TOM.sopro);
    }
  });
  [[640, 300, 7], [663, 287, 5.5], [684, 308, 4.5]].forEach(([x, y, s]) => {
    poe(ceu, curva([[x - s, y - s * 0.3], [x - s * 0.45, y - s * 0.55], [x, y]], { j: 0.2 }) +
             curva([[x, y], [x + s * 0.5, y - s * 0.6], [x + s * 1.05, y - s * 0.2]], { j: 0.2 }), 1, TOM.medio);
  });
})();

/* ==========================================================================
   MONUMENTOS — cada um num grupo próprio. Cada contorno sai avulso, com
   --a/--b dizendo em que trecho da etapa o lápis passa nele. A sombra e
   os detalhes miúdos vêm juntos num path só, que aparece no fim.
   ========================================================================== */
function monumento(nome) { return { nome, tracos: [], detalhe: [], papel: [] }; }
function contorno(m, d, a, b, largura = 1.15, tom = TOM.medio) { m.tracos.push({ d, a, b, largura, tom }); }
function svgDoMonumento(m) {
  const papel = m.papel.length ? `<path class="monumento__papel" d="${m.papel.join('')}" fill="#fcf8f1" stroke="none"/>` : '';
  const det = m.detalhe.map(t => `<path class="monumento__det" d="${t.d}" stroke-width="${t.largura}" stroke-opacity="${t.tom}"/>`).join('');
  const tr = m.tracos.map(t =>
    `<path pathLength="1" style="--a:${t.a};--b:${t.b}" d="${t.d}" stroke-width="${t.largura}" stroke-opacity="${t.tom}"/>`).join('');
  return `<g class="monumento monumento--${m.nome}">${papel}${det}${tr}</g>`;
}

// ─── Torre Eiffel: ao fundo, no fim do rio ───
const torre = monumento('torre');
(function desenhaTorre() {
  const cx = 500, base = FY + 2, alto = 372;           // topo em ~190
  const yT = t => base - alto * t;
  const larg = t => 72 * Math.exp(-3.25 * t) + 1.2;     // meia-largura
  const perfil = lado => {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const t = (i / 16) * 0.87; pts.push([cx + lado * larg(t), yT(t)]); }
    return curva(pts, { j: 0.3 });
  };
  contorno(torre, perfil(-1), 0, 0.34, 1.2, TOM.forte);
  contorno(torre, perfil(1), 0.04, 0.38, 1.2, TOM.forte);
  // o arco grande entre as pernas
  const t1 = 0.185;
  const arco = [];
  for (let i = 0; i <= 12; i++) {
    const th = Math.PI * (i / 12);
    arco.push([cx - Math.cos(th) * larg(0.02) * 0.66, base - Math.sin(th) * (base - yT(t1)) * 0.78]);
  }
  contorno(torre, curva(arco, { j: 0.2 }), 0.3, 0.48);
  // pernas por dentro, até se juntarem na 2ª plataforma
  const t2 = 0.37;
  const dentro = lado => {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * t2;
      pts.push([cx + lado * (larg(t) * (0.62 - 0.5 * (t / t2))), yT(t)]);
    }
    return curva(pts, { j: 0.2 });
  };
  contorno(torre, dentro(-1), 0.34, 0.52, 0.9);
  contorno(torre, dentro(1), 0.36, 0.54, 0.9);
  // plataformas
  [[t1, 7], [t2, 5], [0.85, 2.5]].forEach(([t, s], k) => {
    const w = larg(t) + s, y = yT(t);
    contorno(torre, linha2(cx - w, y, cx + w, y, { bow: 0.004 }), 0.46 + k * 0.06, 0.6 + k * 0.06, 1, TOM.forte);
    contorno(torre, linha(cx - w + 1, y + s * 0.9, cx + w - 1, y + s * 0.9), 0.5 + k * 0.06, 0.64 + k * 0.06, 0.8);
  });
  // topo e antena
  const yTopo = yT(0.87);
  contorno(torre, linha(cx - 3, yTopo, cx - 1.5, yT(0.95)) + linha(cx + 3, yTopo, cx + 1.5, yT(0.95)), 0.66, 0.76, 1);
  contorno(torre, linha(cx, yT(0.95), cx, yT(1.02), { ov: 0.4 }), 0.74, 0.82, 0.9);
  // treliça: X entre as bordas, de baixo pra cima
  let tr = '';
  const cruza = (tA, tB, fA, fB) => {
    for (const lado of [-1, 1]) {
      const a1 = [cx + lado * larg(tA) * fA, yT(tA)], a2 = [cx + lado * larg(tA), yT(tA)];
      const b1 = [cx + lado * larg(tB) * fB, yT(tB)], b2 = [cx + lado * larg(tB), yT(tB)];
      tr += linha(...a1, ...b2, { ov: 0.3, j: 0.15 }) + linha(...a2, ...b1, { ov: 0.3, j: 0.15 });
    }
  };
  for (let t = 0.02; t < t1 - 0.02; t += 0.045) cruza(t, t + 0.045, 0.66 - t, 0.66 - t - 0.04);
  for (let t = t1 + 0.012; t < t2 - 0.02; t += 0.04) cruza(t, t + 0.04, 0.35, 0.3);
  for (let t = t2 + 0.01; t < 0.84; t += 0.035) {
    const a = [cx - larg(t), yT(t)], b = [cx + larg(t + 0.035), yT(t + 0.035)];
    const c = [cx + larg(t), yT(t)], d = [cx - larg(t + 0.035), yT(t + 0.035)];
    tr += linha(...a, ...b, { ov: 0.2, j: 0.1 }) + linha(...c, ...d, { ov: 0.2, j: 0.1 });
  }
  torre.detalhe.push({ d: tr, largura: 0.6, tom: TOM.leve });
  // sombra do lado direito das pernas
  const sombra = [];
  for (let i = 0; i <= 8; i++) { const t = (i / 8) * t2; sombra.push([cx + larg(t), yT(t)]); }
  for (let i = 8; i >= 0; i--) { const t = (i / 8) * t2; sombra.push([cx + larg(t) * (0.8 - 0.3 * (t / t2)), yT(t)]); }
  torre.detalhe.push({ d: hachura(sombra, 1.2, 2.4, { falha: 0.2 }), largura: 0.5, tom: TOM.sopro });
})();

// ─── Louvre: o palácio na margem esquerda e a pirâmide na frente ───
const louvre = monumento('louvre');
(function desenhaLouvre() {
  // palácio: fachada comprida que foge pro fundo (mais recuada que as outras)
  const X = -2000, z0 = 3.6, z1 = 9.5;
  const base = z => py(z, ALT.rua), topo = z => py(z, -400), telhado = z => py(z, -500);
  const xa = px(z0, X), xb = px(z1, X);
  louvre.papel.push(poligono([[xa, base(z0)], [xa, telhado(z0)], [xb, telhado(z1)], [xb, base(z1)]]));
  contorno(louvre, linha(xa, topo(z0), xb, topo(z1), { bow: 0.004 }), 0, 0.3, 1.1, TOM.medio);
  contorno(louvre, linha(xa, telhado(z0) + 4, xb, telhado(z1) + 2, { bow: 0.004 }), 0.06, 0.34, 0.9, TOM.leve);
  contorno(louvre, linha(xa, base(z0), xa, telhado(z0) + 4), 0, 0.12, 1, TOM.medio);
  // pavilhão: corpo um pouco mais alto e o domo quadrado de lados curvos,
  // com a lanterninha em cima (tipo o Pavillon de l'Horloge)
  const pz0 = 4.25, pz1 = 4.85;
  const pa = px(pz0, X), pb = px(pz1, X), pw = pb - pa;
  const pt = z => py(z, -470);
  const yPt = (pt(pz0) + pt(pz1)) / 2, yDomo = yPt - pw * 0.55;
  const domo = [[pa - 2, yPt], [pa + pw * 0.08, yPt - pw * 0.3], [pa + pw * 0.24, yDomo], [pb - pw * 0.24, yDomo], [pb - pw * 0.08, yPt - pw * 0.3], [pb + 2, yPt]];
  louvre.papel.push(poligono([[pa, base(pz0)], [pa, pt(pz0)], ...domo, [pb, pt(pz1)], [pb, base(pz1)]]));
  contorno(louvre, linha(pa, base(pz0), pa, pt(pz0)) + linha(pb, base(pz1), pb, pt(pz1)), 0.08, 0.26, 1.1, TOM.medio);
  contorno(louvre, curva(domo, { j: 0.15 }), 0.14, 0.38, 1.1, TOM.medio);
  contorno(louvre, linha(pa - 2, pt(pz0), pb + 2, pt(pz1)) + linha(pa + 2, pt(pz0) + 5, pb - 2, pt(pz1) + 5), 0.18, 0.4, 0.8, TOM.leve);
  const lx = (pa + pb) / 2;
  louvre.detalhe.push({ d: quad([[lx - pw * 0.07, yDomo], [lx - pw * 0.07, yDomo - pw * 0.16], [lx + pw * 0.07, yDomo - pw * 0.16], [lx + pw * 0.07, yDomo]], 0.1) +
    linha(lx, yDomo - pw * 0.16, lx, yDomo - pw * 0.26, { ov: 0.2 }) +
    hachura([[pb - pw * 0.24, yDomo], [pb - pw * 0.08, yPt - pw * 0.3], [pb + 2, yPt], [pb - pw * 0.2, yPt]], 1.25, 2.4), largura: 0.6, tom: TOM.leve });
  // janelas do palácio (arcadas no térreo, janelas altas em cima)
  let jan = '';
  for (let z = z0 + 0.12; z < z1 - 0.12; z += 0.11) {
    if (z > pz0 - 0.05 && z < pz1 + 0.05) continue;
    const x1 = px(z, X), x2 = px(z + 0.045, X);
    if (Math.abs(x2 - x1) < 1.6) continue;
    const yb = base(z), yt = topo(z), h = yb - yt;
    jan += quad([[x1, yb - h * 0.08], [x1, yb - h * 0.34], [x2, yb - h * 0.34 + (topo(z + 0.045) - yt) * 0.3], [x2, yb - h * 0.08]]);
    if (sorte() < 0.7) jan += quad([[x1, yb - h * 0.48], [x1, yb - h * 0.8], [x2, yb - h * 0.8], [x2, yb - h * 0.48]]);
  }
  louvre.detalhe.push({ d: jan, largura: 0.6, tom: TOM.leve });
  louvre.detalhe.push({ d: linha(xa, py(z0, -220), xb, py(z1, -220), { bow: 0.004 }), largura: 0.7, tom: TOM.sopro });

  // pirâmide de vidro, vista meio de quina
  const pz = 5.6, cx = 318, yb = py(pz, ALT.rua) + 1;
  const alt = 560 / pz, meia = 820 / pz;
  const ap = [cx + meia * 0.08, yb - alt];
  const esq = [cx - meia, yb], dir = [cx + meia * 0.9, yb], meio = [cx + meia * 0.22, yb + 3];
  louvre.papel.push(poligono([esq, ap, dir, meio]));
  contorno(louvre, linha(...esq, ...ap, { bow: 0.004 }), 0.32, 0.56, 1.25, TOM.forte);
  contorno(louvre, linha(...ap, ...dir, { bow: 0.004 }), 0.38, 0.62, 1.25, TOM.forte);
  contorno(louvre, linha(...ap, ...meio, { bow: 0.004 }), 0.46, 0.68, 1, TOM.medio);
  contorno(louvre, linha(...esq, ...meio) + linha(...meio, ...dir), 0.52, 0.74, 1.1, TOM.medio);
  // a malha de vidro, nas duas faces
  let malha = '';
  const face = (A, B, C, k) => {       // A = ápice, B e C = base
    for (let i = 1; i < k; i++) {
      const t = i / k;
      malha += linha(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t, { ov: 0.2, j: 0.12 });
      malha += linha(B[0] + (C[0] - B[0]) * t, B[1] + (C[1] - B[1]) * t, A[0] + (C[0] - A[0]) * t * 0.98, A[1] + (C[1] - A[1]) * t * 0.98, { ov: 0.2, j: 0.12 });
    }
  };
  face(ap, esq, meio, 7);
  face(ap, meio, dir, 6);
  louvre.detalhe.push({ d: malha, largura: 0.5, tom: TOM.leve });
  louvre.detalhe.push({ d: hachura([ap, meio, dir], 1.05, 2.8, { falha: 0.3 }), largura: 0.5, tom: TOM.sopro });
})();

// ─── Arco do Triunfo: lá longe, na margem direita ───
const arco = monumento('arco');
(function desenhaArco() {
  const cx = 652, base = 558, L = 118, A = 134;
  const x0 = cx - L / 2, x1 = cx + L / 2, yt = base - A;
  const corn = yt + A * 0.2, attic = yt + A * 0.06;
  arco.papel.push(poligono([[x0, base], [x0, yt], [x1, yt], [x1, base]]));
  contorno(arco, linha(x0, base, x0, yt, { bow: 0.004 }), 0, 0.26, 1.2, TOM.forte);
  contorno(arco, linha(x1, base, x1, yt, { bow: 0.004 }), 0.05, 0.3, 1.2, TOM.forte);
  contorno(arco, linha2(x0 - 2, yt, x1 + 2, yt, { bow: 0.004 }), 0.2, 0.4, 1.1, TOM.forte);
  contorno(arco, linha2(x0 - 3, corn, x1 + 3, corn, { bow: 0.004 }), 0.28, 0.48, 1, TOM.medio);
  contorno(arco, linha(x0, attic, x1, attic), 0.34, 0.52, 0.8, TOM.leve);
  // o vão central, alto e redondo em cima
  const va = cx - L * 0.2, vb = cx + L * 0.2, vTopo = base - A * 0.62, raio = (vb - va) / 2;
  const vao = [[va, base]];
  for (let i = 0; i <= 10; i++) {
    const th = Math.PI * (1 - i / 10);
    vao.push([cx + Math.cos(th) * raio, vTopo + raio - Math.sin(th) * raio]);
  }
  vao.push([vb, base]);
  contorno(arco, curva(vao, { j: 0.2 }), 0.42, 0.72, 1.15, TOM.forte);
  // impostas e a faixa dos relevos
  contorno(arco, linha(x0, vTopo + raio, va, vTopo + raio) + linha(vb, vTopo + raio, x1, vTopo + raio), 0.6, 0.8, 0.8, TOM.medio);
  let det = '';
  [[x0 + 5, va - 5], [vb + 5, x1 - 5]].forEach(([a, b]) => {
    det += quad([[a, base - A * 0.18], [a, base - A * 0.46], [b, base - A * 0.46], [b, base - A * 0.18]]);
    det += copa((a + b) / 2, base - A * 0.32, (b - a) * 0.32, A * 0.1, { voltas: 1.6, laco: 0.25 });
  });
  for (let x = x0 + 5; x < x1 - 4; x += 6) det += linha(x, attic + 2, x, corn - 2, { ov: 0.2, j: 0.1 });
  arco.detalhe.push({ d: det, largura: 0.55, tom: TOM.leve });
  arco.detalhe.push({ d: hachura(vao, 1.3, 2.2, { falha: 0.1 }), largura: 0.55, tom: TOM.medio });
  arco.detalhe.push({ d: hachura([[x1 - 7, yt], [x1, yt], [x1, base], [x1 - 7, base]], 1.1, 2.6), largura: 0.5, tom: TOM.sopro });
})();

/* ==========================================================================
   CIDADE — prédios nos dois cais, árvores, postes, bouquinistes e as pontes.
   Na margem esquerda, perto, não há prédio: ali é o espaço do Louvre.
   ========================================================================== */
const cidade = camada('cidade');

// Silhueta distante (com papel por baixo, pra esconder o pé da Torre).
(function horizonte() {
  const pts = [];
  let x = 380;
  while (x < 740) {
    const larg = r(8, 22), alt = r(4, 13) * (1 - Math.abs(x - FX) / 420);
    pts.push([x, FY - 2], [x + 1, FY - 2 - alt], [x + larg - 1, FY - 2 - alt]);
    if (sorte() < 0.35) pts.push([x + larg * 0.6, FY - 2 - alt], [x + larg * 0.6, FY - 5 - alt], [x + larg * 0.7, FY - 5 - alt], [x + larg * 0.7, FY - 2 - alt]);
    pts.push([x + larg, FY - 2]);
    x += larg + r(0, 4);
  }
  fundo(cidade, poligono([...pts, [pts[pts.length - 1][0], FY + 8], [pts[0][0], FY + 8]]));
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  pts.slice(1).forEach(([a, b]) => { d += `L${n(a + r(-0.3, 0.3))} ${n(b + r(-0.3, 0.3))}`; });
  poe(cidade, d, 0.8, TOM.sopro);
})();

// Um prédio haussmanniano numa margem (lado -1 = esquerda, +1 = direita).
function predio(lado, z0, z1, alt) {
  const X = LAT.fachada;
  const xa = px(z0, lado * X), xb = px(z1, lado * X);
  const base = z => py(z, ALT.rua);
  const topo = z => py(z, ALT.rua + (ALT.cornija - ALT.rua) * alt);
  const tom = z0 < 3 ? TOM.medio : z0 < 7 ? TOM.leve : TOM.sopro;
  const larg = z0 < 3 ? 1.1 : 0.9;

  const Xm = X + 50;
  const alturaM = 3.2 * 25;
  const topoM = z => topo(z) - alturaM / z;
  const xma = px(z0, lado * Xm), xmb = px(z1, lado * Xm);
  // papel da fachada + mansarda (tapa o que estiver atrás, como os monumentos)
  fundo(cidade, poligono([[xa, base(z0)], [xa, topo(z0)], [xma, topoM(z0)], [xmb, topoM(z1)], [xb, topo(z1)], [xb, base(z1)]]));

  poe(cidade, linha(xa, base(z0), xa, topo(z0), { bow: 0.004 }), larg, tom);
  poe(cidade, linha(xb, base(z1), xb, topo(z1), { bow: 0.004 }), larg * 0.8, tom);
  const corn = linha2(xa, topo(z0), xb, topo(z1), { bow: 0.006 });
  if (z0 < 6) desenha(cidade, primeiro(corn), larg, tom + 0.1);
  poe(cidade, corn, larg, tom);
  poe(cidade, linha(xma, topoM(z0), xmb, topoM(z1), { bow: 0.01 }), larg * 0.9, tom);
  poe(cidade, linha(xa, topo(z0), xma, topoM(z0)), larg * 0.8, tom);

  const passo = 0.0875, janela = 0.034;
  const colunas = [];
  for (let z = z0 + passo * 0.7; z + janela < z1 - passo * 0.3; z += passo) colunas.push(z);
  const larguraJanela = z => Math.abs(px(z, lado * X) - px(z + janela, lado * X));

  colunas.forEach(z => {
    if (larguraJanela(z) < 2.2 || sorte() < 0.35) return;
    const x1 = px(z, lado * Xm), x2 = px(z + janela, lado * Xm);
    const yb = topo(z) - 12 / z, yt = topoM(z) + 10 / z;
    poe(cidade, quad([[x1, yb], [x1, yt], [x2, yt], [x2, yb]]), 0.7, tom);
  });
  const nch = Math.max(1, Math.round((z1 - z0) / 0.18));
  for (let k = 0; k < nch; k++) {
    if (sorte() < 0.3) continue;
    const z = z0 + (z1 - z0) * r(0.1, 0.85), zl = z + 0.03;
    const x1 = px(z, lado * (Xm + 20)), x2 = px(zl, lado * (Xm + 20));
    const yb = topoM(z) + 2 / z, h = r(35, 60) / z;
    poe(cidade, linha(x1, yb, x1, yb - h) + linha(x1, yb - h, x2, yb - h) + linha(x2, yb, x2, yb - h), 0.8, tom);
  }

  // andares: 5 + térreo alto. Sacadas corridas no 2º e no 4º.
  const andar = (z, k) => base(z) + (topo(z) - base(z)) * (k === 0 ? 0 : (1.4 + (k - 1)) / 5.4);
  [2, 4].forEach(k => poe(cidade, linha(xa, andar(z0, k), xb, andar(z1, k), { bow: 0.004 }), 0.8, tom));
  poe(cidade, linha(xa, andar(z0, 1), xb, andar(z1, 1), { bow: 0.004 }), 0.7, TOM.sopro);

  colunas.forEach(z => {
    if (larguraJanela(z) < 1.8) return;
    const x1 = px(z, lado * X), x2 = px(z + janela, lado * X);
    for (let k = 1; k < 5; k++) {
      if (sorte() < 0.4) continue;
      const alto = (zz, kk) => andar(zz, kk);
      const y1a = alto(z, k) - (alto(z, k) - alto(z, k + 1)) * 0.2, y1b = alto(z, k + 1) + (alto(z, k) - alto(z, k + 1)) * 0.22;
      const y2a = alto(z + janela, k) - (alto(z + janela, k) - alto(z + janela, k + 1)) * 0.2;
      const y2b = alto(z + janela, k + 1) + (alto(z + janela, k) - alto(z + janela, k + 1)) * 0.22;
      const jan = [[x1, y1a], [x1, y1b], [x2, y2b], [x2, y2a]];
      poe(cidade, quad(jan), 0.7, tom);
      if (larguraJanela(z) > 4 && sorte() < 0.45) poe(cidade, hachura(jan, 1.2, 2.2, { folga: 0.05 }), 0.5, TOM.sopro);
    }
  });
}

function fileira(lado, zIni, zFim) {
  let z = zIni;
  while (z < zFim) {
    const larg = r(0.36, 0.62) * (z < 3 ? 1 : 1.25);
    predio(lado, z, Math.min(z + larg, zFim + 1), r(0.88, 1.06));
    z += larg;
  }
}

// Plátano do cais: copa em tufos (mais larga que alta), tronco que abre em galhos.
function arvore(lado, z, escala = 1) {
  const x = px(z, lado * LAT.arvore * r(0.98, 1.02));
  const yb = py(z, ALT.rua);
  const cy = py(z, ALT.rua - 300 * escala), rx = (110 / z) * escala, ry = (98 / z) * escala;
  const tom = z < 3 ? TOM.medio : z < 7 ? TOM.leve : TOM.sopro;
  const larg = z < 4 ? 0.8 : 0.7;
  const tufos = [[0, 0, 0.7, 0.75], [-0.52, 0.18, 0.5, 0.55], [0.55, 0.12, 0.52, 0.56],
                 [-0.2, -0.42, 0.52, 0.5], [0.3, -0.36, 0.45, 0.46], [-0.78, -0.05, 0.3, 0.36]];
  tufos.forEach(([dx, dy, sx, sy]) => fundo(cidade, bolha(x + dx * rx, cy + dy * ry, rx * sx, ry * sy)));
  // tronco e galhos
  const yc = cy + ry * 0.35;
  poe(cidade, linha(x - 9 / z, yb, x - 5 / z, yc, { bow: 0.04 }) + linha(x + 9 / z, yb, x + 5 / z, yc, { bow: 0.04 }), z < 4 ? 1 : 0.8, tom);
  poe(cidade, linha(x, yc + 6 / z, x - rx * 0.45, cy - ry * 0.05, { bow: 0.08 }) +
              linha(x, yc + 4 / z, x + rx * 0.4, cy - ry * 0.12, { bow: 0.08 }) +
              linha(x, yc, x + rx * 0.05, cy - ry * 0.4, { bow: 0.06 }), 0.6, tom);
  tufos.forEach(([dx, dy, sx, sy], i) =>
    poe(cidade, copa(x + dx * rx, cy + dy * ry, rx * sx * 0.9, ry * sy * 0.85, { voltas: 1.5, laco: 0.24 }), larg, i < 3 ? tom : TOM.leve));
  // sombra embaixo da copa
  poe(cidade, copa(x + rx * 0.15, cy + ry * 0.3, rx * 0.55, ry * 0.25, { voltas: 1.8, laco: 0.15 }), 0.6, tom);
}

function poste(lado, z) {
  const x = px(z, lado * LAT.poste), yb = py(z, ALT.rua), h = 150 / z;
  const tom = z < 4 ? TOM.medio : TOM.leve;
  poe(cidade, linha(x, yb, x, yb - h, { bow: 0.005 }), z < 3 ? 1 : 0.8, tom);
  const s = 6 / z;
  poe(cidade, quad([[x - s, yb - h], [x - s * 0.7, yb - h - s * 2.2], [x + s * 0.7, yb - h - s * 2.2], [x + s, yb - h]], 0.1), 0.7, tom);
  poe(cidade, linha(x - s * 0.9, yb - h - s * 2.3, x + s * 0.9, yb - h - s * 2.3), 0.7, tom);
}

function bouquiniste(lado, z0, z1) {
  const X = LAT.cais + 10;
  const x1 = px(z0, lado * X), x2 = px(z1, lado * X);
  const y1 = py(z0, ALT.rua), y2 = py(z1, ALT.rua);
  const h1 = 38 / z0, h2 = 38 / z1;
  poe(cidade, quad([[x1, y1], [x1, y1 - h1], [x2, y2 - h2], [x2, y2]]), 0.8, TOM.leve);
  poe(cidade, linha(x1, y1 - h1, x1 - lado * 4 / z0, y1 - h1 - 10 / z0) + linha(x1 - lado * 4 / z0, y1 - h1 - 10 / z0, x2 - lado * 4 / z1, y2 - h2 - 10 / z1), 0.7, TOM.leve);
}

// Ponte de pedra vista de frente: tabuleiro, parapeito, arcos, pilares.
function ponte(z, arcos, tom) {
  const xl = px(z, -LAT.fachada * 0.93), xr = px(z, LAT.fachada * 0.93);
  const wl = px(z, -LAT.cais), wr = px(z, LAT.cais);
  const yAgua = py(z, ALT.agua), yTab = py(z, ALT.rua), yPar = py(z, ALT.rua - 28);
  const larg = z < 12 ? 1 : 0.8;
  fundo(cidade, `M${n(xl)} ${n(yPar - 1)}L${n(xr)} ${n(yPar - 1)}L${n(xr)} ${n(yAgua)}L${n(xl)} ${n(yAgua)}Z`);

  const par = linha2(xl, yPar, xr, yPar, { bow: 0.002 });
  const tab = linha(xl, yTab, xr, yTab, { bow: 0.002 });
  if (z < 12) { desenha(cidade, primeiro(par), larg + 0.2, tom + 0.12); desenha(cidade, tab, larg, tom); }
  poe(cidade, par + tab, larg, tom);
  poe(cidade, linha(xl, yTab + 27 / z, xr, yTab + 27 / z, { bow: 0.002 }), 0.7, TOM.sopro);

  const vao = (wr - wl) / arcos, pil = vao * 0.14;
  const arranque = yAgua - (yAgua - yTab) * 0.3, fecho = yTab + (yAgua - yTab) * 0.28;
  for (let k = 0; k < arcos; k++) {
    const a = wl + k * vao + pil / 2, b = wl + (k + 1) * vao - pil / 2;
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const th = Math.PI * (1 - i / 10);
      pts.push([a + (b - a) * (0.5 + 0.5 * Math.cos(th)), arranque - (arranque - fecho) * Math.sin(th)]);
    }
    const arc = curva([[a, yAgua], ...pts, [b, yAgua]], { j: 0.25 });
    if (z < 12) desenha(cidade, arc, larg, tom);
    poe(cidade, arc, larg * 0.8, tom);
    if (z < 12) {
      for (let i = 1; i < 10; i += 2) {
        const [x, y] = pts[i];
        const cxA = (a + b) / 2, dx = x - cxA, dy = y - arranque, L = Math.hypot(dx, dy) || 1;
        poe(cidade, linha(x, y, x + (dx / L) * 4, y + (dy / L) * 4, { ov: 0.2 }), 0.5, TOM.sopro);
      }
      poe(cidade, hachura([[a, yAgua], ...pts, [b, yAgua]], 1.25, 2.1, { falha: 0.15 }), 0.55, TOM.leve);
    }
  }
  for (let k = 1; k < arcos; k++) {
    const c = wl + k * vao;
    poe(cidade, linha(c - pil / 2, yAgua, c - pil / 2, arranque) + linha(c + pil / 2, yAgua, c + pil / 2, arranque), 0.7, tom);
    if (z < 12) {
      const rb = pil * 0.9, hp = 60 / z, yl = yPar - rb * 0.6;
      poe(cidade, curva([[c - rb, yPar], [c - rb * 0.7, yPar - rb * 0.5], [c, yPar - rb * 0.65], [c + rb * 0.7, yPar - rb * 0.5], [c + rb, yPar]], { j: 0.1 }), 0.7, tom);
      poe(cidade, linha(c, yl, c, yl - hp) + quad([[c - 2.2, yl - hp], [c - 1.6, yl - hp - 4.5], [c + 1.6, yl - hp - 4.5], [c + 2.2, yl - hp]], 0.1), 0.6, tom);
    }
  }
  poe(cidade, linha(wl, yTab, wl, yAgua) + linha(wr, yTab, wr, yAgua), 0.7, tom);
}

(function desenhaCidade() {
  // De longe pra perto: cada folha tapa a anterior.
  fileira(-1, 19, 34); fileira(1, 19, 34);
  folha(cidade); ponte(19, 4, TOM.sopro);
  folha(cidade); fileira(-1, 15, 19); fileira(1, 9.5, 19);   // à esquerda, só depois da pirâmide
  folha(cidade); ponte(9, 3, TOM.medio);
  folha(cidade); fileira(1, 1.9, 9.5);

  // Árvores, postes e bouquinistes (sempre na frente das fachadas).
  // Na margem esquerda o trecho do meio fica aberto pra pirâmide.
  folha(cidade);
  [2.1, 2.8, 10.5].forEach(z => arvore(-1, z, r(0.95, 1.1)));
  [2.5, 3.3, 4.3, 5.4, 6.7, 8.1].forEach(z => poste(-1, z));
  [[3.6, 3.8], [4.55, 4.72], [5.7, 5.85]].forEach(([a, b]) => bouquiniste(-1, a, b));
  [5.6, 7.1].forEach(z => arvore(1, z, r(0.9, 1.05)));
  [6.3, 8.1].forEach(z => poste(1, z));
})();

/* ==========================================================================
   RIO — muros dos cais, água, reflexos, a péniche, o bateau-mouche
   e o parapeito da ponte onde ela está.
   ========================================================================== */
const rio = camada('rio');

function muro(lado, zPerto, zLonge) {
  const X = lado * LAT.cais;
  const topoP = [px(zPerto, X), py(zPerto, ALT.rua)], topoL = [px(zLonge, X), py(zLonge, ALT.rua)];
  const peP = [px(zPerto, X), py(zPerto, ALT.agua)], peL = [px(zLonge, X), py(zLonge, ALT.agua)];
  const par = linha2(topoP[0], topoP[1], topoL[0], topoL[1], { bow: 0.003 });
  desenha(rio, primeiro(par), 1.2, TOM.forte);
  poe(rio, par, 1.1, TOM.medio);
  const agua = linha(peP[0], peP[1], peL[0], peL[1], { bow: 0.003 });
  desenha(rio, agua, 1.1, TOM.medio);
  poe(rio, agua, 1, TOM.medio);
  [165, 205, 245, 280].forEach(A => {
    let z = zPerto;
    while (z < zLonge) {
      const z2 = Math.min(zLonge, z + r(0.4, 1.4) * z * 0.35);
      if (sorte() < 0.7) poe(rio, linha(px(z, X), py(z, A), px(z2, X), py(z2, A), { bow: 0.004 }), 0.6, TOM.sopro);
      z = z2 + r(0.05, 0.4) * z * 0.2;
    }
  });
  for (let z = zPerto; z < zLonge; z *= r(1.08, 1.16)) {
    const k = Math.floor(r(0, 4)), As = [125, 165, 205, 245, 280, 300];
    poe(rio, linha(px(z, X), py(z, As[k]), px(z, X), py(z, As[k + 1]), { ov: 0.3 }), 0.5, TOM.sopro);
  }
  const pol = [];
  for (let z = zPerto; z <= zLonge; z *= 1.15) pol.push([px(z, X), py(z, 262)]);
  for (let z = zLonge; z >= zPerto; z /= 1.15) pol.push([px(z, X), py(z, ALT.agua)]);
  poe(rio, hachura(pol, lado < 0 ? -0.95 : 0.95, 3, { falha: 0.25 }), 0.55, TOM.sopro);
}

function agua() {
  for (let y = py(9, ALT.agua) + 3; y < 792; ) {
    const z = 300 / (y - FY);
    const xl = px(z, -LAT.cais) + 3, xr = px(z, LAT.cais) - 3;
    const esc = (y - FY) / 200;
    const quantos = Math.round(r(2, 4) + esc * 2);
    for (let k = 0; k < quantos; k++) {
      // prefere as bordas: o meio do rio fica claro, é onde bate a luz
      const u = sorte() < 0.5 ? Math.pow(sorte(), 1.8) * 0.45 : 1 - Math.pow(sorte(), 1.8) * 0.45;
      const x = xl + (xr - xl) * u, L = r(8, 34) * esc;
      if (x + L > xr) continue;
      poe(rio, linha(x, y, x + L, y + r(-0.4, 0.4), { bow: 0.05, ov: 0.3 }), esc > 0.9 ? 0.9 : 0.7, esc > 0.8 ? TOM.leve : TOM.sopro);
    }
    y += 3 + esc * r(5, 9);
  }
  const z = 9, yA = py(z, ALT.agua);
  for (let x = px(z, -LAT.cais) + 4; x < px(z, LAT.cais) - 4; x += r(2.5, 5.5)) {
    poe(rio, linha(x, yA + r(1, 3), x + r(-0.5, 0.5), yA + r(6, 16), { bow: 0.1, ov: 0.4 }), 0.6, TOM.sopro);
  }
  [2.1, 2.8].forEach(zz => {
    const x = px(zz, -LAT.cais) + 36 / zz, y = py(zz, ALT.agua) + 2;
    for (let i = 0; i < 4; i++) poe(rio, linha(x + i * 25 / zz, y + i * 1.5, x + i * 25 / zz + r(-1, 1), y + r(30, 78) / zz, { bow: 0.15 }), 0.55, TOM.sopro);
  });
}

// Péniche atracada no cais esquerdo, perto da ponte.
function peniche() {
  const z0 = 5, z1 = 7.2, Xc = -860, Xm = -LAT.cais;
  const bordo = z => [px(z, Xc), py(z, ALT.agua - 45)];
  const lin = z => [px(z, Xc), py(z, ALT.agua)];
  fundo(rio, poligono([bordo(z0), bordo(z1), lin(z1), lin(z0)]));
  poe(rio, linha(...bordo(z0), ...bordo(z1)) + linha(...lin(z0), ...lin(z1)), 0.9, TOM.medio);
  const pr = [px(z0, Xm), py(z0, ALT.agua - 45)];
  poe(rio, curva([bordo(z0), [bordo(z0)[0] - 3, bordo(z0)[1] + 6], lin(z0)], { j: 0.1 }) + linha(...bordo(z0), ...pr), 0.9, TOM.medio);
  const c0 = z0 + 0.4, c1 = z1 - 0.35, Xk = -900;
  const cb = z => [px(z, Xk), py(z, ALT.agua - 45)], ct = z => [px(z, Xk), py(z, ALT.agua - 100)];
  poe(rio, linha(...cb(c0), ...ct(c0)) + linha(...ct(c0), ...ct(c1)) + linha(...cb(c1), ...ct(c1)), 0.8, TOM.medio);
  for (let z = c0 + 0.12; z < c1 - 0.1; z += 0.22) {
    const x1 = px(z, Xk), x2 = px(z + 0.09, Xk);
    poe(rio, quad([[x1, py(z, ALT.agua - 62)], [x1, py(z, ALT.agua - 88)], [x2, py(z + 0.09, ALT.agua - 88)], [x2, py(z + 0.09, ALT.agua - 62)]]), 0.6, TOM.leve);
  }
  poe(rio, copa(px(z0 + 0.2, Xc - 20), py(z0 + 0.2, ALT.agua - 58), 3, 2.4, { voltas: 1.4 }), 0.6, TOM.leve);
  poe(rio, copa(px(z1 - 0.15, Xc - 20), py(z1 - 0.15, ALT.agua - 56), 2.4, 2, { voltas: 1.3 }), 0.6, TOM.leve);
  for (let i = 0; i < 6; i++) {
    const [x, y] = lin(z0 + (z1 - z0) * (i / 6));
    poe(rio, linha(x, y + 2, x + r(-4, 4), y + r(4, 7), { bow: 0.2 }), 0.5, TOM.sopro);
  }
}

// Bateau-mouche indo embora, rumo à ponte: popa, teto de vidro e o rastro em V.
function bateau() {
  const z = 3.3, zf = 4.3, Xe = -150, Xd = 80;
  const x1 = px(z, Xe), x2 = px(z, Xd);
  const yL = py(z, ALT.agua), yC = py(z, ALT.agua - 50), yT = py(z, ALT.agua - 105);
  fundo(rio, poligono([[x1, yC], [x1, yL], [x2, yL], [x2, yC], [px(zf, Xd), py(zf, ALT.agua - 105)], [x1, yT]]));
  const casco = curva([[x1, yC], [x1 + 2, yL - 3], [(x1 + x2) / 2, yL + 1.5], [x2 - 2, yL - 3], [x2, yC]], { j: 0.2 }) + linha(x1, yC, x2, yC);
  desenha(rio, casco, 1.1, TOM.forte);
  poe(rio, casco, 1, TOM.medio);
  const teto = curva([[x1 + 3, yC], [x1 + 6, yT + 4], [(x1 + x2) / 2, yT], [x2 - 6, yT + 4], [x2 - 3, yC]], { j: 0.2 });
  desenha(rio, teto, 1, TOM.medio);
  poe(rio, teto, 0.9, TOM.medio);
  for (let i = 1; i < 7; i++) {
    const x = x1 + ((x2 - x1) * i) / 7;
    poe(rio, linha(x, yC, x, yT + 3 + Math.abs(i - 3.5) * 1.1, { ov: 0.2 }), 0.6, TOM.leve);
  }
  poe(rio, linha(x2, yC, px(zf, Xd), py(zf, ALT.agua - 50)) + linha(x2 - 6, yT + 4, px(zf, Xd - 10), py(zf, ALT.agua - 105)), 0.8, TOM.leve);
  poe(rio, hachura([[x1, yC], [x2, yC], [x2, yL - 2], [x1, yL - 2]], 0.9, 2.4, { falha: 0.2 }), 0.55, TOM.leve);
  poe(rio, copa((x1 + x2) / 2, yL + 4, (x2 - x1) * 0.35, 2.4, { voltas: 2.2, laco: 0.12 }), 0.6, TOM.leve);
  const rastro = (xa, lado) => {
    let d = '';
    for (let i = 0; i < 5; i++) {
      const t0 = i / 5, t1 = t0 + 0.14;
      const p = t => [xa + lado * t * 150, yL + 4 + t * 70];
      d += linha(...p(t0), ...p(t1), { bow: 0.08, ov: 0.6 });
    }
    return d;
  };
  poe(rio, rastro(x1 + 4, -1) + rastro(x2 - 4, 1), 0.8, TOM.leve);
  poe(rio, rastro(x1 + 14, -0.8) + rastro(x2 - 14, 0.8), 0.6, TOM.sopro);
}

// O parapeito de pedra da ponte onde ela está (primeiro plano).
function parapeito() {
  const yT = 800, yF = 812, x0 = -20, x1 = W + 20;
  fundo(rio, `M${x0} ${yT - 2}L${x1} ${yT - 6}L${x1} ${H}L${x0} ${H}Z`);
  const topo = linha2(x0, yT, x1, yT - 4, { bow: 0.002 });
  desenha(rio, primeiro(topo), 1.4, TOM.forte);
  poe(rio, topo, 1.3, TOM.forte);
  poe(rio, linha(x0, yF, x1, yF - 4, { bow: 0.002 }), 1, TOM.medio);
  for (let x = 60 + r(0, 30); x < x1; x += r(130, 180)) {
    poe(rio, linha(x, yT + 1, x + r(-1, 1), yF - 1, { ov: 0.2 }) + linha(x + r(-6, 6), yF + 1, x + r(-3, 3), yF + r(40, 80), { ov: 0.4 }), 0.7, TOM.leve);
  }
  poe(rio, hachura([[x0, yF + 26], [x1, yF + 22], [x1, H], [x0, H]], -0.5, 5.5, { falha: 0.35 }), 0.6, TOM.sopro);
  poe(rio, hachura([[x0, yF + 50], [x1, yF + 46], [x1, H], [x0, H]], 0.7, 7, { falha: 0.45 }), 0.55, TOM.sopro);
}

(function desenhaRio() {
  muro(-1, 1.3, 9);
  muro(1, 1.6, 9);
  agua();
  folha(rio); peniche();
  folha(rio); bateau();
  folha(rio); parapeito();
})();

/* ───────── monta e injeta ───────── */
const saida = [
  '<!-- Gerado por ferramentas/cena-sena.js. Não editar à mão: mude o gerador e rode de novo. -->',
  svgDaCamada(ceu),
  // Os monumentos ficam atrás da cidade: prédios e ponte tapam o pé deles.
  svgDaCamada(camada('monumentos'), [torre, louvre, arco].map(svgDoMonumento).join('')),
  svgDaCamada(cidade),
  svgDaCamada(rio),
].join('\n');

const arquivo = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(arquivo, 'utf8');
const INI = '<!-- sena:inicio -->', FIM = '<!-- sena:fim -->';
const a = html.indexOf(INI), b = html.indexOf(FIM);
if (a < 0 || b < a) { console.error('Marcadores sena:inicio / sena:fim não encontrados no index.html'); process.exit(1); }
fs.writeFileSync(arquivo, html.slice(0, a + INI.length) + '\n' + saida + '\n' + html.slice(b));
console.log(`cena do Sena: ${(Buffer.byteLength(saida) / 1024).toFixed(1)} KB, ${contaTracos} traços de entrada, ` +
  `${[torre, louvre, arco].map(m => `${m.nome} ${m.tracos.length}`).join(', ')}`);
