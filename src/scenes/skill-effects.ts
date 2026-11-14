import type Phaser from 'phaser';
import type {Effect,RunState} from '../game/runtime.js';

/** Cosmetic choreography only: attack areas and damage remain in the simulation. */
export function drawSkillEffect(f:Effect,floor:Phaser.GameObjects.Graphics,fx:Phaser.GameObjects.Graphics,state:RunState,color:number,reduced:boolean){
  const age=f.max-f.life,opacity=Math.min(1,age/.08+.15,f.life/.25),t=reduced?.25:age;
  const slot=f.slot||0,id=f.hero;
  const a=id==='rempit'&&(slot===2||slot===4)?Math.atan2(state.p.face[1],state.p.face[0]):f.a||0,dx=Math.cos(a),dy=Math.sin(a);
  const follows=(id==='ustaz'&&slot===2)||(id==='rempit'&&slot!==3)||(id==='nok'&&slot===3)||(id==='lan'&&(slot===2||slot===4))||(id==='sari'&&slot!==1);
  const x=follows?state.p.x:f.x,y=follows?state.p.y:f.y;
  const line=(x1:number,y1:number,x2:number,y2:number,width=3,c=color,alpha=1)=>{
    fx.lineStyle(width*4,c,opacity*alpha*.09).lineBetween(x1,y1,x2,y2);
    fx.lineStyle(width,c,opacity*alpha).lineBetween(x1,y1,x2,y2);
  };
  const ring=(cx:number,cy:number,r:number,flat=.5,c=color,alpha=1)=>floor.lineStyle(2,c,opacity*alpha).strokeEllipse(cx,cy,r*2,r*2*flat);
  const spark=(cx:number,cy:number,r=8,c=0xffffff)=>{line(cx-r,cy,cx+r,cy,2,c);line(cx,cy-r,cx,cy+r,2,c)};
  const arc=(r:number,start:number,end:number,width=4,c=color)=>{
    fx.lineStyle(width*4,c,opacity*.1).beginPath().arc(x,y,r,start,end).strokePath();
    fx.lineStyle(width,c,opacity).beginPath().arc(x,y,r,start,end).strokePath();
  };
  const feather=(cx:number,cy:number,angle:number,length:number)=>{
    const ux=Math.cos(angle),uy=Math.sin(angle);
    line(cx,cy,cx+ux*length,cy+uy*length,2,0xffe6a2);
    for(let k=1;k<5;k++){const d=length*k/5,w=length*.18*Math.sin(k/5*Math.PI);
      line(cx+ux*d,cy+uy*d,cx+ux*(d-8)-uy*w,cy+uy*(d-8)+ux*w,2);
      line(cx+ux*d,cy+uy*d,cx+ux*(d-8)+uy*w,cy+uy*(d-8)-ux*w,2)}
  };
  switch(f.skill){
    case 'ustaz-1': // Dawn opens as a directional fan of separate light rays.
      for(let k=-3;k<=3;k++){const angle=a+k*.16,len=230*Math.min(1,.3+t*4);
        line(x+Math.cos(angle)*25,y+Math.sin(angle)*25,x+Math.cos(angle)*len,y+Math.sin(angle)*len,k===0?5:2,0xfff1ae)}
      arc(160+Math.min(t,.3)*180,a-.62,a+.62,3);break;
    case 'ustaz-2': {
      if(!state.orbit)break;
      const radius=state.orbit.rad*(state.orbit.holy?1.4:1);
      ring(x,y,radius);
      for(let k=0;k<state.orbit.n;k++){const angle=state.orbit.ang+k*Math.PI*2/state.orbit.n,cx=x+Math.cos(angle)*radius,cy=y+Math.sin(angle)*radius;
        spark(cx,cy,6);line(cx,cy,cx-Math.cos(angle+.5)*12,cy-Math.sin(angle+.5)*12,2,color,.6)}break;
    }
    case 'ustaz-3':
      for(let k=0;k<3;k++)ring(x,y,40+Math.max(0,t-k*.1)*230,1,0xfff5cc,1-k*.2);
      for(let k=0;k<12;k++){const angle=k*Math.PI/6,r=50+t*200;spark(x+Math.cos(angle)*r,y+Math.sin(angle)*r,4)}break;
    case 'ustaz-4': { // Persistent canopy anchored to the actual healing ward.
      const r=215;ring(x,y,r);ring(x,y,r*.88,.5,0xfff9dd);
      fx.lineStyle(3,0xfff5c3,opacity*.75).beginPath().arc(x,y,r,Math.PI,Math.PI*2).strokePath();
      for(let k=-2;k<=2;k++){const px=x+k*70,h=Math.sqrt(r*r-k*k*4900);
        line(px,y,px,y-h,2,color,.45);spark(px,y-h,9)}
      for(let k=0;k<12;k++){const angle=k*Math.PI/6+t*.15;const px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r*.5;
        line(px,py,px,py-32,3);spark(px,py-32,5)}break;
    }
    case 'rempit-1':
      for(const side of [-1,1])line(x-dx*130-dy*side*22,y-dy*130+dx*side*22,x+dx*35-dy*side*22,y+dy*35+dx*side*22,4,0xffdb8c);
      arc(36,a-Math.PI*.5,a+Math.PI*.5,5);break;
    case 'rempit-2':
      for(let k=0;k<7;k++){const travel=(t*3+k/7)%1,px=x-dx*(25+travel*100),py=y-dy*(25+travel*100),w=12*(1-travel);
        fx.fillStyle(k%2?0xffed8a:0xff743b,opacity*(1-travel)*.65).fillTriangle(px-dy*w,py+dx*w,px+dy*w,py-dx*w,px-dx*30,py-dy*30)}break;
    case 'rempit-3':
      for(let k=0;k<4;k++){const r=30+Math.max(0,t-k*.08)*300;ring(x,y,r,1,0xffe5a1,1-k*.17)}
      for(let k=0;k<8;k++){const angle=k*Math.PI/4,r=120+t*90;line(x+Math.cos(angle)*r,y+Math.sin(angle)*r,x+Math.cos(angle)*(r+20),y+Math.sin(angle)*(r+20),3)}break;
    case 'rempit-4':
      for(let k=-3;k<=3;k++){const offset=k*18,len=100+((t*300+k*43)%150+150)%150;
        line(x-dy*offset-dx*30,y+dx*offset-dy*30,x-dy*offset-dx*len,y+dx*offset-dy*len,Math.abs(k)===3?4:2,k%2?0x91e9ff:0xffdf83)}
      for(const side of [-1,1]){line(x-dy*side*44-dx*65,y+dx*side*44-dy*65,x+dx*45,y+dy*45,4,0xa3efff)}
      ring(x,y,55,.6,0xa3efff);break;
    case 'nok-1':
      line(x,y,x+dx*230,y+dy*230,10,0xffb985,.4);line(x,y,x+dx*230,y+dy*230,3,0xffffff);
      for(const side of [-1,1])line(x+dx*200-dy*side*35,y+dy*200+dx*side*35,x+dx*240,y+dy*240,4);break;
    case 'nok-2':
      for(let k=0;k<3;k++){const angle=t*15+k*Math.PI*2/3;arc(105,angle,angle+1.8,5,k===0?0xffffff:color)}break;
    case 'nok-3':
      ring(x,y,55,.5,0xffdd82);ring(x,y,75,.5,0xffdd82,.5);
      for(let k=0;k<8;k++){const angle=k*Math.PI/4+t*.8,px=x+Math.cos(angle)*55,py=y+Math.sin(angle)*28-15;spark(px,py,5,0xffdf8a)}break;
    case 'nok-4': {
      const radius=f.r||181;
      if(age<.45){ring(x,y,radius,1,color,.5);line(x,y,x,y-220,6,0xffe9a7,.5)}
      else{const p=Math.min(1,(reduced?.35:age-.45)/.8);ring(x,y,radius*(.35+p),1,0xffdf8b);
        for(let k=0;k<10;k++){const angle=k*Math.PI/5,len=radius*.88*(.4+p*.6),mx=x+Math.cos(angle)*len*.6,my=y+Math.sin(angle)*len*.6;
          floor.lineStyle(3,0xffdb93,opacity).beginPath().moveTo(x,y).lineTo(mx-Math.sin(angle)*12,my+Math.cos(angle)*12).lineTo(x+Math.cos(angle)*len,y+Math.sin(angle)*len).strokePath()}
        for(let k=0;k<7;k++){const px=x+(k-3)*35;line(px,y,px,y-(70+Math.sin(k+1)*35)*(1-p),4,0xffedc1)}
      }break;
    }
    case 'lan-1':
      for(let k=0;k<7;k++){const d=t*330-k*17,px=x+dx*d-dy*Math.sin(t*12-k)*14,py=y+dy*d+dx*Math.sin(t*12-k)*14;
        spark(px,py,Math.max(3,10-k),k%2?color:0xe6ffff)}break;
    case 'lan-2':
      for(const ally of state.sea?.allies||[]){ring(ally.x,ally.y,18,.5);line(x,y-25,ally.x,ally.y-15,1,color,.22);spark(ally.x,ally.y-25,4)}break;
    case 'lan-3':
      for(let k=0;k<4;k++){const r=25+Math.max(0,t-k*.08)*300;ring(x,y,r,.65,k%2?color:0xd6ffff)}
      for(let k=0;k<16;k++){const angle=k*Math.PI/8,r=40+t*230;line(x+Math.cos(angle)*r,y+Math.sin(angle)*r*.65,x+Math.cos(angle)*r,y+Math.sin(angle)*r*.65-18*Math.sin(Math.min(1,t/.75)*Math.PI),2)}break;
    case 'lan-4':
      for(let k=0;k<4;k++)ring(x,y,100+k*35+Math.sin(t*2+k)*7,.55,k%2?0xd8ffff:color,.7);
      for(let k=0;k<8;k++){const angle=k*Math.PI/4,px=x+Math.cos(angle)*195,py=y+Math.sin(angle)*107,h=80+Math.sin(t*4+k)*35;
        line(px,py,px,py-h,5,color,.5);spark(px,py-h,8,0xd5ffff)}
      for(const strike of state.sea?.strikes||[])line(strike.x,strike.y-160*strike.t/strike.t0,strike.x,strike.y-15,2,0xcdffff,.7);break;
    case 'sari-1':
      arc(130,a-1.15+Math.min(t*3,1),a+1.15,7,0xffdd95);
      arc(112,a-1.15,a+1.15-Math.min(t*3,1),3,0xffffff);break;
    case 'sari-2':
      for(let k=0;k<4;k++){const d=20+k*30,px=x-dx*d,py=y-dy*d;
        line(px-dy*18,py+dx*18,px+dx*26,py+dy*26,3,color,1-k*.18);line(px+dy*18,py-dx*18,px+dx*26,py+dy*26,3,color,1-k*.18)}break;
    case 'sari-3':
      for(let k=0;k<5;k++){const angle=k*Math.PI*2/5+t*.5,px=x+Math.cos(angle)*45,py=y+Math.sin(angle)*25;
        fx.lineStyle(2,color,opacity*.8).strokeEllipse(px,py,24,40)}
      ring(x,y,52);break;
    case 'sari-4':
      for(const side of [-1,1])for(let k=0;k<7;k++){
        const spread=Math.min(1,t/.3),px=x+side*(25+k*18)*spread,py=y-35-k*11+Math.sin(t*3)*8;
        feather(px,py,side>0?-.45-k*.08:Math.PI+.45+k*.08,45+k*5);
      }
      ring(x,y,95,.5,0xffd388);
      for(const strike of state.sea?.strikes||[])feather(strike.x,strike.y-150*strike.t/strike.t0,Math.PI/2,40);break;
  }
}
