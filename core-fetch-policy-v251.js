(()=>{
  'use strict';

  const nativeFetch=window.fetch.bind(window);
  const coreOrigin='https://stsedd.github.io';
  const corePrefix='/duodecima-core/';
  let coreVersion='';
  let snapshotPromise=null;

  async function snapshot(){
    if(!snapshotPromise){
      snapshotPromise=nativeFetch('./core-snapshot.json',{cache:'no-cache'})
        .then(r=>{if(!r.ok)throw new Error(`snapshot ${r.status}`);return r.json()})
        .catch(err=>{snapshotPromise=null;throw err});
    }
    return snapshotPromise;
  }

  function coreRequestInfo(input){
    try{
      const raw=typeof input==='string'?input:input?.url;
      const url=new URL(raw,location.href);
      if(url.origin!==coreOrigin||!url.pathname.startsWith(corePrefix))return null;
      const relative=url.pathname.slice(corePrefix.length);
      url.searchParams.delete('_');
      return {url,relative};
    }catch(_){return null}
  }

  async function snapshotResponse(relative){
    const snap=await snapshot();
    let body=null;
    if(relative==='manifest.json')body=snap.manifest;
    else{
      const entry=Object.entries(snap.manifest?.files||{}).find(([,path])=>path===relative);
      if(entry)body=snap[entry[0]];
    }
    if(body==null)throw new Error(`Arquivo ${relative} ausente no snapshot.`);
    window.DUODECIMA_CORE_SERVED_FROM_SNAPSHOT=true;
    coreVersion=snap.manifest?.contentVersion||snap.manifest?.updatedAt||coreVersion;
    return new Response(JSON.stringify(body),{status:200,headers:{'content-type':'application/json','x-duodecima-source':'snapshot'}});
  }

  window.fetch=async function(input,init={}){
    const info=coreRequestInfo(input);
    if(!info)return nativeFetch(input,init);
    const {url,relative}=info;
    if(relative==='manifest.json'){
      try{
        const response=await nativeFetch(url.toString(),{...init,cache:'no-cache'});
        if(!response.ok)return snapshotResponse(relative);
        try{
          const data=await response.clone().json();
          coreVersion=data.contentVersion||data.updatedAt||coreVersion;
        }catch(_){ }
        return response;
      }catch(_){return snapshotResponse(relative)}
    }
    if(coreVersion)url.searchParams.set('v',coreVersion);
    try{
      const response=await nativeFetch(url.toString(),{...init,cache:'default'});
      if(!response.ok)return snapshotResponse(relative);
      return response;
    }catch(_){return snapshotResponse(relative)}
  };
})();
