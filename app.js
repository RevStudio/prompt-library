const $=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GLAM='\u0000',MKEY='artPromptLib.mine.v2',PAGE=48;
let BASE=[],MINE=[],D=[],view='main',fTags=new Set(),cur=null,tab=0,L=[],shown=0;
try{MINE=JSON.parse(localStorage.getItem(MKEY)||'[]')}catch(e){MINE=[]}
const saveMine=()=>localStorage.setItem(MKEY,JSON.stringify(MINE));
const isG=p=>p.category===GLAM,isGame=p=>!isG(p)&&(p.game||(p.tags||[]).includes('게임'));
const inV=(k,p)=>k==='glam'?isG(p):k==='game'?isGame(p):!isG(p);const inView=p=>inV(view,p);
function toast(t){const o=$('#toast');o.textContent=t;o.classList.add('on');setTimeout(()=>o.classList.remove('on'),1400)}
function copy(t){(navigator.clipboard&&isSecureContext?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}).finally(()=>toast('복사했어요!'))}
const FRE=/^[・•\-]\s*([^：:\n]+?)\s*[：:]\s*\{\{([^}]*)\}\}/gm;
const fields=t=>[...(t||'').matchAll(FRE)].map(m=>({label:m[1],def:m[2]}));
const texts=p=>[[p.translation?'원문':'프롬프트',p.prompt],...(p.translation?[[p.translationLabel||'번역',p.translation]]:[])];
function opts(sel,vals,all){const v=sel.value;sel.innerHTML=`<option value="">${all}</option>`+vals.map(x=>`<option${x===v?' selected':''}>${E(x)}</option>`).join('');if(!vals.includes(v))sel.value=''}
function render(){
  D=[...BASE,...MINE];const V=D.filter(inView);
  $('#views').innerHTML=[['main','🎨 일반'],['game','🎮 게임']].map(([k,l])=>`<button data-v="${k}" class="${view===k?'on':''}">${l} (${D.filter(p=>inV(k,p)).length})</button>`).join('');
  const cnt=a=>{const m={};a.forEach(x=>m[x]=(m[x]||0)+1);return Object.keys(m).sort((a,b)=>m[b]-m[a])};
  opts($('#fModel'),cnt(V.map(p=>p.model||'기타')),'모든 모델');opts($('#fCat'),cnt(V.map(p=>p.category)),'모든 카테고리');
  const tags=cnt(V.flatMap(p=>p.tags||[]));[...fTags].forEach(t=>{if(!tags.includes(t))fTags.delete(t)});
  $('#tags').innerHTML=tags.map(t=>`<span class="chip ${fTags.has(t)?'on':''}" data-t="${E(t)}">#${E(t)}</span>`).join('');
  const q=$('#q').value.trim().toLowerCase(),fm=$('#fModel').value,fc=$('#fCat').value,so=$('#sort').value;
  L=V.filter(p=>(!fm||(p.model||'기타')===fm)&&(!fc||p.category===fc)&&[...fTags].every(t=>(p.tags||[]).includes(t))&&(!q||[p.title,p.summary,p.prompt,p.translation,p.model,p.category,...(p.tags||[])].join('\n').toLowerCase().includes(q)));
  L.sort(so==='title'?(a,b)=>a.title.localeCompare(b.title,'ko'):so==='old'?(a,b)=>a._o-b._o:(a,b)=>b._o-a._o);
  $('#count').textContent=`${L.length}개 / 이 탭 ${V.length}개 (전체 ${D.length}개)`;$('#grid').innerHTML='';shown=0;more();
  if(!L.length)$('#grid').innerHTML='<p>검색 결과가 없어요.</p>';
}
function card(p){return `<div class="card" data-id="${E(p.id)}">${p.thumb||p.image?`<img class="thumb" loading="lazy" decoding="async" src="${E(p.thumb||p.image)}" alt="">`:`<div class="thumb">${fields(p.prompt).length?'📝':'🎨'}</div>`}<div class="cb"><p class="ct">${E(p.title)}${p._mine?'<span class="mine">내 것</span>':''}</p><div class="meta">${E(p.category)} · ${E(p.model)}</div><div class="tags">${(p.tags||[]).slice(0,3).map(t=>`<span class="tag">${E(t)}</span>`).join('')}</div></div></div>`}
function more(){const n=L.slice(shown,shown+PAGE);$('#grid').insertAdjacentHTML('beforeend',n.map(card).join(''));shown+=n.length;$('#more').hidden=shown>=L.length}
new IntersectionObserver(es=>{if(es[0].isIntersecting&&shown<L.length)more()},{rootMargin:'600px'}).observe($('#sentinel'));
$('#more').onclick=more;$('#views').onclick=e=>{const v=e.target.dataset.v;if(v){view=v;fTags.clear();$('#fModel').value='';$('#fCat').value='';render();scrollTo(0,0)}};
$('#tags').onclick=e=>{const t=e.target.dataset.t;if(t){fTags.has(t)?fTags.delete(t):fTags.add(t);render()}};
let qt;$('#q').oninput=()=>{clearTimeout(qt);qt=setTimeout(render,150)};['#fModel','#fCat','#sort'].forEach(s=>$(s).onchange=render);
$('#grid').onclick=e=>{const c=e.target.closest('.card');if(c)show(c.dataset.id)};
function show(id){cur=D.find(p=>p.id===id);if(!cur)return;tab=0;drawDetail();$('#ov').classList.add('on');history.replaceState(null,'','#'+encodeURIComponent(id))}
function drawDetail(){const p=cur,T=texts(p),txt=T[tab][1],F=fields(txt);
 $('#dlg').innerHTML=`<button class="x" onclick="closeOv()">✕</button><h2>${E(p.title)}</h2><div class="meta">${E(p.category)} · ${E(p.model)}${p.added?' · '+E(p.added):''}</div><div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${E(t)}</span>`).join('')}</div>
 ${p.image?`<img class="dimg" src="${E(p.image)}" alt="">`:''}${p.summary?`<p class="sum">${E(p.summary)}</p>`:''}
 <div class="tabs">${T.map((t,i)=>`<button class="${i===tab?'on':''}" onclick="tab=${i};drawDetail()">${E(t[0])}</button>`).join('')}</div>
 <div class="code"><button onclick="copy(texts(cur)[tab][1])">📋 복사</button><pre>${E(txt)}</pre></div>
 ${F.length?`<div class="tf"><h3>📝 템플릿 채우기</h3><div class="meta">빈칸으로 두면 기본값 지시({{ }})가 그대로 들어가요.</div><div class="fr">${F.map((f,i)=>`<label for="f${i}">${E(f.label)}</label><input id="f${i}" placeholder="${E(f.def)}">`).join('')}</div><div class="row"><button class="pri" onclick="copy(assemble())">📋 채운 프롬프트 복사</button><button onclick="pv.style.display='block';pv.querySelector('pre').textContent=assemble()">미리보기</button></div><div class="code" id="pv" style="display:none;margin-top:10px"><pre></pre></div></div>`:''}
 ${p.source?`<p class="src">출처: ${E(p.source).replace(/https?:\/\/[^\s()]+/g,u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`)}</p>`:''}
 ${p._mine?`<div class="row"><button onclick="edit('${E(p.id)}')">✏️ 편집</button><button onclick="delMine('${E(p.id)}')">🗑 삭제</button></div>`:''}`}
