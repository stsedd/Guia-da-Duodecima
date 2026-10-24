(()=>{'use strict';
const key='oct26';
const profiles=[
{name:'Cyrus Torres Aurelius',title:'PRAETOR · II COORTE',alias:'O Silêncio · A Fúria da Noite',image:'',desc:'Natural do Chile e filho de Summanus. Antigo líder da II Coorte, especialista em infiltração e operações silenciosas. Recuperou as áquilas de Vênus e Justitia, participou com Cassius da recuperação da cabeça da estátua de Summanus, infiltrou-se entre vampiros e enfrentou o Régulo de Nazzano. Atualmente integra o triunvirato de Roma.'},
{name:'Alessia Beatrice Czartoryski Sapieha Wojciechowski',title:'PONTIFEX · RELIGIO',alias:'A Impronunciável · Alessia, a Evidência · Beatrice, a Sentença · Alexy, a Executora',image:'',desc:'Filha de Janus com uma descendente de Justitia. Alessia personifica o passado e o rigor; Beatrice, o futuro e a misericórdia; Alexy reúne ambas as faces no presente. Ligada à III Coorte, à Religio, aos tribunais e à preservação dos cultos dos deuses menores. Aprecia chá e aves.'},
{name:'Cenric Vallence Pavan',title:'ANTIGO ÁUGURE · V COORTE · IN MEMORIAM',alias:'O Fogo Gentil · Scintilla Pristina Vestae',image:'',desc:'Abençoado por Vesta e ligado à V Coorte, recuperou as áquilas de Vênus e Arcus, e ajudou a reerguer a honra de sua coorte. Morto em uma missão à pedido de Iuppiter.',dead:true}
];
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function update(){
 const root=document.getElementById('content');if(!root)return;
 if(!location.hash.includes('roma'))return;
 const texts=[...root.querySelectorAll('h1,h2,h3,h4,h5,p,span,strong')];
 for(const el of texts){if(el.children.length)continue; const v=el.textContent.trim();
 if(/quem conduz roma agora/i.test(v)){el.textContent='Figuras Importantes';}
 if(/figuras atuais/i.test(v)){el.textContent='PERSONAGENS E LIDERANÇAS';}
 }
 const head=[...root.querySelectorAll('h1,h2,h3,h4')].find(e=>/Figuras Importantes/i.test(e.textContent)); if(head){
 const sec=head.closest('section')||head.parentElement.parentElement;
 if(sec&&!sec.querySelector('[data-oct26=profiles]')){
  const wrap=document.createElement('div');wrap.dataset.oct26='profiles';wrap.className='oct26-profiles';
  wrap.innerHTML=profiles.map(p=>'<article class="oct26-person '+(p.dead?'oct26-memorial':'')+'"><div class="oct26-avatar" aria-hidden="true">'+(p.dead?'✝':'XII')+'</div><div><small>'+escapeHTML(p.title)+'</small><h3>'+escapeHTML(p.name)+'</h3><em>'+escapeHTML(p.alias)+'</em><p>'+escapeHTML(p.desc)+'</p></div></article>').join('');
  sec.appendChild(wrap);
 }
 }
 // Títulos institucionais: preserva Casa do Lobo e a história, mas não apresenta Califórnia como sede atual.
 [...root.querySelectorAll('p')].forEach(el=>{if(el.children.length||el.dataset.oct26Reviewed)return;let s=el.textContent;
 if(/(acampamento júpiter|nova roma|legião)/i.test(s)&&/(localizad[oa]|situad[oa]|fica|sediad[oa]|estabelecid[oa])/i.test(s)&&/(calif[oó]rnia|s[aã]o francisco)/i.test(s)){
 el.dataset.oct26Reviewed='1';el.textContent='A sede atual da Legião e de Nova Roma fica na Reserva de Nazzano, na Itália. A presença romana na Califórnia continua como posto avançado, e não como o acampamento principal.';
 }});
 const z=[...root.querySelectorAll('h1,h2,h3,h4')].find(e=>/nova roma/i.test(e.textContent));if(z&&!root.querySelector('[data-oct26=note]')){
 const n=document.createElement('div');n.dataset.oct26='note';n.className='oct26-note';n.innerHTML='<strong>ROMA, FINALMENTE · NAZZANO</strong><p>A cidade foi transferida para a Itália por um ritual de Blume Becker, com apoio de Jasmine e catalisadores reunidos pelos legionários. O acampamento militar foi reconstruído no novo território, após a derrota do Régulo e a pacificação da reserva. As cavernas estão sob o acampamento, acessíveis pelo Bosque dos Faunos e dos Elfos. O problema do bronze frágil foi resolvido; o cristal do Aqueronte ainda não possui mecânica definida.</p>';z.parentElement.appendChild(n);
 }
}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})};
new MutationObserver(schedule).observe(document.getElementById('content')||document.body,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);schedule();
})();