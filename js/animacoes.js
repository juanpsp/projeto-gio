/* ==========================================================================
   Landing — Gio
   Movimento da página. Sem biblioteca: IntersectionObserver + transform.
   Regra do design system: movimento pequeno, com mola, e tudo para
   quando o visitante pede menos movimento.
   ========================================================================== */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONFIGURAÇÃO — mexa só aqui
     ───────────────────────────────────────────────────────────── */
  var CONFIG = {
    // Número do WhatsApp com DDI e DDD, só dígitos. Ex.: '5511999999999'
    // Enquanto estiver vazio, os botões rolam até a seção de contato.
    whatsapp: '',
    // Mensagem que já vem digitada pro visitante
    mensagem: 'Oi Gio! Vi seu site e quero saber mais sobre as aulas de francês.'
  };

  // Escape só para revisão: mostra as animações mesmo num navegador com
  // "reduzir movimento" ligado (o painel de preview do app força isso).
  // Vale por ?movimento=1 ou pelo botão do painel, que fica lembrado.
  // Sai junto com o painel, antes de publicar.
  var forcado = /[?&]movimento=1/.test(location.search);
  try {
    if (!forcado && document.getElementById('painel') &&
        localStorage.getItem('gio-movimento') === '1') forcado = true;
  } catch (e) {}
  if (forcado) document.documentElement.classList.add('testar-movimento');

  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !forcado;

  // A partir daqui o CSS de movimento existe. Sem JS, a página nasce pronta.
  if (!menosMovimento) document.documentElement.classList.add('movimento');

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ─────────────────────────────────────────────────────────────
     1. Links de WhatsApp
     ───────────────────────────────────────────────────────────── */
  (function ligaWhatsapp() {
    if (!CONFIG.whatsapp) return;
    var url = 'https://wa.me/' + CONFIG.whatsapp +
              (CONFIG.mensagem ? '?text=' + encodeURIComponent(CONFIG.mensagem) : '');
    $$('[data-wa]').forEach(function (a) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  })();

  /* ─────────────────────────────────────────────────────────────
     2. Entradas ao rolar
     ───────────────────────────────────────────────────────────── */
  var observadorEntrada = null;

  function mostra(el) { el.classList.add('is-visivel'); }

  if ('IntersectionObserver' in window) {
    observadorEntrada = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        mostra(e.target);
        observadorEntrada.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    $$('[data-anima], .rabisco').forEach(function (el) { observadorEntrada.observe(el); });
  } else {
    $$('[data-anima], .rabisco').forEach(mostra);
  }

  /* ─────────────────────────────────────────────────────────────
     3. A conversa: mensagens chegam uma a uma, com os pontinhos
     ───────────────────────────────────────────────────────────── */
  function criaDigitando(lado) {
    var p = document.createElement('p');
    p.className = 'en-msg en-msg--digitando en-msg--' + lado;
    p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<i></i><i></i><i></i>';
    return p;
  }

  function encenaConversa(bloco) {
    if (bloco.dataset.feito) return;
    bloco.dataset.feito = '1';

    var dialogo = $('.en-dialogo', bloco);
    if (!dialogo) return;
    var msgs = $$('.en-msg', dialogo);
    if (!msgs.length) return;

    // Menos movimento: tudo já aparece pronto.
    if (menosMovimento) {
      msgs.forEach(function (m) { m.classList.add('is-dentro'); });
      return;
    }

    // Trava a altura no pior caso (todas as mensagens + os pontinhos).
    // Sem isso, cada balão de "digitando" que entra e sai do fluxo empurra
    // tudo que está abaixo na página — e a rolagem para no lugar errado.
    // A trava é solta no fim: é medida em px e não sobreviveria a um
    // giro de tela ou a uma janela redimensionada.
    var molde = criaDigitando('ela');
    dialogo.appendChild(molde);
    dialogo.style.minHeight = dialogo.scrollHeight + 'px';
    dialogo.removeChild(molde);

    var i = 0;
    var anterior = null;

    function proxima() {
      if (i >= msgs.length) { dialogo.style.minHeight = ''; return; }   // acabou: solta a trava
      var msg = msgs[i];
      var lado = msg.classList.contains('en-msg--voce') ? 'voce' : 'ela';

      // Duas mensagens seguidas da mesma pessoa vêm mais rápido.
      var mesmaPessoa = anterior === lado;
      var texto = (msg.textContent || '').trim();
      var espera = Math.min(1100, 380 + texto.length * 14) * (mesmaPessoa ? 0.6 : 1);

      var pontos = criaDigitando(lado);
      dialogo.insertBefore(pontos, msg);

      setTimeout(function () {
        if (pontos.parentNode) pontos.parentNode.removeChild(pontos);
        msg.classList.add('is-dentro');
        anterior = lado;
        i++;
        setTimeout(proxima, 260);
      }, espera);
    }

    proxima();
  }

  var conversas = $$('.conversa-anima');
  if (conversas.length) {
    if ('IntersectionObserver' in window) {
      var obsConversa = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          encenaConversa(e.target);
          obsConversa.unobserve(e.target);
        });
      }, { threshold: 0.3 });
      conversas.forEach(function (c) { obsConversa.observe(c); });
    } else {
      conversas.forEach(function (c) { $$('.en-msg', c).forEach(function (m) { m.classList.add('is-dentro'); }); });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     3b. Rede de segurança
     Quando a página abre direto num link com âncora (site.com/#contato),
     o navegador pula para a seção antes de o observador entrar em cena e
     a seção pode ficar congelada. Aqui a gente confere na mão o que já
     está na tela e destrava.
     ───────────────────────────────────────────────────────────── */
  function estaNaTela(el, fracao) {
    var r = el.getBoundingClientRect();
    if (!r.height) return false;
    var visivel = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    return visivel / r.height >= fracao;
  }

  function destravaAtrasados() {
    $$('[data-anima]:not(.is-visivel), .rabisco:not(.is-visivel)').forEach(function (el) {
      if (estaNaTela(el, 0.05)) mostra(el);
    });
    conversas.forEach(function (c) {
      if (!c.dataset.feito && estaNaTela(c, 0.25)) encenaConversa(c);
    });
  }

  window.addEventListener('load', destravaAtrasados);
  window.addEventListener('hashchange', function () { setTimeout(destravaAtrasados, 60); });
  setTimeout(destravaAtrasados, 700);

  /* ─────────────────────────────────────────────────────────────
     4. Números que contam
     ───────────────────────────────────────────────────────────── */
  function conta(el) {
    var alvo = parseInt(el.dataset.numero, 10);
    if (isNaN(alvo)) return;
    if (menosMovimento || alvo === 0) { el.textContent = formata(alvo); return; }

    var inicio = null;
    var dur = 1100;
    function passo(t) {
      if (inicio === null) inicio = t;
      var p = Math.min(1, (t - inicio) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formata(Math.round(alvo * eased));
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  function formata(n) {
    return n >= 1000 ? n.toLocaleString('pt-BR') : String(n);
  }

  var numeros = $$('[data-numero]');
  if (numeros.length && 'IntersectionObserver' in window) {
    var obsNum = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        conta(e.target);
        obsNum.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    numeros.forEach(function (n) { obsNum.observe(n); });
  }

  /* ─────────────────────────────────────────────────────────────
     5. Parallax discreto (só transform, só o que está na tela)
     ───────────────────────────────────────────────────────────── */
  var pecas = $$('[data-parallax]');
  if (pecas.length && !menosMovimento) {
    var visiveis = [];

    if ('IntersectionObserver' in window) {
      var obsPar = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          var idx = visiveis.indexOf(e.target);
          if (e.isIntersecting && idx === -1) visiveis.push(e.target);
          else if (!e.isIntersecting && idx > -1) visiveis.splice(idx, 1);
        });
      }, { rootMargin: '120px 0px' });
      pecas.forEach(function (p) { obsPar.observe(p); });
    } else {
      visiveis = pecas;
    }

    var agendado = false;
    function atualizaParallax() {
      agendado = false;
      var meio = window.innerHeight / 2;
      visiveis.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var centro = r.top + r.height / 2;
        var fator = parseFloat(el.dataset.p) || 0;
        var desloc = (centro - meio) * fator;
        el.style.setProperty('--desloc', desloc.toFixed(1) + 'px');
      });
    }
    function pedeParallax() {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(atualizaParallax);
    }
    window.addEventListener('scroll', pedeParallax, { passive: true });
    window.addEventListener('resize', pedeParallax);
    atualizaParallax();
  }

  /* ─────────────────────────────────────────────────────────────
     6. Barra de topo e botão flutuante
     ───────────────────────────────────────────────────────────── */
  var topo = $('#topo');
  var flutuante = $('.flutuante');
  var hero = $('.hero');

  if ('IntersectionObserver' in window && hero) {
    var obsHero = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (topo) topo.classList.toggle('is-colado', !e.isIntersecting);
        if (flutuante) flutuante.classList.toggle('is-visivel', !e.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-120px 0px 0px 0px' });
    obsHero.observe(hero);
  }

  // O botão flutuante some quando o CTA final já está na tela (seria redundante)
  var contato = $('#contato');
  if ('IntersectionObserver' in window && contato && flutuante) {
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) flutuante.classList.remove('is-visivel');
      });
    }, { threshold: 0.25 }).observe(contato);
  }

  /* ─────────────────────────────────────────────────────────────
     6b. A boina que cai na cabeça dela
     A queda é comandada pela rolagem: começa quando a foto se aproxima
     da tela e termina meia tela depois. Depois de pousar, ela fica —
     e se a pessoa voltar pra cima, a boina sobe junto.
     ───────────────────────────────────────────────────────────── */
  (function boina() {
    var caixa = $('.boina');
    if (!caixa) return;
    var peca = $('.boina__peca', caixa);
    var retrato = caixa.parentElement;
    if (!peca || !retrato) return;

    var ROT_FINAL = -14;   // a boina fica torta, como boina de verdade
    var ROT_INICIAL = -250;

    function desenha(p) {
      var pQueda = 0.78, x, y, rot, sx, sy;

      if (p < pQueda) {
        // Queda: acelera como gravidade e gira, balançando cada vez menos.
        var t = p / pQueda;
        y = -(1 - t * t);
        rot = ROT_INICIAL + (ROT_FINAL - ROT_INICIAL) * t;
        x = Math.sin(t * Math.PI * 2.4) * (1 - t);
        sx = 1; sy = 1;
      } else {
        // Pouso: amassa na cabeça e volta, como mola.
        var u = (p - pQueda) / (1 - pQueda);
        var mola = Math.exp(-u * 6) * Math.sin(u * 16);
        y = mola * 0.055;
        rot = ROT_FINAL - mola * 7;
        x = 0;
        sx = 1 + mola * 0.12;
        sy = 1 - mola * 0.12;
      }

      // Altura da queda proporcional à foto: alta o bastante pra ler como
      // queda, baixa o bastante pra não cruzar o botão no celular.
      var queda = Math.min(300, retrato.offsetHeight * 0.7);
      peca.style.transform =
        'translate(' + (x * 24).toFixed(1) + 'px, ' + (y * queda).toFixed(1) + 'px)' +
        ' rotate(' + rot.toFixed(1) + 'deg)' +
        ' scale(' + sx.toFixed(3) + ', ' + sy.toFixed(3) + ')';
      peca.style.opacity = Math.max(0, Math.min(1, p / 0.1)).toFixed(2);
    }

    // Movimento reduzido: a boina já está na cabeça dela, parada.
    if (menosMovimento) { desenha(1); return; }

    var agendado = false;
    function calcula() {
      agendado = false;
      if (!retrato.offsetParent) return;            // hero B está ativo
      var topoNoDoc = retrato.getBoundingClientRect().top + window.scrollY;
      // A queda tem que durar rolagem suficiente pra dar pra ver: ~60% de
      // uma tela. Com uma janela curta demais, um giro de rodinha já leva a
      // boina do céu à cabeça e a pessoa não vê nada acontecer.
      var inicio = Math.max(0, topoNoDoc - window.innerHeight * 0.95);
      var curso = Math.max(320, window.innerHeight * 0.62);
      desenha(Math.max(0, Math.min(1, (window.scrollY - inicio) / curso)));
    }
    function pede() { if (!agendado) { agendado = true; requestAnimationFrame(calcula); } }

    window.addEventListener('scroll', pede, { passive: true });
    window.addEventListener('resize', pede);
    window.addEventListener('load', calcula);
    calcula();
  })();

  /* ─────────────────────────────────────────────────────────────
     7. Rolagem suave entre seções
     Clicar em "Ver como funciona" faz a página descer rolando até a
     seção, em vez de teleportar — dá pra ver o caminho, e as animações
     do meio rodam junto. Com movimento reduzido, o salto continua seco
     (é o comportamento certo) e o scroll-margin do CSS cuida do offset.
     ───────────────────────────────────────────────────────────── */
  var DESCONTO_TOPO = 76;   // altura da barra fixa

  function alvoDoLink(a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#' || href.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(href.slice(1))); }
    catch (e) { return null; }
  }

  function posicaoDe(el) {
    // A barra do topo é position:sticky. Enquanto está grudada ela não tem
    // lugar fixo no documento — tanto o rect quanto o offsetTop devolvem
    // onde ela está colada, não de onde ela veio. E o único link que aponta
    // pra ela é o nome da marca, que quer dizer "volta pro começo".
    var pos = getComputedStyle(el).position;
    if (pos === 'sticky' || pos === 'fixed') return 0;
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - DESCONTO_TOPO);
  }

  // Leva o foco junto, senão quem navega por teclado continua lá em cima.
  function poeFoco(el) {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', function limpa() {
        el.removeAttribute('tabindex');
        el.removeEventListener('blur', limpa);
      });
    }
    el.focus({ preventScroll: true });
  }

  if (!menosMovimento) {
    var rolando = false;

    // Recebe o ELEMENTO, não uma coordenada: o destino é recalculado a cada
    // quadro, porque a página muda de altura no meio do caminho (fonte do
    // Google entrando, pontinhos de "digitando", imagem carregando). Com o
    // alvo fixo, a rolagem erra o ponto por dezenas de pixels.
    function rolaAte(el, aoChegar) {
      var inicio = window.scrollY;
      var dist = posicaoDe(el) - inicio;
      if (Math.abs(dist) < 2) { if (aoChegar) aoChegar(); return; }

      // Duração sublinear: perto é rápido, longe não vira viagem.
      var dur = Math.min(1600, Math.max(500, Math.sqrt(Math.abs(dist)) * 22));
      var t0 = null;
      rolando = true;

      function desiste() { rolando = false; }
      window.addEventListener('wheel', desiste, { passive: true });
      window.addEventListener('touchstart', desiste, { passive: true });
      window.addEventListener('keydown', desiste);

      function solta() {
        window.removeEventListener('wheel', desiste);
        window.removeEventListener('touchstart', desiste);
        window.removeEventListener('keydown', desiste);
      }

      function passo(t) {
        if (!rolando) { solta(); return; }        // a pessoa assumiu o volante
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        var alvo = posicaoDe(el);                 // pode ter mudado desde o quadro anterior
        window.scrollTo(0, inicio + (alvo - inicio) * e);
        if (p < 1) { requestAnimationFrame(passo); return; }
        window.scrollTo(0, posicaoDe(el));        // encosta exato
        rolando = false; solta();
        if (aoChegar) aoChegar();
      }
      requestAnimationFrame(passo);
    }

    document.addEventListener('click', function (ev) {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a || a.target === '_blank') return;
      var el = alvoDoLink(a);
      if (!el) return;

      ev.preventDefault();
      var href = a.getAttribute('href');
      rolaAte(el, function () {
        if (history.pushState) history.pushState(null, '', href);
        poeFoco(el);
      });
    });

    // Voltar/avançar do navegador continuam funcionando.
    window.addEventListener('popstate', function () {
      var el = location.hash && location.hash.length > 1
        ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      window.scrollTo(0, el ? posicaoDe(el) : 0);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     8. Painel provisório de revisão (sai antes de publicar)
     ───────────────────────────────────────────────────────────── */
  var painel = $('#painel');
  if (painel) {
    var heroA = $('#hero-a');
    var heroB = $('#hero-b');
    var btnA = $('#btn-hero-a');
    var btnB = $('#btn-hero-b');
    var btnMarcas = $('#btn-marcas');

    function trocaHero(qual) {
      var ativo = qual === 'b' ? heroB : heroA;
      var inativo = qual === 'b' ? heroA : heroB;
      if (!ativo || !inativo) return;
      inativo.classList.remove('is-ativa');
      ativo.classList.add('is-ativa');
      btnA.setAttribute('aria-pressed', String(qual !== 'b'));
      btnB.setAttribute('aria-pressed', String(qual === 'b'));
      // O hero está no topo: revela na hora em vez de esperar o observador.
      $$('[data-anima], .rabisco', ativo).forEach(mostra);
      try { localStorage.setItem('gio-hero', qual); } catch (e) {}
    }

    if (btnA) btnA.addEventListener('click', function () { trocaHero('a'); });
    if (btnB) btnB.addEventListener('click', function () { trocaHero('b'); });

    if (btnMarcas) {
      btnMarcas.addEventListener('click', function () {
        var ligadas = !document.documentElement.classList.toggle('sem-marcas');
        btnMarcas.setAttribute('aria-pressed', String(ligadas));
        btnMarcas.textContent = ligadas ? 'ligadas' : 'desligadas';
        try { localStorage.setItem('gio-marcas', ligadas ? '1' : '0'); } catch (e) {}
      });
    }

    // Forçar movimento: para conferir as animações numa máquina que está
    // com "reduzir movimento" ligado no sistema.
    // Avisa que é o navegador que está com movimento reduzido — senão
    // parece que as animações quebraram, quando na verdade estão
    // desligadas de propósito.
    var aviso = $('#painel-aviso');
    var temAviso = !!aviso && menosMovimento;
    if (temAviso) aviso.hidden = false;

    var btnMovimento = $('#btn-movimento');
    if (btnMovimento) {
      btnMovimento.setAttribute('aria-pressed', String(forcado));
      btnMovimento.textContent = forcado ? 'forçado' : 'forçar';
      btnMovimento.addEventListener('click', function () {
        try { localStorage.setItem('gio-movimento', forcado ? '0' : '1'); } catch (e) {}
        var url = new URL(location.href);
        url.searchParams.delete('movimento');   // fica guardado, não precisa sujar a URL
        location.href = url.toString();
      });
    }

    // Recolher / expandir
    var alternar = $('#painel-alternar');
    function recolhe(sim) {
      painel.classList.toggle('is-recolhido', sim);
      if (alternar) alternar.setAttribute('aria-expanded', String(!sim));
      try { localStorage.setItem('gio-painel', sim ? '0' : '1'); } catch (e) {}
    }
    if (alternar) {
      alternar.addEventListener('click', function () {
        recolhe(!painel.classList.contains('is-recolhido'));
      });
    }

    var fechar = $('#painel-fechar');
    if (fechar) fechar.addEventListener('click', function () { painel.remove(); });

    // Lembra as escolhas entre recarregamentos
    try {
      if (localStorage.getItem('gio-hero') === 'b') trocaHero('b');
      if (localStorage.getItem('gio-marcas') === '0' && btnMarcas) btnMarcas.click();
      var guardado = localStorage.getItem('gio-painel');
      // No celular ele começa recolhido para não tapar a página — mas se há
      // aviso de movimento reduzido, abre pra pessoa ler o recado.
      recolhe(!temAviso && (guardado === null ? window.innerWidth < 700 : guardado === '0'));
    } catch (e) {
      recolhe(!temAviso && window.innerWidth < 700);
    }
  }
})();
