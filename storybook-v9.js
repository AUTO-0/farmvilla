/* FARMVILLA — The Enchanted Stay. Original storybook interactions only. Booking handled separately by booking-live.js. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pages=[
    {eyebrow:'CHAPTER I · THE ARRIVAL',title:'Where the world <em>grows quieter.</em>',text:'Follow the little path through the green, past the flowering trees, to a place made for leaving the everyday behind.',art:'./storybook-v9-landscape.svg',tag:'AN ARTISTIC IMPRESSION · VILLA 01'},
    {eyebrow:'CHAPTER II · THE RETREAT',title:'A room for <em>just being.</em>',text:'A restful one-bedroom space with the comforts of a private washroom and a planned compact kitchenette. Every detail is being considered for slow weekends.',art:'./storybook-v9-interior.svg',tag:'ILLUSTRATED INTERIOR CONCEPT · NOT BUILT'},
    {eyebrow:'CHAPTER III · GOLDEN HOUR',title:'When evening <em>turns to magic.</em>',text:'Stay a little longer. Watch the light change, enjoy the quiet of the farm, and let a simple evening become the best part of your day.',art:'./storybook-v9-landscape.svg',tag:'CONCEPT ART · EVENING AT THE FARM'},
    {eyebrow:'CHAPTER IV · UNTIL NEXT TIME',title:'Some stories <em>stay with you.</em>',text:'Whether it is an unhurried weekend for two or a small occasion approved in advance, the finest memories are often the simplest.',art:'./storybook-v9-interior.svg',tag:'A PROPOSED GUEST EXPERIENCE'}
  ];
  const cover=$('cover'),book=$('book'),content=$('book-content'),art=$('book-art'),artImg=$('book-image'),tag=$('book-image-tag'),number=$('page-index'),prev=$('page-prev'),next=$('page-next'),progress=$('progress');
  let index=0,turning=false;
  function drawPage(i){
    const p=pages[i];
    if(!p||!content)return;
    const eyebrow=$('page-eyebrow'),title=$('page-title'),copy=$('page-text');
    eyebrow.textContent=p.eyebrow;
    title.innerHTML=p.title; // authored static data only; no user content
    copy.textContent=p.text;
    art.dataset.chapter=String(i);
    artImg.src=p.art;
    tag.textContent=p.tag;
    number.textContent=String(i+1).padStart(2,'0')+' / 04';
    prev.disabled=i===0;next.disabled=i===pages.length-1;
  }
  function changePage(dir){
    const dest=index+dir;
    if(turning||dest<0||dest>=pages.length)return;
    if(reduce){index=dest;drawPage(index);return}
    turning=true;
    const cls=dir>0?'turn-next':'turn-prev';
    book.classList.remove('turn-next','turn-prev');
    // Force a fresh CSS animation on each click
    void book.offsetWidth;book.classList.add(cls);
    prev.disabled=true;next.disabled=true;
    setTimeout(()=>{index=dest;drawPage(index)},420);
    setTimeout(()=>{book.classList.remove(cls);turning=false;prev.disabled=index===0;next.disabled=index===pages.length-1},900);
  }
  if(prev&&next){
    prev.addEventListener('click',()=>changePage(-1));
    next.addEventListener('click',()=>changePage(1));
    book.addEventListener('keydown',e=>{
      if(e.target.closest('button,input,textarea,select'))return;
      if(e.key==='ArrowLeft'){e.preventDefault();changePage(-1)}
      else if(e.key==='ArrowRight'){e.preventDefault();changePage(1)}
    });
  }
  drawPage(0);
  const menuBtn=$('menu-btn'),menu=$('mobile-panel');
  if(menuBtn&&menu){
    function setMenu(open){
      menu.classList.toggle('open',open);
      menuBtn.setAttribute('aria-expanded',String(open));
      menuBtn.textContent=open?'Close':'Menu';
    }
    menuBtn.addEventListener('click',()=>setMenu(menuBtn.getAttribute('aria-expanded')!=='true'));
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  }
  if(cover&&!reduce){
    const lights=$('fireflies');
    if(lights)for(let i=0;i<23;i++){
      const node=document.createElement('i');
      const x=19+((i*37.7)%80),y=19+((i*27.1)%70);
      node.style.setProperty('--x',x.toFixed(2)+'%');
      node.style.setProperty('--y',y.toFixed(2)+'%');
      node.style.setProperty('--r',String(2+(i%3))+'px');
      node.style.setProperty('--dur',String(2.6+(i%6)*.7)+'s');
      node.style.setProperty('--delay',String(-i*.52)+'s');
      node.style.setProperty('--dx',String((i%2?1:-1)*(8+i%12))+'px');
      lights.append(node);
    }
  }
  const reveal=[...document.querySelectorAll('.reveal')];
  if(reduce||!('IntersectionObserver' in window))reveal.forEach(x=>x.classList.add('seen'));
  else{
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');io.unobserve(e.target)}}),{threshold:.09});
    reveal.forEach(x=>io.observe(x));
  }
  const floatBtn=$('floating-book');
  let ticking=false;
  function onScroll(){
    ticking=false;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(progress)progress.style.width=(Math.max(0,Math.min(1,scrollY/max))*100).toFixed(2)+'%';
    if(floatBtn){
      const booked=$('enquire'),far=scrollY>Math.max(450,cover.offsetHeight*.6),
      beforeBooking=!booked||booked.getBoundingClientRect().top>innerHeight*.45;
      floatBtn.classList.toggle('active',far&&beforeBooking);
      floatBtn.tabIndex=far&&beforeBooking?0:-1;
      floatBtn.setAttribute('aria-hidden',String(!(far&&beforeBooking)));
    }
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener('resize',onScroll,{passive:true});
  onScroll();
  // Guestbook reviews: published only when staff-approved and stay-verified.
  const grid=$('reviewGrid');
  if(grid)fetch('./reviews.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Reviews unavailable');return r.json()}).then(data=>{
    if(!Array.isArray(data))return;
    const real=data.filter(r=>r&&r.verified===true&&r.approved===true&&typeof r.name==='string'&&typeof r.comment==='string'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5).slice(0,9);
    if(!real.length)return;
    grid.replaceChildren();
    real.forEach(r=>{
      const article=document.createElement('article');article.className='review-card';
      const stars=document.createElement('div');stars.className='stars';stars.textContent='★'.repeat(r.rating)+'☆'.repeat(5-r.rating);
      const block=document.createElement('blockquote');block.textContent=r.comment.slice(0,480);
      const who=document.createElement('div');who.className='name';who.textContent=r.name.slice(0,65)+' · Verified stay';
      article.append(stars,block,who);grid.append(article);
    });
  }).catch(()=>{});
  let rating=5;
  const starButtons=[...document.querySelectorAll('#feedbackForm [data-star]')];
  const updateStars=n=>{
    rating=n;$('feedbackRating').value=String(n);
    starButtons.forEach(b=>{
      b.classList.toggle('active',Number(b.dataset.star)<=n);
      b.setAttribute('aria-pressed',String(Number(b.dataset.star)===n));
    });
  };
  starButtons.forEach(b=>b.addEventListener('click',()=>updateStars(Number(b.dataset.star))));
  updateStars(5);
  const feedback=$('feedbackForm'),feedbackResult=$('feedbackResult');
  if(feedback)feedback.addEventListener('submit',e=>{
    e.preventDefault();
    if(!feedback.reportValidity())return;
    const text='FARMVILLA GUEST FEEDBACK — NOT YET SENT\n'+[...new FormData(feedback)].map(([k,v])=>k+': '+v).join('\n');
    feedbackResult.className='result';
    feedbackResult.textContent='Your feedback is ready to copy but has NOT been submitted. Please share it with the official villa contact channel when available.\n\n'+text;
    const btn=document.createElement('button');
    btn.type='button';btn.textContent='Copy feedback';
    btn.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(text);btn.textContent='Copied ✓'}
      catch{btn.textContent='Select and copy the message above'}
    });
    feedbackResult.append(btn);
  });
})();
