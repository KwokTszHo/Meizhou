import {calculate,stages} from './model.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let currentStage=0,scenes=[],playing=null,toastTimer;
const values=stages.map((_,i)=>calculate(i).fs),fmt=n=>n.toLocaleString('zh-CN',{maximumFractionDigits:1}),safe=n=>n>=1?'抗力大于滑力':'抗力不足';
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function chart(){
 const xs=[45,195,345,495],y=v=>230-v*105;
 $('#stage-chart').innerHTML=`<svg viewBox="0 0 550 275" aria-label="四个工况安全系数分别为1.76、1.25、0.92、0.38"><defs><linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c9e74" stop-opacity=".22"/><stop offset="1" stop-color="#7c9e74" stop-opacity="0"/></linearGradient></defs>${[0,.5,1,1.5,2].map(v=>`<line x1="38" y1="${y(v)}" x2="515" y2="${y(v)}" stroke="${v===1?'#c48d66':'#e1e5d9'}" stroke-dasharray="${v===1?'5 5':'0'}"/><text x="9" y="${y(v)+4}" fill="#98a18e" font-size="10">${v.toFixed(1)}</text>`).join('')}<text x="420" y="${y(1)-9}" fill="#ad805b" font-size="9">Fₛ = 1 · 极限平衡</text><path d="M${xs.map((x,i)=>`${x} ${y(values[i])}`).join(' L')} L495 230 L45 230Z" fill="url(#curve-fill)"/><path d="M${xs.map((x,i)=>`${x} ${y(values[i])}`).join(' L')}" fill="none" stroke="#72906a" stroke-width="2"/>${xs.map((x,i)=>`<g class="chart-point" data-stage="${i}" role="button" tabindex="0" aria-label="选择${stages[i].name}，安全系数${stages[i].value}"><circle cx="${x}" cy="${y(values[i])}" r="${currentStage===i?8:5}" fill="${i<2?'#5e8159':'#bb805d'}" stroke="#f8f8f2" stroke-width="3"/><text x="${x}" y="${y(values[i])-17}" fill="${i===currentStage?'#274b2f':'#819273'}" font-size="16" text-anchor="middle">${stages[i].value}</text><text x="${x}" y="254" fill="#94a08c" font-size="9" text-anchor="middle">${stages[i].short}</text></g>`).join('')}</svg>`;
}
function selectStage(i,{syncLab=true}={}){
 currentStage=i;const s=stages[i],r=calculate(i);
 $$('[data-stage]').forEach(e=>{if(e.tagName==='BUTTON')e.setAttribute('aria-pressed',String(+e.dataset.stage===i));});
 $('#stage-index').textContent=`工况 0${i+1} / 04`;$('#stage-fs').textContent=s.value;$('#stage-name').textContent=s.name;$('#stage-description').textContent=s.description;$('#stage-conditions').textContent=s.conditions;
 $('#stage-status').textContent=safe(r.fs);$('#stage-status').classList.toggle('unsafe',r.fs<1);
 const max=Math.max(r.resistance,r.driving);$('#r-bar').style.width=r.resistance/max*100+'%';$('#t-bar').style.width=r.driving/max*100+'%';
 scenes.forEach(scene=>scene.setStage(i));$('#model-stage').textContent=s.name;chart();
 if(syncLab){$('#lab-stage').value=i;updateLab();}
}
const initialInputs={phi:29.6,beta:24.4,load:2284.5,cohesion:28.85};
function labParams(){return Object.fromEntries(Object.keys(initialInputs).map(k=>[k,+$('#'+k).value]));}
function updateLab(){
 const stage=+$('#lab-stage').value,p=labParams(),r=calculate(stage,p),base=calculate(stage).fs;
 $('#cohesion').disabled=stage!==0;$('#load').disabled=stage===1;
 for(const k of Object.keys(p)){const input=$('#'+k);input.style.setProperty('--pct',((p[k]-input.min)/(input.max-input.min))*100+'%');$('#'+k+'-out').textContent=k==='load'?fmt(p[k])+' kN':k==='cohesion'?p[k].toFixed(2)+' kPa':p[k].toFixed(1)+'°';}
 $('#lab-fs').textContent=r.fs.toFixed(2);$('#lab-status').textContent=safe(r.fs);$('#lab-status').classList.toggle('unsafe',r.fs<1);$('#lab-fs').style.color=r.fs<1?'#ad7250':'#315637';
 $('#gauge-needle').style.left=Math.min(100,r.fs/3*100)+'%';$('#lab-r').textContent=fmt(r.resistance)+' kN';$('#lab-t').textContent=fmt(r.driving)+' kN';
 $('#lab-formula').textContent=stages[stage].formula;$('#lab-formula-source').textContent=stages[stage].source;
 const diff=r.fs-base;
 $('#lab-insight').textContent=`${Math.abs(diff)<.00001?'当前为原稿基准参数。':`相较同工况原稿值，Fₛ ${diff>0?'增加':'减少'} ${Math.abs(diff).toFixed(2)}。`}${r.fs<1?'在本模型中，抗滑项小于下滑项。':'在本模型中，抗滑项大于下滑项。'}${r.fs>3?'结果超过下方刻度上限，数值显示完整。':''}`;
 $('#lab-control-note').textContent=stage===0?'仅比较所选参数；几何尺寸与容重保持固定。':stage===1?'本工况不计车辆荷载，且按 c = 0 处理。相应滑块已禁用。':'本工况按 c = 0 处理，黏聚力滑块已禁用。'+(stage===3?'渗流项按原稿式（12）计算。':'车辆法向分量处理待复核。');
 return {stage,params:p,...r};
}
function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#lab-form').addEventListener('input',updateLab);$('#lab-form').addEventListener('change',()=>{const s=+$('#lab-stage').value;if(s!==currentStage)selectStage(s,{syncLab:false});updateLab();});
$('#lab-form').addEventListener('reset',()=>requestAnimationFrame(()=>{selectStage(0);updateLab();toast('已恢复原稿完工工况与参数');}));
$('#save-experiment').addEventListener('click',()=>{const r=updateLab();download('归途之下-计算记录.txt',`归途之下｜原论文模型计算记录\n工况：${stages[r.stage].name}\n公式：${stages[r.stage].formula}\nφ=${r.params.phi}°\nβ=${r.params.beta}°\nc=${r.stage===0?r.params.cohesion:0} kPa\nP=${r.stage===1?0:r.params.load} kN\nA=319 m²，L=56.8 m\nR=${r.resistance.toFixed(4)} kN\nT=${r.driving.toFixed(4)} kN\nFs=${r.fs.toFixed(6)}\n\n依据：郭子昊《用一条安全系数曲线解码梅大高速塌方的秘密》${stages[r.stage].source}。\n这是原稿简化模型的参数演示，不是现场监测值。单位宽度、车辆法向力与渗流自由体处理仍待复核。\n${stages[r.stage].note}\n`);toast('计算记录已生成');});
document.addEventListener('click',e=>{const b=e.target.closest('[data-stage]');if(b){stopPlayback();selectStage(+b.dataset.stage);}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('chart-point')){e.preventDefault();stopPlayback();selectStage(+e.target.dataset.stage);}});
function stopPlayback(){clearInterval(playing);playing=null;$('#play-stages').textContent='▷ 播放四个工况';}
$('#play-stages').addEventListener('click',()=>{if(playing){stopPlayback();return;}selectStage(0);$('#play-stages').textContent='Ⅱ 暂停播放';playing=setInterval(()=>{if(currentStage===3){stopPlayback();return;}selectStage(currentStage+1);},4500);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
$('#start-tour').addEventListener('click',()=>{selectStage(0);toast('从四个工况开始：选节点看变化，再进入实验室亲手计算。');});
$('#see-model').addEventListener('click',()=>toast('已同步到工况：'+stages[currentStage].name));
$('.menu-toggle').addEventListener('click',()=>{const open=$('.header nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(open));});
$$('.header nav a').forEach(a=>a.addEventListener('click',()=>{$('.header nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.open).showModal()));
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$$('.dialog-anchor').forEach(a=>a.addEventListener('click',()=>a.closest('dialog').close()));
function openPhoto(name,caption){$('#lightbox-image').src='assets/'+name;$('#lightbox-image').alt=caption;$('#lightbox-caption').textContent=caption;$('#download-photo').href='assets/'+name;$('#photo-dialog').showModal();}
document.addEventListener('click',e=>{const b=e.target.closest('.photo-open');if(b)openPhoto(b.dataset.image,b.dataset.caption);});
const samples=[['ZK1-1','1.71','6.3','26.1','29.8'],['ZK1-2','1.73','11.3','26.1','29.8'],['ZK2-1','1.76','7.2','31.6','29.3'],['ZK2-2','1.77','5.7','31.6','29.3']];
function testsTable(){return `<div class="table-wrap"><table><caption class="sr-only">原稿表1主要土工试验指标</caption><thead><tr><th scope="col">样本编号</th><th scope="col">湿密度 / g·cm⁻³</th><th scope="col">含水率 / %</th><th scope="col">快剪黏聚力 / kPa</th><th scope="col">快剪内摩擦角 / °</th></tr></thead><tbody>${samples.map(row=>'<tr>'+row.map((v,i)=>i===0?`<th scope="row">${v}</th>`:`<td>${v}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;}
function evidence(type){
 $$('[data-evidence]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.evidence===type)));
 if(type==='tests')$('#evidence-content').innerHTML=testsTable()+`<div class="table-caption"><span>摘录自原稿表1 · 两处土样，各两组试验</span><span>快剪指标 ≠ 自动等同于有效应力参数</span></div><p class="source-note">原稿描述与试验表的土类名称存在差异；完整检测报告待补充。附近取样不能证明与事故路基同源。</p>`;
 if(type==='geometry')$('#evidence-content').innerHTML=`<div class="evidence-split"><button class="photo-open" data-image="image8.jpeg" data-caption="原稿图5 · 地形横剖面。网站三维场景据此制作科学示意，不是测绘重建。"><img src="assets/image8.jpeg" alt="原论文地形横剖面图" loading="lazy"></button><div><h3>把现场，简化成可分析的滑块。</h3><p>原稿采用 A = 319 m²、L = 56.8 m、β = 24.4°，通过假定滑面进行受力分析。滑面长与倾角来自论文简化，网站不另行搜索最危险滑面。</p><p>原稿车辆荷载 P = 2284.5 kN。该总荷载与单位宽度断面之间的换算，需要进一步统一。</p><button class="text-link" data-photo-load>查看荷载计算简图 ↗</button></div></div>`;
 if(type==='water')$('#evidence-content').innerHTML=`<div class="evidence-split"><button class="photo-open" data-image="image5.jpeg" data-caption="原稿图3 · 降雨汇流示意。0.5 km²为论文采用的集雨面积。"><img src="assets/image5.jpeg" alt="论文中的地形与降雨汇流示意图" loading="lazy"></button><div><h3>雨落下之后，水往哪里去？</h3><p>原稿以集雨面积 0.5 km²、月降雨量 740.5 mm 相乘，得到约 37 万 m³ 的降雨体积。</p><p>这个乘积是落在汇水区域的降雨总体积；实际汇流、入渗与留存水量还取决于产流系数、地形和排水条件，不能直接视为全部进入路基的水量。</p><p>降雨如何转化为孔压需要渗流分析；本网站不把降雨量直接映射为实际失稳时间。</p></div></div>`;
}
$$('[data-evidence]').forEach(b=>b.addEventListener('click',()=>evidence(b.dataset.evidence)));
document.addEventListener('click',e=>{if(e.target.closest('[data-photo-load]'))openPhoto('image9.jpeg','原稿图6 · 车道荷载计算简图');});
let paperLoaded=false;
$('#read-paper').addEventListener('click',async()=>{
 $('#reader-dialog').showModal();if(paperLoaded)return;$('#reader-content').textContent='正在读取原论文…';
 try{const response=await fetch('assets/paper-content.json');if(!response.ok)throw Error('load');const data=await response.json(),container=$('#reader-content');container.replaceChildren();
 const note=document.createElement('p');note.className='reader-source-note';note.textContent='以下为原论文正文与图片的在线转录。公式已转为连续文本，复杂分式请以下载的 DOCX 原稿为准。试验表在此展示主要指标，完整数据见原稿。';container.append(note);
 let inTable=false;
 for(const p of data){
  if(p.text==='编号'){inTable=true;const table=document.createElement('div');table.innerHTML=testsTable();container.append(table);continue;}
  if(inTable){if(p.text.startsWith('对两个取土点'))inTable=false;else continue;}
  if(p.text){const el=document.createElement(p.text==='用一条安全系数曲线解码梅大高速塌方的秘密'?'h2':/^\d+[、.]\d*、?/.test(p.text)&&p.text.length<40?'h3':'p');el.textContent=p.text;container.append(el);}
  for(const src of p.images){const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');const filename=src.split('/').pop().replace('.emf','.jpg');image.src='assets/'+filename;image.alt='原论文插图 '+filename;image.loading='lazy';caption.textContent='原论文插图 · 点击查看原图';figure.append(image,caption);figure.style.cursor='zoom-in';figure.addEventListener('click',()=>openPhoto(filename,'原论文插图'));container.append(figure);}
 }paperLoaded=true;
 }catch{$('#reader-content').innerHTML='<p>在线正文暂时无法读取。你仍可下载完整原论文。</p><a class="button primary" href="assets/paper-original.docx" download>下载原论文 ↓</a>';}
});
const publicUrl='https://guitu-mechanics-guo.famousberry64.chatgpt.site';
$('#share-site').addEventListener('click',()=>{$('#qr-code').innerHTML='<img src="assets/site-qr.png" alt="归途之下公开网站二维码">';$('#share-url').textContent=publicUrl;$('#share-dialog').showModal();});
$('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(publicUrl);$('#share-status').textContent='链接已复制';}catch{$('#share-status').textContent='请长按上方网址复制';}});
$('#view-default').addEventListener('click',()=>{scenes[0]?.resetView(false);$('#view-section').setAttribute('aria-pressed','false');});
$('#view-section').addEventListener('click',()=>{const b=$('#view-section'),value=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(value));scenes[0]?.resetView(value);});
$('#toggle-forces').addEventListener('click',()=>{const b=$('#toggle-forces'),value=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(value));scenes[0]?.toggleForces(value);toast(value?'受力示意：浅绿为抗滑项，橙色为下滑项，灰白为重力，蓝色为水作用。':'已隐藏受力箭头');});
const mini=document.createElement('div');mini.className='mini-model';mini.innerHTML='<div id="explore-scene" class="mini-scene" role="img" aria-label="与下方工况曲线同步的三维边坡受力示意"><div class="scene-fallback"><p>正在准备交互剖面…</p></div></div><div class="mini-legend"><span>● 抗滑项</span><span>● 下滑项</span><span>● 水作用</span><small>箭头仅示方向与工况差异</small></div>';
$('.curve-panel').insertBefore(mini,$('#stage-chart'));
const modelStage=document.createElement('span');modelStage.id='model-stage';modelStage.textContent='完工状态';$('.model-topline>span:first-child').append(' · ',modelStage);
selectStage(0);evidence('tests');updateLab();
try{const {createScene}=await import('./scene.js');scenes.push(createScene($('#scene')));scenes.push(createScene($('#explore-scene')));scenes[1].toggleForces(true);scenes[1].resetView(true);scenes.forEach(s=>s.setStage(currentStage));window.__sceneReady=true;}
catch(error){console.warn('3D unavailable',error);$$('.scene-fallback p').forEach(p=>p.textContent='当前设备暂不支持三维渲染，下方图表与计算器仍可使用。');$('#explore-scene').innerHTML='<img src="assets/section-fallback.svg" alt="边坡剖面示意：山体、道路、填方与潜在滑面">';window.__sceneReady=false;}
