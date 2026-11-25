// Links propios por sección y por torneo, con su vista previa (título, texto e imagen) al compartirlos.
// /categorias, /torneos, /clases, /buffet, /fotos, /reservas  y  /torneo/<id>  (id = data-id de la tarjeta)
// Links propios de un "Ver torneo" de /masters (ej. /8cab): abren esa vista con el flyer del torneo en la vista previa.
// Devuelve la página principal con las etiquetas og cambiadas; en el navegador abre la sección o el torneo.
const SITIO = 'https://ramirezpadelclub.com.ar';
const SECCIONES = {
  categorias: ['Categorías', 'Buscá tu nombre y fijate en qué categoría estás. Listado de damas y caballeros.'],
  torneos: ['Torneos', 'Próximas fechas, inscripción online, zonas, horarios y resultados en vivo.'],
  clases: ['Clases', 'Aprendé o mejorá tu juego con los profes del complejo.'],
  buffet: ['Buffet', 'Comé y tomá algo mientras mirás los partidos. Abierto de lunes a domingo.'],
  fotos: ['Fotos', 'Los álbumes de cada torneo y cómo se vive el complejo.'],
  reservas: ['Reservas', 'Reservá tu cancha por WhatsApp. Dos canchas techadas de césped sintético.'],
};
/* camino → [data-id de la tarjeta del torneo, # de la vista en /masters] */
const VER = { '8cab': ['8cab-2729nov', '8cab'] };
const limpio = t => String(t).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const attr = t => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export async function onRequest(ctx) {
  try { return await armar(ctx); } catch (e) { console.log('links-propios', e && e.stack || e); return ctx.next(); }
}
async function armar(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);
  if (!/^((www\.)?ramirezpadelclub\.(com\.ar|pages\.dev)|localhost|127\.0\.0\.1)$/.test(url.hostname)) return next();
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  const camino = url.pathname.replace(/\/+$/, '').toLowerCase();
  let dato = null;
  const sec = camino.slice(1);
  if (SECCIONES[sec]) {
    const [t, d] = SECCIONES[sec];
    dato = { hash: sec, titulo: t + ' · Ramirez Padel Club', desc: d, img: '/img/og/' + sec + '.jpg', w: 1200, h: 630, link: '/' + sec };
  } else if (VER[sec]) {
    dato = { torneo: VER[sec][0], ver: sec, vista: VER[sec][1] };
  } else if (camino.startsWith('/torneo/')) {
    const id = decodeURIComponent(url.pathname.split('/')[2] || '').toLowerCase();
    if (!/^[a-z0-9-]+$/.test(id)) return next();
    dato = { torneo: id };
  } else return next();

  const base = await env.ASSETS.fetch(new Request(new URL('/', url), { headers: request.headers }));
  if (!base.ok) return next();
  let html = await base.text();

  if (dato.torneo) {
    const id = dato.torneo;
    const m = html.match(new RegExp('<article class="torneo"[^>]*data-id="' + id + '"[^>]*>([\\s\\S]*?)</article>'));
    if (!m) return Response.redirect(SITIO + '/#torneos', 302);
    const b = m[1];
    const g = re => { const x = b.match(re); return x ? limpio(x[1]) : '' };
    const fecha = g(/class="t-fecha">([\s\S]*?)<\/p>/), tit = g(/<h3>([\s\S]*?)<\/h3>/), lugar = g(/class="t-lugar">([\s\S]*?)<\/p>/);
    const cats = g(/<ul class="t-datos">\s*<li>([\s\S]*?)<\/li>/);
    let img = '/img/og/torneo-' + id + '.jpg', w = 1200, h = 630;
    const og = await env.ASSETS.fetch(new Request(new URL(img, url), { method: 'HEAD' }));
    if (!og.ok || !(og.headers.get('content-type') || '').startsWith('image/')) {
      const f = b.match(/<img src="([^"]+)"[^>]*width="(\d+)" height="(\d+)"/);
      if (f) { img = '/' + f[1].replace(/^\/+/, ''); w = +f[2]; h = +f[3]; }
    }
    const fechaCorta = fecha ? fecha.charAt(0) + fecha.slice(1).toLowerCase() : '';
    const ver = dato.ver, vista = dato.vista;
    dato = { hash: 'torneos', torneo: id, titulo: tit + (fecha ? ' · ' + fechaCorta : ''), desc: [cats, lugar, 'Inscripción y toda la info en la página.'].filter(Boolean).join(' · '), img, w, h, link: '/torneo/' + id };
    if (ver) {
      const pm = await env.ASSETS.fetch(new Request(new URL('/masters', url), { headers: request.headers }));
      if (!pm.ok) return next();
      html = await pm.text();
      dato.ver = ver; dato.vista = vista; dato.link = '/' + ver;
      dato.desc = [cats, lugar, 'Zonas, horarios, cuadro y resultados en vivo.'].filter(Boolean).join(' · ');
      // la página del torneo no trae todas las etiquetas og: se agregan para que set() las complete
      const faltan = ['og:url', 'og:image:secure_url', 'og:image:type', 'og:image:width', 'og:image:height', 'og:image:alt', 'twitter:card']
        .filter(p => !new RegExp('<meta (?:property|name)="' + p.replace(/[:]/g, '\\:') + '"').test(html))
        .map(p => '<meta ' + (p.startsWith('twitter') ? 'name' : 'property') + '="' + p + '" content="">').join('');
      html = html.replace(/<\/title>/, '</title>' + faltan);
      if (!/<link rel="canonical"/.test(html)) html = html.replace(/<\/title>/, '</title><link rel="canonical" href="">');
    }
  }

  const abs = SITIO + dato.img, link = SITIO + dato.link;
  const set = (prop, val) => {
    const re = new RegExp('(<meta (?:property|name)="' + prop.replace(/[:]/g, '\\:') + '" content=")[^"]*(")');
    html = re.test(html) ? html.replace(re, '$1' + attr(val) + '$2') : html;
  };
  html = html.replace(/<title>[^<]*<\/title>/, '<title>' + attr(dato.titulo) + '</title>');
  set('description', dato.desc);
  set('og:url', link); set('og:title', dato.titulo); set('og:description', dato.desc);
  set('og:image', abs); set('og:image:secure_url', abs);
  set('og:image:type', 'image/jpeg'); set('og:image:width', String(dato.w)); set('og:image:height', String(dato.h));
  set('og:image:alt', dato.titulo);
  set('twitter:card', dato.w > dato.h ? 'summary_large_image' : 'summary');
  html = html.replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + attr(link) + '">');
  // en el navegador: las secciones ya abren por la dirección (/categorias); el torneo pasa a /torneos y se marca su tarjeta
  const ir = dato.ver ? '<script>if(location.hash!=="#' + dato.vista + '")history.replaceState(null,"","/' + dato.ver + '#' + dato.vista + '")</script>' :
    dato.torneo ? '<script>(function(){try{window.__irTorneo=' + JSON.stringify(dato.torneo) +
    ';history.replaceState(null,"","/torneos")}catch(e){location.replace("/#torneos")}})()</script>' : '';
  if (ir) html = html.replace(/<head>/i, '<head>' + ir);

  const h2 = new Headers(base.headers);
  h2.set('content-type', 'text/html; charset=utf-8');
  h2.set('cache-control', 'public, max-age=0, must-revalidate');
  h2.delete('content-length'); h2.delete('etag');
  return new Response(request.method === 'HEAD' ? null : html, { status: 200, headers: h2 });
}
