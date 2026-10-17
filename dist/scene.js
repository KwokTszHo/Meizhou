import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {forceBreakdown} from './model.js?v=20261017-4';

export function createScene(host){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x0b1517,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
  host.querySelector('.scene-fallback').remove();
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(36,1,.1,180);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=27;controls.maxDistance=70;controls.minPolarAngle=.18;controls.maxPolarAngle=Math.PI*.48;controls.target.set(0,2,0);
  // One-finger vertical gestures remain available for page scrolling on mobile.
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  renderer.domElement.style.touchAction=matchMedia('(pointer:coarse)').matches?'pan-y':'none';
  scene.add(new THREE.HemisphereLight(0xe8f1d1,0x394d38,2.3));
  const sun=new THREE.DirectionalLight(0xffe0b3,3.5);sun.position.set(-12,28,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.normalBias=.05;scene.add(sun);
  const rim=new THREE.DirectionalLight(0x9bc4b1,2);rim.position.set(8,10,-20);scene.add(rim);
  const world=new THREE.Group();world.rotation.y=-.12;scene.add(world);
  let seed=312;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  const dirtCanvas=document.createElement('canvas');dirtCanvas.width=512;dirtCanvas.height=512;const ctx=dirtCanvas.getContext('2d');ctx.fillStyle='#b09068';ctx.fillRect(0,0,512,512);
  for(let n=0;n<14000;n++){const x=rand()*512,y=rand()*512,v=rand();ctx.fillStyle=v>.7?'rgba(42,32,19,.17)':'rgba(248,225,181,.17)';ctx.fillRect(x,y,rand()*2.2+.5,rand()*1.8+.3);}
  for(let n=0;n<17;n++){ctx.beginPath();let y=n*32;ctx.moveTo(0,y);for(let x=0;x<=512;x+=24)ctx.lineTo(x,y+Math.sin(x*.025+n)*4);ctx.strokeStyle='rgba(59,45,26,.09)';ctx.lineWidth=1;ctx.stroke();}
  const texture=new THREE.CanvasTexture(dirtCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(.08,.12);
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:1,...extra});
  const dirt=mat(0xc3a079,{map:texture}),rock=mat(0x877860,{map:texture}),grass=mat(0x576846),grassTop=mat(0x64734d);
  function prism(points,depth,material,z=-7){const shape=new THREE.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:1});const mesh=new THREE.Mesh(g,material);mesh.position.z=z;mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
  const bed=prism([[-14,-4],[14,-4],[14,-2.8],[-14,-2.8]],14,rock);world.add(bed);
  const hillPoints=[[-14,-2.8],[-14,6.8],[-11,9.7],[-8,10.1],[-5.4,8.7],[-2.1,5.3],[-.6,4.1],[-.6,-2.8]];
  const hill=prism(hillPoints,14,rock);world.add(hill);
  function hillHeight(x,z=0){const points=hillPoints.slice(1,-1);let h=4.1;for(let i=0;i<points.length-1;i++)if(x>=points[i][0]&&x<=points[i+1][0]){const t=(x-points[i][0])/(points[i+1][0]-points[i][0]);h=THREE.MathUtils.lerp(points[i][1],points[i+1][1],t);break;}return h+Math.sin(z*.55)*.3*Math.sin((x+14)/13.4*Math.PI);}
  const groundPositions=[],groundColors=[];
  for(let ix=0;ix<27;ix++)for(let iz=0;iz<20;iz++){
    const a=-14+ix*13.4/27,b=-14+(ix+1)*13.4/27,c=-7+iz*.7,d=c+.7;
    for(const [x,z]of[[a,c],[a,d],[b,d],[a,c],[b,d],[b,c]]){groundPositions.push(x,hillHeight(x,z)+.025,z);const color=new THREE.Color().setHSL(.23+rand()*.015,.17+rand()*.1,.21+rand()*.075);groundColors.push(color.r,color.g,color.b);}
  }
  const groundGeo=new THREE.BufferGeometry();groundGeo.setAttribute('position',new THREE.Float32BufferAttribute(groundPositions,3));groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(groundColors,3));groundGeo.computeVertexNormals();const terrain=new THREE.Mesh(groundGeo,mat(0xffffff,{vertexColors:true,side:THREE.DoubleSide}));terrain.receiveShadow=true;world.add(terrain);
  const fillGroup=new THREE.Group();world.add(fillGroup);
  const fill=prism([[-.6,-2.8],[-.6,4.1],[3,4.1],[13.7,-2.8]],14,dirt);fillGroup.add(fill);
  const slopeShape=prism([[-.6,4.1],[3,4.1],[13.7,-2.8],[13.5,-2.8],[2.95,3.96],[-.6,3.96]],14,grassTop);fillGroup.add(slopeShape);
  // Fine strata on the exposed cut face.
  for(let layer=0;layer<4;layer++){
    const y=-2+layer*1.6;const maxX=3+(4.1-y)/6.9*10.7;
    const pts=[];for(let i=0;i<=30;i++){const x=-.55+(maxX+.55)*i/30;pts.push(new THREE.Vector3(x,y+Math.sin(i*.38+layer)*.045,7.018));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x6b573d,transparent:true,opacity:.32}));fillGroup.add(line);
  }
  const roadMat=mat(0x414a43),roadLine=mat(0xd9cda6);
  const roadway=new THREE.Mesh(new THREE.BoxGeometry(3.8,.16,14.15),roadMat);roadway.position.set(1.05,4.21,0);roadway.receiveShadow=true;world.add(roadway);
  function box(x,y,z,w,h,d,material,parent=world){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  for(let z=-6.6;z<7;z+=1.3){box(1.05,4.305,z,.055,.01,.65,roadLine);}
  box(-.68,4.31,0,.035,.01,14,roadLine);box(2.78,4.31,0,.035,.01,14,roadLine);
  const steel=mat(0x94a78f,{metalness:.4,roughness:.6});
  for(const x of[-.9,3]){box(x,4.59,0,.065,.09,14,steel);for(let z=-6.5;z<=7;z+=1.2)box(x,4.44,z,.05,.4,.05,steel);}
  const cars=new THREE.Group();world.add(cars);for(let i=0;i<7;i++){const x=i%2===0?.1:2;const z=-6+i*1.85;const body=box(x,4.52,z,.52,.28,.9,mat([0xdddcc8,0x8faaa4,0xb89670][i%3]),cars);box(x,4.73,z-.05,.41,.2,.48,mat(0x71877e),cars);}
  const forest=new THREE.Group();world.add(forest);const trunkMat=mat(0x55503b),leafMats=[0x2c4c36,0x3d593c,0x536344,0x354d35].map(c=>mat(c));
  for(let i=0;i<108;i++){
    const x=-13.7+rand()*11.8,z=-6.6+rand()*12.6,y=hillHeight(x,z),s=.48+rand()*.64;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.035*s,.075*s,.9*s,5),trunkMat);trunk.position.set(x,y+.4*s,z);forest.add(trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.56*s,0),leafMats[i%4]);crown.scale.set(1,1.5,1);crown.position.set(x,y+1.05*s,z);crown.rotation.y=rand()*Math.PI;crown.castShadow=true;forest.add(crown);
    if(i%3===0){const cone=new THREE.Mesh(new THREE.ConeGeometry(.43*s,1.4*s,6),leafMats[(i+1)%4]);cone.position.set(x+.12,y+1.25*s,z);forest.add(cone);}
  }
  // An amber dashed line marks the assumed plane, not a searched failure surface.
  const slipPts=[new THREE.Vector3(-.45,3.55,7.07),new THREE.Vector3(13.3,-2.7,7.07)];
  const slipLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints(slipPts),new THREE.LineDashedMaterial({color:0xf1ba7b,dashSize:.38,gapSize:.19,transparent:true,opacity:.85}));slipLine.computeLineDistances();fillGroup.add(slipLine);
  const crack=new THREE.Group();world.add(crack);box(-.12,4.315,0,.09,.02,14.1,mat(0x0a1711),crack);
  const water=new THREE.Group();fillGroup.add(water);const flowCurves=[];
  for(let j=0;j<4;j++){
    const offset=j*.75;const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.4,3.3-offset,7.13),new THREE.Vector3(2.2,2.5-offset,7.13),new THREE.Vector3(5,.8-offset*.6,7.13),new THREE.Vector3(9,-1.5-offset*.2,7.13),new THREE.Vector3(12,-2.4,7.13)]);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)),new THREE.LineBasicMaterial({color:0x75c1c9,transparent:true,opacity:.5}));water.add(line);flowCurves.push(curve);
  }
  const droplets=[];const dropGeo=new THREE.SphereGeometry(.055,5,4),dropMat=new THREE.MeshBasicMaterial({color:0x9ce3e5});for(let j=0;j<24;j++){const mesh=new THREE.Mesh(dropGeo,dropMat);water.add(mesh);droplets.push({mesh,curve:flowCurves[j%4],offset:j/24});}
  const pond=new THREE.Mesh(new THREE.PlaneGeometry(.5,6.5),new THREE.MeshStandardMaterial({color:0x75b8b4,transparent:true,opacity:.65,roughness:.25}));pond.rotation.x=-Math.PI/2;pond.position.set(-1.2,4.35,-.5);world.add(pond);
  const rainArray=new Float32Array(170*3);for(let i=0;i<170;i++){rainArray[i*3]=-12+rand()*25;rainArray[i*3+1]=8+rand()*14;rainArray[i*3+2]=-8+rand()*16;}
  const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainArray,3));const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0x9abcc1,size:.035,transparent:true,opacity:.45}));world.add(rain);
  const arrows=new THREE.Group();world.add(arrows);const center=new THREE.Vector3(4,1.9,7.3);
  const W=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),center,3.9,0xd6d9b2,.45,.24);arrows.add(W);
  const T=new THREE.ArrowHelper(new THREE.Vector3(.91,-.42,0).normalize(),center,4.3,0xdb926a,.45,.24);arrows.add(T);
  const R=new THREE.ArrowHelper(new THREE.Vector3(-.91,.42,0).normalize(),center,4.6,0x9dd5a8,.45,.24);arrows.add(R);
  const U=new THREE.ArrowHelper(new THREE.Vector3(.42,.91,0).normalize(),new THREE.Vector3(5,-.1,7.3),2.8,0x8ad6df,.4,.2);arrows.add(U);arrows.visible=false;
  // Light wireframe base reinforces the section as a physical model.
  const baseEdges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(28,1.2,14)),new THREE.LineBasicMaterial({color:0x9e9875,transparent:true,opacity:.35}));baseEdges.position.set(0,-3.4,0);world.add(baseEdges);
  const grid=new THREE.GridHelper(48,24,0x60816a,0x60816a);grid.material.transparent=true;grid.material.opacity=.10;grid.position.y=-4.25;scene.add(grid);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,50),new THREE.ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-4.16;floor.receiveShadow=true;scene.add(floor);
  // Structural elements identified in the paper section; no extra resisting terms.
  const wall=prism([[12.7,-2.8],[14.1,-2.8],[13.8,-.9],[13.15,-.85]],14,mat(0xaeb5a7));world.add(wall);
  const drainage=new THREE.Group();world.add(drainage);
  const channelMat=mat(0x879d97);
  box(-1.55,4.25,0,.35,.1,14.3,channelMat,drainage);
  box(14,-2.72,0,.36,.12,14.3,channelMat,drainage);
  const dimensions=new THREE.Group();world.add(dimensions);
  function dimension(points){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:0xa5c7b2,transparent:true,opacity:.6}));dimensions.add(line);}
  dimension([[15,-2.8,7.5],[15,4.1,7.5]]);dimension([[14.7,-2.8,7.5],[15.3,-2.8,7.5]]);dimension([[14.7,4.1,7.5],[15.3,4.1,7.5]]);
  dimension([[-.85,4.95,7.5],[3,4.95,7.5]]);
  if(host.id==='scene')for(const [text,pos]of[['填方高约 30 m','15.1,1.1,7.5']]){const el=document.createElement('div');el.className='scene-label';el.dataset.position=pos;el.textContent=text;host.append(el);}
  let stage=0,visible=true,last=0,clock=0;
  const labels=[...host.querySelectorAll('[data-position]')].map(el=>({el,pos:new THREE.Vector3(...el.dataset.position.split(',').map(Number))}));
  function setStage(value){stage=value;crack.visible=value>0;pond.visible=value>0;rain.visible=value>0;water.visible=value===3;cars.visible=value!==1;U.visible=value===3;const r=forceBreakdown(value),scale=5.2/Math.max(r.resistance,r.driving);R.setLength(Math.max(.4,r.resistance*scale),.4,.2);T.setLength(Math.max(.4,r.driving*scale),.4,.2);dirt.color.setHex(value===3?0x9d9e84:0xc3a079);host.dataset.stage=value;}
  function resetView(section=false){controls.target.set(0,2.3,0);camera.position.set(...(section?[0,4,47]:[27,21,31]));controls.update();}
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const ro=new ResizeObserver(resize);ro.observe(host);resetView();resize();setStage(0);
  const observer=new IntersectionObserver(e=>{visible=e[0].isIntersecting;},{rootMargin:'100px'});observer.observe(host);
  function frame(now){requestAnimationFrame(frame);if(!visible||document.hidden||now-last<32)return;const dt=Math.min((now-last)/1000,.05);last=now;clock+=dt;controls.update();
    if(!reduced&&stage>0){for(let i=0;i<170;i++){rainArray[i*3+1]-=dt*5;if(rainArray[i*3+1]<4)rainArray[i*3+1]=18;}rainGeo.attributes.position.needsUpdate=true;}
    if(!reduced&&stage===3)for(const d of droplets)d.mesh.position.copy(d.curve.getPoint((clock*.08+d.offset)%1));
    renderer.render(scene,camera);
    for(const label of labels){const point=label.pos.clone().applyMatrix4(world.matrixWorld).project(camera);label.el.style.transform=`translate(${(point.x*.5+.5)*host.clientWidth}px,${(-point.y*.5+.5)*host.clientHeight}px)`;label.el.style.opacity=Math.abs(point.x)<.95&&Math.abs(point.y)<.95&&point.z<1?'1':'0';}
  }requestAnimationFrame(frame);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.querySelectorAll('.scene-label').forEach(e=>e.style.opacity='0');});
  const parts={mountain:[hill,terrain],fill:[fill,slopeShape],slip:[slipLine],water:[pond,drainage],load:[roadway,cars],wall:[wall]};
  function focusPart(key){host.dataset.selectedPart=key;for(const [name,objects]of Object.entries(parts))for(const object of objects)object.traverse(child=>{if(child.isMesh&&child.material?.emissive)child.material.emissive.setHex(name===key?0x253a22:0x000000);});}
  const ray=new THREE.Raycaster();ray.params.Line.threshold=.18;const pointer=new THREE.Vector2();let hoverObject=null,hoverScale=null,down=null;
  const restoreHover=()=>{if(hoverObject&&hoverScale)hoverObject.scale.copy(hoverScale);hoverObject=null;hoverScale=null;};
  function hit(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(Object.values(parts).flat(),true).filter(h=>{let object=h.object;while(object){if(!object.visible)return false;object=object.parent;}return true;});if(!hits.length)return null;const object=hits[0].object;for(const [key,objects]of Object.entries(parts)){let parent=object;while(parent){if(objects.includes(parent))return {key,object};parent=parent.parent;}}return null;}
  renderer.domElement.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||event.buttons)return;const found=hit(event);if(found?.object!==hoverObject){restoreHover();if(found?.object.isMesh){hoverObject=found.object;hoverScale=hoverObject.scale.clone();hoverObject.scale.multiplyScalar(1.018);}}renderer.domElement.style.cursor=found?'pointer':'grab';});
  renderer.domElement.addEventListener('pointerleave',restoreHover);
  renderer.domElement.addEventListener('pointerdown',event=>{down={x:event.clientX,y:event.clientY};});
  renderer.domElement.addEventListener('pointerup',event=>{if(down&&Math.hypot(event.clientX-down.x,event.clientY-down.y)<6){const found=hit(event);if(found){focusPart(found.key);host.dispatchEvent(new CustomEvent('model-part-select',{detail:found.key,bubbles:true}));}}down=null;});
  return {setStage,resetView,focusPart,toggleForces(value){arrows.visible=value;},renderer};
}
