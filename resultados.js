/* Resultados de torneos — lógica compartida por la página (Ver torneo) y la app de organizadores.
   Reglas del circuito:
   - Sets: 6 con diferencia de 2, 7-5 o 7-6. Tercer set: súper tie-break a 11 con diferencia de 2 (para games cuenta 7-6).
   - En el Máster (torneos master-…) los 3 sets son normales: el 3° también es 6 con diferencia de 2, 7-5 o 7-6 y cuenta sus games reales.
   - Zona de 3: clasifican 2. Orden: partidos ganados; si empatan dos, el partido entre ellos; después sets y games.
   - Zona de 4: clasifican 3. 1° el que ganó los dos partidos; 2° y 3°: si se enfrentaron, ese partido; si no, diferencia de sets y después de games.
   - Abandono (AB): el planillero carga cómo iba el set donde abandonaron (ej. 7-5 1-3) y marca la pareja que abandonó.
     En la planilla: "7-5 1-3 AB" + ganador (la otra pareja). La placa muestra cómo iba; la página y la tabla, el partido completado:
     set del abandono → la que sigue llega a 6 (7-5 si la otra tenía 5, 7-6 si tenía 6) y la que abandona se queda con sus games;
     sets que no se jugaron → no se muestran, pero para la tabla cuentan 6-0 (el súper tie-break, 7-6). Abandono en el súper tie-break: se ve como iba y cuenta 7-6.
     Abandono antes de jugar: AB en 0-0 del 1° set → 6-0 6-0.
   - Walkover (WO): la pareja que no se presenta pierde 6-0 6-0. En la planilla: "6-0 6-0 WO" + ganador; en la página no se ve
     el 6-0 6-0 sino "WO" en la pareja que no se presentó (la tabla sí lo cuenta 6-0 6-0) y la ganadora pasa sola a la siguiente instancia.
   - En las parejas de un partido se puede escribir "Ganador 36", "Perdedor 36" o "1° Zona A": se reemplaza solo. */
