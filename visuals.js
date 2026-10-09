'use strict';
(() => {
const C={blue:'#3b9ebc',coral:'#dc6c64',yellow:'#d6b448',green:'#75ab8c',lilac:'#9a86bd',ink:'#315e68',paper:'#f8f5e8'};
const themes={foyer:['blue','coral'],hall:['lilac','blue'],library:['green','yellow'],dining:['coral','yellow'],kitchen:['yellow','blue'],gallery:['coral','lilac'],music:['lilac','coral'],bedroom:['blue','lilac'],attic:['yellow','coral'],conservatory:['green','blue'],cellar:['blue','green'],vault:['lilac','coral']};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeRoom='foyer';const P=(x,y,z=0)=>window.BrambleGeometry.project(x,y,z,activeRoom);
const point=p=>p.map(v=>v.toFixed(2)).join(',');
const poly=(p,c,opacity=.22,extra='')=>`<polygon class="ink" points="${p.map(point).join(' ')}" fill="${c}" fill-opacity="${opacity}" stroke="${c}" stroke-opacity=".55" stroke-width="1.25" stroke-linejoin="round" ${extra}/>`;
const line=(a,b,c=C.ink,opacity=.5,width=1.2,extra='')=>`<path class="ink" d="M${point(a)}L${point(b)}" fill="none" stroke="${c}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
const path=(d,c=C.ink,opacity=.55,width=1.5,fill='none',extra='')=>`<path class="ink" d="${d}" fill="${fill}" stroke="${c}" opacity="${opacity}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const text=(x,y,s,size=10,c=C.ink,extra='')=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-family="Arial,sans-serif" ${extra}>${esc(s)}</text>`;
function box(x,y,w,d,h,c,z=0){const a=P(x,y,z),b=P(x+w,y,z),e=P(x+w,y+d,z),f=P(x,y+d,z),A=P(x,y,z+h),B=P(x+w,y,z+h),E=P(x+w,y+d,z+h),F=P(x,y+d,z+h);return poly([a,b,e,f],c,.09)+poly([a,b,B,A],c,.14)+poly([b,e,E,B],c,.25)+poly([e,f,F,E],c,.32)+poly([A,B,E,F],c,.16)+line(A,B,c,.75,1.8)+line(B,E,c,.6,1.8)+line(A,F,c,.35);}
function shadow(x,y,rx=35,ry=13){return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#54716e" opacity=".10" filter="url(#soft-shadow)" pointer-events="none"/>`;}
function label(p,name){return `<g class="scene-label" pointer-events="none"><rect x="${p[0]-68}" y="${p[1]-17}" width="136" height="25" rx="12" fill="#fffcf1" fill-opacity=".93"/>${text(p[0],p[1],name,10,C.ink,'text-anchor="middle"')}</g>`;}
function group(o,s,p,extra=''){return `<g class="hotspot" data-target="${esc(o.id)}" role="button" tabindex="0" aria-label="${esc(o.name)}" ${extra}><title>${esc(o.name)}</title>${s}${label(p,o.name)}</g>`;}
function catMotionStyle(seed,now){
 const phase=(period,offset)=>(-((now/1000+offset)%period)).toFixed(3)+'s';
 const head=8.6+seed*.31,blink=5.1+seed*.37,tail=3.1+seed*.13,breath=3.4+seed*.09;
 return `--head-duration:${head}s;--head-phase:${phase(head,seed*.71)};--blink-duration:${blink}s;--blink-phase:${phase(blink,seed*1.39)};--tail-duration:${tail}s;--tail-phase:${phase(tail,seed*.83)};--breath-duration:${breath}s;--breath-phase:${phase(breath,seed*.47)};--step-phase:${phase(.38,seed*.07)}`;
}
function catOffset(p,now=Date.now()){
 if(!p.movingUntil||now>=p.movingUntil)return [0,0];
 const t=Math.max(0,Math.min(1,(now-p.moveStarted)/(p.movingUntil-p.moveStarted))),ease=t*t*(3-2*t);
 const from=P(p.fromX,p.fromY),to=P(p.x,p.y);
 return [(from[0]-to[0])*(1-ease),(from[1]-to[1])*(1-ease)];
}
function kitty(x,y,c,small=false,direction=0,asleep=false,motion=null){
 const scale=small?.65:1,animated=motion&&!asleep;
 const body=`<path class="cat-torso" d="M-17 -9 L-19 -35 L-10 -48 L11 -46 L23 -26 L18 -7 Z" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-opacity=".65"/>`;
 const legs=`<g class="cat-leg cat-leg-back"><path d="M-8 -13 L-8 -4 l-4 1" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/></g><g class="cat-leg cat-leg-front"><path d="M11 -12 L12 -4 l5 -1" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/></g>`;
 const face=`<g class="cat-head"><path d="M-19 -35 L-9 -50 L-12 -69 L2 -61 L13 -64 L25 -73 L28 -51 L22 -37 L2 -33 Z" fill="${c}" fill-opacity=".25" stroke="${c}" stroke-width="1.5"/><path d="M-12 -69 L-8 -56 L2 -61 M25 -73 L19 -56 L13 -64 M2 -33 L2 -61" fill="none" stroke="${c}" stroke-opacity=".43"/><g class="cat-eyes">${asleep?path('M-9 -51 q4 4 8 -1 M13 -54 q4 4 8 -1',C.ink,.85,1.2):`<ellipse cx="-6" cy="-52" rx="1.7" ry="2.5" fill="${C.ink}"/><ellipse cx="17" cy="-55" rx="1.7" ry="2.5" fill="${C.ink}"/>`}</g><path d="M3 -45 l3 2 l3 -4 M-14 -43 l-10 -1 M-14 -39 l-10 3 M17 -44 l13 -5 M18 -40 l12 -1" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/></g>`;
 const tail=`<g class="cat-tail">${path('M-7 -19 C-45 -12 -42 -49 -27 -42',c,.55,6)}</g>`;
 return `<g transform="translate(${x} ${y}) scale(${scale})" class="cat-shape${animated?' is-animated':''}${motion?.walking?' is-walking':''}"${animated?' style="'+catMotionStyle(motion.seed,motion.now)+'"':''}>${shadow(0,1,25,8)}<g class="cat-body-motion">${tail}<g class="ink">${body}<path d="M2 -33 L-4 -11 L-17 -9 M2 -33 L18 -7" fill="none" stroke="${c}" stroke-opacity=".43"/>${legs}${face}</g></g>${asleep?text(30,-72,'z',16,c):''}${direction?'<circle cx="-7" cy="-23" r="3" fill="'+c+'" opacity=".6"/>':''}</g>`;
}
function itemArt(id,x=0,y=0,size=1){let s='';const c=C.yellow;
 if(id==='crank')s=path('M-15 5 L-15 -7 L3 -7 L3 -22 L15 -22',c,.85,5)+`<circle cx="15" cy="-22" r="5" fill="${C.coral}" fill-opacity=".5"/>`;
 if(id==='key')s=`<circle class="ink" cx="-9" cy="-12" r="8" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width="3"/>`+path('M-2 -7 L16 7 M10 1 L5 7 M16 7 L11 13',c,.9,4);
 if(id==='hook')s=path('M-12 15 L9 -20 Q20 -35 27 -24 Q29 -15 20 -14',c,.8,4);
 if(id==='oil')s=`<path class="ink" d="M-14 4 L-14 -20 L10 -20 L15 -12 L15 4 Z" fill="${C.green}" fill-opacity=".32" stroke="${C.green}"/><path d="M2 -22 V-27 H16" stroke="${C.green}" fill="none" stroke-width="3"/>`+path('M0 -15 C-11 -2 -5 1 1 1 C9 1 10 -3 0 -15',C.blue,.5,1.3,C.blue);
 if(id==='lamp')s=`<path class="ink" d="M-13 6 L-10 -25 L10 -25 L14 6 Z" fill="${C.yellow}" fill-opacity=".30" stroke="${c}" stroke-width="2"/><path d="M-9 -26 Q-10 -41 0 -41 Q11 -41 10 -26 M-16 7 H16 M-12 -27 H12" stroke="${c}" stroke-width="2" fill="none"/><path d="M0 -15 Q-8 -4 0 1 Q8 -4 0 -15" fill="${C.coral}" opacity=".58"/>`;
 if(id==='matches')s=`<path class="ink" d="M-16 -19 H12 V6 H-16 Z" fill="${C.coral}" fill-opacity=".28" stroke="${C.coral}"/><path d="M-10 -12 H8 M-10 -6 H8 M-10 0 H8" stroke="${C.yellow}" stroke-width="2"/>`;
 if(id==='weight')s=`<path class="ink" d="M-8 -20 H8 L17 7 H-17 Z" fill="${C.yellow}" fill-opacity=".45" stroke="${C.yellow}"/><circle cx="0" cy="-25" r="6" fill="none" stroke="${C.yellow}" stroke-width="3"/>`;
 if(id==='ribbon')s=path('M-20 -13 Q-7 -25 0 -10 Q7 -25 20 -13 Q21 0 0 -10 Q-20 3 -20 -13 M0 -10 L-9 14 M0 -10 L12 12',C.blue,.7,3,C.blue);
 return `<g transform="translate(${x} ${y}) scale(${size})">${s}</g>`;
}
function portrait(o,state,c){const w=window.AsciAdventure.footprint(o)[0]*window.BrambleGeometry.get(activeRoom).sx,h=o.rotation?84:74,[x,y]=P(o.x,0,56);const tilt=.5,shear=`matrix(1 ${tilt} 0 1 ${x} ${y-h})`;let inside='';
 if(o.id==='musicPortrait')inside=path('M22 17 Q9 24 22 32 Q16 20 22 17',C.yellow,.8,2)+`<ellipse cx="${w/2}" cy="38" rx="11" ry="6" fill="none" stroke="${C.blue}"/><circle cx="${w/2}" cy="38" r="2" fill="${C.blue}"/>`+path(`M${w-38} 50 l20 -5 M${w-38} 53 l20 2 M${w-38} 56 l19 9`,C.coral,.8,1.8);
 else if(o.id==='familyPortrait'&&state.flags.portraitLifted){inside=text(18,24,'A FAMILY SKETCH',8,C.ink)+text(18,51,'→   ↑   ←',22,C.coral);}
 else if(o.id==='dinnerPortrait')inside=Array.from({length:9},(_,i)=>`<ellipse cx="${18+i%3*30}" cy="${20+Math.floor(i/3)*17}" rx="8" ry="4" fill="${C.coral}" fill-opacity=".25" stroke="${C.coral}"/>`).join('');
 else {inside=kitty(w/2,67,c,true,0,true);if(o.rotation){const index=['west','center','east'].indexOf(o.rotation);inside+=text(w-23,27,['↑','→','↓','←'][state.orientations[index]],20,C.ink);}}
 return shadow(x+w/2,y+w*tilt*.5+8,w*.55,11)+`<g transform="${shear}" class="ink"><rect width="${w}" height="${h}" rx="2" fill="${c}" fill-opacity=".17" stroke="${c}" stroke-width="3"/><rect x="8" y="8" width="${w-16}" height="${h-16}" fill="#fffdf0" fill-opacity=".40" stroke="${c}" stroke-opacity=".4"/>${inside}</g>`+line([x,y],[x,y+20],c,.6,2)+line([x+w,y+w*tilt],[x+w,y+w*tilt+20],c,.6,2);
}
function decorFurniture(o,c,accent){
 const [w,d]=window.AsciAdventure.footprint(o),x=o.x,y=o.y,F=(a,b,z=0)=>P(x+a,y+b,z);let s='';
 if(o.kind==='rug'){s=poly([F(0,0,1),F(w,0,1),F(w,d,1),F(0,d,1)],accent,.13);for(const inset of [.5,1.1])s+=poly([F(inset,inset,2),F(w-inset,inset,2),F(w-inset,d-inset,2),F(inset,d-inset,2)],c,.02);return s;}
 if(o.kind==='fireplace'){s=box(x,y,w,d,80,c);s+=box(x-.5,y-.3,w+1,d+.6,5,accent,80);s+=poly([F(2,d,5),F(w-2,d,5),F(w-2,d,48),F(2,d,48)],C.ink,.18);return s;}
 const height=o.kind==='smallTable'?28:o.kind==='chair'?23:o.kind==='bench'?23:34;
 for(const [a,b]of [[.3,.3],[w-.7,.3],[.3,d-.7],[w-.7,d-.7]])s+=box(x+a,y+b,.4,.4,height,c);
 s+=box(x,y,w,d,4,c,height);
 if(o.kind==='chair'||o.kind==='bench'){const facing=o.facing||'s';s+=facing==='e'||facing==='w'?box(x+(facing==='w'?w-.3:0),y,.3,d,32,accent,height+4):box(x,y+(facing==='n'?d-.3:0),w,.3,o.kind==='chair'?32:22,accent,height+4);if(o.kind==='chair')s+=box(x+.3,y+.3,w-.6,d-.6,3,C.lilac,height+4);}
 if(o.kind==='console')s+=box(x+.5,y+.5,w-1,d-1,6,accent,height-7);
 return s;
}
function furniture(o,state){const [w,d]=window.AsciAdventure.footprint(o),x=o.x,y=o.y,id=o.id,[px,py]=P(x+w/2,y+d/2),color=C[(themes[o.room]||themes.foyer)[0]],accent=C[(themes[o.room]||themes.foyer)[1]],open=!!state.flags['open:'+id];let s=shadow(px,py,w*7,14),tag=P(x+w/2,y,90);
 const B=(a=x,b=y,W=w,D=d,H=40,c=color,z=0)=>box(a,b,W,D,H,c,z);
 const face=(a,b,z=0)=>P(x+a,y+b,z);
 if(o.item){s=shadow(px,py,19,7)+`<circle class="item-halo" cx="${px}" cy="${py-12}" r="26" fill="${C.yellow}" fill-opacity=".10" stroke="${C.yellow}" stroke-opacity=".45" stroke-dasharray="2 6"/>`+itemArt(o.item,px,py-8,.8);tag=[px,py-52];return group(o,s,tag);}
 if(o.to){const horizontal=o.dir==='n'||o.dir==='s';const height=window.BrambleGeometry.get(activeRoom).doorHeight;const [X,Y]=P(x,y),a=horizontal?P(x-3,y):P(x,y-3),b=horizontal?P(x+3,y):P(x,y+3);s=poly([a,b,[b[0],b[1]-height],[a[0],a[1]-height]],color,state.room==='cellar'&&o.dir==='n'?0:.12)+path(`M${a[0]} ${a[1]} V${a[1]-height} L${b[0]} ${b[1]-height} V${b[1]}`,color,.7,2.5)+`<circle cx="${X}" cy="${Y-28}" r="13" fill="#fffdf2" fill-opacity=".85"/>`+text(X,Y-24,({n:'↗',s:'↙',w:'↖',e:'↘'})[o.dir],16,color,'text-anchor="middle"');if(state.room==='cellar'&&o.dir==='n')s=poly([a,b,[b[0],b[1]-height],[a[0],a[1]-height]],color,0);return group(o,s,[X,Y-height-16]);}
 if(o.kind){s=decorFurniture(o,color,accent);tag=P(x+w/2,y,80);}
 else if(id.includes('Portrait'))s=portrait(o,state,accent);
 else if(id==='clock'){s+=B(x,y,w,d,118,color)+`<g transform="translate(${face(w/2,d,83).join(' ')})"><circle r="20" fill="#fffdf1" fill-opacity=".6" stroke="${color}"/>${path('M0 -13 V0 H-12',C.ink,.65,2)}${text(0,-24,'IX',9,color,'text-anchor="middle"')}</g>`+line(face(w/2,d,54),face(w/2,d,13),accent,.6,2)+`<circle cx="${face(w/2,d,14)[0]}" cy="${face(w/2,d,14)[1]}" r="7" fill="${accent}" opacity=".4"/>`;tag=face(w/2,0,128);}
 else if(['bookcase','wardrobe','cupboard','bottles','sideboard','desk','chest','trunk'].includes(id)){const height=id==='bookcase'||id==='wardrobe'||id==='cupboard'?90:id==='bottles'?67:42;s+=B(x,y,w,d,height,color);if(id==='bookcase'||id==='bottles'){for(let j=1;j<4;j++){s+=line(face(0,d,height*j/4),face(w,d,height*j/4),color,.6);for(let i=1;i<w-1;i+=1.7)s+=B(x+i,y+d-.8,.65,.65,id==='bottles'?12:17,[color,accent,C.lilac][Math.floor(i+j)%3],height*(j-1)/4+3);}}else{s+=line(face(w/2,d,0),face(w/2,d,height),color,.6);s+=line(face(w/2-1,d,height*.5),face(w/2-1,d,height*.5+7),accent,.8,3);if(open)s+=box(x+w*.65,y+d,w*.35,2,height*.8,accent,4);else s+=line(face(1,d,height*.45),face(w-1,d,height*.45),color,.4);}if(id==='desk')s+=box(x+2,y+.5,3,2,1,C.paper,height+1)+text(px,py-height-2,'FIELD NOTES',7,C.ink);if(id==='bookcase')for(const a of [1,w-1])s+=`<circle cx="${face(a,d,0)[0]}" cy="${face(a,d,0)[1]}" r="3" fill="${C.ink}" opacity=".4"/>`;tag=face(w/2,0,height+12);}
 else if(['welcomeMat','rug','plate'].includes(id)){s=poly([face(0,0,1),face(w,0,1),face(w,d,1),face(0,d,1)],id==='plate'?C.yellow:accent,.2);if(id==='plate'){s+=line(face(0,0),face(w,d),C.yellow,.6,2);if(state.flags.crateOnPlate)s+=text(px,py,'✓',16,C.green);}else{for(let j=.4;j<d;j+=.4)s+=line(face(.2,j,2),face(w-.2,j,2),color,.18,.8);if(id==='welcomeMat')s+=`<g transform="translate(${px-30} ${py-4}) rotate(24)">${text(0,0,'WIPE YOUR PAWS',8,C.ink)}</g>`;}tag=[px,py-22];}
 else if(id==='umbrella'){s+=B(x+1,y+1,w-1,d-1,30,accent);for(let i=0;i<3;i++){s+=line(face(1.2+i,2,28),face(.5+i*1.5,2,64),color,.6,2);const a=face(.5+i*1.5,2,64);s+=path(`M${a[0]} ${a[1]} q-7 -12 -13 -2`,color,.6,2);}}
 else if(['table','bench','piano','bed','readingChair'].includes(id)){const height=id==='bed'?21:id==='readingChair'?25:id==='piano'?44:32;for(const[a,b]of [[.5,.5],[w-1,.5],[.5,d-1],[w-1,d-1]])s+=B(x+a,y+b,.5,.5,height,color);s+=B(x,y,w,d,7,color,height);if(id==='bench'||id==='readingChair')s+=B(x,id==='readingChair'?y+d-.5:y,w,.5,24,accent,height+7);if(id==='table')for(let i=1;i<=9;i++){const a=face(2+i%5*(w-4)/5,i<5?.6:d-1,height+8);s+=`<ellipse cx="${a[0]}" cy="${a[1]}" rx="8" ry="4" fill="${accent}" fill-opacity=".23" stroke="${accent}" stroke-width="1"/>`;}if(id==='piano'){s+=B(x,y,w,d-1,22,accent,height+7);for(let i=.5;i<w-.5;i+=1)s+=B(x+i,y+d-1,.85,.8,2,C.paper,height+7);if(open)s+=B(x+4,y+d,4,2,5,accent,height-10);}if(id==='bed'){for(const [a,b]of [[0,0],[w-.4,0],[0,d-.4],[w-.4,d-.4]])s+=B(x+a,y+b,.4,.4,104,accent);s+=B(x,y,w,d,3,accent,104);s+=B(x,y,w,.5,36,accent,height);s+=B(x+1,y+.5,4,1.6,9,C.paper,height+7)+B(x+6,y+.5,4,1.6,9,C.paper,height+7);s+=B(x,y+2,w,d-2,4,C.lilac,height+9);}tag=face(w/2,0,height+45);}
 else if(o.key){const a=face(w/2,.5,51);s=poly([face(0,0,50),face(w,0,50),face(w,1,50),face(0,1,50)],accent,.33)+text(a[0],a[1]-2,{moon:'☾',eye:'◉',whisker:'≋'}[o.key],18,C.ink,'text-anchor="middle"');tag=[a[0],a[1]-27];}
 else if(id==='curtain'||id==='highWindow'){s='';s+=B(x,0,w,.25,85,color,38);for(let i=1;i<3;i++)s+=line(face(w*i/3,0,38),face(w*i/3,0,123),color,.45);s+=line(face(0,0,80),face(w,0,80),color,.45);if(id==='curtain'&&!open)s+=B(x,0,w,.25,85,C.lilac,38);if(id==='highWindow')s+=B(x,y+1,w,1,2,accent,68)+itemArt('hook',...face(w/2,1.4,72),.5);tag=face(w/2,0,100);}
 else if(['fernPot','ivy'].includes(id)){for(let i=0;i<(id==='fernPot'?2:1);i++){const a=face(2+i*5,2,0);s+=B(x+1+i*5,y+1,2,2,22,C.yellow);for(let j=0;j<7;j++){const angle=j*.8,aX=Math.cos(angle)*28,aY=-25-Math.sin(angle)*18;s+=path(`M${a[0]} ${a[1]-18} Q${a[0]+aX*.2} ${a[1]-53} ${a[0]+aX} ${a[1]+aY-18}`,C.green,.45,3);for(let k=.35;k<1;k+=.25)s+=`<ellipse class="ink" cx="${a[0]+aX*k}" cy="${a[1]-18+aY*k}" rx="10" ry="4" transform="rotate(${j*23} ${a[0]+aX*k} ${a[1]-18+aY*k})" fill="${C.green}" fill-opacity=".2"/>`;}}}
 else if(id==='stove'){s+=B(x,y,w,d,43,accent);for(const[a,b]of [[3,1],[8,1],[3,3],[8,3]]){const p=face(a,b,44);s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="13" ry="7" stroke="${C.coral}" stroke-width="2" fill="${C.coral}" fill-opacity=".2"/>`;}s+=poly([face(3,d,8),face(w-3,d,8),face(w-3,d,32),face(3,d,32)],C.coral,.18);}
 else if(id==='milkBowl'){s+=B(x,y,w,d,12,color);s+=poly([face(1,.5,13),face(w-1,.5,13),face(w-1,d-.5,13),face(1,d-.5,13)],C.paper,.75);}
 else if(id==='metronome'){s+=poly([face(0,2),face(w,2),face(w/2,2,60)],accent,.25)+line(face(w/2,2,10),face(w/2+1.4,2,52),color,.8,2);}
 else if(id==='hatboxes'){s+=B(x,y,w,d,23,C.lilac)+B(x+1,y+1,w-2,d-1,23,C.coral,24)+B(x+2,y+1,w-4,d-1,16,C.yellow,48);}
 else if(id==='stairs'){for(let i=0;i<5;i++)s+=B(x,y+i*d/5,w,d/5,4,accent,(4-i)*6);s+=B(x,y,w,.4,52,color);s+=text(px,py-55,state.flags.cellarUnlocked?'↘':'⌑',22,C.ink);}
 else if(id==='crate'){s+=B(x,y,w,d,44,C.yellow);s+=line(face(0,d,0),face(w,d,44),C.coral,.45,2)+line(face(w,d,0),face(0,d,44),C.coral,.45,2);for(const a of [.6,w-.6])s+=`<circle cx="${face(a,d,0)[0]}" cy="${face(a,d,0)[1]}" r="5" fill="${color}" opacity=".5"/>`;}
 else if(id==='chain'){const a=face(2,2,115),b=face(2,2,20);s+=line(a,b,color,.65,2,'stroke-dasharray="3 4"')+B(x,y+1,w,2,5,color,17);if(state.flags.chainBalanced)s+=itemArt('weight',...face(2,2,28),.7);tag=face(2,2,122);}
 else if(id==='highLatch'){s+=B(x,y,w,.8,5,C.coral,75)+line(face(1,0,77),face(w-1,0,77),C.yellow,.8,4);if(state.flags.latchReleased)s+=text(px,py-80,'✓',18,C.green);tag=face(w/2,0,105);}
 else if(id==='nurseryDoor'){s+=B(x,y,w,1,80,C.lilac)+poly([face(1,1,0),face(w-1,1,0),face(w-1,1,68),face(1,1,68)],C.blue,.22);s+=kitty(...face(w/2,1,19),C.coral,true,0,true);}
 else if(id==='nest'){s+=B(x,y,w,d,15,C.lilac);for(let i=0;i<7;i++)s+=poly([face(i*2,.4,16),face(i*2+3,1,16),face(i*2+2,d,17),face(i*2,d-1,18)],[C.blue,C.coral,C.lilac][i%3],.2);s+=kitty(...face(w/2,d/2,18),C.coral,false,0,true);}
 else s+=B();
 return group(o,s,tag);
}
function render({state,scene,cats,pos,room,player}){activeRoom=state.room;const architecture=window.BrambleGeometry.get(activeRoom);const [a,b]=themes[state.room]||themes.foyer,c=C[a],accent=C[b];let s=`<svg class="world-scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 660" aria-label="${esc(room.name)}. Click furniture, kittens, and doorways."><defs><filter id="soft-shadow"><feGaussianBlur stdDeviation="5"/></filter><pattern id="paper-grain" width="37" height="29" patternUnits="userSpaceOnUse"><circle cx="8" cy="9" r=".55" fill="#736b53" opacity=".09"/><circle cx="29" cy="24" r=".4" fill="#736b53" opacity=".08"/></pattern></defs><rect width="1000" height="660" fill="url(#paper-grain)" pointer-events="none"/>`;
 s+=text(57,51,'BRAMBLE / '+state.room.toUpperCase(),10,C.ink,'letter-spacing="2" opacity=".55"')+text(939,51,String(Object.keys(themes).indexOf(state.room)+1).padStart(2,'0'),28,accent,'text-anchor="end" style="font-family:Georgia,serif" opacity=".65"');
 s+=shadow(510,550,365,25)+box(0,0,57,22,8,c,-8)+poly([P(0,0),P(57,0),P(57,22),P(0,22)],C.paper,.72);
 // Separate translucent planes multiply together, including the wall/floor intersections.
 s+='<g class="room-walls" data-wall-height="'+architecture.wallHeight+'">'+poly([P(0,0),P(57,0),P(57,0,architecture.wallHeight),P(0,0,architecture.wallHeight)],c,.13)+poly([P(0,0),P(0,22),P(0,22,architecture.wallHeight),P(0,0,architecture.wallHeight)],accent,.12);
 for(const z of [0,12,architecture.wallHeight-8,architecture.wallHeight])s+=line(P(0,0,z),P(57,0,z),c,.55,z===0?2:1.5)+line(P(0,0,z),P(0,22,z),accent,.55,z===0?2:1.5);
 s+=line(P(0,0),P(0,0,architecture.wallHeight),C.ink,.45,1.5)+'</g>';
 for(let i=0;i<=57;i+=6)s+=line(P(i,0),P(i,22),c,.09,.7);
 for(let j=0;j<=22;j+=4)s+=line(P(0,j),P(57,j),accent,.13,.7);
 // Contour bands and tiny registration marks echo the colored overprint reference.
 const mat=(x,y)=>P(x,y,1);for(let i=0;i<9;i++){const pts=Array.from({length:27},(_,j)=>mat(4+j*1.8,12+Math.sin(j*.22+i*.07)*(1.4+i*.16)+i*.38));s+=path('M'+pts.map(point).join('L'),accent,.10,1.1);}
 for(let i=1;i<9;i++){const p=P(3+i*6,20,2);s+=text(p[0],p[1],String(i).padStart(2,'0'),8,c,'opacity=".22"');}
 if(state.room==='hall')s+=poly([P(20,7,2),P(37,7,2),P(37,16,2),P(20,16,2)],C.lilac,.2);
 if(state.room==='cellar')s+=line(P(23,18),P(46,18),C.yellow,.6,3)+line(P(23,19),P(46,19),C.yellow,.35,1);
 const actors=scene.map(o=>({depth:P(o.x+window.AsciAdventure.footprint(o)[0]/2,o.y+window.AsciAdventure.footprint(o)[1])[1]+(o.key||o.item?500:0),html:()=>furniture(o,state)}));
 const now=Date.now();
 for(const cat of cats.filter(t=>t.room===state.room)){const p=pos[cat.id],q=P(p.x,p.y),seed=cats.indexOf(cat),offset=catOffset(p,now);const hue=[C.coral,C.blue,C.yellow,C.green,C.lilac][seed%5];const motion={seed,now,walking:now<(p.movingUntil||0)};actors.push({depth:q[1]+offset[1],html:()=>group(cat,kitty(q[0],q[1],hue,false,0,false,motion),[q[0],q[1]-88],`data-cat-id="${cat.id}" data-origin-x="${q[0]}" data-origin-y="${q[1]}" transform="translate(${offset.join(' ')})"`)});}
 const playerPose=player?.sample(now)||window.BramblePlayer?.rest(state.x,state.y,now,1,state.room),q=playerPose?.root||P(state.x,state.y);actors.push({depth:q[1]+1,html:()=>`<g class="player" pointer-events="none">${playerPose?window.BramblePlayer.draw(state.playerStyle,playerPose):shadow(q[0],q[1],17,7)}</g>`});
 actors.sort((a,b)=>a.depth-b.depth);s+='<g class="scene-actors">';for(const o of actors)s+=o.html().replace('<g ', '<g data-depth="'+o.depth+'" ');s+='</g>';
 s+=poly([P(0,22),P(57,22),P(57,22,10),P(0,22,10)],accent,.09,'pointer-events="none"')+poly([P(57,0),P(57,22),P(57,22,10),P(57,0,10)],c,.09,'pointer-events="none"');
 s+=text(57,622,'A HOUSE MADE OF LAYERS. A MYSTERY BETWEEN THEM.',9,C.ink,'letter-spacing="1.8" opacity=".4"');s+=`<circle cx="938" cy="617" r="12" fill="${c}" opacity=".22" class="ink"/><circle cx="951" cy="617" r="12" fill="${accent}" opacity=".3" class="ink"/>`;
 return s+'</svg>';
}
function unproject(x,y,room='foyer'){return window.BrambleGeometry.unproject(x,y,room);}
function icon(id){return `<svg class="item-icon" viewBox="-34 -49 70 76" aria-hidden="true">${itemArt(id)}</svg>`;}
function cover(){activeRoom='foyer';return `<svg viewBox="0 0 600 240" aria-hidden="true" class="cover-art"><g transform="translate(10 -20) scale(.61)">${box(5,3,35,13,80,C.blue)}${box(6,4,8,4,130,C.coral)}${box(26,4,8,4,130,C.lilac)}${box(15,8,10,6,110,C.yellow)}${poly([P(15,8,110),P(25,8,110),P(20,11,190),P(15,14,110),P(25,14,110)],C.coral,.21)}${kitty(...P(33,17),C.green)}</g><g transform="translate(450 155)">${kitty(0,0,C.coral)}</g></svg>`;}
window.BrambleVisuals={render,project:window.BrambleGeometry.project,unproject,icon,cover,catOffset,catMotionStyle};
})();
