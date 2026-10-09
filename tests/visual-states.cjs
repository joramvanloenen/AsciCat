const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{}};
for(const file of ['adventure-data.js','geometry.js','visuals.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const D=context.window.AsciAdventure,V=context.window.BrambleVisuals,G=context.window.BrambleGeometry;
function render(o,flags={}){return V.render({state:{room:o.room,x:29,y:20,flags,orientations:[3,2,1]},scene:[o],cats:[],pos:{},room:D.rooms[o.room]});}
const openables=D.objects.filter(o=>o.openable||['sideboard','cupboard','piano','curtain','stairs'].includes(o.id));
for(const o of openables){const closed=render(o),open=render(o,{['open:'+o.id]:true});assert.notEqual(open,closed,o.id+': Open needs different artwork');assert(!/NaN|undefined/.test(open),o.id+': invalid open-state coordinates');}
for(const o of D.objects.filter(o=>o.id.includes('Portrait'))){
 const svg=render(o),m=svg.match(/class="portrait-frame ink" data-frame-width="(\d+)" data-frame-height="(\d+)"/);
 assert(m,o.id+': missing portrait frame');assert(Number(m[1])<Number(m[2]),o.id+': portrait should be taller than it is wide');
 assert(!svg.includes('rx="365"'),'The room must not have a floating cast shadow');
}
const bowl=D.objects.find(o=>o.id==='milkBowl'),svg=render(bowl);
const match=svg.match(/class="round-bowl"[^]*?<polygon[^>]*points="([^"]+)"/);assert(match);
const ring=match[1].split(' ').map(s=>s.split(',').map(Number));assert(ring.length>20,'The bowl needs a round perimeter');
const g=G.get(bowl.room),radius=Math.min(bowl.size[0]*g.sx,bowl.size[1]*g.sy)*.46*.72;
const center=G.project(bowl.x+bowl.size[0]/2,bowl.y+bowl.size[1]/2,0,bowl.room);
for(const [x,y]of ring){const a=x-center[0],b=(y-center[1])*2;assert(Math.abs(Math.hypot((a+b)/2,(b-a)/2)-radius)<.02,'Bowl base must be circular in floor space and rest at floor height');}
const bench=D.objects.find(o=>o.id==='pianoBench'),piano=D.objects.find(o=>o.id==='piano');assert(bench.backless);assert.equal(bench.facing,'n');assert(bench.y>=piano.y+piano.size[1]);assert(bench.y<piano.y+piano.size[1]+3,'Bench should be close to the keyboard');
const benchSvg=render(bench);assert(!benchSvg.includes('hinged-panel'));
const cabinet=D.objects.find(o=>o.id==='sideboard'),cabinetSvg=render(cabinet,{'open:sideboard':true});assert(cabinetSvg.includes('open-drawer'));assert(cabinetSvg.includes('floor-furniture'));
console.log(`PASS: ${openables.length} distinct open/closed prop states, upright portrait proportions, a physically round grounded milk bowl, floor-supported furniture, a keyboard-facing backless bench, and no room shadow.`);

const highWindow=D.objects.find(o=>o.id==='highWindow'),latch=D.objects.find(o=>o.id==='highLatch');
assert(G.get(highWindow.room).highLedge>130,'High ledge must be visibly above standing reach');
assert(G.get(latch.room).highLatch>G.get(latch.room).doorHeight+40,'Latch belongs above the nursery doorway');
assert.notEqual(render(highWindow),render(highWindow,{hookReached:true}),'Reaching the hook removes it from the high ledge');
console.log('PASS: ledge and latch above standing reach, and recovered hook removed from its elevated display.');
