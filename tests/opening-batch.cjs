const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
test('opening creates six results before the timer, then one per countdown',async()=>{
  const nodes=new Map();let spawned=0,started=0,tick;
  const get=id=>{
    if(!nodes.has(id))nodes.set(id,{classList:{add(){},remove(){}},style:{},parentElement:{},addEventListener(){}});
    return nodes.get(id);
  };
  const sandbox={console,document:{getElementById:get},setTimeout:fn=>{queueMicrotask(fn)},setInterval:fn=>{started++;tick=fn;return started},clearInterval(){},startMusic(){},playSfx(){},loadAnimal:async()=> 'photo.png',spawnResident(){spawned++;if(spawned<=6)assert.equal(started,0)}};
  vm.createContext(sandbox);
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  vm.runInContext(html.split('<script>')[1].split('</script>')[0],sandbox);
  const first=vm.runInContext('beginMix()',sandbox);
  await vm.runInContext('beginMix()',sandbox); // Double clicks cannot start another batch.
  assert.equal(get('mixAgainButton').disabled,true);
  await first;
  assert.equal(spawned,6);assert.equal(started,1);
  assert.equal(get('countdown').textContent,25);
  assert.equal(get('countdown').parentElement.hidden,false);
  assert.equal(get('mixAgainButton').disabled,false);
  for(let i=0;i<24;i++)tick();assert.equal(spawned,6);
  tick();
  for(let i=0;i<100;i++)await Promise.resolve();
  assert.equal(spawned,7);assert.equal(started,2);
  await vm.runInContext('beginMix()',sandbox);
  assert.equal(spawned,8);assert.equal(started,3);
});
