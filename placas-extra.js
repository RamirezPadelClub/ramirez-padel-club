/* Placas de resultado extra para la app de organizadores:
   - placaMaster: Máster Final del Tour con la identidad 2026 (como la placa "RESULTADOS" de Canva + MÁSTER FINAL).
   - placaConj: torneos en conjunto Ramírez Pádel Club × La Ruta Pádel (negro y blanco).
   Usan fotoDibujar, aj, foto y cargarImg de organizador.html. */

function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function ajusta(c,t,font,max,fs,min){do{c.font=font.replace('#',fs);fs--}while(c.measureText(t).width>max&&fs>min)}

async function placaMaster(I){
  await Promise.all(['300px Anton','italic 400 84px "Cormorant Garamond"','600 34px "Cormorant Garamond"','700 108px Oswald','300 52px Oswald','700 27px Montserrat','500 27px Montserrat'].map(f=>document.fonts.load(f).catch(()=>{})));
  const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;const c=cv.getContext('2d');
  const LIMA='#d7ea46',AZUL='#1a5a91',W=1080;
  const bg=await cargarImg('img/bg-master.jpg');const k=Math.max(1080/bg.width,1920/bg.height);c.drawImage(bg,(1080-bg.width*k)/2,(1920-bg.height*k)/2,bg.width*k,bg.height*k);
  const g=c.createRadialGradient(540,540,10,540,540,420);g.addColorStop(0,'rgba(215,234,70,.22)');g.addColorStop(1,'rgba(215,234,70,0)');c.fillStyle=g;c.fillRect(0,300,1080,480);
  c.textAlign='center';
  // RAMIREZ
  c.fillStyle='#fff';c.font='300px Anton';let m=c.measureText('RAMIREZ');let fs=300*960/m.width;c.font=fs+'px Anton';m=c.measureText('RAMIREZ');c.fillText('RAMIREZ',540,66+m.actualBoundingBoxAscent);
  // PÁDEL TOUR
  c.fillStyle=LIMA;c.font='italic 400 84px "Cormorant Garamond"';c.save();c.letterSpacing='12px';c.fillText('PÁDEL TOUR',546,426);c.restore();
  // MÁSTER FINAL con brillo
  c.font='700 108px Oswald';c.save();c.letterSpacing='3px';const mw=c.measureText('MÁSTER FINAL').width;c.shadowColor='rgba(215,234,70,.6)';c.shadowBlur=30;c.fillStyle=LIMA;c.fillText('MÁSTER FINAL',541,566);c.shadowBlur=0;c.fillText('MÁSTER FINAL',541,566);c.restore();
  [-1,1].forEach(s=>{const x0=540+s*(mw/2+34);c.save();c.translate(x0,528);c.rotate(Math.PI/4);c.fillStyle=LIMA;c.fillRect(-7,-7,14,14);c.restore();
    const lg=c.createLinearGradient(x0+s*22,0,x0+s*112,0);lg.addColorStop(0,LIMA);lg.addColorStop(1,'rgba(215,234,70,0)');c.fillStyle=lg;c.fillRect(Math.min(x0+s*22,x0+s*112),527,90,3)});
  // categoría
  c.fillStyle='#fff';c.font='300 52px Oswald';c.save();c.letterSpacing='8px';c.fillText(I.cat.toUpperCase().replace(/^SUMA\s*8/,'+8'),544,632);c.restore();
  // foto enmarcada
  const X=48,Y=690,FW=984,FH=1110;
  c.save();c.shadowColor='rgba(215,234,70,.4)';c.shadowBlur=48;rr(c,X,Y,FW,FH,24);c.fillStyle=AZUL;c.fill();c.restore();
  const img=await cargarImg(foto);
  c.save();rr(c,X,Y,FW,FH,24);c.clip();fotoDibujar(c,img,X,Y,FW,FH,aj,TINTE.master);
  const gb=c.createLinearGradient(0,Y+FH-300,0,Y+FH);gb.addColorStop(0,'rgba(10,30,70,0)');gb.addColorStop(1,'rgba(10,30,70,.55)');c.fillStyle=gb;c.fillRect(X,Y+FH-300,FW,300);c.restore();
  rr(c,X+2,Y+2,FW-4,FH-4,22);c.lineWidth=4;c.strokeStyle=LIMA;c.stroke();
  // instancia
  rr(c,311.5,665.5,457,51,24);c.fillStyle=AZUL;c.fill();c.lineWidth=3;c.strokeStyle=LIMA;c.stroke();
  c.fillStyle=LIMA;const ls=I.fase.length>14?4:8;c.save();c.letterSpacing=ls+'px';ajusta(c,I.fase,'600 #px "Cormorant Garamond"',410,34,20);c.fillText(I.fase,540+ls/2,703);c.restore();
  // marcador dentro de la foto
  c.fillStyle=LIMA;c.fillRect(X+60,Y+FH-150,FW-120,3);
  const BX=X+60,BW=FW-120,BY=Y+FH-136,BH=110;rr(c,BX,BY,BW,BH,22);c.fillStyle='rgba(26,90,145,.9)';c.fill();
  const SX=BX+BW-34-198,w=I.w;
  [I.A,I.B].forEach((n,i)=>{const t=n.toUpperCase().replace('–','-'),gana=(w===1)===(i===0);c.textAlign='left';c.fillStyle=gana?'#fff':'rgba(255,255,255,.82)';ajusta(c,t,(gana?'700':'500')+' #px Montserrat',SX-BX-50,27,18);c.save();c.letterSpacing='1px';c.fillText(t,BX+34,BY+46+i*42);const tw=c.measureText(t).width;c.restore();if(I.ab===i+1){c.fillStyle='#FF6B6B';c.font='700 20px Montserrat';c.fillText('AB',BX+34+tw+14,BY+44+i*42)}});
  c.fillStyle='rgba(255,255,255,.7)';c.fillRect(SX,BY+12,2,BH-24);for(let j=0;j<3;j++)c.fillRect(SX+66*(j+1),BY+12,2,BH-24);c.fillRect(SX,BY+BH/2-1,198,2);
  c.textAlign='center';
  for(let j=0;j<3;j++)[0,1].forEach(i=>{const s=I.sets[j],v=s?s[i]:'-',gana=s&&!(I.ab&&j===I.sets.length-1)&&s[i]>s[1-i];c.fillStyle=gana?LIMA:'#fff';c.font=(gana?'700':'500')+' 32px Montserrat';c.fillText(String(v),SX+33+66*j,BY+44+i*44)});
  // logos de las sedes
  const lgs=await Promise.all(['img/logo-complejo.png','img/logo-laruta-fondo.png'].map(cargarImg));
  let x=456;[[78,78],[72,78]].forEach(([lw,lh],j)=>{const im=lgs[j],s=Math.min(lw/im.width,lh/im.height),dw=im.width*s,dh=im.height*s;c.drawImage(im,x+(lw-dw)/2,1822+(lh-dh)/2,dw,dh);x+=lw+20});
  return cv.toDataURL('image/jpeg',.9);
}

