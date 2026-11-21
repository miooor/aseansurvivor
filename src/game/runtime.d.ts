export interface Point { x: number; y: number }
export interface RunSetup {
  seed:number; veteran:boolean; autoMode:number; upgrades:Record<string,number>;
  campaignRoute:keyof typeof import('../content/campaign-routes.js').CAMPAIGN_ROUTES;
}
export interface Enemy extends Point {
  objective?: Point; type: string; name?:string; r: number; hp: number; maxHp: number; phase: number;
  warningPoint?:Point|null; attackAngle?:number; attackAt?:number; windup?:number; castMax?:number;
  monsterSkill?:import('../content/monster-skills.js').MonsterSkill|null; faceX?:boolean;
  folkloreMarks?:import('../content/folklore-monsters.js').FolkloreMark[]|null; folkloreRelease?:number;
  stride?:number; moving?:boolean; encounter?:string; packId?:number; packRecovery?:number; fear?:number;
  flash: number; stun: number; burnT: number; boss?: boolean; dead?: boolean; slowT?: number; shockUntil?: number; weakUntil?: number; slamWind?: number; slamR?: number;
  emberRunner?:boolean; carry?:number;
  routeGuard?:boolean;
  nightEcho?:'gasp'|'fragment'|'revived'; nightSouls?:number;
  bossEscort?:'ward'|'escort'|'reinforcement'; wardEscort?:Enemy;
  scale?: number; p2?: boolean; elite?: string; vulnerable?: number; rush?:number; rx?:number; ry?:number;
}
export interface Effect extends Point {
  kind?: string; c?: string; life: number; max: number; r?: number; size?: number;
  waveIndex?:number; footY?:number; reedCount?:number; castAt?:number; cross?:Point; tx?:number; ty?:number; flourish?:string; skill?: string; hero?: string; slot?: number; range?: number; a?: number; half?: number; len?: number; w?: number;
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
  id:string; name:string; status:string; discovered:boolean; track?:number; hp?:number;
  guidance?:Point & {verb:string;label:string};
  companion?:Point & {moving:boolean};
}
export interface RunState {
  setup:RunSetup;
  routeChallenge:{definition:{name:string;entry:Point};enemies:Enemy[];started:boolean;cleared:boolean}|null;
  practice:{complete:boolean;noCooldown:boolean}|null;
  bunian?:Point & {greeted:boolean; talking?:boolean; dismissed?:boolean; line?:number};
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
  p: Point & {r: number; hp: number; maxHp: number; face: number[]; moving?: boolean; normalMove?: {dx:number;dy:number}|null; invuln: number; hurt: number; disruptedUntil?:number; nightStatus:Record<string,number|undefined>; super:number; exhaust:number; shield: number; vx: number; vy: number};
  t: number; clock: number; shake: number; paused: boolean; choosing: boolean; over: boolean;
  level: number; pending: number; kills: number; coins: number; ult: number;
  raid: {won?: boolean} | null; boss: Enemy | null; raidBoss?: Enemy | null;
  enemies: Enemy[];
  zones: (Point & {kind: string; slot?:number; life: number; max: number; r: number; c?:string})[];
  equipmentDrops: (Point & {event:string; slot:string; item?:string; collectAt:number})[];
  nightHazards: (Point & {kind:'ember'|'mirage'|'revive';r:number;t:number;max:number;anchored?:boolean;waiting?:boolean})[];
  gems: (Point & {kind?: string; v: number})[];
  shrineId: keyof typeof import('../content/shrines.js').SHRINES | null;
  shrineT: number;
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
    knee: {ax:number; ay:number; elapsed:number; duration:number} | null;
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
  newGame(id: string, stage?: number, practice?:boolean, setup?:Partial<RunSetup>): void;
  tryCast(index: number): void;
  dropPup(x: number, y: number, kind?: string): void;
  openLevelUp(): void;
  addXP(amount: number): void;
  makeGhost(type: string, x: number, y: number): Enemy;
  kill(enemy: Enemy): void;
  endGame(won: boolean, reason?: 'retired'): Promise<void>;
  toMenu(): void;
  togglePause(): void;
}
export function createRuntime(canvas: HTMLCanvasElement,art:import('../scenes/SpriteAssets').SpriteAssets): GameRuntime;
