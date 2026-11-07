import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
const pages=['sistema','combate','crafting','magia','deuses','roma'];
const modes=[
  ['small-phone',320,'dark'],['phone',390,'dark'],['wide-phone',430,'dark'],
  ['tablet',768,'dark'],['narrow-desktop',1024,'dark'],
  ['desktop',1440,'dark'],['wide-desktop',1920,'dark'],
  ['small-phone-light',320,'light'],['phone-light',390,'light'],['desktop-light',1440,'light']
];
const browser=await chromium.launch({headless:true});
const failures=[],snapshots=[];
await fs.mkdir('visual-qa-artifacts',{recursive:true});
for(const [mode,width,theme] of modes){
 const context=await browser.newContext({viewport:{width,height:900}});
 await context.addInitScript(v=>localStorage.setItem('guia_theme',v),theme);
 const page=await context.newPage();
 let errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const target of pages){
  await page.goto(BASE+'#page:'+target,{waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForFunction(p=>document.querySelector('.content')?.classList.contains('page-'+p),target,{timeout:20000});
  await page.waitForTimeout(850);
  const a=await page.evaluate(()=>{
    const c=document.querySelector('#content'),r=c.getBoundingClientRect(),head=c.querySelector('.section-head');
    const getRect=e=>e?e.getBoundingClientRect():null;
    const all=[...c.querySelectorAll('.section-head,.section-head h2,.section-head h3,.section .plot-panorama,.plot-panorama>*,.grid>*,.editorial-story,.oct26-gateway,.oct26-figure-grid>*,.paper-card,.feature,.rules-opening h1,.guide-page-hero-copy,.table-wrap')];
    const errors=[], details=[];
    for(const e of all){
      const cs=getComputedStyle(e),rect=getRect(e);
      if(!rect||rect.width<1||cs.display==='none'||cs.visibility==='hidden')continue;
      if(e.closest('.table-wrap')&&e!==e.closest('.table-wrap'))continue;
      if(rect.left < r.left-4||rect.right > r.right+4||rect.right > innerWidth+3){
        errors.push({type:'element-outside',tag:e.tagName,cls:String(e.className).slice(0,90),txt:e.textContent.trim().slice(0,70),left:Math.round(rect.left),right:Math.round(rect.right),contentLeft:Math.round(r.left),contentRight:Math.round(r.right)});
      }
      if(e.classList.contains('section-head')&&rect.width<r.width*.4)errors.push({type:'narrow-section-head'});
    }
    for(const e of c.querySelectorAll('.section-head h2,.section-head h3,.plot-thread h3,.rules-opening h1,.guide-page-hero h2')){
      let h=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect(),cs=getComputedStyle(e);
      if(h.right>p.right+4||h.left<p.left-4)errors.push({type:'heading-overflow',text:e.textContent.trim().slice(0,45),left:h.left,right:h.right,parentL:p.left,parentR:p.right});
      if(!cs.fontFamily.toLowerCase().match(/georgia|times/))errors.push({type:'font-heading',font:cs.fontFamily,text:e.textContent.trim().slice(0,40)});
    }
    const fonts=[...c.querySelectorAll('.section>.section-lead,.section>p,.plot-thread>p')].slice(0,12).map(e=>getComputedStyle(e).fontFamily);
    if(fonts.some(f=>/georgia|times/i.test(f)))errors.push({type:'body-font',fonts});
    const sections=c.querySelectorAll('.section').length;
    return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,contentWidth:Math.round(r.width),contentLeft:Math.round(r.left),contentRight:Math.round(r.right),sections,errorCount:errors.length,errors:errors.slice(0,25),headWidth:Math.round(getRect(head)?.width||0),gridHead:head?getComputedStyle(head).gridTemplateColumns:null};
  });
  if(a.scroll>a.viewport+2)failures.push(mode+'/'+target+': document horizontal overflow '+a.scroll+'/'+a.viewport);
  if(a.errors.length)failures.push(mode+'/'+target+': '+JSON.stringify(a.errors.slice(0,5)));
  if(a.sections<2)failures.push(mode+'/'+target+': missing content sections');
  if(errors.length)failures.push(mode+'/'+target+': JS '+errors.slice(0,2).join(' | '));
  snapshots.push({mode,target,...a});
  console.log(JSON.stringify({mode,target,width:a.viewport,documentW:a.scroll,errors:a.errorCount,head:a.gridHead,sections:a.sections}));
  if(['small-phone','phone','tablet','desktop','phone-light'].includes(mode)&&['roma','sistema','magia','combate'].includes(target)){
    await page.screenshot({path:'visual-qa-artifacts/'+mode+'-'+target+'.png',fullPage:false});
  }
 }
 await context.close();
}
await browser.close();
await fs.writeFile('visual-qa-artifacts/report.json',JSON.stringify({failures,snapshots},null,2));
if(failures.length){console.error('REVIEW NOT PASSED:\n'+failures.slice(0,70).join('\n'));process.exit(1)}
console.log('VISUAL QA PASSED: '+snapshots.length+' cases across pages, widths and themes. No viewport overflow, clipped cards or heading font regression.');