(function () {
  /* Sets tal cual están cargados. Con abandono, el arreglo lleva .ab = pareja que abandonó (1 o 2) y el último set es cómo iba. */
  function sets(txt, ganador) {
    var t = String(txt || ''), m = t.match(/\d+\s*-\s*\d+/g);
    var ss = m ? m.map(function (s) { var p = s.split('-'); return [Number(p[0]), Number(p[1])]; }) : [];
    if (/(^|\s)WO(\s|$)/i.test(t)) { var gw = String(ganador || '').trim(); if (gw === '1' || gw === '2') { var w1 = gw === '1'; ss = [w1 ? [6, 0] : [0, 6], w1 ? [6, 0] : [0, 6]]; ss.wo = 3 - Number(gw); } return ss; }
    if (/(^|\s)AB(\s|$)/i.test(t)) { var g = String(ganador || '').trim(); if (g === '1' || g === '2') { if (!ss.length) ss.push([0, 0]); ss.ab = 3 - Number(g); } }
    return ss;
  }
  function tercerNormal(torneo) { return /^master-/i.test(String(torneo || '')); }
  /* Partido completado para la página y la tabla. Cada set lleva .w (quién lo gana); el del abandono lleva .abm. */
  function completar(ss, normal) {
    if (!ss || !ss.ab) return ss || [];
    var ab = ss.ab, wi = 2 - ab, ai = ab - 1, k = ss.length - 1, out = [];
    for (var i = 0; i < k; i++) { var c = ss[i].slice(); c.w = ss[i][0] > ss[i][1] ? 1 : 2; out.push(c); }
    var q = ss[k], tb = k === 2 && !normal, s;
    if (tb) s = q.slice();
    else { var g = q[ai]; s = [0, 0]; s[ai] = g; s[wi] = g >= 5 ? 7 : 6; }
    s.w = 3 - ab; s.abm = ab; out.push(s);
    var gan = function () { return out.filter(function (x) { return x.w === 3 - ab; }).length; };
    while (gan() < 2 && out.length < 3) { var j = out.length, n = [0, 0]; n[wi] = j === 2 && !normal ? 11 : 6; n.w = 3 - ab; n.nj = true; out.push(n); }
    out.ab = ab; return out;
  }
  function resultado(txt, ganador, torneo) { return completar(sets(txt, ganador), tercerNormal(torneo)); }
  /* Set sin terminar (para el set del abandono). */
  function setParcial(i, a, b, normal) {
    if (!(a >= 0 && b >= 0)) return false;
    if (i < 2 || normal) return a <= 6 && b <= 6 && !setValido(i, a, b, normal);
    return !setValido(i, a, b, normal) && Math.max(a, b) <= 30;
  }
  function setValido(i, a, b, normal) {
    var hi = Math.max(a, b), lo = Math.min(a, b);
    if (i < 2 || normal) return (hi === 6 && lo <= 4) || (hi === 7 && (lo === 5 || lo === 6));
    return hi >= 11 && hi - lo >= 2 && (hi === 11 || hi - lo === 2);
  }
  /* Devuelve '' si el resultado es válido, o el motivo. */
  function validar(ss, normal) {
    if (ss.ab) {
      if (ss.ab !== 1 && ss.ab !== 2) return 'Elegí qué pareja abandonó.';
      var k = ss.length - 1;
      for (var q = 0; q < k; q++) if (!setValido(q, ss[q][0], ss[q][1], normal)) return q < 2 || normal ? 'El ' + (q + 1) + '° set no es válido.' : 'El súper tie-break no es válido.';
      if (k > 2) return 'El partido ya estaba terminado: no puede haber abandono.';
      if (k === 2 && (ss[0][0] > ss[0][1]) === (ss[1][0] > ss[1][1])) return 'El partido ya estaba terminado en 2 sets: no puede haber abandono en el 3°.';
      if (!setParcial(k, ss[k][0], ss[k][1], normal)) return 'El ' + (k < 2 || normal ? (k + 1) + '° set' : 'súper tie-break') + ' del abandono no puede estar terminado.';
      return '';
    }
    var t = normal ? '3° set' : 'súper tie-break';
    if (ss.length < 2) return 'Faltan sets: cargá por lo menos el 1° y el 2°.';
    for (var i = 0; i < ss.length; i++) if (!setValido(i, ss[i][0], ss[i][1], normal)) return i < 2 || normal ? 'El ' + (i + 1) + '° set no es válido.' : 'El súper tie-break no es válido.';
    var a = ss[0][0] > ss[0][1], b = ss[1][0] > ss[1][1];
    if (a !== b && ss.length < 3) return 'Quedaron 1 set a 1: falta el ' + t + '.';
    if (a === b && ss.length === 3) return 'Con 2 sets ganados no se juega ' + (normal ? 'el 3° set' : 'súper tie-break') + '.';
    return '';
  }
  function ganadorSets(ss) { if (ss && (ss.ab || ss.wo)) return 3 - (ss.ab || ss.wo); var a = 0, b = 0; ss.forEach(function (s) { if (s[0] > s[1]) a++; else if (s[1] > s[0]) b++; }); return a > b ? 1 : b > a ? 2 : 0; }
  function esZona(f) { var m = String(f || '').match(/^zona\s+(\S+)/i); return m ? m[1].toUpperCase() : null; }

  /* Prepara una categoría (la que devuelve la planilla) para resolver nombres, tablas y cruces. */
  function preparar(cat) {
    var ps = (cat.partidos || []).map(function (p, n) { var o = Object.assign({}, p); o._n = n; o._real = sets(p.resultado, p.ganador); o._sets = completar(o._real, tercerNormal(cat.torneo)); return o; });
    var porId = {}; ps.forEach(function (p) { if (p.id) porId[String(p.id)] = p; });
    var zonas = (cat.zonas || []).map(function (z) { return { zona: String(z.zona).toUpperCase(), parejas: z.parejas.slice() }; });
    var C = { cat: cat, partidos: ps, porId: porId, zonas: zonas, _tab: {}, normal: tercerNormal(cat.torneo) };

    function gano(p) {
      if (p._sets.length) return ganadorSets(p._sets);
      var g = String(p.ganador || '').trim(); if (g === '1' || g === '2') return Number(g);
      return 0;
    }
    C.gano = gano;
    /* Nombre real de una pareja de un partido (lado 1 o 2), o el texto tal cual si todavía no se sabe. */
    function nombre(p, lado, prof) {
      var t = String((lado === 1 ? p.p1 : p.p2) || '').trim();
      if ((prof || 0) > 8) return { n: t, ok: false };
      var m = t.match(/^(ganador|ganadora|perdedor|perdedora)\s+(?:del\s+)?(?:partido\s+)?(?:n[°º.]?\s*)?(\d+)$/i);
      if (m) {
        var q = porId[m[2]], w = q && gano(q);
        if (!q || !w) return { n: t, ok: false };
        var gan = /^gan/i.test(m[1]);
        return nombre(q, gan ? w : 3 - w, (prof || 0) + 1);
      }
      m = t.match(/^(\d)\s*[°º]?\s*(?:de\s+)?zona\s+(\S+)$/i);
      if (m) {
        var tb = tabla(m[2].toUpperCase());
        if (!tb || !tb.cerrada) return { n: t, ok: false };
        var f = tb.filas[Number(m[1]) - 1];
        return f ? { n: f.pareja, ok: true, desde: t } : { n: t, ok: false };
      }
      return { n: t || 'A definir', ok: !!t };
    }
    C.nombre = nombre;

    /* Tabla de una zona: posiciones, si está cerrada y cuántos clasifican. */
    function tabla(zk) {
      if (C._tab[zk]) return C._tab[zk];
      var z = zonas.filter(function (x) { return x.zona === zk; })[0];
      var jugados = ps.filter(function (p) { return esZona(p.fase) === zk; });
      if (!z && !jugados.length) return null;
      var parejas = z ? z.parejas.slice() : [];
      var st = {}; parejas.forEach(function (n) { st[n.toLowerCase()] = { pareja: n, pj: 0, pg: 0, sf: 0, sc: 0, gf: 0, gc: 0 }; });
      var cruces = [], cerrada = jugados.length > 0;
      C._tab[zk] = { zona: zk, filas: [], cerrada: false, clasif: parejas.length >= 4 ? 3 : 2 }; // evita vueltas infinitas
      jugados.forEach(function (p) {
        var A = nombre(p, 1), B = nombre(p, 2), ss = p._sets;
        if (!ss.length || !A.ok || !B.ok) { cerrada = false; return; }
        var w = ganadorSets(ss);
        [[A.n, 0], [B.n, 1]].forEach(function (x) {
          var k = x[0].toLowerCase(); if (!st[k]) st[k] = { pareja: x[0], pj: 0, pg: 0, sf: 0, sc: 0, gf: 0, gc: 0 };
          var s = st[k]; s.pj++; if ((w === 1) === (x[1] === 0)) s.pg++;
          ss.forEach(function (set, n) { var m = set[x[1]], o = set[1 - x[1]]; if (n === 2 && !C.normal) { var g = set.w ? set.w - 1 === x[1] : m > o; m = g ? 7 : 6; o = g ? 6 : 7; } if (m > o) s.sf++; else s.sc++; s.gf += m; s.gc += o; });
        });
        cruces.push({ a: A.n.toLowerCase(), b: B.n.toLowerCase(), w: (w === 1 ? A.n : B.n).toLowerCase() });
      });
      var filas = Object.keys(st).map(function (k) { return st[k]; });
      var clasif = filas.length >= 4 ? 3 : 2;
      var h2h = function (x, y) { var c = cruces.filter(function (j) { return (j.a === x && j.b === y) || (j.a === y && j.b === x); })[0]; return c ? (c.w === x ? -1 : 1) : 0; };
      var dif = function (s) { return s.gf - s.gc; };
      filas.sort(function (x, y) {
        var a = x.pareja.toLowerCase(), b = y.pareja.toLowerCase();
        if (y.pg !== x.pg) return y.pg - x.pg;
        /* Zona de 4: con los mismos partidos ganados, si se cruzaron en la zona define el partido entre sí;
           si no, la diferencia de sets y después la de games. */
        if (clasif === 3) return h2h(a, b) || (y.sf - y.sc) - (x.sf - x.sc) || dif(y) - dif(x);
        var empatados = filas.filter(function (f) { return f.pg === x.pg; }).length;
        return (empatados === 2 ? h2h(a, b) : 0) || (y.sf - y.sc) - (x.sf - x.sc) || dif(y) - dif(x);
      });
      C._tab[zk] = { zona: zk, filas: filas, cerrada: cerrada, clasif: clasif, partidos: jugados };
      return C._tab[zk];
    }
    C.tabla = tabla;
    C.listaZonas = function () {
      var ks = zonas.map(function (z) { return z.zona; });
      ps.forEach(function (p) { var z = esZona(p.fase); if (z && ks.indexOf(z) < 0) ks.push(z); });
      return ks.sort();
    };
    return C;
  }

  /* HTML del resultado: cada set en columna, el número de cada pareja a la altura de su nombre. */
  /* Siempre 3 lugares: si no hubo súper tie-break, el 3ro queda vacío para que los sets queden alineados. */
  function setsHTML(ss) {
    var hueco = function (cls) { return '<span class="rs-col' + cls + ' vacio" aria-hidden="true"><b>00</b><b>00</b></span>'; };
    /* Tal cual se cargó (con abandono): el último set es cómo iba, sin ganador, con AB en la pareja que abandonó. */
    if (ss.wo) return '<span class="rs-sc" aria-label="walkover">' + '<span class="rs-col"><b class="wo">' + (ss.wo === 1 ? 'WO' : '&nbsp;') + '</b><b class="wo">' + (ss.wo === 2 ? 'WO' : '&nbsp;') + '</b></span>' + hueco('') + hueco(' tb') + '</span>';
    var crudo = ss.ab && !ss.some(function (s) { return s.w; }), ult = ss.length - 1;
    var col = function (s, cls) {
      var parcial = crudo && s === ss[ult];
      var g = function (i) { return parcial ? false : s.w ? s.w === i + 1 : s[i] > s[1 - i]; };
      var abm = parcial ? ss.ab : s.abm, mt = 'AB';
      if (ss.wo && s === ss[0]) { abm = ss.wo; mt = 'WO'; }
      var b = function (i) { return '<b class="' + (g(i) ? 'g' : '') + '">' + s[i] + (abm === i + 1 ? '<small class="abm">' + mt + '</small>' : '') + '</b>'; };
      return '<span class="rs-col' + cls + '">' + b(0) + b(1) + '</span>';
    };
    return '<span class="rs-sc" aria-label="' + ss.filter(function (s) { return !s.nj; }).map(function (s) { return s.join('-'); }).join(' ') + (ss.ab ? ' (abandono)' : ss.wo ? ' (walkover)' : '') + '">' +
      col(ss[0] || [0, 0], '') + (ss[1] && !ss[1].nj ? col(ss[1], '') : hueco('')) + (ss[2] && !ss[2].nj ? col(ss[2], ' tb') : '<span class="rs-col tb vacio" aria-hidden="true"><b>00</b><b>00</b></span>') + '</span>';
  }

  window.Resultados = { tercerNormal: tercerNormal, sets: sets, completar: completar, resultado: resultado, setParcial: setParcial, setValido: setValido, validar: validar, ganadorSets: ganadorSets, esZona: esZona, preparar: preparar, setsHTML: setsHTML };
})();
