const $=s=>document.querySelector(s);
export function setupInteractionFeedback(){
 const hint=(selector,text)=>{const target=$(selector);if(!target)return;const p=document.createElement('p');p.className='interaction-instruction';p.innerHTML='<b>可交互</b> '+text;target.before(p);};
 hint('.structure-buttons','点选构造名称，在三维模型中辨认对应部位。');
 hint('#stage-chart','点选曲线上的工况点，模型与工况说明同步切换。');
 hint('.evidence-tabs','切换资料类型；点选土样编号可比较数据，宽表可左右滑动，图片可点击放大。');
 hint('#lab .lab-model-pair','点选“当前调整”图中的滑块、界面或受力箭头，查看对应含义。');
 document.querySelectorAll('.scene canvas').forEach(canvas=>canvas.title='拖动旋转模型，滚轮缩放');
 // The scenes load asynchronously; their host keeps the instruction available from the first render.
 document.querySelectorAll('.scene').forEach(scene=>scene.title='拖动旋转模型 · 滚轮缩放');
}
