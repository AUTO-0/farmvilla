/* FARMVILLA | Motion Atelier V6 — progressive enhancement. No guest-data access. */
(() => {
'use strict';
const $=(s,root=document)=>root.querySelector(s);
const all=(s,root=document)=>Array.from(root.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const stage=$('#mv6-journey'),sticky=$('.mv6-sticky'),timeButtons=all('.mv6-time-toggle button'),stepButtons=all('.mv6-phases-nav button');
const fab=$('#mv6-fab'),spine=$('.mv6-spine > i'),hero=$('#home');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const motionOk=!reduced && !document.hidden;
document.body.classList.add('mv6-active');
let scheduled=false,stageProgress=0,lastStage=-1;
function titleWords(){
  if(reduced)return;
  const titles=all('#story h2,#stay h2,#experience h2,#rates h2,#feedback h2,#faq h2,#enquire h2,.mv6-between p');
  for(const head of titles) {
    let index=0;
    const process=(node)=>{
      for(const child of Array.from(node.childNodes)){
        if(child.nodeType===Node.TEXT_NODE){
          const content=child.textContent||'';
          if(!content.trim())continue;
          const frag=document.createDocumentFragment();
          for(const token of content.split(/(\s+)/)){
            if(!token)continue;
            if(/^\s+$/.test(token)){frag.append(document.createTextNode(token));continue}
            const outer=document.createElement('span'),inner=document.createElement('span');
            outer.className='mv6-word';inner.className='mv6-word-inner';
            inner.textContent=token;inner.style.setProperty('--m6-i',Math.min(index++,20));
            outer.append(inner);frag.append(outer);
          }
          node.replaceChild(frag,child);
        } else if(child.nodeType===Node.ELEMENT_NODE && !child.matches('br,button,a')) process(child);
      }
    };
    process(head);
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver((entries)=>{
        if(entries.some(e=>e.isIntersecting)){head.classList.add('mv6-show');observer.disconnect()}
      },{threshold:0.09,rootMargin:'0px 0px -6% 0px'});
      observer.observe(head);
    }else head.classList.add('mv6-show');
  }
}
function setStage(idx){
  const safe=clamp(idx,0,2);
  if(lastStage===safe)return;
  lastStage=safe;
  sticky.dataset.stage=String(safe);
  stepButtons.forEach((b,i)=>b.setAttribute('aria-current',i===safe?'step':'false'));
  const label=$('#mv6-count');
  if(label)label.textContent='0'+(safe+1)+' / 03';
}
function update(){
  scheduled=false;
  if(document.hidden)return;
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const overall=clamp(scrollY/max,0,1);
  document.documentElement.style.setProperty('--m6-scroll',overall.toFixed(4));
  if(fab){
    const booking=$('#enquire'),show=scrollY>Math.max(350,(hero?.offsetHeight||700)*.66)
      &&(!booking||booking.getBoundingClientRect().top>innerHeight*.44);
    fab.classList.toggle('mv6-fab-hidden',!show);
    fab.setAttribute('aria-hidden',show?'false':'true');
    fab.tabIndex=show?0:-1;
  }
  if(stage&&sticky){
    const rect=stage.getBoundingClientRect();
    const span=Math.max(1,rect.height-innerHeight);
    stageProgress=clamp(-rect.top/span,0,1);
    sticky.style.setProperty('--m6-journey',stageProgress.toFixed(4));
    setStage(Math.min(2,Math.floor(Math.min(.9999,stageProgress)*3)));
  }
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
document.addEventListener('visibilitychange',schedule);
stepButtons.forEach((b,index)=>b.addEventListener('click',()=>{
  const span=Math.max(1,stage.offsetHeight-innerHeight);
  const y=window.scrollY+stage.getBoundingClientRect().top;
  const target=y+((index+.4)/3)*span;
  window.scrollTo({top:target,behavior:reduced?'instant':'smooth'});
}));
timeButtons.forEach(b=>b.addEventListener('click',()=>{
  const val=b.dataset.time;
  if(val!=='day'&&val!=='night')return;
  sticky.dataset.time=val;
  timeButtons.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.time===val)));
}));
const art=$('.mv6-art');
if(art){
  if('IntersectionObserver' in window){
    const obs=new IntersectionObserver(e=>{
      if(e.some(x=>x.isIntersecting)){art.classList.add('in');obs.disconnect()}
    },{threshold:.12});
    obs.observe(art);
  }else art.classList.add('in');
}
if(!reduced&&!coarse&&hero){
  let mx=0,my=0,queued=false;
  const sculpt=$('.sculpture');
  hero.addEventListener('pointermove',e=>{
    const rect=hero.getBoundingClientRect();
    mx=e.clientX/Math.max(1,rect.width)-.5;my=e.clientY/Math.max(1,rect.height)-.5;
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{
      if(sculpt){sculpt.style.filter='drop-shadow('+(-mx*35)+'px '+(-my*24+16)+'px 58px #09130999)'}
      queued=false;
    });
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{if(sculpt)sculpt.style.filter=''});
}
function activeSection(){
  if(!('IntersectionObserver' in window))return;
  const targets=all('main section[id]');
  const io=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting)entry.target.classList.add('mv6-inview');
    }
  },{threshold:.12});
  targets.forEach(x=>io.observe(x));
}
titleWords();activeSection();schedule();
})();
