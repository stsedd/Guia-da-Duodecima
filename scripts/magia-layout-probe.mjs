import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
for(const t of [{label:'desktop',width:1440,height:900},{label:'mobile',width:390,height:844}]){
  const page=await browser.newPage({viewport:{width:t.width,height:t.height}});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-page="magia"]').first().evaluate(el=>el.click());
  await page.waitForTimeout(3500);
  const info=await page.evaluate(()=>{
    const root=document.querySelector('#content');
    const nodes=[...root.querySelectorAll('h1,h2,h3,h4,strong,b,li,p,div,span')];
    const re=/Tomou dano|DT 10|metade do dano|Limites da Alta Magia|conjurações|custo|energia|Custo de Magia|Custo das Magias/i;
    const out=[];
    for(const node of nodes){
      const text=node.innerText?.trim();
      if(!text || text.length>300)continue;
      if(!re.test(text))continue;
      const rect=node.getBoundingClientRect();
      out.push({tag:node.tagName,cls:(node.className||'').toString().slice(0,100),text:text.slice(0,240),html:node.outerHTML.slice(0,1100),parent:node.parentElement?.outerHTML.slice(0,1800),width:Math.round(rect.width),height:Math.round(rect.height)});
      if(out.length>130)break;
    }
    const sec=[...root.querySelectorAll(':scope > section')].map(x=>({title:x.querySelector('h2')?.textContent,id:x.id,len:x.innerText.length})).filter(x=>/magia|custo|energia|concentra|círculo|limite/i.test(x.title||''));
    return {items:out,sec};
  });
  console.log('VIEW '+t.label+' '+JSON.stringify(info));
  await page.close();
}
await browser.close();
