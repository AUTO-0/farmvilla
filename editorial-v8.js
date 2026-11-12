/* FARMVILLA V8 — interaction layer. Artwork/animations only; does not read or change bookings. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle=document.getElementById('fv8-nav-toggle');
  const overlay=document.getElementById('fv8-overlay');
  const navLinks=overlay?Array.from(overlay.querySelectorAll('a[href^="#"]')):[];
  const cards=Array.from(document.querySelectorAll('[data-fv8-card]'));
  const deck=document.getElementById('fv8-deck');
  const detailNo=document.getElementById('fv8-detail-number');
  const detailTitle=document.getElementById('fv8-detail-title');
  const detailCopy=document.getElementById('fv8-detail-copy');
  const shiftSection=document.getElementById('experience');
  let active=1,lastFocus=null,raf=0;
  const entries=[
    {number:'01 / 03',title:'Arrive to a little quiet.',text:'A private one-bedroom retreat, designed around the kind of time that belongs entirely to you. The villa is a proposed concept and final facilities are subject to confirmation.'},
    {number:'02 / 03',title:'A slower kind of morning.',text:'Nothing to rush. Nothing to prove. Just the space to reconnect, rest, and enjoy the countryside at your own pace.'},
    {number:'03 / 03',title:'Make the moment yours.',text:'A weekend for two, or a small occasion by prior arrangement. Special-stay requests are subject to owner approval and operating rules.'}
  ];
  function selectCard(index,focus=false){
    if(!cards.length)return;
    const next=Math.max(0,Math.min(cards.length-1,index));
    active=next;
    cards.forEach((card,i)=>card.setAttribute('aria-pressed',String(i===active)));
    const item=entries[active];
    if(detailNo)detailNo.textContent=item.number;
    if(detailTitle)detailTitle.textContent=item.title;
    if(detailCopy)detailCopy.textContent=item.text;
    if(focus)cards[active].focus({preventScroll:true});
    if(matchMedia('(max-width:590px)').matches && focus){
      cards[active].scrollIntoView({block:'nearest',inline:'center',behavior:reduced?'instant':'smooth'});
    }
  }
  cards.forEach((card,i)=>card.addEventListener('click',()=>selectCard(i)));
  if(deck){
    deck.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();
      selectCard(e.key==='ArrowLeft'?active-1:e.key==='ArrowRight'?active+1:e.key==='Home'?0:cards.length-1,true);
    });
    // Mobile card swiping keeps native scrolling; selected card follows the nearest snap point.
    let wait=0;
    deck.addEventListener('scroll',()=>{
      if(!matchMedia('(max-width:590px)').matches)return;
      cancelAnimationFrame(wait);
      wait=requestAnimationFrame(()=>{
        const center=deck.getBoundingClientRect().left+deck.clientWidth/2;
        let nearest=active,best=Infinity;
        cards.forEach((card,i)=>{const r=card.getBoundingClientRect(),dist=Math.abs(r.left+r.width/2-center);if(dist<best){nearest=i;best=dist}});
        if(nearest!==active)selectCard(nearest);
      });
    },{passive:true});
  }
  selectCard(1);
  function openMenu(){
    if(!overlay||!toggle)return;
    lastFocus=document.activeElement;
    overlay.hidden=false;
    toggle.setAttribute('aria-expanded','true');
    toggle.setAttribute('aria-label','Close navigation menu');
    document.body.classList.add('fv8-nav-open');
    navLinks[0]?.focus({preventScroll:true});
  }
  function closeMenu(restore=true){
    if(!overlay||!toggle)return;
    overlay.hidden=true;
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open navigation menu');
    document.body.classList.remove('fv8-nav-open');
    if(restore)(lastFocus&&typeof lastFocus.focus==='function'?lastFocus:toggle).focus({preventScroll:true});
  }
  if(overlay&&toggle){
    toggle.addEventListener('click',()=>overlay.hidden?openMenu():closeMenu());
    navLinks.forEach(a=>a.addEventListener('click',()=>closeMenu(false)));
    overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)closeMenu()});
    document.addEventListener('keydown',e=>{
      if(overlay.hidden)return;
      if(e.key==='Escape'){e.preventDefault();closeMenu();return}
      if(e.key==='Tab'){
        const els=[toggle,...overlay.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetWidth||x.offsetHeight||x===toggle);
        if(!els.length)return;
        const first=els[0],last=els[els.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    });
  }
  if(shiftSection){
    if('IntersectionObserver' in window){
      const obs=new IntersectionObserver(entries=>{
        if(entries.some(e=>e.isIntersecting)){shiftSection.classList.add('fv8-inview');obs.disconnect()}
      },{threshold:.08});
      obs.observe(shiftSection);
    } else shiftSection.classList.add('fv8-inview');
    if(!reduced){
      const onScroll=()=>{
        if(raf)return;
        raf=requestAnimationFrame(()=>{
          raf=0;
          if(document.hidden)return;
          const rect=shiftSection.getBoundingClientRect();
          if(rect.bottom<0||rect.top>innerHeight)return;
          const amount=(innerHeight-rect.top)/(innerHeight+rect.height);
          shiftSection.style.setProperty('--fv8-shift',Math.max(0,Math.min(1,amount)).toFixed(3));
        });
      };
      window.addEventListener('scroll',onScroll,{passive:true});
      onScroll();
    }
  }
})();
