// da sprites
const spriteFiles = ["assests/ANimals/001_1.png", "assests/ANimals/001_2.png", "assests/ANimals/001_3.png", "assests/ANimals/002_1.png", "assests/ANimals/002_2.png", "assests/ANimals/002_3.png", "assests/ANimals/003_1.png", "assests/ANimals/003_2.png", "assests/ANimals/003_3.png", "assests/ANimals/003_4.png", "assests/ANimals/003_5.png", "assests/ANimals/004_1.png", "assests/ANimals/004_2.png", "assests/ANimals/004_3.png", "assests/ANimals/005_1.png", "assests/ANimals/005_2.png", "assests/ANimals/005_3.png", "assests/ANimals/005_4.png", "assests/ANimals/006_1.png", "assests/ANimals/006_2.png", "assests/ANimals/006_3.png", "assests/ANimals/007_1.png", "assests/ANimals/007_2.png", "assests/ANimals/007_3.png", "assests/ANimals/008_1.png", "assests/ANimals/008_2.png", "assests/ANimals/008_3.png", "assests/ANimals/009_1.png", "assests/ANimals/009_2.png", "assests/ANimals/009_3.png", "assests/ANimals/010_1.png", "assests/ANimals/010_2.png", "assests/ANimals/010_3.png", "assests/ANimals/011_1.png", "assests/ANimals/011_2.png", "assests/ANimals/011_3.png", "assests/ANimals/012_1.png", "assests/ANimals/012_2.png", "assests/ANimals/012_3.png", "assests/ANimals/013_1.png", "assests/ANimals/013_2.png", "assests/ANimals/013_3.png", "assests/ANimals/014_1.png", "assests/ANimals/014_2.png", "assests/ANimals/014_3.png", "assests/ANimals/015_1.png", "assests/ANimals/015_2.png", "assests/ANimals/015_3.png", "assests/ANimals/016_1.png", "assests/ANimals/016_2.png", "assests/ANimals/016_3.png", "assests/ANimals/017_1.png", "assests/ANimals/017_2.png", "assests/ANimals/017_3.png", "assests/ANimals/018_1.png", "assests/ANimals/018_2.png", "assests/ANimals/018_3.png", "assests/ANimals/019_1.png", "assests/ANimals/019_2.png", "assests/ANimals/019_3.png", "assests/ANimals/020_1.png", "assests/ANimals/020_2.png", "assests/ANimals/020_3.png", "assests/ANimals/021_1.png", "assests/ANimals/021_2.png", "assests/ANimals/021_3.png", "assests/ANimals/022_1.png", "assests/ANimals/022_2.png", "assests/ANimals/022_3.png", "assests/ANimals/023_1.png", "assests/ANimals/023_2.png", "assests/ANimals/023_3.png", "assests/ANimals/024_1.png", "assests/ANimals/024_2.png", "assests/ANimals/024_3.png", "assests/ANimals/025_1.png", "assests/ANimals/025_2.png", "assests/ANimals/025_3.png", "assests/ANimals/026_1.png", "assests/ANimals/026_2.png", "assests/ANimals/026_3.png", "assests/ANimals/027_1.png", "assests/ANimals/027_2.png", "assests/ANimals/027_3.png", "assests/ANimals/028_1.png", "assests/ANimals/028_2.png", "assests/ANimals/028_3.png", "assests/ANimals/029_1.png", "assests/ANimals/029_2.png", "assests/ANimals/029_3.png", "assests/ANimals/030_1.png", "assests/ANimals/030_2.png", "assests/ANimals/030_3.png", "assests/ANimals/031_1.png", "assests/ANimals/031_2.png", "assests/ANimals/031_3.png"];
const randomSprite = () => spriteFiles[Math.floor(Math.random()*spriteFiles.length)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
async function loadAnimal(animal){
  try {const url=await getAnimalImage(animal);return await Promise.race([preloadImage(url),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image timed out')),6000))])}
  catch {return randomSprite()}
}
// change
async function prepareArtwork(path){
  const img=new Image();img.src=path;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,img.width,img.height),d=pixels.data,w=img.width,h=img.height;
  const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
  function add(i){if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4;if(d[p]>235&&d[p+1]>235&&d[p+2]>235&&d[p+3]>0){queue[tail++]=i;d[p+3]=0}}
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
  while(head<tail){const i=queue[head++];if(i%w)add(i-1);if(i%w<w-1)add(i+1);add(i-w);add(i+w)}
  ctx.putImageData(pixels,0,0);return canvas.toDataURL();
}
for(const path of ['assests/button.png','assests/mix again.png','assests/sound on.png','assests/sound off.png','assests/tree 1.png','assests/tree 2.png','assests/screen.png']){
  prepareArtwork(path).then(url=>{
    document.querySelectorAll('img').forEach(img=>{if(img.getAttribute('src')===path)img.src=url});
    if(path.endsWith('screen.png'))document.querySelectorAll('.reveal-photo-wrap').forEach(el=>el.style.backgroundImage=`url("${url}")`);
  }).catch(()=>{});
}
// Draws
const landscape=document.getElementById('landscape'),ctx=landscape.getContext('2d');
let seed=73;
function seeded(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function puff(x,y,r,color){ctx.fillStyle=color;for(let dy=-r;dy<r;dy+=3){const width=Math.floor(Math.sqrt(r*r-dy*dy)/3)*3;ctx.fillRect(Math.floor((x-width)/3)*3,Math.floor((y+dy)/3)*3,width*2,4)}}
function drawLandscape(){
  seed=73;const sky=ctx.createLinearGradient(0,0,0,285);sky.addColorStop(0,'#076c91');sky.addColorStop(1,'#078eaf');ctx.fillStyle=sky;ctx.fillRect(0,0,640,360);
  ctx.fillStyle='#51b3c313';for(let y=25;y<220;y+=40)ctx.fillRect(0,y,640,2);
  //  cloud bank
  const clouds=[[0,221,25],[42,213,31],[73,198,35],[123,209,33],[177,202,47],[214,164,48],[266,125,47],[298,77,58],[319,19,61],[359,48,49],[357,112,50],[374,163,50],[415,198,51],[462,216,40],[505,229,31],[597,232,28],[639,210,36]];
  clouds.forEach(([x,y,r])=>puff(x+17,y+4,r,'#4c9fb6'));
  clouds.forEach(([x,y,r])=>puff(x,y,r,'#93bdc4'));
  clouds.slice(3,14).forEach(([x,y,r])=>puff(x-10,y-10,r*.86,'#c6d3cf'));
  clouds.slice(4,12).forEach(([x,y,r])=>puff(x-19,y-17,r*.73,'#ebe9df'));
  polygon([[0,244],[33,243],[36,239],[45,239],[50,245],[105,246],[130,237],[143,237],[150,242],[222,246],[251,239],[270,239],[275,245],[409,243],[421,238],[441,242],[540,243],[574,245],[593,239],[609,241],[620,248],[640,246],[640,300],[0,300]],'#188257');
  ctx.fillStyle='#76b58a';ctx.fillRect(0,247,640,54);
  for(let i=0;i<420;i++){ctx.fillStyle=i%3?'#d0d88b':'#97c68b';ctx.fillRect(seeded()*640,248+seeded()*49,1,1)}
  polygon([[0,277],[35,270],[73,281],[121,277],[160,280],[202,276],[251,280],[295,277],[325,280],[365,275],[410,281],[467,281],[505,291],[548,291],[587,278],[612,280],[640,271],[640,315],[0,315]],'#22a776');
  for(let i=0;i<55;i++){const x=seeded()*640,y=290+seeded()*10;puff(x,y,3+seeded()*8,i%2?'#187e50':'#278b54')}
  ctx.fillStyle='#70b86c';ctx.fillRect(0,301,640,59);
  for(let row=0;row<6;row++){const y=309+row*10;polygon([[0,y],[100,y-3],[240,y+1],[360,y-2],[520,y+2],[640,y-1],[640,y+6],[450,y+8],[300,y+4],[120,y+6],[0,y+4]],row%2?'#439e55':'#4da758');for(let i=0;i<260;i++){ctx.fillStyle=i%2?'#6bb666':'#399955';ctx.fillRect(seeded()*640,y+seeded()*7,1,2)}}
  for(let i=0;i<150;i++){const x=seeded()*640,y=303+seeded()*57;ctx.fillStyle=i%3?'#e8d773':'#ecedcb';ctx.fillRect(x,y,2,1);if(i%5===0){ctx.fillRect(x+1,y-1,1,3);ctx.fillStyle='#408e50';ctx.fillRect(x+1,y+2,1,3)}}
}
drawLandscape();
function fitLandscape(){const scale=Math.max(innerWidth/640,innerHeight/360);landscape.style.width=`${640*scale}px`;landscape.style.height=`${360*scale}px`;landscape.style.position='absolute';landscape.style.left=`${(innerWidth-640*scale)/2}px`;landscape.style.top=`${(innerHeight-360*scale)/2}px`}
fitLandscape();addEventListener('resize',fitLandscape);
const residents=[];
const reactionArt={chaotic:'assests/chaotic.png',curious:'assests/curious.png',shy:'assests/SHY.png',sleepy:'assests/sleppy.png'};
for(const [type,path] of Object.entries(reactionArt)){
  prepareArtwork(path).then(url=>{
    reactionArt[type]=url;
    residents.forEach(r=>{if(r.state===type)r.sign.src=url});
  }).catch(()=>{});
}
const between=(min,max)=>min+Math.random()*(max-min);
const boundX=x=>Math.max(.03,Math.min(.94,x));
function treePosition(){
  const sceneWidth=Math.max(innerWidth,innerHeight*16/9);
  return boundX(((innerWidth-sceneWidth)/2+sceneWidth*(Math.random()<.5?.175:.282))/innerWidth);
}
function react(r,state,duration,focus=null){
  // A scare can wake a sleeper; other reactions wait until the creature is calm.
  if(r.cooldown>0 || (r.state!=='normal' && !(r.state==='sleepy' && state==='shy')))return false;
  r.state=state;r.stateTime=duration;r.focus=focus;r.pause=0;
  r.sign.src=reactionArt[state];r.sign.classList.remove('hidden');
  r.el.dataset.reaction=state;
  if(state==='chaotic')r.target=boundX(r.x+(r.x>.5?-.24:.24));
  if(state==='shy')r.target=boundX(r.x+(focus&&focus.x>r.x?-.2:.2));
  return true;
}
function calm(r){
  r.state='normal';r.stateTime=0;r.focus=null;r.cooldown=between(7,13);
  r.sign.classList.add('hidden');r.el.dataset.reaction='normal';
  r.pause=between(.6,2);r.target=r.personality==='sleepy'?treePosition():between(.04,.92);
  r.eventIn=between(12,24);
}
function spawnResident(name){
  const el=document.createElement('div');el.className='resident resident-arrival';
  const shadow=document.createElement('div');shadow.className='resident-shadow';
  const label=document.createElement('span');label.className='resident-name';label.textContent=name;
  const sprite=document.createElement('img');sprite.className='resident-sprite';sprite.src=randomSprite();sprite.alt='';
  const sign=document.createElement('img');sign.className='reaction-sign hidden';sign.alt='';
  el.append(shadow,sprite,label,sign);document.getElementById('residents').append(el);
  const personality=['sleepy','curious','shy','chaotic'][Math.floor(Math.random()*4)];
  const r={el,sprite,sign,personality,x:between(.28,.73),y:between(.81,.91),target:between(.04,.92),speed:between(.014,.028),pause:0,state:'normal',stateTime:0,cooldown:0,eventIn:between(7,16),focus:null};
  if(personality==='sleepy'){r.speed*=.65;r.target=treePosition()}
  if(personality==='shy')r.speed*=.85;
  el.dataset.reaction='normal';
  residents.push(r);
  // shy logic
  for(const other of residents){
    if(other===r || residentDistance(other,r)>230)continue;
    if(other.personality==='curious')react(other,'curious',between(3,5),r);
    if(other.personality==='shy')react(other,'shy',between(2,3),r);
  }
  if(residents.length>24){
    const removed=residents.shift();removed.el.remove();
    residents.forEach(other=>{if(other.focus===removed)calm(other)});
  }
}
function residentDistance(a,b){return Math.hypot((a.x-b.x)*innerWidth,(a.y-b.y)*innerHeight)}
function noticeBird(){
  for(const r of residents){if(r.personality==='curious')react(r,'curious',between(3,5),'bird')}
}
function updateResident(r,dt){
  r.cooldown=Math.max(0,r.cooldown-dt);r.eventIn-=dt;
  if(r.state!=='normal'){
    r.stateTime-=dt;
    if(r.stateTime<=0)calm(r);
  }
  if(r.state==='normal' || r.state==='sleepy'){
    const threat=residents.find(other=>other!==r&&other.state==='chaotic'&&residentDistance(r,other)<105);
    if(threat)react(r,'shy',between(1.8,3),threat);
  }
  if(r.state==='normal'&&r.cooldown<=0&&r.eventIn<=0){
    if(r.personality==='sleepy')react(r,'sleepy',between(4,6));
    else if(r.personality==='chaotic')react(r,'chaotic',between(2,3.5));
    else {
      const nearby=residents.filter(other=>other!==r&&residentDistance(r,other)<170);
      if(r.personality==='shy'&&nearby.length>=2)react(r,'shy',between(2,3),nearby[0]);
      else if(r.personality==='curious'&&nearby.length)react(r,'curious',between(3,5),nearby[0]);
    }
    r.eventIn=between(10,20);
  }
  if(r.state==='curious'){
    if(r.focus==='bird'){
      if(birdFlight){const p=birdFlight.elapsed/birdFlight.duration;r.target=boundX(direction>0?p:1-p)}
      else calm(r);
    }else if(r.focus){r.target=boundX(r.focus.x+(r.x<r.focus.x?-.055:.055))}
  }
  let moving=false;
  if(!reducedMotion.matches&&r.state!=='sleepy'){
    if(r.pause>0)r.pause=Math.max(0,r.pause-dt);
    else {
      const d=r.target-r.x;
      if(Math.abs(d)<.006){
        if(r.state==='normal'){r.pause=between(1,4);r.target=r.personality==='sleepy'?treePosition():between(.04,.92)}
        else if(r.state==='chaotic')r.target=between(.04,.92);
      }else{
        const pace=r.state==='chaotic'?3.8:r.state==='shy'?2.1:r.state==='curious'?1.25:1;
        r.x=boundX(r.x+Math.sign(d)*Math.min(Math.abs(d),r.speed*pace*dt));
        r.sprite.style.scale=d>0?'1 1':'-1 1';moving=true;
      }
    }
  }
  r.el.classList.toggle('resting',!moving);
  const size=innerWidth<650?60:76;
  r.el.style.transform=`translate(${Math.max(2,Math.min(innerWidth-size-2,r.x*(innerWidth-size)))}px,${r.y*innerHeight-size}px)`;
  r.el.style.zIndex=Math.round(r.y*100);
}
let lastTime=0,birdAt=4,birdFlight=null,direction=1;
const bird=document.getElementById('bird');
function tick(time){
  const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
  if(!document.hidden){
    for(const r of residents)updateResident(r,dt);
    if(!reducedMotion.matches){
      birdAt-=dt;
      if(!birdFlight&&birdAt<=0){
        direction*=-1;birdFlight={elapsed:0,duration:between(12,19),height:between(.12,.34)};
        bird.firstElementChild.style.scale=direction>0?'1 1':'-1 1';noticeBird();
      }
      if(birdFlight){const f=birdFlight;f.elapsed+=dt;const p=f.elapsed/f.duration;const x=direction>0?-90+p*(innerWidth+180):innerWidth+90-p*(innerWidth+180);bird.style.transform=`translate(${x+100}px,${Math.sin(p*8)*12}px)`;bird.style.top=`${f.height*100}%`;if(p>=1){birdFlight=null;birdAt=between(15,35);bird.style.transform='translateX(-100px)'}}
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
