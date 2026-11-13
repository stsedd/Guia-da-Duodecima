import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await fs.mkdir('map-debug-artifacts',{recursive:true});
let events=[];
page.on('frameattached',frame=>events.push('frame-attached '+frame.url().slice(0,95)));
page.on('framedetached',frame=>events.push('frame-detached '+frame.url().slice(0,95)));
page.on('framenavigated',frame=>{if(frame!==page.mainFrame())events.push('frame-nav '+frame.url().slice(0,130))});
page.on('requestfailed',req=>{if(/openstreetmap|tile|mapnik/i.test(req.url())&&events.length<100)events.push('FAIL '+req.failure()?.errorText+' '+req.url().slice(0,120))});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
await page.locator('[data-page="roma"]').first().evaluate(el=>el.click());
await page.waitForSelector('.duo-map-grid',{timeout:15000});
await page.evaluate(()=>{
 window.__mapChanges=[];
 const root=document.querySelector('#content');
 const observer=new MutationObserver(muts=>{
  for(const m of muts){
   for(const node of m.addedNodes)if(node.nodeType===1&&(node.matches?.('iframe')||node.querySelector?.('iframe')))window.__mapChanges.push(['added',Date.now(),node.outerHTML.slice(0,110)]);
   for(const node of m.removedNodes)if(node.nodeType===1&&(node.matches?.('iframe')||node.querySelector?.('iframe')))window.__mapChanges.push(['removed',Date.now(),node.outerHTML.slice(0,110)]);
  }
 });
 observer.observe(root,{subtree:true,childList:true});
});
for(const t of [0,3000,6000,10000]){
 if(t)await page.waitForTimeout(t===10000?4000:3000);
 const parent=await page.evaluate(()=>({
  href:location.hash,
  iframeCount:document.querySelectorAll('.duo-map-grid iframe').length,
  iframeSrc:document.querySelector('.duo-map-grid iframe')?.src,
  container:document.querySelector('.duo-map-grid .oct26-map-embed')?.getBoundingClientRect().toJSON(),
  frame:document.querySelector('.duo-map-grid iframe')?.getBoundingClientRect().toJSON(),
  changeCount:(window.__mapChanges||[]).length,changes:(window.__mapChanges||[]).slice(-5)
 }));
 let child={url:'',body:'',imageCount:-1,loaded:-1,containerSize:''};
 try{
   const frame=page.frameLocator('.duo-map-grid iframe');
   child.body=(await frame.locator('body').innerText({timeout:2500})).slice(0,180);
   child.imageCount=await frame.locator('img').count();
   child.loaded=await frame.locator('img').evaluateAll(imgs=>imgs.filter(im=>im.naturalWidth>0).length);
   child.containerSize=await frame.locator('#map').evaluate(el=>{const r=el.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)}).catch(()=>'?');
 }catch(e){child.body='ERROR '+e.message.slice(0,90)}
 child.url=page.frames().filter(f=>f!==page.mainFrame()).map(f=>f.url()).join(' | ');
 console.log('CHECK t='+t+' PARENT '+JSON.stringify(parent)+' CHILD '+JSON.stringify(child));
}
await page.evaluate(()=>document.querySelectorAll('.duo-map-grid img').forEach(i=>i.loading='eager'));
await page.locator('.duo-map-grid').scrollIntoViewIfNeeded();
await page.waitForTimeout(8000);
const afterScroll=await page.evaluate(()=>({
  mapRect:document.querySelector('.duo-map-grid')?.getBoundingClientRect().toJSON(),
  narrativeLoaded:[...document.querySelectorAll('.duo-map-grid img')].map(i=>({src:i.getAttribute('src'),loaded:i.naturalWidth>0,complete:i.complete})),
  changes:(window.__mapChanges||[]).length
}));
let inViewFrame={images:0,loaded:0,body:''};
try{
  const f=page.frameLocator('.duo-map-grid iframe');
  inViewFrame.body=(await f.locator('body').innerText({timeout:5000})).slice(0,220);
  inViewFrame.images=await f.locator('img').count();
  inViewFrame.loaded=await f.locator('img').evaluateAll(ims=>ims.filter(im=>im.naturalWidth>0).length);
}catch(e){inViewFrame.body='ERR: '+e.message.slice(0,150)}
console.log('AFTER SCROLL '+JSON.stringify({afterScroll,inViewFrame}));
console.log('FRAMES '+JSON.stringify(events.slice(-30)));
const count=await page.evaluate(()=>(window.__mapChanges||[]).length);
const tiles=await page.frameLocator('.duo-map-grid iframe').locator('img').count().catch(()=>0);
console.log('FINAL MAP DOM_CHANGES='+count+' TILE_IMAGES='+tiles);
if(count>12||tiles<1){console.error('REPROVADO: mapa instável, recriado ou sem conteúdo.');process.exitCode=1}
await page.locator('.duo-map-grid').screenshot({path:'map-debug-artifacts/site-map.png',timeout:30000});
await browser.close();
