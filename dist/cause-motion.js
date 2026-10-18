// One geometry drives the visible road, lane markings, clipping and vehicle poses.
export const roadCorners=[[365,218],[783,218],[710,274],[393,274]];
export const segmentSeconds=3;
export function roadPoint(u,v){return {x:365+28*v+u*(418-101*v),y:218+56*v};}
export function carPose(lane,phase){
 const v=(lane+.5)/4,u=.05+.9*(lane<2?phase:1-phase),p=roadPoint(u,v);
 return {u,v,a:418-101*v,b:0,c:28-101*u,d:56,e:p.x,f:p.y};
}
const surface=[[18,120],[102,146],[185,179],[264,216],[302,239],[332,255],[365,260]];
export function rainSurface(x){
 if(x<=365){for(let i=1;i<surface.length;i++)if(x<=surface[i][0]){const a=surface[i-1],b=surface[i],t=(x-a[0])/(b[0]-a[0]);return a[1]+t*(b[1]-a[1]);}return 260;}
 if(x<=783)return 218;
 return Math.min(416,274+(x-710)/114*142);
}
const f=n=>Number(n.toFixed(4));
const line=(v,cls)=>{const a=roadPoint(.015,v),b=roadPoint(.985,v);return `<path class="${cls}" d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`;};
export function causeScene(){
 const road='M'+roadCorners.map(p=>p.join(' ')).join('L')+'Z';
 const rain=Array.from({length:44},(_,i)=>{const x=28+(i*97)%804,y=rainSurface(x);return `<g class="cause-rain-particle" data-rain-x="${x}" data-rain-ground="${f(y)}"><path class="cause-raindrop" d="M0 0l-2.6 9"/><ellipse class="cause-splash" cx="${x}" cy="${f(y-1)}" rx="4" ry="1.5"/></g>`;}).join('');
 const cars=Array.from({length:16},(_,i)=>`<g class="cause-car ${i>3?'extra-car':''}" data-lane="${i%4}" data-car="${i}" style="opacity:0"><g transform="scale(${i%4<2?1:-1} 1)"><rect class="car-shadow" x="-.037" y="-.076" width=".074" height=".158" rx=".012" fill="#263e37" opacity=".23"/><path d="M-.034-.046Q-.034-.068-.021-.068H.021Q.034-.068.034-.046V.046Q.034.068.021.068H-.021Q-.034.068-.034.046Z" fill="${['#e6dfce','#9bb9b1','#ba986b','#c6d2cd'][i%4]}" stroke="#5b7069" stroke-width=".0015"/><path d="M-.017-.055H.014L.022-.038V.038L.014.055H-.017Z" fill="#596e6c"/><path d="M-.012-.04H.008V.04H-.012Z" fill="${['#d2c9b0','#b5ccc2','#d3b58a','#d9e1da'][i%4]}"/><path d="M.029-.05V-.025M.029.025V.05" stroke="#f6efd1" stroke-width=".006"/><path d="M-.031-.05V-.03M-.031.03V.05" stroke="#9f6555" stroke-width=".004"/></g></g>`).join('');
 const beads=Array.from({length:18},(_,i)=>`<circle class="cause-runoff-particle" r="2.5" fill="#6aabb8" data-flow="${i%3}" data-offset="${i/18}"/>`).join('');
 const seep=Array.from({length:12},(_,i)=>`<circle class="cause-seep-particle" r="2" fill="#73bbce" data-flow="${i%2}" data-offset="${i/12}"/>`).join('');
 return `<svg viewBox="0 0 880 480" class="cause-scene" role="img" aria-label="沿山坡下降的地表径流汇入低洼区，部分雨水下渗，车辆沿双向四车道行驶，后续表现路基中的渗流。"><defs>
 <linearGradient id="cause-sky" x2="0" y2="1"><stop stop-color="#dfe9e4"/><stop offset="1" stop-color="#f4f5eb"/></linearGradient><linearGradient id="cause-fill" x2="0" y2="1"><stop stop-color="#ddc49e"/><stop offset="1" stop-color="#bdad8b"/></linearGradient><linearGradient id="cause-wet" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#76a7ab" stop-opacity=".8"/><stop offset="1" stop-color="#5b919a" stop-opacity=".12"/></linearGradient><pattern id="cause-grain" width="19" height="15" patternUnits="userSpaceOnUse"><path d="M3 6l3 1m9 6 2-1" stroke="#7a725a" stroke-width=".8" opacity=".22"/></pattern><clipPath id="cause-wetting-front"><ellipse cx="404" cy="282" rx="180" ry="80"/></clipPath><clipPath id="cause-road-clip"><path d="${road}"/></clipPath><clipPath id="cause-soil-clip"><path d="M393 274H710L824 416H426Z"/></clipPath><clipPath id="cause-above-ground"><path d="M0 0H880V480L824 416 783 218H365L332 255 302 239 264 216 185 179 102 146 18 120 0 120Z"/></clipPath><marker id="cause-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6Z" fill="context-stroke"/></marker></defs>
 <rect width="880" height="480" fill="url(#cause-sky)"/>
 <path d="M0 138 65 94 141 128 213 108 346 236 367 270H0Z" fill="#c6d3bf"/><path d="M0 120 18 120 102 146 185 179 264 216 302 239 332 255 365 260 393 274 426 416H0Z" fill="#b4c3a6"/><path d="M0 128 102 154 185 187 264 224 302 247 332 263 365 269" fill="none" stroke="#7d9c71" stroke-width="6" stroke-linejoin="round" opacity=".5"/>
 <path d="M0 416H880V480H0Z" fill="#d1d0bb"/><path d="M393 274H710L824 416H426Z" fill="url(#cause-fill)"/><path d="M393 274H710L824 416H426Z" fill="url(#cause-grain)"/><path class="cause-wet-zone" clip-path="url(#cause-wetting-front)" d="M393 274H710L824 416H426Z" fill="url(#cause-wet)"/>
 <g clip-path="url(#cause-soil-clip)" stroke="#a99a78" stroke-width="1" opacity=".35"><path d="M390 314H840M390 355H840M390 394H840"/></g><path class="cause-interface" d="M393 274 411 310 824 416" fill="none" stroke="#b28766" stroke-width="3" stroke-dasharray="8 6"/>
 <path d="M294 242Q325 277 367 247L394 273Q341 300 306 279Z" fill="#9aab90"/><path id="cause-pond-water" class="cause-pond" d="M306 266Q344 279 382 263L394 275Q343 296 309 280Z" fill="#6d9fa7" opacity=".75"/><path class="cause-pond-ripple" d="M319 276Q344 285 375 274" fill="none" stroke="#c7e5e3" stroke-width="1.5"/>
 <g class="cause-runoff" fill="none" stroke="#78a3a5" stroke-width="1.7"><path data-runoff-route d="M46 134Q124 161 185 189T302 245Q316 258 334 273"/><path data-runoff-route d="M135 152Q204 182 263 220T320 263L339 274"/><path data-runoff-route d="M230 195Q273 216 298 236T345 274"/></g><g class="cause-runoff-beads">${beads}</g>
 <g class="cause-infiltration" fill="none" stroke="#618c90" stroke-width="1.8" stroke-dasharray="4 5"><path d="M113 165Q118 181 115 202M220 208Q225 225 222 240M360 280Q373 298 382 320" marker-end="url(#cause-arrow)"/></g>
 <g class="cause-seepage" clip-path="url(#cause-soil-clip)" fill="none" stroke="#5895a1" stroke-width="2.5" stroke-dasharray="8 9"><path data-seep-route d="M379 279Q433 309 533 340T789 403" marker-end="url(#cause-arrow)"/><path data-seep-route d="M383 300Q435 332 535 359T745 412" marker-end="url(#cause-arrow)"/></g><g class="cause-seep-beads" clip-path="url(#cause-soil-clip)">${seep}</g>
 <path class="cause-road-shadow" d="M365 223H783L710 281H393Z" fill="#3d5146" opacity=".18"/><path id="cause-road-surface" d="${road}" fill="#53665d"/>${line(.25,'cause-lane-dash')}${line(.75,'cause-lane-dash')}${line(.485,'cause-road-median')}${line(.515,'cause-road-median')}${line(.02,'cause-road-edge')}${line(.98,'cause-road-edge')}<g class="cause-vehicles" clip-path="url(#cause-road-clip)">${cars}</g>
 <g class="cause-load-arrows" fill="none" stroke="#a88848" stroke-width="2.5"><path d="M476 185V213M564 185V213M651 185V213" marker-end="url(#cause-arrow)"/></g><g class="cause-force-arrows" fill="none" stroke-width="3.5"><path d="M596 335 539 317" stroke="#43816d" marker-end="url(#cause-arrow)"/><path d="M614 345 721 374" stroke="#b16b4e" marker-end="url(#cause-arrow)"/></g>
 <g class="cause-scene-labels"><text x="60" y="240">坡面产流</text><text x="125" y="255">部分入渗</text><text x="258" y="326" fill="#527d84">低洼区汇水</text><path d="M328 312 343 289" stroke="#799996"/><text x="538" y="302">填方路基</text><text x="487" y="456">新旧土体接触界面</text><path d="M576 438 587 358" stroke="#a3916f"/><text x="577" y="160" class="cause-traffic-label">假日车流增加 · 双向四车道</text><text x="461" y="394" class="cause-water-label">路基内渗流</text><text x="731" y="365" class="cause-force-label">T</text><text x="511" y="309" class="cause-force-label">R</text></g>
 <g class="cause-cloud" fill="#c4d3cb"><path d="M53 63q-7-21 18-25 18-28 43-12 24-10 39 14 26-2 33 23Z"/><path d="M216 48q-5-17 16-21 17-22 41-5 21-4 31 12 24-2 29 14Z"/><path d="M444 57q-5-17 19-19 17-22 40-6 23-8 36 12 23-2 29 13Z"/></g>
 <g clip-path="url(#cause-above-ground)" class="cause-rain" fill="none" stroke="#82aab6" stroke-width="1.8" stroke-linecap="round">${rain}</g><text x="20" y="463" class="cause-scene-note">过程示意 · 地形与车道采用简化投影</text></svg>`;
}
export function createCauseMotion(root,{onMode,onProgress}){
 const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const cars=$$('.cause-car').map((el,i)=>({el,lane:i%4,offset:Math.floor(i/4)/4+(i%4)*.08}));
 const drops=$$('.cause-rain-particle').map((g,i)=>({drop:g.querySelector('path'),splash:g.querySelector('ellipse'),x:+g.dataset.rainX,ground:+g.dataset.rainGround,top:18+(i*31)%55,offset:i/44}));
 const runoff=$$('[data-runoff-route]').map(el=>({el,length:el.getTotalLength()})),seep=$$('[data-seep-route]').map(el=>({el,length:el.getTotalLength()}));
 const beads=$$('.cause-runoff-particle'),seepBeads=$$('.cause-seep-particle');
 let clock=0,elapsed=0,mode=0,wet=.3,targetWet=.52,running=false,last=0,frameId=null,cycle=1;
 function flow(nodes,routes,speed){for(const [i,node]of nodes.entries()){const route=routes[+node.dataset.flow],t=(clock*speed+(+node.dataset.offset))%1,point=route.el.getPointAtLength(route.length*t);node.setAttribute('cx',f(point.x));node.setAttribute('cy',f(point.y));node.style.opacity=String(.25+.7*Math.sin(Math.PI*t));}}
 function render(){
  for(const c of cars){const phase=(clock/7.8+c.offset)%1,p=carPose(c.lane,phase);c.el.style.transform=`matrix(${p.a},0,${p.c},${p.d},${p.e},${p.f})`;c.el.style.opacity=String(Math.min(1,phase/.045,(1-phase)/.045));}
  for(const d of drops){const phase=(clock/1.05+d.offset)%1,y=d.top+(d.ground-d.top-11)*phase,x=d.x+9*(1-phase);d.drop.style.transform=`translate(${f(x)}px,${f(y)}px)`;d.drop.style.opacity=String(.16+.52*Math.sin(Math.PI*phase));d.splash.style.opacity=phase>.83?String((1-phase)/.17*.45):'0';}
  flow(beads,runoff,.32);flow(seepBeads,seep,.18);$('.cause-wet-zone').style.opacity=String(wet*.75);$('#cause-wetting-front ellipse').setAttribute('rx',f(75+wet*460));$('#cause-wetting-front ellipse').setAttribute('ry',f(28+wet*175));$('.cause-runoff-beads').style.opacity=String(.55+wet*.4);
  const y=274-wet*12;$('#cause-pond-water').setAttribute('d',`M306 ${f(y)}Q344 ${f(y+12)} 382 ${f(y-3)}L394 275Q343 296 309 280Z`);
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
