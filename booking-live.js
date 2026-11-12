
/* FARMVILLA LIVE — guest booking and availability. No customer database credentials. */
(() => {
 'use strict';
 const API='https://qgjymruipkbhcoyrrotc.supabase.co/functions/v1/farmvilla-booking';
 const form=document.getElementById('enquiry'),arrival=document.getElementById('arrival'),departure=document.getElementById('departure');
 const message=document.getElementById('fvAvailability'),quote=document.getElementById('fvQuote'),calendar=document.getElementById('fvCalendar');
 const result=document.getElementById('result'),submit=form?.querySelector('[type=submit]');
 if(!form||!arrival||!departure||!message||!quote||!calendar)return;
 let blocks=[],price={},loaded=false,calendarOffset=0,busy=false,liveToday='';
 const currency=n=>'LKR '+Number(n||0).toLocaleString('en-LK');
 const dateVal=d=>[d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-');
 const parse=s=>new Date(s+'T12:00:00Z');
 const plus=(s,n)=>dateVal(new Date(Date.parse(s+'T00:00:00Z')+n*86400000));
 const overlaps=(a,b)=>blocks.some(v=>a<v.to&&b>v.from);
 const booked=s=>blocks.some(v=>s>=v.from&&s<v.to);
 const nightCount=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
 const packageType=()=>document.getElementById('package')?.value==='Special Stay'?'special':'standard';
 const req=async(url,options={})=>{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
   try {const r=await fetch(API+url,{...options,signal:controller.signal,cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Booking service unavailable');return j}
   finally{clearTimeout(timeout)}
 };
 const show=(s,kind='info')=>{message.textContent=s;message.dataset.state=kind};
 const currentQuote=()=>{
   if(!loaded)return null;
   const a=arrival.value,b=departure.value;
   if(!a||!b||b<=a)return null;
   const nights=nightCount(a,b);if(nights<1||nights>14)return null;
   if(packageType()==='special')return {nights,amount:null};
   let amount=0;for(let i=0;i<nights;i++){
     const d=new Date(Date.parse(a+'T00:00:00Z')+i*86400000).getUTCDay();
     amount+=Number(price[d===0||d===5||d===6?'weekend':'weekday']||0);
   }
   return {nights,amount};
 };
 const status=()=>{
   if(!loaded){show('Checking live villa availability…');submit.disabled=true;quote.textContent='';return}
   const a=arrival.value,b=departure.value;
   if(!a||!b){show('Choose check-in and check-out dates.');quote.textContent='';submit.disabled=true;return}
   const nights=nightCount(a,b);
   if(a<(liveToday||a)||nights<1||nights>14){show('Choose 1–14 nights with valid future dates.','error');quote.textContent='';submit.disabled=true;return}
   if(overlaps(a,b)){show('Those nights are reserved or temporarily held. Please choose different dates.','error');quote.textContent='Unavailable';submit.disabled=true;return}
   const q=currentQuote();
   show('Dates available for request · subject to final confirmation.','ok');
   quote.textContent=q?.amount==null?'Special occasion: final quotation provided after review.':currency(q.amount)+' estimated stay total for '+q.nights+' night'+(q.nights===1?'':'s')+'.';
   submit.disabled=busy||false;
 };
 const paint=()=>{
   if(!loaded){calendar.innerHTML='<p>Loading live calendar…</p>';return}
   const today=parse(liveToday),first=new Date(Date.UTC(today.getUTCFullYear(),today.getUTCMonth()+calendarOffset,1));
   const yr=first.getUTCFullYear(),mo=first.getUTCMonth(),start=first.getUTCDay(),count=new Date(Date.UTC(yr,mo+1,0)).getUTCDate();
   const monthName=first.toLocaleString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
   calendar.replaceChildren();
   const top=document.createElement('div');top.className='fv-calendar-top';
   const prev=document.createElement('button');prev.type='button';prev.textContent='←';prev.disabled=calendarOffset<=0;
   const next=document.createElement('button');next.type='button';next.textContent='→';next.disabled=calendarOffset>=11;
   const label=document.createElement('strong');label.textContent=monthName;
   prev.onclick=()=>{calendarOffset--;paint()};next.onclick=()=>{calendarOffset++;paint()};
   top.append(prev,label,next);calendar.append(top);
   const grid=document.createElement('div');grid.className='fv-calendar-grid';
   ['S','M','T','W','T','F','S'].forEach(x=>{const e=document.createElement('span');e.className='fv-weekday';e.textContent=x;grid.append(e)});
   for(let i=0;i<start;i++)grid.append(document.createElement('span'));
   for(let d=1;d<=count;d++){
     const day=dateVal(new Date(Date.UTC(yr,mo,d))),b=document.createElement('button');
     b.type='button';b.textContent=String(d);b.className='fv-day';
     const disabled=day<liveToday||day>=plus(liveToday,365)||booked(day);
     b.disabled=disabled;b.title=disabled?(booked(day)?'Reserved or held':'Not bookable'):'Select date '+day;
     if(disabled)b.classList.add('fv-unavailable');
     if(arrival.value===day||departure.value===day)b.classList.add('fv-selected');
     if(arrival.value&&departure.value&&day>arrival.value&&day<departure.value)b.classList.add('fv-in-range');
     b.onclick=()=>{
       if(!arrival.value||departure.value||day<=arrival.value){arrival.value=day;departure.value='';departure.min=plus(day,1)}
       else {departure.value=day}
       paint();status();
     };
     grid.append(b);
   }
   calendar.append(grid);
   const legend=document.createElement('div');legend.className='fv-calendar-legend';legend.textContent='Available dates · grey dates are reserved or temporarily held';calendar.append(legend)
 };
 const refresh=async()=>{
   loaded=false;status();
   try{
     const [a,r]=await Promise.all([req('?action=availability'),req('?action=rates')]);
     blocks=a.blocks||[];liveToday=a.server_date;
     price=Object.fromEntries((r.rates||[]).map(x=>[x.code,Number(x.amount)]));
     for(const el of document.querySelectorAll('[data-public-rate]')){
       const v=price[el.dataset.publicRate];if(Number.isFinite(v))el.textContent=v.toLocaleString('en-LK');
     }
     const note=document.querySelector('.ratesnote');
     if(note&&r.rates?.every(x=>x.approved))note.textContent='Published villa rates. Total depends on selected dates; holidays and special stays may require a separate quotation. Reservations are confirmed only after staff approval; no online payment is collected.';
     loaded=true;paint();status();
   }catch(e){show('Live booking temporarily unavailable: '+e.message+'. Please try again later.','error');calendar.textContent='Live availability cannot be displayed right now.';submit.disabled=true;quote.textContent=''}
 };
 [arrival,departure,document.getElementById('package')].forEach(x=>x?.addEventListener('change',()=>{paint();status()}));
 form.addEventListener('submit',async e=>{
   e.preventDefault();e.stopImmediatePropagation();
   if(busy||!loaded||!arrival.value||!departure.value||overlaps(arrival.value,departure.value))return;
   const data=new FormData(form);
   busy=true;submit.disabled=true;submit.textContent='Submitting booking request…';result.textContent='';
   try{
     const j=await req('',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
       action:'create',name:data.get('Name'),phone:data.get('Phone'),email:data.get('Email')||'',
       check_in:arrival.value,check_out:departure.value,package:packageType(),
       guests:Number(data.get('Guests')?.toString().split(' ')[0]||2),
       notes:data.get('Notes')||'',consent:document.getElementById('fvConsent')?.checked===true,website:''
     })});
     const wrap=document.createElement('div');wrap.className='fv-receipt';
     const heading=document.createElement('h3');heading.textContent='Request received ✓';
     const ref=document.createElement('p');ref.className='fv-ref';ref.textContent=j.reference;
     const desc=document.createElement('p');desc.textContent='Status: pending approval. Dates held up to 24 hours. This is not yet a confirmed reservation and no payment has been taken.';
     const total=document.createElement('p');total.textContent=j.estimated_total==null?'Special stay: awaiting quotation.':'Estimated accommodation total: '+currency(j.estimated_total);
     const copy=document.createElement('button');copy.type='button';copy.textContent='Copy booking reference';copy.onclick=async()=>{try{await navigator.clipboard.writeText(j.reference);copy.textContent='Copied ✓'}catch{copy.textContent='Please copy the reference shown above'}};
     const print=document.createElement('button');print.type='button';print.textContent='Print reference';print.onclick=()=>window.print();
     wrap.append(heading,ref,desc,total,copy,print);result.replaceChildren(wrap);result.scrollIntoView({behavior:'smooth',block:'center'});
     await refresh();
   }catch(error){const box=document.createElement('p');box.className='fv-error';box.textContent=error.message||'Request could not be saved. Try again.';result.replaceChildren(box);await refresh()}
   finally{busy=false;submit.textContent='Request dates ↗';status()}
 },true);
 submit.disabled=true;refresh();document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastCheck>90000){lastCheck=Date.now();refresh()}});let lastCheck=Date.now();
})();
