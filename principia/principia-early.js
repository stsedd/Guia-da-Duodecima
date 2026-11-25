/* Principia · camada antecipada
   Carregada ANTES do motor do Guia (app-v24.js) para que ele funcione dentro da janela:
   - a rolagem da página passa a ser a rolagem da janela do arquivo (#osScroller);
   - mudanças de histórico (pushState/replaceState) viram um evento que a interface escuta.
   Nenhum arquivo do motor é alterado. */
(function(){
  'use strict';
  var doc=document.documentElement;
  var P=window.PRINCIPIA=window.PRINCIPIA||{};
  P.initialHash=location.hash||'';
  /* Login que volta com a sessão no endereço (#access_token=…, usado no login pelo app do Discord):
     o motor do Guia troca qualquer endereço desconhecido por #page:sistema assim que carrega, antes
     de o cliente das contas existir. Guarda aqui e limpa o endereço; principia-online.js usa depois. */
  if(/(^#|&)(access_token|error_description)=/.test(location.hash)){
    P.retornoLogin=location.hash.slice(1);
    P.initialHash='';
    try{history.replaceState(history.state,'',location.pathname+location.search);}catch(e){}
  }
  P.bootStartedAt=(window.performance&&performance.now)?performance.now():0;

  var scroller=document.getElementById('osScroller');
  P.scroller=scroller;

  /* ---------- Rolagem: window → janela do arquivo ---------- */
  if(scroller){
    var nativeScrollTo=window.scrollTo.bind(window);
    var nativeScrollBy=window.scrollBy?window.scrollBy.bind(window):null;
    var toOpts=function(x,y){
      if(x&&typeof x==='object')return x;
      return {left:+x||0,top:+y||0};
    };
    window.scrollTo=window.scroll=function(x,y){
      if(!scroller.isConnected)return nativeScrollTo(x,y);
      var o=toOpts(x,y);
      try{scroller.scrollTo(o);}catch(_){scroller.scrollTop=o.top||0;}
    };
    window.scrollBy=function(x,y){
      if(!scroller.isConnected)return nativeScrollBy&&nativeScrollBy(x,y);
      var o=toOpts(x,y);
      try{scroller.scrollBy(o);}catch(_){scroller.scrollTop+=(o.top||0);}
    };
    var getY=function(){return scroller.scrollTop;};
    var getX=function(){return scroller.scrollLeft;};
    try{
      Object.defineProperty(window,'scrollY',{configurable:true,get:getY});
      Object.defineProperty(window,'pageYOffset',{configurable:true,get:getY});
      Object.defineProperty(window,'scrollX',{configurable:true,get:getX});
      Object.defineProperty(window,'pageXOffset',{configurable:true,get:getX});
    }catch(err){console.warn('[Principia] Não foi possível redirecionar scrollY.',err);}
    // O motor escuta "scroll" na janela: repassamos a rolagem do arquivo.
    scroller.addEventListener('scroll',function(){
      window.dispatchEvent(new Event('scroll'));
    },{passive:true});
  }

  /* ---------- Histórico → evento "principia:route" ---------- */
  ['pushState','replaceState'].forEach(function(fn){
    var original=history[fn];
    if(typeof original!=='function')return;
    history[fn]=function(state,title,url){
      var result=original.apply(this,arguments);
      try{window.dispatchEvent(new CustomEvent('principia:route',{detail:{type:fn,url:url}}));}catch(_){}
      return result;
    };
  });

  /* ---------- Índice de busca sempre atual ----------
     O motor guarda a lista de busca que existe quando ele carrega; as camadas seguintes trocam
     window.GUIA_SEARCH por listas novas, e o motor continuava pesquisando na primeira (por isso a
     busca mostrava textos antigos). Aqui a primeira lista é atualizada no lugar a cada troca. */
  var searchRef=null;
  try{
    Object.defineProperty(window,'GUIA_SEARCH',{configurable:true,enumerable:true,
      get:function(){return searchRef;},
      set:function(v){
        if(!Array.isArray(v)||!Array.isArray(searchRef)){searchRef=v;return;}
        if(v===searchRef)return;
        var copy=v.slice();
        searchRef.length=0;
        for(var i=0;i<copy.length;i++)searchRef.push(copy[i]);
      }
    });
  }catch(err){console.warn('[Guia] Não foi possível acompanhar o índice de busca.',err);}

  doc.classList.add('os-html');
})();
