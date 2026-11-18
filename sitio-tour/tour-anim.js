/* Animaciones de la página del Tour — JS puro, sin librerías. Ver tour-anim.css. */
(function(){
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conMouse = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var SVG = 'http://www.w3.org/2000/svg';

  function largo(el){ try { return Math.ceil(el.getTotalLength()) + 2; } catch(e){ return 600; } }

  /* ---------- Portada ---------- */
  var hero = document.querySelector('.hero');
  if (hero && !quieto) {
    // Cancha de fondo (vista desde arriba) que se dibuja sola
    var fondo = document.createElement('div');
    fondo.className = 'fondo-cancha';
    fondo.setAttribute('aria-hidden', 'true');
    fondo.innerHTML = '<svg viewBox="0 0 400 220" xmlns="' + SVG + '">' +
      '<rect class="ln" x="10" y="10" width="380" height="200" rx="4"/>' +
      '<line class="ln red" x1="200" y1="0" x2="200" y2="220"/>' +
      '<line class="ln" x1="80" y1="10" x2="80" y2="210"/>' +
      '<line class="ln" x1="320" y1="10" x2="320" y2="210"/>' +
      '<line class="ln" x1="80" y1="110" x2="320" y2="110"/>' +
      '</svg>';
    hero.insertBefore(fondo, hero.firstChild);
    var brillo = document.createElement('div');
    brillo.className = 'brillo';
    brillo.setAttribute('aria-hidden', 'true');
    hero.insertBefore(brillo, hero.firstChild);
    fondo.querySelectorAll('.ln').forEach(function(el, i){
      el.style.setProperty('--l', largo(el));
      el.style.setProperty('--i', i);
    });

    // Escudo: cada trazo se dibuja en orden
    var esc = hero.querySelector('.in > svg');
    if (esc) esc.querySelectorAll('path, rect, line').forEach(function(el, i){
      el.style.setProperty('--l', largo(el));
      el.style.setProperty('--i', i);
    });

    // Título en letras, con subrayado lima debajo de RAMIREZ
    var h1 = hero.querySelector('h1');
    if (h1) {
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      var partir = function(nodo, envolver){
        [].slice.call(nodo.childNodes).forEach(function(n){
          if (n.nodeType === 3 && n.textContent.trim()) {
            var caja = document.createElement('span');
            caja.setAttribute('aria-hidden', 'true');
            if (envolver) caja.className = 'barrido';
            n.textContent.split('').forEach(function(c, i){
              var s = document.createElement('span');
              s.className = 'ch';
              s.style.setProperty('--i', i);
              s.textContent = c === ' ' ? ' ' : c;
              caja.appendChild(s);
            });
            nodo.replaceChild(caja, n);
          } else if (n.nodeType === 1) partir(n, false);
        });
      };
      partir(h1, true);
    }

    var d = 0.2;
    [hero.querySelector('.eyebrow'), hero.querySelector('.lema'), hero.querySelector('.lead'), hero.querySelector('.botones')].forEach(function(el, i){
      if (!el) return;
      el.classList.add('entra');
      el.style.animationDelay = (i === 0 ? d : 1.2 + i * 0.15) + 's';
    });
  }

  setTimeout(function(){ document.documentElement.classList.add('trazo-listo'); }, 3200);

  /* ---------- Contadores ---------- */
  function contar(b){
    var fin = parseInt(b.textContent, 10);
    if (isNaN(fin) || quieto) return;
    var t0 = null, dur = 1200;
    function paso(t){
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      b.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(paso); else b.textContent = fin;
    }
    requestAnimationFrame(paso);
  }

  /* ---------- Fotos: envolver cada una en un marco para la cortina ---------- */
  document.querySelectorAll('.fotos-tour img').forEach(function(img){
    var m = document.createElement('div');
    m.className = 'marco';
    img.parentNode.insertBefore(m, img);
    m.appendChild(img);
  });

  /* ---------- Chips: orden para el salto ---------- */
  document.querySelectorAll('.cat').forEach(function(c){
    c.querySelectorAll('.chip').forEach(function(ch, j){ ch.style.setProperty('--j', j); });
  });

  /* ---------- Aparecer al hacer scroll ---------- */
  var grupos = ['.cab', '.f', '.sede', '.cat', '.nota', '.fotos-tour .marco', '.video-main', '.loops video', '.puntos-tit', '.puntos video', '.rk-grupos', '.rk-barra', '.rk-caja', '.master', 'section .botones'];
  if ('IntersectionObserver' in window && !quieto) {
    var obs = new IntersectionObserver(function(ents){
      ents.forEach(function(e){
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('visto');
        var b = el.matches('.f') ? el.querySelector('b') : el.matches('.master') ? el.querySelector('.num') : null;
        if (b) contar(b);
        obs.unobserve(el);
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
    grupos.forEach(function(sel){
      var porPadre = new Map();
      document.querySelectorAll(sel).forEach(function(el){
        if (el.closest('.hero')) return;
        var p = el.parentNode, i = porPadre.get(p) || 0;
        porPadre.set(p, i + 1);
        el.classList.add('revela');
        el.style.setProperty('--i', Math.min(i, 6));
        obs.observe(el);
      });
    });
  }

  /* ---------- Borde lima que sigue al mouse ---------- */
  if (conMouse && !quieto) {
    document.querySelectorAll('.f, .sede, .cat').forEach(function(c){
      c.addEventListener('pointermove', function(e){
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Ranking: filas en cascada cada vez que cambia ---------- */
  var cuerpo = document.getElementById('rk-cuerpo');
  if (cuerpo && !quieto && 'MutationObserver' in window) {
    var animar = function(){
      [].slice.call(cuerpo.rows).forEach(function(tr, k){
        tr.classList.remove('entra-fila');
        tr.style.setProperty('--k', Math.min(k, 20));
        void tr.offsetWidth;
        tr.classList.add('entra-fila');
      });
    };
    new MutationObserver(function(muts){
      if (muts.some(function(m){ return m.addedNodes.length; })) animar();
    }).observe(cuerpo, {childList: true});
    animar();
  }

  /* ---------- Barra de arriba y barra de progreso ---------- */
  var nav = document.querySelector('nav');
  var prog = null;
  if (!quieto) {
    prog = document.createElement('div');
    prog.className = 'progreso';
    prog.setAttribute('aria-hidden', 'true');
    document.body.appendChild(prog);
  }
  var tic = false;
  function alBajar(){
    tic = false;
    if (nav) nav.classList.toggle('scrolleado', scrollY > 20);
    if (prog) {
      var max = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    }
  }
  window.addEventListener('scroll', function(){
    if (!tic) { tic = true; requestAnimationFrame(alBajar); }
  }, {passive: true});
  alBajar();
})();
