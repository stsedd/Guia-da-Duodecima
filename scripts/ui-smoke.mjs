import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
await fs.mkdir('ui-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
const cases=[
  {name:'desktop',viewport:{width:1440,height:1000}},
  {name:'mobile',viewport:{width:390,height:844}}
];

function includesNormalized(text,part){
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return norm(text).includes(norm(part));
}

for(const test of cases){
  const page=await browser.newPage({viewport:test.viewport});
  page.on('pageerror',error=>failures.push(`${test.name}: pageerror ${error.message}`));
  await page.goto(base,{waitUntil:'networkidle',timeout:60000});
  await page.waitForSelector('#content .section',{timeout:30000});
  for(const route of ['sistema','combate','crafting','magia','deuses','roma']){
    await page.goto(`${base}#page:${route}`,{waitUntil:'networkidle',timeout:60000});
    await page.waitForTimeout(350);
    const layout=await page.evaluate(()=>({
      viewport:window.innerWidth,
      scroll:document.documentElement.scrollWidth,
      title:document.querySelector('#pageTitle')?.textContent||'',
      hero:document.querySelector('#content > .guide-page-hero')?.dataset.page||''
    }));
    if(layout.scroll>layout.viewport+2)failures.push(`${test.name}/${route}: overflow horizontal ${layout.scroll}px > ${layout.viewport}px`);
    if(!layout.title)failures.push(`${test.name}/${route}: título de página ausente`);
    if((route==='roma'||route==='magia')&&layout.hero!==route)failures.push(`${test.name}/${route}: hero editorial não foi aplicado`);
    await page.screenshot({path:`ui-artifacts/${test.name}-${route}.png`,fullPage:true});
  }

  await page.goto(`${base}#page:combate`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const combatText=await page.locator('#content').innerText();
  for(const expected of ['2 ações','10 metros','Percepção Passiva','Agarrar','Cobertura','10 + 2 × metros da queda']){
    if(!includesNormalized(combatText,expected))failures.push(`${test.name}: regra de combate ausente: ${expected}`);
  }

  await page.goto(`${base}#page:sistema`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const systemText=await page.locator('#content').innerText();
  for(const expected of ['Rebentos de Roma','dois atributos diferentes','Sucessor de Rebento','+25 Energia','Honesta Missio','Boas Práticas']){
    if(!includesNormalized(systemText,expected))failures.push(`${test.name}: regra de Sistema ausente: ${expected}`);
  }

  await page.goto(`${base}#page:roma`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const romaText=await page.locator('#content').innerText();
  for(const expected of ['Passagem do Tempo','3 meses OFF','Anos de serviço','Bolsa Décimus','250 DN','450 DN']){
    if(!includesNormalized(romaText,expected))failures.push(`${test.name}: regra de Roma ausente: ${expected}`);
  }

  await page.goto(`${base}#page:roma:estrangeiros`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const foreignText=await page.locator('#content').innerText();
  if(!includesNormalized(foreignText,'celtas')||!includesNormalized(foreignText,'estrangeiros'))failures.push(`${test.name}: regra de Celtas como estrangeiros não apareceu`);

  await page.goto(`${base}#page:crafting`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const craftingText=await page.locator('#content').innerText();
  if(!includesNormalized(craftingText,'Bronze Celestial')||!includesNormalized(craftingText,'não causa dano algum a mortais'))failures.push(`${test.name}: regra mortal do Bronze Celestial não apareceu`);
  if(!includesNormalized(craftingText,'Ouro Imperial')||!includesNormalized(craftingText,'8 ou menos'))failures.push(`${test.name}: risco atualizado do Ouro Imperial não apareceu`);
  if(includesNormalized(craftingText,'pó de monstro')&&!includesNormalized(craftingText,'tártaro'))failures.push(`${test.name}: procedência do Pó de Monstro não apareceu`);

  const banners=await page.evaluate(async()=>{
    const names=['banner-rebentos.webp','banner-boas-praticas.webp','banner-bolsa-decimus.webp','banner-tempo-duodecima.webp'];
    const out={};
    for(const name of names){
      const img=[...document.images].find(x=>(x.getAttribute('src')||'').includes(name));
      if(img){try{await img.decode()}catch(_){}out[name]={complete:img.complete,naturalWidth:img.naturalWidth}}
    }
    return out;
  });
  for(const [name,info] of Object.entries(banners))if(!info.complete||!info.naturalWidth)failures.push(`${test.name}: banner não carregou: ${name}`);

  await page.close();
}

await browser.close();
if(failures.length){console.error('❌ Smoke do Guia falhou\n- '+failures.join('\n- '));process.exit(1)}
console.log('✅ Smoke do Guia concluído em desktop e mobile, incluindo Combate, Rebentos, Roma e Crafting.');
