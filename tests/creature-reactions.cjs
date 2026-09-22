// Run with: node --test tests/creature-reactions.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
  function element(){const classes=new Set();return {style:{},dataset:{},children:[],classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},append(...children){this.children.push(...children)},remove(){this.removed=true}}}
  const nodes={residents:element(),bird:{firstElementChild:element()}};
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
