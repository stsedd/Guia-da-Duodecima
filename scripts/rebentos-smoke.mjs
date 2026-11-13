import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const expected=['01-cerise-cassius.png','02-celeste-caelus.png','03-cyrus.png'];
const names=[['Cerise M. Augustus','Cassius C. Augustus'],['Celeste Cavalcanti','Caelus Severus'],['Cyrus Aurelius']];
const failures=[];
await fs.mkdir('rebentos-artifacts',{recursive:true});

for(const test of [{name:'desktop',width:1440,height:1050},{name:'mobile',width:390,height:844}]){
 const context=await browser.newContext({viewport:{width:test.width,height:test.height}});
 const page=await context.newPage();
 page.on('pageerror',error=>failures.push(test.name+': JS '+error.message));
 try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:25000});
  await page.locator('[data-page="domus"]').first().evaluate(el=>el.click());
  await page.waitForFunction(()=>location.hash==='#page:domus',null,{timeout:10000});
  await page.locator('.page-domus #rebento-cyrus').waitFor({timeout:12000});
  await page.evaluate(()=>document.querySelectorAll('.page-domus .domus-artwork img').forEach(im=>im.loading='eager'));
  await page.waitForFunction(()=>[...document.querySelectorAll('.page-domus .domus-artwork img')].length===3&&[...document.querySelectorAll('.page-domus .domus-artwork img')].every(im=>im.complete),null,{timeout:12000});
  const info=await page.evaluate(()=>{
   const entries=[...document.querySelectorAll('.page-domus .domus-rebento')];
   return {title:document.querySelector('#pageTitle')?.textContent,hash:location.hash,items:entries.map(entry=>{
    const im=entry.querySelector('img'); const rect=entry.getBoundingClientRect();
    return {src:im?.getAttribute('src'),loaded:!!im?.naturalWidth,people:[...entry.querySelectorAll('.domus-biography h3')].map(x=>x.textContent.trim()),paragraphs:[...entry.querySelectorAll('.domus-biography')].map(x=>x.querySelectorAll('p').length),top:rect.top,bottom:rect.bottom};
   }),scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  if(info.items.length!==3)failures.push(test.name+': esperado 3 quadros, encontrados '+info.items.length);
  if(info.title!=='Domus Memoriae')failures.push(test.name+': título incorreto '+info.title);
  for(let i=0;i<Math.min(info.items.length,3);i++){
   const item=info.items[i];
   if(!item.src.endsWith(expected[i]))failures.push(test.name+': imagem incorreta '+i+' '+item.src);
   if(!item.loaded)failures.push(test.name+': imagem não carregada '+i);
   if(item.people.join('|')!==names[i].join('|'))failures.push(test.name+': ordem de nomes incorreta '+i+' '+item.people);
   if(item.paragraphs.some(x=>x<3))failures.push(test.name+': biografia não ampliada '+i);
  }
  if(info.scrollWidth>info.viewport+2)failures.push(test.name+': overflow na Domus '+info.scrollWidth+'/'+info.viewport);
  await page.waitForTimeout(6800);
  await page.evaluate(()=>document.querySelector('#rebento-cerise-cassius')?.scrollIntoView());
  await page.locator('#rebento-cerise-cassius').screenshot({path:'rebentos-artifacts/'+test.name+'-domus-primeiro.png',timeout:25000});
  await page.locator('[data-page="roma"]').first().evaluate(x=>x.click());
  await page.waitForFunction(()=>location.hash==='#page:roma',null,{timeout:10000});
  await page.locator('#domus-memoriae.duo-domus-invite').waitFor({timeout:12000});
  await page.locator('.oct26-current-leadership').first().waitFor({timeout:12000});
  await page.waitForTimeout(1800);
  const roma=await page.evaluate(()=>{
   const cassius=[...document.querySelectorAll('.oct26-official-person')].find(x=>(x.querySelector('h3')?.textContent||'').includes('Cassius'));
   const alessia=[...document.querySelectorAll('.oct26-official-person')].find(x=>(x.querySelector('h3')?.textContent||'').includes('Alessia'));
   const pic=alessia?.querySelector('img');
   if(pic)pic.loading='eager';
   return {
    hasTeaser:!!document.querySelector('#domus-memoriae.duo-domus-invite'),
    href:document.querySelector('.duo-domus-link')?.getAttribute('href'),
    oldGallery:document.querySelectorAll('#quadros-rebento').length,
    oldProfiles:document.querySelectorAll('#domus-memoriae .oct26-profiles').length,
    collective:!!document.querySelector('#memorial-retorno'),
    cassiusImage:cassius?.querySelector('img')?.getAttribute('src'),
    cassiusDescription:cassius?.querySelector('.leader-copy p')?.textContent?.length||0,
    cassiusDetails:cassius?.querySelectorAll('.duo-praetor-details p')?.length||0,
    alessiaImage:pic?.getAttribute('src'),
    scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth
   };
  });
  if(!roma.hasTeaser||roma.href!=='#page:domus')failures.push(test.name+': chamada à Domus ausente');
  if(roma.oldGallery||roma.oldProfiles)failures.push(test.name+': repetição dos quadros em Sobre Roma');
  if(!roma.collective)failures.push(test.name+': desapareceu memória coletiva');
  if(roma.cassiusImage!=='assets/nazzano/cassius.webp')failures.push(test.name+': retrato de Cassius alterado');
  if(roma.cassiusDetails<7||roma.cassiusDescription<160)failures.push(test.name+': descrição do Cassius incompleta');
  if(roma.alessiaImage!=='assets/nazzano/beatrice.webp')failures.push(test.name+': retrato de Alessia incorreto');
  if(roma.scrollWidth>roma.viewport+2)failures.push(test.name+': overflow em Roma');
  await page.locator('#domus-memoriae').screenshot({path:'rebentos-artifacts/'+test.name+'-roma-link.png',timeout:25000});
  console.log(test.name+' Domus '+JSON.stringify(info));
  console.log(test.name+' Roma '+JSON.stringify(roma));
 }catch(error){failures.push(test.name+': '+error.message)}
 finally{await context.close()}
}
await browser.close();
if(failures.length){console.error('REPROVADO\n- '+failures.join('\n- '));process.exit(1)}
console.log('APROVADO: Domus exclusiva, cinco biografias, três imagens, Cassius e Alessia em Roma, links e responsividade.');
