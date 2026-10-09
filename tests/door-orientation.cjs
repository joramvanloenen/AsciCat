const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = {window:{}};
for (const file of ['adventure-data.js','geometry.js', 'visuals.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
}
const {rooms} = context.window.AsciAdventure;
const visuals = context.window.BrambleVisuals;
const doors = {n:[29,0], s:[29,22], w:[0,11], e:[57,11]};
const directions = new Set();
let checked = 0;
for (const [id, room] of Object.entries(rooms)) {
  const scene = Object.entries(room.exits).map(([dir, to]) => ({
    id:'door:'+dir, name:rooms[to].name, room:id, dir, to,
    x:(room.doorPositions?.[dir]||doors[dir])[0], y:(room.doorPositions?.[dir]||doors[dir])[1], art:['+']
  }));
  const svg = visuals.render({room, scene, cats:[], pos:{}, state:{room:id, x:29, y:20, flags:{}}});
  for (const door of scene) {
    const match = svg.match(new RegExp('data-target="door:'+door.dir+'"[^]*?<polygon[^>]*points="([^"]+)"'));
    assert(match, id+': missing door artwork');
    const [a,b,c,d] = match[1].split(' ').map(p => p.split(',').map(Number));
    const center = visuals.project(door.x, door.y,0,id);
    const northSouth = door.dir==='n'||door.dir==='s';
    const origin = visuals.project(0,0,0,id);
    const along = visuals.project(northSouth?1:0, northSouth?0:1,0,id);
    const wall = [along[0]-origin[0], along[1]-origin[1]];
    const edge = [b[0]-a[0], b[1]-a[1]];
    assert(Math.abs(edge[0]*wall[1]-edge[1]*wall[0])<.01,
      id+'/'+door.dir+': door must be parallel to its wall');
    assert(Math.abs((a[0]+b[0])/2-center[0])<.01 && Math.abs((a[1]+b[1])/2-center[1])<.01,
      id+'/'+door.dir+': doorway must remain centered on the exit');
    assert.equal(c[0], b[0]); assert.equal(d[0], a[0]);
    assert(Math.abs(b[1]-c[1]-98)<.01); assert(Math.abs(a[1]-d[1]-98)<.01);
    directions.add(door.dir); checked++;
  }
}
assert.equal(directions.size,4);
console.log(`PASS: ${checked} doorways across ${Object.keys(rooms).length} rooms align with their walls in all four directions.`);
