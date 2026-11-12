import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const expected=[
  '01-cerise-cassius.webp',
  '02-celeste-caelus.webp',
  '03-cyrus.webp'
];
const failures=[];
await fs.mkdir('rebentos-artifacts',{recursive:true});

for(const test of [
  {name:'desktop',width:1440,height:1050},
  {name:'mobile',width:390,height:844}
]){
  const context=await browser.newContext({viewport:{width:test.width,height:test.height}});
  const page=await context.newPage();
  page.on('pageerror',e=>failures.push(test.name+': JS '+e.message));
  await page.goto(base+'#page:roma',{waitUntil:'domcontentloaded',timeout:25000});
  try{
    await page.locator('#quadros-rebento .rebento-gallery .rebento-item').first().waitFor({timeout:22000});
    const results=await page.evaluate(async()=>{
      const section=document.querySelector('#quadros-rebento');
      if(!section)return null;
      const entries=[...section.querySelectorAll('.rebento-item')];
      await Promise.all(entries.map(entry=>new Promise(resolve=>{
        const im=entry.querySelector('img');
        if(!im || im.complete){resolve();return}
        im.addEventListener('load',resolve,{once:true});
        im.addEventListener('error',resolve,{once:true});
      })));
      const items=entries.map(entry=>{
        const img=entry.querySelector('img');
        const rect=entry.getBoundingClientRect();
        return {
          img:img?.getAttribute('src')||'',
          loaded:!!img?.naturalWidth,
          width:img?.naturalWidth||0,
          height:img?.naturalHeight||0,
          people:[...entry.querySelectorAll('.rebento-bio h3')].map(x=>x.textContent.trim()),
          descriptions:[...entry.querySelectorAll('.rebento-bio p')].map(x=>x.textContent.trim().length),
          top:rect.top,
          bottom:rect.bottom
        };
      });
      return {items,width:document.documentElement.scrollWidth,viewport:innerWidth,title:section.querySelector('h2')?.textContent,sectionVisible:section.getBoundingClientRect().width>0};
    });
    if(!results){failures.push(test.name+': seção ausente');continue}
    if(results.items.length!==3)failures.push(test.name+': esperados 3 quadros, encontrados '+results.items.length);
    for(let i=0;i<Math.min(results.items.length,3);i++){
      const item=results.items[i];
      if(!item.img.endsWith(expected[i]))failures.push(test.name+': ordem incorreta em '+i+' ('+item.img+')');
      if(!item.loaded)failures.push(test.name+': imagem não carregou em '+i);
      if(item.descriptions.some(x=>x<140))failures.push(test.name+': biografia incompleta em '+i);
      if(i===0&&item.people.length!==2)failures.push(test.name+': biografias de Cerise e Cassius ausentes');
      if(i===1&&item.people.length!==2)failures.push(test.name+': biografias de Celeste e Caelus ausentes');
      if(i===2&&item.people.length!==1)failures.push(test.name+': biografia de Cyrus ausente');
    }
    if(results.width>results.viewport+2)failures.push(test.name+': overflow horizontal '+results.width+' > '+results.viewport);
    if(results.items.some((x,i)=>i>0&&x.top<results.items[i-1].bottom-2))failures.push(test.name+': quadros sobrepostos');
    await page.locator('#quadros-rebento').screenshot({path:'rebentos-artifacts/'+test.name+'-rebentos.png',timeout:30000});
    console.log(test.name+': '+JSON.stringify(results));
  }catch(e){
    failures.push(test.name+': '+e.message);
  }finally{await context.close()}
}
await browser.close();
if(failures.length){console.error('REPROVADO\n- '+failures.join('\n- '));process.exit(1)}
console.log('APROVADO: três quadros em ordem, imagens carregadas, biografias presentes e sem overflow.');
