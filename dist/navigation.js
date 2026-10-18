// Keep deliberate reading jumps reversible, including jumps out of a dialog.
const floating=new Set(),opened=new Map();let order=0,watching=false;
function currentDialog(){
 const focused=document.activeElement?.closest('dialog[open]');
 if(focused)return focused;
 return [...document.querySelectorAll('dialog[open]')].sort((a,b)=>(opened.get(b)||0)-(opened.get(a)||0))[0]||null;
}
function place(){const dialog=currentDialog();for(const element of floating){const parent=dialog||document.body;if(element.parentElement!==parent){if(dialog&&element.dataset.floatPosition==='top')parent.prepend(element);else parent.append(element);}element.classList.toggle('in-dialog',Boolean(dialog));}}
export function registerFloating(element){
 floating.add(element);if(!watching){watching=true;new MutationObserver(records=>{for(const r of records)if(r.target.open)opened.set(r.target,++order);place();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});document.addEventListener('close',place,true);}place();
}
export function setupJumpReturn(){
 const back=document.createElement('button');back.id='reading-return';back.type='button';back.className='reading-return';back.hidden=true;document.body.append(back);registerFloating(back);
 const entries=[];let monitor=0;
 const scripted='#locate-parameter,[data-apply-sample],#step-show-main,#measure-detail,#cause-calculation,#see-model,.reader-outline button,[data-guide-start],#guide-prev,#guide-next,.hero-return-model,#trial-start,#trial-reset,[data-load-slot],#resume-reading,#resume-trial';
 function paint(){back.hidden=!entries.length;document.body.classList.toggle('has-reading-return',Boolean(entries.length));if(entries.length){back.textContent='← 返回跳转前';back.title='返回：'+entries.at(-1).label;back.setAttribute('aria-label','返回跳转前的阅读位置：'+entries.at(-1).label);}place();}
 document.addEventListener('click',event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const source=event.target.closest('a[href],button,[role="button"]');if(!source||source===back||source.disabled)return;
  let anchor=false;if(source.matches('a[href]')){const url=new URL(source.href,location.href);anchor=url.origin===location.origin&&url.pathname===location.pathname&&Boolean(url.hash)&&Boolean(document.getElementById(decodeURIComponent(url.hash.slice(1))));}
  if(!anchor&&!source.matches(scripted))return;
  const dialog=source.closest('dialog[open]'),section=source.closest('.section'),snapshot={top:scrollY,dialog,dialogTop:dialog?.scrollTop||0,hash:location.hash,focus:document.activeElement,label:(section?.querySelector('h2')?.textContent||dialog?.getAttribute('aria-label')||source.textContent||'刚才的位置').replace(/\s+/g,' ').trim().slice(0,42)};
  const token=++monitor,start=performance.now();
  function check(){if(token!==monitor)return;const moved=Math.abs(scrollY-snapshot.top)>28||dialog?.open&&Math.abs(dialog.scrollTop-snapshot.dialogTop)>28;if(moved){entries.push(snapshot);if(entries.length>16)entries.shift();paint();return;}if(performance.now()-start<1500)requestAnimationFrame(check);}
  requestAnimationFrame(check);
 },true);
 back.addEventListener('click',()=>{
  ++monitor;const saved=entries.pop();if(!saved)return;
  for(const dialog of document.querySelectorAll('dialog[open]'))if(dialog!==saved.dialog)dialog.close();
  if(saved.dialog&&!saved.dialog.open)saved.dialog.showModal();
  history.replaceState(null,'',location.pathname+location.search+saved.hash);
  // Native dialog close handlers may restore focus; restore the reading position after them.
  const restore=()=>{window.scrollTo({top:saved.top,behavior:'instant'});if(saved.dialog)saved.dialog.scrollTo({top:saved.dialogTop,behavior:'instant'});if(saved.focus?.isConnected&&!saved.focus.closest('dialog:not([open])'))saved.focus.focus({preventScroll:true});paint();};restore();requestAnimationFrame(restore);
 });
}
