'use strict';
(() => {
const ink='#315e68', paper='#f8f5e8';
const styles=[
 {id:'overalls',name:'The gardener',top:'#de6554',legs:paper,skin:'#e7c748',hair:'#263b3d',shoes:'#263b3d',pattern:'bib'},
 {id:'checks',name:'The rambler',top:'#79b6c7',legs:'#283c40',skin:paper,hair:'#283c40',shoes:'#e7c748',pattern:'checks'},
 {id:'curls',name:'The scribbler',top:'#e7c748',legs:paper,skin:'#de6554',hair:'#73b7ba',shoes:'#283c40',pattern:'curls'},
 {id:'ruffle',name:'The daydreamer',top:'#de6554',legs:'#283c40',skin:paper,hair:'#283c40',shoes:'#8dad72',pattern:'ruffle'},
 {id:'stripes',name:'The wanderer',top:'#e7c748',legs:'#de6554',skin:paper,hair:'#283c40',shoes:'#283c40',pattern:'stripes',shortSleeves:true},
 {id:'vest',name:'The botanist',top:'#83b86c',legs:'#dda0b7',skin:'#dda0b7',hair:'#283c40',shoes:'#283c40',pattern:'vest',skirt:true},
 {id:'stars',name:'The stargazer',top:'#de6554',legs:'#283c40',skin:paper,hair:'#283c40',shoes:'#73b7ba',pattern:'stars'}
];
const project=(x,y)=>[330+x*10.6-y*11.8,130+x*4.8+y*7];
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=t=>t*t*t*(t*(t*6-15)+10);
const mix=(a,b,t)=>a+(b-a)*t;
const copy=f=>({...f});
const restFeet=root=>[-1,1].map(side=>({x:root[0]+side*4,y:root[1]+side*.9,lift:0,angle:0}));
function rest(x,y,now=0,facing=1){return {root:project(x,y),feet:restFeet(project(x,y)),facing,bob:0,balance:0,arm:0,lean:0,walking:false,running:false,now};}

// Feet are stored in room coordinates. Root movement never moves a planted foot.
// A stride is one alternating footfall, followed by lifted closing steps
// only when the player actually stops; turns retain the existing contact points.
function create(room,x,y,{enabled=true,reduced=false}={}){
 let target={room,x,y},pose=rest(x,y),motion=null,settle=null,nextFoot=1,lastEnd=-Infinity,contacts=0;
 function sample(now=Date.now()){
  if(motion){
   const t=clamp((now-motion.start)/motion.duration),u=ease(t),s=clamp((t-.04)/.72),v=ease(s);
   const feet=motion.feet.map(copy),foot=feet[motion.swing];
   foot.x=mix(motion.feet[motion.swing].x,motion.toFoot.x,v);
   foot.y=mix(motion.feet[motion.swing].y,motion.toFoot.y,v);
   foot.lift=mix(motion.feet[motion.swing].lift,0,v)+(s>0&&s<1?Math.sin(Math.PI*s)*(motion.running?13:8):0);
   foot.angle=s>0&&s<1?Math.sin(2*Math.PI*s)*-15:0;
   // A runner releases the trailing foot at toe-off. It can move only once
   // airborne, then remains lifted ready for the next alternating stride.
   if(motion.running&&t>.44){
    const trail=feet[1-motion.swing],q=clamp((t-.44)/.56),w=ease(q),end=motion.trailFoot;
    trail.x=mix(motion.feet[1-motion.swing].x,end.x,w);
    trail.y=mix(motion.feet[1-motion.swing].y,end.y,w);
    trail.lift=Math.sin(q*Math.PI/2)*7;trail.angle=-22*Math.sin(q*Math.PI/2);
   }
   const root=motion.from.map((n,i)=>mix(n,motion.to[i],u)),support=feet[1-motion.swing];
   const singleSupport=Math.sin(Math.PI*t);
   pose={root,feet,facing:pose.facing,bob:-(motion.running?3.5:1.5)*singleSupport,
    balance:Math.max(-1.8,Math.min(1.8,(support.x-root[0])*.15))*singleSupport,
    arm:Math.sin(Math.PI*t)*(motion.swing===1?1:-1),lean:pose.facing*(motion.running?3:1.2)*singleSupport,walking:true,running:motion.running,now};
   if(t>=.76&&!motion.landed){motion.landed=true;contacts++;}
   if(t>=1){lastEnd=motion.start+motion.duration;nextFoot=1-motion.swing;motion=null;pose.walking=false;}
  }
  for(let closing=0;closing<2&&!motion;closing++){
   if(!settle&&now-lastEnd>75){
    const ideal=restFeet(pose.root),needs=i=>Math.hypot(pose.feet[i].x-ideal[i].x,pose.feet[i].y-ideal[i].y)>.05||pose.feet[i].lift>.05;
    const index=needs(nextFoot)?nextFoot:1-nextFoot;
    if(needs(index)){
     settle={start:lastEnd+75,duration:160,index,from:copy(pose.feet[index]),to:ideal[index]};
    }
   }
   if(settle){
    const t=clamp((now-settle.start)/settle.duration),u=ease(t),foot=pose.feet[settle.index];
    foot.x=mix(settle.from.x,settle.to.x,u);foot.y=mix(settle.from.y,settle.to.y,u);
    foot.lift=mix(settle.from.lift,0,u)+(t>0&&t<1?Math.sin(Math.PI*t)*4:0);foot.angle=mix(settle.from.angle,0,u);
    pose.walking=true;pose.running=false;pose.arm=0;pose.bob=-.5*Math.sin(Math.PI*t);pose.balance=(settle.index===0?1:-1)*Math.sin(Math.PI*t);
    if(t>=1){lastEnd=settle.start+settle.duration-75;settle=null;pose.walking=false;pose.bob=pose.balance=pose.lean=0;}else break;
   }else break;
  }
  pose.now=now;
  return {...pose,root:pose.root.slice(),feet:pose.feet.map(copy)};
 }
 function reset(newRoom,nx,ny){target={room:newRoom,x:nx,y:ny};pose=rest(nx,ny,Date.now(),pose.facing);motion=settle=null;lastEnd=-Infinity;contacts=0;nextFoot=1;}
 return {
  sample,
  sync(newRoom,nx,ny){if(target.room!==newRoom||target.x!==nx||target.y!==ny)reset(newRoom,nx,ny);},
  reset,
  busy(now=Date.now()){sample(now);return !!(motion||settle);},
  stepTo(nx,ny,now=Date.now(),{running=false}={}){
   sample(now);if(motion||settle)return false;
   const to=project(nx,ny),dx=to[0]-pose.root[0];
   if(Math.abs(dx)>.1)pose.facing=dx<0?-1:1;
   target.x=nx;target.y=ny;
   if(!enabled||reduced){pose=rest(nx,ny,now,pose.facing);return true;}
   const distance=Math.hypot(to[0]-pose.root[0],to[1]-pose.root[1]);
   const unit=to.map((n,i)=>(n-pose.root[i])/Math.max(.001,distance)),toFoot=restFeet(to)[nextFoot],trailFoot=restFeet(to)[1-nextFoot];
   // Plant ahead of the pelvis: the body advances over this exact contact
   // during the following stride instead of pulling the shoe along the floor.
   const lead=running?12:10;
   toFoot.x+=unit[0]*lead;toFoot.y+=unit[1]*lead;
   trailFoot.x-=unit[0]*5;trailFoot.y-=unit[1]*5;
   motion={start:now,duration:running?Math.max(110,Math.min(200,distance/150*1000)):Math.max(155,Math.min(220,distance/72*1000)),from:pose.root.slice(),to,feet:pose.feet.map(copy),swing:nextFoot,toFoot,trailFoot,running,landed:false};
   return true;
  },
  drainFootfalls(){const n=contacts;contacts=0;return n;},
  get enabled(){return enabled&&!reduced;}
 };
}

// Two rigid segments meet at an elbow/knee. The end point is the real foot
// contact, and segment lengths are invariant throughout stance and swing.
function joint(a,b,upper,lower,bend=1){
 const dx=b[0]-a[0],dy=b[1]-a[1],distance=Math.hypot(dx,dy),d=Math.max(.001,Math.min(upper+lower-.001,Math.max(Math.abs(upper-lower)+.001,distance)));
 const ux=distance>.001?dx/distance:0,uy=distance>.001?dy/distance:1;
 const along=(upper*upper-lower*lower+d*d)/(2*d),out=Math.sqrt(Math.max(0,upper*upper-along*along))*bend;
 return [a[0]+ux*along-uy*out,a[1]+uy*along+ux*out];
}
function rig(pose){
 const groundShift=(pose.feet[0].y+pose.feet[1].y)/2-pose.root[1];
 const hip=[pose.balance,-41+pose.bob+groundShift*.6],legs=[],arms=[];
 // Up-screen steps change the projected ground height. Lower the pelvis
 // slightly instead of stretching a shin or dragging its planted shoe.
 for(let i=0;i<2;i++){
  const foot=pose.feet[i],side=i===0?-1:1;
  const dx=foot.x-pose.root[0]-(hip[0]+side*3.5),ankleY=foot.y-pose.root[1]-foot.lift-3;
  hip[1]=Math.max(hip[1],ankleY-Math.sqrt(Math.max(0,39.5*39.5-dx*dx)));
 }
 const body=[hip[0]+pose.lean,hip[1]];
 for(let i=0;i<2;i++){
  const side=i===0?-1:1,foot=pose.feet[i],a=[hip[0]+side*3.5,hip[1]],b=[foot.x-pose.root[0],foot.y-pose.root[1]-foot.lift-3];
  legs.push({hip:a,knee:joint(a,b,20,20,-pose.facing),ankle:b,foot:[b[0],b[1]+3],angle:foot.angle});
  const shoulder=[body[0]+side*10,body[1]-24],swing=-pose.arm*side*pose.facing*(pose.running?9:5);
  const wrist=[body[0]+side*13+swing,body[1]+(pose.running?-3:5)-Math.abs(swing)*.3];
  arms.push({shoulder,elbow:joint(shoulder,wrist,15,15,-side),wrist});
 }
 return {hip,body,legs,arms,head:[body[0]+pose.lean*.3,body[1]-39]};
}
const number=n=>Number(n.toFixed(3)),pt=p=>p.map(number).join(' ');
const stroke=(d,c,width,opacity=1)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
const linePath=points=>'M'+points.map(pt).join(' L');
function draw(styleId,pose){
 const style=styles.find(s=>s.id===styleId)||styles[0],r=rig(pose),facing=pose.facing;
 const arm=i=>{const a=r.arms[i],d=linePath([a.shoulder,a.elbow,a.wrist]);return stroke(d,ink,6.2,.72)+stroke(d,style.skin,4.6,.9)+stroke(style.shortSleeves?linePath([a.shoulder,a.elbow]):d,style.id==='vest'?style.legs:style.top,4.5,.84)+`<g transform="translate(${pt(a.wrist)}) rotate(${i===0?-12:12})"><path d="M-2 -1 L-2 4 M0 0 V5 M2 0 V4" fill="none" stroke="${style.skin}" stroke-width="1.2" stroke-linecap="round"/><circle r="2.4" fill="${style.skin}" stroke="${ink}" stroke-width=".55"/></g>`;};
 let legs='';
 for(const [i,leg]of r.legs.entries()){
  const d=linePath([leg.hip,leg.knee,leg.ankle]),foot=pose.feet[i];
  legs+=`<g class="player-leg" data-leg="${i}">`+stroke(d,ink,7.1,.7)+stroke(d,style.legs,5.7,.94);
  if(style.id==='stripes')legs+=stroke(d,'url(#player-dots)',5.6);
  legs+=`<g class="player-foot" data-foot="${i}" data-ground-x="${number(foot.x)}" data-ground-y="${number(foot.y)}" data-lift="${number(foot.lift)}" transform="translate(${pt(leg.foot)}) rotate(${leg.angle}) scale(${facing} 1)"><path d="M-3 -4 L2 -4 L7 -.5 L7 1 L-4 1 Z" fill="${style.shoes}" fill-opacity=".95" stroke="${ink}" stroke-width=".7"/>${style.id==='stars'?`<path d="M-3 -13 L3 -12 L2 -3 L6 1 L-4 1 Z" fill="${style.shoes}" fill-opacity=".8" stroke="${ink}" stroke-width=".7"/>`:''}</g></g>`;
 }
 const torso=style.pattern==='ruffle'?'M-10 -30 Q-17 -33 -17 -24 Q-22 -20 -17 -15 Q-21 -7 -15 -4 Q-15 5 -8 3 Q-3 8 1 3 Q9 8 12 2 Q20 3 16 -5 Q23 -10 17 -16 Q23 -23 16 -26 Q16 -35 9 -31 Q2 -38 -3 -31 Z':style.pattern==='vest'?'M-8 -29 Q-18 -33 -18 -25 Q-23 -20 -17 -15 Q-23 -10 -17 -5 Q-23 3 -12 4 L12 4 Q23 3 17 -5 Q23 -10 17 -15 Q23 -20 18 -25 Q18 -33 8 -29 Z':style.pattern==='curls'?'M-8 -29 L8 -29 L16 2 Q0 7 -16 2 Z':'M-8 -29 L8 -29 L12 -20 L9 2 L-9 2 L-12 -20 Z';
 let pattern='';
 if(style.pattern==='checks'){
  for(let x=-16;x<=16;x+=6)pattern+=stroke(`M${x} -35 V8`,ink,1,.72);
  for(let y=-32;y<=4;y+=6)pattern+=stroke(`M-20 ${y} H20`,ink,1,.72);
 }else if(style.pattern==='stripes'){
  for(let x=-17;x<20;x+=5)pattern+=stroke(`M${x} -35 l6 44`,ink,1.3,.8);
 }else if(style.pattern==='curls'){
  for(let y=-23;y<=0;y+=9)pattern+=stroke(`M-16 ${y} q8 6 7 0 q-2 -6 -4 -1 q-1 7 10 4 q6 -2 3 -6 q-5 -1 -1 5 q5 3 10 -1`,ink,1,.8);
 }else if(style.pattern==='stars'){
  for(const [x,y]of [[-3,-22],[5,-12],[-3,-3]])pattern+=`<path d="M${x} ${y-3} l1.3 2.2 2.6 .3 -1.8 1.8 .5 2.6 -2.6 -1.3 -2.3 1.3 .4 -2.6 -1.8 -1.8 2.4 -.3 Z" fill="none" stroke="${ink}" stroke-width=".8"/>`;
 }else if(style.pattern==='ruffle')pattern+=stroke('M-4 -24 q-5 -4 -6 3 q-7 2 -2 7 q-5 6 1 8 q0 7 7 4 q7 4 9 -3 q7 -1 3 -8 q4 -6 -3 -8 q-4 -7 -9 -3',ink,.9,.7);
 let details='';
 if(style.pattern==='bib')details=`<path d="M-8 -29 L-5 -13 L6 -13 L9 -29 M-8 -17 H8 V3 H-8 Z" fill="${paper}" fill-opacity=".93" stroke="${ink}" stroke-width=".8"/><path d="M-4 -12 H4 V-5 Q0 -1 -4 -5 Z" fill="none" stroke="${ink}" stroke-width=".8"/>`;
 if(style.id==='checks')details=`<path d="M-2 -28 H2 L1 -23 L4 -7 L0 -4 L-4 -7 L-1 -23 Z" fill="#de6554" stroke="#de6554"/>`;
 if(style.id==='vest')details=stroke('M0 -30 V4',ink,1.1)+[-24,-15,-6,3].map(y=>`<circle cy="${y}" r="1.4" fill="${paper}" stroke="${ink}" stroke-width=".6"/>`).join('');
 const clothes=`<g class="player-torso" transform="translate(${pt(r.body)})"><path d="${torso}" fill="${style.top}" fill-opacity=".83" stroke="${ink}" stroke-width=".9"/><g clip-path="url(#player-shirt-clip)">${pattern}</g>${details}${style.skirt?`<path d="M-10 4 H10 L8 19 H-8 Z" fill="${paper}" fill-opacity=".93" stroke="${ink}" stroke-width=".8"/>`:''}</g>`;
 let hair='';
 if(style.id==='overalls')hair='<path d="M-8 -9 L-13 -12 L-9 -14 L-13 -15 L-8 -16 L-10 -19 Q4 -24 8 -12 L5 -8 L0 -12 Z"/>';
 if(style.id==='checks')hair='<path d="M-13 -12 Q-4 -15 -5 -25 Q-1 -29 1 -24 Q6 -31 9 -16 L16 -13 Q0 -9 -13 -12 Z"/>';
 if(style.id==='curls')hair='<path d="M-9 -9 Q-15 -18 -7 -22 Q-5 -30 -2 -27 Q-1 -36 2 -33 Q5 -27 4 -22 Q13 -24 9 -14 L5 -9 L0 -14 Z"/>';
 if(style.id==='ruffle')hair='<path d="M-8 -9 Q-13 -20 0 -22 Q5 -24 4 -33 Q4 -44 12 -43 Q20 -39 14 -30 Q9 -26 8 -31 Q10 -19 2 -18 L-4 -9 Z"/>';
 if(style.id==='stripes')hair='<path d="M-8 -9 Q-14 -16 -8 -20 Q-19 -23 -15 -30 Q-25 -35 -20 -41 Q-24 -48 -18 -49 Q-10 -47 -16 -41 Q-7 -36 -10 -30 Q0 -27 -1 -21 Q11 -28 17 -23 Q23 -30 26 -24 Q29 -15 20 -16 Q15 -9 8 -14 L4 -9 Z"/>';
 if(style.id==='vest')hair='<path d="M-9 7 Q-18 5 -13 -2 Q-21 -8 -13 -12 Q-18 -20 -10 -22 Q-6 -29 0 -23 Q6 -29 10 -22 Q18 -22 14 -14 Q21 -10 15 -3 Q20 4 12 7 Z"/>';
 if(style.id==='stars')hair='<path d="M-8 -9 Q-12 -17 -5 -21 Q-12 -24 -7 -28 Q-2 -31 -6 -34 Q-9 -31 -10 -35 Q-2 -43 3 -35 Q11 -30 5 -24 Q11 -17 7 -10 L2 -14 Z"/>';
 const blink=(pose.now%6100)>5790&&(pose.now%6100)<5940;
 const face=`<path d="M-7 -11 Q0 -15 7 -11 L6 5 Q0 10 -6 5 Z" fill="${style.skin}" fill-opacity=".96" stroke="${ink}" stroke-width=".8"/><path d="M1 -4 l3 4 H1 M-2 3 q3 2 5 -1" fill="none" stroke="${ink}" stroke-width=".75"/>${[-3,4].map(x=>`<ellipse cx="${x}" cy="-5" rx=".7" ry="${blink?.12:1.05}" fill="${ink}"/>`).join('')}${style.id==='vest'?'<g fill="none" stroke="#315e68" stroke-width=".75"><circle cx="-3" cy="-5" r="2.7"/><circle cx="4" cy="-5" r="2.7"/><path d="M0 -5 H1"/></g>':''}${style.id==='checks'?'<path d="M-4 1 Q0 -4 2 1 Q5 -2 5 2" fill="#315e68"/>':''}`;
 const head=`<g class="player-head" transform="translate(${pt(r.head)}) rotate(${pose.lean*.7}) scale(${facing} 1)"><path d="M-3 5 V13 H3 V5" fill="${style.skin}" stroke="${ink}" stroke-width=".7"/><g fill="${style.hair}" fill-opacity=".92">${hair}</g>${face}${style.id==='vest'?'':`<g fill="${style.hair}" fill-opacity=".92">${hair}</g>`}</g>`;
 return `<title>You — ${style.name}</title><defs><clipPath id="player-shirt-clip"><path d="${torso}"/></clipPath><pattern id="player-dots" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${ink}"/></pattern></defs><g class="player-rig" data-style="${style.id}" data-walking="${pose.walking}" data-running="${pose.running}" transform="translate(${pt(pose.root)})"><ellipse rx="16" ry="6" fill="${ink}" opacity=".10"/><ellipse rx="18" ry="8" fill="none" stroke="#3b9ebc" stroke-opacity=".45" stroke-dasharray="2 4" stroke-width="1"/><g class="player-figure">${arm(facing>0?0:1)}${legs}${clothes}${arm(facing>0?1:0)}${head}</g></g>`;
}
window.BramblePlayer={styles,randomStyle:()=>styles[Math.floor(Math.random()*styles.length)].id,isStyle:id=>styles.some(s=>s.id===id),create,rest,rig,joint,draw};
})();