function assemble(){let i=0;const vals=[...document.querySelectorAll('.fr input')].map(x=>x.value.trim());return texts(cur)[tab][1].replace(FRE,m=>{const v=vals[i++];return v?m.replace(/\{\{[^}]*\}\}/,v):m})}
function closeOv(){$('#ov').classList.remove('on');history.replaceState(null,'',location.pathname)}
$('#ov').onclick=e=>{if(e.target.id==='ov')closeOv()};document.onkeydown=e=>{if(e.key==='Escape')closeOv()};
function edit(id){const p=id?MINE.find(x=>x.id===id):{title:'',category:'',model:'',tags:[],summary:'',prompt:'',translation:'',source:''};
 $('#dlg').innerHTML=`<button class="x" onclick="closeOv()">✕</button><h2>${id?'내 프롬프트 편집':'내 프롬프트 추가'}</h2><div class="ed">
 <label>제목</label><input id="e_title" value="${E(p.title)}"><label>카테고리</label><input id="e_cat" value="${E(p.category)}">
 <label>모델</label><input id="e_model" value="${E(p.model)}"><label>태그 (쉼표)</label><input id="e_tags" value="${E((p.tags||[]).join(', '))}">
 <label>요약</label><input id="e_sum" value="${E(p.summary)}"><label>프롬프트 — "・항목：{{기본값}}" 줄은 입력칸이 돼요</label><textarea id="e_p">${E(p.prompt)}</textarea>
 <label>번역 (선택)</label><textarea id="e_t" style="min-height:80px">${E(p.translation)}</textarea><label>이미지 URL (선택)</label><input id="e_img" value="${E(p.image||'')}"><label>출처</label><input id="e_src" value="${E(p.source)}"></div>
 <div class="row"><button class="pri" onclick="saveMineEdit('${id||''}')">저장</button><button onclick="closeOv()">취소</button></div>`;$('#ov').classList.add('on')}
function saveMineEdit(id){const v=k=>$('#'+k).value.trim(),o={id:id||'mine-'+Date.now(),_mine:true,_o:1e12+Date.now(),title:v('e_title')||'(제목 없음)',category:v('e_cat')||'기타',model:v('e_model')||'기타',tags:v('e_tags').split(/[,，]/).map(s=>s.trim()).filter(Boolean),summary:v('e_sum'),prompt:$('#e_p').value.trim(),translation:$('#e_t').value.trim(),translationLabel:'번역',image:v('e_img'),source:v('e_src')};
 const i=MINE.findIndex(x=>x.id===o.id);i>=0?MINE[i]=o:MINE.push(o);saveMine();render();show(o.id);toast('저장했어요 (이 브라우저에만)')}
function delMine(id){if(!confirm('삭제할까요?'))return;MINE=MINE.filter(x=>x.id!==id);saveMine();closeOv();render()}
$('#addBtn').onclick=()=>edit();
fetch('prompts.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{BASE=d.map((p,i)=>({...p,_o:i}));MINE.forEach(m=>m._mine=true);render();const h=decodeURIComponent(location.hash.slice(1));if(h)show(h)}).catch(e=>{$('#count').textContent='데이터를 불러오지 못했어요: '+e});
