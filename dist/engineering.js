const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
export const soilSamples=[
 ['ZK1-1',1.71,1.61,2.70,6.3,.678,25.1,26.3,14.6,11.7,-.71,26.1,29.8],
 ['ZK1-2',1.73,1.55,2.70,11.3,.737,41.4,27.2,15.7,11.5,-.38,26.1,29.8],
 ['ZK2-1',1.76,1.64,2.70,7.2,.645,30.2,26.7,16.4,10.3,-.89,31.6,29.3],
 ['ZK2-2',1.77,1.67,2.70,5.7,.612,25.1,26.7,15.9,10.8,-.94,31.6,29.3]
];
const columns=['样本编号','湿密度 / g·cm⁻³','干密度 / g·cm⁻³','土粒比重 Gs','含水率 / %','孔隙比 e','饱和度 / %','液限 / %','塑限 / %','塑性指数','液性指数','快剪黏聚力 / kPa','快剪内摩擦角 / °'];
let selectedSample=0,fullTable=true;
function sampleDescription(){const r=soilSamples[selectedSample];return `<div><p class="eyebrow">所选土样 · ${r[0]}</p><h3>含水、密度与强度，一起认识。</h3><p>湿密度 ${r[1]} g/cm³，含水率 ${r[4]}%，饱和度 ${r[6]}%。直接快剪得到黏聚力 ${r[11]} kPa、内摩擦角 ${r[12]}°。</p><p>湿密度反映单位体积的含水土质量；黏聚力与内摩擦角描述抗剪特性。四组试验取平均，强度参数约为 c = 28.85 kPa、φ = 29.6°。</p><button class="button sample-apply" data-apply-sample>用该样本强度参数试算 ↗</button><small>载入初始工况的 c、φ；其他参数使用基准值。</small></div><div class="sample-bars"><h4>四组快剪结果对比</h4>${soilSamples.map((v,i)=>`<button data-sample="${i}" aria-pressed="${i===selectedSample}"><span>${v[0]}</span><i><b style="width:${v[11]/40*100}%"></b></i><strong>${v[11]} kPa</strong><small>φ ${v[12]}°</small></button>`).join('')}<p>条长表示黏聚力，比例尺为 0—40 kPa。</p></div>`;}
export function renderSoilTable(expanded=true,interactive=false){
 const indices=expanded?columns.map((_,i)=>i):[0,1,4,11,12];
 return `<div class="table-wrap sample-table" tabindex="0" role="region" aria-label="土工试验数据，可左右滚动"><table><caption class="sr-only">四组土工试验指标</caption><thead><tr>${indices.map(i=>`<th scope="col" data-column="${i}">${columns[i]}</th>`).join('')}</tr></thead><tbody>${soilSamples.map((row,index)=>`<tr class="${interactive&&index===selectedSample?'sample-selected':''}">${indices.map(i=>i===0?`<th scope="row">${interactive?`<button data-sample="${index}" aria-pressed="${index===selectedSample}">${row[i]} ↗</button>`:row[i]}</th>`:`<td data-column="${i}">${i===3?row[i].toFixed(2):row[i]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export function renderSamplePanel(){
 return `<div class="sample-toolbar"><span><b class="interaction-hint">点击样本编号</b> 查看指标与强度对比</span><button class="small-button light" data-toggle-table aria-pressed="${fullTable}" aria-expanded="${fullTable}">${fullTable?'收起扩展指标 −':'展开全部试验指标 ＋'}</button></div><p class="table-scroll-hint">← 左右滑动表格，查看全部试验指标 →</p>${renderSoilTable(fullTable,true)}<figure class="test-report" id="test-report"><button type="button" class="photo-open test-report-preview" data-image="soil-test-report-2025.jpg" data-caption="土工试验报告 · 检测日期 2025-05-09 · 样本 ZK1-1、ZK1-2、ZK2-1、ZK2-2"><img src="assets/soil-test-report-2025.jpg" width="1123" height="794" alt="盖章的土工试验报告，载有四组样本的物理性质和直接快剪指标" loading="lazy"><span>点击放大检验报告 ↗</span></button><figcaption><span class="report-tag">试验资料</span><h3>从检验报告，对照试验指标。</h3><p>四组样本编号与上表对应，可对照密度、含水率及直接快剪强度等指标。</p><dl><div><dt>检测日期</dt><dd>2025-05-09</dd></div><div><dt>报告日期</dt><dd>2025-05-11</dd></div><div><dt>测试批号</dt><dd>2025-264</dd></div></dl><button type="button" class="text-link photo-open" data-image="soil-test-report-2025.jpg" data-caption="土工试验报告 · 检测日期 2025-05-09 · 四组样本试验指标">查看报告大图 ↗</button></figcaption></figure><div class="sample-detail" id="sample-detail">${sampleDescription()}</div>`;
}
const parts={
 all:'全部构造：恢复原有山体、填方路基、道路、滑面与排水设施的整体显示。点选其他按钮，可突出对应构造并弱化周边部分。',
 mountain:'原有山体：剖面图展示道路上方的地形。模型将原有山体与填方土体区分，以便理解半挖半填路基及新旧土体的接触关系。',
 fill:'填方路基：剖面图中填土坡脚至路面高约 30 m，边坡坡比 1∶1.5。稳定计算使用截面面积 A = 319 m²，材料强度由土工试验参数表征。',
 slip:'滑动界面：剖面图中的新填土与原地面接触线，是整体滑块的分析边界。模型采用 β = 24.4°、L = 56.8 m；后续工况将该界面的黏聚项取为零。',
 water:'汇水与排水：剖面图标出了路基北侧的积水区域。三维图中的水面和流线帮助解释浸润及渗流；坡脚排水槽为构造示意，不参与安全系数数值修正。',
 load:'道路荷载：剖面图路宽标注为 21000 mm，即 21 m。荷载简图包含集中车道荷载与均布荷载，四工况计算采用 P = 2284.5 kN 或低车流时的 P = 0。',
 wall:'坡脚挡墙：剖面图在坡脚标有混凝土挡土护脚。三维场景补充其位置与形态，用于辨识构造；四工况公式不额外加入挡墙抗力。'
};
export function setupEngineering({onStructure,onSample}){
 function showPart(key){$$('[data-structure]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.structure===key)));$('#structure-detail').textContent=parts[key]||parts.fill;onStructure(key);}
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-structure]');if(button)showPart(button.dataset.structure);
  const drawing=e.target.closest('[data-drawing-part]');if(drawing){$('#drawing-explainer').textContent=parts[drawing.dataset.drawingPart];showPart(drawing.dataset.drawingPart);$$('[data-drawing-part]').forEach(b=>b.setAttribute('aria-pressed',String(b===drawing)));}
  const sample=e.target.closest('#evidence-content [data-sample]');if(sample){selectedSample=+sample.dataset.sample;$('#evidence-content').innerHTML=renderSamplePanel();}
  if(e.target.closest('[data-toggle-table]')){fullTable=!fullTable;$('#evidence-content').innerHTML=renderSamplePanel();}
  if(e.target.closest('[data-apply-sample]')){const row=soilSamples[selectedSample];onSample({id:row[0],cohesion:row[11],phi:row[12]});}
 });
 document.addEventListener('model-part-select',e=>showPart(e.detail));
}
