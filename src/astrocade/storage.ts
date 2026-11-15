const KEYS=['aseanSurvivor.v1','aseanSurvivor.audio'];
let values: Record<string,string>={},writable=false,dirty=false;
let timer: ReturnType<typeof setTimeout> | undefined;
let saving: Promise<void> | undefined;

function status(message=''){
  const node=document.getElementById('cloudStatus');
  if(node){node.textContent=message;node.hidden=!message}
}

async function timed<T>(request: Promise<T>): Promise<T>{
  let timeout: ReturnType<typeof setTimeout>;
  try{return await Promise.race([request,new Promise<never>((_,reject)=>{
    timeout=setTimeout(()=>reject(new Error('Save service timed out')),8000);
  })])}finally{clearTimeout(timeout!)}
}

export async function loadStorage(){
  await flushStorage();
  if(dirty)return;
  values={};writable=false;
  try{
    const response=await timed(window.lib.getUserGameState());
    if(response.success===false)throw new Error('Load refused');
    const state=response.state;
    if(state!==null){
      if(state?.version!==1||!state.values||typeof state.values!=='object')throw new Error('Unknown save format');
      for(const key of KEYS)if(state.values[key]!==undefined){
        const value=state.values[key];
        if(typeof value!=='string'||value.length>10000)throw new Error('Invalid save');
        const parsed=JSON.parse(value);
        if(!parsed||typeof parsed!=='object')throw new Error('Invalid save');
        if(key===KEYS[0]&&(!Number.isFinite(parsed.coins)||!Array.isArray(parsed.owned)||!Array.isArray(parsed.cleared)||
          (parsed.autoMode!==undefined&&(!Number.isInteger(parsed.autoMode)||parsed.autoMode<0||parsed.autoMode>4))))throw new Error('Invalid progress');
        values[key]=value;
      }
    }
    writable=true;status();
  }catch{values={};status('Cloud save unavailable. Progress is temporary for this session.')}
}

export async function flushStorage(): Promise<void>{
  clearTimeout(timer);
  if(saving)await saving;
  if(!dirty||!writable)return;
  dirty=false;
  const state={version:1,values:{...values}};
  saving=(async()=>{
    try{
      // Do not time out writes: an earlier request must finish before a later save.
      const response=await window.lib.saveUserGameState(state);
      if(response.success===false)throw new Error('Save refused');
      status();
    }catch{dirty=true;status('Progress could not sync. Keep this game open and try a setting again.')}
  })();
  await saving;saving=undefined;
}

export const platformStorage={
  getItem(key: string){return values[key]??null},
  setItem(key: string,value: string){
    if(!KEYS.includes(key))throw new Error('Unexpected save key');
    values[key]=value;
    if(!writable)return;
    dirty=true;clearTimeout(timer);timer=setTimeout(()=>{void flushStorage()},350);
  }
};
