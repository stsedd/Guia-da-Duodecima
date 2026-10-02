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
      hero:document.querySelector('#content > .guide-page-hero')?.dataset.page||'',
      textLength:(document.querySelector('#content')?.innerText||'').trim().length,
      sections:document.querySelectorAll('#content .section').length
    }));
    if(layout.scroll>layout.viewport+2)failures.push(`${test.name}/${route}: overflow horizontal ${layout.scroll}px > ${layout.viewport}px`);
    if(!layout.title)failures.push(`${test.name}/${route}: título de página ausente`);
    if(layout.textLength<80||layout.sections<1)failures.push(`${test.name}/${route}: conteúdo principal parece vazio`);
    if((route==='roma'||route==='magia')&&layout.hero!==route)failures.push(`${test.name}/${route}: hero editorial não foi aplicado`);
    await page.screenshot({path:`ui-artifacts/${test.name}-${route}.png`,fullPage:true});
  }

  await page.goto(`${base}#page:combate`,{waitUntil:'networkidle',timeout:60000});
  await page.waitForTimeout(500);
  const combatText=await page.locator('#content').innerText({timeout:10000});
  for(const expected of ['2 ações','10 metros','Percepção Passiva','Agarrar','Cobertura','10 + 2 × metros da queda']){
    if(!includesNormalized(combatText,expected))failures.push(`${test.name}: regra de combate ausente: ${expected}`);
  }
  const combatLayout=await page.evaluate(()=>({
    banners:document.querySelectorAll('#content .rules-page-banner,#content .rules-banner').length,
    main:document.querySelectorAll('#content > .rules-page-banner--main').length,
    rolls:[...document.querySelectorAll('#rolagens > .rules-banner')].length,
    turn:[...document.querySelectorAll('#turno > .rules-banner')].length,
    attackDefense:[...document.querySelectorAll('#rolagens > .rules-subfeature.rules-attack-defense > .rules-banner')].length,
    blankCards:[...document.querySelectorAll('#content .paper-card')].filter(card=>(card.innerText||'').trim().length<3).length,
    veryTallCards:[...document.querySelectorAll('#content .paper-card')].filter(card=>card.getBoundingClientRect().height>650).length
  }));
  if(combatLayout.banners!==4)failures.push(`${test.name}: Combate deveria ter exatamente 4 banners, encontrou ${combatLayout.banners}`);
  if(combatLayout.main!==1||combatLayout.rolls!==1||combatLayout.turn!==1||combatLayout.attackDefense!==1)failures.push(`${test.name}: banners de Combate não estão distribuídos 1/1/1/1`);
  if(combatLayout.blankCards)failures.push(`${test.name}: Combate tem ${combatLayout.blankCards} cards vazios`);
  if(combatLayout.veryTallCards)failures.push(`${test.name}: Combate tem ${combatLayout.veryTallCards} cards anormalmente altos`);

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

  await page.close();
}

await browser.close();
if(failures.length){console.error('❌ Smoke do Guia falhou\n- '+failures.join('\n- '));process.exit(1)}
console.log('✅ Smoke do Guia concluído em desktop e mobile, incluindo estabilidade e layout de Combate.');
