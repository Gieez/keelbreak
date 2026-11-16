/* Shared campaign state and sector definitions. Classic scripts keep file:// playable. */
window.KB = (() => {
  const $ = id => document.getElementById(id);
  const canvas = $('sea');
  const sectors = [
    { name:'BREAK THE HARBOR', subtitle:'Sink the blockade fleet', kind:'battle', water:['#164752','#082a38'], color:'#b6d278', land:[{x:95,y:130,r:112,shape:1},{x:1115,y:125,r:110,shape:2},{x:190,y:690,r:102,shape:3},{x:1120,y:670,r:112,shape:4},{x:600,y:340,r:48,shape:5}], capture:{x:640,y:400,r:100}, route:[], start:{x:640,y:620}, roster:['brig','cutter','brig','mortar'] },
    { name:'THE GLASS REEF', subtitle:'Escort the merchant to the east buoy', kind:'escort', water:['#195555','#0a3443'], color:'#c5db9a', land:[{x:170,y:140,r:130,shape:2},{x:540,y:95,r:82,shape:4},{x:845,y:120,r:120,shape:1},{x:1080,y:690,r:150,shape:3},{x:390,y:690,r:115,shape:4}], capture:{x:1110,y:425,r:85}, route:[{x:180,y:405},{x:520,y:445},{x:800,y:390},{x:1110,y:425}], start:{x:260,y:485}, roster:['cutter','cutter','mortar','brig'] },
    { name:'CINDER SIGNAL', subtitle:'Hold the signal zone for 20 seconds', kind:'capture', water:['#393d43','#152936'], color:'#ddbb84', land:[{x:150,y:220,r:130,shape:5},{x:1040,y:160,r:170,shape:1},{x:1090,y:680,r:130,shape:3},{x:205,y:700,r:100,shape:4}], capture:{x:640,y:390,r:150}, route:[], start:{x:620,y:625}, roster:['mortar','brig','cutter','mortar','brig'] },
    { name:'THE IRON CROWN', subtitle:'Destroy the dreadnought and its escorts', kind:'boss', water:['#172e41','#0a1b2e'], color:'#a9c6db', land:[{x:640,y:40,r:170,shape:6},{x:110,y:260,r:125,shape:1},{x:1150,y:280,r:125,shape:2},{x:190,y:710,r:95,shape:3},{x:1100,y:710,r:95,shape:4}], capture:{x:640,y:370,r:100}, route:[], start:{x:630,y:630}, roster:['boss','brig','cutter','mortar','cutter'] }
  ];
  const blank = () => ({mode:'title',time:0,mission:0,ship:null,enemies:[],bullets:[],particles:[],wakes:[],salvage:[],hazards:[],smoke:[],convoy:null,objective:{capture:0},cameraShake:0,score:0,kills:0,shots:0,hits:0,missionTime:0,spawnTimer:18,toast:'',toastTime:0,weapon:'round',refits:[],campaignResults:[],lastResult:null});
  return { $,canvas,ctx:canvas.getContext('2d'),W:1280,H:800,sectors,state:blank(),blank,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,keys:new Set(),view:{scale:1,ox:0,oy:0,dpr:1},config:{},dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),angleDiff:a=>Math.atan2(Math.sin(a),Math.cos(a)),clamp:(v,a,b)=>Math.max(a,Math.min(b,v)) };
})();
