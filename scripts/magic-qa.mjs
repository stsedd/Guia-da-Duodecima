import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const browser=await chromium.launch({headless:true});
await fs.mkdir('magic-artifacts',{recursive:true});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const ctx=await browser.newContext({viewport:{width,height}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-page="magia"]').first().evaluate(el=>el.click());
  await page.waitForFunction(()=>location.hash==='#page:magia');
  await page.waitForTimeout(1800);
  const state=await page.evaluate(()=>{
    const sec=[...document.querySelectorAll('#content > section.section')].map(s=>({id:s.id,name:s.querySelector('h2')?.innerText,words:s.innerText.length}));
    const rect=x=>{if(!x)return null;const r=x.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,text:x.innerText?.slice(0,120),display:getComputedStyle(x).display,gap:getComputedStyle(x).gap,margin:getComputedStyle(x).margin,padding:getComputedStyle(x).padding}};
    const samples=['.big-formula','#energia-magica','#energia-magica .magic-cost-layout','#energia-magica .magic-cost-table','#energia-magica .magic-side-notes','#alta-magia .high-magic-grid','#alta-magia .high-magic-grid>article'];
    const inspect={};
    for(const selector of samples){const node=document.querySelector(selector);inspect[selector]=node?{self:rect(node),children:[...node.children].slice(0,8).map(rect),outer:node.outerHTML.slice(0,1000)}:null}
    const matches=[...document.querySelectorAll('#content :is(h2,h3,h4)')].filter(x=>/custo|energia/i.test(x.textContent)).map(x=>({text:x.textContent,parentId:x.closest('section')?.id,html:x.parentElement?.outerHTML.slice(0,420)}));
    return {sections:sec,costHeads:matches,inspect,fullScrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  console.log('MAGIC '+name+' '+JSON.stringify(state));
  const circle=await page.evaluate(()=>{
    const node=document.querySelector('#circulos');
    return {text:node?.innerText?.slice(0,4300),html:node?.outerHTML?.slice(0,11500)};
  });
  console.log('CIRCLES '+name+' '+JSON.stringify(circle));
  for(const [label,selector] of [['cost','#energia-magica'],['concentration','#concentracao'],['high','#alta-magia'],['circles','#circulos']]){
    const el=page.locator(selector);
    if(await el.count())await el.screenshot({path:'magic-artifacts/'+name+'-'+label+'.png',timeout:20000});
  }
  console.log('ERRORS '+name+': '+JSON.stringify(errors));
  await ctx.close();
}
await browser.close();
