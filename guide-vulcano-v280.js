/* Regra canônica de forja vulcânica · 15/11/2026 */
(() => {
  'use strict';
  const page=window.GUIA_CONTENT&&window.GUIA_CONTENT.crafting;
  if(!page)return;
  const html='<section class="section searchable" id="forja-vulcano" data-title="Forja de Vulcano">'
    +'<div class="section-head"><div><small>ARS · PRODUÇÃO</small><h2>Forja de Vulcano</h2></div><span>BÔNUS DE RESISTÊNCIA</span></div>'
    +'<article class="paper-card feature"><h3>Obras de uma prole de Vulcano</h3>'
    +'<p>Armas, armaduras e escudos produzidos por descendentes de <strong>Vulcano</strong> recebem <strong>+2 de resistência máxima contra quebra</strong>, além da resistência normal do material.</p>'
    +'<p>Por exemplo: uma arma de Ferro/Aço que teria resistência <strong>3</strong> passa a ter <strong>5</strong>; o Bronze Celestial passa de <strong>4</strong> para <strong>6</strong>. O bônus modifica a capacidade de suportar quebras, não o dano, a Defesa nem as propriedades do material.</p>'
    +'<p>Materiais naturalmente inquebráveis continuam inquebráveis. Na <strong>Ficha Oficial</strong>, marque <strong>Feito por prole de Vulcano</strong> na arma, armadura ou escudo para atualizar automaticamente o limite de resistência.</p>'
    +'</article></section>';
  // Não duplicar a regra se ela já tiver sido publicada na cópia local.
  if(!page.html.includes('id="forja-vulcano"'))page.html+=html;
  window.GUIA_SEARCH=[...(window.GUIA_SEARCH||[]).filter(x=>!(x.page==='crafting'&&x.anchor==='forja-vulcano')),
    {page:'crafting',anchor:'forja-vulcano',deity:null,title:'Forja de Vulcano',text:'Armas armaduras escudos fabricados por filhos de Vulcano recebem +2 resistência máxima contra quebra, inclusive ferro e bronze celestial.'}];
})();
