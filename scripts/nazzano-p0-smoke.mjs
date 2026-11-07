import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
const failures=[],results=[];
const base=process.env.UI_BASE_URL||'http://127.0.0.1:4173/';
for(const [name,viewport] of [['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]]){
 const context=await browser.newContext({viewport});
 const page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>failures.push(name+' JS: '+e.message));
 await page.goto(base+'#page:roma',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('.oct26-gateway')&&document.querySelector('.oct26-real-map')&&document.querySelector('.oct26-current-leadership')&&document.querySelector('#sectionNav a[href="#nazzano-atualizacao"]'),null,{timeout:20000});
 const report=await page.evaluate(()=>{
   const el=(sel)=>document.querySelector(sel);
   const sects=[...document.querySelectorAll('#content > .section')].map(e=>e.id);
   const all=el('#content')?.textContent||'';
   const trio=[...document.querySelector('.oct26-current-leadership')?.querySelectorAll('.leader-card h3')||[]].map(n=>n.textContent);
   return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     hasEmbed:!!el('#mapa-acampamento iframe[src*="google.com/maps"]'),
     mapSrc:el('#mapa-acampamento .camp-map-panel img')?.getAttribute('src'),
     gatewayText:el('.oct26-gateway')?.textContent,
     current:trio,
     important:el('#liderancas')?.textContent?.slice(0,600),
     sections:sects,
     nav:[...document.querySelectorAll('#sectionNav a')].map(e=>e.getAttribute('href')),
     oldCaldecott:all.includes('Caldecott'),oldFranciscoTrip:all.includes('Uma viagem curta de fim de semana para São Francisco'),
     oldBronzeCrisis:all.includes('o bronze está enfraquecendo')};
 });
 results.push({name,...report,gatewayText:report.gatewayText?.slice(0,180),important:report.important?.slice(0,160)});
 if(!report.hasEmbed)failures.push(name+': Google Maps não está integrado');
 if(!report.gatewayText?.includes('bolsão mágico')||!report.gatewayText?.includes('dois legionários'))failures.push(name+': explicação do limiar mágico está incompleta');
 if(report.mapSrc!=='assets/nazzano/mapa-nazzano.webp')failures.push(name+': mapa antigo não foi substituído');
 if(!report.important?.includes('Praetoria'))failures.push(name+': seção da liderança não mostra a Praetoria');
 for(const n of ['Jasmine','Cyrus','Cassius'])if(!report.current.some(x=>x.includes(n)))failures.push(name+': falta '+n+' no triunvirato');
 if(report.oldCaldecott||report.oldFranciscoTrip||report.oldBronzeCrisis)failures.push(name+': informações geográficas antigas continuam na página');
 if(!report.nav.some(x=>x?.includes('nazzano-atualizacao')))failures.push(name+': índice não inclui atualização de Nazzano');
 if(report.scrollWidth>report.viewport+2)failures.push(name+': overflow horizontal '+report.scrollWidth);
 await page.goto(base+'#page:sistema',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#hierarquia')?.textContent?.includes('triunvirato'),null,{timeout:20000});
 const txt=await page.locator('#content').innerText();
 if(txt.includes('duunvirato'))failures.push(name+': sistema ainda diz duunvirato');
 if(txt.includes('indisponíveis para criação'))failures.push(name+': celtas ainda estão bloqueados: '+txt.slice(Math.max(0,txt.indexOf('indisponíveis para criação')-130),txt.indexOf('indisponíveis para criação')+80));
 if(txt.includes('Oakland Hills'))failures.push(name+': trabalho de coleta menciona Oakland Hills');
 await context.close();
}
await browser.close();
console.log(JSON.stringify(results,null,2));
if(failures.length){console.error('FALHAS P0\n'+failures.join('\n'));process.exit(1)}
console.log('OK: Nazzano, mapa geográfico, dimensões e liderança sem contradições no desktop/mobile.');
