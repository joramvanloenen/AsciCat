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
 for(const file of ['audio.js','adventure-data.js','geometry.js','player.js','visuals.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
 const code=fs.readFileSync(path.join(root,'game.js'),'utf8').replace(/\}\)\(\);\s*$/,`window.test={get state(){return state},get verb(){return verb},get route(){return route},get scene(){return scene},get transitioning(){return transitioning},say,closeConversation,transitionRoom,move,approach,playerMotion,travel,start,selectVerb,render};})();`);
 vm.runInNewContext(code,sandbox);
 return {t:sandbox.window.test,e:elements,tick(ms=25){now+=ms;intervals.get(25)();},key(key,repeat=false){keys.keydown({key,repeat,target:{matches:()=>false},preventDefault(){}});},now:()=>now};
}
const storage=new Map(),g=game(storage,0),t=g.t;t.start();
assert.equal(t.state.playerStyle,'overalls');
assert.equal(t.verb,'walk','A new adventure starts with Walk');
assert(g.e['pocket-tray'].hidden);
const retainedRoom=g.e.screen.innerHTML;
assert(t.move(1,0));assert.equal(t.state.x,30);
assert.equal(g.e.screen.innerHTML,retainedRoom,'Walking retains scenery and hotspot nodes instead of rebuilding labels');
assert(!t.move(1,0),'Repeated input must not teleport ahead of the visual step');
assert(t.playerMotion.busy(g.now()));
const rootBefore=t.playerMotion.sample(g.now()).root;
g.tick(100);const halfway=t.playerMotion.sample(g.now()).root;
assert(halfway[0]>rootBefore[0],'The character should move between tiles');
g.key('ArrowRight');for(let n=0;n<20&&t.state.x===30;n++)g.tick();
assert.equal(t.state.x,31,'A buffered key should execute after the previous footfall');
g.tick(300);
const clock=t.scene.find(o=>o.id==='clock');t.approach(clock,'open');
for(let n=0;n<20&&!t.playerMotion.sample(g.now()).running;n++)g.tick();assert(t.playerMotion.sample(g.now()).running,'Verb interactions must run into reach');
let awaitedLanding=false;
for(let n=0;n<1000&&g.e.speaker.textContent!==clock.name;n++){
 g.tick();
 if(!t.route.length&&t.playerMotion.busy(g.now())){
  awaitedLanding=true;assert.notEqual(g.e.speaker.textContent,clock.name,'Interaction must wait for arrival');
 }
}
assert(awaitedLanding);assert.equal(g.e.speaker.textContent,clock.name);
assert(!t.playerMotion.busy(g.now()));
t.selectVerb('use');assert(!g.e['pocket-tray'].hidden,'Use reveals the item tray');t.selectVerb('walk');assert(g.e['pocket-tray'].hidden);
const reloaded=game(storage,.99);assert.equal(reloaded.t.verb,'walk','Reload defaults to Walk');assert.equal(reloaded.t.state.playerStyle,'overalls','Reload must retain the randomly chosen look');
reloaded.e['confirm-restart'].onclick();assert.equal(reloaded.t.verb,'walk','Restart defaults to Walk');assert.equal(reloaded.t.state.playerStyle,'stars','A new night chooses a fresh style');
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
 const click=detail=>pointer.e.screen.onclick({clientX:462.1,clientY:488.1,detail,target:{closest:()=>null}});
 click(1);pointer.tick(50);click(secondDetail);
 for(let n=0;n<20&&!pointer.t.playerMotion.sample(pointer.now()).running;n++)pointer.tick();
 assert(pointer.t.playerMotion.sample(pointer.now()).running,'Double click/touch taps should run to the destination');
 for(let n=0;n<500&&(pointer.t.route.length||pointer.t.playerMotion.busy(pointer.now()));n++)pointer.tick();
 assert.equal(pointer.t.state.x,41);assert.equal(pointer.t.state.y,20);
 pointer.e.screen.onclick({clientX:388.3,clientY:451.2,detail:1,target:{closest:()=>null}});
 pointer.tick();assert(!pointer.t.playerMotion.sample(pointer.now()).running,'A new single click returns to walking');
}
const collision=game(new Map(),0);collision.t.start();collision.t.state.x=4;collision.t.state.y=2;collision.t.render();
assert(collision.t.move(1,0,true));assert.equal(collision.t.state.x,5,'Running cannot skip an intervening furniture tile');
collision.tick(1000);assert(!collision.t.move(1,0,true));assert.equal(collision.t.state.x,5);
console.log('PASS: smooth movement integration, double click/touch tap/key running, single-click walking, collision-checked strides, buffered keyboard input, interaction after landing, persistent randomized appearance, new-night selection, and save migration.');

async function presentation(){
 const g=game(new Map(),0);g.t.start();const prior=g.e.dialogue.textContent;
 g.t.say('Pip','A very important kitten opinion.',{id:'pip',name:'Pip'});
 assert(!g.e['talk-cloud'].hidden);assert.equal(g.e['talk-speaker'].textContent,'Pip');assert.equal(g.e['talk-text'].textContent,'A very important kitten opinion.');
 assert.equal(g.e.dialogue.textContent,prior,'Talking must not replace field observations');
 g.e['close-talk'].onclick();assert(g.e['talk-cloud'].hidden);
 g.t.say('Pip','Another opinion.',{id:'pip',name:'Pip'});g.t.say('Clock','Only dust.');assert(g.e['talk-cloud'].hidden);
 const fades=[],stage=g.e['room-stage'];stage.animate=(frames,options)=>{let resolve;const animation={frames,options,cancelled:false,finished:new Promise(r=>resolve=r),cancel(){this.cancelled=true;},resolve:()=>resolve()};fades.push(animation);return animation;};
 let complete=false;g.t.travel('hall','n',()=>complete=true);
 assert(g.t.transitioning);assert.equal(g.t.state.room,'foyer','Old room stays visible during fade-out');assert.equal(fades.length,1);
 assert.equal(fades[0].frames[1].opacity,0);assert(!g.t.move(1,0),'Input must not move through a transition');
 g.t.travel('library','w');assert.equal(fades.length,1,'Repeated doors cannot start overlapping fades');
 fades[0].resolve();await new Promise(resolve=>setImmediate(resolve));assert.equal(g.t.state.room,'hall');assert.equal(fades.length,2);assert.equal(fades[1].frames[0].opacity,0);assert(!complete);
 assert(g.t.state.flags['open:door:foyer:n']);assert(g.t.state.flags['open:door:hall:s']);
 fades[1].resolve();await new Promise(resolve=>setImmediate(resolve));assert(!g.t.transitioning);assert(complete);assert(fades.every(a=>a.cancelled));
 console.log('PASS: separate dismissible talk clouds, run-to-action movement, fade-out before room replacement, fade-in before completing arrival, transition input guards, and persistent doorway open states.');
}
presentation().catch(e=>{console.error(e);process.exitCode=1;});
