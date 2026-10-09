const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','player.js'),'utf8'),context);
const player=context.window.BramblePlayer;
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function anatomy(pose){
 const rig=player.rig(pose);
 for(const leg of rig.legs){
  assert(Math.abs(distance(leg.hip,leg.knee)-20)<1e-7,'Thigh length must remain constant');
  assert(Math.abs(distance(leg.knee,leg.ankle)-20)<1e-7,'Shin length must remain constant');
 }
 for(const arm of rig.arms){
  assert(Math.abs(distance(arm.shoulder,arm.elbow)-15)<1e-7,'Upper arm must not stretch');
  assert(Math.abs(distance(arm.elbow,arm.wrist)-15)<1e-7,'Forearm must not stretch');
 }
 const left=rig.arms[0].wrist[0]-rig.arms[0].shoulder[0]+3;
 const right=rig.arms[1].wrist[0]-rig.arms[1].shoulder[0]-3;
 assert(Math.abs(left+right)<1e-7,'Arms should swing in opposite directions');
}
let frames=0;
for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
 const motion=player.create('foyer',20,12);let now=1000,swing=1;
 for(let step=1;step<=10;step++){
  const before=motion.sample(now),support=before.feet[1-swing];
  assert(motion.stepTo(20+step*dx,12+step*dy,now));
  assert(!motion.stepTo(20+step*dx,12+step*dy,now+1),'Cannot interrupt a planted step');
  for(let elapsed=0;elapsed<=200;elapsed+=5){
   const pose=motion.sample(now+elapsed),foot=pose.feet[1-swing];
   assert.equal(foot.x,support.x,'Stance foot cannot slide sideways');
   assert.equal(foot.y,support.y,'Stance foot cannot slide in depth');
   assert.equal(foot.lift,0,'Stance foot must remain on the floor');
   anatomy(pose);frames++;
  }
  const end=motion.sample(now+270);anatomy(end);
  assert(end.feet[swing].lift<1e-6,'Swing foot must land');
  assert.equal(motion.drainFootfalls(),1,'Exactly one footfall per step');
  assert.equal(motion.drainFootfalls(),0,'A redraw cannot replay the footfall');
  now+=270;swing=1-swing;
 }
 const stopped=motion.sample(now+1000),rest=player.rest(20+10*dx,12+10*dy);
 assert(!stopped.walking);anatomy(stopped);
 for(let i=0;i<2;i++){
  assert(Math.abs(stopped.feet[i].x-rest.feet[i].x)<.001);
  assert(Math.abs(stopped.feet[i].y-rest.feet[i].y)<.001);
 }
}
const turning=player.create('foyer',20,12);
assert(turning.stepTo(21,12,1000));const contact=turning.sample(1270).feet[1];
assert(turning.stepTo(21,11,1270));
assert.equal(turning.sample(1400).feet[1].x,contact.x,'Turning must retain the planted foot');
assert.equal(turning.sample(1400).feet[1].y,contact.y);
const reduced=player.create('foyer',20,12,{reduced:true});
assert(reduced.stepTo(21,12,1000));assert(!reduced.busy(1001));assert(!reduced.sample(1001).walking);
turning.sync('library',29,20);assert.deepEqual(Array.from(turning.sample(2000).root),Array.from(player.rest(29,20).root));
assert.equal(player.styles.length,7);assert.equal(new Set(player.styles.map(s=>s.id)).size,7);
for(const style of player.styles){
 const art=player.draw(style.id,player.rest(29,20));
 assert(art.includes('data-style="'+style.id+'"'));
 assert(!/NaN|undefined/.test(art));
}
console.log(`PASS: ${frames} gait frames in all four directions, fixed stance feet, invariant limb lengths, opposed arm swings, landing sounds, turns, closing steps, room resets, reduced motion, and seven character styles.`);
