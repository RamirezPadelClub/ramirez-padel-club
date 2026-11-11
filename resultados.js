/* Resultados de torneos — lógica compartida por la página (Ver torneo) y la app de organizadores.
   Reglas del circuito:
   - Sets: 6 con diferencia de 2, 7-5 o 7-6. Tercer set: súper tie-break a 11 con diferencia de 2 (para games cuenta 7-6).
   - Zona de 3: clasifican 2. Orden: partidos ganados; si empatan dos, el partido entre ellos; después sets y games.
   - Zona de 4: clasifican 3. 1° el que ganó los dos partidos; 2° y 3°: si se enfrentaron, ese partido; si no, coeficiente de games.
   - En las parejas de un partido se puede escribir "Ganador 36", "Perdedor 36" o "1° Zona A": se reemplaza solo. */
(function () {
  function sets(txt) {
    var m = String(txt || '').match(/\d+\s*-\s*\d+/g);
    return m ? m.map(function (s) { var p = s.split('-'); return [Number(p[0]), Number(p[1])]; }) : [];
  }
  function setValido(i, a, b) {
    var hi = Math.max(a, b), lo = Math.min(a, b);
    if (i < 2) return (hi === 6 && lo <= 4) || (hi === 7 && (lo === 5 || lo === 6));
    return hi >= 11 && hi - lo >= 2 && (hi === 11 || hi - lo === 2);
  }
  /* Devuelve '' si el resultado es válido, o el motivo. */
  function validar(ss) {
    if (ss.length < 2) return 'Faltan sets: cargá por lo menos el 1° y el 2°.';
    for (var i = 0; i < ss.length; i++) if (!setValido(i, ss[i][0], ss[i][1])) return i < 2 ? 'El ' + (i + 1) + '° set no es válido.' : 'El súper tie-break no es válido.';
    var a = ss[0][0] > ss[0][1], b = ss[1][0] > ss[1][1];
    if (a !== b && ss.length < 3) return 'Quedaron 1 set a 1: falta el súper tie-break.';
    if (a === b && ss.length === 3) return 'Con 2 sets ganados no se juega súper tie-break.';
    return '';
  }
  function ganadorSets(ss) { var a = 0, b = 0; ss.forEach(function (s) { if (s[0] > s[1]) a++; else if (s[1] > s[0]) b++; }); return a > b ? 1 : b > a ? 2 : 0; }
  function esZona(f) { var m = String(f || '').match(/^zona\s+(\S+)/i); return m ? m[1].toUpperCase() : null; }

  /* Prepara una categoría (la que devuelve la planilla) para resolver nombres, tablas y cruces. */
  function preparar(cat) {
    var ps = (cat.partidos || []).map(function (p, n) { var o = Object.assign({}, p); o._n = n; o._sets = sets(p.resultado); return o; });
    var porId = {}; ps.forEach(function (p) { if (p.id) porId[String(p.id)] = p; });
    var zonas = (cat.zonas || []).map(function (z) { return { zona: String(z.zona).toUpperCase(), parejas: z.parejas.slice() }; });
    var C = { cat: cat, partidos: ps, porId: porId, zonas: zonas, _tab: {} };

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
      var cruces = [], cerrada = jugados.length > 0, primero = {};
      C._tab[zk] = { zona: zk, filas: [], cerrada: false, clasif: parejas.length >= 4 ? 3 : 2 }; // evita vueltas infinitas
      jugados.forEach(function (p) {
        var A = nombre(p, 1), B = nombre(p, 2), ss = p._sets;
        if (!ss.length || !A.ok || !B.ok) { cerrada = false; return; }
        var w = ganadorSets(ss);
        [[A.n, 0], [B.n, 1]].forEach(function (x) {
          var k = x[0].toLowerCase(); if (!st[k]) st[k] = { pareja: x[0], pj: 0, pg: 0, sf: 0, sc: 0, gf: 0, gc: 0 };
          var s = st[k], gano = (w === 1) === (x[1] === 0); s.pj++; if (gano) s.pg++;
          if (!(k in primero)) primero[k] = gano ? 1 : 0;
          ss.forEach(function (set, n) { var m = set[x[1]], o = set[1 - x[1]]; if (n === 2) { var g = m > o; m = g ? 7 : 6; o = g ? 6 : 7; } if (m > o) s.sf++; else s.sc++; s.gf += m; s.gc += o; });
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
        /* Zona de 4 (ganadoras y perdedoras): con los mismos partidos ganados, va primero la que ganó su primer partido. */
        if (clasif === 3) return h2h(a, b) || ((primero[b] || 0) - (primero[a] || 0)) || dif(y) - dif(x);
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
  function setsHTML(ss) {
    return '<span class="rs-sc" aria-label="' + ss.map(function (s) { return s.join('-'); }).join(' ') + '">' + ss.map(function (s) {
      return '<span class="rs-col"><b class="' + (s[0] > s[1] ? 'g' : '') + '">' + s[0] + '</b><b class="' + (s[1] > s[0] ? 'g' : '') + '">' + s[1] + '</b></span>';
    }).join('') + '</span>';
  }

  window.Resultados = { sets: sets, setValido: setValido, validar: validar, ganadorSets: ganadorSets, esZona: esZona, preparar: preparar, setsHTML: setsHTML };
})();
