import {createAlternativeScene} from './scene-alternative.js?v=20261018-20';
export async function setupSceneManager({hosts,getStage,onStage}){
 let factory=null;try{factory=(await import('./scene.js?v=20261018-20')).createScene;}catch{}
 const state=hosts.map((host,index)=>({host,index,adapter:null,part:'all',forces:index===1,stage:getStage(),view:index===1?'section':'perspective'}));
 const poses=[['perspective','三维总览'],['section','正视剖面'],['top','道路俯视'],['slope','填方侧观察'],['2d','二维剖面']];
 function paint(item){item.toolbar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneView===(item.host.dataset.renderer==='svg'?'2d':item.view))));}
 function mount(item,mode){item.adapter?.dispose?.();item.host.querySelectorAll('canvas,.scene-fallback,.model-selection-tag').forEach(e=>e.remove());item.host.classList.remove('using-alternative');
  try{if(mode==='2d'||!factory)throw Error('Use alternative');item.adapter=factory(item.host);}catch{item.adapter=createAlternativeScene(item.host,{onStage});}
  item.adapter.setStage(item.stage);item.adapter.toggleForces(item.forces);item.adapter.focusPart(item.part);if(item.host.dataset.renderer==='webgl')item.adapter.setView(item.view,false);paint(item);
 }
 return state.map(item=>{
  const toolbar=document.createElement('div');toolbar.className='scene-view-presets';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','选择模型观察视角');toolbar.innerHTML=poses.map(([key,label])=>`<button type="button" data-scene-view="${key}">${label}</button>`).join('');item.toolbar=toolbar;if(item.index===0)item.host.parentElement.querySelector('.scene-controls').after(toolbar);else item.host.after(toolbar);
  toolbar.addEventListener('click',e=>{const b=e.target.closest('[data-scene-view]');if(!b)return;const view=b.dataset.sceneView;if(view==='2d'){mount(item,'2d');return;}item.view=view;if(item.host.dataset.renderer==='svg')mount(item,'webgl');else item.adapter.setView(view);paint(item);});
  item.host.addEventListener('scene-unavailable',()=>mount(item,'2d'));
  const api={setStage(stage){item.stage=stage;item.adapter?.setStage(stage);},focusPart(part){item.part=part;item.adapter?.focusPart(part);},toggleForces(value){item.forces=value;item.adapter?.toggleForces(value);},resetView(section=false){item.view=section?'section':'perspective';item.adapter?.setView(item.view);paint(item);},get renderer(){return item.adapter?.renderer;}};
  mount(item,'webgl');return api;
 });
}
