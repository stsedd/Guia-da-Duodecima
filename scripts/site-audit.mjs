import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
await fs.mkdir('site-audit',{recursive:true});
const views=[{name:'desktop',w:1440,h:1000},{name:'mobile',w:390,h:844}];
const routes=['sistema','combate','crafting','magia','deuses','roma','domus'];
const all=[];

for(const v of views){
 const context=await browser.newContext({viewport:{width:v.w,height:v.h}});
 const page=await context.newPage();
 const failures=[];
 page.on('pageerror',e=>failures.push({kind:'pageerror',msg:String(e.message).slice(0,220)}));
 page.on('requestfailed',r=>failures.push({kind:'requestfailed',url:r.url(),error:r.failure()?.errorText}));
 page.on('response',r=>{if(r.status()>=400)failures.push({kind:'http',status:r.status(),url:r.url()});});
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 for(const route of routes){
  await page.locator('[data-page="'+route+'"]').first().evaluate(el=>el.click());
  try{await page.waitForFunction(r=>location.hash==='#page:'+r,route,{timeout:7000})}catch{}
  await page.waitForTimeout(route==='roma'?4400:route==='domus'?1800:1300);
  await page.evaluate(()=>document.querySelectorAll('#content img').forEach(img=>{img.loading='eager';img.decoding='sync';}));
  await page.waitForTimeout(1300);
  const state=await page.evaluate(()=>{
   const section=document.querySelector('#content');
   const imgs=[...section.querySelectorAll('img')].map(img=>({
    src:img.getAttribute('src'),alt:img.getAttribute('alt'),naturalWidth:img.naturalWidth,complete:img.complete,hidden:img.hidden,
    display:getComputedStyle(img).display,visibility:getComputedStyle(img).visibility,
    cssWidth:Math.round(img.getBoundingClientRect().width),cssHeight:Math.round(img.getBoundingClientRect().height),
    parent:img.parentElement?.className?.toString().slice(0,70)
   }));
   const iframes=[...section.querySelectorAll('iframe')].map(f=>({
    src:f.getAttribute('src'),rect:{w:f.getBoundingClientRect().width,h:f.getBoundingClientRect().height},ancestor:f.parentElement?.className?.toString(),
    visibility:getComputedStyle(f).visibility,display:getComputedStyle(f).display
   }));
   const map=section.querySelector('.duo-map-grid')||section.querySelector('.oct26-real-map');
   return {
    location:location.hash,title:document.querySelector('#pageTitle')?.textContent,
    bodyWidth:document.documentElement.scrollWidth,clientWidth:innerWidth,
    contentLength:section.innerText.length,images:imgs,iframes,
    mapCount:section.querySelectorAll('.oct26-real-map').length,
    mapGridCount:section.querySelectorAll('.duo-map-grid').length,
    mapHTML:map?.outerHTML?.slice(0,1800),
    duplicateIDs:[...section.querySelectorAll('[id]')].map(x=>x.id).filter((x,i,a)=>a.indexOf(x)!==i),
    sectionNames:[...section.querySelectorAll(':scope > .section h2')].map(x=>x.textContent).slice(0,35)
   };
  });
  all.push({viewport:v.name,route,...state});
  if(route==='roma'){
   const target=page.locator('.duo-map-grid').first();
   if(await target.count()){
    try{await target.screenshot({path:'site-audit/'+v.name+'-maps.png',timeout:15000})}catch(e){failures.push({kind:'screenshot',msg:e.message.slice(0,160)})}
   }
   const gw=page.locator('.duo-gateway').first();
   if(await gw.count())try{await gw.screenshot({path:'site-audit/'+v.name+'-gateway.png',timeout:15000})}catch{}
  }
  if(route==='domus'){
   const dom=page.locator('#rebento-cerise-cassius').first();
   if(await dom.count())try{await dom.screenshot({path:'site-audit/'+v.name+'-domus.png',timeout:15000})}catch{}
  }
 }
 all.push({viewport:v.name,failures:failures.slice(0,50)});
 await context.close();
}

const providers=[
 {name:'osm',url:'https://www.openstreetmap.org/export/embed.html?bbox=12.57%2C42.18%2C12.74%2C42.27&layer=mapnik&marker=42.220%2C12.635'},
 {name:'google',url:'https://www.google.com/maps?q=Riserva%20Naturale%20Regionale%20Nazzano%20Tevere-Farfa%2C%20Lazio%2C%20Italia&z=11&output=embed'}
];
for(const provider of providers){
 const context=await browser.newContext({viewport:{width:720,height:600}});
 const page=await context.newPage();
 const errors=[];
 page.on('requestfailed',req=>{if(errors.length<15)errors.push({u:req.url(),e:req.failure()?.errorText})});
 await page.goto(base);
 await page.evaluate(url=>{
  document.body.innerHTML='<iframe id="geo-provider" title="Teste mapa" style="display:block;width:700px;height:500px;border:0" src="'+url+'"></iframe>';
 },provider.url);
 await page.waitForTimeout(7500);
 const f=page.frameLocator('#geo-provider');
 const info={url:page.frames()[1]?.url()||'',bodyText:'',images:0,loadedImages:0};
 try{info.bodyText=(await f.locator('body').innerText({timeout:4000})).slice(0,600)}catch(e){info.bodyText='BLOCKED: '+e.message.slice(0,120)}
 try{info.images=await f.locator('img').count();info.loadedImages=await f.locator('img').evaluateAll(ims=>ims.filter(im=>im.naturalWidth>0).length)}catch{}
 await page.screenshot({path:'site-audit/provider-'+provider.name+'.png'});
 console.log('PROVIDER '+provider.name+' '+JSON.stringify(info)+' REQUEST_ERRORS '+JSON.stringify(errors));
 await context.close();
}
await browser.close();
await fs.writeFile('site-audit/diagnostics.json',JSON.stringify(all,null,2));
for(const x of all){
 if(!x.route){console.log('ERRORS '+x.viewport+' '+JSON.stringify(x.failures));continue}
 console.log('PAGE '+x.viewport+'/'+x.route+' title='+x.title+' overflow='+(x.bodyWidth-x.clientWidth)+' imageCount='+x.images.length+' broken='+JSON.stringify(x.images.filter(img=>img.naturalWidth===0||img.hidden||img.cssWidth===0).map(img=>({src:img.src,hidden:img.hidden,w:img.cssWidth,h:img.cssHeight})))+' iframe='+JSON.stringify(x.iframes)+' mapCount='+x.mapCount+' mapGridCount='+x.mapGridCount+' dupIds='+JSON.stringify(x.duplicateIDs));
}
console.log('Audit completed, full diagnostics and screenshots in site-audit.');
