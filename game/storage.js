(() => {
  const K=KB, key='keelbreak-campaign-2';
  const empty=()=>({unlocked:0,medals:[0,0,0,0],best:0,completed:0});
  K.load=()=>{try{const x=JSON.parse(localStorage.getItem(key));return x&&Array.isArray(x.medals)?{...empty(),...x}:empty()}catch{return empty()}};
  K.progress=K.load();
  K.save=()=>{try{localStorage.setItem(key,JSON.stringify(K.progress))}catch{}};
  K.award=result=>{K.progress.unlocked=Math.max(K.progress.unlocked,Math.min(3,result.mission+1));K.progress.medals[result.mission]=Math.max(K.progress.medals[result.mission],result.medal);K.progress.best=Math.max(K.progress.best,K.state.score);if(result.mission===3)K.progress.completed++;K.save()};
})();
