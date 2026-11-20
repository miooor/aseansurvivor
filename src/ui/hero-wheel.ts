import {menuPortraitPosition} from '../content/hero-art.js';

type WheelHero = {id:string; name:string; country:string; frame:number; flag:string};

// Angle is continuous across the last/first seam. The roster index wraps.
export function installHeroWheel(heroes:WheelHero[], onSelect:(id:string)=>void, signal:AbortSignal){
  const wheel=document.getElementById('heroWheel')!;
  const roster=document.getElementById('heroes')!;
  const step=360/heroes.length;
  const wrap=(index:number)=>(index%heroes.length+heroes.length)%heroes.length;
  const options={signal};
  let position=0;
  let suppressClick=false;
  let drag:{id:number;x:number;width:number;offset:number;active:boolean}|null=null;

  roster.replaceChildren();
  const buttons=heroes.map((hero,index)=>{
    const button=document.createElement('button');
    button.type='button';button.className='hero';button.id='hero-'+hero.id;
    button.title=hero.name+' · '+hero.country;button.setAttribute('aria-label',button.title);
    button.style.setProperty('--slot',index*step+'deg');
    button.style.setProperty('--portrait',menuPortraitPosition(hero.frame));
    button.style.setProperty('--portrait-flag',hero.flag);
    button.innerHTML='<i aria-hidden="true"></i>';
    button.addEventListener('click',()=>{
      const forward=wrap(index-wrap(position));
      settle(position+(forward>heroes.length/2?forward-heroes.length:forward));
    },options);
    roster.append(button);return button;
  });

  function rotate(offset:number){
    roster.style.setProperty('--lineup-angle',(-offset*step)+'deg');
    // The five front positions are visible. Rear slots pass behind the wheel.
    buttons.forEach((button,i)=>{
      const distance=Math.abs(wrap(i-offset+heroes.length/2)-heroes.length/2);
      button.style.pointerEvents=distance<=2.5?'auto':'none';
    });
  }
  function settle(next:number){
    drag=null;wheel.classList.remove('dragging');
    position=next;rotate(position);
    const index=wrap(position);
    const hadPortraitFocus=roster.contains(document.activeElement);
    buttons.forEach((button,i)=>{
      button.setAttribute('aria-pressed',String(i===index));button.tabIndex=i===index?0:-1;
    });
    if(hadPortraitFocus)buttons[index].focus({preventScroll:true});
    onSelect(heroes[index].id);
  }

  document.getElementById('heroPrevious')!.addEventListener('click',()=>settle(position-1),options);
  document.getElementById('heroNext')!.addEventListener('click',()=>settle(position+1),options);
  wheel.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')settle(position+1);
    else if(event.key==='ArrowLeft'||event.key==='ArrowUp')settle(position-1);
    else if(event.key==='Home')buttons[0].click();
    else if(event.key==='End')buttons.at(-1)!.click();
    else return;
    event.preventDefault();
  },options);

  let scrollAmount=0,lastScroll=-Infinity,lastStep=-Infinity;
  wheel.addEventListener('wheel',event=>{
    if(event.ctrlKey||drag)return;
    event.preventDefault();
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    const now=event.timeStamp;
    if(now-lastScroll>160||Math.sign(delta)!==Math.sign(scrollAmount))scrollAmount=0;
    lastScroll=now;
    scrollAmount+=delta*(event.deltaMode===1?16:event.deltaMode===2?wheel.clientHeight:1);
    if(Math.abs(scrollAmount)>=38 && now-lastStep>=150){
      settle(position+Math.sign(scrollAmount));scrollAmount=0;lastStep=now;
    }
  },{passive:false,signal});

  wheel.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    suppressClick=false;
    drag={id:event.pointerId,x:event.clientX,width:wheel.clientWidth,offset:0,active:false};
  },options);
  wheel.addEventListener('pointermove',event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x;
    if(!drag.active){
      if(Math.abs(dx)<6)return;
      drag.active=true;wheel.setPointerCapture(event.pointerId);wheel.classList.add('dragging');
    }
    drag.offset=-dx/(drag.width*.38);
    rotate(position+drag.offset);
  },options);
  function finish(event:PointerEvent,commit:boolean){
    if(!drag||drag.id!==event.pointerId)return;
    if(!drag.active){drag=null;return}
    suppressClick=true;
    const steps=Math.sign(drag.offset)*Math.floor(Math.abs(drag.offset)+.65);
    settle(position+(commit?steps:0));
    if(wheel.hasPointerCapture(event.pointerId))wheel.releasePointerCapture(event.pointerId);
  }
  wheel.addEventListener('pointerup',event=>finish(event,true),options);
  wheel.addEventListener('pointercancel',event=>finish(event,false),options);
  wheel.addEventListener('lostpointercapture',event=>{if(event.target===wheel)finish(event,false)},options);
  wheel.addEventListener('pointerleave',()=>{if(drag && !drag.active)drag=null},options);
  wheel.addEventListener('click',event=>{
    if(suppressClick && event.detail){event.stopImmediatePropagation();suppressClick=false}
  },{capture:true,signal});
  settle(0);
}
