export interface Point { x: number; y: number }
export interface Enemy extends Point {
  objective?: Point; type: string; name?:string; r: number; hp: number; maxHp: number; phase: number;
  warningPoint?:Point|null; attackAngle?:number; attackAt?:number; windup?:number;
  folkloreMarks?:import('../content/folklore-monsters.js').FolkloreMark[]|null; folkloreRelease?:number;
  stride?:number; moving?:boolean; encounter?:string;
  flash: number; stun: number; burnT: number; boss?: boolean; dead?: boolean;
  scale?: number; p2?: boolean; elite?: string; vulnerable?: number; rush?:number; rx?:number; ry?:number;
}
export interface Effect extends Point {
  kind?: string; c?: string; life: number; max: number; r?: number; size?: number;
  reedCount?:number; castAt?:number; cross?:Point; tx?:number; ty?:number; flourish?:string; skill?: string; hero?: string; slot?: number; range?: number; a?: number; half?: number; len?: number; w?: number;
}
export interface RaidState {
  portal: (Point & {life: number}) | null;
  tele: (Point & {r: number; t: number; max: number})[];
  spawns: (Point & {t: number; max: number})[];
  lane: (Point & {dx: number; dy: number; len: number; w: number; k: number}) | null;
  eclipse: (Point & {r: number; t: number; max: number}) | null;
  orb: Point | null;
}
export interface Encounter extends Point {
  id:string; name:string; slot:string; status:string; discovered:boolean; track?:number; hp?:number;
  guidance?:Point & {verb:string;label:string};
  companion?:Point & {moving:boolean};
}
export interface RunState {
  practice:{complete:boolean;finishAt?:number}|null;
  bunian?:Point & {greeted:boolean};
  encounters:Record<string,Encounter>;
  jettyWork?:{active:boolean;elapsed:number};
  wauWind?:{phase:'ready'|'raising'|'gust'|'cooldown';progress:number};
  lootModal:string|null;
  world: ReturnType<typeof import('../content/world.js').createWorld>;
  exploration: {visited:string[];claimed:string[];guards:Record<string,Enemy[]>};
  roster:Record<string,unknown>;
  hero: {id: string; name: string; hp: number; identity: {color: string; max: number}};
  identity: {charge: number; releaseT: number; castT: number; castMax: number; castSlot: number; castAngle: number};
  stage: {id: string; name: string; ground: string};
  campaignRoute: keyof typeof import('../content/campaign-routes.js').CAMPAIGN_ROUTES;
  p: Point & {r: number; hp: number; maxHp: number; face: number[]; moving?: boolean; normalMove?: {dx:number;dy:number}|null; invuln: number; hurt: number; shield: number; vx: number; vy: number};
  t: number; clock: number; shake: number; paused: boolean; choosing: boolean; over: boolean;
  level: number; pending: number; kills: number; coins: number; ult: number;
  raid: {won?: boolean} | null; boss: Enemy | null; raidBoss?: Enemy | null;
  enemies: Enemy[];
  zones: (Point & {kind: string; life: number; max: number; r: number; c?:string})[];
  equipmentDrops: (Point & {event:string; slot:string; collectAt:number})[];
  gems: (Point & {kind?: string; v: number})[];
  pups: (Point & {type: string; t: number; life: number})[];
  projs: (Point & {hero?:string; hitOptions?:{hero?:string;slot?:number}; kind?: string; r: number; spin?: number; back?: boolean; vx: number; vy: number})[];
  eprojs: (Point & {r: number; c?: string})[];
  marbles: Point[]; durians: (Point & {t: number})[];
  fx: Effect[];
  texts: (Point & {s: string; size: number; c: string; life: number; max: number; kind?: string; lane?: number})[];
  orbit: {ang: number; n: number; rad: number; holy: boolean} | null;
  sea?: {
    allies: Point[]; images: (Point & {t: number; r: number})[];
    strikes: (Point & {r: number; t: number; t0: number; kind: string})[];
    fx: Effect[]; stance: number; wai: number; show: number;
    leap: {t: number; dur: number; tx: number; ty: number} | null;
  };
}
export interface GameRuntime {
  readonly audio: import('./skill-audio.js').SkillAudio;
  readonly G: RunState | null;
  readonly scale: number;
  readonly joystick: ({ox: number; oy: number} & Point) | null;
  readonly raid: {readonly state: RaidState | null; ARENA: Point & {r: number}; spawnPortal(): void; enter(): void; force(value: string): void};
  resize(width: number, height: number): void;
  step(delta: number): void;
  destroy(): void;
  newGame(id: string, stage?: number): void;
  tryCast(index: number): void;
  dropPup(x: number, y: number, kind?: string): void;
  openLevelUp(): void;
  addXP(amount: number): void;
  makeGhost(type: string, x: number, y: number): Enemy;
  kill(enemy: Enemy): void;
  endGame(won: boolean, reason?: 'night'): Promise<void>;
  toMenu(): void;
  togglePause(): void;
}
export function createRuntime(canvas: HTMLCanvasElement,art:{prepareHero(id:string):Promise<void>;isHeroPrepared(id:string):boolean}): GameRuntime;
