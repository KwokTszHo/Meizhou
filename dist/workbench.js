import {forceBreakdown,stabilityState,stageParameters} from './model.js?v=20261017-4';
const $=s=>document.querySelector(s),n=v=>v.toLocaleString('zh-CN',{maximumFractionDigits:1}),deg=v=>v*Math.PI/180;
const labels={phi:'内摩擦角 φ',beta:'滑面倾角 β',load:'车辆荷载 P',cohesion:'界面黏聚力 c'};
let context;
const descriptions={
 load:'车辆荷载 P 竖直作用于路面。调整荷载滑块，观察荷载箭头、下滑项 T 与安全系数的变化。低车流工况按 P = 0 计算。',
 weight:'土体自重 W = 容重 × 截面面积。工况改变时，天然、饱和与浮容重分别对应不同的计算土重。',
 beta:'β 是滑动界面的倾角。增大 β，沿坡的下滑分量通常增大。图中滑面随角度旋转，面积与滑面长度保持计算设定。',
 cohesion:'黏聚抗力 C = cL，表现为界面的连接作用。仅初始工况保留黏聚项，其他工况取 c = 0。',
 phi:'φ 表征界面摩擦强度。在相同法向计算项下，φ 增大会增大摩擦抗力 F = N* tanφ。',
 normal:'N* 是公式中的法向计算项；渗流工况按所用表达式乘以 γ′ / γsat。它与摩擦角共同决定摩擦抗力。',
 resistance:'绿色箭头表示总抗滑项 R = 黏聚抗力 C + 摩擦抗力 F。箭头越长，对应的计算抗力越大。',
 driving:'红色箭头表示下滑项 T。绿、红箭头使用相同的绘图尺度，便于直接比较 R 与 T。',
 water:'蓝色流线表示渗流工况。该工况使用浮容重与渗流作用项；流线用于解释机制，不是实测流速。'
};
function pt(x,y){return `${x.toFixed(2)},${y.toFixed(2)}`;}
function diagram(p,r,state,changed,sharedScale){
 const b=deg(p.beta),e={x:Math.cos(b),y:Math.sin(b)},u={x:Math.sin(b),y:-Math.cos(b)},o={x:340,y:235};
 const point=(along,up)=>({x:o.x+e.x*along+u.x*up,y:o.y+e.y*along+u.y*up});
 const polygon=arr=>arr.map(a=>{const q=point(...a);return pt(q.x,q.y);}).join(' ');
 const a=point(-255,0),z=point(255,0),c=point(0,42),k=sharedScale||Math.max(r.resistance,r.driving,r.weight,1),len=v=>Math.max(7,v/k*118);
 const group=(key,body)=>`<g class="lab-part ${key===changed?'part-changed':''}" data-lab-part="${key}" role="button" tabindex="0" aria-label="了解${labels[key]||({weight:'土体自重',normal:'法向计算项',resistance:'抗滑项',driving:'下滑项',water:'渗流作用'})[key]}">${body}</g>`;
 const arrow=(key,start,dx,dy,color,text,tx=0,ty=0)=>{const end={x:start.x+dx,y:start.y+dy};return group(key,`<path d="M${pt(start.x,start.y)} L${pt(end.x,end.y)}" fill="none" stroke="${color}" stroke-width="4" marker-end="url(#lab-${key})"/><text x="${end.x+tx}" y="${end.y+ty}" fill="${color}">${text}</text>`);};
 const markers=[['load','#9f7435'],['weight','#465767'],['normal','#557e9c'],['resistance','#277965'],['driving','#bb4f40']].map(([id,color])=>`<marker id="lab-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10Z" fill="${color}"/></marker>`).join('');
 const bonds=Array.from({length:7},(_,i)=>{const q=point(-78+i*26,-1),d=p.cohesion/40*12;return `<line x1="${q.x-u.x*d}" y1="${q.y-u.y*d}" x2="${q.x+u.x*d}" y2="${q.y+u.y*d}" stroke="#ad9353" stroke-width="3" opacity="${p.cohesion?'.9':'.18'}"/>`;}).join('');
 const water=context.stage===3?group('water',`<path class="model-flow" d="M100 87 Q175 125 200 180 T530 335" fill="none" stroke="#4b9fbc" stroke-width="3" stroke-dasharray="6 6"/><text x="65" y="75" fill="#397d9e">渗流工况</text>`):'';
 const cars=Math.round(p.load/400),carGraphic=Array.from({length:cars},(_,i)=>{const q=point(-75+i*27,91);return `<g class="lab-car-solid" transform="translate(${q.x} ${q.y}) rotate(${p.beta})"><path d="M-10,-4L-7,-7H7L10,-4V1H-10Z" fill="#526c76"/><path d="M-6,-7L-3,-12H4L7,-7Z" fill="#b2c4bf"/><path d="M-3,-11H3L5,-8H-5Z" fill="#49656d"/><path d="M-10,-4H10V-1H-10Z" fill="#7f999b"/><circle cx="-6" cy="1" r="2.3" fill="#2d3935"/><circle cx="6" cy="1" r="2.3" fill="#2d3935"/></g>`;}).join('');
 return `<svg viewBox="0 0 720 410" role="img" aria-label="随参数变化的边坡滑块受力示意" data-beta="${p.beta}" data-r-length="${len(r.resistance)}" data-t-length="${len(r.driving)}"><defs>${markers}<pattern id="lab-dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1" fill="#c5ac82"/></pattern></defs><path d="M0 375H720" stroke="#d9e2dc"/><path d="M${pt(a.x,a.y)} L${pt(z.x,z.y)} L720 410H0Z" fill="#e2dac7"/>${group('beta',`<line x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}" stroke="#b98245" stroke-width="4" stroke-dasharray="9 5"/><path d="M${a.x} ${a.y}h85" stroke="#748177" stroke-dasharray="3 4"/><text x="${a.x+34}" y="${a.y+36}" fill="#986a37">β = ${p.beta.toFixed(1)}°</text>`)}${group('weight',`<polygon points="${polygon([[-95,1],[95,1],[95,80],[-95,80]])}" fill="${state.level==='danger'?'#cfa89a':'#b8cbb6'}" stroke="${state.level==='danger'?'#b76651':'#60836c'}" stroke-width="2"/><polygon points="${polygon([[-95,1],[95,1],[95,80],[-95,80]])}" fill="url(#lab-dots)"/><text x="${c.x-36}" y="${c.y+7}" fill="#304e3e">整体滑块</text>`)}${group('cohesion',bonds)}${group('phi',`<circle cx="75" cy="327" r="23" fill="#e0eadc" stroke="#80a282"/><path d="M75 327h20M75 327l${Math.cos(deg(p.phi))*20} ${-Math.sin(deg(p.phi))*20}" stroke="#527a5a" stroke-width="2"/><text x="108" y="333" fill="#4d7555">φ = ${p.phi.toFixed(1)}° · 摩擦</text>`)}${water}${group('load',carGraphic)}${p.load>0?arrow('load',{x:c.x,y:27},0,Math.max(18,p.load/4000*58),'#9f7435',`P ${n(p.load)} kN`,12,0):'<text x="310" y="40" fill="#83938b">P = 0 · 本工况不计车辆荷载</text>'}${arrow('normal',c,u.x*len(r.normal),u.y*len(r.normal),'#557e9c','N*',12,-5)}${arrow('weight',{x:c.x+4,y:c.y+8},0,len(r.weight),'#465767',`W ${n(r.weight)} kN`,12,18)}${arrow('resistance',point(-12,50),-e.x*len(r.resistance),-e.y*len(r.resistance),'#277965',`R ${n(r.resistance)}`, -65,-12)}${arrow('driving',point(12,50),e.x*len(r.driving),e.y*len(r.driving),'#bb4f40',`T ${n(r.driving)}`,12,10)}<text x="454" y="382" fill="#819187" class="diagram-note">箭头同尺度 · 单位 kN</text></svg>`;
}
export function renderWorkbench(stage,p,result,changed=''){
 const r=forceBreakdown(stage,p),base=forceBreakdown(stage),state=stabilityState(r.fs);context={stage,p,r};
 const bp=stageParameters(stage),scale=Math.max(base.resistance,base.driving,base.weight,r.resistance,r.driving,r.weight,1);
 $('#lab-visual').innerHTML=diagram(p,r,state,changed,scale);
 $('#baseline-visual').innerHTML=diagram(bp,base,stabilityState(base.fs),'',scale).replace(/(id="|url\(#)lab-/g,'$1baseline-').replace(/role="button" tabindex="0"/g,'').replace(/class="lab-part /g,'class="baseline-part ');
 $('#baseline-fs').textContent='Fₛ '+base.fs.toFixed(2);$('#adjusted-fs').textContent='Fₛ '+r.fs.toFixed(Math.abs(r.fs-1)<.005?4:2);
 const delta=(v,b,d=1)=>Math.abs(v-b)<1e-7?'—':(v>b?'+':'−')+Math.abs(v-b).toFixed(d);
 const metric=(label,v,b,unit,d=1)=>`<tr><th scope="row">${label}</th><td>${b.toFixed(d)}${unit}</td><td>${v.toFixed(d)}${unit}</td><td>${delta(v,b,d)}${Math.abs(v-b)<1e-7?'':unit}</td></tr>`;
 const changes=Object.keys(labels).filter(k=>Math.abs(p[k]-bp[k])>1e-7).map(k=>`${labels[k]}由 ${bp[k]} ${k==='load'?'kN':k==='cohesion'?'kPa':'°'} 调至 ${p[k]} ${k==='load'?'kN':k==='cohesion'?'kPa':'°'}`);
 $('#baseline-comparison').innerHTML=`<div class="comparison-summary" role="status"><b>${changes.length?'调整后的变化':'同工况 · 基准对照'}</b><p>${changes.length?changes.join('；')+'。':'两侧采用相同参数。拖动任一可用滑块，观察受力图与下表的变化。'}${changes.length?`Fₛ 从 ${base.fs.toFixed(3)} 变为 ${r.fs.toFixed(3)}；${state.message}`:''}</p></div><div class="table-wrap"><table><caption class="sr-only">同工况调整前后比较</caption><thead><tr><th scope="col">比较项目</th><th scope="col">工况基准</th><th scope="col">当前调整</th><th scope="col">变化量</th></tr></thead><tbody>${metric('安全系数 Fₛ',r.fs,base.fs,'',3)}${metric('抗滑项 R',r.resistance,base.resistance,' kN')}${metric('下滑项 T',r.driving,base.driving,' kN')}<tr><th scope="row">模型状态</th><td>${stabilityState(base.fs).label}</td><td colspan="2" class="comparison-state ${state.level}">${state.label}</td></tr></tbody></table></div>`;
 const warning=$('#lab-warning');warning.className='lab-warning '+state.level;warning.innerHTML=`<span class="warning-icon" aria-hidden="true">${state.level==='danger'?'⚠':state.level==='critical'?'!':'✓'}</span><div><strong>${state.label}</strong><p>${state.message}</p></div>`;
 const margin=state.level==='critical'?0:(r.resistance-r.driving)/r.driving*100;
 $('#force-compare').innerHTML=`<div><span>抗滑项 R</span><i><b style="width:${Math.min(100,r.resistance/Math.max(r.resistance,r.driving)*100)}%"></b></i><strong>${n(r.resistance)} kN</strong></div><div><span>下滑项 T</span><i><b style="width:${Math.min(100,r.driving/Math.max(r.resistance,r.driving)*100)}%"></b></i><strong>${n(r.driving)} kN</strong></div><p>${margin>=0?'抗滑余量':'抗滑缺口'} <b>${Math.abs(margin).toFixed(1)}%</b> <small>相对于下滑项；不是事故概率</small></p>`;
 const is3=stage===3,normalSource=stage===0?'(W + P)':'W',gammaName=stage===0?'γ':is3?'γ′':'γsat';
 const steps=[
  {key:'weight',title:'计算土体自重 W',formula:`${gammaName} × A = ${p.unitWeight.toFixed(1)} × ${p.area}`,v:r.weight,b:base.weight,unit:'kN',deps:[],note:'工况决定容重，截面面积固定。'},
  {key:'normal',title:'计算法向作用项 N*',formula:`${normalSource} cosβ${is3?' × γ′/γsat':''} = ${stage===0?`(${n(r.weight)} + ${n(p.load)})`:n(r.weight)} × cos${p.beta.toFixed(1)}°${is3?' × 0.51':''}`,v:r.normal,b:base.normal,unit:'kN',deps:stage===0?['beta','load']:['beta'],note:is3?'按本工况公式计入渗流作用系数。':'法向计算项参与摩擦抗力计算。'},
  {key:'cohesion',title:'计算黏聚抗力 C',formula:`c × L = ${p.cohesion.toFixed(2)} × ${p.length}`,v:r.cohesion,b:base.cohesion,unit:'kN',deps:stage===0?['cohesion']:[],note:stage===0?'界面黏聚项随 c 改变。':'此工况界面 c = 0。'},
  {key:'friction',title:'计算摩擦抗力 F',formula:`N* tanφ = ${n(r.normal)} × tan${p.phi.toFixed(1)}°`,v:r.friction,b:base.friction,unit:'kN',deps:stage===0?['beta','load','phi']:['beta','phi'],note:'总抗滑项 R = C + F。'},
  {key:'driving',title:'计算下滑项 T',formula:`(W + P) sinβ = (${n(r.weight)} + ${n(p.load)}) × sin${p.beta.toFixed(1)}°`,v:r.driving,b:base.driving,unit:'kN',deps:['beta','load'],note:'重力与计入的荷载沿滑面产生下滑作用。'},
  {key:'fs',title:'比较抗滑与下滑',formula:`Fₛ = (C + F) / T = (${n(r.cohesion)} + ${n(r.friction)}) / ${n(r.driving)}`,v:r.fs,b:base.fs,unit:'',deps:['phi','beta','cohesion','load'],note:state.message}
 ];
 $('#calculation-focus').textContent=labels[changed]?`正在观察：${labels[changed]}`:'四工况基准参数';
 $('#calculation-steps').innerHTML=steps.map((s,i)=>`<li class="calculation-step ${s.deps.includes(changed)?'step-changed':''}" data-step="${s.key}"><span class="step-number">0${i+1}</span><div><h4>${s.title}</h4><p class="step-expression">${s.formula}</p><small>${s.note}</small></div><div class="step-result"><strong>${s.key==='fs'?r.fs.toFixed(3):n(s.v)} <small>${s.unit}</small></strong><span>${Math.abs(s.v-s.b)<.00001?'基准值':`较基准 ${s.v>s.b?'+':'−'}${s.key==='fs'?Math.abs(s.v-s.b).toFixed(3):n(Math.abs(s.v-s.b))}`}</span></div></li>`).join('');
 const traces={phi:`摩擦抗力 F = ${n(r.normal)} × tan${p.phi.toFixed(1)}° = ${n(r.friction)} kN`,beta:`下滑项 T = ${n(r.weight+p.load)} × sin${p.beta.toFixed(1)}° = ${n(r.driving)} kN`,load:stage===1?'本工况 P = 0，忽略车辆荷载。':`P = ${n(p.load)} kN → 下滑项 T = ${n(r.driving)} kN${stage===0?'；同时进入法向项。':'。'}`,cohesion:`黏聚抗力 C = ${p.cohesion.toFixed(2)} × ${p.length} = ${n(r.cohesion)} kN`};
 for(const [key,text]of Object.entries(traces)){const trace=$('#trace-'+key);trace.textContent=text;trace.classList.toggle('trace-changed',changed===key);}
 if(changed&&descriptions[changed])$('#lab-part-explainer').textContent=descriptions[changed];
}
export function setupWorkbench(){
 const host=$('#lab-visual');
 const pair=document.createElement('div');pair.className='lab-model-pair';host.before(pair);pair.innerHTML='<article><header><span>工况基准 · 固定参照</span><b id="baseline-fs"></b></header><div id="baseline-visual" class="lab-visual"></div></article><article class="adjusted-model"><header><span>当前调整 · 可点选</span><b id="adjusted-fs"></b></header></article>';pair.lastElementChild.append(host);
 const compare=document.createElement('div');compare.id='baseline-comparison';$('#lab-part-explainer').after(compare);
 $('.lab-visual-heading').innerHTML='<span>基准与调整 · 同尺度受力对照</span><button type="button" class="text-link" id="toggle-model-pair" aria-pressed="false">放大当前模型 ↗</button>';
 $('#toggle-model-pair').addEventListener('click',e=>{const expanded=pair.classList.toggle('current-only');e.currentTarget.setAttribute('aria-pressed',String(expanded));e.currentTarget.textContent=expanded?'恢复并排对照 ↔':'放大当前模型 ↗';});
 const warning=$('#lab-warning');warning.parentElement.prepend(warning);
 for(const key of Object.keys(labels)){const trace=document.createElement('div');trace.id='trace-'+key;trace.className='parameter-trace';$('#'+key).closest('label').append(trace);}
 const explain=e=>{const part=e.target.closest('[data-lab-part]');if(part)$('#lab-part-explainer').textContent=descriptions[part.dataset.labPart];};
 host.addEventListener('pointerover',explain);host.addEventListener('focusin',explain);host.addEventListener('click',e=>{explain(e);const key=e.target.closest('[data-lab-part]')?.dataset.labPart;const input=key&&$('#'+key);if(input&&!input.disabled)input.focus({preventScroll:true});});
 host.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.closest('[data-lab-part]')?.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
}
