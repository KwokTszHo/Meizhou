import {renderLandscape,roadPoint,roadCorners,groundHeight,pondPath} from './landscape.js?v=20261018-18';
export {roadPoint,roadCorners};
export const segmentSeconds=3;
export const rainSurface=groundHeight;
const f=n=>Number(n.toFixed(4));
export function carPose(lane,phase){const v=(lane+.5)/4,u=.05+.9*(lane<2?phase:1-phase),p=roadPoint(u,v);return {u,v,a:200,b:-68,c:158,d:0,e:p.x,f:p.y};}
export const causeScene=()=>renderLandscape();
export function createCauseMotion(root,{onMode,onProgress}){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const cars=$$('.cause-car').map((el,i)=>({el,lane:i%4,offset:Math.floor(i/4)/4+(i%4)*.08}));
 const drops=$$('.cause-rain-particle').map((g,i)=>({drop:g.querySelector('path'),splash:g.querySelector('ellipse'),x:+g.dataset.rainX,ground:+g.dataset.rainGround,top:Math.max(2,Math.min(18+(i*31)%55,+g.dataset.rainGround-35)),offset:i/44}));
 const runoff=$$('[data-runoff-route]').map(el=>({el,length:el.getTotalLength()})),seep=$$('[data-seep-route]').map(el=>({el,length:el.getTotalLength()}));
 const beads=$$('.cause-runoff-particle'),seepBeads=$$('.cause-seep-particle');
 let clock=0,elapsed=0,mode=0,wet=.3,targetWet=.52,running=false,last=0,frameId=null,cycle=1;
 function flow(nodes,routes,speed){for(const [i,node]of nodes.entries()){const route=routes[+node.dataset.flow],t=(clock*speed+(+node.dataset.offset))%1,point=route.el.getPointAtLength(route.length*t);node.setAttribute('cx',f(point.x));node.setAttribute('cy',f(point.y));node.style.opacity=String(.25+.7*Math.sin(Math.PI*t));}}
 function render(){
  for(const c of cars){const phase=(clock/7.8+c.offset)%1,p=carPose(c.lane,phase);c.el.style.transform=`translate(${p.e}px,${p.f}px)`;c.el.style.opacity=String(Math.min(1,phase/.045,(1-phase)/.045));}
  for(const d of drops){const phase=(clock/1.05+d.offset)%1,y=d.top+(d.ground-d.top-11)*phase,x=d.x+9*(1-phase);d.drop.style.transform=`translate(${f(x)}px,${f(y)}px)`;d.drop.style.opacity=String(.16+.52*Math.sin(Math.PI*phase));d.splash.style.opacity=phase>.83?String((1-phase)/.17*.45):'0';}
  flow(beads,runoff,.32);flow(seepBeads,seep,.18);$('.cause-wet-zone').style.opacity=String(wet*.75);$('#cause-wetting-front ellipse').setAttribute('rx',f(60+wet*340));$('#cause-wetting-front ellipse').setAttribute('ry',f(25+wet*155));$('.cause-runoff-beads').style.opacity=String(.55+wet*.4);
  $('#cause-pond-water').setAttribute('d',pondPath(wet));
  $('.cause-time-track b').style.transform=`scaleX(${elapsed/segmentSeconds})`;onProgress?.(elapsed);
 }
 function setMode(i,{snap=false}={}){mode=i;elapsed=0;targetWet=[.52,.74,.95][i];if(snap)wet=targetWet;root.dataset.mode=String(i);root.dataset.cycle=String(cycle);render();}
 function stop(){running=false;last=0;if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;}
 function frame(now){if(!running)return;const dt=last?Math.min((now-last)/1000,.08):0;last=now;clock+=dt;elapsed+=dt;wet+=(targetWet-wet)*Math.min(1,dt*2.2);
  if(elapsed>=segmentSeconds){const next=(mode+1)%3;if(next===0){cycle++;wet=.3;}setMode(next);onMode(mode);}
  render();frameId=requestAnimationFrame(frame);
 }
 function setRunning(value){if(value===running)return;if(!value){stop();return;}running=true;last=0;frameId=requestAnimationFrame(frame);}
 root.dataset.cycle=String(cycle);render();return {setMode,setRunning};
}
