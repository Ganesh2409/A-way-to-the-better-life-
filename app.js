/*
 Personal Nutrition, Fitness & Lifestyle Tracker — Schema v2
 ------------------------------------------------------------------
 DATA MODEL (v2)
 db = {
   schemaVersion: 2,
   months: { "YYYY-MM": { goal, notes, weeks: {
     [weekKey]: { id, startDate, endDate, categories:{food:[], micronutrients:[], exercise:[], lifestyle:[]},
       notes, prompts:{worked,change,focus}, summary, closed }
   }}},
   body: [{id,date,weight,waist,notes}],
   settings: {weekStartDay, consistencyThreshold, backupIntervalDays, theme, ...},
   snapshots: []
 }
 item = {id,lineageId,name,target,actual,unit,notes,step,weight,keyItem,dailyTracking,
         dailyLog,manualOverride,daysTarget,scoreBy,aliases}

 STORAGE KEYS
 - ntl.v1             current app database (schemaVersion 2)
 - ntl.v1.premigrate  raw v1 string preserved before first migration
 - ntl.snapshots      rolling backup snapshots (last 5)
 - ntl.ui             non-essential UI state
 - ntl.legacy.v1     optional legacy copy when importing older generated build

 Historical weeks are independent records. A copied week gets a new id for each
 record but preserves lineageId. Stored summary scores include scoringVersion.
*/
const KEY="ntl.v1", PREMIGRATE="ntl.v1.premigrate", SNAPKEY="ntl.snapshots", UIKEY="ntl.ui";
const SCHEMA_VERSION=2, SCORING_VERSION=1;
const CATS=[['food','Food'],['micronutrients','Micronutrients'],['exercise','Exercise'],['lifestyle','Lifestyle']];
const PERSONAL_QUOTES = [
"I’m not lazy. I’m just tired of fighting the same version of myself.",
"Cognizant is the cost. GATE is the exit.",
"I don’t need a perfect life. I need a life that feels like mine.",
"One day, I want my calendar to belong to me.",
"I’m not chasing a salary. I’m chasing freedom that a salary can buy.",
"I wasted time. Fine. I’m not wasting any more.",
"The version of me I’m trying to become doesn’t negotiate with the version of me that keeps postponing.",
"I don’t want to spend my whole life maintaining someone else’s system.",
"I want enough money to breathe, enough freedom to travel, and enough peace to enjoy both.",
"Some dreams don’t die. They just wait for you to stop making excuses.",
"I’m building a life I won’t need a vacation from.",
"I don’t want ‘stable’ if stable means quietly unhappy.",
"Maybe I’m behind. But I’m still moving.",
"My biggest competition is the version of me that keeps saying ‘tomorrow.’",
"I don’t need motivation every day. I need to keep showing up when motivation disappears.",
"I want the kind of success that gives me stories, not just screenshots.",
"One day I’ll look back at this job and be grateful it pushed me out.",
"I’m allowed to want more.",
"I’m not trying to prove everyone wrong. I’m trying to prove myself right.",
"I want to wake up excited about where my life is going.",
"The dream was never just PSU. The dream was freedom.",
"A good career should support my life, not consume it.",
"I’d rather struggle for something I chose than get comfortable with something I didn’t.",
"I have wasted enough mornings. The next one counts.",
"My future self is depending on what I do with today.",
"I don’t need another plan. I need execution.",
"The life I imagine requires a version of me I haven’t become yet.",
"Fear can come with me. It just doesn’t get to drive.",
"I can be scared and still move.",
"There’s a difference between resting and running away.",
"I want to see mountains, snow, new countries, strange streets, and a life I actually remember.",
"I don’t want to spend my youth waiting for retirement.",
"Money isn’t the destination. It’s the fuel.",
"I want freedom more than I want approval.",
"I want a life where Sunday night doesn’t feel like a warning.",
"Maybe the boring phase is funding the adventurous one.",
"Every ₹26k month is temporary if I use it to build something bigger.",
"I’m not stuck. I’m preparing my exit.",
"The job pays the bills. The dream pays the soul.",
"I don’t want to look successful. I want to feel free.",
"I’ve got responsibilities. I also have a life to live.",
"Growing up shouldn’t mean giving up everything that made you curious.",
"I want to explore the world before life becomes only responsibilities and routines.",
"There’s still a kid inside me who wants to see snow for the first time.",
"I don’t want stories about places I should have visited.",
"One day, I’ll take the trip without asking whether I can afford to take a breath.",
"I’m saving money, but I’m also saving a future.",
"I want assets, skills, memories, and freedom — not just a designation.",
"I don’t want my entire identity to fit inside a job title.",
"The goal is not to escape responsibility. It’s to have enough freedom to choose it.",
"Some people want a bigger house. I want a bigger map.",
"I want a passport full of memories, not just an office ID full of access badges.",
"I’m building quietly because I know what I’m building toward.",
"Not every chapter needs to look impressive while you’re living it.",
"This chapter is ugly sometimes. It’s still mine.",
"I don’t need everyone to understand the plan.",
"I just need myself to stop abandoning it.",
"Discipline is remembering what you wanted when the excitement wore off.",
"The hardest part isn’t knowing what to do. It’s doing it when nobody is watching.",
"I’ve already learned what happens when I keep postponing my life.",
"A year can disappear frighteningly fast. So can a year of progress.",
"I kept GATE aside for too long. I’m not keeping myself aside anymore.",
"The comeback doesn’t need to be dramatic. It just needs to be real.",
"Start ugly. Start late. Just start.",
"I don’t need to recover the lost year. I need to use the next one.",
"Every lecture finished is one less thing hanging over my head.",
"Every difficult topic understood is proof that I’m still capable.",
"I’m not trying to become extraordinary overnight. I’m trying to become consistent.",
"Rank is the result. Showing up is the job.",
"Six hours today beats six promises about tomorrow.",
"I can’t change the time I wasted. I can change what it costs me.",
"Future me deserves better than another excuse from present me.",
"I’m allowed to restart without pretending I never stopped.",
"The comeback begins embarrassingly small.",
"One page. One problem. One workout. One better decision.",
"Progress doesn’t always feel like progress while you’re inside it.",
"I don’t need a new life. I need better decisions repeated long enough.",
"Some days the win is simply not quitting.",
"I’m building proof that I can trust myself again.",
"The person I want to become is built in boring moments.",
"I want love that feels like home, not a battle against the world.",
"Some people become part of your life without ever becoming part of your future.",
"Caring deeply doesn’t mean forcing a story to have the ending you wanted.",
"Sometimes the hardest thing is accepting that something can be beautiful and still not be practical.",
"I can love someone and still choose reality.",
"Not every connection is meant to become a relationship. Some simply change you.",
"I don’t want to build my future around a fantasy I’m afraid to lose.",
"The right life shouldn’t require me to lose myself to keep someone else.",
"Maybe someday everything will make sense. Until then, I’ll keep building.",
"I don’t have every answer about marriage, family, kids, or the future. And that’s okay.",
"I’m allowed to figure out adulthood while I’m living it.",
"I want a family someday only if I can still recognize myself inside that life.",
"I want responsibility without losing curiosity.",
"I want roots strong enough to return to and wings strong enough to leave with.",
"I’m not scared of hard work. I’m scared of spending years on the wrong thing.",
"The real goal is simple: a peaceful mind, strong body, good people, enough money, and somewhere new to go.",
"I don’t want a life that looks impressive from the outside and feels empty from the inside.",
"Maybe I’m still figuring everything out. But at least I know I want to live.",
"Someday, I want to sit somewhere far from here and realize: every difficult decision was worth it.",
"I’m not building a perfect life. I’m building a life I’ll be proud to call mine."
];
function loadQuoteState(){try{return JSON.parse(localStorage.getItem(UIKEY)||'{}').quotes||null}catch{return null}}
function saveQuoteState(q){let ui={};try{ui=JSON.parse(localStorage.getItem(UIKEY)||'{}')}catch{};ui.quotes=q;localStorage.setItem(UIKEY,JSON.stringify(ui))}
function shuffledQuoteQueue(){let a=PERSONAL_QUOTES.map((_,i)=>i);for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function currentQuote(){let q=loadQuoteState();if(!q||!Array.isArray(q.queue)||q.queue.length!==PERSONAL_QUOTES.length||q.index<0||q.index>=q.queue.length){q={queue:shuffledQuoteQueue(),index:0}};saveQuoteState(q);return PERSONAL_QUOTES[q.queue[q.index]]}
function refreshQuote(){let q=loadQuoteState()||{queue:shuffledQuoteQueue(),index:0};if(!Array.isArray(q.queue)||q.queue.length!==PERSONAL_QUOTES.length)q={queue:shuffledQuoteQueue(),index:0};q.index+=1;if(q.index>=q.queue.length){q.queue=shuffledQuoteQueue();q.index=0}saveQuoteState(q);renderQuoteCard()}
function renderQuoteCard(){let el=$('#personalQuote');if(!el)return;el.querySelector('.quote-text').textContent=currentQuote()}

const DEFAULT_ITEMS={
 food:[['Eggs',14,'eggs',1],['Sprouts',4,'servings',1],['Soya',3,'servings',1],['Milk',7,'servings',1],['Curd',5,'servings',1],['Protein',600,'grams',10]],
 micronutrients:[],
 exercise:[['Strength training',3,'sessions',1],['Walking',7,'sessions',1],['Running',2,'sessions',1],['Mobility',3,'sessions',1]],
 lifestyle:[['Sleep',7,'days',1],['Water',7,'days',1],['Junk food control',7,'days',1],['Recovery',7,'days',1]]
};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const clone=o=>JSON.parse(JSON.stringify(o));
function normName(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function isoDate(d){let x=new Date(d);return new Date(x.getTime()-x.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function parseDate(s){return new Date(s+'T00:00:00')}
function fmt(d){return new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(d)}
function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function monthName(k){return new Date(k+'-01T00:00:00').toLocaleDateString('en-IN',{month:'long',year:'numeric'})}
function weekStart(date, day){let d=new Date(date);d.setHours(0,0,0,0);let target=({Sun:0,Mon:1,Sat:6}[day]??1), diff=(d.getDay()-target+7)%7;d.setDate(d.getDate()-diff);return d}
function weekEnd(start){let d=new Date(start);d.setDate(d.getDate()+6);return d}
function weekKeyFromStart(s){return `W-${s}`}
function currentWeekKey(date=new Date()){return weekKeyFromStart(isoDate(weekStart(date,db.settings.weekStartDay)))}

function newItem(name='',target='',unit='',step=null,lineageId=null){
 return {id:uid(),lineageId:lineageId||uid(),name,target,actual:0,unit,notes:'',step:step||(/gram|kg/i.test(unit)?10:1),weight:1,keyItem:false,dailyTracking:false,dailyLog:{},manualOverride:false,daysTarget:'',scoreBy:'total',aliases:[]};
}
function defaults(){let o={};for(const [k] of CATS)o[k]=DEFAULT_ITEMS[k].map(x=>newItem(x[0],x[1],x[2],x[3]));return o}
function itemNormalize(x, lineageResolver){
 let o={...newItem(),...clone(x||{})};o.id=o.id||uid();o.name=o.name||'Unnamed';o.lineageId=o.lineageId||lineageResolver(normName(o.name),o.category||'');o.actual=Number(o.actual)||0;o.target=o.target??0;o.step=Number(o.step)||1;o.weight=Number(o.weight)||1;o.dailyLog=o.dailyLog||{};o.aliases=Array.isArray(o.aliases)?o.aliases:[];o.scoreBy=o.scoreBy||'total';o.keyItem=!!o.keyItem;o.dailyTracking=!!o.dailyTracking;o.manualOverride=!!o.manualOverride;return o;
}
function migrate(data){
 if(!data||typeof data!=='object')data={months:{},settings:{}};
 const v=Number(data.schemaVersion||1);
 if(v>SCHEMA_VERSION)throw new Error(`This backup uses schema v${v}. This app supports v${SCHEMA_VERSION}. Please update the app first.`);
 let d=clone(data);
 if(v<2){
  const lineageMap={};
  const resolve=(name,cat)=>{let k=cat+'|'+name;if(!lineageMap[k])lineageMap[k]=uid();return lineageMap[k]};
  for(const m of Object.values(d.months||{}))for(const w of Object.values(m.weeks||{}))for(const [cat,items] of Object.entries(w.categories||{})){
    w.categories[cat]=(items||[]).map(x=>{let y=itemNormalize({...x,category:cat},resolve);delete y.category;return y});
    w.categories[cat].forEach(x=>{if(!x.lineageId)x.lineageId=resolve(normName(x.name),cat)})
    w.summary=w.summary||null;w.prompts=w.prompts||{worked:'',change:'',focus:''};w.id=w.id||uid();w.closed=!!w.closed;
  }
  d.schemaVersion=2;d.body=d.body||[];d.settings=d.settings||{};d.settings.weekStartDay=d.settings.weekStartDay||'Mon';d.settings.consistencyThreshold=d.settings.consistencyThreshold??'';d.settings.backupIntervalDays=d.settings.backupIntervalDays??14;d.settings.theme=d.settings.theme||'auto';
 }
 if(!d.schemaVersion)d.schemaVersion=2;
 if(!d.body)d.body=[];d.snapshots=[];d.settings=d.settings||{};d.settings.weekStartDay=d.settings.weekStartDay||'Mon';d.settings.consistencyThreshold=d.settings.consistencyThreshold??'';d.settings.backupIntervalDays=d.settings.backupIntervalDays??14;d.settings.theme=d.settings.theme||'auto';d.settings.lastBackupAt=d.settings.lastBackupAt||'';d.settings.autoSnapshot=!!d.settings.autoSnapshot;
 // Ensure every item is v2-shaped and repair missing lineages across weeks.
 const lineageMap={};
 for(const m of Object.values(d.months||{}))for(const w of Object.values(m.weeks||{}))for(const [cat,items] of Object.entries(w.categories||{}))for(const raw of items||[]){const n=normName(raw.name), key=cat+'|'+n;if(raw.lineageId)lineageMap[key]=raw.lineageId}
 const resolver=(n,c)=>lineageMap[c+'|'+n]||(lineageMap[c+'|'+n]=uid());
 for(const m of Object.values(d.months||{}))for(const w of Object.values(m.weeks||{}))for(const [cat,items] of Object.entries(w.categories||{})){w.categories[cat]=(items||[]).map(x=>{let y=itemNormalize({...x,category:cat},resolver);delete y.category;return y});w.prompts=w.prompts||{worked:'',change:'',focus:''};w.id=w.id||uid()}
 return d;
}
function loadDB(){
 let raw=localStorage.getItem(KEY);
 if(!raw){const legacy=localStorage.getItem('pnfl_tracker_v1');if(legacy){raw=legacy;localStorage.setItem('ntl.legacy.v1',legacy)}}
 if(!raw)return migrate({schemaVersion:2,months:{},body:[],settings:{}});
 try{const parsed=JSON.parse(raw);if(Number(parsed.schemaVersion||1)<SCHEMA_VERSION&&localStorage.getItem(PREMIGRATE)===null)localStorage.setItem(PREMIGRATE,raw);return migrate(parsed)}catch(e){alert(e.message||'Could not load tracker data.');return migrate({})}
}
let db=loadDB();
function persist(){db.schemaVersion=2;localStorage.setItem(KEY,JSON.stringify(db));maybeSnapshot()}
function ensureMonth(k){db.months??={};db.months[k]??={goal:'',notes:'',weeks:{}};return db.months[k]}
function allWeeks(){let a=[];for(const [mk,m] of Object.entries(db.months||{}))for(const [wk,w] of Object.entries(m.weeks||{}))a.push({mk,wk,w});return a.sort((a,b)=>b.w.startDate.localeCompare(a.w.startDate))}
function findPrevious(start){return allWeeks().map(x=>x.w).filter(w=>w.startDate<isoDate(start)).sort((a,b)=>b.startDate.localeCompare(a.startDate))[0]||null}
function createWeek(date=new Date(),copy=true){let st=weekStart(date,db.settings.weekStartDay), en=weekEnd(st),mk=monthKey(st),wk=weekKeyFromStart(isoDate(st)),m=ensureMonth(mk);if(m.weeks[wk])return m.weeks[wk];let src=copy?findPrevious(st):null;m.weeks[wk]={id:uid(),startDate:isoDate(st),endDate:isoDate(en),categories:src?copyStructure(src.categories):defaults(),notes:'',prompts:{worked:'',change:'',focus:''},summary:null,closed:false};for(const [cat] of CATS)for(const x of m.weeks[wk].categories[cat])x.category=cat;persist();return m.weeks[wk]}
function copyStructure(cats){let out={};for(const [cat] of CATS)out[cat]=(cats[cat]||[]).map(x=>{let y=clone(x);y.id=uid();y.actual=0;y.dailyLog={};y.manualOverride=false;y.notes='';return y});return out}
let currentDate=new Date(), route='home', trendCat='overall', trendCats=new Set(['overall']), selectedLineage=null, modalRestoreFocus=null;
createWeek(currentDate,true);
function getWeek(){return createWeek(currentDate,true)}

function daysHit(x){let target=Number(x.daysTarget);if(!x.dailyTracking||!target)return null;let hits=Object.values(x.dailyLog||{}).filter(v=>Number(v)>0).length;return {hits,target:Math.max(7,target),pct:Math.min(100,hits/Math.max(1,target)*100)}}
function itemScore(x){let t=Number(x.target),a=Number(x.actual);let total=t>0?Math.min(100,Math.max(0,a/t*100)):0;let dh=daysHit(x), dayPct=dh?dh.pct:null;let pct= x.scoreBy==='days'&&dh?dayPct : x.scoreBy==='both'&&dh?(total+dayPct)/2:total;return {pct,uncapped:t>0?Math.max(0,a/t*100):0,total,dayPct,days:dh}}
function calcCategory(items){let list=(items||[]).map(itemScore);if(!list.length)return 0;let sw=items.reduce((s,x)=>s+(Number(x.weight)>0?Number(x.weight):1),0);return Math.round(list.reduce((s,z,i)=>s+z.pct*(Number(items[i].weight)>0?Number(items[i].weight):1),0)/sw)}
function calcSummary(w){let s={};for(const [k] of CATS)s[k+'Score']=calcCategory(w.categories[k]);s.overallScore=Math.round(CATS.reduce((a,[k])=>a+s[k+'Score'],0)/CATS.length);s.scoringVersion=SCORING_VERSION;return s}
function recompute(w,explicit=false){if(!w.summary||explicit||w.summary.scoringVersion===SCORING_VERSION)w.summary=calcSummary(w);return w.summary}
function saveWeek(w){recompute(w,true);persist();render()}
function toast(msg,undo){let el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.innerHTML=`<span>${esc(msg)}</span>${undo?`<button class="toast-undo" onclick="${undo}">Undo</button>`:''}`;document.body.append(el);setTimeout(()=>el.remove(),10000)}
function itemLineageLabel(id){for(const {w} of allWeeks())for(const [c] of CATS){let x=(w.categories[c]||[]).find(i=>i.lineageId===id);if(x)return x.name}return 'Item'}

function render(){
 applyTheme();let w=getWeek(),s=recompute(w),st=parseDate(w.startDate),en=parseDate(w.endDate);$('#weekLabel').textContent=weekKeyFromStart(w.startDate);$('#weekTitle').textContent=`${fmt(st)} – ${fmt(en)}`;$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
 if(route==='home')renderHome(w,s);else if(route==='history')renderHistory();else if(route==='month')renderMonth();else renderSettings();
}
function renderHome(w,s){
 let prev=allWeeks().map(x=>x.w).filter(x=>x.startDate<w.startDate).sort((a,b)=>b.startDate.localeCompare(a.startDate))[0];
 let focus=prev?.prompts?.focus;
 $('#main').innerHTML=`<section class="card personal-quote" id="personalQuote"><div class="quote-head"><div class="eyebrow">A THOUGHT FOR THE JOURNEY</div><button class="quote-refresh" onclick="refreshQuote()" aria-label="Show another personal quote" title="Another quote">↻</button></div><blockquote class="quote-text">${esc(currentQuote())}</blockquote></section><section class="card hero"><div class="score-ring" style="--score:${s.overallScore}"><strong>${s.overallScore}%</strong></div><div><div class="eyebrow">WEEKLY COMPLETION</div><h2>Keep the week moving.</h2><p class="muted">Messy days are allowed. The week is the unit of success.</p></div></section>
 ${focus?`<section class="card focus"><div class="eyebrow">NEXT WEEK'S FOCUS</div><b>${esc(focus)}</b></section>`:''}
 <section class="card"><div class="section-head"><h2>Week setup</h2><div class="btn-row"><button class="secondary" onclick="newWeekFlow()">Start New Week</button><button class="secondary" onclick="backfillFlow()">Backfill</button></div></div><div class="stats">${CATS.map(([k,n])=>`<button class="stat score-stat" onclick="scoreBreakdown('${k}')"><b>${s[k+'Score']}%</b><span>${n} · tap for breakdown</span></button>`).join('')}</div></section>
 ${CATS.map(([k,n])=>`<details class="card category" open><summary><span>${n}</span><span class="score-pill">${s[k+'Score']}%</span></summary><div>${(w.categories[k]||[]).sort((a,b)=>Number(b.keyItem)-Number(a.keyItem)).map(x=>itemHTML(k,x)).join('')}<button class="link-btn" onclick="openItem('${k}')">＋ Add ${n}</button></div></details>`).join('')}
 <section class="card"><div class="section-head"><h2>Weekly Notes</h2><span class="muted">Auto-saved</span></div>${promptHTML(w)}<textarea id="weekNotes" aria-label="Weekly notes" placeholder="Anything else worth remembering?">${esc(w.notes)}</textarea></section>
 <section class="card"><div class="section-head"><h2>Weekly Report</h2><div class="btn-row"><button class="secondary" onclick="recalculateCurrent()">Recalculate</button><button class="primary" onclick="closeWeek()">Save Snapshot</button></div></div>${reportMini(w,s)}</section>`;
 $('#weekNotes').addEventListener('input',e=>{w.notes=e.target.value;recompute(w);persist()});$$('.prompt-input').forEach(el=>el.addEventListener('input',e=>{w.prompts[e.target.dataset.prompt]=e.target.value;persist()}));$$('.actual-input').forEach(el=>el.addEventListener('change',onActual));
}
function promptHTML(w){return `<details class="prompt-box"><summary>Optional weekly prompts</summary><label>What worked<textarea class="prompt-input" data-prompt="worked">${esc(w.prompts?.worked||'')}</textarea></label><label>One thing to change<textarea class="prompt-input" data-prompt="change">${esc(w.prompts?.change||'')}</textarea></label><label>Next week's focus<textarea class="prompt-input" data-prompt="focus">${esc(w.prompts?.focus||'')}</textarea></label></details>`}
function itemHTML(cat,x){let z=itemScore(x),dh=daysHit(x);return `<div class="item-row"><div class="item-main"><div class="item-name">${x.keyItem?'★ ':''}${esc(x.name)}</div><div class="item-meta">Target ${esc(x.target)} ${esc(x.unit)} · weight ${Number(x.weight)||1}${dh?` · ${dh.hits}/${dh.target} days`:''}</div>${x.notes?`<div class="notes">${esc(x.notes)}</div>`:''}${x.manualOverride?`<div class="notes">manual</div>`:''}${z.uncapped>100?`<div class="overshoot">${Math.round(z.uncapped)}% of target · score capped at 100%</div>`:''}</div><div class="entry"><button class="stepper" onclick="stepActual('${cat}','${x.id}',-1)" aria-label="Decrease ${esc(x.name)}">−</button><input class="actual-input" aria-label="Actual for ${esc(x.name)}" type="number" step="any" value="${esc(x.actual)}" data-cat="${cat}" data-id="${x.id}"><button class="stepper" onclick="stepActual('${cat}','${x.id}',1)" aria-label="Increase ${esc(x.name)}">＋</button></div><div class="actions"><button class="small-btn" onclick="toggleDaily('${cat}','${x.id}')">${x.dailyTracking?'Daily on':'Track daily'}</button><button class="small-btn" onclick="openItem('${cat}','${x.id}')">Edit</button><button class="small-btn" onclick="itemMenu('${cat}','${x.id}')">⋯</button></div></div>`}
function onActual(e){let w=getWeek(),x=w.categories[e.target.dataset.cat].find(i=>i.id===e.target.dataset.id);if(!x)return;x.actual=Number(e.target.value)||0;x.manualOverride=!!x.dailyTracking;recompute(w,true);persist();toast(x.dailyTracking?'Manual value saved':'Saved')}
function stepActual(cat,id,dir){let w=getWeek(),x=w.categories[cat].find(i=>i.id===id);if(!x)return;let step=Number(x.step)||1;if(x.dailyTracking){let d=isoDate(new Date()),v=Math.max(0,(Number(x.dailyLog[d])||0)+dir*step);x.dailyLog[d]=v;x.actual=Object.values(x.dailyLog).reduce((a,b)=>a+(Number(b)||0),0);x.manualOverride=false}else x.actual=Math.max(0,(Number(x.actual)||0)+dir*step);recompute(w,true);persist();render()}
function toggleDaily(cat,id){let w=getWeek(),x=w.categories[cat].find(i=>i.id===id);x.dailyTracking=!x.dailyTracking;if(!x.dailyTracking){x.manualOverride=false}else if(!x.dailyLog)x.dailyLog={};persist();render()}
function itemMenu(cat,id){showSheet(`<h2>Item actions</h2><button class="sheet-btn" onclick="closeModal();setExact('${cat}','${id}')">Set exact value</button><button class="sheet-btn" onclick="closeModal();openItem('${cat}','${id}')">Edit item</button><button class="sheet-btn" onclick="closeModal();deleteItem('${cat}','${id}')">Delete item</button>`)}
function setExact(cat,id){let x=getWeek().categories[cat].find(i=>i.id===id);let v=prompt(`Set exact value for ${x.name}`,x.actual);if(v!==null){x.actual=Number(v)||0;x.manualOverride=!!x.dailyTracking;saveWeek(getWeek())}}
function scoreBreakdown(cat){let items=getWeek().categories[cat]||[];showSheet(`<div class="sheet-head"><h2>${CATS.find(x=>x[0]===cat)[1]} score</h2><button class="close" onclick="closeModal()">×</button></div>${items.length?items.map(x=>{let z=itemScore(x);return `<div class="break"><span><b>${x.keyItem?'★ ':''}${esc(x.name)}</b><small>${esc(x.scoreBy)} · weight ${Number(x.weight)||1}${z.days?` · ${z.days.hits}/${z.days.target} days`:''}</small></span><strong>${Math.round(z.pct)}%</strong></div>`}).join(''):'<p class="muted">No items yet.</p>'}<p class="muted">Category score = weighted average. Each item is capped at 100%.</p>`)}
function reportMini(w,s){return `<div class="stats">${CATS.map(([k,n])=>`<div class="stat"><b>${s[k+'Score']}%</b><span>${n}</span></div>`).join('')}</div><p class="muted">Completed: ${reportItems(w,true).join(', ')||'Nothing to list yet.'}</p><p class="muted">Low: ${reportItems(w,false).join(', ')||'Nothing to list yet.'}</p>`}
function reportItems(w,good){let a=[];for(const [c] of CATS)for(const x of w.categories[c]||[]){let z=itemScore(x);if((good&&z.pct>=100)||(!good&&z.pct<100))a.push(x.name)}return a}

function renderHistory(){let groups={};for(const x of allWeeks())(groups[x.mk]??=[]).push(x);$('#main').innerHTML=`<section class="card"><div class="tabs"><button class="chip active" onclick="showHistoryTab('history',this)">History</button><button class="secondary" onclick="backfillFlow()">＋ Backfill week</button><button class="chip" onclick="showHistoryTab('trends',this)">Trends</button><button class="chip" onclick="showHistoryTab('item',this)">Item trend</button></div><div id="historyPanel"></div></section>`;renderHistoryTab('history')}
function showHistoryTab(tab,btn){$$('.chip').forEach(x=>x.classList.remove('active'));if(btn)btn.classList.add('active');renderHistoryTab(tab)}
function renderHistoryTab(tab){let p=$('#historyPanel');if(tab==='history'){let groups={};for(const x of allWeeks())(groups[x.mk]??=[]).push(x);p.innerHTML=Object.entries(groups).map(([mk,items])=>`<section class="history-month"><h2>${monthName(mk)}</h2>${items.map(({wk,w})=>`<button class="history-row" onclick="openReport('${mk}','${wk}')"><span><b>${wk}</b><small>${fmt(parseDate(w.startDate))} – ${fmt(parseDate(w.endDate))}</small></span><span class="score-pill">${recompute(w).overallScore}%</span></button>`).join('')}</section>`).join('')||'<div class="empty">No historical weeks yet. Start with the current week.</div>'}
 else if(tab==='trends'){p.innerHTML=`<div class="trend-controls">${['overall','food','micronutrients','exercise','lifestyle'].map(k=>`<button class="chip ${trendCats.has(k)?'active':''}" onclick="toggleTrend('${k}')">${k}</button>`).join('')}</div><div class="chart-wrap">${trendSVG()}</div><p class="muted">Solid lines show weekly scores; dotted lines show each selected rolling 4-week average. Missing/skipped weeks are gaps, not zeros.</p>`}
 else {let lineages=[];for(const {w} of allWeeks())for(const [c] of CATS)for(const x of w.categories[c]||[])if(!lineages.some(y=>y.id===x.lineageId))lineages.push({id:x.lineageId,name:x.name,cat:c});p.innerHTML=`<label>Item<select id="lineageSelect"><option value="">Choose an item</option>${lineages.map(x=>`<option value="${x.id}" ${selectedLineage===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><div class="chart-wrap" id="itemChart">${selectedLineage?itemTrendSVG(selectedLineage):'<div class="empty">Choose an item to compare actual vs target across weeks.</div>'}</div>`;$('#lineageSelect').addEventListener('change',e=>{selectedLineage=e.target.value;renderHistoryTab('item')})}}
function pointsFor(k){return allWeeks().sort((a,b)=>a.w.startDate.localeCompare(b.w.startDate)).map(({w})=>({date:w.startDate,val:k==='overall'?recompute(w).overallScore:recompute(w)[k+'Score']}))}
function svgLine(points,max=100){if(!points.length)return '';let W=700,H=240,p=30;let xs=points.length===1?[W/2]:points.map((_,i)=>p+i*(W-2*p)/(points.length-1));let y=v=>H-p-(v/max)*(H-2*p);let d='';points.forEach((q,i)=>{let gap=i>0&&(new Date(q.date)-new Date(points[i-1].date)>8*86400000);d+=(i&&!gap?'L':'M')+xs[i].toFixed(1)+','+y(q.val).toFixed(1)});return `<path d="${d}" fill="none" stroke="currentColor" stroke-width="3"/>`}
function toggleTrend(k){if(trendCats.has(k)){if(trendCats.size>1)trendCats.delete(k)}else trendCats.add(k);renderHistoryTab('trends')}
function trendSVG(){let selected=[...trendCats],all=selected.flatMap(k=>pointsFor(k)),p=pointsFor(selected[0]||'overall');if(!p.length)return '<div class="empty">No weekly data yet.</div>';let W=700,H=240,P=30,svg='<svg viewBox="0 0 700 240" role="img" aria-label="Weekly score trends"><line x1="30" y1="210" x2="680" y2="210" stroke="currentColor" opacity=".15"/><line x1="30" y1="30" x2="30" y2="210" stroke="currentColor" opacity=".15"/>';selected.forEach((k,idx)=>{let q=pointsFor(k),avg=q.map((z,i)=>({date:z.date,val:Math.round(q.slice(Math.max(0,i-3),i+1).reduce((a,b)=>a+b.val,0)/Math.min(4,i+1))}));svg+=svgLine(q);let d='';avg.forEach((z,i)=>{let gap=i>0&&(new Date(z.date)-new Date(avg[i-1].date)>8*86400000),xs=avg.length===1?350:30+i*650/(avg.length-1),y=210-(z.val/100)*180;d+=(i&&!gap?'L':'M')+xs+','+y});svg+=`<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 6" opacity="${Math.max(.25,.55-idx*.08)}"/>`});return svg+'</svg>'}
function itemTrendSVG(id){let p=allWeeks().sort((a,b)=>a.w.startDate.localeCompare(b.w.startDate)).map(({w})=>{let x=null;for(const [c] of CATS)x=(w.categories[c]||[]).find(i=>i.lineageId===id)||x;return x?{date:w.startDate,a:Number(x.actual)||0,t:Number(x.target)||0}:null}).filter(Boolean);if(!p.length)return '<div class="empty">No matching item data.</div>';let max=Math.max(1,...p.map(x=>Math.max(x.a,x.t)));let W=700,H=240,P=30;let sx=i=>p.length===1?350:P+i*(W-2*P)/(p.length-1),sy=v=>H-P-v/max*(H-2*P);let path=k=>p.map((q,i)=>(i?'L':'M')+sx(i)+','+sy(q[k])).join(' ');return `<svg viewBox="0 0 700 240"><path d="${path('t')}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 6" opacity=".45"/><path d="${path('a')}" fill="none" stroke="currentColor" stroke-width="3"/></svg><p class="muted">Solid = actual · dotted = target.</p>`}
function openReport(mk,wk){let w=db.months[mk].weeks[wk],s=recompute(w);showSheet(`<div class="sheet-head"><div><div class="eyebrow">${wk}</div><h2>${fmt(parseDate(w.startDate))} – ${fmt(parseDate(w.endDate))}</h2></div><button class="close" onclick="closeModal()">×</button></div><div class="stats">${CATS.map(([k,n])=>`<div class="stat"><b>${s[k+'Score']}%</b><span>${n}</span></div>`).join('')}</div>${CATS.map(([k,n])=>`<details class="report-cat" open><summary>${n}</summary>${(w.categories[k]||[]).sort((a,b)=>Number(b.keyItem)-Number(a.keyItem)).map(x=>{let z=itemScore(x);return `<div class="break"><span><b>${x.keyItem?'★ ':''}${esc(x.name)}</b><small>${z.days?`${z.days.hits}/${z.days.target} days · `:''}weight ${x.weight}${z.uncapped>100?` · overshoot ${Math.round(z.uncapped)}%`:''}</small></span><strong>${Math.round(z.pct)}%</strong></div>`}).join('')}</details>`).join('')}<div class="card"><h3>Weekly Notes</h3><p>${esc(w.notes||'No notes.')}</p>${['worked','change','focus'].map(k=>w.prompts?.[k]?`<p><b>${k==='worked'?'What worked':k==='change'?'One thing to change':"Next week's focus"}:</b> ${esc(w.prompts[k])}</p>`:'').join('')}</div><button class="danger" onclick="closeModal();deleteWeek('${mk}','${wk}')">Delete this week</button>`)}

function renderMonth(){let mk=monthKey(currentDate),m=db.months[mk]||{goal:'',notes:'',weeks:{}},ws=Object.values(m.weeks||{}),avg=ws.length?Math.round(ws.reduce((a,w)=>a+recompute(w).overallScore,0)/ws.length):0;let best=ws.length?ws.reduce((a,b)=>recompute(a).overallScore>=recompute(b).overallScore?a:b):null,low=ws.length?ws.reduce((a,b)=>recompute(a).overallScore<=recompute(b).overallScore?a:b):null,thr=db.settings.consistencyThreshold,cons=thr!==''?ws.filter(w=>recompute(w).overallScore>=Number(thr)).length:null;$('#main').innerHTML=`<section class="card"><div class="eyebrow">MONTHLY SUMMARY</div><h2>${monthName(mk)}</h2><div class="stats"><div class="stat"><b>${ws.length}</b><span>Weeks</span></div><div class="stat"><b>${avg}%</b><span>Average</span></div><div class="stat"><b>${best?recompute(best).overallScore+'%':'—'}</b><span>Best</span></div><div class="stat"><b>${low?recompute(low).overallScore+'%':'—'}</b><span>Lowest</span></div></div>${cons!==null?`<p class="muted">Consistency: ${cons}/${ws.length} weeks at or above your ${thr}% threshold.</p>`:''}</section><section class="card"><h2>Monthly Goal</h2><textarea id="monthGoal" aria-label="Monthly goal">${esc(m.goal)}</textarea></section><section class="card"><h2>Monthly Notes</h2><textarea id="monthNotes" aria-label="Monthly notes">${esc(m.notes)}</textarea></section><section class="card"><h2>Weeks</h2>${ws.sort((a,b)=>b.startDate.localeCompare(a.startDate)).map(w=>`<button class="history-row" onclick="openReport('${mk}','${Object.keys(m.weeks).find(k=>m.weeks[k]===w)}')"><span>${fmt(parseDate(w.startDate))} – ${fmt(parseDate(w.endDate))}</span><b>${recompute(w).overallScore}%</b></button>`).join('')||'<div class="empty">No weeks recorded in this month.</div>'}</section>`;$('#monthGoal').addEventListener('input',e=>{m.goal=e.target.value;persist()});$('#monthNotes').addEventListener('input',e=>{m.notes=e.target.value;persist()})}

function renderSettings(){let s=db.settings;$('#main').innerHTML=`<section class="card"><h2>Settings</h2><div class="form-grid"><label>Week starts<select id="weekStart"><option>Mon</option><option>Sun</option><option>Sat</option></select></label><label>Consistency threshold (%)<input id="threshold" type="number" min="0" max="100" value="${esc(s.consistencyThreshold)}" placeholder="Blank = off"></label><label>Backup reminder (days)<input id="backupDays" type="number" min="1" value="${esc(s.backupIntervalDays)}"></label><label class="check"><input id="autoSnapshot" type="checkbox" ${s.autoSnapshot?'checked':''}> Auto-snapshot</label><label>Theme<select id="theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div></section><section class="card"><h2>Body</h2><button class="primary" onclick="openBody()">Log weight / waist</button><div id="bodyList">${bodyList()}</div><div class="chart-wrap">${bodySVG()}</div></section><section class="card"><h2>Data</h2><div class="btn-row"><button class="primary" onclick="exportBackup()">Export Backup</button><button class="secondary" onclick="$('#importInput').click()">Import Backup</button><button class="secondary" onclick="exportXLSX()">Export Excel</button></div><p class="muted">All data stays on this device. Backups are the safety net for browser-data clearing.</p><p class="muted">Persistent storage: <b>${s.persistResult||'Not requested yet'}</b> <button class="link-btn" onclick="requestPersist()">Request</button></p></section><section class="card"><h2>Rolling snapshots</h2><p class="muted">Last 5 automatic snapshots.</p>${(loadSnapshots()).map((x,i)=>`<div class="history-row"><span>${new Date(x.at).toLocaleString()}</span><button class="small-btn" onclick="restoreSnapshot(${i})">Restore</button></div>`).join('')||'<p class="muted">No snapshots yet.</p>'}</section><section class="card"><h2>Data safety</h2><button class="danger" onclick="clearAll()">Clear all data</button></section>`;$('#weekStart').value=s.weekStartDay;$('#theme').value=s.theme;$('#autoSnapshot').checked=!!s.autoSnapshot;$('#weekStart').addEventListener('change',e=>{s.weekStartDay=e.target.value;persist();toast('Week start changed. Existing stored weeks were not moved.');render()});$('#threshold').addEventListener('change',e=>{s.consistencyThreshold=e.target.value;persist();render()});$('#backupDays').addEventListener('change',e=>{s.backupIntervalDays=Math.max(1,Number(e.target.value)||14);persist();render()});$('#theme').addEventListener('change',e=>{s.theme=e.target.value;persist();applyTheme()});$('#autoSnapshot').addEventListener('change',e=>{s.autoSnapshot=e.target.checked;persist();render()})}
function bodyList(){return (db.body||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="history-row"><span><b>${esc(x.date)}</b><small>${esc(x.weight||'')} ${esc(x.weightUnit||'')} · ${esc(x.waist||'')} ${esc(x.waistUnit||'')}</small></span><button class="small-btn" onclick="deleteBody('${x.id}')">Delete</button></div>`).join('')||'<p class="muted">No body entries yet.</p>'}
function bodySVG(){let p=(db.body||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));if(p.length<2)return '';let vals=p.map(x=>Number(x.weight)).filter(Number.isFinite),max=Math.max(...vals),min=Math.min(...vals),range=Math.max(1,max-min),W=700,H=220,P=30;let pts=p.map((x,i)=>({x:P+i*(W-2*P)/(p.length-1),y:H-P-((Number(x.weight)-min)/range)*(H-2*P)})).filter((_,i)=>Number.isFinite(Number(p[i].weight)));return `<svg viewBox="0 0 700 220" aria-label="Body weight trend"><path d="${pts.map((q,i)=>(i?'L':'M')+q.x+','+q.y).join(' ')}" fill="none" stroke="currentColor" stroke-width="3"/></svg>`}
function openBody(){showSheet(`<div class="sheet-head"><h2>Log body metrics</h2><button class="close" onclick="closeModal()">×</button></div><div class="form-grid"><label>Date<input id="bDate" type="date" value="${isoDate(new Date())}"></label><label>Weight<input id="bWeight" type="number" step="any"></label><label>Weight unit<input id="bWU" value="kg"></label><label>Waist<input id="bWaist" type="number" step="any"></label><label>Waist unit<input id="bWaU" value="cm"></label><label class="full">Notes<textarea id="bNotes"></textarea></label></div><button class="primary" onclick="saveBody()">Save</button>`)}
function saveBody(){db.body.push({id:uid(),date:$('#bDate').value,weight:$('#bWeight').value,weightUnit:$('#bWU').value,waist:$('#bWaist').value,waistUnit:$('#bWaU').value,notes:$('#bNotes').value});persist();closeModal();render()}
function deleteBody(id){if(confirm('Delete this body entry?')){db.body=db.body.filter(x=>x.id!==id);persist();render()}}

function openItem(cat,id=null){let x=id?getWeek().categories[cat].find(i=>i.id===id):newItem();showSheet(`<div class="sheet-head"><h2>${id?'Edit':'Add'} item</h2><button class="close" onclick="closeModal()">×</button></div><div class="form-grid"><label class="full">Name<input id="fName" value="${esc(x.name)}"></label><label>Target<input id="fTarget" type="number" step="any" value="${esc(x.target)}"></label><label>Actual<input id="fActual" type="number" step="any" value="${esc(x.actual)}"></label><label>Unit<input id="fUnit" value="${esc(x.unit)}"></label><label>Step<input id="fStep" type="number" step="any" min="0.0001" value="${esc(x.step)}"></label><label>Weight<input id="fWeight" type="number" step="any" min="0.01" value="${esc(x.weight)}"></label><label>Days target<input id="fDays" type="number" min="1" max="7" value="${esc(x.daysTarget)}" placeholder="e.g. 5"></label><label>Score by<select id="fScore"><option value="total">Total</option><option value="days">Days hit</option><option value="both">Both (average)</option></select></label><label class="check"><input id="fKey" type="checkbox" ${x.keyItem?'checked':''}> Key item</label><label class="check"><input id="fDaily" type="checkbox" ${x.dailyTracking?'checked':''}> Track daily taps</label><label class="full">Notes<textarea id="fNotes">${esc(x.notes)}</textarea></label></div><div class="btn-row"><button class="primary" onclick="saveItem('${cat}','${id||''}')">Save</button><button class="secondary" onclick="closeModal()">Cancel</button></div>`);$('#fScore').value=x.scoreBy||'total'}
function saveItem(cat,id){let w=getWeek(),arr=w.categories[cat],old=id?arr.find(x=>x.id===id):null,name=$('#fName').value.trim()||'Unnamed';if(old&&normName(old.name)!==normName(name)){old.aliases=[...(old.aliases||[]),old.name]}let x={...(old||newItem()),id:id||uid(),lineageId:old?.lineageId||uid(),name,target:Number($('#fTarget').value)||0,actual:Number($('#fActual').value)||0,unit:$('#fUnit').value.trim(),step:Number($('#fStep').value)||1,weight:Number($('#fWeight').value)||1,daysTarget:$('#fDays').value,scoreBy:$('#fScore').value,keyItem:$('#fKey').checked,dailyTracking:$('#fDaily').checked,notes:$('#fNotes').value,dailyLog:old?.dailyLog||{},manualOverride:old?.manualOverride||false,aliases:old?.aliases||[]};if(x.dailyTracking&&!old)x.dailyLog={};if(id){let i=arr.findIndex(y=>y.id===id);arr[i]=x}else arr.push(x);saveWeek(w);closeModal()}
function deleteItem(cat,id){let w=getWeek(),i=w.categories[cat].findIndex(x=>x.id===id);if(i<0)return;if(!confirm('Delete this item from the current week?'))return;let backup=clone(w.categories[cat][i]);w.categories[cat].splice(i,1);persist();render();toast('Item deleted',`undoDeleteItem('${cat}',${JSON.stringify(backup).replace(/"/g,'&quot;')})`)}
function undoDeleteItem(cat,backup){let w=getWeek();w.categories[cat].push(backup);persist();render();toast('Item restored')}
function deleteWeek(mk,wk){if(!confirm('Delete this entire week? A 10-second Undo will appear after deletion.'))return;let backup=clone(db.months[mk].weeks[wk]);delete db.months[mk].weeks[wk];persist();render();toast('Week deleted',`undoDeleteWeek('${mk}',${JSON.stringify(backup).replace(/"/g,'&quot;')})`)}
function undoDeleteWeek(mk,backup){ensureMonth(mk).weeks[weekKeyFromStart(backup.startDate)]=backup;persist();render();toast('Week restored')}
function closeWeek(){let w=getWeek();recompute(w);w.closed=true;persist();toast('Weekly snapshot saved')}
function recalculateCurrent(){recompute(getWeek(),true);persist();render();toast('Current week recalculated with current scoring rules')}
function newWeekFlow(){let src=getWeek(),next=new Date(src.startDate+'T00:00:00');next.setDate(next.getDate()+7);let w=createWeek(next,true);currentDate=next;reviewTargets(w);}
function backfillFlow(){let date=prompt('Start date for the week (YYYY-MM-DD)');if(!/^\d{4}-\d\d-\d\d$/.test(date))return;currentDate=parseDate(date);let w=createWeek(currentDate,true);reviewTargets(w)}
function reviewTargets(w){showSheet(`<div class="sheet-head"><h2>Review targets</h2><button class="close" onclick="closeModal();render()">×</button></div><p class="muted">Targets copied from the previous week. Adjust only what you want.</p>${CATS.map(([c,n])=>`<details open><summary>${n}</summary>${w.categories[c].map(x=>`<label class="target-row">${esc(x.name)}<input data-review="${c}|${x.id}" type="number" step="any" value="${esc(x.target)}"></label>`).join('')}</details>`).join('')}<button class="primary" onclick="finishReview()">Start week</button>`)}
function finishReview(){for(const i of $$('[data-review]')){let [c,id]=i.dataset.review.split('|'),x=getWeek().categories[c].find(x=>x.id===id);if(x)x.target=Number(i.value)||0}persist();closeModal();render()}

function loadSnapshots(){try{return JSON.parse(localStorage.getItem(SNAPKEY)||'[]')}catch{return[]}}
function maybeSnapshot(){if(!db.settings.autoSnapshot)return;let last=loadSnapshots()[0],days=last?(Date.now()-new Date(last.at))/86400000:Infinity;if(days<1)return;let a=loadSnapshots();a.unshift({at:new Date().toISOString(),data:clone(db)});localStorage.setItem(SNAPKEY,JSON.stringify(a.slice(0,5)))}
function restoreSnapshot(i){let a=loadSnapshots(),x=a[i];if(!x)return;if(confirm('Restore this snapshot? Current data will be replaced.')){db=migrate(x.data);persist();render();toast('Snapshot restored')}}
async function requestPersist(){if(!navigator.storage?.persist){db.settings.persistResult='Unsupported';persist();render();return}let ok=await navigator.storage.persist();db.settings.persistResult=ok?'Granted':'Not granted';persist();render()}
function backupDue(){let n=Number(db.settings.backupIntervalDays)||14,last=db.settings.lastBackupAt;if(!last||Date.now()-new Date(last)>n*86400000)return true;return false}
function backupNotice(){if(backupDue()&&allWeeks().length>0&&route==='home')toast('Your backup reminder is due — Settings has Export Backup.')}
function exportBackup(){let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});db.settings.lastBackupAt=new Date().toISOString();persist();shareOrDownload(blob,'nutrition-tracker-backup.json','Backup exported')}
async function shareOrDownload(blob,name,msg){let file=new File([blob],name,{type:blob.type});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:name});toast(msg);return}}catch(e){}downloadBlob(blob,name);toast(msg)}
function downloadBlob(blob,name){let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#importInput').addEventListener('change',async e=>{let f=e.target.files[0];if(!f)return;try{let raw=await f.text(),incoming=JSON.parse(raw);if(Number(incoming.schemaVersion||1)<SCHEMA_VERSION)localStorage.setItem(PREMIGRATE,raw);if(Number(incoming.schemaVersion||1)>SCHEMA_VERSION)throw new Error(`This backup uses schema v${incoming.schemaVersion}. Update the app before importing it.`);incoming=migrate(incoming);let mode=confirm('OK = Replace existing data. Cancel = Merge data.');if(mode){localStorage.setItem(PREMIGRATE,raw);db=incoming}else{mergeDB(incoming)}persist();render();toast('Backup imported')}catch(err){alert(err.message||'Invalid backup.')}e.target.value=''})
function mergeDB(src){for(const [mk,m] of Object.entries(src.months||{})){let dst=ensureMonth(mk);if(m.goal&&!dst.goal)dst.goal=m.goal;if(m.notes&&!dst.notes)dst.notes=m.notes;for(const [wk,w] of Object.entries(m.weeks||{})){if(!dst.weeks[wk])dst.weeks[wk]=clone(w);else if(JSON.stringify(dst.weeks[wk])!==JSON.stringify(w)){let alt=wk+'-import-'+Date.now();dst.weeks[alt]=clone(w)}}}db.body=[...(db.body||[])];for(const x of src.body||[])if(!db.body.some(y=>y.id===x.id&&y.date===x.date))db.body.push(clone(x));db.settings={...db.settings,...Object.fromEntries(Object.entries(src.settings||{}).filter(([k])=>!['weekStartDay'].includes(k)))}}
function clearAll(){if(confirm('Clear ALL tracker data? This cannot be undone unless you have a backup.')){localStorage.removeItem(KEY);localStorage.removeItem(SNAPKEY);db=migrate({});createWeek(new Date(),false);route='home';render();toast('Data cleared')}}

// Dependency-free XLSX writer retained and extended with Body, Daily Log, Lineage and weights.
const te=new TextEncoder();
function crc32(bytes){let table=crc32.t;if(!table){table=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);table[n]=c>>>0}crc32.t=table}let c=0xffffffff;for(const b of bytes)c=crc32.t[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function u16(n){return new Uint8Array([n&255,n>>>8&255])}function u32(n){return new Uint8Array([n&255,n>>>8&255,n>>>16&255,n>>>24&255])}function cat(arr){let n=arr.reduce((s,a)=>s+a.length,0),o=new Uint8Array(n),p=0;for(const a of arr){o.set(a,p);p+=a.length}return o}
function zipStore(files){let locals=[],central=[],off=0;for(const [name,data] of Object.entries(files)){let nb=te.encode(name),d=te.encode(data),c=crc32(d);let lh=cat([new Uint8Array([80,75,3,4]),u16(20),u16(0),u16(0),u16(0),u16(0),u32(c),u32(d.length),u32(d.length),u16(nb.length),u16(0),nb,d]);locals.push(lh);central.push(cat([new Uint8Array([80,75,1,2]),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(c),u32(d.length),u32(d.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(off),nb]));off+=lh.length}let cd=cat(central),body=cat(locals),end=cat([new Uint8Array([80,75,5,6]),u16(0),u16(0),u16(Object.keys(files).length),u16(Object.keys(files).length),u32(cd.length),u32(body.length),u16(0)]);return cat([body,cd,end])}
function xml(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function sheetXml(rows){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((r,i)=>`<row r="${i+1}">${r.map((v,j)=>{let n=j+1,col='';while(n){let q=(n-1)%26;col=String.fromCharCode(65+q)+col;n=Math.floor((n-1)/26)}return `<c r="${col}${i+1}" t="inlineStr"><is><t>${xml(v)}</t></is></c>`}).join('')}</row>`).join('')}</sheetData></worksheet>`}
function exportXLSX(){let summary=[['Month','Week','Start','End','Food','Micro','Exercise','Lifestyle','Overall','Scoring Version']],notes=[['Month','Week','Notes']],monthly=[['Month','Goal','Average Score','Notes']],body=[['Date','Weight','Weight Unit','Waist','Waist Unit','Notes']],lineage=[['lineageId','Current Name','Category']],daily=[['Month','Week','Category','Item','lineageId','Date','Amount']],cats={food:[['Month','Week','Item','lineageId','Target','Actual','Unit','Notes','Weight','Key Item','Days Target','Score By']],micronutrients:[['Month','Week','Item','lineageId','Target','Actual','Unit','Notes','Weight','Key Item','Days Target','Score By']],exercise:[['Month','Week','Item','lineageId','Target','Actual','Unit','Notes','Weight','Key Item','Days Target','Score By']],lifestyle:[['Month','Week','Item','lineageId','Target','Actual','Unit','Notes','Weight','Key Item','Days Target','Score By']]};let seen={};for(const [mk,m] of Object.entries(db.months||{})){let ws=Object.entries(m.weeks||{}),sum=0;for(const [wk,w] of ws){let s=recompute(w);summary.push([mk,wk,w.startDate,w.endDate,s.foodScore,s.micronutrientsScore,s.exerciseScore,s.lifestyleScore,s.overallScore,s.scoringVersion]);notes.push([mk,wk,w.notes||'']);sum+=s.overallScore;for(const [c] of CATS)for(const x of w.categories[c]||[]){cats[c].push([mk,wk,x.name,x.lineageId,x.target,x.actual,x.unit,x.notes||'',x.weight,x.keyItem?'Yes':'No',x.daysTarget||'',x.scoreBy]);seen[x.lineageId]={name:x.name,cat:c};for(const [d,a] of Object.entries(x.dailyLog||{}))daily.push([mk,wk,c,x.name,x.lineageId,d,a])}}monthly.push([mk,m.goal||'',ws.length?Math.round(sum/ws.length):0,m.notes||''])}for(const [id,x] of Object.entries(seen))lineage.push([id,x.name,x.cat]);for(const x of db.body||[])body.push([x.date,x.weight,x.weightUnit,x.waist,x.waistUnit,x.notes||'']);let names=['Weekly Summary','Food','Micronutrients','Exercise','Lifestyle','Weekly Notes','Monthly Summary','Body','Daily Log','Item Lineage'],rows=[summary,cats.food,cats.micronutrients,cats.exercise,cats.lifestyle,notes,monthly,body,daily,lineage];let files={'[Content_Types].xml':`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${names.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>`, '_rels/.rels':`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n,i)=>`<sheet name="${xml(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`,'xl/_rels/workbook.xml.rels':`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}</Relationships>`};rows.forEach((r,i)=>files[`xl/worksheets/sheet${i+1}.xml`]=sheetXml(r));downloadBlob(new Blob([zipStore(files)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'nutrition-tracker.xlsx');toast('Excel exported')}

function showSheet(html){modalRestoreFocus=document.activeElement;$('#modalRoot').innerHTML=`<div class="modal-backdrop" role="presentation"><div class="modal sheet" role="dialog" aria-modal="true">${html}</div></div>`;setTimeout(()=>{let f=$('#modalRoot input,#modalRoot button,#modalRoot textarea,#modalRoot select');f?.focus()},0)}
function closeModal(){if(modalRestoreFocus?.focus)modalRestoreFocus.focus();$('#modalRoot').innerHTML=''}
function applyTheme(){let t=db.settings.theme||'auto';document.documentElement.dataset.theme=t}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='Tab'&&$('#modalRoot .modal')){let els=$$('#modalRoot .modal button,#modalRoot .modal input,#modalRoot .modal textarea,#modalRoot .modal select').filter(x=>!x.disabled),first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>{route=b.dataset.route;render()}));$('#settingsBtn').addEventListener('click',()=>{route='settings';render()});$('#quickAddBtn').addEventListener('click',()=>showSheet(`<div class="sheet-head"><h2>Add to this week</h2><button class="close" onclick="closeModal()">×</button></div>${CATS.map(([k,n])=>`<button class="sheet-btn" onclick="closeModal();openItem('${k}')">＋ ${n}</button>`).join('')}`));
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
applyTheme();render();setTimeout(backupNotice,900);
window.NTL_TEST={migrate,calcSummary,itemScore,weekStart,zipStore,copyStructure,mergeDB,SCHEMA_VERSION};
