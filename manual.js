'use strict';
// Guarda-roupa isométrico em traço de manual: cada peça sai da posição explodida e vai para o lugar conforme o progresso (0 a 1).
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const C = 0.866, S = 0.5;
  const W = 100, H = 170, D = 56, t = 4;
  const center = [W / 2, H / 2, D / 2];
  const P = (x, y, z) => {
    x -= center[0]; y -= center[1]; z -= center[2];
    return [((x - z) * C).toFixed(1), ((x + z) * S - y).toFixed(1)];
  };
  // Ordem de desenho de trás para a frente; at = quando a peça começa a ir para o lugar (os passos do texto são quartos do progresso); off = de onde a peça vem.
  const parts = [
    {at: 0.1, box: [0, 0, 0, W, H, 2], off: [0, 0, -80]},
    {at: 0.16, box: [0, 0, 0, t, H, D], off: [-90, 0, 0]},
    {at: 0.22, box: [t, 0, 0, W - 2 * t, t, D], off: [0, -70, 0]},
    {at: 0.5, box: [t, H * 0.55, 2, W - 2 * t, t, D - 4], off: [0, 0, 100]},
    {at: 0.28, box: [W - t, 0, 0, t, H, D], off: [90, 0, 0]},
    {at: 0.56, box: [0, H, 0, W, t, D], off: [0, 80, 0]},
    {at: 0.76, box: [0, 4, D, W / 2 - 1, H - 4, t], off: [-30, 0, 90], handle: W / 2 - 7},
    {at: 0.8, box: [W / 2 + 1, 4, D, W / 2 - 1, H - 4, t], off: [30, 0, 90], handle: W / 2 + 7},
  ];
  const ease = (v) => 1 - Math.pow(1 - v, 3);
  const poly = (pts, cls) => `<polygon class="${cls}" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
  function cuboid([x, y, z, w, h, d]) {
    const X = x + w, Y = y + h, Z = z + d;
    return poly([P(x, Y, z), P(X, Y, z), P(X, Y, Z), P(x, Y, Z)], 'f-top') +
      poly([P(x, y, Z), P(X, y, Z), P(X, Y, Z), P(x, Y, Z)], 'f-front') +
      poly([P(X, y, z), P(X, y, Z), P(X, Y, Z), P(X, Y, z)], 'f-side');
  }
  function render(svg, progress) {
    let shapes = '', flying = '', arrows = '';
    parts.forEach((part) => {
      const local = ease(Math.min(1, Math.max(0, (progress - part.at) / 0.18)));
      const k = 1 - local;
      const [x, y, z, w, h, d] = part.box;
      const [ox, oy, oz] = part.off.map((v) => v * k);
      // Peça ainda no ar vai por cima das que já estão no lugar.
      if (k > 0.3) flying += cuboid([x + ox, y + oy, z + oz, w, h, d]);
      else shapes += cuboid([x + ox, y + oy, z + oz, w, h, d]);
      if (part.handle && local > 0.98) {
        const [a, b] = [P(part.handle, H * 0.48, D + t), P(part.handle, H * 0.48 + 22, D + t)];
        shapes += `<line class="handle" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
      }
      if (k > 0.02) {
        const from = P(x + w / 2 + ox, y + h / 2 + oy, z + d / 2 + oz);
        const to = P(x + w / 2, y + h / 2, z + d / 2);
        arrows += `<line class="path" x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}"/><circle class="target" cx="${to[0]}" cy="${to[1]}" r="2.5"/>`;
      }
    });
    svg.innerHTML = arrows + shapes + flying;
  }
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Topo: monta sozinho ao abrir.
  const hero = document.querySelector('[data-iso="auto"]');
  if (hero) {
    const figure = hero.closest('.manual-figure');
    if (!motion) { render(hero, 1); figure.classList.add('done'); }
    else {
      render(hero, 0);
      const start = performance.now() + 400;
      (function frame(now) {
        const p = Math.min(1, Math.max(0, (now - start) / 2600));
        render(hero, p);
        if (p < 1) requestAnimationFrame(frame); else figure.classList.add('done');
      })(performance.now());
    }
  }

  // Passo a passo: a rolagem monta o móvel e acende o passo da vez.
  const scrub = document.querySelector('[data-iso="scroll"]');
  if (scrub) {
    const stage = scrub.closest('.manual-stage');
    const steps = [...stage.querySelectorAll('.manual-steps li')];
    let pending = false, last = -1;
    const update = () => {
      pending = false;
      const rect = stage.getBoundingClientRect();
      const p = motion ? Math.min(1, Math.max(0, (innerHeight * 0.35 - rect.top) / (rect.height - innerHeight * 0.6))) : 1;
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      render(scrub, p);
      // Acende o passo mais perto do meio da tela (e os anteriores).
      let active = 0, best = Infinity;
      steps.forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - innerHeight / 2);
        if (dist < best) { best = dist; active = i; }
      });
      steps.forEach((li, i) => li.classList.toggle('on', i <= active));
    };
    addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, {passive: true});
    addEventListener('resize', update);
    update();
  }

  // Nível de bolha: a bolha corre com o mouse (ou com o dedo, no celular) e avisa quando centraliza.
  const level = document.querySelector('[data-level]');
  if (level && motion) {
    const bubble = level.querySelector('.level-bubble');
    const label = level.querySelector('[data-level-label]');
    const touch = matchMedia('(hover: none)').matches;
    if (touch) label.textContent = 'Arraste para nivelar';
    let pos = 60, vel = 0, target = 60, running = false;
    const limit = () => level.querySelector('.level-tube').clientWidth / 2 - 20;
    function step() {
      vel = (vel + (target - pos) * 0.07) * 0.84;
      pos += vel;
      bubble.style.transform = `translateX(${pos.toFixed(2)}px)`;
      const centered = Math.abs(pos) < 6 && Math.abs(vel) < 0.4;
      level.classList.toggle('aligned', centered);
      label.textContent = centered ? 'Alinhado.' : touch ? 'Arraste para nivelar' : 'Mexa o mouse para nivelar';
      running = Math.abs(target - pos) > 0.1 || Math.abs(vel) > 0.05;
      if (running) requestAnimationFrame(step);
    }
    const aim = (clientX, spread) => {
      const box = level.getBoundingClientRect();
      const max = limit();
      target = Math.max(-max, Math.min(max, (clientX - (box.left + box.width / 2)) * spread));
      if (!running) { running = true; requestAnimationFrame(step); }
    };
    if (touch) level.addEventListener('pointermove', (e) => aim(e.clientX, 1));
    else addEventListener('pointermove', (e) => aim(e.clientX, 0.35), {passive: true});
    step();
  }
})();

// Cada seção vira uma página do manual: faixa com o nome e o número da página.
(() => {
  const pages = [...document.querySelectorAll('[data-page]')];
  const total = String(pages.length).padStart(2, '0');
  pages.forEach((page) => {
    const strip = document.createElement('div');
    strip.className = 'page-strip';
    strip.setAttribute('aria-hidden', 'true');
    strip.innerHTML = `<span>Manual de montagem · Hede</span><span>${page.dataset.pageName}</span><span>Página ${page.dataset.page}/${total}</span>`;
    page.prepend(strip);
    const eyebrow = page.dataset.page !== '01' && page.querySelector('.eyebrow');
    if (eyebrow) eyebrow.insertAdjacentHTML('beforebegin', `<span class="page-num" aria-hidden="true">${page.dataset.page}</span>`);
  });
})();
