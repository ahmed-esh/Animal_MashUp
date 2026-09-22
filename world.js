// The manifest includes every sprite supplied in assests/ANimals.
const spriteFiles = ["assests/ANimals/001_1.png", "assests/ANimals/001_2.png", "assests/ANimals/001_3.png", "assests/ANimals/002_1.png", "assests/ANimals/002_2.png", "assests/ANimals/002_3.png", "assests/ANimals/003_1.png", "assests/ANimals/003_2.png", "assests/ANimals/003_3.png", "assests/ANimals/003_4.png", "assests/ANimals/003_5.png", "assests/ANimals/004_1.png", "assests/ANimals/004_2.png", "assests/ANimals/004_3.png", "assests/ANimals/005_1.png", "assests/ANimals/005_2.png", "assests/ANimals/005_3.png", "assests/ANimals/005_4.png", "assests/ANimals/006_1.png", "assests/ANimals/006_2.png", "assests/ANimals/006_3.png", "assests/ANimals/007_1.png", "assests/ANimals/007_2.png", "assests/ANimals/007_3.png", "assests/ANimals/008_1.png", "assests/ANimals/008_2.png", "assests/ANimals/008_3.png", "assests/ANimals/009_1.png", "assests/ANimals/009_2.png", "assests/ANimals/009_3.png", "assests/ANimals/010_1.png", "assests/ANimals/010_2.png", "assests/ANimals/010_3.png", "assests/ANimals/011_1.png", "assests/ANimals/011_2.png", "assests/ANimals/011_3.png", "assests/ANimals/012_1.png", "assests/ANimals/012_2.png", "assests/ANimals/012_3.png", "assests/ANimals/013_1.png", "assests/ANimals/013_2.png", "assests/ANimals/013_3.png", "assests/ANimals/014_1.png", "assests/ANimals/014_2.png", "assests/ANimals/014_3.png", "assests/ANimals/015_1.png", "assests/ANimals/015_2.png", "assests/ANimals/015_3.png", "assests/ANimals/016_1.png", "assests/ANimals/016_2.png", "assests/ANimals/016_3.png", "assests/ANimals/017_1.png", "assests/ANimals/017_2.png", "assests/ANimals/017_3.png", "assests/ANimals/018_1.png", "assests/ANimals/018_2.png", "assests/ANimals/018_3.png", "assests/ANimals/019_1.png", "assests/ANimals/019_2.png", "assests/ANimals/019_3.png", "assests/ANimals/020_1.png", "assests/ANimals/020_2.png", "assests/ANimals/020_3.png", "assests/ANimals/021_1.png", "assests/ANimals/021_2.png", "assests/ANimals/021_3.png", "assests/ANimals/022_1.png", "assests/ANimals/022_2.png", "assests/ANimals/022_3.png", "assests/ANimals/023_1.png", "assests/ANimals/023_2.png", "assests/ANimals/023_3.png", "assests/ANimals/024_1.png", "assests/ANimals/024_2.png", "assests/ANimals/024_3.png", "assests/ANimals/025_1.png", "assests/ANimals/025_2.png", "assests/ANimals/025_3.png", "assests/ANimals/026_1.png", "assests/ANimals/026_2.png", "assests/ANimals/026_3.png", "assests/ANimals/027_1.png", "assests/ANimals/027_2.png", "assests/ANimals/027_3.png", "assests/ANimals/028_1.png", "assests/ANimals/028_2.png", "assests/ANimals/028_3.png", "assests/ANimals/029_1.png", "assests/ANimals/029_2.png", "assests/ANimals/029_3.png", "assests/ANimals/030_1.png", "assests/ANimals/030_2.png", "assests/ANimals/030_3.png", "assests/ANimals/031_1.png", "assests/ANimals/031_2.png", "assests/ANimals/031_3.png"];
const randomSprite = () => spriteFiles[Math.floor(Math.random()*spriteFiles.length)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const theme = new Audio('assests/Sound/Theme_Sound.wav');
theme.loop = true; theme.volume = .32;
let muted = false, musicStarted = false;
const effects = new Set();
function startMusic(){
  if(muted || document.hidden) return;
  theme.play().then(()=>{musicStarted=true}).catch(()=>{});
}
function playSfx(volume=.6,rate=1){
  if(muted || document.hidden) return;
  const sound = new Audio('assests/Sound/SFX.wav');
  sound.volume=volume; sound.playbackRate=rate;
  effects.add(sound);sound.onended=()=>effects.delete(sound);
  sound.play().catch(()=>effects.delete(sound));
}
document.getElementById('soundToggle').addEventListener('click',()=>{
  muted=!muted;
  const button=document.getElementById('soundToggle');
  button.textContent=muted?'Sound off':'Sound on';
  button.setAttribute('aria-label',muted?'Unmute sound':'Mute sound');
  button.setAttribute('aria-pressed',String(muted));
  if(muted){theme.pause();effects.forEach(s=>s.pause());effects.clear()}else startMusic();
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){theme.pause();effects.forEach(s=>s.pause());effects.clear()}
  else if(musicStarted)startMusic();
});
async function loadAnimal(animal){
  try {const url=await getAnimalImage(animal);return await Promise.race([preloadImage(url),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image timed out')),6000))])}
  catch {return randomSprite()}
}
// Remove only white connected to the outer edge of opaque artwork.
// This preserves the white MIX lettering and any internal highlights.
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
for(const path of ['assests/button.png','assests/tree 1.png','assests/tree 2.png','assests/screen.png']){
  prepareArtwork(path).then(url=>{
    document.querySelectorAll('img').forEach(img=>{if(img.getAttribute('src')===path)img.src=url});
    if(path.endsWith('screen.png'))document.querySelectorAll('.reveal-photo-wrap,.creature-frame').forEach(el=>el.style.backgroundImage=`url("${url}")`);
  }).catch(()=>{});
}
// Draw at a low resolution for a crisp, consistent pixel-art landscape.
const landscape=document.getElementById('landscape'),ctx=landscape.getContext('2d');
let seed=73;
function seeded(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function puff(x,y,r,color){ctx.fillStyle=color;for(let dy=-r;dy<r;dy+=3){const width=Math.floor(Math.sqrt(r*r-dy*dy)/3)*3;ctx.fillRect(Math.floor((x-width)/3)*3,Math.floor((y+dy)/3)*3,width*2,4)}}
function drawLandscape(){
  seed=73;const sky=ctx.createLinearGradient(0,0,0,285);sky.addColorStop(0,'#076c91');sky.addColorStop(1,'#078eaf');ctx.fillStyle=sky;ctx.fillRect(0,0,640,360);
  ctx.fillStyle='#51b3c313';for(let y=25;y<220;y+=40)ctx.fillRect(0,y,640,2);
  // Towering cloud bank, with stepped silhouettes and shaded eastern edges.
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
function spawnResident(name){
  const el=document.createElement('div');el.className='resident resident-arrival';
  const shadow=document.createElement('div');shadow.className='resident-shadow';
  const label=document.createElement('span');label.className='resident-name';label.textContent=name;
  const sprite=document.createElement('img');sprite.src=randomSprite();sprite.alt='';
  el.append(shadow,sprite,label);document.getElementById('residents').append(el);
  const r={el,x:.28+Math.random()*.45,y:.81+Math.random()*.1,target:Math.random()*.9,speed:.014+Math.random()*.014,pause:0};
  residents.push(r);
  // Bound the active population to keep long-running sessions smooth.
  if(residents.length>24)residents.shift().el.remove();
}
let lastTime=0,birdAt=4,birdFlight=null,direction=1;
const bird=document.getElementById('bird');
function tick(time){
  const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
  if(!document.hidden){
    for(const r of residents){
      if(!reducedMotion.matches){
        if(r.pause>0){r.pause-=dt;r.el.classList.add('resting')}
        else {const d=r.target-r.x;r.el.classList.remove('resting');if(Math.abs(d)<.006){r.pause=1+Math.random()*4;r.target=.04+Math.random()*.88}else{r.x+=Math.sign(d)*r.speed*dt;r.el.querySelector('img').style.scale=d>0?'1 1':'-1 1'}}
      }
      const size=innerWidth<650?60:76;
      r.el.style.transform=`translate(${Math.max(2,Math.min(innerWidth-size-2,r.x*(innerWidth-size)))}px,${r.y*innerHeight-size}px)`;
      r.el.style.zIndex=Math.round(r.y*100);
    }
    if(!reducedMotion.matches){
      birdAt-=dt;
      if(!birdFlight&&birdAt<=0){direction*=-1;birdFlight={elapsed:0,duration:12+Math.random()*7,height:.12+Math.random()*.22};bird.firstElementChild.style.scale=direction>0?'1 1':'-1 1'}
      if(birdFlight){const f=birdFlight;f.elapsed+=dt;const p=f.elapsed/f.duration;const x=direction>0?-90+p*(innerWidth+180):innerWidth+90-p*(innerWidth+180);bird.style.transform=`translate(${x+100}px,${Math.sin(p*8)*12}px)`;bird.style.top=`${f.height*100}%`;if(p>=1){birdFlight=null;birdAt=15+Math.random()*20;bird.style.transform='translateX(-100px)'}}
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
