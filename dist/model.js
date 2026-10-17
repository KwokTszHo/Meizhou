// Original paper equations (9), (10), (11), (12). No continuous rainfall model.
export const defaults={cohesion:28.85,phi:29.6,beta:24.4,load:2284.5,area:319,length:56.8,gamma:17.4,gammaSat:20,gammaWater:9.8};
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
 {name:'完工状态',short:'完工',value:'1.76',tag:'黏聚与摩擦共同抵抗滑动',description:'在论文设定的完工工况中，滑面仍具有黏聚力。土体自重与车辆荷载产生下滑作用，黏聚和摩擦共同提供抗滑力。',formula:'Fₛ = [cL + (W₁ + P) cosβ tanφ] / [(W₁ + P) sinβ]',source:'原稿式（9）',conditions:'天然湿重 · 保留黏聚项 · 计车辆荷载',note:'原稿取 c = 28.85 kPa；正文另有 28.9 kPa 的取整值。'},
 {name:'隐患发展 · 低车流',short:'裂隙形成',value:'1.25',tag:'滑面形成，黏聚项退出',description:'原稿将已形成的滑动界面按无黏聚力处理。土体接近饱和、尚未形成渗流，忽略车辆荷载，安全系数降至约 1.25。',formula:'Fₛ = tanφ / tanβ',source:'原稿式（10）',conditions:'接近饱和 · c = 0 · 不计车辆荷载',note:'这是原稿对滑动界面的简化，不表示土样本身没有黏聚力。'},
 {name:'隐患发展 · 高车流',short:'荷载增加',value:'0.92',tag:'在原稿荷载处理下，稳定余量进一步减少',description:'原稿在隐患工况中计入车辆荷载，计算值降至 0.92。这里可比较原稿的荷载效应；其法向力处理仍有待进一步复核。',formula:'Fₛ = W₂ tanφ / [(W₂ + P) tanβ]',source:'原稿式（11）',conditions:'接近饱和 · c = 0 · 计车辆荷载',note:'原式计入了车辆荷载的下滑分量，未同步计入其法向分量；网站忠实复现，暂不修正式。'},
 {name:'渗流与荷载叠加',short:'渗流形成',value:'0.38',tag:'水的作用，改变了抗滑与下滑的平衡',description:'原稿进一步采用浮容重及渗流修正项，得到约 0.38。这个数值展示原模型中的工况差异，不是灾害发生时的实测安全系数。',formula:'Fₛ = W₃ γ′ tanφ / [(W₃ + P)(γ′ + γw) tanβ]',source:'原稿式（12）',conditions:'浮重 · c = 0 · 渗流修正 · 计车辆荷载',note:'浮重、渗透力与车辆荷载的组合需要统一自由体复核。本展厅保留原式供讨论。'}
];
