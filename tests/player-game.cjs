const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
class Element{
 constructor(id){this.id=id;this.listeners={};this.hidden=false;this.open=false;this.textContent='';this.innerHTML='';this.dataset={};this.children=[];this.classList={toggle(){}};}
 addEventListener(n,f){this.listeners[n]=f;}setAttribute(){}replaceChildren(...c){this.children=c;}append(...c){this.children.push(...c);}showModal(){this.open=true;}close(){this.open=false;}querySelector(selector){return this.id==='screen'&&selector==='svg'?{getBoundingClientRect:()=>({left:0,top:0,width:1000,height:660})}:null;}querySelectorAll(){return [];}matches(){return false;}
}
function game(storage,random){
 let now=1000;const elements={},intervals=new Map(),keys={};
 for(const match of fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/id="([^"]+)"/g))elements[match[1]]=new Element(match[1]);
 const panels=['play','inventory','journal','atlas'].map(n=>{const e=new Element();e.dataset.panel=n;return e;});
 const sandbox={window:{addEventListener(){}},document:{hidden:false,getElementById:id=>elements[id],querySelector:()=>Object.values(elements).find(e=>e.open),querySelectorAll:q=>q.includes('data-verb')?elements.verbs.children:q.includes('move')?[]:panels,createElement:tag=>new Element(tag),addEventListener(n,f){keys[n]=f;}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval(f,period){intervals.set(period,f);},setTimeout(){},clearTimeout(){},requestAnimationFrame(){},Date:class extends Date{static now(){return now;}},Math:Object.assign(Object.create(Math),{random:()=>random}),console};
 for(const file of ['audio.js','adventure-data.js','player.js','visuals.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
 const code=fs.readFileSync(path.join(root,'game.js'),'utf8').replace(/\}\)\(\);\s*$/,`window.test={get state(){return state},get route(){return route},get scene(){return scene},move,approach,playerMotion,travel,start,selectVerb,render};})();`);
 vm.runInNewContext(code,sandbox);
 return {t:sandbox.window.test,e:elements,tick(ms=25){now+=ms;intervals.get(25)();},key(key,repeat=false){keys.keydown({key,repeat,target:{matches:()=>false},preventDefault(){}});},now:()=>now};
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
const keyboard=game(new Map(),0);keyboard.t.start();
keyboard.key('ArrowRight');keyboard.tick(50);keyboard.key('ArrowRight');
for(let n=0;n<20&&!keyboard.t.playerMotion.sample(keyboard.now()).running;n++)keyboard.tick();
assert(keyboard.t.playerMotion.sample(keyboard.now()).running,'Double tap should start a running stride');
assert.equal(keyboard.t.state.x,32,'A running stride should cover two unobstructed tiles');
const held=game(new Map(),0);held.t.start();held.key('ArrowRight');held.tick(50);held.key('ArrowRight',true);
for(let n=0;n<10&&held.t.state.x===30;n++)held.tick();
assert(!held.t.playerMotion.sample(held.now()).running,'Keyboard auto-repeat must not count as a double tap');
for(const secondDetail of [2,1]){
 const pointer=game(new Map(),0);pointer.t.start();pointer.t.selectVerb('walk');
 const click=detail=>pointer.e.screen.onclick({clientX:528.6,clientY:466.8,detail,target:{closest:()=>null}});
 click(1);pointer.tick(50);click(secondDetail);
 for(let n=0;n<20&&!pointer.t.playerMotion.sample(pointer.now()).running;n++)pointer.tick();
 assert(pointer.t.playerMotion.sample(pointer.now()).running,'Double click/touch taps should run to the destination');
 for(let n=0;n<500&&(pointer.t.route.length||pointer.t.playerMotion.busy(pointer.now()));n++)pointer.tick();
 assert.equal(pointer.t.state.x,41);assert.equal(pointer.t.state.y,20);
 pointer.e.screen.onclick({clientX:433.2,clientY:423.6,detail:1,target:{closest:()=>null}});
 pointer.tick();assert(!pointer.t.playerMotion.sample(pointer.now()).running,'A new single click returns to walking');
}
const collision=game(new Map(),0);collision.t.start();collision.t.state.x=4;collision.t.state.y=4;collision.t.render();
assert(collision.t.move(1,0,true));assert.equal(collision.t.state.x,5,'Running cannot skip an intervening furniture tile');
collision.tick(1000);assert(!collision.t.move(1,0,true));assert.equal(collision.t.state.x,5);
console.log('PASS: smooth movement integration, double click/touch tap/key running, single-click walking, collision-checked strides, buffered keyboard input, interaction after landing, persistent randomized appearance, new-night selection, and save migration.');
