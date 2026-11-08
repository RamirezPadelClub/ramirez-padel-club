/* Vista previa: resultados de ejemplo en "Ver torneo" (Torneo de prueba).
   Lee lo que se carga en /organizador (mismo navegador) y si no hay nada usa los resultados de ejemplo. */
(function(){
const ZONAS={
  A:{sede:'R',clasif:3,final:{g:44,p:45},parejas:{J:'Jaime – Beffart',K:'Roskopf – Bovier',V:'Villarroel – Moya',A:'Alzugaray – Muller'},
     partidos:[{id:36,hora:'13:00',a:'J',b:'K'},{id:37,hora:'13:00',a:'V',b:'A'},{id:44,hora:'15:00',a:{gan:36},b:{gan:37}},{id:45,hora:'15:00',a:{per:36},b:{per:37}}]},
  F:{sede:'C',parejas:{P:'Franco – Perez',F:'Fernandez – Siebenhar',K:'Kramer – Kretzer'},
     partidos:[{id:34,hora:'12:00',a:'P',b:'K'},{id:42,hora:'14:00',a:'P',b:'F'},{id:50,hora:'16:00',a:'F',b:'K'}]},
  G:{sede:'R',parejas:{B:'Beron – Acevedo',V:'Gimenez – Vivas',R:'Rossi – Velazquez'},
     partidos:[{id:57,hora:'18:00',a:'B',b:'V'},{id:64,hora:'20:00',a:'R',b:{gan:57}},{id:69,hora:'21:00',a:'R',b:{per:57}}]},
  H:{sede:'R',parejas:{R:'Romero – Dietz',M:'Markel – Duarte',G:'Rodrigo – Rodriguez'},
     partidos:[{id:56,hora:'18:00',a:'R',b:'M'},{id:61,hora:'19:00',a:'G',b:{gan:56}},{id:68,hora:'21:00',a:'G',b:{per:56}}]},
  I:{sede:'C',parejas:{D:'David – Battauz',S:'Schmidt – Gottig',L:'Lopez – Tiraboschi'},
     partidos:[{id:38,hora:'13:00',a:'D',b:'S'},{id:46,hora:'15:00',a:'L',b:{gan:38}},{id:51,hora:'16:00',a:'L',b:{per:38}}]}
};
const EJEMPLO={36:{sets:[[6,4],[6,2]]},37:{sets:[[6,3],[4,6],[11,6]]},44:{sets:[[6,7],[5,7]]},45:{sets:[[3,6],[6,7]]},
  34:{sets:[[6,3],[6,4]]},42:{sets:[[4,6],[6,7]]},50:{sets:[[6,2],[6,3]]},
  57:{sets:[[6,3],[7,6]]},64:{sets:[[4,6],[6,7]]},69:{sets:[[6,1],[6,4]]},
  56:{sets:[[7,5],[6,2]]},61:{sets:[[3,6],[6,4],[9,11]]},68:{sets:[[6,4],[4,6],[11,8]]},
  38:{sets:[[6,4],[6,3]]},46:{sets:[[2,6],[6,3],[7,11]]},51:{sets:[[5,7],[4,6]]}};

const KEY='demo-app-organizadores-v5';
let res={};
function leer(){try{res=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(EJEMPLO)}catch(e){res=structuredClone(EJEMPLO)}}
const ganador=r=>{let a=0,b=0;r.sets.forEach(([x,y])=>{x>y?a++:y>x&&b++});return a>b?'a':b>a?'b':null};
const txt=r=>r.sets.map(s=>s.join('-')).join('  ');
const scoreHTML=r=>`<span class="sc" aria-label="${txt(r)}">${r.sets.map(([x,y])=>`<span class="col"><b class="${x>y?'g':''}">${x}</b><b class="${y>x?'g':''}">${y}</b></span>`).join('')}</span>`;
function partido(z,id){return ZONAS[z].partidos.find(p=>p.id===id)}
/* resuelve "ganador/perdedor del partido N" */
function lado(z,ref){
  if(typeof ref==='string')return {k:ref,n:ZONAS[z].parejas[ref]};
  const id=ref.gan??ref.per, p=partido(z,id), r=res[id];
  const etiqueta=(ref.gan?'Ganador':'Perdedor')+' partido '+id;
  if(!r)return {k:null,n:etiqueta,pend:true};
  const w=ganador(r), wk=w==='a'?p.a:p.b, lk=w==='a'?p.b:p.a;
  const k=ref.gan?wk:lk;return {k,n:ZONAS[z].parejas[k],desde:etiqueta};
}

function tabla(zk){
  const z=ZONAS[zk],st={};Object.keys(z.parejas).forEach(k=>st[k]={k,pj:0,pg:0,sf:0,sc:0,gf:0,gc:0});
  const jug=[];
  z.partidos.forEach(p=>{const r=res[p.id];if(!r)return;const A=lado(zk,p.a),B=lado(zk,p.b);if(!A.k||!B.k)return;const w=ganador(r);jug.push({a:A.k,b:B.k,w:w==='a'?A.k:B.k});
    [[A.k,0],[B.k,1]].forEach(([k,i])=>{const s=st[k];s.pj++;if((w==='a')===(i===0))s.pg++;
      r.sets.forEach((x,n)=>{let m=x[i],o=x[1-i];if(n===2){const g=m>o;m=g?7:6;o=g?6:7}m>o?s.sf++:s.sc++;s.gf+=m;s.gc+=o})})});
  const list=Object.values(st);
  const h2h=(x,y)=>{const j=jug.find(j=>(j.a===x&&j.b===y)||(j.a===y&&j.b===x));return j?(j.w===x?-1:1):0};
  // zona de 4: partidos ganados; si empatan y jugaron entre ellos, ese partido; si no se enfrentaron, coeficiente de games
  if(z.clasif===3)return list.sort((x,y)=>y.pg-x.pg||h2h(x.k,y.k)||(y.gf-y.gc)-(x.gf-x.gc));
  return list.sort((x,y)=>y.pg-x.pg||(list.filter(z=>z.pg===x.pg).length===2?h2h(x.k,y.k):0)||(y.sf-y.sc)-(x.sf-x.sc)||(y.gf-y.gc)-(x.gf-x.gc));
}
function cerrada(zk){return ZONAS[zk].partidos.every(p=>res[p.id])}

const esc=t=>{const d=document.createElement('div');d.textContent=t;return d.innerHTML};
const plano=n=>String(n).replace(' – ',' - ');
function cats(){
  leer();
  const insc=[];Object.values(ZONAS).forEach(z=>Object.values(z.parejas).forEach(p=>insc.push({pareja:plano(p),hora:'',espera:false})));
  const zonas=Object.entries(ZONAS).map(([zk,z])=>({zona:zk,parejas:Object.values(z.parejas).map(plano)}));
  const partidos=[];Object.entries(ZONAS).forEach(([zk,z])=>z.partidos.forEach(p=>{const A=lado(zk,p.a),B=lado(zk,p.b),r=res[p.id];
    partidos.push({dia:'Sábado',hora:p.hora,fase:'Zona '+zk,p1:plano(A.n),p2:plano(B.n),resultado:r?txt(r).replace(/  /g,' '):''})}));
  return [{torneo:'prueba',categoria:'Caballeros 6ª',estado:'cerrada',cupo:16,inscriptos:insc,zonas,partidos}];
}
function zonasHTML(){
  leer();
  return '<section class="vt-sec"><h3>Zonas<small>tablas y resultados</small></h3><div class="dz-grid">'+Object.entries(ZONAS).map(([zk,z])=>{
    const t=tabla(zk),c=cerrada(zk),n=z.clasif||2,falta=z.partidos.filter(p=>!res[p.id]).length;
    return '<div class="dz"><p class="dz-t">Zona<b>'+zk+'</b></p><div class="dz-tw"><table class="dz-tab"><thead><tr><th>Pos</th><th class="l">Pareja</th><th>PG</th><th>Sets</th><th>Games</th></tr></thead><tbody>'+
      t.map((s,i)=>'<tr class="'+(c&&i<n?'q':'')+'"><td class="pos">'+(i+1)+'°</td><td class="l">'+esc(z.parejas[s.k])+(c&&i<n?' <span class="dz-b">Clasifica</span>':'')+'</td><td>'+s.pg+'</td><td>'+s.sf+'-'+s.sc+'</td><td>'+s.gf+'-'+s.gc+'</td></tr>').join('')+
      '</tbody></table></div><p class="dz-n">'+(c?(n===3?'Clasifican 1°, 2° y 3°.':'Clasifican 1° y 2°.'):'Faltan '+falta+' partido'+(falta>1?'s':'')+'.')+'</p>'+
      z.partidos.map(p=>{const A=lado(zk,p.a),B=lado(zk,p.b),r=res[p.id],w=r&&ganador(r);
        return '<div class="dz-r"><span class="h">'+p.hora+'</span><span class="ps"><span class="'+(w==='a'?'w':'')+'">'+esc(A.n)+'</span><span class="'+(w==='b'?'w':'')+'">'+esc(B.n)+'</span></span>'+(r?scoreHTML(r):'<span class="pend">Por jugar</span>')+'</div>'}).join('')+'</div>'}).join('')+'</div></section>';
}
function cuadroHTML(){
  leer();
  const pos=(zk,i)=>cerrada(zk)?ZONAS[zk].parejas[tabla(zk)[i].k]:null;
  const fila=(n,l)=>'<div class="dc-p'+(n?' ok':'')+'"><b>'+esc(n||l)+'</b>'+(n?'<small>'+l+'</small>':'')+'</div>';
  const otro=t=>'<div class="dc-p"><span>'+t+'</span></div>';
  const caja=(r,h,f)=>'<div class="dc"><p>'+r+'</p><small class="dc-h">'+h+'</small>'+f+'</div>';
  return '<section class="vt-sec"><h3>Cruces del domingo<small>se completan solos</small></h3><div class="dc-grid">'+[
    caja('Dieciseisavos','Domingo 9:30',fila(pos('G',1),'2° Zona G')+otro('2° Zona E')),
    caja('Dieciseisavos','Domingo 9:30',fila(pos('H',0),'1° Zona H')+otro('2° Zona B')),
    caja('Dieciseisavos','Domingo 9:30',otro('1° Zona K')+fila(pos('A',1),'2° Zona A')),
    caja('Dieciseisavos','Domingo 10:30',otro('1° Zona L')+fila(pos('A',2),'3° Zona A')),
    caja('Dieciseisavos','Domingo 10:30',fila(pos('F',1),'2° Zona F')+fila(pos('H',1),'2° Zona H')),
    caja('Dieciseisavos','Domingo 10:30',fila(pos('I',0),'1° Zona I')+otro('2° Zona D')),
    caja('Dieciseisavos','Domingo 11:30',otro('2° Zona K')+fila(pos('I',1),'2° Zona I')),
    caja('Octavos','Domingo 13:45 · pasa directo',fila(pos('A',0),'1° Zona A')+otro('Ganador 2° Zona G / 2° Zona E')),
    caja('Octavos','Domingo 14:45 · pasa directo',fila(pos('F',0),'1° Zona F')+otro('Ganador 1° Zona L / 3° Zona A')),
    caja('Octavos','Domingo 14:45 · pasa directo',fila(pos('G',0),'1° Zona G')+otro('Ganador 1° Zona I / 2° Zona D'))
  ].join('')+'</div></section>';
}
const css=`.demo-banner{background:#0A0F0C;color:#fff;padding:10px max(16px,env(safe-area-inset-left,0px));font-size:14px;display:flex;gap:10px 18px;flex-wrap:wrap;align-items:center;justify-content:center;text-align:center}
.demo-banner b{color:#7FE0A8}.demo-banner a{color:#fff;font-weight:700;text-decoration:underline}
.dz-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.dz{border:1.5px solid var(--tinta);border-radius:12px;overflow:hidden;min-width:0}
.dz-t{margin:0;background:var(--verde);color:var(--blanco);padding:7px 12px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.dz-t b{font-family:var(--display);font-size:22px;letter-spacing:0;margin-left:6px}
.dz-tw{overflow-x:auto}.dz-tab{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.dz-tab th,.dz-tab td{padding:8px 6px;border-bottom:1px solid var(--linea);text-align:center;font-size:14px;white-space:nowrap}
.dz-tab th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--tinta-2)}
.dz-tab .l{text-align:left;white-space:normal}.dz-tab .pos{font-weight:800;width:34px}.dz-tab tr.q .pos{color:var(--verde)}
.dz-b{font-size:11px;font-weight:800;color:var(--verde);background:#E1F0E7;border-radius:999px;padding:2px 7px;white-space:nowrap}
.dz-n{margin:6px 12px 2px;font-size:13px;color:var(--tinta-2)}
.dz-r{display:grid;grid-template-columns:50px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 12px;border-top:1px solid var(--linea)}
.dz-r .h{font-weight:800;color:var(--tinta-2);font-size:13px}
.dz-r .ps{display:flex;flex-direction:column;font-size:14px;line-height:1.35}.dz-r .ps .w{font-weight:800}
.dz-r .pend{font-size:13px;color:var(--tinta-2)}
.sc{display:inline-flex;gap:12px;font-variant-numeric:tabular-nums}.sc .col{display:flex;flex-direction:column;align-items:center}
.sc .col b{font-size:15px;line-height:calc(14px*1.35);font-weight:500;color:var(--tinta-2)}.sc .col b.g{font-weight:800;color:var(--verde)}
.dc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.dc{border:1.5px solid var(--tinta);border-radius:12px;padding:12px}
.dc p{margin:0;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--verde-osc)}
.dc-h{display:block;color:var(--tinta-2);margin:2px 0 8px}
.dc-p{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-top:1px solid var(--linea);font-size:14px}
.dc-p small{color:var(--tinta-2);white-space:nowrap}.dc-p.ok b{color:var(--verde)}
@media (max-width:760px){.dz-grid{grid-template-columns:minmax(0,1fr)}}`;
function arrancar(){
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const b=document.createElement('div');b.className='demo-banner';b.innerHTML='<span><b>Vista previa</b> · así quedaría la página con resultados.</span><a href="#torneo/prueba">Ver el torneo de ejemplo</a><a href="organizador.html">Abrir la app de carga</a>';
  document.body.prepend(b);
  const card=document.querySelector('.torneo.prueba');
  if(card){card.hidden=false;card.querySelector('.t-fecha').textContent='VISTA PREVIA · ZONAS DE EJEMPLO';card.querySelector('h3').textContent='Torneo de ejemplo con resultados';
    card.querySelector('.t-lugar').textContent='Zonas reales del Circuito Fusión con resultados de ejemplo';
    card.querySelector('.t-datos').innerHTML='<li><b>Probá:</b> tocá "Ver torneo" y mirá Zonas, Cronograma y Cuadro final</li><li><b>App:</b> lo que cargues en la app de carga aparece acá</li>'}
}
window.DEMO={cats,zonasHTML,cuadroHTML,mezclar(d){d.categorias=(d.categorias||[]).filter(c=>c.torneo!=='prueba').concat(cats())}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arrancar);else arrancar();
})();
