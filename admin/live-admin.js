
/* FARMVILLA LIVE OWNER ADMIN — Supabase authenticated client. */
(() => {
'use strict';
const URL='https://qgjymruipkbhcoyrrotc.supabase.co';
const KEY='sb_publishable_abCDv575eyhP-qOmaA39FA_KO5433Mr';
const SB=window.supabase?.createClient(URL,KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=n=>'LKR '+Number(n||0).toLocaleString('en-LK',{maximumFractionDigits:0});
const date=s=>String(s||'').slice(0,10);
const today=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Colombo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),v=t=>parts.find(p=>p.type===t).value;return v('year')+'-'+v('month')+'-'+v('day')};
const nights=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
const fmt=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const active=b=>['confirmed','checked_in','completed'].includes(b.status);
const held=b=>['pending','confirmed','checked_in','blocked'].includes(b.status);
let session=null,view='overview',rows=[],expenses=[],rates=[],calendarOffset=0,editing=null,busy=false,lastPending=0,ready=false;
const login=$('login'),layout=$('layout'),screen=$('screen');
const toast=(msg,err=false)=>{const t=$('toast');t.textContent=msg;t.style.display='block';t.style.background=err?'#943d36':'#193323';clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.style.display='none',4300)};
const badge=v=>'<span class="badge '+esc(v)+'">'+esc(String(v).replaceAll('_',' '))+'</span>';
const action=(text,cmd,id,kind='secondary')=>'<button type="button" class="btn small '+kind+'" data-action="'+esc(cmd)+'" data-id="'+esc(id)+'">'+esc(text)+'</button>';
const card=(name,val,sub)=>'<article class="card"><div class="caps">'+esc(name)+'</div><div class="value">'+esc(val)+'</div><p class="muted">'+esc(sub)+'</p></article>';
const names={overview:'Business overview',bookings:'Booking management',calendar:'Availability calendar',pricing:'Public rates',finance:'Financial records',growth:'Business growth'};
function roleGate(e){return e?.message||'Could not access live villa records.'}
async function userAccess(){
 const {data:auth,error:aerr}=await SB.auth.getUser();if(aerr||!auth?.user)return false;
 const {data:profile,error}=await SB.from('fv_admins').select('role').eq('user_id',auth.user.id).maybeSingle();
 if(error||!profile)return false;
 return profile.role==='owner'||profile.role==='manager';
}
async function signin(){
 const e=$('loginEmail').value.trim(),p=$('loginPassword').value;
 $('loginError').textContent='Signing in…';
 const {data,error}=await SB.auth.signInWithPassword({email:e,password:p});
 if(error){$('loginError').textContent=error.message;return}
 session=data.session;
 if(!(await userAccess())){await SB.auth.signOut();$('loginError').textContent='This account is not authorized for FARMVILLA administration.';return}
 login.classList.add('hidden');layout.classList.remove('hidden');$('loginPassword').value='';$('loginError').textContent='';
 await reload();
}
async function boot(){
 if(!SB){$('loginError').textContent='Secure login library could not load. Refresh your browser.';return}
 const {data}=await SB.auth.getSession();if(data?.session){session=data.session;if(await userAccess()){login.classList.add('hidden');layout.classList.remove('hidden');await reload();return}await SB.auth.signOut()}
 login.classList.remove('hidden');layout.classList.add('hidden');
}
async function reload(){
 if(busy||!session)return;
 busy=true;$('refreshed').textContent='Refreshing secure villa data…';
 try {
   const results=await Promise.all([
     SB.from('fv_bookings').select('*').order('created_at',{ascending:false}).limit(1000),
     SB.from('fv_expenses').select('*').order('expense_date',{ascending:false}).limit(1000),
     SB.from('fv_rates').select('*').order('code')
   ]);
   for(const r of results)if(r.error)throw Error(roleGate(r.error));
   [rows,expenses,rates]=results.map(x=>x.data||[]);
   $('refreshed').textContent='Last synced '+new Date().toLocaleTimeString('en-LK',{hour:'2-digit',minute:'2-digit'});
   const p=rows.filter(b=>b.status==='pending').length;
   if(ready&&p>lastPending)toast((p-lastPending)+' new booking request(s) waiting for approval');
   lastPending=p;ready=true;render();
 } catch(e){$('refreshed').textContent='Sync failed';toast(e.message,true)}
 finally{busy=false}
}
function setView(v){
 if(!names[v])return;view=v;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===v));
 $('title').textContent=names[v];render();
}
function render(){
 if(view==='overview')return renderOverview();
 if(view==='bookings')return renderBookings();
 if(view==='calendar')return renderCalendar();
 if(view==='pricing')return renderPricing();
 if(view==='finance')return renderFinance();
 if(view==='growth')return renderGrowth();
}
function renderOverview(){
 const current=today().slice(0,7),paid=rows.reduce((a,b)=>a+Number(b.paid_amount||0),0),gross=rows.filter(active).reduce((a,b)=>a+Number(b.amount||0),0);
 const inMonth=rows.filter(b=>active(b)&&b.check_in.slice(0,7)===current);
 const monthRevenue=inMonth.reduce((a,b)=>a+Number(b.amount||0),0);
 const monthExpense=expenses.filter(x=>x.expense_date.slice(0,7)===current).reduce((a,b)=>a+Number(b.amount||0),0);
 const pending=rows.filter(b=>b.status==='pending').sort((a,b)=>a.created_at.localeCompare(b.created_at));
 screen.innerHTML='<div class="grid">'+card('Awaiting approval',pending.length+'','New website requests')+card('This month sales',cash(monthRevenue),'Confirmed/completed check-ins')+card('This month expenses',cash(monthExpense),'Recorded business expenses')+card('Payments received',cash(paid),'Manual verified receipts')+'</div><div class="split section"><div class="card"><div class="row between"><h3>Booking requests needing attention</h3>'+action('Manage','goto','bookings')+'</div><div class="tablebox"><table class="table"><thead><tr><th>Reference</th><th>Guest</th><th>Stay</th><th>Amount</th><th>Action</th></tr></thead><tbody>'+pending.slice(0,8).map(b=>'<tr><td>'+esc(b.reference)+'</td><td>'+esc(b.guest_name)+'</td><td>'+fmt(b.check_in)+' – '+fmt(b.check_out)+'</td><td>'+cash(b.amount)+'</td><td>'+action('Review','edit',b.id)+'</td></tr>').join('')+'</tbody></table></div>'+(!pending.length?'<p class="empty">No pending booking requests.</p>':'')+'</div><div class="card"><h3>Villa 01 · Operations</h3><p class="muted">One exclusive villa. Guest website enquiries appear here automatically. Accept or decline requests after checking guest details and payment arrangements.</p><div class="statsline"><span>Confirmed stays</span><b>'+rows.filter(active).length+'</b></div><div class="statsline"><span>Recognized booked value</span><b>'+cash(gross)+'</b></div><div class="statsline"><span>Unpaid balance</span><b>'+cash(Math.max(0,gross-paid))+'</b></div><p>'+action('New manual booking','new','booking','')+' '+action('Open calendar','goto','calendar')+'</p></div></div>';
}
function renderBookings(){
 screen.innerHTML='<div class="row between"><p class="muted">Website requests are saved automatically. Pending dates hold for up to 24 hours unless approved. Never mark payment received before checking your bank account.</p>'+action('+ Add manual booking','new','booking','')+'</div><div class="card tablebox section"><table class="table"><thead><tr><th>Reference</th><th>Guest / contact</th><th>Stay</th><th>Status</th><th>Quoted</th><th>Received</th><th>Actions</th></tr></thead><tbody>'+rows.map(b=>'<tr><td><strong>'+esc(b.reference)+'</strong><br><small>'+fmt(b.check_in)+'</small></td><td><strong>'+esc(b.guest_name)+'</strong><br>'+esc(b.phone)+'<br><small>'+esc(b.email)+'</small></td><td>'+fmt(b.check_in)+'<br>to '+fmt(b.check_out)+'<br><small>'+nights(b.check_in,b.check_out)+' night(s)</small></td><td>'+badge(b.status)+'</td><td>'+cash(b.amount)+'</td><td>'+cash(b.paid_amount)+'</td><td>'+action('Manage','edit',b.id)+' '+action('Invoice','invoice',b.id)+'</td></tr>').join('')+'</tbody></table>'+(!rows.length?'<div class="empty">No villa bookings yet.</div>':'')+'</div>';
}
function renderCalendar(){
 const t=new Date(today()+'T12:00:00Z'),d=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+calendarOffset,1)),y=d.getUTCFullYear(),m=d.getUTCMonth();
 const ym=d.toLocaleString('en-GB',{month:'long',year:'numeric',timeZone:'UTC'});
 const days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
 let html='<div class="card"><div class="calendar-top"><button class="btn secondary small" data-action="prev" data-id="">← Previous</button><h3 style="margin:0">'+esc(ym)+'</h3><button class="btn secondary small" data-action="next" data-id="">Next →</button></div><div class="calendar-days">'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>'<span>'+x+'</span>').join('');
 for(let n=0;n<d.getUTCDay();n++)html+='<span></span>';
 for(let n=1;n<=days;n++){
   const dt=[y,String(m+1).padStart(2,'0'),String(n).padStart(2,'0')].join('-');
   const matches=rows.filter(b=>held(b)&&dt>=b.check_in&&dt<b.check_out);
   const activeB=matches.some(b=>b.status!=='pending'),st=matches.length?(activeB?'confirmed':'blocked'):'';
   html+='<div class="calendar-day '+st+' '+(dt<today()?'dim':'')+'"><span class="daynum">'+n+'</span>'+matches.slice(0,2).map(b=>'<small>'+esc(b.status==='blocked'?'OWNER BLOCK':b.status.toUpperCase())+'</small>').join('')+'</div>';
 }
 html+='</div><p class="muted">Green: confirmed/blocked stay. Beige: pending request. Check-out day is free for a new arrival. Click “Add manual booking” to block maintenance dates.</p>'+action('Add manual booking or block','new','booking')+'</div>';
 screen.innerHTML=html;
}
function renderPricing(){
 const get=k=>rates.find(x=>x.code===k)||{amount:0,approved:false};
 screen.innerHTML='<div class="card"><h3>Villa rates · automatically displayed on customer website</h3><p class="muted">Saving a price updates the secure database and the guest website reads the new rate automatically. No GitHub editing is required. Daily stays are priced according to each night’s weekday/weekend category. Special stays remain quotation-only.</p><form id="pricingForm"><div class="formgrid"><label>Weekday · Mon–Thu (LKR / night)<input type="number" name="weekday" min="0" max="10000000" step="100" required value="'+get('weekday').amount+'"></label><label>Weekend · Fri–Sun (LKR / night)<input type="number" name="weekend" min="0" max="10000000" step="100" required value="'+get('weekend').amount+'"></label><label>Special stay · reference package (LKR)<input type="number" name="special" min="0" max="10000000" step="100" required value="'+get('special').amount+'"></label></div><p class="muted">Current publication status: '+(rates.every(r=>r.approved)?'Approved rates':'Proposed / not owner approved')+'</p><button type="submit" class="btn">Save and publish prices ↗</button></form></div>';
}
function renderFinance(){
 const received=rows.reduce((n,b)=>n+Number(b.paid_amount||0),0),cost=expenses.reduce((n,x)=>n+Number(x.amount||0),0);
 const bill=rows.filter(active).reduce((n,b)=>n+Number(b.amount||0),0);
 screen.innerHTML='<div class="grid">'+card('Recorded payments',cash(received),'Manually entered actual receipts')+card('Accommodation sales',cash(bill),'Confirmed/completed booking values')+card('Recorded expenses',cash(cost),'Actual costs entered')+card('Net cash movement',cash(received-cost),'Receipts less recorded costs')+'</div><div class="section row">'+action('+ Record expense','new','expense','')+' '+action('Export expenses CSV','export','expenses')+' '+action('Export bookings CSV','export','bookings')+'</div><div class="card section tablebox"><h3>Expenses</h3><table class="table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Action</th></tr></thead><tbody>'+expenses.map(x=>'<tr><td>'+esc(x.expense_date)+'</td><td>'+esc(x.category)+'</td><td>'+esc(x.description)+'</td><td>'+cash(x.amount)+'</td><td>'+action('Delete','deleteExpense',x.id,'red')+'</td></tr>').join('')+'</tbody></table></div>';
}
function renderGrowth(){
 const m=today().slice(0,7),t=new Date(m+'-01T12:00:00Z'),monthDays=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate();
 let nightsSold=0;const monthData=rows.filter(active);
 for(let n=1;n<=monthDays;n++){const day=m+'-'+String(n).padStart(2,'0');if(monthData.some(b=>day>=b.check_in&&day<b.check_out))nightsSold++}
 const sales=monthData.filter(b=>b.check_in.slice(0,7)===m).reduce((n,b)=>n+Number(b.amount||0),0);
 const soldAll=monthData.reduce((a,b)=>a+nights(b.check_in,b.check_out),0);
 const average=soldAll?rows.filter(active).reduce((a,b)=>a+Number(b.amount||0),0)/soldAll:0;
 const groups={};rows.forEach(b=>groups[b.source||'Other']=(groups[b.source||'Other']||0)+1);const max=Math.max(1,...Object.values(groups));
 screen.innerHTML='<div class="grid">'+card('Current month occupancy',Math.round(nightsSold/monthDays*100)+'%',nightsSold+' occupied nights of '+monthDays)+card('Average booked night',cash(average),'Booked value / nights sold')+card('Current month sales',cash(sales),'By check-in month')+card('Booking requests',rows.filter(b=>b.source==='website').length,'Received from public website')+'</div><div class="split section"><div class="card"><h3>Guest acquisition sources</h3>'+Object.keys(groups).map(k=>'<div class="barrow"><b>'+esc(k)+'</b><div class="bar" style="width:'+(groups[k]/max*57)+'%"></div><small>'+groups[k]+'</small></div>').join('')+'<p class="muted">Counts include pending and cancelled enquiries.</p></div><div class="card"><h3>Next growth decisions</h3><p class="muted">Compare weekday and weekend occupancy, vary rates only after checking actual costs, record customer sources, monitor cancellations, and request consent-based feedback after verified stays.</p></div></div>';
}
function showBooking(id){
 const b=rows.find(x=>x.id===id)||{},newRow=!id;editing=id||null;
 $('bookTitle').textContent=newRow?'Add booking / block dates':'Manage '+b.reference;
 const f=(name,val,type='text',extra='')=>'<label>'+name+'<input type="'+type+'" name="'+name.replaceAll(' ','_')+'" value="'+esc(val||'')+'" '+extra+'></label>';
 const field=(name,v,id,type='text',attr='')=>'<label>'+name+'<input id="'+id+'" type="'+type+'" value="'+esc(v??'')+'" '+attr+'></label>';
 $('bookFields').innerHTML=field('Guest / block name',b.guest_name||'','bName','text','required maxlength="90"')+field('Phone',b.phone||'','bPhone','tel','required maxlength="30"')+field('Email',b.email||'','bEmail','email','maxlength="150"')+field('Guests',b.guests??2,'bGuests','number','min="1" max="4"')+field('Check-in',b.check_in||today(),'bIn','date','required')+field('Check-out',b.check_out||'','bOut','date','required')+field('Agreed total (LKR)',b.amount??0,'bAmount','number','min="0" step="1"')+field('Received after verification (LKR)',b.paid_amount??0,'bPaid','number','min="0" step="1"')+'<label>Status<select id="bStatus">'+['pending','confirmed','checked_in','completed','cancelled','declined','expired','blocked'].map(x=>'<option value="'+x+'" '+((b.status||'pending')===x?'selected':'')+'>'+x.replaceAll('_',' ')+'</option>').join('')+'</select></label>'+'<label>Stay type<select id="bPackage"><option value="standard" '+(b.package==='standard'?'selected':'')+'>Standard stay</option><option value="special" '+(b.package==='special'?'selected':'')+'>Special stay</option><option value="block" '+(b.package==='block'?'selected':'')+'>Owner blocked dates</option></select></label>'+'<label class="full">Notes<textarea id="bNotes" rows="3" maxlength="600">'+esc(b.notes||'')+'</textarea></label>';
 $('bookError').textContent='';$('bookDialog').showModal();
}
async function saveBooking(e){
 e.preventDefault();$('bookError').textContent='';const p={
 guest_name:$('bName').value.trim(),phone:$('bPhone').value.trim(),email:$('bEmail').value.trim(),
 guests:Number($('bGuests').value),check_in:$('bIn').value,check_out:$('bOut').value,
 amount:Number($('bAmount').value),paid_amount:Number($('bPaid').value),
 status:$('bStatus').value,package:$('bPackage').value,notes:$('bNotes').value.trim().slice(0,600)
 };
 if(!p.guest_name||p.phone.length<7||!p.check_in||!p.check_out||nights(p.check_in,p.check_out)<1||nights(p.check_in,p.check_out)>14||p.amount<0||p.paid_amount<0||p.paid_amount>p.amount){$('bookError').textContent='Check required guest details, stay dates, amounts and payment balance (maximum 14 nights).';return}
 let out=editing?await SB.from('fv_bookings').update(p).eq('id',editing):await SB.from('fv_bookings').insert({...p,source:'manual'});
 if(out.error){$('bookError').textContent=out.error.code==='23P01'?'Date conflict: these nights are already blocked by another booking.':out.error.message;return}
 $('bookDialog').close();toast('Booking saved');await reload();
}
async function setStatus(id,v){
 const b=rows.find(x=>x.id===id);if(!b)return;
 if(v==='confirmed'&&b.package==='special'&&Number(b.amount)===0){showBooking(id);toast('Set the agreed special-stay total before approval.',true);return}
 if(!confirm('Change '+b.reference+' to '+v.replaceAll('_',' ')+'?'))return;
 const {error}=await SB.from('fv_bookings').update({status:v}).eq('id',id);
 if(error)toast(error.code==='23P01'?'Those dates are already taken.':error.message,true);else{toast('Booking status updated');await reload()}
}
function invoice(id){
 const b=rows.find(x=>x.id===id);if(!b)return;
 const win=window.open('','_blank');if(!win){toast('Allow pop-ups to print an invoice',true);return}
 const doc='<!doctype html><html><head><meta charset="utf-8"><title>INV-'+esc(b.reference)+'</title><style>body{font:14px/1.7 Arial,sans-serif;max-width:760px;padding:40px;margin:auto;color:#162c1d}header{border-bottom:2px solid #1b3422;padding-bottom:24px}h1{font:400 44px Georgia,serif;margin:8px 0}table{width:100%;border-collapse:collapse;margin:36px 0}td,th{text-align:left;padding:13px;border-bottom:1px solid #ccc}small{color:#777}button{padding:12px 20px;border:0;background:#1b3422;color:white}@media print{button{display:none}}</style></head><body><header><small>FARMVILLA 01 · INVOICE</small><h1>FARMVILLA</h1><p>INVOICE REF: INV-'+esc(b.reference)+'</p></header><p>Guest: <b>'+esc(b.guest_name)+'</b><br>Check-in: '+fmt(b.check_in)+'<br>Check-out: '+fmt(b.check_out)+'<br>Status: '+esc(b.status)+'</p><table><thead><tr><th>Description</th><th>Nights</th><th>Amount (LKR)</th></tr></thead><tbody><tr><td>Villa 01 accommodation</td><td>'+nights(b.check_in,b.check_out)+'</td><td>'+Number(b.amount).toLocaleString('en-LK')+'</td></tr></tbody></table><h2>Total: '+cash(b.amount)+'</h2><p>Payment recorded: '+cash(b.paid_amount)+'<br>Balance: <b>'+cash(Math.max(0,Number(b.amount)-Number(b.paid_amount)))+'</b></p><p><small>Generated from manually verified bookings and payment records. Confirm tax treatment and all charges before issuing as an official tax invoice.</small></p><button onclick="window.print()">Print / Save as PDF</button></body></html>';
 win.document.open();win.document.write(doc);win.document.close();
}
async function saveRates(e){
 e.preventDefault();const f=new FormData(e.target);
 const entries=['weekday','weekend','special'].map(code=>({code,amount:Number(f.get(code))}));
 if(entries.some(x=>!Number.isSafeInteger(x.amount)||x.amount<0||x.amount>10000000)){toast('Rates must be whole numbers between 0 and 10 million LKR',true);return}
 if(!confirm('Publish these prices on the public villa website?'))return;
 const outcomes=await Promise.all(entries.map(x=>SB.from('fv_rates').update({amount:x.amount,approved:true,updated_at:new Date().toISOString()}).eq('code',x.code)));
 const error=outcomes.find(x=>x.error)?.error;if(error)toast(error.message,true);else{toast('Public villa prices updated');await reload()}
}
async function saveExpense(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.amount=Number(d.amount);
 const {error}=await SB.from('fv_expenses').insert(d);
 if(error)toast(error.message,true);else{$('expenseDialog').close();e.target.reset();toast('Expense recorded');await reload()}
}
function exportCsv(which){
 const cols=which==='expenses'?['expense_date','category','description','amount']:['reference','guest_name','phone','email','guests','check_in','check_out','package','amount','paid_amount','status','source','created_at'];
 const data=which==='expenses'?expenses:rows;
 const contents=[cols.join(','),...data.map(x=>cols.map(k=>'"'+String(x[k]??'').replaceAll('"','""')+'"').join(','))].join('\r\n');
 const blob=new Blob([contents],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='farmvilla-'+which+'-'+today()+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
$('loginForm').addEventListener('submit',e=>{e.preventDefault();signin()});
$('logoutBtn').onclick=async()=>{await SB.auth.signOut();session=null;login.classList.remove('hidden');layout.classList.add('hidden');rows=[];expenses=[];rates=[]};
$('refreshBtn').onclick=reload;
$('menu').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)setView(b.dataset.view)});
screen.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=b.dataset.id;
 if(a==='goto')setView(id);if(a==='edit')showBooking(id);if(a==='invoice')invoice(id);
 if(a==='new'){if(id==='booking')showBooking();if(id==='expense'){$('expenseDate').value=today();$('expenseDialog').showModal()}}
 if(a==='prev'){calendarOffset--;renderCalendar()}if(a==='next'){calendarOffset++;renderCalendar()}
 if(a==='deleteExpense'&&confirm('Delete this expense record permanently?')){const {error}=await SB.from('fv_expenses').delete().eq('id',id);if(error)toast(error.message,true);else await reload()}
 if(a==='export')exportCsv(id);
});
screen.addEventListener('submit',e=>{if(e.target.id==='pricingForm')saveRates(e)});
$('bookForm').addEventListener('submit',saveBooking);$('expenseForm').addEventListener('submit',saveExpense);
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
if(SB){SB.auth.onAuthStateChange((_event,s)=>{session=s});boot();setInterval(()=>{if(!document.hidden&&session&&!busy)reload()},30000)}else $('loginError').textContent='Could not load authentication software. Reload to try again.';
})();
