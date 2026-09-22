/* ==========================================================================
   Landing — Gio
   Movimento da página. Sem biblioteca: IntersectionObserver + transform.
   Regra do design system: movimento pequeno e com mola. (A regra de parar
   tudo quando o visitante pede menos movimento está desligada — ver abaixo.)
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
    mensagem: 'Oi Gio! Vi seu site e quero saber mais sobre as aulas de francês.',
    // Usuário do Instagram, sem o @. Ex.: 'gio.frances'
    // Enquanto estiver vazio, o ícone do topo fica marcado como pendente.
    instagram: ''
  };

  // Decisão do projeto: a página anima SEMPRE, mesmo quando o sistema pede
  // "menos movimento" (no Windows, "Efeitos de animação" desligado faz o
  // navegador pedir isso). Contraria a regra 7 do Ensemble, de propósito.
  // Para voltar a respeitar o pedido, troque o false por:
  //   window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // e apague o bloco "Anima sempre" do css/pagina.css.
  var menosMovimento = false;

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
     1b. Links do Instagram (ícone do topo e link do rodapé)
     ───────────────────────────────────────────────────────────── */
  (function ligaInstagram() {
    var usuario = (CONFIG.instagram || '').replace(/^@/, '').trim();
    if (!usuario) return;
    $$('[data-insta]').forEach(function (a) {
      a.href = 'https://www.instagram.com/' + encodeURIComponent(usuario) + '/';
      a.target = '_blank';
      a.rel = 'noopener';
      a.removeAttribute('data-pendente');
    });
    // Onde o @ aparece escrito (link do rodapé)
    $$('[data-insta-nome]').forEach(function (el) {
      el.textContent = '@' + usuario;
      el.removeAttribute('data-pendente');
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
     6c. A viagem no quadro
     A seção é alta e o palco fica grudado na tela (sticky). A rolagem
     lá dentro vira um progresso de 0 a 1, dividido em etapas: em cada
     uma o lápis passa num monumento (--p de 0 a 1 no grupo dele; o CSS
     transforma isso em traço aparecendo). Voltando pra cima, apaga.
     Sem movimento: nada gruda e tudo já está desenhado.
     ───────────────────────────────────────────────────────────── */
  (function viagem() {
    var secao = $('.viagem');
    if (!secao || menosMovimento) return;
    var palco = $('.viagem__palco', secao);
    var monumentos = $$('.monumento', secao);
    if (!palco) return;

    // Trecho da rolagem de cada monumento: Torre, Louvre, Arco
    var ETAPAS = [[0.08, 0.34], [0.38, 0.64], [0.68, 0.94]];

    // O palco gruda logo abaixo da barra de topo, que muda de altura
    // entre celular e desktop.
    function medeTopo() {
      if (topo) document.documentElement.style.setProperty('--altura-topo', topo.offsetHeight + 'px');
    }

    function limita(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function aplica(p) {
      var etapa = 0;
      monumentos.forEach(function (m, i) {
        var e = ETAPAS[i];
        if (!e) return;
        var q = limita((p - e[0]) / (e[1] - e[0]));
        m.style.setProperty('--p', q.toFixed(3));
        if (q > 0.12) etapa = i + 1;
      });
      if (secao.getAttribute('data-etapa') !== String(etapa)) secao.setAttribute('data-etapa', etapa);
    }

    var agendado = false;
    function calcula() {
      agendado = false;
      var r = secao.getBoundingClientRect();
      var curso = r.height - palco.offsetHeight;
      if (curso <= 0) { aplica(1); return; }
      var cola = parseFloat(getComputedStyle(palco).top) || 0;
      aplica(limita((cola - r.top) / curso));
    }
    function pede() { if (!agendado) { agendado = true; requestAnimationFrame(calcula); } }

    medeTopo();
    window.addEventListener('scroll', pede, { passive: true });
    window.addEventListener('resize', function () { medeTopo(); pede(); });
    window.addEventListener('load', calcula);
    calcula();
  })();

  /* ─────────────────────────────────────────────────────────────
     6d. A rota dos países (Você sabia?)
     A linha vermelha tracejada desce conforme a lista passa pela tela
     e cada país aparece quando ela chega nele. Sem trava de rolagem:
     a seção ocupa só o próprio tamanho. Voltando pra cima, apaga.
     ───────────────────────────────────────────────────────────── */
  (function rotaDosPaises() {
    var lista = $('.paises');
    if (!lista || menosMovimento) return;
    var paises = $$('.pais', lista);

    var agendado = false;
    function calcula() {
      agendado = false;
      var r = lista.getBoundingClientRect();
      if (!r.height) return;
      // Começa quando o topo da lista chega a 85% da janela e termina
      // quando o fim dela passa de 60%: dá pra ver cada país chegando.
      var ini = window.innerHeight * 0.85, fim = window.innerHeight * 0.6;
      var p = (ini - r.top) / (r.height + ini - fim);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      lista.style.setProperty('--rota', p.toFixed(3));
      paises.forEach(function (li) {
        var meio = (li.offsetTop + li.offsetHeight / 2) / r.height;
        li.classList.toggle('is-dentro', p >= meio - 0.04);
      });
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
})();
