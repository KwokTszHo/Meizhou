import {stages,stabilityState} from './model.js?v=20261017-5';
const $=s=>document.querySelector(s);
const stops=[[.4,[174,58,48]],[.9,[175,74,40]],[1,[173,117,29]],[1.2,[101,124,51]],[1.8,[35,119,80]]];
export function stabilityColor(fs){
 const v=Math.max(stops[0][0],Math.min(stops.at(-1)[0],fs));let right=stops.findIndex(s=>s[0]>=v);if(right<=0)return stops[0][1];const [a,b]=[stops[right-1],stops[right]],t=(v-a[0])/(b[0]-a[0]);return a[1].map((c,i)=>Math.round(c+(b[1][i]-c)*t));
}
export function setupLabFeedback(){
 const banner=document.createElement('aside');banner.id='lab-playback-notice';banner.className='lab-playback-notice';banner.innerHTML='<div><span class="lab-playback-mode" id="lab-playback-mode" role="status">自主试算</span><strong id="lab-playback-title"></strong><p id="lab-playback-help"></p></div><button type="button" id="lab-playback-toggle"></button>';
 $('#lab .lab-grid').before(banner);$('#lab-playback-toggle').addEventListener('click',()=>$('#play-stages').click());
 const legend=document.createElement('p');legend.className='lab-color-guide';legend.innerHTML='<i aria-hidden="true"></i> 参数与结果配色随当前模型的抗滑余量连续变化；Fₛ = 1 为平衡分界。';$('#lab .lab-control-tip').after(legend);
 const inputState=document.createElement('div');inputState.id='lab-input-state';inputState.className='input-safety-state';inputState.innerHTML='<strong></strong><span></span>';$('#lab .select-label').after(inputState);
 const modelState=document.createElement('span');modelState.id='model-safety-state';modelState.className='model-safety-state';$('#lab .adjusted-model header').append(modelState);
 const calculationState=document.createElement('span');calculationState.id='calculation-state';calculationState.className='calculation-safety-state';$('#lab .calculation-heading>div').append(calculationState);
 function playback({active=false,stage=0,reason='initial'}={}){
  banner.dataset.playing=String(active);$('#lab-playback-mode').textContent=active?'正在自动播放':reason==='manual'?'已暂停 · 自主试算':reason==='paused'?'自动播放已暂停':'自主试算';
  $('#lab-playback-title').textContent=active?`跟随四工况演示 · 0${stage+1} / 04 · ${stages[stage].name}`:reason==='manual'?'已停止自动切换，保留你的调整':'当前条件由你控制';
  $('#lab-playback-help').textContent=active?'这里与上方四工况演示同步，每 2 秒切换条件。拖动任一可用滑块或选择工况，将立即暂停自动播放，转为自主试算。':'拖动滑块可独立试算，模型与计算实时响应；重新播放将从初始工况开始。';
  $('#lab-playback-toggle').textContent=active?'暂停，开始自主试算 Ⅱ':'重新播放四工况 ▷';$('#lab-playback-toggle').setAttribute('aria-pressed',String(active));
 }
 document.addEventListener('stage-playback-change',e=>playback(e.detail));playback();
 document.addEventListener('lab-calculated',e=>{const {fs}=e.detail,rgb=stabilityColor(fs),lab=$('#lab'),state=stabilityState(fs);lab.style.setProperty('--stability-color',`rgb(${rgb.join(',')})`);lab.style.setProperty('--stability-rgb',rgb.join(','));lab.dataset.stability=state.level;$('#lab-fs').style.color=`rgb(${rgb.join(',')})`;inputState.querySelector('strong').textContent=state.level==='danger'?'⚠ 危险 · 模型失稳':state.level==='critical'?'! 临界 · 极限平衡':'✓ 模型稳定 · 有抗滑余量';inputState.querySelector('span').textContent=`Fₛ ${fs.toFixed(3)} · ${state.level==='danger'?'R < T，存在滑动趋势':state.level==='critical'?'R = T，达到平衡分界':'R > T，抗滑项大于下滑项'}`;modelState.textContent=state.level==='danger'?'危险 · 抗滑不足':state.level==='critical'?'临界平衡':'模型稳定';calculationState.textContent=`本次试算：${state.level==='danger'?'危险 · 抗滑项不足':state.level==='critical'?'极限平衡':'模型稳定 · 有抗滑余量'}`;});
}
