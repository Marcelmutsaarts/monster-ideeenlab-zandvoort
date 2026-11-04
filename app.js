'use strict';
const $=id=>document.getElementById(id);
const names=['Doel','Context','Bronnen','Voorbeelden','Werkwijze'];
const groups=Object.keys(ideas);
const key='monster-ideeenlab-v3';
base.Werkwijze=base.Werkwijze.replace('Stel maximaal drie vragen tegelijk en wacht op mijn antwoord.','Gebruik wat ik al heb ingevuld; vraag niet opnieuw naar bekende informatie. Stel maximaal drie vragen tegelijk en wacht op mijn antwoord.');
const fresh=()=>({group:'',browse:'1–2',idea:null,goal:'',texts:{...base}});
let state=fresh(),storageOK=true,opened=null,opener=null;
try{const saved=JSON.parse(sessionStorage.getItem(key));if(saved&&saved.texts&&names.every(n=>typeof saved.texts[n]==='string')){state={...fresh(),...saved};if(!groups.includes(state.group))state.group='';if(!groups.includes(state.browse))state.browse='1–2';if(!state.idea||!ideas[state.idea.group]?.[state.idea.index])state.idea=null;state.goal=String(state.goal||'').slice(0,900);}}catch{storageOK=false}
function save(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{storageOK=false}$('draft-note').textContent=storageOK?'Je keuzes blijven in dit tabblad bewaard.':'Bewaren lukt hier niet. Kopieer je prompt voor je het tabblad sluit.';}
function announce(text){$('status').textContent=text;$('editor-status').textContent=text}
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
const demoFor=(g,i)=>g==='1–2'&&i===0?'shape':g==='3–4'&&i===0?'coins':g==='5–6'&&i===0?'pizza':g==='7–8'&&i===0?'district':null;
function groupChange(g){state.group=g;state.browse=g||'1–2';if(state.idea&&state.idea.group!==g)state.idea=null;announce('');render();save()}
function render(){
 $('my-group').value=state.group;$('goal').value=state.goal;
 $('groups').replaceChildren(...groups.map(g=>{const b=el('button',null,'Groep '+g);b.type='button';b.setAttribute('aria-pressed',String(state.browse===g));b.onclick=()=>groupChange(g);return b}));
 $('catalogue-label').textContent='4 ideeën voor groep '+state.browse;
 $('cards').replaceChildren(...ideas[state.browse].map((a,i)=>{
  const selected=state.idea?.group===state.browse&&state.idea.index===i;
  const b=el('button','card'+(selected?' selected':''));b.type='button';b.setAttribute('aria-label',a.title+' — bekijk idee'+(demoFor(state.browse,i)?' en probeer demo':''));
  const art=el('span','card-art');art.style.setProperty('--tile',a.color);art.append(el('span','emoji',a.icon));art.setAttribute('aria-hidden','true');if(demoFor(state.browse,i))art.append(el('span','demo-tag','▶ Probeer mini-demo'));
  const body=el('span','card-body');body.append(el('span','category',a.category),el('h3',null,a.title),el('p',null,a.short));const link=el('span','card-link',selected?'✓ Jouw vertrekpunt':'Ontdek dit idee');link.append(el('span',null,'↗'));body.append(link);b.append(art,body);b.onclick=()=>showIdea(state.browse,i,b);return b;
 }));
 const a=state.idea?ideas[state.idea.group][state.idea.index]:null;
 $('chosen').hidden=!a;$('chosen-title').textContent=a?a.title:'';
 renderFields();
}
function showIdea(group,index,button){opened={group,index};opener=button;const a=ideas[group][index];
 $('idea-label').textContent='Groep '+group+' · '+a.category;$('idea-title').textContent=a.icon+' '+a.title;$('idea-short').textContent=a.short;
 $('idea-info').replaceChildren(...[['Het leerdoel',a.learn],['De kinderen',a.child],['Het appje',a.works]].map(([label,text])=>{const row=el('div','info-row');row.append(el('strong',null,label),el('p',null,text));return row}));
 makeDemo(demoFor(group,index));
 $('idea-dialog').showModal();$('idea-dialog').scrollTop=0;
}
function extraContext(){const lines=[];if(state.group)lines.push('Mijn groep: '+state.group+'.');if(state.goal.trim())lines.push('Wat ik wil bereiken: '+state.goal.trim());if(state.idea){const a=ideas[state.idea.group][state.idea.index];lines.push('Mijn inspiratie: '+a.title+'. '+a.short+' Leerdoel: '+a.learn+' Gebruik dit als vertrekpunt; denk ook mee over andere passende ideeën.')}return lines.join('\n')}
function promptText(){return names.map((n,i)=>(i+1)+'. '+n.toUpperCase()+'\n'+state.texts[n].trim()+(n==='Context'&&extraContext()?'\n\n'+extraContext():'')).join('\n\n')}
function renderFields(){const openNames=[...$('fields').querySelectorAll('details[open]')].map(x=>x.dataset.name);
 $('fields').replaceChildren(...names.map((name,i)=>{const box=el('details','field');box.dataset.name=name;box.open=openNames.length?openNames.includes(name):i===0;const summary=el('summary');summary.append(el('span',null,'0'+(i+1)),document.createTextNode(name));const label=el('label','sr-only',name);label.htmlFor='field-'+i;const input=el('textarea');input.id=label.htmlFor;input.value=state.texts[name];input.rows=name==='Werkwijze'?14:5;input.addEventListener('input',()=>{state.texts[name]=input.value;announce('');save()});box.append(summary,label,input);
 if(name==='Context'&&extraContext()){const extra=el('div','context-extra');extra.append(el('strong',null,'Jouw keuzes (ook in deze prompt):'),el('p',null,extraContext()));box.append(extra)}return box}));
}
function close(dialog){dialog.close()}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.closest('dialog')));
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
$('idea-dialog').addEventListener('close',()=>{if(opener?.isConnected)opener.focus()});
$('my-group').onchange=e=>groupChange(e.target.value);
$('goal').addEventListener('input',e=>{state.goal=e.target.value;announce('');save()});
$('remove-idea').onclick=()=>{state.idea=null;announce('');render();save()};
$('random').onclick=()=>{const options=ideas[state.browse].map((_,i)=>i).filter(i=>opened?.group!==state.browse||opened.index!==i);const i=options[Math.floor(Math.random()*options.length)];showIdea(state.browse,i,$('random'))};
$('use-idea').onclick=()=>{state.idea={...opened};state.group=opened.group;state.browse=opened.group;close($('idea-dialog'));render();save();announce('Idee toegevoegd. Je kunt het hieronder eigen maken.');$('prompt').scrollIntoView({behavior:'smooth',block:'start'});$('goal').focus({preventScroll:true})};
$('edit').onclick=()=>{renderFields();$('editor-status').textContent='';$('editor-dialog').showModal()};
$('reset').onclick=()=>{if(confirm('De vijf teksten herstellen? Je eigen groep, leerdoel en gekozen idee blijven behouden.')){state.texts={...base};renderFields();save();announce('Standaardteksten hersteld.')}};
async function copy(){const text=promptText();let ok=false;try{await navigator.clipboard.writeText(text);ok=true}catch{const temp=el('textarea');temp.value=text;temp.setAttribute('aria-label','Prompt om te kopiëren');temp.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';const host=document.querySelector('dialog[open]')||document.body;host.append(temp);temp.select();try{ok=document.execCommand('copy')}catch{}temp.remove()}
 if(ok){announce('✓ Gekopieerd! Plak je prompt in Copilot.')}else{$('manual-text').value=text;$('manual-dialog').showModal();$('manual-text').focus();$('manual-text').select();announce('Kopieer de tekst in het geopende venster.')}
}
$('copy').onclick=copy;$('editor-copy').onclick=copy;
$('download').onclick=()=>{const blob=new Blob([promptText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='mijn-brainstormprompt.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Je prompt is als tekstbestand aangeboden.')};
function makeDemo(type){const demo=$('demo');demo.replaceChildren();demo.hidden=!type;$('demo-note').textContent=type?'Een kleine demo van het idee. Laat Copilot straks een eigen versie voor jouw les ontwerpen.':'Dit is een inspiratie-idee. Met de brainstormprompt kun je het verder uitwerken.';
 if(!type)return;
 const h=el('h3',null,'Even uitproberen'),p=el('p'),feedback=el('p','feedback');feedback.setAttribute('role','status');demo.append(h,p);
 const controls=el('div','demo-controls');
 function btn(label,fn){const b=el('button',null,label);b.type='button';b.onclick=fn;controls.append(b);return b}
 if(type==='shape'){
  p.textContent='Welke vorm hoort bij het oranje voorbeeld?';const stage=el('div','shape-stage');const shape=el('span','shape circle');shape.setAttribute('role','img');shape.setAttribute('aria-label','Oranje cirkel');stage.append(shape,el('span',null,'→ ?'));demo.append(stage);
  ['Cirkel','Vierkant','Driehoek'].forEach(x=>btn(x,()=>{feedback.textContent=x==='Cirkel'?'Ja! Een cirkel heeft geen hoeken. Welke cirkel zie je in de klas?':'Kijk naar de hoeken. Hoeveel hoeken heeft het voorbeeld?'}));
 }
 if(type==='coins'){
  p.textContent='Maak € 7 met de munten. Kun je het ook op een andere manier?';let total=0;const count=el('div','coin-total','€ 0');demo.append(count);
  function update(){count.textContent='€ '+total;feedback.textContent=total===7?'Precies € 7! Leg uit hoe je hebt gerekend. Lukt het met andere munten?':total>7?'Dat is meer dan € 7. Begin opnieuw en probeer een andere combinatie.':total?'Je hebt € '+total+'. Hoeveel heb je nog nodig?':''}
  [1,2].forEach(n=>btn('+ € '+n,()=>{if(total>=10)return;total+=n;update()}));btn('Opnieuw',()=>{total=0;update()});
 }
 if(type==='pizza'){
  p.textContent='Deze pizza heeft vier gelijke stukken. Kleur drie kwart.';let n=1;const wrap=el('div','pizza-wrap'),pizza=el('div','pizza');pizza.setAttribute('role','img');const count=el('div','fraction');wrap.append(pizza,count);demo.append(wrap);
  function update(){pizza.style.background='conic-gradient(#f57943 0 '+n*25+'%,#fff4c3 '+n*25+'%)';pizza.setAttribute('aria-label',n+' van 4 pizzastukken gekleurd');count.replaceChildren(document.createTextNode(n+' / 4'),el('span',null,'stukken gekleurd'));feedback.textContent=n===3?'Drie van de vier gelijke stukken! Welk deel is nog niet gekleurd?':'Hoeveel gelijke stukken moet je kleuren voor drie kwart?'}
  btn('− een stuk',()=>{n=Math.max(0,n-1);update()});btn('+ een stuk',()=>{n=Math.min(4,n+1);update()});update();
 }
 if(type==='district'){
  p.textContent='Je hebt 5 bouwpunten. Wat geef je voorrang in jouw wijk?';const options=[['Bomen planten',2,'Meer schaduw en ruimte voor natuur.'],['Een speelplek',3,'Meer ruimte om samen te spelen.'],['Een veilige fietsroute',3,'Meer ruimte voor fietsers; minder voor auto’s.']],checks=[];const district=el('div','district');const remaining=el('p','feedback');demo.append(remaining,district);
  function update(){const used=checks.reduce((sum,c,i)=>sum+(c.checked?options[i][1]:0),0);remaining.textContent=used+' van 5 bouwpunten gebruikt';feedback.textContent=used>5?'Je plan past nog niet. Wat kun je weglaten en waarom?':used===0?'Wat vinden verschillende bewoners belangrijk?':checks.map((c,i)=>c.checked?options[i][2]:'').filter(Boolean).join(' ')+' Wat mis je nog in dit plan?'}
  options.forEach(([label,cost])=>{const row=el('label'),input=el('input');input.type='checkbox';input.onchange=update;checks.push(input);row.append(input,el('span',null,label),el('strong',null,cost+' p'));district.append(row)});update();
 }
 demo.append(controls,feedback);
}
render();save();
