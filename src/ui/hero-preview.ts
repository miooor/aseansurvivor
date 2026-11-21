import type {Frame, SpriteAssets} from '../scenes/SpriteAssets';

const CAST_INTERVAL = 1050;
const FRAME_INTERVAL = 145;
const FACING = 2; // South-facing, like the lineup portraits.
const SPRITE_SIZE = 320;
const SLOT_COUNT = 5; // Basic attack, Q, E, F, R.

export function createHeroPreview(art: SpriteAssets, wheel: HTMLElement, signal: AbortSignal) {
  const toggle = document.querySelector<HTMLButtonElement>('#heroPreviewToggle')!;
  const icon = toggle.querySelector('span')!;
  const skills = document.getElementById('heroSkills')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-preview';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = canvas.height = SPRITE_SIZE;
  canvas.hidden = true;
  const ctx = canvas.getContext('2d');
  let selected: {id: string; portrait: HTMLElement; requested: boolean} | undefined;
  let highlighted: Element | undefined;
  let paused = false;
  let elapsed = 0;
  let lastBeat = -1;

  function showIdle() {
    if (selected) selected.portrait.hidden = false;
    canvas.hidden = true;
    highlighted?.classList.remove('preview-cast');
    highlighted = undefined;
    lastBeat = -1;
  }

  function syncMotion() {
    toggle.hidden = reduced.matches || !ctx;
    if (toggle.hidden) showIdle();
  }

  function draw(frame: Frame, x: number, y: number, width: number, height: number) {
    ctx!.drawImage(frame.image, frame.x, frame.y, frame.width, frame.height, x, y, width, height);
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    const label = paused ? 'Play skill preview' : 'Pause skill preview';
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
    icon.textContent = paused ? '▶' : 'Ⅱ';
  }, {signal});
  reduced.addEventListener('change', syncMotion, {signal});
  syncMotion();

  return {
    select(id: string, portrait: HTMLElement) {
      showIdle();
      selected = {id, portrait, requested: false};
      portrait.after(canvas);
      elapsed = -300;
    },
    update(delta: number) {
      if (!selected || !ctx || reduced.matches || paused || document.hidden || !wheel.offsetWidth) return;
      const {id, portrait} = selected;
      if (!art.isHeroPrepared(id)) {
        if (!selected.requested) {
          selected.requested = true;
          // The idle portrait is the fallback if artwork cannot be loaded.
          void art.prepareHero(id).catch(() => {});
        }
        return;
      }
      selected.requested = false;
      elapsed = (elapsed + delta) % (CAST_INTERVAL * SLOT_COUNT);
      const slot = Math.floor(elapsed / CAST_INTERVAL);
      const beat = Math.floor((elapsed % CAST_INTERVAL) / FRAME_INTERVAL);
      if (slot < 0 || beat >= 4) {
        if (!canvas.hidden) showIdle();
        return;
      }
      const index = slot * 4 + beat;
      if (index === lastBeat) return;
      lastBeat = index;
      ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      const effect = art.previewEffect(id, slot, beat);
      if (effect) {
        ctx.globalAlpha = id === 'dani' && slot > 0 ? [.42, .70, .8, .50][beat] : .7;
        draw(effect, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
        ctx.globalAlpha = 1;
      }
      const row = slot === 0 ? 4 + beat : (slot - 1) * 2 + Number(beat > 0);
      const pose = art.frame((slot === 0 ? 'hero-motion-' : 'hero-skills-') + id, row * 8 + FACING);
      const width = SPRITE_SIZE * pose.width / pose.height;
      draw(pose, (SPRITE_SIZE - width) / 2, SPRITE_SIZE * .04, width, SPRITE_SIZE);
      const skill = skills.children[slot];
      if (highlighted !== skill) {
        highlighted?.classList.remove('preview-cast');
        highlighted = skill;
        highlighted?.classList.add('preview-cast');
      }
      portrait.hidden = true;
      canvas.hidden = false;
    }
  };
}
