const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context={window:{}};
for(const file of ['adventure-data.js','geometry.js','player.js','visuals.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const {AsciAdventure:D,BrambleGeometry:G,BramblePlayer:player,BrambleVisuals:visuals}=context.window;
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} differs from ${b}`);
const defaults={n:[29,0],s:[29,22],w:[0,11],e:[57,11]};
let frames=0;
for(const [id,room]of Object.entries(D.rooms)){
 const g=G.get(id),ratio=g.width*g.sx/(g.depth*g.sy);
 assert(ratio>=1.15&&ratio<=2.4,id+': room must have balanced rectangular proportions');
 for(let x=0;x<=57;x+=3)for(let y=0;y<=22;y+=2){const q=G.project(x,y,0,id),tile=visuals.unproject(...q,id);near(tile.x,x);near(tile.y,y);}
 const corners=[[0,0],[57,0],[57,22],[0,22]].map(([x,y])=>G.project(x,y,0,id));
 for(const [x,y]of corners){assert(x>=60&&x<=940);assert(y>=150&&y<=610);}
 near(corners[0][0]+corners[2][0],corners[1][0]+corners[3][0]);
 near(corners[0][1]+corners[2][1],corners[1][1]+corners[3][1]);
 const svg=visuals.render({room,scene:[],cats:[],pos:{},state:{room:id,x:29,y:20,flags:{}}});
 const walls=svg.match(/class="room-walls"[^]*?<\/g>/)[0];
 const planes=[...walls.matchAll(/<polygon[^>]*points="([^"]+)"/g)].map(m=>m[1].split(' ').map(p=>p.split(',').map(Number)));
 assert.equal(planes.length,2);
 for(const [a,b,c,d]of planes){near(a[0],d[0]);near(b[0],c[0]);near(a[1]-d[1],148);near(b[1]-c[1],148);}
 for(const o of D.objects.filter(o=>o.room===id)){
  const [w,d]=D.footprint(o);assert(o.x>=0&&o.y>=0&&o.x+w<=58&&o.y+d<=23,id+': '+o.id+' extends outside the room');
 }
 // A three-tile opening must remain clear of wall furniture, including the
 // library bookcase after it slides aside to expose the puzzle recess.
 for(const dir of ['n','w'].filter(d=>room.exits[d])){
  const [x,y]=room.doorPositions?.[dir]||defaults[dir];
  const door=dir==='n'?[x-3,0,6,2]:[0,y-3,2,6];
  for(const original of D.objects.filter(o=>o.room===id&&!o.walkable&&!['nurseryDoor','highLatch'].includes(o.id))){
   for(const shift of original.id==='bookcase'?[0,12]:[0]){
    const [w,d]=D.footprint(original),o={x:original.x+shift,y:original.y};
    const overlap=o.x<door[0]+door[2]&&o.x+w>door[0]&&o.y<door[1]+door[3]&&o.y+d>door[1];
    assert(!overlap,id+': '+original.id+' overlaps the '+dir+' doorway');
   }
  }
 }
 for(const running of [false,true])for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const motion=player.create(id,20,12),stance=motion.sample(1000).feet[0];
  assert(motion.stepTo(20+dx,12+dy,1000,{running}));
  for(let t=1000;t<=1230;t+=5){const pose=motion.sample(t),rig=player.rig(pose);
   for(const leg of rig.legs){near(Math.hypot(leg.hip[0]-leg.knee[0],leg.hip[1]-leg.knee[1]),20);near(Math.hypot(leg.knee[0]-leg.ankle[0],leg.knee[1]-leg.ankle[1]),20);}
   if(pose.walking&&pose.feet[0].lift===0){near(pose.feet[0].x,stance.x);near(pose.feet[0].y,stance.y);}
   frames++;if(!pose.walking&&t>1000)break;
  }
  const target=G.project(20+dx,12+dy,0,id),end=motion.sample(1300);near(end.root[0],target[0]);near(end.root[1],target[1]);
 }
}
console.log(`PASS: ${Object.keys(D.rooms).length} rectangular rooms, matching wall heights, unclipped geometry, room-specific hit testing, clear doorways with shifted furniture, and ${frames} planted-foot gait frames.`);
