const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
class Element{
 constructor(id){this.id=id;this.listeners={};this.hidden=false;this.open=false;this.textContent='';this.innerHTML='';this.dataset={};this.children=[];this.classList={toggle(){}};}
 addEventListener(n,f){this.listeners[n]=f;}setAttribute(){}replaceChildren(...c){this.children=c;}append(...c){this.children.push(...c);}showModal(){this.open=true;}close(){this.open=false;}querySelector(){return null;}querySelectorAll(){return [];}matches(){return false;}
}
function game(storage,random){
 let now=1000;const elements={},intervals=new Map(),keys={};
 for(const match of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/id="([^"]+)"/g))elements[match[1]]=new Element(match[1]);
 const panels=['play','inventory','journal','atlas'].map(n=>{const e=new Element();e.dataset.panel=n;return e;});
 const sandbox={window:{addEventListener(){}},document:{hidden:false,getElementById:id=>elements[id],querySelector:()=>Object.values(elements).find(e=>e.open),querySelectorAll:q=>q.includes('data-verb')?elements.verbs.children:q.includes('move')?[]:panels,createElement:tag=>new Element(tag),addEventListener(n,f){keys[n]=f;}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval(f,period){intervals.set(period,f);},setTimeout(){},clearTimeout(){},requestAnimationFrame(){},Date:class extends Date{static now(){return now;}},Math:Object.assign(Object.create(Math),{random:()=>random}),console};
 for(const file of ['audio.js','adventure-data.js','player.js','visuals.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
 const code=fs.readFileSync(path.join(root,'game.js'),'utf8').replace(/\}\)\(\);\s*$/,`window.test={get state(){return state},get route(){return route},get scene(){return scene},move,approach,playerMotion,travel,start};})();`);
 vm.runInNewContext(code,sandbox);
 return {t:sandbox.window.test,e:elements,tick(ms=45){now+=ms;intervals.get(45)();},key(key){keys.keydown({key,target:{matches:()=>false},preventDefault(){}});},now:()=>now};
}
const storage=new Map(),g=game(storage,0),t=g.t;t.start();
assert.equal(t.state.playerStyle,'overalls');
assert(t.move(1,0));assert.equal(t.state.x,30);
assert(!t.move(1,0),'Repeated input must not teleport ahead of the visual step');
assert(t.playerMotion.busy(g.now()));
const rootBefore=t.playerMotion.sample(g.now()).root;
g.tick(100);const halfway=t.playerMotion.sample(g.now()).root;
assert(halfway[0]>rootBefore[0],'The character should move between tiles');
g.key('ArrowRight');for(let n=0;n<20&&t.state.x===30;n++)g.tick();
assert.equal(t.state.x,31,'A buffered key should execute after the previous footfall');
g.tick(300);
const clock=t.scene.find(o=>o.id==='clock');t.approach(clock,'open');
let awaitedLanding=false;
for(let n=0;n<1000&&g.e.speaker.textContent!==clock.name;n++){
 g.tick();
 if(!t.route.length&&t.playerMotion.busy(g.now())){
  awaitedLanding=true;assert.notEqual(g.e.speaker.textContent,clock.name,'Interaction must wait for arrival');
 }
}
assert(awaitedLanding);assert.equal(g.e.speaker.textContent,clock.name);
assert(!t.playerMotion.busy(g.now()));
const reloaded=game(storage,.99);assert.equal(reloaded.t.state.playerStyle,'overalls','Reload must retain the randomly chosen look');
reloaded.e['confirm-restart'].onclick();assert.equal(reloaded.t.state.playerStyle,'stars','A new night chooses a fresh style');
const damaged=JSON.parse(storage.get('ascicat.adventure.v2'));damaged.playerStyle='missing';storage.set('ascicat.adventure.v2',JSON.stringify(damaged));
assert.equal(game(storage,.5).t.state.playerStyle,'ruffle','An invalid saved style should migrate safely');
console.log('PASS: smooth movement integration, buffered keyboard input, interaction after landing, persistent randomized appearance, new-night selection, and save migration.');
