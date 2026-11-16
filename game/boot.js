(() => {
  const K=KB;
  K.resize=()=>{const d=Math.min(devicePixelRatio,2);K.canvas.width=innerWidth*d;K.canvas.height=innerHeight*d;const scale=Math.min(innerWidth/K.W,(innerHeight-148)/K.H);K.view={dpr:d,scale,ox:(innerWidth-K.W*scale)/2,oy:74+(innerHeight-148-K.H*scale)/2}};
  K.step=dt=>{const s=K.state;s.time+=dt;if(s.mode==='play'){K.tickCombat(dt);K.tickMission(dt);K.tickEffects(dt)}else if(s.mode==='title'||s.mode==='map'){K.tickEffects(dt);s.ship.a=-.35+Math.sin(s.time*.12)*.18;if(Math.random()<dt*10)s.wakes.push({x:s.ship.x-25,y:s.ship.y,a:s.ship.a,life:1.6,r:28})}else K.tickEffects(dt);K.hud()};
  addEventListener('resize',K.resize);K.resize();
  addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();K.keys.add(e.code);if(e.repeat)return;const s=K.state;if(e.code==='KeyP'||e.code==='Escape')K.pause();if(e.code==='KeyM')K.toggleSound();if(e.code==='KeyQ'&&s.mode==='play'){s.weapon=s.weapon==='round'?'chain':'round';K.toast(s.weapon==='chain'?'CHAIN SHOT / slows enemy rigging':'ROUND SHOT / full hull damage')};if(e.code==='Enter'&&s.mode!=='play'&&s.mode!=='paused'){K.$('choices').querySelector('button:not(:disabled)')?.click()}if(/^Digit[123]$/.test(e.code)&&s.mode==='refit')K.$('choices').children[Number(e.code.slice(-1))-1]?.click()});
  addEventListener('keyup',e=>K.keys.delete(e.code));addEventListener('blur',()=>{K.keys.clear();if(K.state.mode==='play')K.pause()});
  K.attract();K.ui();let last=0;
  const frame=t=>{let dt=Math.min(.04,Math.max(0,(t-last)/1000));last=t;K.step(dt);if(K.render)K.render();requestAnimationFrame(frame)};requestAnimationFrame(frame);
  window.keelbreak={snapshot:()=>{const s=K.state;return{mode:s.mode,mission:s.mission,score:s.score,hp:s.ship.hp,kills:s.kills,shots:s.shots,hits:s.hits,time:s.missionTime,unlocked:K.progress.unlocked,medals:[...K.progress.medals],weapon:s.weapon,refits:[...s.refits],capture:s.objective.capture,convoy:s.convoy?{hp:s.convoy.hp,x:s.convoy.x,routeIndex:s.convoy.routeIndex}:null,enemies:s.enemies.map(e=>({x:e.x,y:e.y,kind:e.kind,hp:e.hp}))}}};
})();
