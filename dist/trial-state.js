export const inputSpecs={phi:{name:'内摩擦角 φ',unit:'°',min:18,max:40,step:.1},beta:{name:'滑面倾角 β',unit:'°',min:15,max:40,step:.1},load:{name:'车辆荷载 P',unit:'kN',min:0,max:4000,step:.5},cohesion:{name:'黏聚力 c',unit:'kPa',min:0,max:40,step:.05}};
export function validTrial(value){
 if(!value||!Number.isInteger(value.stage)||value.stage<0||value.stage>3||!value.params)return null;
 const params={};for(const [key,s]of Object.entries(inputSpecs)){const n=value.params[key];if(typeof n!=='number'||!Number.isFinite(n)||n<s.min||n>s.max)return null;params[key]=n;}
 if(value.stage>0)params.cohesion=0;if(value.stage===1)params.load=0;
 return {stage:value.stage,params};
}
export function readLocal(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
export function writeLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
