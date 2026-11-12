/* FARMVILLA visual atelier — public-site enhancements only; independent of booking/payment scripts. */
(() => {
  'use strict';
  const frame=document.getElementById('fv7-scene');
  const hero=document.querySelector('.fv7-hero-scene');
  if(!frame)return;
  const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const details={
    room:{number:'01 / PRIVATE RETREAT',title:'A restful bedroom',description:'The one-bedroom villa concept prioritizes privacy, comfort and a quieter night away. Final furnishings and facilities will be confirmed before opening.'},
    kitchen:{number:'02 / SIMPLE COMFORTS',title:'Compact kitchenette',description:'A planned kitchenette for uncomplicated weekend stays, with the precise appliances and facilities to be confirmed at launch.'},
    deck:{number:'03 / THE OPEN AIR',title:'A shaded place to pause',description:'A proposed small outdoor sitting area for slow mornings and evenings surrounded by greenery.'}
  };
  const title=frame.querySelector('#fv7-detail-title');
  const number=frame.querySelector('#fv7-detail-number');
  const description=frame.querySelector('#fv7-detail-description');
  const spots=[...frame.querySelectorAll('[data-spot]')];
  const modeButtons=[...frame.querySelectorAll('[data-fv7-time]')];
  function selectSpot(key){
    const entry=details[key];
    if(!entry)return;
    number.textContent=entry.number;
    title.textContent=entry.title;
    description.textContent=entry.description;
    spots.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.spot===key)));
  }
  spots.forEach(b=>b.addEventListener('click',()=>selectSpot(b.dataset.spot)));
  function setMode(mode){
    if(mode!=='day'&&mode!=='night')return;
    frame.dataset.time=mode;
    document.body.classList.toggle('fv7-night',mode==='night');
    modeButtons.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.fv7Time===mode)));
  }
  modeButtons.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.fv7Time)));
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const e of entries)if(e.isIntersecting){e.target.classList.add('fv7-visible');observer.unobserve(e.target)}
    },{threshold:.12});
    observer.observe(frame);
  }else frame.classList.add('fv7-visible');
  if(!prefersReduced&&finePointer){
    let request=0,mx=0,my=0;
    frame.addEventListener('pointermove',e=>{
      const r=frame.getBoundingClientRect();
      mx=((e.clientX-r.left)/Math.max(1,r.width)-0.5)*15;
      my=((e.clientY-r.top)/Math.max(1,r.height)-0.5)*12;
      if(request)return;
      request=requestAnimationFrame(()=>{
        frame.style.setProperty('--fv7-mx',mx.toFixed(1)+'px');
        frame.style.setProperty('--fv7-my',my.toFixed(1)+'px');
        request=0;
      });
    },{passive:true});
    frame.addEventListener('pointerleave',()=>{
      frame.style.setProperty('--fv7-mx','0px');
      frame.style.setProperty('--fv7-my','0px');
    });
    if(hero){
      const area=hero.closest('.hero');
      if(area){
        let pending=false,moveX=0,moveY=0;
        area.addEventListener('pointermove',e=>{
          const r=area.getBoundingClientRect();
          moveX=((e.clientX-r.left)/Math.max(1,r.width)-0.5)*13;
          moveY=((e.clientY-r.top)/Math.max(1,r.height)-0.5)*8;
          if(pending)return;
          pending=true;requestAnimationFrame(()=>{
            hero.style.translate=moveX.toFixed(1)+'px '+moveY.toFixed(1)+'px';
            pending=false;
          });
        },{passive:true});
        area.addEventListener('pointerleave',()=>hero.style.translate='');
      }
    }
  }
  const img=frame.querySelector('.fv7-scene-art img');
  if(img)img.addEventListener('error',()=>{
    const fallback=document.createElement('p');
    fallback.textContent='Villa concept artwork could not load. Details are available using the markers below.';
    fallback.style.cssText='position:absolute;left:10%;right:10%;top:43%;z-index:6;color:#f5f1df;text-align:center';
    frame.append(fallback);
  },{once:true});
  setMode('day');
})();
