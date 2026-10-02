import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
await fs.mkdir('ui-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
const diagnostics=[];
const cases=[
  {name:'desktop',viewport:{width:1440,height:1000},mobile:false},
  {name:'mobile',viewport:{width:390,height:844},mobile:true}
];

const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const includes=(text,part)=>norm(text).includes(norm(part));

async function responsive(page,label){
  const started=Date.now();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const elapsed=Date.now()-started;
  diagnostics.push(`${label}: main thread ${elapsed}ms`);
  if(elapsed>1500)failures.push(`${label}: interface lenta (${elapsed}ms)`);
}

async function waitReady(page,label){
  await page.waitForLoadState('domcontentloaded',{timeout:10000});
  await page.waitForSelector('#content .section',{timeout:8000});
  await responsive(page,label);
}

async function openRoute(page,test,route){
  if(test.mobile){
    await page.locator('#menuBtn').click({timeout:5000});
    await page.waitForFunction(()=>document.querySelector('#sidebar')?.classList.contains('open'),null,{timeout:3000});
  }
  await page.locator(`[data-page="${route}"]`).first().click({timeout:5000});
  await page.waitForFunction(expected=>location.hash===`#page:${expected}`,route,{timeout:3000});
  await page.waitForFunction(()=>{
    const content=document.querySelector('#content');
    return !!content?.querySelector('.section')&&(content.innerText||'').trim().length>80;
  },null,{timeout:5000});
  await responsive(page,`${test.name}/${route}`);
  const state=await page.evaluate(()=>({
    hash:location.hash,
    title:document.querySelector('#pageTitle')?.textContent||'',
    width:innerWidth,
    scrollWidth:document.documentElement.scrollWidth,
    textLength:(document.querySelector('#content')?.innerText||'').trim().length
  }));
  diagnostics.push(`${test.name}/${route}: ${state.hash} · ${state.title} · ${state.textLength} chars`);
  if(state.hash!==`#page:${route}`)failures.push(`${test.name}/${route}: rota incorreta ${state.hash}`);
  if(!state.title)failures.push(`${test.name}/${route}: título ausente`);
  if(state.scrollWidth>state.width+2)failures.push(`${test.name}/${route}: overflow horizontal ${state.scrollWidth}px > ${state.width}px`);
  await page.screenshot({path:`ui-artifacts/${test.name}-${route}.png`,fullPage:true});
}

for(const test of cases){
  const context=await browser.newContext({viewport:test.viewport});
  const page=await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror',error=>failures.push(`${test.name}: pageerror ${error.message}`));
  page.on('console',message=>{if(message.type()==='error')diagnostics.push(`${test.name}: console.error ${message.text()}`)});

  const started=Date.now();
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:15000});
  await waitReady(page,`${test.name}/boot`);
  diagnostics.push(`${test.name}: boot ${Date.now()-started}ms`);

  for(const route of ['combate','crafting','magia','deuses','roma','sistema']){
    try{await openRoute(page,test,route)}catch(error){failures.push(`${test.name}/${route}: navegação falhou (${error.message})`);break;}
  }

  try{
    await openRoute(page,test,'combate');
    await page.waitForTimeout(250);
    const combatText=await page.locator('#content').innerText();
    for(const expected of ['2 ações','10 metros','Percepção Passiva','Agarrar','Cobertura','10 + 2 × metros da queda']){
      if(!includes(combatText,expected))failures.push(`${test.name}/combate: regra ausente: ${expected}`);
    }
    const layout=await page.evaluate(()=>({
      banners:document.querySelectorAll('#content .rules-page-banner,#content .rules-banner').length,
      main:document.querySelectorAll('#content > .rules-page-banner--main').length,
      rolls:document.querySelectorAll('#rolagens > .rules-banner').length,
      turn:document.querySelectorAll('#turno > .rules-banner').length,
      attackDefense:document.querySelectorAll('#rolagens > .rules-subfeature.rules-attack-defense > .rules-banner').length,
      blank:[...document.querySelectorAll('#content .paper-card')].filter(card=>(card.innerText||'').trim().length<3).length,
      tall:[...document.querySelectorAll('#content .paper-card')].filter(card=>card.getBoundingClientRect().height>650).length
    }));
    if(layout.banners!==4||layout.main!==1||layout.rolls!==1||layout.turn!==1||layout.attackDefense!==1)failures.push(`${test.name}/combate: distribuição de banners incorreta ${JSON.stringify(layout)}`);
    if(layout.blank)failures.push(`${test.name}/combate: ${layout.blank} cards vazios`);
    if(layout.tall)failures.push(`${test.name}/combate: ${layout.tall} cards anormalmente altos`);
  }catch(error){failures.push(`${test.name}/combate: validação falhou (${error.message})`)}

  for(const [route,expected] of [
    ['sistema',['Rebentos de Roma','Honesta Missio','Boas Práticas']],
    ['roma',['Passagem do Tempo','3 meses OFF','Bolsa Décimus']],
    ['roma:estrangeiros',['celtas','estrangeiros']],
    ['crafting',['Bronze Celestial','Ouro Imperial']]
  ]){
    try{
      await page.goto(`${base}#page:${route}`,{waitUntil:'domcontentloaded',timeout:15000});
      await waitReady(page,`${test.name}/deep-${route}`);
      const text=await page.locator('#content').innerText();
      for(const item of expected)if(!includes(text,item))failures.push(`${test.name}/${route}: conteúdo ausente: ${item}`);
    }catch(error){failures.push(`${test.name}/${route}: deep link falhou (${error.message})`)}
  }

  await context.close();
}

await browser.close();
console.log('DIAGNÓSTICO\n'+diagnostics.join('\n'));
if(failures.length){console.error('❌ Smoke do Guia falhou\n- '+failures.join('\n- '));process.exit(1)}
console.log('✅ Guia navegável e responsivo em desktop e mobile.');
