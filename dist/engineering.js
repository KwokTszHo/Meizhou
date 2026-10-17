const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
export const soilSamples=[
 ['ZK1-1',1.71,1.61,2.70,6.3,.678,25.1,26.3,14.6,11.7,-.71,26.1,29.8],
 ['ZK1-2',1.73,1.55,2.70,11.3,.737,41.4,27.2,15.7,11.5,-.38,26.1,29.8],
 ['ZK2-1',1.76,1.64,2.70,7.2,.645,30.2,26.7,16.4,10.3,-.89,31.6,29.3],
 ['ZK2-2',1.77,1.67,2.70,5.7,.612,25.1,26.7,15.9,10.8,-.94,31.6,29.3]
];
const columns=['样本编号','湿密度 / g·cm⁻³','干密度 / g·cm⁻³','土粒比重 Gs','含水率 / %','孔隙比 e','饱和度 / %','液限 / %','塑限 / %','塑性指数','液性指数','快剪黏聚力 / kPa','快剪内摩擦角 / °'];
let selectedSample=0,fullTable=false;
function sampleDescription(){const r=soilSamples[selectedSample];return `<div><p class="eyebrow">所选土样 · ${r[0]}</p><h3>含水、密度与强度，一起认识。</h3><p>湿密度 ${r[1]} g/cm³，含水率 ${r[4]}%，饱和度 ${r[6]}%。直接快剪得到黏聚力 ${r[11]} kPa、内摩擦角 ${r[12]}°。</p><p>湿密度反映单位体积的含水土质量；黏聚力与内摩擦角描述抗剪特性。四组试验取平均，强度参数约为 c = 28.85 kPa、φ = 29.6°。</p><button class="button sample-apply" data-apply-sample>用该样本强度参数试算 ↗</button><small>载入初始工况的 c、φ；其他参数使用基准值。</small></div><div class="sample-bars"><h4>四组快剪结果对比</h4>${soilSamples.map((v,i)=>`<button data-sample="${i}" aria-pressed="${i===selectedSample}"><span>${v[0]}</span><i><b style="width:${v[11]/40*100}%"></b></i><strong>${v[11]} kPa</strong><small>φ ${v[12]}°</small></button>`).join('')}<p>条长表示黏聚力，比例尺为 0—40 kPa。</p></div>`;}
export function renderSamplePanel(){
 const indices=fullTable?columns.map((_,i)=>i):[0,1,4,11,12];
 return `<div class="sample-toolbar"><span>4 组土工试验 · 点选样本查看指标</span><button class="small-button light" data-toggle-table aria-pressed="${fullTable}">${fullTable?'收起扩展指标 −':'展开全部试验指标 ＋'}</button></div><div class="table-wrap sample-table"><table><caption class="sr-only">土工试验指标，支持点选样本</caption><thead><tr>${indices.map(i=>`<th scope="col">${columns[i]}</th>`).join('')}</tr></thead><tbody>${soilSamples.map((row,index)=>`<tr class="${index===selectedSample?'sample-selected':''}">${indices.map(i=>i===0?`<th scope="row"><button data-sample="${index}" aria-pressed="${index===selectedSample}">${row[i]} ↗</button></th>`:`<td>${i===3?row[i].toFixed(2):row[i]}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="sample-detail" id="sample-detail">${sampleDescription()}</div>`;
}
const parts={
 mountain:'原有山体：剖面图展示道路上方的地形。模型将原有山体与填方土体区分，以便理解半挖半填路基及新旧土体的接触关系。',
 fill:'填方路基：剖面图中填土坡脚至路面高约 30 m，边坡坡比 1∶1.5。稳定计算使用截面面积 A = 319 m²，材料强度由土工试验参数表征。',
 slip:'滑动界面：剖面图中的新填土与原地面接触线，是整体滑块的分析边界。模型采用 β = 24.4°、L = 56.8 m；后续工况将该界面的黏聚项取为零。',
 water:'汇水与排水：剖面图标出了路基北侧的积水区域。三维图中的水面和流线帮助解释浸润及渗流；坡脚排水槽为构造示意，不参与安全系数数值修正。',
 load:'道路荷载：剖面图路宽标注为 21000 mm，即 21 m。荷载简图包含集中车道荷载与均布荷载，四工况计算采用 P = 2284.5 kN 或低车流时的 P = 0。',
 wall:'坡脚挡墙：剖面图在坡脚标有混凝土挡土护脚。三维场景补充其位置与形态，用于辨识构造；四工况公式不额外加入挡墙抗力。'
};
const twin={
 observe:{title:'现场数据：数字工程的起点',body:'水利工程常关注位移、渗流渗压和雨水情等观测。连续数据需要对应明确的位置、时间与单位，才能与工程状态关联。',here:'本案例已有：现场影像、地形剖面和四组土工试验。',next:'数字孪生所需的扩展：现场位移、渗压等连续监测及其质量管理。'},
 model:{title:'模型映射：把观测转为可计算的对象',body:'几何模型表达工程形态，机理模型表达物理关系。真实数字孪生还需要使模型状态与对应工程的数据保持同步，并检查计算与实测的符合程度。',here:'网页中的映射：剖面要素 → 滑块、滑面、材料与荷载。',next:'数字孪生所需的扩展：测绘几何、时变边界条件、参数率定与实测对比。'},
 simulate:{title:'计算推演：比较条件改变后的结果',body:'在相同模型框架下改变参数，可以观察受力项和稳定状态如何变化。水利场景可据不同水位、来水或运行条件开展工况比较。',here:'网页中的推演：四个离散工况，以及实验室的参数试算。',next:'本次试算反馈：调整下方实验室参数，即可同步更新受力图与计算结果。'},
 feedback:{title:'分析反馈：让工程观测与模型相互校正',body:'数字孪生的分析结果用于辅助工程管理；通过后续观测检查模型表现，再更新数据与参数。处置措施仍由具备职责和专业能力的工程人员确定。',here:'本网页展示：参数输入 → 受力模型 → 计算与状态解释。',next:'水利应用拓展：将经校核的模型与监测、调度和应急业务结合。'}
};
const forecast=[
 '预报：利用观测与模型估计未来的雨水情、工程响应或运行状态。关键是有时间尺度、输入条件和预测依据。',
 '预警：依据监测与分析识别异常，并按相应指标体系提示风险。这里的模型危险提示只是学习演示，不是现场预警发布。',
 '预演：在数字空间比较不同来水、运行或处置情景，观察可能的响应。本网页的多工况比较可帮助理解这种思路。',
 '预案：针对可能出现的情况形成组织、调度与处置安排，并结合演练和反馈持续完善。它需要工程业务与人员协同。'
];
function showTwin(key){const t=twin[key];$$('[data-twin]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.twin===key)));$('#twin-detail').innerHTML=`<div><h3>${t.title}</h3><p>${t.body}</p></div><div class="twin-application"><p>${t.here}</p><p>${t.next}</p><a class="text-link" href="#lab">进入参数联动实验室 →</a></div>`;}
export function updateTwinReadout(fs,stageName){let node=$('#twin-live-summary');if(!node){node=document.createElement('p');node.id='twin-live-summary';node.className='twin-live-summary';$('#twin-detail').after(node);}node.textContent=`当前参数试算输出：${stageName} · Fₛ = ${fs.toFixed(3)}。随实验室参数同步更新。`;}
export function setupEngineering({onStructure,onSample}){
 function showPart(key){$$('[data-structure]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.structure===key)));$('#structure-detail').textContent=parts[key]||parts.fill;onStructure(key);}
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-structure]');if(button)showPart(button.dataset.structure);
  const drawing=e.target.closest('[data-drawing-part]');if(drawing){$('#drawing-explainer').textContent=parts[drawing.dataset.drawingPart];showPart(drawing.dataset.drawingPart);$$('[data-drawing-part]').forEach(b=>b.setAttribute('aria-pressed',String(b===drawing)));}
  const sample=e.target.closest('#evidence-content [data-sample]');if(sample){selectedSample=+sample.dataset.sample;$('#evidence-content').innerHTML=renderSamplePanel();}
  if(e.target.closest('[data-toggle-table]')){fullTable=!fullTable;$('#evidence-content').innerHTML=renderSamplePanel();}
  if(e.target.closest('[data-apply-sample]')){const row=soilSamples[selectedSample];onSample({id:row[0],cohesion:row[11],phi:row[12]});}
  const t=e.target.closest('[data-twin]');if(t)showTwin(t.dataset.twin);
  const f=e.target.closest('[data-forecast]');if(f){$$('[data-forecast]').forEach(b=>b.setAttribute('aria-pressed',String(b===f)));$('#forecast-detail').textContent=forecast[+f.dataset.forecast];}
 });
 document.addEventListener('model-part-select',e=>showPart(e.detail));
 showTwin('observe');$('#forecast-detail').textContent=forecast[0];
}
