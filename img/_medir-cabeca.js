const sharp = require('sharp');
const SRC = 'C:/Users/juanp/OneDrive/Documentos/Projetos/teacher-gio/img/gio-recorte.png';
(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  console.log(`recorte: ${W}x${H}`);

  // Primeira linha com pelo menos 6px opacos = topo da cabeca
  let topo = -1;
  for (let y = 0; y < H && topo < 0; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (data[(y*W+x)*4+3] > 140) n++;
    if (n >= 6) topo = y;
  }

  // Largura da cabeca alguns px abaixo do topo, e o centro dela
  const amostras = [8, 20, 40, 70, 110];
  amostras.forEach(d => {
    const y = topo + d;
    if (y >= H) return;
    let min = -1, max = -1, n = 0;
    for (let x = 0; x < W; x++) {
      if (data[(y*W+x)*4+3] > 140) { if (min < 0) min = x; max = x; n++; }
    }
    const centro = (min + max) / 2;
    console.log(`  y=${y} (topo+${d}): x ${min}..${max} | largura ${max-min} | centro ${centro.toFixed(0)} = ${(centro/W*100).toFixed(1)}%`);
  });

  // Centro da cabeca = media dos centros das primeiras amostras
  let soma = 0, c = 0;
  for (let d = 10; d <= 90; d += 5) {
    const y = topo + d;
    if (y >= H) break;
    let min = -1, max = -1;
    for (let x = 0; x < W; x++) if (data[(y*W+x)*4+3] > 140) { if (min < 0) min = x; max = x; }
    if (min >= 0) { soma += (min+max)/2; c++; }
  }
  const cx = soma / c;
  console.log('');
  console.log(`TOPO DA CABECA: y = ${topo} = ${(topo/H*100).toFixed(1)}% da altura`);
  console.log(`CENTRO DA CABECA: x = ${cx.toFixed(0)} = ${(cx/W*100).toFixed(1)}% da largura`);

  // Largura do craneo na altura da testa (para dimensionar a boina)
  const yTesta = topo + 60;
  let min = -1, max = -1;
  for (let x = 0; x < W; x++) if (data[(yTesta*W+x)*4+3] > 140) { if (min < 0) min = x; max = x; }
  console.log(`LARGURA DA CABECA em y=${yTesta}: ${max-min}px = ${((max-min)/W*100).toFixed(1)}% da largura`);
})();
