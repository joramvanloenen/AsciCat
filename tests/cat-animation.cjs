const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = {window:{}};
for (const file of ['adventure-data.js','geometry.js', 'visuals.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const v = context.window.BrambleVisuals;
const {cats, rooms} = context.window.AsciAdventure;
const position = {fromX:20, fromY:12, x:21, y:12, moveStarted:1000, movingUntil:1850};
const source = v.project(20,12), destination = v.project(21,12);
for (const time of [900,1000,1100,1425,1750,1850,2000]) {
  const offset = v.catOffset(position,time);
  const point = destination.map((p,i)=>p+offset[i]);
  for (let i=0;i<2;i++) assert(point[i]>=Math.min(source[i],destination[i]) && point[i]<=Math.max(source[i],destination[i]));
  if (time<=1000) assert.deepEqual(Array.from(point),Array.from(source));
  if (time>=1850) assert.deepEqual(Array.from(point),Array.from(destination));
  if (time===1425) point.forEach((p,i)=>assert(Math.abs(p-(source[i]+destination[i])/2)<.001));
}
assert.deepEqual(Array.from(v.catOffset({x:21,y:12},1000)),[0,0]);
assert.deepEqual(Array.from(v.catOffset({...position,movingUntil:1000},1000)),[0,0]);
const styles = time => Object.fromEntries(v.catMotionStyle(0,time).split(';').map(s=>s.split(':')));
const before=styles(123456), after=styles(123656);
for (const part of ['head','blink','tail','breath']) {
  const duration=parseFloat(before['--'+part+'-duration']);
  const elapsed=(parseFloat(before['--'+part+'-phase'])-parseFloat(after['--'+part+'-phase'])+duration)%duration;
  assert(Math.abs(elapsed-.2)<.002,'Room redraw must preserve '+part+' animation time');
}
assert.notEqual(v.catMotionStyle(0,123456),v.catMotionStyle(1,123456),'Kittens need independent animation clocks');
const pos=Object.fromEntries(cats.map(c=>[c.id,{x:c.x,y:c.y}]));
const svg=v.render({state:{room:'foyer',x:29,y:20,flags:{}},scene:[],cats,pos,room:rooms.foyer});
assert(svg.includes('data-cat-id="'+cats.find(c=>c.room==='foyer').id+'"'));
assert(svg.includes('cat-shape is-animated'));
for (const part of ['cat-head','cat-eyes','cat-tail','cat-leg-front','cat-leg-back']) assert(svg.includes(part));
assert(!v.cover().includes('is-animated'),'Illustrations should remain still');
console.log('PASS: kitten movement reaches each tile smoothly, animation clocks survive redraws, cats have independent timing, and illustrations stay still.');
