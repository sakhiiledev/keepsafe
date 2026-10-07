(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- the three days: scene switching ---------------- */
  const story = $('.story');
  const stage = $('.stage');
  const steps = $$('.step');
  const rainLevel = {
    snap: .45, drive: 1, replay: .5, phone: .35, phone2: .35, ceiling: .15, regret: .3,
    flu: .6, messages: .4, space: .25, loud: .15, drift: .35,
    engine: .5, clinic: .25, rx: .15, cure: 0, day4: 0
  };
  let rainTarget = .45;

  function setStep(step) {
    steps.forEach(s => s.classList.toggle('is-active', s === step));
    const scene = step.dataset.scene;
    stage.dataset.scene = scene;
    const idx = steps.indexOf(step);
    const healed = scene === 'cure' || scene === 'day4';
    stage.classList.toggle('is-snapped', idx >= 1 && !healed);
    story.classList.toggle('is-warm', healed);
    rainTarget = rainLevel[scene] ?? .3;
  }
  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setStep(e.target); });
  }, { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach(s => stepObserver.observe(s));

  /* ---------------- rain on glass ---------------- */
  const canvas = $('#rain');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, level = .45, storyVisible = false;
  const beads = [];   // still droplets on the glass
  const runs = [];    // drops running down

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const rand = (a, b) => a + Math.random() * (b - a);

  function drawDrop(x, y, r, alpha) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * .85, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190,205,225,${.16 * alpha})`;
    ctx.fill();
    ctx.lineWidth = .6;
    ctx.strokeStyle = `rgba(230,238,248,${.22 * alpha})`;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - r * .3, y - r * .35, Math.max(.6, r * .22), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${.55 * alpha})`;
    ctx.fill();
  }

  function tick() {
    if (storyVisible) {
      level += (rainTarget - level) * .02;
      const area = (W * H) / (1280 * 800);
      const wantBeads = Math.round(320 * level * area);
      while (beads.length < wantBeads) beads.push({ x: rand(0, W), y: rand(0, H), r: rand(.8, 3.2), a: 0 });
      if (beads.length > wantBeads) beads.splice(0, Math.min(4, beads.length - wantBeads));
      if (Math.random() < level * .5) runs.push({ x: rand(0, W), y: rand(-20, H * .6), r: rand(2.5, 5), v: rand(.6, 1.6), wob: rand(0, 6.28) });

      ctx.clearRect(0, 0, W, H);
      for (const b of beads) { b.a = Math.min(1, b.a + .03); drawDrop(b.x, b.y, b.r, b.a); }
      for (let i = runs.length - 1; i >= 0; i--) {
        const d = runs[i];
        d.v = Math.min(9, d.v * 1.012 + .02);
        d.y += d.v; d.wob += .08; d.x += Math.sin(d.wob) * .35;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.r * 9);
        ctx.lineTo(d.x, d.y);
        ctx.lineWidth = d.r * .55;
        ctx.strokeStyle = 'rgba(210,222,238,.10)';
        ctx.stroke();
        drawDrop(d.x, d.y, d.r, 1);
        if (Math.random() < .02 && beads.length < 600) beads.push({ x: d.x, y: d.y - d.r * 4, r: rand(.6, 1.6), a: 1 });
        if (d.y > H + 20) runs.splice(i, 1);
      }
      if (level < .02 && runs.length === 0) ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(tick);
  }
  new IntersectionObserver(([e]) => { storyVisible = e.isIntersecting; }).observe(story);
  window.addEventListener('resize', resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(tick);

  /* ---------------- reveals ---------------- */
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      revealer.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -18% 0px' });

  $$('.memory-text > p, .memory-text > h3').forEach(el => { el.classList.add('reveal'); revealer.observe(el); });
  $$('.wins li, .compass, .did, .you-item').forEach(el => revealer.observe(el));

  // stars for "that night"
  const night = $('.memory-night');
  const stars = $('.stars');
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    s.style.left = rand(2, 98) + '%';
    s.style.top = rand(2, 98) + '%';
    s.style.setProperty('--o', rand(.4, 1).toFixed(2));
    s.style.setProperty('--d', rand(1.8, 4.5).toFixed(1) + 's');
    s.style.transitionDelay = rand(0, 1.4).toFixed(2) + 's';
    if (Math.random() < .3) { s.style.width = s.style.height = '2px'; }
    stars.appendChild(s);
  }
  new IntersectionObserver(([e]) => night.classList.toggle('is-night', e.isIntersecting), { threshold: .3 }).observe(night);

  /* ---------------- scroll-driven bits ---------------- */
  const savings = $('.savings');
  const climb = $('.climb');
  const shaft = $('.shaft');
  const fadeMem = $('.memory-fade');
  const vh = () => window.innerHeight;

  function along(el, from = .85, span = .5) {
    const top = el.getBoundingClientRect().top;
    return clamp((vh() * from - top) / (vh() * span));
  }
  function onScroll() {
    savings.style.setProperty('--p', along(savings).toFixed(3));
    climb.style.setProperty('--c', along(climb, .85, .45).toFixed(3));
    shaft.style.setProperty('--s', along(shaft, .8, .55).toFixed(3));
    const r = fadeMem.getBoundingClientRect();
    const t = clamp((vh() * .7 - r.top) / (r.height + vh() * .1));
    fadeMem.style.setProperty('--g', clamp(Math.sin(Math.PI * t * 1.15)).toFixed(3));
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------------- videos play when seen ---------------- */
  const videoWatcher = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
    });
  }, { threshold: .35 });
  function watchVideo(v) { if (!reduceMotion) videoWatcher.observe(v); }
  $$('.memory video').forEach(watchVideo);

  $$('.sound').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.parentElement.querySelector('video');
      v.muted = !v.muted;
      if (!v.muted) v.play().catch(() => {});
      btn.setAttribute('aria-pressed', String(!v.muted));
      btn.textContent = v.muted ? 'tap for sound' : 'sound on ♪';
    });
  });

  /* ---------------- the letter ---------------- */
  const envelope = $('#envelope');
  const letterSec = $('.letter-sec');
  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('is-open')) return;
    envelope.classList.add('is-open');
    envelope.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      letterSec.classList.add('is-read');
      $('.paper').focus({ preventScroll: true });
    }, reduceMotion ? 0 : 1100);
  });

  /* ---------------- to fix: mend the heart ---------------- */
  const cracks = $$('.cracks path');
  const promises = $$('.promises li');
  const mendedEl = $('#mended');
  const heart = $('.fix-heart');
  const mendObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const i = promises.indexOf(e.target);
      e.target.classList.add('is-in');
      cracks[i]?.classList.add('is-gold');
      const count = promises.filter(p => p.classList.contains('is-in')).length;
      mendedEl.textContent = count;
      heart.classList.toggle('is-whole', count === promises.length);
      mendObserver.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -40% 0px' });
  promises.forEach(p => mendObserver.observe(p));

  /* ---------------- gallery: photos on the line ---------------- */
  const media = [
    ...Array.from({ length: 11 }, (_, i) => ({ type: 'img', src: `assets/media/photo-${String(i + 1).padStart(2, '0')}.jpg` })),
    { type: 'video', src: 'assets/media/video-02.mp4', poster: 'assets/media/video-02-poster.jpg' },
    { type: 'video', src: 'assets/media/video-03.mp4', poster: 'assets/media/video-03-poster.jpg' },
    { type: 'video', src: 'assets/media/video-01.mp4', poster: 'assets/media/video-01-poster.jpg' }
  ];
  // mix the videos in between the photos
  const order = [0, 1, 11, 2, 3, 4, 5, 12, 6, 7, 8, 9, 13, 10];
  const items = order.map(i => media[i]);
  const groups = [items.slice(0, 5), items.slice(5, 10), items.slice(10)];
  const linesEl = $('#lines');
  const pegs = [];

  groups.forEach(group => {
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = '<div class="line-scroll"><div class="line-track"><svg class="line-string" preserveAspectRatio="none"><path/></svg></div></div>';
    const track = $('.line-track', line);
    group.forEach(item => {
      const index = items.indexOf(item);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'peg';
      btn.setAttribute('aria-label', item.type === 'video' ? 'Play video' : 'Open photo');
      btn.style.setProperty('--tilt', (rand(1, 3.2) * (pegs.length % 2 ? 1 : -1)).toFixed(1) + 'deg');
      const inner = item.type === 'video'
        ? `<video src="${item.src}" poster="${item.poster}" muted loop playsinline preload="none"></video><span class="peg-play">▶ play</span>`
        : `<img src="${item.src}" alt="" loading="lazy">`;
      btn.innerHTML = `<span class="peg-card">${inner}</span>`;
      btn.addEventListener('click', () => openLightbox(index));
      track.appendChild(btn);
      pegs.push(btn);
      const v = btn.querySelector('video');
      if (v) watchVideo(v);
    });
    linesEl.appendChild(line);
    new IntersectionObserver(([e]) => line.classList.toggle('in-view', e.isIntersecting)).observe(line);
  });

  function hangLines() {
    $$('.line-track').forEach(track => {
      const w = track.scrollWidth;
      const sag = Math.min(70, w * .05);
      const path = track.querySelector('.line-string path');
      const svg = track.querySelector('.line-string');
      svg.setAttribute('viewBox', `0 0 ${w} 120`);
      svg.style.width = w + 'px';
      path.setAttribute('d', `M0 14 Q ${w / 2} ${14 + sag * 2} ${w} 14`);
      $$('.peg', track).forEach(peg => {
        const t = (peg.offsetLeft + peg.offsetWidth / 2) / w;
        peg.style.setProperty('--sag', (4 * sag * t * (1 - t)).toFixed(1) + 'px');
      });
    });
  }
  window.addEventListener('resize', hangLines);
  window.addEventListener('load', hangLines);
  hangLines();

  /* ---------------- lightbox ---------------- */
  const lb = $('#lightbox');
  const lbMedia = $('#lb-media');
  let current = 0;
  function render() {
    const item = items[current];
    lbMedia.innerHTML = item.type === 'video'
      ? `<video src="${item.src}" poster="${item.poster}" controls autoplay playsinline></video>`
      : `<img src="${item.src}" alt="">`;
  }
  function openLightbox(i) { current = i; render(); lb.showModal(); }
  function step(d) { current = (current + d + items.length) % items.length; render(); }
  $('.lb-close').addEventListener('click', () => lb.close());
  $('.lb-prev').addEventListener('click', () => step(-1));
  $('.lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => { lbMedia.innerHTML = ''; });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------------- invite ---------------- */
  const accept = $('#accept');
  const reservation = $('#reservation');
  const petals = $('#petals');
  accept.addEventListener('click', async () => {
    if (accept.getAttribute('aria-expanded') === 'true') return;
    accept.setAttribute('aria-expanded', 'true');
    accept.textContent = 'Accepted ♡';
    reservation.hidden = false;

    // show the real reservation PDF if it's been added
    try {
      const res = await fetch('assets/reservation.pdf', { method: 'HEAD' });
      if (res.ok) {
        $('#res-pdf').innerHTML = '<iframe src="assets/reservation.pdf" title="Our reservation"></iframe><br><a href="assets/reservation.pdf" download>Download the reservation</a>';
        $('#res-card').hidden = true;
      }
    } catch (_) { /* keep the card */ }

    if (!reduceMotion) {
      for (let i = 0; i < 60; i++) {
        const p = document.createElement('span');
        p.className = 'petal';
        p.style.left = rand(0, 100) + '%';
        p.style.setProperty('--t', rand(3, 6).toFixed(1) + 's');
        p.style.setProperty('--dx', rand(-120, 120).toFixed(0) + 'px');
        p.style.setProperty('--r', rand(180, 720).toFixed(0) + 'deg');
        p.style.animationDelay = rand(0, 1.5).toFixed(2) + 's';
        petals.appendChild(p);
        setTimeout(() => p.remove(), 8000);
      }
    }
    setTimeout(() => reservation.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }), 600);
  });
})();
