/* Animaciones del sitio — JS puro, sin librerías. Ver anim.css. */
(function(){
  document.documentElement.classList.add('anim');
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Portada ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var foto = document.createElement('div');
    foto.className = 'hero-foto';
    foto.setAttribute('aria-hidden', 'true');
    hero.insertBefore(foto, hero.firstChild);
    var bola = document.createElement('div');
    bola.className = 'pelota';
    bola.setAttribute('aria-hidden', 'true');
    hero.appendChild(bola);
    hero.classList.add('anim-on');

    // Título: partir en letras (el lector de pantalla lee el texto entero)
    var h1 = hero.querySelector('h1');
    if (h1 && !quieto) {
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      var partir = function(nodo){
        [].slice.call(nodo.childNodes).forEach(function(n){
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment(), i = 0;
            n.textContent.split('').forEach(function(c){
              var s = document.createElement('span');
              s.className = 'ch';
              s.setAttribute('aria-hidden', 'true');
              s.style.setProperty('--i', i++);
              s.textContent = c === ' ' ? ' ' : c;
              frag.appendChild(s);
            });
            nodo.replaceChild(frag, n);
          } else if (n.nodeType === 1) partir(n);
        });
      };
      partir(h1);
    }
    // Eyebrow, texto y botones en cascada
    var d = 0.15;
    [hero.querySelector('.eyebrow'), hero.querySelector('.lead')].concat([].slice.call(hero.querySelectorAll('.botones .btn'))).forEach(function(el){
      if (!el) return;
      el.classList.add('entra');
      el.style.animationDelay = (el.classList.contains('eyebrow') ? d : d + 0.9) + 's';
      d += 0.12;
    });
  }

  /* ---------- Portadas animadas para cada pestaña ---------- */
  function enLetras(el, base){
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var i = 0;
    (function partir(nodo){
      [].slice.call(nodo.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(pal){
            if (!pal) return;
            if (/^\s+$/.test(pal)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');   // la palabra no se corta al final de la línea
            w.className = 'pal';
            w.setAttribute('aria-hidden', 'true');
            pal.split('').forEach(function(c){
              var s = document.createElement('span');
              s.className = 'ch';
              s.style.setProperty('--i', base + i++);
              s.textContent = c;
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          nodo.replaceChild(frag, n);
        } else if (n.nodeType === 1) partir(n);
      });
    })(el);
  }
  var trazo = 'fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  var iconos = {
    complejo: '<rect x="30" y="10" width="60" height="100" rx="3"/><line x1="20" y1="60" x2="100" y2="60"/><line x1="30" y1="34" x2="90" y2="34"/><line x1="30" y1="86" x2="90" y2="86"/><line x1="60" y1="34" x2="60" y2="86"/>',
    buffet: '<path d="M26 50 H86 V78 a22 22 0 0 1 -22 22 H48 a22 22 0 0 1 -22 -22 Z"/><path d="M86 58 h6 a10 10 0 0 1 0 20 h-8"/><path d="M42 40 q-6 -8 0 -16 q6 -8 0 -16"/><path d="M58 40 q-6 -8 0 -16 q6 -8 0 -16"/><path d="M74 40 q-6 -8 0 -16 q6 -8 0 -16"/>',
    clases: '<circle cx="60" cy="60" r="46"/><path d="M24 32 C46 48 46 72 24 88"/><path d="M96 32 C74 48 74 72 96 88"/>',
    torneos: '<path d="M36 14 H84 V44 a24 24 0 0 1 -48 0 Z"/><path d="M36 22 H20 a14 14 0 0 0 16 24"/><path d="M84 22 H100 a14 14 0 0 1 -16 24"/><line x1="60" y1="68" x2="60" y2="88"/><path d="M40 106 H80 L76 88 H44 Z"/>',
    fotos: '<rect x="12" y="34" width="96" height="66" rx="10"/><path d="M40 34 l8 -14 h24 l8 14"/><circle cx="60" cy="67" r="20"/><circle cx="92" cy="48" r="3"/>',
    reservas: '<rect x="32" y="8" width="50" height="104" rx="10"/><line x1="50" y1="20" x2="64" y2="20"/><circle cx="57" cy="97" r="4"/><path d="M92 44 a12 12 0 0 1 0 18"/><path d="M100 36 a24 24 0 0 1 0 34"/>'
  };
  var fotosTab = {complejo: 'fotos/pasarela-arriba.jpg', buffet: 'fotos/buffet.jpg', clases: 'fotos/clases.jpg', torneos: 'fotos/torneo-tribuna.jpg', fotos: 'fotos/juego/gente-festejo.jpg', reservas: 'fotos/cancha-blindex.jpg'};
  Object.keys(fotosTab).forEach(function(v){
    var vista = document.getElementById('v-' + v);
    var cab = vista && vista.querySelector('.cab');
    if (!cab) return;
    var por = document.createElement('div');
    por.className = 'portada-tab pt-' + v;
    por.innerHTML = '<div class="pt-foto" aria-hidden="true"></div><div class="in"><div class="pt-texto"></div>' +
      '<svg class="pt-icono" viewBox="0 0 120 120" aria-hidden="true" ' + trazo + '>' + iconos[v] + '</svg></div>' +
      '<div class="pelota" aria-hidden="true"></div>';
    por.querySelector('.pt-foto').style.backgroundImage = 'url("' + fotosTab[v] + '")';
    cab.removeAttribute('style');
    por.querySelector('.pt-texto').appendChild(cab);
    vista.insertBefore(por, vista.firstChild);
    // En Clases la foto ya es la portada: se saca la de al lado
    if (v === 'clases') { var ct = vista.querySelector('.clases-top'); if (ct) ct.classList.add('sin-cab'); }
    var h2 = cab.querySelector('h2');
    if (h2 && !quieto) enLetras(h2, 0);
    [].slice.call(cab.children).forEach(function(el, i){
      if (el === h2) return;
      el.classList.add('entra');
      el.style.animationDelay = (i === 0 ? 0.1 : 0.55 + i * 0.12) + 's';
    });
    por.querySelectorAll('.pt-icono > *').forEach(function(el, i){
      var l = 300; try { l = Math.ceil(el.getTotalLength()) + 2; } catch(e){}
      el.style.setProperty('--l', l);
      el.style.setProperty('--i', i);
    });
  });

  /* ---------- Orden para cascadas internas ---------- */
  document.querySelectorAll('.menu .chips li, .horario div').forEach(function(el){
    el.style.setProperty('--j', [].indexOf.call(el.parentNode.children, el));
  });

  /* ---------- Fotos: al filtrar, las que quedan entran de nuevo ---------- */
  if (!quieto) document.querySelectorAll('.filtros button').forEach(function(b){
    b.addEventListener('click', function(){
      var n = 0;
      document.querySelectorAll('#galeria figure').forEach(function(f){
        if (f.hidden) return;
        f.classList.remove('baraja');
        f.style.setProperty('--k', Math.min(n++, 16));
        void f.offsetWidth;
        f.classList.add('baraja');
      });
    });
  });

  /* ---------- Contadores ---------- */
  function contar(b){
    var txt = b.textContent, m = txt.match(/\d+/g);
    if (!m || quieto) return;
    var t0 = null, dur = 1100;
    function paso(t){
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), j = 0;
      b.textContent = txt.replace(/\d+/g, function(n){ return Math.round(+m[j++] * e); });
      if (k < 1) requestAnimationFrame(paso); else b.textContent = txt;
    }
    requestAnimationFrame(paso);
  }

  /* ---------- Aparecer al hacer scroll ---------- */
  var grupos = ['.cab', '.atajo', '.cancha', '.extra', '.profe', '.torneo', '.plato', '.pasos li', '.horario', '.tarjeta', '.galeria figure', '.menu', '.clases-foto', '.aviso-clases', '.tira-cab .btn'];
  var obs = 'IntersectionObserver' in window && !quieto ? new IntersectionObserver(function(ents){
    ents.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add('visto');
      if (e.target.classList.contains('dato')) { var b = e.target.querySelector('b'); if (b) contar(b); }
      obs.unobserve(e.target);
    });
  }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'}) : null;

  if (obs) {
    grupos.forEach(function(sel){
      var porPadre = new Map();
      document.querySelectorAll(sel).forEach(function(el){
        if (el.closest('.hero') || el.closest('.portada-tab') || el.closest('dialog')) return;
        var p = el.parentNode, i = porPadre.get(p) || 0;
        porPadre.set(p, i + 1);
        el.classList.add('revela');
        el.style.setProperty('--i', Math.min(i, 6));
        obs.observe(el);
      });
    });
    document.querySelectorAll('.dato').forEach(function(el, i){
      el.style.setProperty('--i', i);
      obs.observe(el);
    });
  } else {
    document.querySelectorAll('.dato').forEach(function(el){ el.classList.add('visto'); });
  }

  /* ---------- Atajos con inclinación 3D (solo con mouse) ---------- */
  if (!quieto && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.atajo').forEach(function(a){
      a.addEventListener('pointermove', function(e){
        var r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        a.style.transform = 'rotateY(' + ((x - .5) * 14) + 'deg) rotateX(' + ((.5 - y) * 14) + 'deg) translateY(-4px)';
        a.style.setProperty('--mx', (x * 100) + '%');
        a.style.setProperty('--my', (y * 100) + '%');
      });
      a.addEventListener('pointerleave', function(){ a.style.transform = ''; });
    });
  }

  /* ---------- Tira de fotos: carrusel infinito ---------- */
  var tira = document.querySelector('.tira');
  if (tira && !quieto) {
    var pista = document.createElement('div');
    pista.className = 'pista';
    while (tira.firstChild) pista.appendChild(tira.firstChild);
    var copia = pista.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    copia.querySelectorAll('a').forEach(function(a){ a.tabIndex = -1; });
    tira.appendChild(pista);
    tira.appendChild(copia);
    tira.classList.add('marquee');
  }

  /* ---------- Cabecera al bajar ---------- */
  var top = document.querySelector('.top');
  if (top) {
    var tic = false;
    window.addEventListener('scroll', function(){
      if (tic) return; tic = true;
      requestAnimationFrame(function(){ top.classList.toggle('scrolleado', scrollY > 20); tic = false; });
    }, {passive: true});
  }
})();
