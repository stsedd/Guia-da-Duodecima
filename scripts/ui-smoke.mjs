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
  for(const route of ['sistema','crafting','roma','deuses']){
    await page.goto(`${base}#page:${route}`,{waitUntil:'networkidle',timeout:60000});
    await page.waitForTimeout(250);
    const layout=await page.evaluate(()=>({viewport:window.innerWidth,scroll:document.documentElement.scrollWidth,title:document.querySelector('#pageTitle')?.textContent||''}));
    if(layout.scroll>layout.viewport+2)failures.push(`${test.name}/${route}: overflow horizontal ${layout.scroll}px > ${layout.viewport}px`);
    if(!layout.title)failures.push(`${test.name}/${route}: título de página ausente`);
    await page.screenshot({path:`ui-artifacts/${test.name}-${route}.png`,fullPage:true});
  }

  await page.goto(`${base}#page:roma:estrangeiros`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const foreignText=await page.locator('#content').innerText();
  if(!includesNormalized(foreignText,'celtas')||!includesNormalized(foreignText,'estrangeiros'))failures.push(`${test.name}: regra de Celtas como estrangeiros não apareceu`);

  await page.goto(`${base}#page:crafting`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(300);
  const craftingText=await page.locator('#content').innerText();
  if(includesNormalized(craftingText,'bronze celestial')&&!includesNormalized(craftingText,'não afeta criaturas mortais'))failures.push(`${test.name}: aviso de Bronze Celestial não apareceu`);
  if(includesNormalized(craftingText,'pó de monstro')&&!includesNormalized(craftingText,'tártaro'))failures.push(`${test.name}: procedência do Pó de Monstro não apareceu`);

  await page.close();
}

await browser.close();
if(failures.length){console.error('❌ Smoke do Guia falhou\n- '+failures.join('\n- '));process.exit(1)}
console.log('✅ Smoke do Guia concluído em desktop e mobile.');
