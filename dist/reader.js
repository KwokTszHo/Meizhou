import {renderSoilTable} from './engineering.js?v=20261017-10';
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
const clean=text=>(text||'').replace(/[\u200b-\u200d\ufeff]/g,'').trim();
const dimensions={'image1.jpeg':[717,506],'image2.jpeg':[589,442],'image3.jpg':[1600,1112],'image4.jpeg':[277,208],'image5.jpeg':[614,434],'image6.jpeg':[292,389],'image7.jpeg':[292,389],'image8.jpeg':[1270,898],'image9.jpeg':[658,465],'image10.jpeg':[526,372],'image11.jpeg':[277,208],'image12.jpeg':[277,208]};

const equationGroups={32:[32,1],141:[143,2],144:[144,3],156:[156,4],160:[160,5],166:[166,6],167:[167,7],168:[168,8],173:[175,9],180:[180,10],182:[183,11],189:[191,12]};
export function renderPaper(data,container,onImage,math={}){
 container.replaceChildren();
 const outline=element('nav',null,'reader-outline');outline.setAttribute('aria-label','论文目录与图号导航');
 outline.append(element('strong','阅读导航 · 点击跳转'));const sections=element('div',null,'reader-section-links'),figures=element('div',null,'reader-figure-links');outline.append(sections,figures);
 const jump=(parent,label,target,title)=>{const button=element('button',label);button.type='button';if(title)button.title=title;button.addEventListener('click',()=>{target.scrollIntoView({block:'start',behavior:'instant'});target.tabIndex=-1;target.focus({preventScroll:true});});parent.append(button);};
 const equations=element('div',null,'reader-equation-links');equations.setAttribute('aria-label','公式导航');outline.append(equations);
 container.append(outline);
 const key=element('details',null,'reader-symbols');key.append(element('summary','符号速查 · 读懂公式 ＋'));const keyText=element('p');keyText.innerHTML='F<sub>s</sub>：安全系数；W：土体自重；P：车辆荷载；φ：内摩擦角；β：滑面倾角；γ、γ<sub>sat</sub>、γ′：天然、饱和与浮容重。式（9）中的 C<sub>i</sub>、l<sub>i</sub> 在交互模型中分别记作 c、L；tg 与 tan 均表示正切。';key.append(keyText);container.append(key);
 const rich=(node,index)=>{const entry=math[index];if(entry&&entry.text===data[index]?.text)node.innerHTML=entry.html;else node.textContent=clean(data[index]?.text);};
 let inTable=false,sectionNumber=0;
 for(let i=0;i<data.length;i++){
  const p=data[i],text=clean(p.text);
  if(inTable){if(text.startsWith('对两个取土点'))inTable=false;else continue;}
  if(/^表1\s/.test(text)){
   const block=element('section',null,'reader-table');block.append(element('h4',text));
   if(/^Table\s*1/i.test(clean(data[i+1]?.text))){block.append(element('p',clean(data[++i].text),'reader-caption-en'));}
   block.append(element('p','← 左右滑动查看完整试验指标 →','table-scroll-hint'));
   const table=element('div');table.innerHTML=renderSoilTable(true,false);block.append(table);container.append(block);inTable=true;continue;
  }
  if(p.images?.length){
   const caption=clean(data[i+1]?.text),match=caption.match(/^图\s*(\d+)/);const number=match?.[1];
   const figure=element('figure',null,'reader-figure');figure.id='paper-figure-'+(number||i);const grid=element('div',null,'reader-image-grid');if(p.images.length>1)grid.classList.add('has-subfigures');
   p.images.forEach((src,index)=>{const filename=src.split('/').pop().replace(/\.emf$/i,'.jpg'),label=number?`图${number}${p.images.length>1?'（'+String.fromCharCode(97+index)+'）':''}`:'插图';
    const button=element('button',null,'reader-image-button');button.type='button';button.setAttribute('aria-label',label+'，点击放大');
    const image=element('img');image.src='assets/'+filename;image.alt=label+' · '+caption.replace(/^图\s*\d+\s*/,'');image.loading='lazy';if(dimensions[filename]){[image.width,image.height]=dimensions[filename];}button.append(image,element('span',label+' · 点击放大 ↗','reader-image-action'));button.addEventListener('click',()=>onImage(filename,label+' · '+caption.replace(/^图\s*\d+\s*/,'')));grid.append(button);
   });figure.append(grid);
   if(number){const figcaption=element('figcaption');figcaption.append(element('strong',caption));i++;if(/^Fig\./i.test(clean(data[i+1]?.text))){figcaption.append(element('span',clean(data[++i].text),'reader-caption-en'));}figure.append(figcaption);jump(figures,'图'+number,figure,caption);}
   container.append(figure);continue;
  }
  if(!text)continue;
  if(equationGroups[i]){
   const [end,number]=equationGroups[i],block=element('figure',null,'reader-equation');block.id='paper-equation-'+number;
   block.append(element('figcaption','式（'+number+'）'));const lines=element('div',null,'equation-lines');lines.tabIndex=0;lines.setAttribute('role','region');lines.setAttribute('aria-label','式'+number+'，宽公式可左右滑动');
   for(let j=i;j<=end;j++){const line=element('div',null,'equation-line');rich(line,j);line.innerHTML=line.innerHTML.replace(/\s*[（(]\d+[）)]\s*$/,'').trim();
    if(number>=4&&number<=8){line.classList.add('equation-with-caption');for(const node of [...line.childNodes])if(node.nodeType===Node.TEXT_NODE&&/[\u4e00-\u9fff]/.test(node.textContent)){const label=element('span',node.textContent,'equation-prose');node.replaceWith(label);}}
    if(line.textContent.trim())lines.append(line);}
   block.append(lines,element('span','← 左右滑动查看完整公式 →','equation-scroll-hint'));container.append(block);jump(equations,'式'+number,block);i=end;continue;
  }
  if(i===0){container.append(element('h2',text,'reader-paper-title'));continue;}
  if(/^[1-6]、/.test(text)){
   const heading=element('h3',text,'reader-section-title');heading.id='paper-section-'+(++sectionNumber);container.append(heading);jump(sections,text,heading);continue;
  }
  if(/^\d+\.\d+、/.test(text)){container.append(element('h4',text,'reader-subsection-title'));continue;}
  let className='';
  if(i===1||i===2)className='reader-author';else if(/^摘要[:：]|^关键词[:：]|^Abstract:|^Keywords:/.test(text))className='reader-abstract';else if(/^\[\d+\]/.test(text))className='reader-reference';else if(text==='参考文献：')className='reader-reference-title';
  const paragraph=element('p',null,className);rich(paragraph,i);container.append(paragraph);
 }
 const resize=new ResizeObserver(()=>{container.querySelectorAll('.equation-lines').forEach(line=>line.parentElement.classList.toggle('equation-wide',line.scrollWidth>line.clientWidth+1));});resize.observe(container);
}
