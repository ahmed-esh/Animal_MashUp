// Run with: node --test tests/creature-reactions.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
  function element(){const classes=new Set();return {style:{},dataset:{},children:[],classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},append(...children){this.children.push(...children)},remove(){this.removed=true}}}
  const nodes={world:element(),residents:element(),bird:{firstElementChild:element()}};
  const sandbox={Math,innerWidth:1200,innerHeight:800,reducedMotion:{matches:false},document:{hidden:false,createElement:element,getElementById:id=>nodes[id]},randomSprite:()=> 'sprite.png',prepareArtwork:async path=>path,requestAnimationFrame(){}};
  vm.createContext(sandbox);
  const source=fs.readFileSync(require('node:path').join(__dirname,'../world.js'),'utf8');
  vm.runInContext(source.slice(source.indexOf('const residents=[];')),sandbox);
  return {run:code=>vm.runInContext(code,sandbox),sandbox};
}
test('each reaction has temporary artwork and ends in normal with a cooldown',()=>{
  for(const type of ['sleepy','curious','shy','chaotic']){
    const {run}=setup();run('spawnResident("TEST");var r=residents[0]');
    run(`react(r,'${type}',2)`);
    assert.equal(run('r.state'),type);
    assert.equal(run('r.sign.classList.contains("hidden")'),false);
    assert.match(run('r.sign.src'),/assests\//);
    run('updateResident(r,2.1)');
    assert.equal(run('r.state'),'normal');
    assert.equal(run('r.sign.classList.contains("hidden")'),true);
    assert.equal(run('react(r,"chaotic",2)'),false);
  }
});
test('nearby newcomers prompt curiosity and retreat without extra spawns',()=>{
  const {run}=setup();
  run('spawnResident("ONE");var a=residents[0];a.personality="curious";a.x=.5;spawnResident("TWO")');
  // Place the observer where the next arrival must be within the notice radius.
  run('a.x=.5;a.cooldown=0;a.state="normal";residents[1].personality="shy";residents[1].x=.5;residents[1].cooldown=0;residents[1].state="normal";spawnResident("THREE")');
  // The random spawn range can extend beyond 230px, so directly trigger a nearby arrival.
  run('residents.forEach(r=>{r.x=.5;r.cooldown=0;r.state="normal"});var savedRandom=Math.random;Math.random=()=>.5;spawnResident("FOUR");Math.random=savedRandom');
  assert.equal(run('a.state'),'curious');assert.equal(run('residents[1].state'),'shy');
  assert.equal(run('residents.length'),4);
  assert.equal(run('a.focus'),run('residents[3]'));
});
test('a sprint wakes a sleeper and retreats from the threat',()=>{
  const {run}=setup();run('spawnResident("SLEEPER");spawnResident("RUNNER");var a=residents[0],b=residents[1];a.x=.5;b.x=.54;a.y=b.y=.85;a.state=b.state="normal";a.cooldown=b.cooldown=0;react(a,"sleepy",5);react(b,"chaotic",3);updateResident(a,.05)');
  assert.equal(run('a.state'),'shy');assert.equal(run('a.target<a.x'),true);
});
test('bird reaction ends when the bird leaves; normal movement resumes',()=>{
  const {run}=setup();run('spawnResident("WATCHER");var r=residents[0];r.personality="curious";birdFlight={elapsed:2,duration:10};noticeBird();updateResident(r,.05)');
  assert.equal(run('r.state'),'curious');
  run('birdFlight=null;updateResident(r,.05)');assert.equal(run('r.state'),'normal');assert.equal(run('r.sign.classList.contains("hidden")'),true);
});
test('reduced motion keeps position still but still clears reaction signs',()=>{
  const {run,sandbox}=setup();sandbox.reducedMotion.matches=true;
  run('spawnResident("STILL");var r=residents[0],x=r.x;react(r,"chaotic",2);updateResident(r,1)');
  assert.equal(run('r.x'),run('x'));run('updateResident(r,1.1)');assert.equal(run('r.sign.classList.contains("hidden")'),true);
});
test('population stays bounded and observers release removed targets',()=>{
  const {run}=setup();run('spawnResident("FIRST");var first=residents[0];spawnResident("SECOND");var watcher=residents[1];watcher.focus=first;for(let i=0;i<23;i++)spawnResident("EXTRA")');
  assert.equal(run('residents.length'),24);assert.equal(run('first.el.removed'),true);assert.notEqual(run('watcher.focus'),run('first'));
});
test('food drops require six living creatures, a chaotic racer, and no active event',()=>{
  const {run}=setup();
  run('foodCooldown=0;for(let i=0;i<5;i++)spawnResident("TEST");residents.forEach(r=>r.personality="chaotic")');
  assert.equal(run('startFoodDrop(.5,.2)'),false);
  run('spawnResident("SIXTH");residents.forEach(r=>r.personality="sleepy")');
  assert.equal(run('canDropFood()'),false);
  run('residents[0].personality="chaotic"');assert.equal(run('startFoodDrop(.5,.2)'),true);
  assert.equal(run('startFoodDrop(.5,.2)'),false);
  run('finishFoodEvent();foodCooldown=0;killResident(residents[5])');
  assert.equal(run('canDropFood()'),false);
});
test('first arrival wins, eats, kills one opponent, then returns to normal',()=>{
  const {run}=setup();
  run('for(let i=0;i<6;i++)spawnResident("TEST");residents.forEach(r=>r.personality="sleepy");residents[0].personality=residents[1].personality="chaotic";foodCooldown=0;startFoodDrop(.5,.2);var event=foodEvent;updateFoodEvent(1.5);residents[0].x=.03;residents[1].x=event.x;residents[1].y=event.y;updateFoodEvent(.05)');
  assert.equal(run('event.winner'),run('residents[1]'));
  assert.equal(run('event.phase'),'eating');assert.equal(run('event.el.classList.contains("hidden")'),true);
  assert.equal(run('residents[0].eventRole'),null);
  run('for(let i=0;i<1500&&foodEvent;i++)updateFoodEvent(.05)');
  assert.equal(run('foodEvent'),null);
  assert.equal(run('residents.filter(r=>r.dead).length'),1);
  assert.equal(run('event.winner.state'),'normal');assert.equal(run('event.winner.eventRole'),null);
  assert.equal(run('event.victim.sign.classList.contains("hidden")'),false);
  assert.equal(run('event.victim.state'),'dead');
  assert.equal(run('event.victim.el.dataset.reaction'),'dead');
  assert.equal(run('foodCooldown>=35'),true);
  run('var dead=event.victim,oldX=dead.x,oldY=dead.y;calm(dead);react(dead,"curious",3);for(let i=0;i<1000;i++)updateResident(dead,.05)');
  assert.equal(run('dead.x'),run('oldX'));assert.equal(run('dead.y'),run('oldY'));
  assert.equal(run('dead.state'),'dead');assert.equal(run('dead.sign.classList.contains("hidden")'),false);
});
test('new arrivals and population cleanup never remove or revive a corpse',()=>{
  const {run}=setup();
  run('spawnResident("DEAD");var dead=residents[0];killResident(dead);for(let i=0;i<30;i++)spawnResident("LIVING")');
  assert.equal(run('residents.includes(dead)'),true);
  assert.equal(run('Boolean(dead.el.removed)'),false);
  assert.equal(run('residents.filter(r=>!r.dead).length'),24);
  assert.equal(run('dead.state'),'dead');
});

test('mating requires isolated adults at the same edge',()=>{
  const {run}=setup();
  run('spawnResident("A");spawnResident("B");residents.forEach(r=>{r.state="normal";r.x=.12;r.y=.85});');
  assert.equal(run('isolatedPair().length'),2);
  run('residents[0].baby=true');assert.equal(run('isolatedPair()'),null);
  run('residents[0].baby=false;residents[0].x=.5');assert.equal(run('isolatedPair()'),null);
  run('residents[0].x=.12;spawnResident("C");residents.forEach(r=>{r.x=.12;r.y=.85;r.state="normal"})');
  assert.equal(run('isolatedPair()'),null);
});
test('ten-second mating zoom cleans up and creates one small baby',()=>{
  const {run}=setup();
  run('spawnResident("A");spawnResident("B");residents.forEach(r=>{r.state="normal";r.x=.12;r.y=.85});startMatingEvent(isolatedPair())');
  assert.equal(run('document.getElementById("world").classList.contains("romance-camera")'),true);
  run('for(let i=0;i<19;i++)updateMatingEvent(.5)');
  assert.equal(run('residents.length'),2);
  assert.equal(run('matingEvent.hearts.length>0'),true);
  run('updateMatingEvent(.5)');
  assert.equal(run('matingEvent'),null);assert.equal(run('residents.length'),3);
  assert.equal(run('residents[2].baby'),true);
  assert.equal(run('document.getElementById("world").classList.contains("romance-camera")'),false);
  assert.equal(run('residents[0].eventRole'),null);
  assert.equal(run('residents[0].matingCooldown'),90);
});
