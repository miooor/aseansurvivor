type Frame = {sheet: 'motion' | 'skills'; row: number};
const motion = (row: number): Frame => ({sheet: 'motion', row});
const skill = (row: number): Frame => ({sheet: 'skills', row});

type Recovery = {
  recoil: Frame;
  ready: Frame;
  catchTime: number;
  duration: number;
  lean: number;
};

// Each pair is a follow-through and a held stance from the directional sheets.
// Moving heroes return to the current stride phase.
const recoveries: Record<string, Recovery> = {
  // Fadli gathers the lantern back to his chest.
  ustaz: {recoil: skill(6), ready: skill(4), catchTime: .14, duration: .38, lean: -.035},
  // Kama tips the bike forward, then settles back over the bars.
  rempit: {recoil: skill(7), ready: motion(7), catchTime: .10, duration: .29, lean: .10},
  // Nok retracts the punch to a high, closed guard.
  nok: {recoil: motion(5), ready: motion(7), catchTime: .08, duration: .33, lean: -.075},
  // Lan lowers the puppet hands before lifting them back into position.
  lan: {recoil: skill(4), ready: motion(4), catchTime: .15, duration: .41, lean: .06},
  // Sari folds the extended blade arm in against her body.
  sari: {recoil: motion(6), ready: skill(6), catchTime: .10, duration: .36, lean: -.09},
  // Auntie Karen stacks the cashed chopes and pockets the bundle.
  asha: {recoil: skill(3), ready: skill(0), catchTime: .09, duration: .28, lean: -.045},
  // The cook settles the heavy wok against his hip.
  mira: {recoil: skill(3), ready: skill(5), catchTime: .16, duration: .46, lean: -.095},
  // The Gold Sultan steadies the melter after firing, then lowers it to carry.
  dani: {recoil: motion(6), ready: motion(7), catchTime: .16, duration: .43, lean: .04},
  // Vanna sweeps the shuttle across and gathers the ribbon.
  vanna: {recoil: skill(3), ready: skill(6), catchTime: .13, duration: .37, lean: -.08},
  // Keo raises the reeds for a breath, then lowers them to playing height.
  keo: {recoil: skill(6), ready: skill(4), catchTime: .14, duration: .42, lean: -.05},
  // Nadi draws the palm strike back into guard.
  nadi: {recoil: skill(3), ready: skill(5), catchTime: .12, duration: .39, lean: .07},
  // Lia draws her throwing hand back into guard.
  lia: {recoil: motion(6), ready: skill(2), catchTime: .08, duration: .28, lean: .10},
};

export function recoveryPose(id: string, age: number, castFacing: number, travelFacing: number, moving: boolean, reduced: boolean, walkRow: number) {
  const pose = recoveries[id];
  if (!pose || age < 0 || age >= pose.duration) return null;
  const catching = age < pose.catchTime;
  const stepping = moving && !catching;
  const facing = stepping ? travelFacing : castFacing;
  const frame = stepping ? motion(walkRow)
    : catching ? pose.recoil : pose.ready;
  const rotation = reduced ? 0 : pose.lean * Math.cos(facing * Math.PI / 4) * Math.sin(Math.PI * age / pose.duration);
  return {sheet: frame.sheet, frame: frame.row * 8 + facing, rotation};
}
