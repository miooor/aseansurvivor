export function markStageProgress(button:HTMLButtonElement,id:string,cleared:string[],next:string[]){
  const state=cleared.includes(id)?'cleared':next.includes(id)?'next':undefined;
  if(state){
    button.dataset.progress=state;
    button.setAttribute('aria-description',state==='cleared'?'Cleared':'Next available stop');
  }else{
    delete button.dataset.progress;
    button.removeAttribute('aria-description');
  }
}
