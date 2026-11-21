// Contact with the horde and avoidable attacks keep separate cadences. A
// touching ghost must never grant i-frames that swallow a telegraphed hit.
export const CONTACT = 'contact';

export function blocksHit(p, type) {
  if (p.invuln > 0 || p.shield > 0) return true;
  return type === CONTACT && (p.contactCd > 0 || p.dash?.contactImmune === true || p.super > 0);
}

export function armHitGrace(p, type, grace) {
  if (type === CONTACT) p.contactCd = Math.max(p.contactCd || 0, grace);
  else p.invuln = Math.max(p.invuln || 0, grace);
}

export function advanceHitGrace(p, dt) {
  p.invuln = Math.max(0, (p.invuln || 0) - dt);
  p.contactCd = Math.max(0, (p.contactCd || 0) - dt);
}
