'use strict';
window.AsciAdventure={rooms:{
  "foyer": {
    "name": "The Foyer",
    "floor": "GROUND FLOOR",
    "flavor": "Rain threads the windows. A grandfather clock has stopped at nine. The welcome mat says PLEASE WIPE YOUR PAWS.",
    "exits": {
      "n": "hall"
    }
  },
  "hall": {
    "name": "The Long Hall",
    "floor": "GROUND FLOOR",
    "flavor": "The floorboards creak in sentences. Portraits of cats follow you with their eyes. Someone has sharpened their claws on history.",
    "exits": {
      "s": "foyer",
      "w": "library",
      "e": "dining",
      "n": "gallery"
    }
  },
  "library": {
    "name": "The Library",
    "floor": "WEST WING",
    "flavor": "Books from floor to ceiling. Almost every title contains the word fish. A bookmark moves by itself. Probably.",
    "exits": {
      "e": "hall",
      "n": "conservatory"
    }
  },
  "dining": {
    "name": "The Dining Room",
    "floor": "EAST WING",
    "flavor": "Nine saucers surround a table set for an unusually formal dinner. One saucer remains untouched.",
    "exits": {
      "w": "hall",
      "n": "kitchen"
    }
  },
  "kitchen": {
    "name": "The Kitchen",
    "floor": "EAST WING",
    "flavor": "The oven is warm. A kettle mutters to itself. Tiny floury pawprints disappear under the cupboards.",
    "exits": {
      "s": "dining"
    }
  },
  "gallery": {
    "name": "The Portrait Gallery",
    "floor": "UPPER FLOOR",
    "flavor": "Moonlight turns the portraits silver. A little staircase spirals down through the floor. The air smells of old velvet.",
    "exits": {
      "s": "hall",
      "w": "music",
      "e": "bedroom",
      "n": "attic"
    }
  },
  "music": {
    "name": "The Music Room",
    "floor": "WEST UPSTAIRS",
    "flavor": "The piano keys bear three tiny pictures: a moon, an eye, and a whisker. An old portrait watches the keyboard.",
    "exits": {
      "e": "gallery"
    }
  },
  "bedroom": {
    "name": "The Blue Bedroom",
    "floor": "EAST UPSTAIRS",
    "flavor": "The bed is impossibly large. The pillow is suspiciously lumpy. The wardrobe is full of identical blue scarves.",
    "exits": {
      "w": "gallery"
    }
  },
  "attic": {
    "name": "The Attic",
    "floor": "UNDER THE ROOF",
    "flavor": "Dust drifts through a moonbeam. Hatboxes, trunks, forgotten birthdays. The roof sighs whenever the wind changes its mind.",
    "exits": {
      "s": "gallery"
    }
  },
  "conservatory": {
    "name": "The Conservatory",
    "floor": "BEYOND THE LIBRARY",
    "flavor": "Rain drums softly on the glass roof. Ferns have colonized every available surface, including several unavailable ones.",
    "exits": {
      "s": "library"
    }
  },
  "cellar": {
    "name": "The Cellar",
    "floor": "BENEATH THE HOUSE",
    "flavor": "Three mechanisms guard a little door: a floor plate, an unbalanced hanging chain, and a latch high above your head.",
    "exits": {
      "s": "gallery",
      "n": "vault"
    }
  },
  "vault": {
    "name": "The Secret Nursery",
    "floor": "THE HOUSE'S HEART",
    "flavor": "Nine kittens. A nest of blue scarves. You have found the smallest secret in the biggest house.",
    "exits": {
      "s": "cellar"
    }
  }
},objects:[],cats:[]};
(() => {
const D=window.AsciAdventure;
function add(room,id,name,x,y,art,look,extra={}){D.objects.push({room,id,name,x,y,art,look,...extra});}
add('foyer','clock','Grandfather clock',6,4,['█▀▀▀▀▀▀▀█','█ 9:00  █','█   o   █','█  /|\\  █','█▄▄▄▄▄▄▄█'],'A tall clock. Its hands stopped at nine. The little cupboard beneath its pendulum is closed.',{openable:true,inside:'Only dust and a retired clockwork mouse. The clock seems offended.'});
add('foyer','familyPortrait','Family portrait',39,4,['█▀▀▀▀▀▀▀▀▀▀▀▀█','█ /\\_/\\  9  █','█( o.o ) cats█','█▄▄▄▄▄▄▄▄▄▄▄▄█'],'Nine kittens above a crest. The frame has fresh scratch marks along its lower edge. It looks hinged.');
add('foyer','welcomeMat','Welcome mat',20,17,['░░░░░░░░░░░░░░░░░','░ WIPE YOUR PAWS░','░░░░░░░░░░░░░░░░░'],'A very bossy welcome mat. Something small and metallic is caught beneath it.',{walkable:true});
add('foyer','umbrella','Umbrella stand',8,15,[' \\|/',' █▒█',' ▀▀▀'],'Three umbrellas. All of them smell as though they have been slept in.');
add('library','bookcase','Sliding bookcase',5,4,['█▀▀▀▀▀▀▀▀▀█','█■ ■ ■ ■ ■█','█■ ■ ■ ■ ■█','█▄▄▄▄▄▄▄▄▄█'],'A bookcase on small brass wheels. A scrape in the floor runs to the right.');
add('library','desk','Writing desk',27,15,['█▀▀▀▀▀▀▀▀▀▀▀█','█  PAPERS ■ █','▀▀█▀▀▀▀▀▀▀█▀▀'],'A desk with a broad drawer. A diagram of the cellar lies half hidden beneath a book.',{openable:true,inside:'A drawing shows a crate covering the floor plate, a brass weight balancing the chain, and a hook reaching the high latch.'});
add('library','readingChair','Reading chair',43,15,['▄▀▀▀▄','█▒▒▒█','▀█▀█▀'],'A chair with a deep cushion and more fur than upholstery.');
add('library','curtain','Curtain',42,4,['▓▓▓▓▓▓▓▓','▓▒▓▒▓▒▓▒','▓▒▓▒▓▒▓▒','▓▓▓▓▓▓▓▓'],'Heavy curtains cover a rain-streaked window.',{curtain:true});
add('dining','table','Dining table',17,7,['  o    o    o    o','█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█','█ ()  ()  ()  ()  () █','█       SAUCERS      █','█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█','  o    o    o    o'],'Nine saucers. Button\'s is untouched. The table is bolted down, presumably after a previous dinner.');
add('dining','sideboard','Sideboard',42,16,['█▀▀▀▀▀▀▀▀█','█ ■  ■  ■█','█▄▄▄▄▄▄▄▄█'],'A polished sideboard with a shallow cutlery drawer.');
add('dining','dinnerPortrait','Dinner portrait',7,4,['█▀▀▀▀▀▀▀▀▀█','█ 9 bowls █','█▄▄▄▄▄▄▄▄▄█'],'Nine kittens around nine saucers. Button always sits nearest the cellar stairs.');
add('kitchen','cupboard','Kitchen cupboard',36,4,['█▀▀▀▀▀▀▀▀▀▀▀▀▀█','█ ■  █  ■     █','█    █        █','█▄▄▄▄▄▄▄▄▄▄▄▄▄█'],'A roomy cupboard. A storm lamp is silhouetted behind its frosted glass.');
add('kitchen','stove','Warm stove',6,4,['█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█','█  O O  ▒ O O   █','█    [OVEN]     █','█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█'],'A warm stove with a shut oven. The kettle has an opinion about everything.',{openable:true,inside:'The oven contains a tray of biscuits. You close it before Biscuit learns to climb.'});
add('kitchen','milkBowl','Milk bowl',13,15,['▄▀▀▀▀▀▀▀▀▄','█ (MILK) █','▀▄▄▄▄▄▄▄▄▀'],'A bowl of warm milk, kept just right for the kittens.');
add('gallery','westPortrait','West portrait',5,4,['█▀▀▀▀▀▀▀▀▀▀▀█','█ /\\_/\\    █','█( o.o )    █','█     <     █','█▄▄▄▄▄▄▄▄▄▄▄█'],'A kitten looking west. The frame turns on a central pin. A small arrow indicates its orientation.',{rotation:'west'});
add('gallery','centerPortrait','Centre portrait',23,4,['█▀▀▀▀▀▀▀▀▀▀▀█','█ /\\_/\\    █','█( o.o )    █','█     v     █','█▄▄▄▄▄▄▄▄▄▄▄█'],'A kitten looking down. This frame turns too.',{rotation:'center'});
add('gallery','eastPortrait','East portrait',41,4,['█▀▀▀▀▀▀▀▀▀▀▀█','█ /\\_/\\    █','█( o.o )    █','█     >     █','█▄▄▄▄▄▄▄▄▄▄▄█'],'A kitten looking east. A fine seam runs behind the three portraits.',{rotation:'east'});
add('gallery','stairs','Cellar stairs',26,16,['█▀▀▀▀▀█','█ v v █','█ v v █','█▄▄▄▄▄█'],'An iron gate guards the steps. The brass keyhole is shaped like a kitten.');
add('music','piano','Grand piano',7,7,['█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█','█   GRAND PIANO   █','█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█','█                 █','▀█▀▀▀▀▀▀▀▀▀▀▀▀▀▀█▀▀'],'Three playable keys have little pictures: MOON, EYE, and WHISKER. A shallow drawer beneath the keys is locked.');
add('music','moonKey','Moon key',10,10,['[M]'],'A piano key painted with a crescent moon.',{walkable:true,key:'moon'});
add('music','eyeKey','Eye key',15,10,['[E]'],'A piano key painted with an eye.',{walkable:true,key:'eye'});
add('music','whiskerKey','Whisker key',20,10,['[W]'],'A piano key painted with a whisker.',{walkable:true,key:'whisker'});
add('music','musicPortrait','Pianist portrait',37,4,['█▀▀▀▀▀▀▀▀▀▀▀▀▀▀█','█ MOON         █','█    EYE       █','█      WHISKER █','█▄▄▄▄▄▄▄▄▄▄▄▄▄▄█'],'A painting of a moon above an eye above a whisker. The pianist\'s paw traces them from top to bottom. MOON, then EYE, then WHISKER.');
add('music','metronome','Metronome',42,15,[' /\\','/..\\','▀▀▀▀'],'A metronome with an open little door. Its pendulum rocks left, then right.',{openable:true,inside:'No secret compartment. Just an exceptionally punctual spring.'});
add('bedroom','bed','Blue bed',33,5,['█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█','█ [____] [____]   █','█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█','█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█','█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█'],'An enormous blue bed. One pillow seems to be gently purring.');
add('bedroom','wardrobe','Wardrobe',7,4,['█▀▀▀▀▀▀▀▀▀█','█    █ ■  █','█    █    █','█▄▄▄▄▄▄▄▄▄█'],'A wardrobe stuffed with blue scarves.',{openable:true,inside:'A trail of blue wool clings to a scarf. Button has been borrowing bedding. The nursery is below the cellar.'});
add('bedroom','rug','Blue rug',14,16,['▒▒▒▒▒▒▒▒▒▒▒▒','▒▒▒▒▒▒▒▒▒▒▒▒','▒▒▒▒▒▒▒▒▒▒▒▒'],'A thick blue rug. One corner is curled up.',{walkable:true});
add('attic','chest','Attic chest',7,5,['█▀▀▀▀▀▀▀▀▀▀▀█','█   LETTERS █','█▄▄▄▄▄▄▄▄▄▄▄█'],'A chest full of family letters. There is no lock, just a stiff lid.',{openable:true,inside:'A letter: The nursery door uses a balanced chain and a floor plate. The high latch only releases after both are set.'});
add('attic','hatboxes','Hatboxes',39,6,['▄▀▀▀▀▀▀▀▀▀▄','█  HATS   █','▀▄▄▄▄▄▄▄▄▄▀'],'A stack of hatboxes. It is impossible to tell how many of them contain cats.',{openable:true,inside:'Three hats and a magnificent quantity of white fur. Moth was here.'});
add('attic','trunk','Old trunk',12,16,['█▀▀▀▀▀▀▀█','█ 1891 ■█','█▄▄▄▄▄▄▄█'],'A trunk with a closed latch.',{openable:true,inside:'Old toys, a spare bell, and a note saying PLEASE RETURN THE SMALL KITTEN. There is a drawing of the floor plate in the cellar.'});
add('conservatory','bench','Garden bench',9,15,['█▀▀▀▀▀▀▀▀▀█','█  BENCH  █','▀█▀▀▀▀▀▀█▀▀'],'A sturdy bench. It could slide along the clear floor beneath the high window.');
add('conservatory','highWindow','High window',25,3,['█▀▀▀▀▀▀▀▀▀▀▀█','█ ░░░░░░░░░ █','█  HIGH LEDGE█','█▄▄▄▄▄▄▄▄▄▄▄█'],'A brass hook rests on a ledge above your reach. There is room for a bench directly beneath it.');
add('conservatory','fernPot','Fern pot',6,6,[' \\|/   \\|/','--*-- --*--',' /|\\   /|\\',' ▀█▀   ▀█▀'],'Two exuberant ferns in matching pots. A small garden sketch lies beneath the left pot.');
add('conservatory','ivy','Ivy',43,14,['\\ | /','▒▒▒▒▒','/ | \\',' ▀█▀'],'A dense tangle of ivy with a tiny pair of eyes in it.');
add('cellar','bottles','Bottle rack',5,5,['█▀▀▀▀▀▀▀▀▀▀█','█o o o o o █','█o o o o o █','█▄▄▄▄▄▄▄▄▄▄█'],'Dusty bottles, stored behind a low wooden door.',{openable:true,inside:'A bottle of apple juice from a frankly questionable year. You leave it alone.'});
add('cellar','crate','Rolling crate',24,15,['█▀▀▀▀█','█▒▒▒▒█','█▄▄▄▄█'],'A heavy crate on a straight rail. Its wheel socket has no handle. The pressure plate lies at the right-hand end of the rail.');
add('cellar','plate','Pressure plate',39,16,['▀▀▀▀▀▀'],'A floor plate at the end of the crate\'s rail. A heavy crate would hold it down.',{walkable:true});
add('cellar','chain','Hanging chain',43,5,['   |','   |','  ( )','  / \\'],'A counterbalance chain. An empty cup hangs on its end. It needs a brass weight.');
add('cellar','highLatch','High latch',29,3,['[LATCH]'],'A latch above the nursery door, too high for your hands. Its linkage runs to the floor plate and hanging chain.');
add('cellar','nurseryDoor','Nursery door',25,7,['█▀▀▀▀▀▀▀▀█','█ /\\_/\\ █','█    ■   █','█▄▄▄▄▄▄▄▄█'],'A small door. Three catches hold it closed: the floor plate, the counterbalance, and the high latch. A kitten snores behind it.');
add('vault','nest','Scarf nest',19,7,['  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄','▄▀ BLUE SCARF NEST ▀▄','█       /\\_/\\       █','█      ( u.u )      █','█       > ^ <       █','▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀'],'Nine kittens in a nest of borrowed scarves. Button is curled into a comma.');
// Layouts follow rectangular country-house rooms: wall storage, central
// dining furniture, a window-side reading group, and a bed against a wall.
D.footprint=o=>o.size||[Math.max(...o.art.map(r=>r.length)),o.art.length];
const placements={clock:[6,0,9,4],familyPortrait:[39,0,14,1],umbrella:[3,16,4,3],bookcase:[5,0,11,3],desk:[26,13,12,3],readingChair:[43,12,5,4],curtain:[47,0,9,1],table:[17,8,24,6],sideboard:[42,0,10,3],dinnerPortrait:[6,0,12,1],cupboard:[36,0,15,3],stove:[6,0,17,4],milkBowl:[13,16,7,3],westPortrait:[5,0,13,1],centerPortrait:[22,0,10,1],eastPortrait:[44,0,10,1],piano:[7,8,19,6],moonKey:[10,13,3,1],eyeKey:[15,13,3,1],whiskerKey:[20,13,3,1],musicPortrait:[37,0,16,1],metronome:[42,14,4,3],bed:[34,1,13,10],wardrobe:[7,0,11,3],rug:[20,12,24,6],chest:[6,1,13,4],hatboxes:[42,1,11,5],trunk:[6,16,9,4],highWindow:[25,0,13,1],fernPot:[3,4,10,5],ivy:[47,15,5,4],bottles:[5,0,12,4],nurseryDoor:[25,0,8,1],highLatch:[28,0,2,1]};
for(const o of D.objects){if(placements[o.id]){const [x,y,w,d]=placements[o.id];o.x=x;o.y=y;o.size=[w,d];}if(o.id.includes('Portrait')||o.id==='curtain'||o.id==='highWindow')o.wall='n';}
const decor=(room,id,name,x,y,w,d,kind,look,extra={})=>add(room,id,name,x,y,['■'],look,{size:[w,d],kind,...extra});
decor('foyer','hallConsole','Hall console',18,0,7,3,'console','A narrow console for letters and keys. Someone has left nine tiny calling cards.');
decor('hall','hallSettle','Hall settle',4,2,13,3,'bench','A long seat beside the wall. Its cushion is thoroughly flattened by generations of kittens.');
decor('library','libraryHearth','Library fireplace',35,0,11,3,'fireplace','A tiled fireplace with a carved mantel. The hearth is cold; the reading chairs have migrated toward it.');
decor('library','readingTable','Tea table',37,12,4,3,'smallTable','A cup rests beside a book entitled A Brief History of the Fish.');
decor('library','readingRug','Reading rug',35,9,17,9,'rug','A patterned rug gathers the reading chair and tea table into a cozy corner.',{walkable:true});
for(const [i,x]of [18,24,30,36].entries())decor('dining','diningChairBack'+i,'Dining chair '+(i+1),x,5,3,2,'chair','A carved dining chair, pulled far enough back to leave room for a tail.');
for(const [i,x]of [19,27,35].entries())decor('dining','diningChairFront'+i,'Dining chair '+(i+5),x,16,3,2,'chair','A carved dining chair. The seat bears the exact impression of a sleeping kitten.');
for(const [i,x]of [12,44].entries())decor('dining','diningChairEnd'+i,'Dining chair '+(i+8),x,10,3,3,'chair','An end chair for a particularly important kitten.');
decor('kitchen','prepTable','Preparation table',26,10,11,4,'console','A worktable dusted with flour. A rolling pin has acquired a small pawprint.');
decor('bedroom','leftNightstand','Left bedside table',29,1,4,3,'console','A bedside table with a candle and a neatly folded blue scarf.');
decor('bedroom','rightNightstand','Right bedside table',49,1,4,3,'console','A bedside table. Its drawer contains a perfectly ordinary spare pillowcase.',{openable:true,inside:'One spare pillowcase. No kitten, although there is enough fur to assemble one.'});
decor('bedroom','bedroomChair','Bedroom chair',7,14,5,4,'chair','An upholstered chair beside the wardrobe. Someone has claimed the cushion.');
decor('music','pianoBench','Piano bench',10,15,13,2,'bench','A low backless bench centered on the keyboard, facing the piano.',{backless:true,facing:'n'});
decor('vault','nurseryRug','Nursery rug',16,6,27,13,'rug','A soft rug surrounds the nest of borrowed scarves.',{walkable:true});
D.rooms.gallery.doorPositions={n:[37,0]};
D.rooms.library.doorPositions={n:[31,0]};
for(const o of D.objects){if(o.id.includes('diningChairFront'))o.facing='n';if(o.id==='diningChairEnd0')o.facing='e';if(o.id==='diningChairEnd1')o.facing='w';}
D.cats=[
{id:'pip',name:'Pip',glyph:'a',room:'foyer',x:34,y:12,pet:'Pip rolls onto his back. It is, of course, a trap. A very soft trap.'},
{id:'ink',name:'Ink',glyph:'b',room:'library',x:34,y:11,pet:'Ink accepts your tribute with the dignity of a tiny librarian.'},
{id:'biscuit',name:'Biscuit',glyph:'c',room:'dining',x:39,y:14,pet:'Biscuit smells faintly of stolen toast.'},
{id:'fern',name:'Fern',glyph:'d',room:'conservatory',x:21,y:12,pet:'Fern purrs loudly enough to shake the ferns.'},
{id:'echo',name:'Echo',glyph:'e',room:'music',x:35,y:13,pet:'Echo produces a purr in an unusually respectable musical key.'},
{id:'moth',name:'Moth',glyph:'f',room:'attic',x:33,y:13,pet:'Moth vanishes into your sleeve, then pretends she was never there.'},
{id:'ash',name:'Ash',glyph:'g',room:'hall',x:39,y:12,pet:'Ash inspects your hand for contraband, then leans into it.'},
{id:'velvet',name:'Velvet',glyph:'h',room:'gallery',x:18,y:13,pet:'Velvet presents one immaculate paw for your admiration.'},
{id:'button',name:'Button',glyph:'i',room:'vault',x:33,y:15,pet:'Button kneads your sleeve and falls asleep halfway through a purr.'}
];
})();
