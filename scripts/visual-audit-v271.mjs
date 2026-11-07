import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const pages=['sistema','combate','crafting','magia','deuses','roma'];
const cases=[{name:'phone',viewport:{width:390,height:844},theme:'dark'},{name:'tablet',viewport:{width:768,height:1024},theme:'dark'},{name:'desktop',viewport:{width:1440,height:900},theme:'dark'},{name:'phone-light',viewport:{width:390,height:844},theme:'light'}];
const out=[];
await fs.mkdir('visual-audit-artifacts',{recursive:true});
for(const t of cases){
  const context=await browser.newContext({viewport:t.viewport});
  await context.addInitScript(theme=>localStorage.setItem('guia_theme',theme),t.theme);
  const tab=await context.newPage();
  let pageErrors=[];
  tab.on('pageerror',e=>pageErrors.push(e.message));
  for(const page of pages){
    await tab.goto(base+'#page:'+page,{waitUntil:'domcontentloaded',timeout:25000});
    await tab.waitForFunction(p=>document.querySelector('#content')?.classList.contains('page-'+p),page,{timeout:15000});
    await tab.waitForTimeout(1100);
    const audit=await tab.evaluate(()=>{
      const box=sel=>{let x=document.querySelector(sel);if(!x)return null;const r=x.getBoundingClientRect();const c=getComputedStyle(x);return {w:Math.round(r.width),l:Math.round(r.left),r:Math.round(r.right),h:Math.round(r.height),display:c.display,grid:c.gridTemplateColumns,overflow:c.overflowX,font:c.fontFamily}};
      const content=document.querySelector('#content'),root=document.documentElement,main=content?.getBoundingClientRect();
      let rows=[];
      for(const e of content.querySelectorAll('*')){
        const c=getComputedStyle(e);
        if(c.display==='none'||c.visibility==='hidden'||c.position==='fixed')continue;
        const r=e.getBoundingClientRect(),p=e.parentElement?.getBoundingClientRect();
        if(!r.width||!r.height)continue;
        const hasText=(e.children.length===0&&e.textContent?.trim().length>0);
        const ownScroll=e.scrollWidth>e.clientWidth+7&&e.clientWidth>0;
        const offPage=r.right>innerWidth+7||r.left < -7;
        const offParent=p && r.right>p.right+7 && e.closest('.section')&&c.position!=='absolute' && c.position!=='sticky';
        if(ownScroll||offPage||offParent){
          if(e.closest('.section-nav')||e.closest('.sidebar')||e.closest('.search-results'))continue;
          rows.push({tag:e.tagName.toLowerCase(),cls:String(e.className||'').slice(0,105),id:e.id,txt:e.textContent?.trim().replace(/\s+/g,' ').slice(0,90),w:Math.round(r.width),scroll:e.scrollWidth,client:e.clientWidth,l:Math.round(r.left),r:Math.round(r.right),parentR:Math.round(p?.right||0),font:c.fontSize,display:c.display,overflow:c.overflowX,flag:[ownScroll?'scroll':'',offPage?'viewport':'',offParent?'parent':''].filter(Boolean).join(',')});
        }
      }
      rows.sort((a,b)=>Math.max(b.scroll-b.client,b.r-innerWidth,b.r-b.parentR)-Math.max(a.scroll-a.client,a.r-innerWidth,a.r-a.parentR));
      const headings=[...content.querySelectorAll('.section h2,.section h3,.rules-opening h1,.plot-thread h3')].slice(0,12).map(e=>({text:e.textContent.trim().slice(0,45),font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,rect:Math.round(e.getBoundingClientRect().width)}));
      return {documentW:root.scrollWidth,viewport:innerWidth,bodyW:document.body.scrollWidth,content:box('#content'),section:box('.section'),sectionHead:box('.section-head'),grid:box('.grid'),plot:box('.plot-panorama'),thread:box('.plot-thread'),heading:box('#trama .section-head h2'),font:box('.section h2'),overflows:rows.slice(0,20),offenders:rows.length,headings};
    });
    const item={mode:t.name,page,...audit,errors:[...pageErrors]};out.push(item);
    console.log(JSON.stringify({mode:t.name,page,documentW:audit.documentW,viewport:audit.viewport,content:audit.content,sectionHead:audit.sectionHead,grid:audit.grid,plot:audit.plot,offenders:audit.offenders,overflows:audit.overflows.slice(0,9)}));
    if(['phone','desktop','phone-light'].includes(t.name)&&['roma','sistema','combate'].includes(page)){
      await tab.screenshot({path:'visual-audit-artifacts/'+t.name+'-'+page+'.png',fullPage:false});
    }
  }
  await context.close();
}
await browser.close();
await fs.writeFile('visual-audit-artifacts/report.json',JSON.stringify(out,null,2));
console.log('AUDIT COMPLETE: '+out.length+' page/viewport combinations');
