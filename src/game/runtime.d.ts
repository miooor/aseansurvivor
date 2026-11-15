export interface Point { x: number; y: number }
export interface Enemy extends Point {
  objective?: Point; type: string; name?:string; r: number; hp: number; maxHp: number; phase: number;
  windup?:number; flash: number; stun: number; burnT: number; boss?: boolean; dead?: boolean;
  scale?: number; p2?: boolean; elite?: string; vulnerable?: number; rush?:number; rx?:number; ry?:number;
  attack?: string; attackAngle?:number; enraged?:boolean;
}
export interface Effect extends Point {
  kind?: string; c?: string; life: number; max: number; r?: number; size?: number;
  skill?: string; hero?: string; slot?: number; range?: number; a?: number; half?: number; len?: number; w?: number;
}
export interface RaidState {
  portal: (Point & {life: number}) | null;
  tele: (Point & {r: number; t: number; max: number})[];
  spawns: (Point & {t: number; max: number})[];
  lane: (Point & {dx: number; dy: number; len: number; w: number; k: number}) | null;
  eclipse: (Point & {r: number; t: number; max: number}) | null;
  orb: Point | null;
}
export interface RunState {
  encounters:Record<string,{id:string;name:string;x:number;y:number;status:string;discovered:boolean;track?:number;hp?:number}>;
  lootModal:string|null;
  world: ReturnType<typeof import('../content/world.js').createWorld>;
  exploration: {visited:string[];claimed:string[];guards:Record<string,Enemy[]>};
  hero: {id: string; name: string; hp: number; identity: {color: string; max: number}};
  identity: {charge: number; releaseT: number; castT: number; castMax: number; castSlot: number; castAngle: number};
  stage: {id: string; name: string; ground: string};
  p: Point & {r: number; hp: number; maxHp: number; face: number[]; moving?: boolean; invuln: number; hurt: number; shield: number; vx: number; vy: number};
  t: number; clock: number; shake: number; paused: boolean; choosing: boolean; over: boolean;
  level: number; pending: number; kills: number; coins: number; ult: number;
  raid: {won?: boolean} | null; boss: Enemy | null; raidBoss?: Enemy | null;
  enemies: Enemy[];
  zones: (Point & {kind: string; life: number; max: number; r: number; c?:string})[];
  gems: (Point & {kind?: string; v: number})[];
  pups: (Point & {type: string; t: number; life: number})[];
  projs: (Point & {kind?: string; r: number; spin?: number; vx: number; vy: number})[];
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
  endGame(won: boolean): void;
  toMenu(): void;
  togglePause(): void;
}
export function createRuntime(canvas: HTMLCanvasElement): GameRuntime;
