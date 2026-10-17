import {renderSoilTable} from './engineering.js?v=20261017-9';
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
const clean=text=>(text||'').replace(/[\u200b-\u200d\ufeff]/g,'').trim();
const dimensions={'image1.jpeg':[717,506],'image2.jpeg':[589,442],'image3.jpg':[1600,1112],'image4.jpeg':[277,208],'image5.jpeg':[614,434],'image6.jpeg':[292,389],'image7.jpeg':[292,389],'image8.jpeg':[1270,898],'image9.jpeg':[658,465],'image10.jpeg':[526,372],'image11.jpeg':[277,208],'image12.jpeg':[277,208]};

export function renderPaper(data,container,onImage){
 container.replaceChildren();
 const outline=element('nav',null,'reader-outline');outline.setAttribute('aria-label','论文目录与图号导航');
 outline.append(element('strong','阅读导航 · 点击跳转'));const sections=element('div',null,'reader-section-links'),figures=element('div',null,'reader-figure-links');outline.append(sections,figures);
 const jump=(parent,label,target,title)=>{const button=element('button',label);button.type='button';if(title)button.title=title;button.addEventListener('click',()=>{target.scrollIntoView({block:'start',behavior:'instant'});target.tabIndex=-1;target.focus({preventScroll:true});});parent.append(button);};
 container.append(outline);let inTable=false,sectionNumber=0;
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
  if(i===0){container.append(element('h2',text,'reader-paper-title'));continue;}
  if(/^[1-6]、/.test(text)){
   const heading=element('h3',text,'reader-section-title');heading.id='paper-section-'+(++sectionNumber);container.append(heading);jump(sections,text,heading);continue;
  }
  if(/^\d+\.\d+、/.test(text)){container.append(element('h4',text,'reader-subsection-title'));continue;}
  let className='';
  if(i===1||i===2)className='reader-author';else if(/^摘要[:：]|^关键词[:：]|^Abstract:|^Keywords:/.test(text))className='reader-abstract';else if(/^\[\d+\]/.test(text))className='reader-reference';else if(text==='参考文献：')className='reader-reference-title';
  container.append(element('p',text,className));
 }
}
