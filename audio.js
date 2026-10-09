'use strict';
(() => {
const SETTINGS='ascicat.audio.v1';
const PROFILES={house:{pitch:.88,rate:.93,index:0},pip:{pitch:1.4,rate:1.06,index:0},ink:{pitch:.86,rate:.88,index:1},biscuit:{pitch:1.12,rate:.87,index:2},fern:{pitch:1.3,rate:.91,index:0},echo:{pitch:1.5,rate:1.01,index:1},moth:{pitch:1.65,rate:.9,index:2},ash:{pitch:.95,rate:1.03,index:1},velvet:{pitch:1.22,rate:.86,index:0},button:{pitch:1.7,rate:.85,index:2}};
// A voiced m-ee-ow with moving vowel resonances and a continuous pitch contour.
// Generate once per kitten/sample rate; never play disconnected electronic beeps.
function meowSamples(id,sampleRate){
 const pitch=(PROFILES[id]||PROFILES.pip).pitch,seed=Object.keys(PROFILES).indexOf(id)+2;
 const duration=.82+(pitch-1.2)*.08,count=Math.ceil(duration*sampleRate),data=new Float32Array(count);
 const base=390*Math.pow(pitch/1.4,.38),tau=Math.PI*2;let phase=0,peak=0;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 for(let i=0;i<count;i++){
  const t=i/sampleRate,u=t/duration,open=smooth((u-.10)/.35),close=smooth((u-.54)/.38);
  const f0=base*(1+.64*Math.sin(Math.PI*smooth(u/.72))-.14*close)*(1+.013*Math.sin(tau*8.3*t)+.005*Math.sin(tau*37*t+seed));
  phase+=tau*f0/sampleRate;
  const f1=330+510*open-440*close,f2=2400-850*open-720*close,f3=3200-500*close;
  let voice=0;
  for(let h=1;h<=Math.min(28,Math.floor(sampleRate*.46/f0));h++){
   const f=h*f0,resonance=Math.exp(-.5*((f-f1)/180)**2)+.74*Math.exp(-.5*((f-f2)/260)**2)+.28*Math.exp(-.5*((f-f3)/350)**2);
   voice+=Math.sin(phase*h+.12*Math.sin(phase*.5+seed))*(.13+resonance)/Math.pow(h,.8);
  }
  const attack=smooth(t/.045),release=1-smooth((u-.68)/.32),nasal=.38+.62*smooth((u-.03)/.16);
  data[i]=Math.tanh(voice*1.1)*attack*release*nasal*(.92+.08*Math.sin(tau*11*t));peak=Math.max(peak,Math.abs(data[i]));
 }
 const scale=.86/Math.max(.001,peak);for(let i=0;i<count;i++)data[i]*=scale;
 return {data,duration:count/sampleRate};
}
class MansionAudio {
 constructor(){
  this.prefs={voice:true,sfx:true,volume:.55};try{const p=JSON.parse(localStorage.getItem(SETTINGS));if(p){if(typeof p.voice==='boolean')this.prefs.voice=p.voice;if(typeof p.sfx==='boolean')this.prefs.sfx=p.sfx;if(Number.isFinite(p.volume))this.prefs.volume=Math.max(.1,Math.min(1,p.volume));}}catch{}
  this.ctx=null;this.bus=null;this.meowBus=null;this.meows=new Map();this.ambience=null;this.sources=new Set();this.ready=false;this.serial=0;this.room='foyer';this.lastStep=0;this.voices=[];this.last=null;this.utterances=[];this.isTalking=false;this.dialogueTimer=null;this.fallbackTimer=null;
  this.synth=window.speechSynthesis||null;this.canSpeak=!!(this.synth&&window.SpeechSynthesisUtterance);this.canSound=!!(window.AudioContext||window.webkitAudioContext);
  this.refreshVoices=()=>{try{this.voices=(this.synth?.getVoices()||[]).filter(v=>/^en(?:-|_|$)/i.test(v.lang)).sort((a,b)=>Number(b.localService)-Number(a.localService)||a.name.localeCompare(b.name));}catch{this.voices=[];}};
  this.refreshVoices();this.synth?.addEventListener('voiceschanged',this.refreshVoices);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.stopSpeech();this.stopEffects();this.ctx?.suspend().catch(()=>{});this.ready=false;}});
 }
 save(){try{localStorage.setItem(SETTINGS,JSON.stringify(this.prefs));}catch{}}
 unlock(){
  this.ready=true;this.refreshVoices();if(!this.canSound||(!this.prefs.sfx&&!this.ctx))return;
  try{if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.bus=this.ctx.createGain();this.bus.gain.value=this.prefs.sfx?this.prefs.volume:0;const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=18;limiter.ratio.value=4;this.bus.connect(limiter);this.meowBus=this.ctx.createGain();this.meowBus.gain.value=this.prefs.sfx?this.prefs.volume:0;this.meowBus.connect(limiter);limiter.connect(this.ctx.destination);this.makeAmbience();}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{this.canSound=false;}
 }
 set(kind,value){this.prefs[kind]=value;this.save();if(kind==='voice'&&!value)this.stopSpeech();if(kind==='sfx'){if(value)this.unlock();else this.stopEffects();}this.mix();}
 volume(delta){this.prefs.volume=Math.round(Math.max(.1,Math.min(1,this.prefs.volume+delta))*100)/100;this.save();this.mix();return this.prefs.volume;}
 mix(duck=false){if(!this.ctx)return;const t=this.ctx.currentTime;this.bus.gain.cancelScheduledValues(t);this.bus.gain.setTargetAtTime(this.prefs.sfx?this.prefs.volume*(duck?.45:1):0,t,.035);this.meowBus.gain.cancelScheduledValues(t);this.meowBus.gain.setTargetAtTime(this.prefs.sfx?this.prefs.volume:0,t,.035);}
 stopSpeech(){clearTimeout(this.dialogueTimer);clearTimeout(this.fallbackTimer);this.isTalking=false;this.serial++;try{this.synth?.cancel();}catch{}this.utterances=[];this.mix();}
 speak(text,id='house',options={}){
  this.last={text,id};this.stopSpeech();if(!this.prefs.voice||!this.canSpeak||!this.ready||document.hidden){if(options.onEnd&&this.ready&&!document.hidden){this.isTalking=true;this.fallbackTimer=setTimeout(()=>{this.isTalking=false;options.onEnd();},Math.min(3000,Math.max(900,text.length*25)));}return;}this.isTalking=true;
  const profile=PROFILES[id]||PROFILES.house,serial=this.serial,chunks=[];let chunk='';
  for(const word of text.replace(/\s+/g,' ').trim().split(' ')){if((chunk+' '+word).length>180&&chunk){chunks.push(chunk);chunk='';}chunk+=(chunk?' ':'')+word;}if(chunk)chunks.push(chunk);
  if(!chunks.length){this.isTalking=false;options.onEnd?.();return;}
  try{this.synth.resume();chunks.forEach((part,i)=>{const u=new window.SpeechSynthesisUtterance(part);u.lang='en-GB';u.pitch=profile.pitch;u.rate=profile.rate;u.volume=this.prefs.volume;if(this.voices.length)u.voice=this.voices[profile.index%this.voices.length];u.onstart=()=>{if(serial===this.serial)this.mix(true);};u.onend=()=>{if(serial===this.serial&&i===chunks.length-1){this.utterances=[];this.isTalking=false;this.mix();options.onEnd?.();}};u.onerror=e=>{if(serial!==this.serial)return;this.mix();if(!['canceled','interrupted'].includes(e.error)){this.stopSpeech();options.onEnd?.();if(['synthesis-unavailable','voice-unavailable','language-unavailable'].includes(e.error)){this.canSpeak=false;window.dispatchEvent(new CustomEvent('ascicat-audio-status'));}}};this.utterances.push(u);this.synth.speak(u);});}catch{this.isTalking=false;options.onEnd?.();this.canSpeak=false;window.dispatchEvent(new CustomEvent('ascicat-audio-status'));}
 }
 oscillator(freq,duration=.12,level=.04,delay=0,end=freq,type='sine'){
  if(!this.ctx||!this.ready||!this.prefs.sfx||document.hidden)return;
  const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration*.85);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),t+Math.min(.015,duration/4));g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.bus);this.sources.add(o);o.onended=()=>{this.sources.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+duration+.01);
 }
 noise(duration=.1,level=.035,frequency=1200,delay=0,type='lowpass'){
  if(!this.ctx||!this.ready||!this.prefs.sfx||document.hidden)return;
  const t=this.ctx.currentTime+delay,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.noiseBuffer;f.type=type;f.frequency.value=frequency;f.Q.value=.7;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(level,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);s.connect(f);f.connect(g);g.connect(this.bus);this.sources.add(s);s.onended=()=>{this.sources.delete(s);s.disconnect();f.disconnect();g.disconnect();};s.start(t,Math.random()*.4);s.stop(t+duration+.01);
 }
 makeAmbience(){
  const a=this.ctx,b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=b;
  const source=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();source.buffer=b;source.loop=true;filter.type='lowpass';filter.frequency.value=1200;gain.gain.value=.015;source.connect(filter);filter.connect(gain);gain.connect(this.bus);source.start();this.ambience={source,filter,gain};this.setRoom(this.room);
 }
 setRoom(id){this.room=id;if(!this.ctx||!this.ambience)return;const cellar=id==='cellar'||id==='vault',t=this.ctx.currentTime;this.ambience.filter.frequency.setTargetAtTime(cellar?250:id==='conservatory'?3200:1200,t,.5);this.ambience.gain.gain.setTargetAtTime(cellar?.009:id==='conservatory'?.024:.014,t,.5);}
 stopEffects(){for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();}
 play(name,id='house'){
  if(!this.ready||!this.prefs.sfx||document.hidden)return;this.unlock();if(!this.ctx)return;
  const note=(...v)=>this.oscillator(...v),noise=(...v)=>this.noise(...v);
  switch(name){
   case 'step':{const now=this.ctx.currentTime;if(now-this.lastStep<.075)return;this.lastStep=now;const soft=this.room==='bedroom'||this.room==='library',stone=this.room==='cellar'||this.room==='vault';noise(soft?.07:.055,soft?.018:.052,stone?2200:soft?500:950);note(stone?100:65,.07,soft?.014:.038,0,40,'triangle');break;}
   case 'wall':note(100,.07,.035,0,42,'triangle');break;
   case 'door':noise(.28,.05,450);note(82,.22,.018,0,140,'sawtooth');note(720,.035,.025,.17,260,'square');break;
   case 'locked':note(180,.11,.035,0,100,'triangle');noise(.065,.06,1600,.12);break;
   case 'pickup':[660,880,1320].forEach((f,i)=>note(f,.3,.048,i*.08,f,'sine'));break;
   case 'solve':[523.25,659.25,783.99,1046.5].forEach((f,i)=>note(f,.25,.045,i*.07,f,'triangle'));break;
   case 'error':note(240,.12,.035,0,180);note(180,.13,.035,.11,150);break;
   case 'hint':note(392,.18,.035);note(523,.25,.03,.12);break;
   case 'page':noise(.08,.025,1800,0,'highpass');break;
   case 'meow':return this.meow(id);
   case 'purr':note(26,.85,.07,0,26,'triangle');note(28,.85,.07,0,28,'sine');noise(.85,.035,190);break;
   case 'whisper':noise(.25,.025,500);note(196,.4,.025,0,146);break;
   case 'ending':[261.63,329.63,392,523.25,659.25,783.99].forEach((f,i)=>note(f,.7,.04,i*.14,f,'sine'));break;
   case 'clock':noise(.02,.017,2200);note(850,.025,.008);break;
   case 'creak':note(110,.5,.007,0,85,'triangle');noise(.22,.009,400);break;
  }
 }
 meowBuffer(id){
  const key=PROFILES[id]?id:'pip';if(this.meows.has(key))return this.meows.get(key);
  const rate=Math.min(24000,this.ctx.sampleRate),{data,duration}=meowSamples(key,rate),buffer=this.ctx.createBuffer(1,data.length,rate);
  buffer.getChannelData(0).set(data);const result={buffer,duration};this.meows.set(key,result);return result;
 }
 meow(id){
  const {buffer,duration}=this.meowBuffer(id),source=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  source.buffer=buffer;gain.gain.value=.8;source.connect(gain);gain.connect(this.meowBus);this.sources.add(source);
  source.onended=()=>{this.sources.delete(source);source.disconnect();gain.disconnect();};source.start(this.ctx.currentTime);return duration;
 }
 catDialogue(text,id){this.stopSpeech();const duration=this.play('meow',id)||0;this.isTalking=true;const token=this.serial;this.dialogueTimer=setTimeout(()=>{if(token!==this.serial)return;this.speak(text,id,{onEnd:()=>{this.isTalking=false;this.play('meow',id);}});},Math.ceil((duration+.08)*1000));}

 destroy(){this.stopSpeech();this.stopEffects();try{this.ctx?.close();}catch{}this.synth?.removeEventListener('voiceschanged',this.refreshVoices);}
}
window.AsciCatAudio=MansionAudio;
})();
