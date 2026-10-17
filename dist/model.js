// Paper equations (9)–(12), evaluated as four discrete conditions.
export const defaults={cohesion:28.85,phi:29.6,beta:24.4,load:2284.5,area:319,length:56.8,gamma:17.4,gammaSat:20,gammaWater:9.8};
export function stageParameters(stage,params={}) {
  const p={...defaults,...params};
  if(stage>0)p.cohesion=0;
  if(stage===1)p.load=0;
  p.unitWeight=stage===0?p.gamma:stage===3?p.gammaSat-p.gammaWater:p.gammaSat;
  return p;
}
export function calculate(stage,params={}) {
  const p={...defaults,...params};
  for(const key of Object.keys(defaults))if(!Number.isFinite(p[key]))throw new TypeError('Invalid parameter: '+key);
  if(p.beta<=0||p.beta>=90||p.phi<0||p.phi>=90||p.area<=0||p.length<=0||p.load<0||p.cohesion<0||p.gammaSat<=p.gammaWater)throw new RangeError('Parameters outside the model domain');
  const rad=Math.PI/180,beta=p.beta*rad,tanPhi=Math.tan(p.phi*rad);
  let resistance,driving,weight;
  if(stage===0){weight=p.gamma*p.area;resistance=p.cohesion*p.length+(weight+p.load)*Math.cos(beta)*tanPhi;driving=(weight+p.load)*Math.sin(beta);}
  else if(stage===1){weight=p.gammaSat*p.area;resistance=weight*Math.cos(beta)*tanPhi;driving=weight*Math.sin(beta);}
  else if(stage===2){weight=p.gammaSat*p.area;resistance=weight*Math.cos(beta)*tanPhi;driving=(weight+p.load)*Math.sin(beta);}
  else if(stage===3){const buoyant=p.gammaSat-p.gammaWater;weight=buoyant*p.area;resistance=weight*(buoyant/p.gammaSat)*Math.cos(beta)*tanPhi;driving=(weight+p.load)*Math.sin(beta);}
  else throw new RangeError('Unknown stage');
  return {fs:resistance/driving,resistance,driving,weight};
}
export const stages=[
 {name:'初始平衡',short:'初始平衡',value:'1.76',tag:'黏聚与摩擦共同抵抗滑动',description:'天然含水条件下，滑面具有黏聚力。土体自重与车辆荷载产生下滑作用，黏聚和摩擦共同提供抗滑力，模型具有较大的抗滑余量。',formula:'Fₛ = [cL + (W₁ + P) cosβ tanφ] / [(W₁ + P) sinβ]',source:'计算式（9）',conditions:'天然湿重 · 保留黏聚项 · 计车辆荷载',note:'滑面黏聚力 c = 28.85 kPa，天然容重 γ = 17.4 kN/m³。',resistanceFormula:'R = cL + (W₁ + P) cosβ tanφ',drivingFormula:'T = (W₁ + P) sinβ',weightFormula:'W₁ = γA = 17.4 × 319 = 5550.6 kN',substitution:'Fₛ = [28.85 × 56.8 + (5550.6 + 2284.5) × cos24.4° × tan29.6°] / [(5550.6 + 2284.5) × sin24.4°] ≈ 1.76'},
 {name:'隐患发展 · 低车流',short:'裂隙形成',value:'1.25',tag:'滑面形成，黏聚项退出',description:'滑动界面形成后，模型将界面黏聚力取为零。土体接近饱和，低车流工况忽略车辆荷载；抗滑作用主要来自摩擦，安全系数约为 1.25。',formula:'Fₛ = tanφ / tanβ',source:'计算式（10）',conditions:'接近饱和 · c = 0 · P = 0',note:'c = 0 表示滑动界面的简化条件；本工况不计车辆荷载。',resistanceFormula:'R = W₂ cosβ tanφ',drivingFormula:'T = W₂ sinβ',weightFormula:'W₂ = γsatA = 20 × 319 = 6380 kN',substitution:'Fₛ = (6380 × cos24.4° × tan29.6°) / (6380 × sin24.4°) = tan29.6° / tan24.4° ≈ 1.25'},
 {name:'隐患发展 · 高车流',short:'荷载增加',value:'0.92',tag:'荷载增加，抗滑余量减少',description:'在已形成滑动界面的条件下，计入 2284.5 kN 的车辆荷载。模型中的下滑项增大，安全系数降至约 0.92，展示荷载叠加对平衡的影响。',formula:'Fₛ = W₂ tanφ / [(W₂ + P) tanβ]',source:'计算式（11）',conditions:'接近饱和 · c = 0 · 计车辆荷载',note:'保持土体与几何参数一致，比较车辆荷载进入下滑项后的变化。',resistanceFormula:'R = W₂ cosβ tanφ',drivingFormula:'T = (W₂ + P) sinβ',weightFormula:'W₂ = γsatA = 20 × 319 = 6380 kN',substitution:'Fₛ = (6380 × tan29.6°) / [(6380 + 2284.5) × tan24.4°] ≈ 0.92'},
 {name:'渗流与荷载叠加',short:'渗流形成',value:'0.38',tag:'水的作用，改变抗滑与下滑的平衡',description:'持续浸润与渗流作用叠加车辆荷载。模型采用浮容重与渗流作用项，安全系数降至约 0.38，呈现水与荷载共同作用下的稳定性变化。',formula:'Fₛ = W₃ γ′ tanφ / [(W₃ + P)(γ′ + γw) tanβ]',source:'计算式（12）',conditions:'浮重 · c = 0 · 渗流作用 · 计车辆荷载',note:'γ′ = γsat − γw = 10.2 kN/m³，渗流作用系数 γ′ / (γ′ + γw) = 0.51。',resistanceFormula:'R = W₃ [γ′ / (γ′ + γw)] cosβ tanφ',drivingFormula:'T = (W₃ + P) sinβ',weightFormula:'W₃ = γ′A = 10.2 × 319 = 3253.8 kN',substitution:'Fₛ = (3253.8 × 10.2 × tan29.6°) / [(3253.8 + 2284.5) × (10.2 + 9.8) × tan24.4°] ≈ 0.38'}
];
