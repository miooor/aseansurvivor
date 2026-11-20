export interface MapPoint {x:number;y:number}
export interface MapRect extends MapPoint {id?:string;w:number;h:number;frame?:number;axis?:'x'|'y'}
export interface Gangway extends MapRect {winch:MapPoint;duration:number;radius:number;open:boolean}
export interface WauLookout extends MapRect {station:MapPoint;radius:number;windup:number;sweep:number;band:number;cooldown:number}
export interface Landmark extends MapPoint {id:string;name:string;reward:number;featured?:boolean}
export interface World {
  id:string;name:string;signature:string;landmarks:Landmark[];
  buildings:MapRect[];trees:(MapPoint&{frame:number})[];blockers:MapRect[];
  waters:MapRect[];bridges:MapRect[];rocks:MapRect[];paddies:number[][];roads:number[][][];
  courts:{x:number;y:number;rx:number;ry:number;surface:'earth'|'stone'}[];
  gangway?:Gangway;
  wauLookout?:WauLookout;
  lowerGangway():void;
  clearOfRoads(rect:MapRect,pad?:number):boolean;
  tint:number;path:number;water:number;urban:boolean;
  walkable(x:number,y:number,r?:number):boolean;
  safePoint(x:number,y:number,r?:number):MapPoint;
  moveOnMap(x:number,y:number,toX:number,toY:number,r?:number):MapPoint;
  routePath(actor:MapPoint&{r?:number},target:MapPoint):MapPoint[];
  routeDirection(actor:MapPoint&{r?:number},target:MapPoint):number[];
  clearLine(a:MapPoint,b:MapPoint,r:number):boolean;
}
export const WORLD_SIZE:number,HALF:number;
export const LANDMARKS:Landmark[],BUILDINGS:MapRect[],TREES:(MapPoint&{frame:number})[],BLOCKERS:MapRect[];
export function createWorld(id?:string):World;
export const walkable:World['walkable'],safePoint:World['safePoint'],moveOnMap:World['moveOnMap'],routeDirection:World['routeDirection'],clearLine:World['clearLine'];
