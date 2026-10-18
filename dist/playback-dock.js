import {stages} from './model.js?v=20261017-5';
import {registerFloating} from './navigation.js?v=20261018-21';
export function setupPlaybackDock(){
 const dock=document.createElement('aside');dock.id='global-playback';dock.className='global-playback';dock.hidden=true;dock.setAttribute('aria-label','四工况自动播放控制');
 dock.innerHTML='<div class="global-playback-copy"><span><i aria-hidden="true"></i>四工况正在自动播放</span><strong id="global-playback-case"></strong></div><output id="global-playback-percent" aria-label="本轮自动播放进度">00%</output><button type="button" id="global-playback-pause">暂停 Ⅱ</button><div class="global-playback-track" role="progressbar" aria-label="四工况播放进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i><b style="left:25%"></b><b style="left:50%"></b><b style="left:75%"></b></div><small>页面中的工况与试算条件同步变化 · 手动调参即暂停</small>';
 dock.dataset.floatPosition='top';document.body.append(dock);registerFloating(dock);dock.querySelector('button').addEventListener('click',()=>document.querySelector('#play-stages').click());
 document.addEventListener('stage-playback-change',e=>{dock.hidden=!e.detail.active;document.body.classList.toggle('has-global-playback',e.detail.active);dock.querySelector('#global-playback-case').textContent=`0${e.detail.stage+1} / 04 · ${stages[e.detail.stage].name}`;});
 document.addEventListener('stage-playback-progress',e=>{const {percent,value,stage}=e.detail;dock.querySelector('#global-playback-percent').textContent=String(percent).padStart(2,'0')+'%';dock.querySelector('.global-playback-track>i').style.width=value+'%';const track=dock.querySelector('[role=progressbar]');track.setAttribute('aria-valuenow',String(percent));track.setAttribute('aria-valuetext',`${percent}% · 工况 ${stage+1} / 4`);});
}
