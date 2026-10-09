'use strict';
(() => {
// Logical navigation stays 58 x 23; room proportions are architectural choices.
// Both world axes use the same isometric angle, with a common vertical scale.
const sizes={foyer:[8.2,15.6],hall:[10.6,11.8],library:[8.4,15.6],dining:[9,14.6],kitchen:[8.4,15.6],gallery:[9.8,12.8],music:[8.6,15.6],bedroom:[8.2,16],attic:[9.2,13.8],conservatory:[9,14.8],cellar:[9.2,13.8],vault:[7.6,17]};
const get=room=>{const [sx,sy]=sizes[room]||sizes.foyer;return {sx,sy,ox:500-(57*sx-22*sy)/2,oy:164,width:57,depth:22,wallHeight:148,cutawayHeight:10,doorHeight:98};};
function project(x,y,z=0,room='foyer'){const g=get(room);return [g.ox+x*g.sx-y*g.sy,g.oy+(x*g.sx+y*g.sy)/2-z];}
function unproject(x,y,room='foyer'){const g=get(room),a=x-g.ox,b=(y-g.oy)*2;return {x:Math.round((a+b)/(2*g.sx)),y:Math.round((b-a)/(2*g.sy))};}
window.BrambleGeometry={get,project,unproject};
})();
