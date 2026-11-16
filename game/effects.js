(() => {
  const K=KB;
  let audio=null,muted=true;
  K.sound=(hz=140,duration=.14,kind='triangle',volume=.035)=>{if(muted)return;try{audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=kind;o.frequency.setValueAtTime(hz,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,hz*.45),audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}};
  K.toggleSound=()=>{muted=!muted;K.$('sound').textContent=muted?'SOUND OFF':'SOUND ON';K.sound(440,.1)};
  K.toast=text=>{K.state.toast=text;K.state.toastTime=2.8};
  K.burst=(x,y,color,count=15,speed=75)=>{for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=Math.random()*speed,l=.35+Math.random()*.8;K.state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:l,maxLife:l,size:2+Math.random()*5,color})}};
  K.tickEffects=dt=>{const s=K.state;for(const p of s.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt;p.vy*=1-dt;p.life-=dt}s.particles=s.particles.filter(p=>p.life>0);for(const w of s.wakes)w.life-=dt;s.wakes=s.wakes.filter(w=>w.life>0);for(const p of s.smoke)p.life-=dt;s.smoke=s.smoke.filter(p=>p.life>0);s.cameraShake=Math.max(0,s.cameraShake-dt*18);s.toastTime=Math.max(0,s.toastTime-dt)};
})();
