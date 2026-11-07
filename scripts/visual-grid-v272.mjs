import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
const issues=[],measurements=[];
await fs.mkdir('visual-audit-artifacts',{recursive:true});
for(const width of [375,768,1440,1920]){
 for(const theme of ['dark','light']){
  const ctx=await browser.newContext({viewport:{width,height:900}});
  await ctx.addInitScript(v=>localStorage.setItem('guia_theme',v),theme);
  const page=await ctx.newPage();page.on('pageerror',e=>issues.push({width,theme,type:'js',message:e.message}));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle',timeout:60000});
  for(const section of ['sistema','combate','crafting','magia','deuses','roma']){
   await page.locator('[data-page="'+section+'"]').first().evaluate(e=>e.click());
   await page.waitForTimeout(150);
   const metrics=await page.evaluate(()=>{
    const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1};
    const rect=el=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),right:Math.round(r.right),y:Math.round(r.y),bottom:Math.round(r.bottom),width:Math.round(r.width)}};
    const elems=[...document.querySelectorAll('.content :is(.paper-card,.feature,.resource,.ability-card,.money-card,.talent-card,.section-head,.guide-page-hero,.rules-section,.grid>*,.plot-thread)')].filter(visible);
    const clipping=elems.filter(el=>{const r=el.getBoundingClientRect();return r.x< -4||r.right>innerWidth+4}).slice(0,12).map(el=>({className:el.className,rect:rect(el)}));
    const sectionHeads=[...document.querySelectorAll('.content .section-head')].filter(visible).slice(0,8).map(rect);
    const grids=[...document.querySelectorAll('.content :is(.grid.two,.grid.three,.attr-grid,.resource-grid,.combat-facts)')].filter(visible).slice(0,8).map(el=>({className:el.className,columns:getComputedStyle(el).gridTemplateColumns,rect:rect(el)}));
    const selectors=[...document.querySelectorAll('.content input,.content select,.content button')].filter(visible).slice(0,15).map(rect);
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,clipping,sectionHeads,grids,selectors,content:rect(document.querySelector('.content')),topbar:rect(document.querySelector('.topbar'))};
   });
   if(metrics.scrollWidth>width+3)issues.push({section,width,theme,type:'horizontal-scroll',actual:metrics.scrollWidth});
   if(metrics.clipping.length)issues.push({section,width,theme,type:'offscreen-element',samples:metrics.clipping});
   measurements.push({section,width,theme,...metrics});
   await page.screenshot({path:'visual-audit-artifacts/'+section+'-'+width+'-'+theme+'.png',fullPage:true,animations:'disabled'});
   if(width===375&&theme==='dark'&&section==='sistema' || width===1440&&theme==='dark'&&['sistema','roma'].includes(section)){
    const shot=await page.screenshot({type:'jpeg',quality:35,fullPage:false,animations:'disabled'});
    console.log('GUIDE_VISUAL_THUMB|'+width+'|'+section+'|'+shot.toString('base64'));
   }
  }
  await ctx.close();
 }
}
await browser.close();
await fs.writeFile('visual-audit-artifacts/report.json',JSON.stringify({measurements,issues},null,2));
console.log('GUIDE_AUDIT_SUMMARY',JSON.stringify({screenshots:measurements.length,issues:issues.slice(0,30),issueCount:issues.length}));
if(issues.length)process.exitCode=1;