async function placaConj(I){
  await Promise.all(['900 190px Archivo','800 36px Archivo','700 22px Archivo'].map(f=>document.fonts.load(f).catch(()=>{})));
  const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;const c=cv.getContext('2d');
  const NEGRO='#0b0b0b',GRIS='#8c8c8c',GRIS2='#9a9a9a';
  c.fillStyle=NEGRO;c.fillRect(0,0,1080,1920);
  // fotos de las dos sedes arriba, cortadas en diagonal
  const [fa,fb]=await Promise.all(['img/sede-complejo.jpg','img/sede-laruta.jpg'].map(cargarImg));
  const cover=(im,x,y,w,h,py)=>{const s=Math.max(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;c.drawImage(im,x+(w-dw)/2,y+(h-dh)*py,dw,dh)};
  c.save();c.filter='saturate(.6) contrast(1.05)';
  c.save();c.beginPath();c.moveTo(0,0);c.lineTo(620,0);c.lineTo(470,700);c.lineTo(0,700);c.closePath();c.clip();cover(fa,0,0,620,700,.85);c.restore();
  c.save();c.beginPath();c.moveTo(620,0);c.lineTo(1080,0);c.lineTo(1080,700);c.lineTo(470,700);c.closePath();c.clip();cover(fb,470,0,610,700,.72);c.restore();
  c.restore();
  const g=c.createLinearGradient(0,0,0,700);g.addColorStop(0,'rgba(11,11,11,.35)');g.addColorStop(.35,'rgba(11,11,11,.55)');g.addColorStop(.7,'rgba(11,11,11,.92)');g.addColorStop(1,NEGRO);c.fillStyle=g;c.fillRect(0,0,1080,700);
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=4;c.beginPath();c.moveTo(620,0);c.lineTo(575,205);c.stroke();
  c.textAlign='center';
  // categoría
  const cat=I.cat.toUpperCase().replace(/(\d)\s*°/,'$1ª');
  c.font='800 34px Archivo';c.fontStretch='condensed';c.save();c.letterSpacing='3px';const cw=c.measureText(cat).width+60;c.fillStyle='#fff';c.fillRect(540-cw/2,230,cw,62);c.fillStyle=NEGRO;c.fillText(cat,543,273);c.restore();
  // RESULTADO
  c.fillStyle='#fff';c.fontStretch='extra-condensed';c.save();c.letterSpacing='-3px';ajusta(c,'RESULTADO','900 #px Archivo',940,190,90);c.fillText('RESULTADO',540,470);c.restore();
  c.fillStyle='#bdbdbd';c.font='700 22px Archivo';c.fontStretch='normal';c.save();c.letterSpacing='7px';c.fillText(I.fase,544,530);c.restore();
  // foto
  const X=40,Y=576,FW=1000,FH=880,img=await cargarImg(foto);
  c.save();c.beginPath();c.rect(X,Y,FW,FH);c.clip();fotoDibujar(c,img,X,Y,FW,FH,aj,TINTE.conj);c.restore();
  // marcador
  const MY=Y+FH+34;c.fillStyle='#fff';c.fillRect(X,MY,FW,3);
  const PAD=48,R=X+FW-PAD,cols=[R-76*3-24,R-76*2-12,R-76].map(x=>x+38);
  c.fillStyle=GRIS2;c.font='700 18px Archivo';c.save();c.letterSpacing='3px';['SET 1','SET 2','SET 3'].forEach((t,j)=>c.fillText(t,cols[j],MY+34));c.restore();
  const w=I.w;
  [I.A,I.B].forEach((n,i)=>{const y=MY+112+i*104,gana=(w===1)===(i===0),col=gana?'#fff':GRIS,t=n.replace('–','-');
    c.textAlign='left';c.fillStyle=col;c.fontStretch='condensed';ajusta(c,t,'800 #px Archivo',cols[0]-38-X-PAD-80,36,22);c.fillText(t,X+PAD,y);
    if(I.ab===i+1){const tw=c.measureText(t).width;c.fillStyle='#fff';c.font='800 22px Archivo';c.fillText('AB',X+PAD+tw+14,y-4)}
    c.textAlign='center';c.font='900 64px Archivo';c.fontStretch='extra-condensed';
    for(let j=0;j<3;j++){const s=I.sets[j],par=I.ab&&j===I.sets.length-1;c.fillStyle=s?(!par&&s[i]>s[1-i]?'#fff':GRIS):'#3a3a3a';c.fillText(s?String(s[i]):'-',cols[j],y+10)}
    if(i===0){c.fillStyle='#2a2a2a';c.fillRect(X,y+40,FW,2)}});
  c.fontStretch='normal';
  // logos Ramírez × La Ruta
  const [l1,l2]=await Promise.all(['img/logo-complejo.png','img/logo-laruta-fondo.png'].map(cargarImg));
  const dib=(im,cx)=>{const s=Math.min(76/im.width,76/im.height);c.drawImage(im,cx-im.width*s/2,1846-im.height*s/2,im.width*s,im.height*s)};
  dib(l1,540-24-16-38);dib(l2,540+24+16+38);c.fillStyle=GRIS;c.font='300 36px Archivo';c.textAlign='center';c.fillText('×',540,1858);
  return cv.toDataURL('image/jpeg',.9);
}
