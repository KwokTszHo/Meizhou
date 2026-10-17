import {calculate,stages,stageParameters} from './model.js?v=20261017-2';
import qrcode from './vendor/qrcode.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let currentStage=0,scenes=[],playing=null,toastTimer;
const values=stages.map((_,i)=>calculate(i).fs),fmt=n=>n.toLocaleString('zh-CN',{maximumFractionDigits:1}),safe=n=>n>=1?'抗力大于滑力':'抗力不足';
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function chart(){
 const xs=[45,195,345,495],y=v=>230-v*105;
 $('#stage-chart').innerHTML=`<svg viewBox="0 0 550 275" aria-label="四个工况安全系数分别为1.76、1.25、0.92、0.38"><defs><linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c9e74" stop-opacity=".22"/><stop offset="1" stop-color="#7c9e74" stop-opacity="0"/></linearGradient></defs>${[0,.5,1,1.5,2].map(v=>`<line x1="38" y1="${y(v)}" x2="515" y2="${y(v)}" stroke="${v===1?'#c48d66':'#e1e5d9'}" stroke-dasharray="${v===1?'5 5':'0'}"/><text x="9" y="${y(v)+4}" fill="#98a18e" font-size="10">${v.toFixed(1)}</text>`).join('')}<text x="420" y="${y(1)-9}" fill="#ad805b" font-size="9">Fₛ = 1 · 极限平衡</text><path d="M${xs.map((x,i)=>`${x} ${y(values[i])}`).join(' L')} L495 230 L45 230Z" fill="url(#curve-fill)"/><path d="M${xs.map((x,i)=>`${x} ${y(values[i])}`).join(' L')}" fill="none" stroke="#72906a" stroke-width="2"/>${xs.map((x,i)=>`<g class="chart-point" data-stage="${i}" role="button" tabindex="0" aria-label="选择${stages[i].name}，安全系数${stages[i].value}"><circle cx="${x}" cy="${y(values[i])}" r="${currentStage===i?8:5}" fill="${i<2?'#5e8159':'#bb805d'}" stroke="#f8f8f2" stroke-width="3"/><text x="${x}" y="${y(values[i])-17}" fill="${i===currentStage?'#274b2f':'#819273'}" font-size="16" text-anchor="middle">${stages[i].value}</text><text x="${x}" y="254" fill="#94a08c" font-size="9" text-anchor="middle">${stages[i].short}</text></g>`).join('')}</svg>`;
}
function selectStage(i){
 currentStage=i;const s=stages[i],r=calculate(i);
 $$('[data-stage]').forEach(e=>{if(e.tagName==='BUTTON')e.setAttribute('aria-pressed',String(+e.dataset.stage===i));});
 $('#stage-index').textContent=`工况 0${i+1} / 04`;$('#stage-fs').textContent=s.value;$('#stage-name').textContent=s.name;$('#stage-description').textContent=s.description;$('#stage-conditions').textContent=s.conditions;
 $('#stage-status').textContent=safe(r.fs);$('#stage-status').classList.toggle('unsafe',r.fs<1);
 const max=Math.max(r.resistance,r.driving);$('#r-bar').style.width=r.resistance/max*100+'%';$('#t-bar').style.width=r.driving/max*100+'%';
 scenes.forEach(scene=>scene.setStage(i));$('#model-stage').textContent=s.name;$('#explore-model-stage').textContent=s.name;chart();
 $('#lab-stage').value=i;const p=stageParameters(i);for(const key of Object.keys(initialInputs))$('#'+key).value=p[key];updateLab();updatePlayback();
 $$('#formula-stages article').forEach((card,index)=>card.classList.toggle('is-current',index===i));
}
const initialInputs={phi:29.6,beta:24.4,load:2284.5,cohesion:28.85};
function labParams(){return stageParameters(+$('#lab-stage').value,Object.fromEntries(Object.keys(initialInputs).map(k=>[k,+$('#'+k).value])));}
function updateLab(){
 const stage=+$('#lab-stage').value,p=labParams(),r=calculate(stage,p),base=calculate(stage).fs;
 $('#cohesion').disabled=stage!==0;$('#load').disabled=stage===1;
 for(const k of Object.keys(initialInputs)){const input=$('#'+k);input.value=p[k];input.style.setProperty('--pct',((p[k]-input.min)/(input.max-input.min))*100+'%');$('#'+k+'-out').textContent=k==='load'?fmt(p[k])+' kN':k==='cohesion'?p[k].toFixed(2)+' kPa':p[k].toFixed(1)+'°';}
 $('#lab-fs').textContent=r.fs.toFixed(2);$('#lab-status').textContent=safe(r.fs);$('#lab-status').classList.toggle('unsafe',r.fs<1);$('#lab-fs').style.color=r.fs<1?'#ad7250':'#315637';
 $('#gauge-needle').style.left=Math.min(100,r.fs/3*100)+'%';$('#lab-r').textContent=fmt(r.resistance)+' kN';$('#lab-t').textContent=fmt(r.driving)+' kN';
 $('#lab-formula').textContent=stages[stage].formula;$('#lab-formula-source').textContent=stages[stage].source;
 const diff=r.fs-base;
 $('#lab-insight').textContent=`${Math.abs(diff)<.00001?'当前为此工况的基准参数。':`相较此工况基准值，Fₛ ${diff>0?'增加':'减少'} ${Math.abs(diff).toFixed(2)}。`}${r.fs<1?'抗滑项小于下滑项。':r.fs===1?'抗滑项与下滑项相等。':'抗滑项大于下滑项。'}${r.fs>3?'结果超过下方刻度上限，数值显示完整。':''}`;
 $('#lab-control-note').textContent=stage===0?'天然含水条件：黏聚与摩擦共同抗滑，计入车辆荷载。':stage===1?'滑动界面取 c = 0，低车流工况取 P = 0；这两个参数已同步置零。':'滑动界面取 c = 0，车辆荷载可调。'+(stage===3?'此工况采用浮容重与渗流作用项。':'土重采用饱和容重计算。');
 $('#lab-params').innerHTML=`<div><span>${stage===0?'天然容重 γ':stage===3?'浮容重 γ′':'饱和容重 γsat'}</span><strong>${p.unitWeight.toFixed(1)} <small>kN/m³</small></strong></div><div><span>当前土重 W${stage===0?'₁':stage===3?'₃':'₂'}</span><strong>${fmt(r.weight)} <small>kN</small></strong></div><div><span>截面面积 A</span><strong>319 <small>m²</small></strong></div><div><span>滑面长度 L</span><strong>56.8 <small>m</small></strong></div>${stage===3?'<p>γ′ = 20 − 9.8 = 10.2 kN/m³ · 渗流作用系数 = 0.51</p>':''}`;
 return {stage,params:p,...r};
}
function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#lab-form').addEventListener('input',e=>{if(e.target.matches('input[type="range"]')){stopPlayback();updateLab();}});
$('#lab-stage').addEventListener('change',()=>{stopPlayback();selectStage(+$('#lab-stage').value);});
$('#lab-form').addEventListener('reset',e=>{e.preventDefault();stopPlayback();selectStage(currentStage);toast('已恢复当前工况的基准参数');});
$('#save-experiment').addEventListener('click',()=>{const r=updateLab();download('归途之下-计算记录.txt',`归途之下｜力学实验记录\n工况：${stages[r.stage].name}\n公式：${stages[r.stage].formula}\nφ=${r.params.phi}°\nβ=${r.params.beta}°\nc=${r.params.cohesion} kPa\nP=${r.params.load} kN\n容重=${r.params.unitWeight} kN/m³\n土重W=${r.weight.toFixed(4)} kN\nA=319 m²，L=56.8 m\nR=${r.resistance.toFixed(4)} kN\nT=${r.driving.toFixed(4)} kN\nFs=${r.fs.toFixed(6)}\n\n力学科普简化模型 · ${stages[r.stage].source}\n${stages[r.stage].note}\n`);toast('计算记录已生成');});
document.addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b){stopPlayback();selectStage(+b.dataset.stage);}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('chart-point')){e.preventDefault();stopPlayback();selectStage(+e.target.dataset.stage);}});
function updatePlayback(){const active=playing!==null;$('#play-stages').textContent=active?'Ⅱ 暂停播放':'▷ 播放四个工况';$('#play-stages').setAttribute('aria-pressed',String(active));$('#playback-status').textContent=`${active?'正在播放':'当前工况'} · 0${currentStage+1} / 04 · ${stages[currentStage].name}`;$('#playback-progress').style.width=((currentStage+1)/4*100)+'%';$('.mini-model').classList.toggle('is-playing',active);}
function stopPlayback(){clearInterval(playing);playing=null;updatePlayback();}
$('#play-stages').addEventListener('click',()=>{if(playing!==null){stopPlayback();return;}selectStage(currentStage===3?0:currentStage+1);playing=setInterval(()=>{if(currentStage===3){stopPlayback();return;}selectStage(currentStage+1);},2800);updatePlayback();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
$('#start-tour').addEventListener('click',()=>{selectStage(0);toast('从四个工况开始：选节点看变化，再进入实验室亲手计算。');});
$('#see-model').addEventListener('click',e=>{e.preventDefault();const model=$('#explore-scene');scenes[1]?.resetView(true);scenes[1]?.toggleForces(true);history.replaceState(null,'','#explore-scene');model.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});model.focus({preventScroll:true});model.parentElement.classList.add('model-highlight');setTimeout(()=>model.parentElement.classList.remove('model-highlight'),1800);});
$('.menu-toggle').addEventListener('click',()=>{const open=$('.header nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(open));});
$$('.header nav a').forEach(a=>a.addEventListener('click',()=>{$('.header nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.open).showModal()));
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$$('.dialog-anchor').forEach(a=>a.addEventListener('click',()=>a.closest('dialog').close()));
function openPhoto(name,caption){$('#lightbox-image').src='assets/'+name;$('#lightbox-image').alt=caption;$('#lightbox-caption').textContent=caption;$('#download-photo').href='assets/'+name;$('#photo-dialog').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('.photo-open');if(b)openPhoto(b.dataset.image,b.dataset.caption);});
const samples=[['ZK1-1','1.71','6.3','26.1','29.8'],['ZK1-2','1.73','11.3','26.1','29.8'],['ZK2-1','1.76','7.2','31.6','29.3'],['ZK2-2','1.77','5.7','31.6','29.3']];
function testsTable(){return `<div class="table-wrap"><table><caption class="sr-only">主要土工试验指标</caption><thead><tr><th scope="col">样本编号</th><th scope="col">湿密度 / g·cm⁻³</th><th scope="col">含水率 / %</th><th scope="col">快剪黏聚力 / kPa</th><th scope="col">快剪内摩擦角 / °</th></tr></thead><tbody>${samples.map(row=>'<tr>'+row.map((v,i)=>i===0?`<th scope="row">${v}</th>`:`<td>${v}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;}
function evidence(type){
 $$('[data-evidence]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.evidence===type)));
 if(type==='tests')$('#evidence-content').innerHTML=testsTable()+`<div class="table-caption"><span>两处取土点 · 每处两组试验</span><span>基准参数 c = 28.85 kPa · φ = 29.6°</span></div><p class="source-note">通过含水率、密度与直接快剪试验，认识土体的物理状态和抗剪特性，再将其引入力学模型。</p>`;
 if(type==='geometry')$('#evidence-content').innerHTML=`<div class="evidence-split"><button class="photo-open" data-image="image8.jpeg" data-caption="地形横剖面与假定滑动界面。"><img src="assets/image8.jpeg" alt="地形横剖面图" loading="lazy"></button><div><h3>把现场，简化成可分析的滑块。</h3><p>截面面积 A = 319 m²，滑面长度 L = 56.8 m，滑面倾角 β = 24.4°。将滑面上方的土体看作整体，比较沿坡方向的下滑项与抗滑项。</p><p>车辆荷载 P = 2284.5 kN。四个工况保持几何一致，依次改变界面黏聚、土重、车辆荷载与渗流作用，观察平衡如何变化。</p><button class="text-link" data-photo-load>查看荷载计算简图 ↗</button></div></div>`;
 if(type==='water')$('#evidence-content').innerHTML=`<div class="evidence-split"><button class="photo-open" data-image="image5.jpeg" data-caption="地形与降雨汇流示意 · 集雨面积 0.5 km²。"><img src="assets/image5.jpeg" alt="地形与降雨汇流示意图" loading="lazy"></button><div><h3>雨落下之后，水往哪里去？</h3><p>集雨面积 0.5 km²、月降雨量 740.5 mm，对应的降雨总体积为 500000 × 0.7405 = 370250 m³，约 37 万 m³。</p><p>从降雨到汇流，再到入渗与排出，水沿着地形与土体中的通道移动。产流、渗透和排水条件共同决定坡体内部的含水与水压力变化。</p><p>模型通过天然容重、饱和容重和浮容重三个取值，以及渗流作用项，展示水如何进入边坡的受力分析。</p></div></div>`;
}
$$('[data-evidence]').forEach(b=>b.addEventListener('click',()=>evidence(b.dataset.evidence)));
document.addEventListener('click',e=>{if(e.target.closest('[data-photo-load]'))openPhoto('image9.jpeg','车道荷载计算简图');});
let paperLoaded=false;
$('#read-paper').addEventListener('click',async()=>{
 $('#reader-dialog').showModal();if(paperLoaded)return;$('#reader-content').textContent='正在读取论文…';
 try{const response=await fetch('assets/paper-content.json');if(!response.ok)throw Error('load');const data=await response.json(),container=$('#reader-content');container.replaceChildren();
 let inTable=false;
 for(const p of data){
  if(p.text==='编号'){inTable=true;const table=document.createElement('div');table.innerHTML=testsTable();container.append(table);continue;}
  if(inTable){if(p.text.startsWith('对两个取土点'))inTable=false;else continue;}
  if(p.text){const el=document.createElement(p.text==='用一条安全系数曲线解码梅大高速塌方的秘密'?'h2':/^\d+[、.]\d*、?/.test(p.text)&&p.text.length<40?'h3':'p');el.textContent=p.text;container.append(el);}
  for(const src of p.images){const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');const filename=src.split('/').pop().replace('.emf','.jpg');image.src='assets/'+filename;image.alt='研究插图 '+filename;image.loading='lazy';caption.textContent='研究插图 · 点击放大';figure.append(image,caption);figure.style.cursor='zoom-in';figure.addEventListener('click',()=>openPhoto(filename,'研究插图'));container.append(figure);}
 }paperLoaded=true;
 }catch{$('#reader-content').innerHTML='<p>在线正文暂时无法读取，可以下载完整论文阅读。</p><a class="button primary" href="assets/paper-original.docx" download>下载论文 ↓</a>';}
});
const publicUrl=new URL('./',location.href).href;
let publicQrUrl;
function makeShareQr(){
 if(publicQrUrl)return publicQrUrl;
 const qr=qrcode(0,'M');qr.addData(publicUrl);qr.make();
 const size=qr.getModuleCount(),cell=8,margin=4,canvas=document.createElement('canvas');canvas.width=canvas.height=(size+margin*2)*cell;
 const context=canvas.getContext('2d');context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.fillStyle='black';
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(qr.isDark(y,x))context.fillRect((x+margin)*cell,(y+margin)*cell,cell,cell);
 return publicQrUrl=canvas.toDataURL('image/png');
}
$('#share-site').addEventListener('click',()=>{const image=new Image();image.src=makeShareQr();image.alt='归途之下网站二维码';$('#qr-code').replaceChildren(image);$('#share-url').textContent=publicUrl;$('#download-site-qr').href=image.src;$('#share-dialog').showModal();});
$('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(publicUrl);$('#share-status').textContent='链接已复制';}catch{$('#share-status').textContent='请长按上方网址复制';}});
$('#view-default').addEventListener('click',()=>{scenes[0]?.resetView(false);$('#view-section').setAttribute('aria-pressed','false');});
$('#view-section').addEventListener('click',()=>{const b=$('#view-section'),value=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(value));scenes[0]?.resetView(value);});
$('#toggle-forces').addEventListener('click',()=>{const b=$('#toggle-forces'),value=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(value));scenes[0]?.toggleForces(value);toast(value?'受力示意：浅绿为抗滑项，橙色为下滑项，灰白为重力，蓝色为水作用。':'已隐藏受力箭头');});
const mini=document.createElement('div');mini.className='mini-model';mini.innerHTML='<div class="mini-topline"><span>三维剖面 · <b id="explore-model-stage"></b></span><small>拖动旋转 / 双指缩放</small></div><div id="explore-scene" class="mini-scene" role="img" tabindex="-1" aria-label="与下方工况曲线同步的三维边坡受力示意"><div class="scene-fallback"><p>正在准备交互剖面…</p></div></div><div class="mini-legend"><span>● 抗滑项</span><span>● 下滑项</span><span>● 水作用</span><small>箭头显示受力方向与工况差异</small></div>';
$('.curve-panel').insertBefore(mini,$('#stage-chart'));
const modelStage=document.createElement('span');modelStage.id='model-stage';modelStage.textContent='初始平衡';$('.model-topline>span:first-child').append(' · ',modelStage);
$('#formula-stages').innerHTML=stages.map((s,i)=>{const p=stageParameters(i),r=calculate(i);return `<article class="formula-stage"><header><span>工况 0${i+1} · ${s.source}</span><strong>Fₛ ≈ ${s.value}</strong></header><h3>${s.name}</h3><p class="formula-condition">${s.conditions}</p><dl><div><dt>黏聚力 c</dt><dd>${p.cohesion} kPa</dd></div><div><dt>车辆荷载 P</dt><dd>${fmt(p.load)} kN</dd></div><div><dt>${i===0?'天然容重 γ':i===3?'浮容重 γ′':'饱和容重 γsat'}</dt><dd>${p.unitWeight} kN/m³</dd></div></dl><p class="formula-weight">${s.weightFormula}</p><div class="force-equations"><p>${s.resistanceFormula}</p><p>${s.drivingFormula}</p></div><p class="stage-equation">${s.formula}</p><p class="formula-substitution">${s.substitution}</p><div class="formula-force-values"><span>R = ${fmt(r.resistance)} kN</span><span>T = ${fmt(r.driving)} kN</span></div>${i===3?'<p class="formula-footnote">γ′ = γsat − γw = 10.2 kN/m³，γ′ + γw = 20 kN/m³。</p>':''}</article>`;}).join('');
selectStage(0);evidence('tests');updateLab();
try{const {createScene}=await import('./scene.js?v=20261017-2');scenes.push(createScene($('#scene')));scenes.push(createScene($('#explore-scene')));scenes[1].toggleForces(true);scenes[1].resetView(true);scenes.forEach(s=>s.setStage(currentStage));window.__sceneReady=true;}
catch(error){console.warn('3D unavailable',error);$$('.scene-fallback p').forEach(p=>p.textContent='当前设备暂不支持三维渲染，下方图表与计算器仍可使用。');$('#explore-scene').innerHTML='<img src="assets/section-fallback.svg" alt="边坡剖面示意：山体、道路、填方与潜在滑面">';window.__sceneReady=false;}
