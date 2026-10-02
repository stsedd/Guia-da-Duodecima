import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
await fs.mkdir('ui-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
const diagnostics=[];
const cases=[
  {name:'desktop',viewport:{width:1440,height:1000}},
  {name:'mobile',viewport:{width:390,height:844}}
];

function includesNormalized(text,part){
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return norm(text).includes(norm(part));
}

async function assertResponsive(page,label){
  const started=Date.now();
  try{
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true)))));
    const elapsed=Date.now()-started;
    diagnostics.push(`${label}: main thread respondeu em ${elapsed}ms`);
    if(elapsed>1500)failures.push(`${label}: interface respondeu lentamente (${elapsed}ms)`);
  }catch(error){
    failures.push(`${label}: interface travou (${error.message})`);
  }
}

async function waitForPage(page,route,label){
  await page.waitForFunction(expected=>{
    const current=(document.querySelector('#pageTitle')?.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return current.includes(expected);
  },route==='roma'?'roma':route,{timeout:8000});
  await page.waitForSelector('#content .section',{timeout:8000});
  await assertResponsive(page,label);
}

for(const test of cases){
  const context=await browser.newContext({viewport:test.viewport});
  const page=await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror',error=>failures.push(`${test.name}: pageerror ${error.message}`));
  page.on('console',message=>{
    if(message.type()==='error')diagnostics.push(`${test.name}: console.error ${message.text()}`);
  });

  const started=Date.now();
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:15000});
  diagnostics.push(`${test.name}: DOMContentLoaded em ${Date.now()-started}ms`);
  await page.waitForSelector('#content .section',{timeout:8000});
  await assertResponsive(page,`${test.name}/boot`);

  // Navegação real pelos botões do menu. Isto reproduz o fluxo que estava congelando em produção.
  for(const route of ['combate','crafting','magia','deuses','roma','sistema']){
    const button=page.locator(`[data-page="${route}"]`).first();
    const clickStarted=Date.now();
    await button.click({timeout:8000});
    await waitForPage(page,route,`${test.name}/${route}`);
    diagnostics.push(`${test.name}/${route}: navegação por clique em ${Date.now()-clickStarted}ms`);

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

  await page.locator('[data-page="combate"]').first().click();
  await waitForPage(page,'combate',`${test.name}/combate-regras`);
  await page.waitForTimeout(300);
  const combatText=await page.locator('#content').innerText({timeout:8000});
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

  // Deep links continuam sendo testados, mas sem depender de networkidle: o Guia é uma SPA e deve continuar usável mesmo com requests remotas pendentes.
  for(const [route,expected] of [
    ['sistema',['Rebentos de Roma','dois atributos diferentes','Sucessor de Rebento','+25 Energia','Honesta Missio','Boas Práticas']],
    ['roma',['Passagem do Tempo','3 meses OFF','Anos de serviço','Bolsa Décimus','250 DN','450 DN']],
    ['roma:estrangeiros',['celtas','estrangeiros']],
    ['crafting',['Bronze Celestial','não causa dano algum a mortais','Ouro Imperial','8 ou menos']]
  ]){
    await page.goto(`${base}#page:${route}`,{waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForSelector('#content .section',{timeout:8000});
    await assertResponsive(page,`${test.name}/deep-${route}`);
    const text=await page.locator('#content').innerText({timeout:8000});
    for(const item of expected){
      if(!includesNormalized(text,item))failures.push(`${test.name}/${route}: conteúdo esperado ausente: ${item}`);
    }
  }

  await context.close();
}

await browser.close();
console.log('DIAGNÓSTICO DE RESPONSIVIDADE\n'+diagnostics.join('\n'));
if(failures.length){console.error('❌ Smoke do Guia falhou\n- '+failures.join('\n- '));process.exit(1)}
console.log('✅ Smoke do Guia concluído em desktop e mobile, incluindo navegação por clique, estabilidade e layout de Combate.');
