/* Keepsake engine: renders a page from window.SITE (or render(site)) */
(() => {
  'use strict';

  const THEMES = {
    apology:     { name: 'Apology',     fonts: 'family=Gloock&family=Nanum+Pen+Script&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500', ambient: 'rain',     burst: 'petals' },
    anniversary: { name: 'Anniversary', fonts: 'family=Instrument+Serif:ital@0;1&family=Figtree:wght@300..600&family=Caveat:wght@500..700',               ambient: 'stars',    burst: 'gold' },
    birthday:    { name: 'Birthday',    fonts: 'family=Bagel+Fat+One&family=DM+Sans:opsz,wght@9..40,400..600&family=Gaegu:wght@700',                         ambient: 'confetti', burst: 'confetti' },
    proposal:    { name: 'Proposal',    fonts: 'family=Italiana&family=Lora:ital,wght@0,400..600;1,400&family=Pinyon+Script',                               ambient: 'petals',   burst: 'petals' },
    valentine:   { name: 'Valentine',   fonts: 'family=Shrikhand&family=Nunito:wght@400..700&family=Gochi+Hand',                                            ambient: 'hearts',   burst: 'hearts' },
    askout:      { name: 'Ask out',     fonts: 'family=Fredoka:wght@400..700&family=Outfit:wght@300..600&family=Patrick+Hand',                              ambient: 'sparkles', burst: 'confetti' },
    lobola:      { name: 'Lobola',      fonts: 'family=Abril+Fatface&family=Crimson+Pro:ital,wght@0,300..600;1,300..500&family=Dancing+Script:wght@500..700', ambient: 'sparkles', burst: 'confetti' },
    wedding:     { name: 'Traditional wedding', fonts: 'family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,300..600;1,8..60,300..500&family=Dancing+Script:wght@500..700', ambient: 'confetti', burst: 'confetti' },
    whitewedding:{ name: 'White wedding', fonts: 'family=Italiana&family=Lora:ital,wght@0,400..600;1,400&family=Pinyon+Script', ambient: 'petals', burst: 'petals' },
    invitation:  { name: 'Wedding invitation', fonts: 'family=DM+Serif+Display:ital@0;1&family=Jost:ital,wght@0,300..600;1,300..500&family=Caveat:wght@500..700', ambient: 'sparkles', burst: 'petals' },
    savedate:    { name: 'Save the date', fonts: 'family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Literata:ital,opsz,wght@0,7..72,300..600;1,7..72,300..500&family=Indie+Flower', ambient: 'confetti', burst: 'confetti' }
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let SITE = {};
  let cleanups = [];
  const onCleanup = fn => cleanups.push(fn);

  const WORDS = { greet: 'Welcome', invite: "You're invited", thanks: 'Thank you', lobola: 'lobola', wedding: 'wedding', culture: '', lang: '', yes: "I'll be there", no: "Can't make it" };
  const word = k => (SITE.words && SITE.words[k]) || WORDS[k] || '';
  const fill = s => esc(s).replace(/\{to\}/g, esc(SITE.to || '')).replace(/\{from\}/g, esc(SITE.from || ''))
    .replace(/\{(greet|invite|thanks|lobola|wedding|culture|lang|yes|no)\}/g, (_, k) => esc(word(k)));
  const paras = t => String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean).map(p => `<p>${fill(p)}</p>`).join('');
  const lines = t => Array.isArray(t) ? t : String(t || '').split('\n').map(x => x.trim()).filter(Boolean);
  // "none" means the person removed this photo spot in the builder
  const NO = v => v === 'none';
  const photo = (src, alt = '') => NO(src) ? '' : src
    ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
    : `<span class="ph" aria-hidden="true"><span class="hand">your photo</span></span>`;
  const head = (h, k) => (h || k) ? `<div class="sec-head">${k ? `<p class="hand kick">${fill(k)}</p>` : ''}${h ? `<h2 class="disp">${fill(h)}</h2>` : ''}</div>` : '';

  /* ---------------- section renderers ---------------- */
  const R = {
    hero: s => `
      <header class="sec s-hero${s.bg && !NO(s.bg) ? ' has-bg' : ''}">
        ${s.bg && !NO(s.bg) ? `<div class="hero-bg" style="background-image:url('${esc(s.bg)}')" aria-hidden="true"></div>` : ''}
        <canvas class="amb" aria-hidden="true"></canvas>
        <div class="hero-in">
          ${s.kicker ? `<p class="hand kick">${fill(s.kicker)}</p>` : ''}
          <h1 class="disp hero-title">${fill(s.title)}</h1>
          ${s.sub ? `<div class="hero-sub">${paras(s.sub)}</div>` : ''}
        </div>
        <span class="cue hand" aria-hidden="true">scroll slowly ↓</span>
      </header>`,

    counter: s => `
      <section class="sec s-counter">
        ${s.label ? `<p class="hand kick">${fill(s.label)}</p>` : ''}
        <div class="count" data-since="${esc(s.since)}">
          ${['days', 'hours', 'minutes', 'seconds'].map(u => `<div class="unit"><b class="disp" data-u="${u}">0</b><span>${u}</span></div>`).join('')}
        </div>
        ${s.after ? `<div class="c-after">${paras(s.after)}</div>` : ''}
      </section>`,

    story: s => {
      const ch = s.chapters || [];
      return `
      <section class="sec s-story">
        <div class="st-stage" aria-hidden="true">
          <canvas class="amb"></canvas>
          <div class="st-photos">${ch.map((c, i) => `<figure class="st-ph${NO(c.photo) ? ' no-ph' : ''}" data-i="${i}">${photo(c.photo)}</figure>`).join('')}</div>
        </div>
        <div class="st-steps">
          ${s.heading ? `<div class="st-step st-title" data-i="0"><h2 class="disp">${fill(s.heading)}</h2></div>` : ''}
          ${ch.map((c, i) => `<div class="st-step" data-i="${i}"><div class="st-text">${c.label ? `<p class="hand st-label">${fill(c.label)}</p>` : ''}${paras(c.text)}</div></div>`).join('')}
        </div>
      </section>`;
    },

    memories: s => `
      <section class="sec s-mem">
        ${head(s.heading, s.kicker)}
        ${(s.items || []).map((m, i) => `
          <article class="mem${i % 2 ? ' flip' : ''}${NO(m.photo) ? ' no-ph' : ''}">
            ${NO(m.photo) ? '' : `<figure class="polaroid">${photo(m.photo, m.caption)}${m.caption ? `<figcaption class="hand">${fill(m.caption)}</figcaption>` : ''}</figure>`}
            <div class="mem-text">
              ${m.title ? `<h3 class="disp reveal">${fill(m.title)}</h3>` : ''}
              ${paras(m.text).replace(/<p>/g, '<p class="reveal">')}
            </div>
          </article>`).join('')}
      </section>`,

    reasons: s => {
      const items = lines(s.items);
      const style = s.style || 'list';
      const intro = s.intro ? `<div class="r-intro">${paras(s.intro)}</div>` : '';
      if (style === 'cards') {
        return `
        <section class="sec s-reasons r-cards">
          ${head(s.heading)}${intro}
          <div class="cards">${items.map((t, i) => `
            <button class="rcard" type="button" aria-pressed="false">
              <span class="rc-in">
                <span class="rc-front"><b class="disp">${i + 1}</b><span class="hand">tap me</span></span>
                <span class="rc-back">${fill(t)}</span>
              </span>
            </button>`).join('')}
          </div>
        </section>`;
      }
      if (style === 'mend') {
        const cracks = ['M100 50 L95 70 L104 88 L96 108', 'M96 108 L103 128 L98 148 L100 175', 'M95 70 L75 64 L60 72', 'M104 88 L125 80 L140 86', 'M60 72 L42 60 L30 66', 'M140 86 L160 70 L172 74', 'M96 108 L76 112 L62 126', 'M103 128 L124 124 L138 134', 'M62 126 L50 110', 'M138 134 L152 118'];
        return `
        <section class="sec s-reasons r-mend">
          ${head(s.heading)}${intro}
          <div class="mend-body">
            <div class="mend-heart" aria-hidden="true">
              <svg viewBox="0 0 200 190"><path class="heart-shape" d="M100 175 C 40 130, 5 95, 15 55 C 25 15, 80 10, 100 50 C 120 10, 175 15, 185 55 C 195 95, 160 130, 100 175 Z"/><g class="cracks">${cracks.map(d => `<path d="${d}"/>`).join('')}</g></svg>
              <p class="hand mend-count"><span>0</span> of ${items.length} mended</p>
            </div>
            <ol class="r-list">${items.map(t => `<li><span>${fill(t)}</span></li>`).join('')}</ol>
          </div>
        </section>`;
      }
      return `
        <section class="sec s-reasons r-plain">
          ${head(s.heading)}${intro}
          <ol class="r-list">${items.map(t => `<li><span>${fill(t)}</span></li>`).join('')}</ol>
        </section>`;
    },

    letter: s => `
      <section class="sec s-letter">
        ${s.heading ? `<h2 class="hand l-pre">${fill(s.heading)}</h2>` : ''}
        <button class="envelope" type="button" aria-expanded="false">
          <span class="env-back"></span><span class="env-flap"></span><span class="env-front"></span>
          <span class="env-to hand">for ${esc(SITE.to || 'you')}</span>
          <span class="seal disp" aria-hidden="true">${esc((SITE.to || '♥').trim().charAt(0).toUpperCase())}</span>
          <span class="env-hint hand">tap to open</span>
        </button>
        <div class="letter-wrap">
          <article class="paper" tabindex="-1">
            <p class="hand paper-to">${esc(SITE.to || '')},</p>
            ${paras(s.body)}
            ${s.sign ? `<p class="hand paper-sign">${fill(s.sign).replace(/\n/g, '<br>')}</p>` : ''}
          </article>
        </div>
      </section>`,

    cake: s => {
      const n = Math.max(1, Math.min(40, parseInt(s.candles, 10) || 1));
      return `
      <section class="sec s-cake">
        ${head(s.heading)}
        <p class="hand cake-hint">tap each flame to blow it out</p>
        <div class="cake">
          <div class="candles${n > 14 ? ' many' : ''}">${Array.from({ length: n }, (_, i) => `<button class="candle" type="button" aria-label="Blow out candle ${i + 1}"><i class="flame"></i></button>`).join('')}</div>
          <div class="tier t-top"></div><div class="tier t-bottom"></div><div class="plate"></div>
        </div>
        <div class="wish" hidden>${paras(s.wish)}</div>
      </section>`;
    },

    question: s => {
      const q = `<h2 class="disp q-text">${fill(s.question)}</h2>`;
      const after = `<div class="q-after" hidden>${paras(s.after)}</div>`;
      if (s.variant === 'ringbox') {
        return `
        <section class="sec s-q q-ring" data-gate="${s.gate ? 1 : 0}">
          <button class="ringbox" type="button" aria-label="Open the box">
            <span class="rb-lid"></span>
            <span class="rb-base"><span class="ring"><i></i></span></span>
          </button>
          <p class="hand rb-hint">open it</p>
          <div class="q-body" hidden>${q}<div class="q-btns"><button class="btn yes" type="button">${esc(s.yes || 'Yes')}</button></div></div>
          ${after}
        </section>`;
      }
      return `
        <section class="sec s-q q-dodge" data-gate="${s.gate ? 1 : 0}">
          ${q}
          <div class="q-zone">
            <div class="q-btns">
              <button class="btn yes" type="button">${esc(s.yes || 'Yes')}</button>
              <button class="btn ghost no" type="button">${esc(s.no || 'No')}</button>
            </div>
          </div>
          ${after}
        </section>`;
    },

    plan: s => {
      const opts = lines(s.options).map(l => { const [t, ...d] = l.split(/\s+[—–-]\s+/); return { t, d: d.join(' — ') }; });
      return `
      <section class="sec s-plan" data-after="${esc(s.after || '')}">
        ${head(s.heading)}
        ${s.intro ? `<div class="r-intro">${paras(s.intro)}</div>` : ''}
        <div class="opts" role="radiogroup">${opts.map(o => `
          <button class="opt" type="button" role="radio" aria-checked="false" data-choice="${esc(o.t)}">
            <b class="disp">${fill(o.t)}</b>${o.d ? `<span>${fill(o.d)}</span>` : ''}
          </button>`).join('')}
        </div>
        <button class="btn lock" type="button" disabled>${esc(s.button || 'Lock it in')}</button>
        <p class="hand plan-done" hidden></p>
      </section>`;
    },

    invite: s => {
      const rows = [['When', [s.date, s.time].filter(Boolean).join(', ')], ['Where', s.place], ['Dress code', s.dress], ['Note', s.note]].filter(r => r[1]);
      return `
      <section class="sec s-invite">
        <div class="inv-card">
          ${s.kicker ? `<p class="hand kick">${fill(s.kicker)}</p>` : ''}
          ${s.date ? `<h2 class="disp">${fill(s.date)}</h2>` : ''}
          ${s.time ? `<p class="disp inv-time">${fill(s.time)}</p>` : ''}
          <div class="inv-body">${paras(s.body)}</div>
          <button class="btn accept" type="button" aria-expanded="false">${esc(s.accept || 'Accept')}</button>
        </div>
        <div class="inv-details" hidden>
          ${s.thanks ? `<p class="hand kick">${fill(s.thanks)}</p>` : ''}
          <div class="det">${rows.map(([k, v]) => `<div class="det-row"><span>${k}</span><span>${fill(v)}</span></div>`).join('')}</div>
        </div>
      </section>`;
    },

    gallery: s => {
      const ph = (s.photos && s.photos.length) ? s.photos.filter(x => !NO(x)) : Array(6).fill('');
      return `
      <section class="sec s-gallery">
        ${head(s.heading)}
        ${s.intro ? `<p class="g-intro">${fill(s.intro)}</p>` : ''}
        <div class="line"><div class="line-track">
          <svg class="line-string" preserveAspectRatio="none" aria-hidden="true"><path/></svg>
          ${ph.map((src, i) => `<button class="peg" type="button" data-i="${i}" ${src ? '' : 'disabled'} aria-label="Open photo ${i + 1}" style="--tilt:${(i % 2 ? 1 : -1) * rnd(1, 3).toFixed(1)}deg"><span class="peg-card">${photo(src)}</span></button>`).join('')}
        </div></div>
      </section>`;
    },

    closing: s => `<footer class="sec s-close"><p class="hand">${fill(s.text)}</p></footer>`
  };

  /* ---------------- ambient particles ---------------- */
  function heartPath(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * .3);
    ctx.bezierCurveTo(x, y, x - r, y, x - r, y + r * .35);
    ctx.bezierCurveTo(x - r, y + r * .8, x, y + r * 1.05, x, y + r * 1.4);
    ctx.bezierCurveTo(x, y + r * 1.05, x + r, y + r * .8, x + r, y + r * .35);
    ctx.bezierCurveTo(x + r, y, x, y, x, y + r * .3);
    ctx.fill();
  }

  function ambient(canvas, kind) {
    const ctx = canvas.getContext('2d');
    const cs = getComputedStyle(document.documentElement);
    const palette = ['--accent', '--accent2', '--bg2'].map(v => cs.getPropertyValue(v).trim() || '#f08');
    let W = 0, H = 0, parts = [], visible = false, raf = 0, t = 0;
    const base = { rain: 150, stars: 140, confetti: 55, hearts: 22, petals: 26, sparkles: 46 }[kind] || 40;

    function make(initial) {
      return { x: rnd(0, W), y: initial ? rnd(0, H) : (kind === 'hearts' ? H + 20 : -20), s: rnd(.5, 1.2), a: rnd(0, 6.28), v: rnd(.4, 1.1), c: palette[(Math.random() * palette.length) | 0], r: rnd(0, 6.28) };
    }
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(base * clamp((W * H) / (1280 * 800), .35, 1.4));
      parts = Array.from({ length: n }, () => make(true));
    }
    function draw() {
      t += .016;
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        if (kind === 'rain') {
          ctx.strokeStyle = 'rgba(205,218,238,.32)'; ctx.lineWidth = p.s;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1.5, p.y + 14 * p.s); ctx.stroke();
          p.y += 7 + 7 * p.s; p.x -= .3;
        } else if (kind === 'stars') {
          ctx.globalAlpha = .25 + .75 * Math.abs(Math.sin(t * p.v + p.a));
          ctx.fillStyle = '#FFF2D6'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 1.3, 0, 6.28); ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        } else if (kind === 'confetti') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-4 * p.s, -2 * p.s, 8 * p.s, 4 * p.s); ctx.restore();
          p.y += .6 + p.v; p.x += Math.sin(t * 2 + p.a) * .6; p.r += .03;
        } else if (kind === 'hearts') {
          ctx.globalAlpha = .45; ctx.fillStyle = p.c; heartPath(ctx, p.x, p.y, 7 * p.s); ctx.globalAlpha = 1;
          p.y -= .35 + p.v * .6; p.x += Math.sin(t + p.a) * .4;
        } else if (kind === 'petals') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = .7; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.ellipse(0, 0, 7 * p.s, 4 * p.s, 0, 0, 6.28); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
          p.y += .5 + p.v * .7; p.x += .4 + Math.sin(t + p.a) * .5; p.r += .02;
        } else {
          const k = Math.abs(Math.sin(t * 1.4 * p.v + p.a));
          ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = .2 + k * .8; ctx.fillStyle = p.c;
          const r = 5 * p.s * (.5 + k * .5);
          ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r); ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r); ctx.fill();
          ctx.restore(); ctx.globalAlpha = 1;
          p.y -= .15; if (p.y < -10) p.y = H + 10;
          continue;
        }
        if (p.y > H + 30 || p.y < -30 || p.x > W + 30) Object.assign(p, make(false), kind === 'petals' ? { x: rnd(-W * .3, W) } : {});
      }
    }
    function loop() { if (visible) { draw(); raf = requestAnimationFrame(loop); } }
    size();
    if (reduce) { draw(); }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onR = () => size();
    window.addEventListener('resize', onR);
    onCleanup(() => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('resize', onR); });
  }

  /* ---------------- celebration burst ---------------- */
  function burst(kind) {
    if (reduce) return;
    const box = document.createElement('div');
    box.className = 'burst';
    box.setAttribute('aria-hidden', 'true');
    const cs = getComputedStyle(document.documentElement);
    const cols = ['--accent', '--accent2', '--bg2'].map(v => cs.getPropertyValue(v).trim());
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.className = 'bp bp-' + kind;
      p.style.left = rnd(0, 100) + '%';
      p.style.setProperty('--dx', rnd(-140, 140).toFixed(0) + 'px');
      p.style.setProperty('--r', rnd(180, 900).toFixed(0) + 'deg');
      p.style.setProperty('--t', rnd(2.6, 5.5).toFixed(1) + 's');
      p.style.setProperty('--c', kind === 'gold' ? ['#E8C17A', '#D9A85B', '#FFF1CF'][i % 3] : cols[i % cols.length]);
      p.style.animationDelay = rnd(0, 1.2).toFixed(2) + 's';
      if (kind === 'hearts') p.textContent = '♥';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 8000);
  }

  /* ---------------- interactions ---------------- */
  function initReveals() {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -15% 0px' });
    $$('.reveal, .mem, .polaroid, .r-plain .r-list li, .sec-head, .inv-card').forEach(el => io.observe(el));
    onCleanup(() => io.disconnect());
  }

  function initStory(root) {
    const photos = $$('.st-ph', root);
    const steps = $$('.st-step', root);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = +e.target.dataset.i;
      steps.forEach(s => s.classList.toggle('is-active', s === e.target));
      photos.forEach(p => p.classList.toggle('is-on', +p.dataset.i === i));
    }), { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach(s => io.observe(s));
    if (photos[0]) photos[0].classList.add('is-on');
    onCleanup(() => io.disconnect());
  }

  function initCounter(root) {
    const el = $('.count', root);
    const since = new Date(el.dataset.since);
    const set = (u, v) => { const b = $(`[data-u="${u}"]`, el); if (b) b.textContent = v; };
    function tick() {
      if (isNaN(since)) { ['days', 'hours', 'minutes', 'seconds'].forEach(u => set(u, '—')); return; }
      let d = Math.max(0, (Date.now() - since) / 1000);
      set('days', Math.floor(d / 86400).toLocaleString()); d %= 86400;
      set('hours', Math.floor(d / 3600)); d %= 3600;
      set('minutes', Math.floor(d / 60));
      set('seconds', Math.floor(d % 60));
    }
    tick();
    const id = setInterval(tick, 1000);
    onCleanup(() => clearInterval(id));
  }

  function initReasons(root) {
    if (root.classList.contains('r-cards')) {
      $$('.rcard', root).forEach(c => c.addEventListener('click', () => {
        const on = c.getAttribute('aria-pressed') !== 'true';
        c.setAttribute('aria-pressed', String(on));
      }));
    }
    if (root.classList.contains('r-mend')) {
      const items = $$('.r-list li', root);
      const cracks = $$('.cracks path', root);
      const count = $('.mend-count span', root);
      const heart = $('.mend-heart', root);
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        const n = items.filter(li => li.classList.contains('is-in')).length;
        count.textContent = n;
        const g = Math.round((n / items.length) * cracks.length);
        cracks.forEach((p, i) => p.classList.toggle('is-gold', i < g));
        heart.classList.toggle('is-whole', n === items.length);
      }), { rootMargin: '0px 0px -40% 0px' });
      items.forEach(li => io.observe(li));
      onCleanup(() => io.disconnect());
    }
  }

  function initLetter(root) {
    const env = $('.envelope', root);
    env.addEventListener('click', () => {
      if (env.classList.contains('is-open')) return;
      env.classList.add('is-open');
      env.setAttribute('aria-expanded', 'true');
      setTimeout(() => { root.classList.add('is-read'); $('.paper', root).focus({ preventScroll: true }); }, reduce ? 0 : 1000);
    });
  }

  function initCake(root, theme) {
    const candles = $$('.candle', root);
    candles.forEach(c => c.addEventListener('click', () => {
      if (c.classList.contains('out')) return;
      c.classList.add('out');
      c.setAttribute('aria-label', 'Candle blown out');
      if (candles.every(x => x.classList.contains('out'))) {
        $('.wish', root).hidden = false;
        $('.cake-hint', root).textContent = 'make a wish ✨';
        burst(theme.burst);
      }
    }));
  }

  function openGate(root) {
    let el = root.nextElementSibling;
    while (el) { el.classList.remove('gated'); el = el.nextElementSibling; }
  }

  function initQuestion(root, theme) {
    const after = $('.q-after', root);
    const gate = root.dataset.gate === '1';
    if (gate) { let el = root.nextElementSibling; while (el) { el.classList.add('gated'); el = el.nextElementSibling; } }
    const yesDone = () => {
      root.classList.add('said-yes');
      after.hidden = false;
      burst(theme.burst);
      if (gate) openGate(root);
    };

    if (root.classList.contains('q-ring')) {
      const box = $('.ringbox', root);
      box.addEventListener('click', () => {
        if (box.classList.contains('open')) return;
        box.classList.add('open');
        $('.rb-hint', root).hidden = true;
        setTimeout(() => { $('.q-body', root).hidden = false; }, reduce ? 0 : 900);
      });
      $('.yes', root).addEventListener('click', () => { $('.q-body .q-btns', root).hidden = true; yesDone(); });
      return;
    }

    const yes = $('.yes', root), no = $('.no', root), zone = $('.q-zone', root);
    const pleas = ['are you sure?', 'really?', 'think again', 'pretty please', 'last chance', '🥺'];
    let tries = 0, tx = 0, ty = 0, last = 0;
    function dodge(e) {
      if (root.classList.contains('said-yes')) return;
      if (e) e.preventDefault();
      if (Date.now() - last < 350) return;
      last = Date.now();
      tries++;
      no.textContent = pleas[(tries - 1) % pleas.length];
      yes.style.transform = `scale(${Math.min(1.8, 1 + tries * .1)})`;
      const zr = zone.getBoundingClientRect();
      const nr = no.getBoundingClientRect();
      const yr = yes.getBoundingClientRect();
      const ox = nr.left - tx, oy = nr.top - ty;
      const pad = 14;
      let best = null;
      for (let k = 0; k < 24; k++) {
        const L = rnd(zr.left, Math.max(zr.left, zr.right - nr.width));
        const T = rnd(zr.top, Math.max(zr.top, zr.bottom - nr.height));
        const hit = L < yr.right + pad && L + nr.width > yr.left - pad && T < yr.bottom + pad && T + nr.height > yr.top - pad;
        best = { L, T };
        if (!hit) break;
      }
      tx = best.L - ox; ty = best.T - oy;
      no.style.transform = `translate(${tx.toFixed(0)}px, ${ty.toFixed(0)}px) scale(${Math.max(.6, 1 - tries * .05)})`;
    }
    no.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') dodge(); });
    no.addEventListener('pointerdown', dodge);
    no.addEventListener('click', dodge);
    yes.addEventListener('click', () => { no.hidden = true; yes.style.transform = ''; yes.disabled = true; yesDone(); });
  }

  function initPlan(root) {
    const opts = $$('.opt', root);
    const lock = $('.lock', root);
    const done = $('.plan-done', root);
    let choice = '';
    opts.forEach(o => o.addEventListener('click', () => {
      if (root.classList.contains('locked')) return;
      opts.forEach(x => x.setAttribute('aria-checked', String(x === o)));
      choice = o.dataset.choice;
      lock.disabled = false;
    }));
    lock.addEventListener('click', () => {
      root.classList.add('locked');
      lock.hidden = true;
      done.textContent = (root.dataset.after || 'It\'s a date: {choice}').replace(/\{choice\}/g, choice).replace(/\{to\}/g, SITE.to || '').replace(/\{from\}/g, SITE.from || '');
      done.hidden = false;
      burst('confetti');
    });
  }

  function initInvite(root, theme) {
    const btn = $('.accept', root);
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-expanded') === 'true') return;
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Accepted ♡';
      $('.inv-details', root).hidden = false;
      burst(theme.burst);
      setTimeout(() => $('.inv-details', root).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 500);
    });
  }

  let lightbox;
  function initGallery(root) {
    const track = $('.line-track', root);
    function hang() {
      const w = track.scrollWidth, sag = Math.min(60, w * .045);
      const svg = $('.line-string', track);
      svg.setAttribute('viewBox', `0 0 ${w} 120`);
      svg.style.width = w + 'px';
      $('path', svg).setAttribute('d', `M0 14 Q ${w / 2} ${14 + sag * 2} ${w} 14`);
      $$('.peg', track).forEach(p => {
        const t = (p.offsetLeft + p.offsetWidth / 2) / w;
        p.style.setProperty('--sag', (4 * sag * t * (1 - t)).toFixed(1) + 'px');
      });
    }
    hang();
    window.addEventListener('resize', hang);
    window.addEventListener('load', hang);
    onCleanup(() => { window.removeEventListener('resize', hang); window.removeEventListener('load', hang); });

    const imgs = $$('.peg img', root).map(i => i.getAttribute('src'));
    if (!imgs.length) return;
    if (!lightbox) {
      lightbox = document.createElement('dialog');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = '<button class="lb-x" type="button" aria-label="Close">×</button><button class="lb-p" type="button" aria-label="Previous">‹</button><img alt=""><button class="lb-n" type="button" aria-label="Next">›</button>';
      document.body.appendChild(lightbox);
      lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
      $('.lb-x', lightbox).addEventListener('click', () => lightbox.close());
    }
    let cur = 0;
    const show = i => { cur = (i + imgs.length) % imgs.length; $('img', lightbox).src = imgs[cur]; };
    $('.lb-p', lightbox).onclick = () => show(cur - 1);
    $('.lb-n', lightbox).onclick = () => show(cur + 1);
    lightbox.onkeydown = e => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); };
    $$('.peg:not([disabled])', root).forEach(p => p.addEventListener('click', () => { show(+p.dataset.i); lightbox.showModal(); }));
  }


  /* ---------------- custom look (colours + type) ---------------- */
  function hexRgb(h) {
    const m = String(h || '').replace('#', '').match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
    if (!m) return null;
    let x = m[1]; if (x.length === 3) x = x.split('').map(c => c + c).join('');
    return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16) / 255);
  }
  function lum(h) {
    const c = hexRgb(h); if (!c) return .5;
    const [r, g, b] = c.map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    return .2126 * r + .7152 * g + .0722 * b;
  }
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

  function applyStyle(st) {
    const root = document.documentElement;
    root.removeAttribute('style');
    const set = (k, v) => { if (v != null && v !== '') root.style.setProperty(k, v); };
    const c = st.colors;
    if (c) {
      ['bg', 'bg2', 'ink', 'accent', 'accent2', 'card'].forEach(k => set('--' + k, c[k]));
      if (c.ink && c.bg) set('--muted', `color-mix(in srgb, ${c.ink} 62%, ${c.bg})`);
      if (c.accent) set('--on-accent', contrast(c.accent, '#ffffff') >= 3 ? '#ffffff' : '#1a1a1a');
      if (c.story) {
        set('--story', c.story);
        const ink = contrast(c.story, '#F4EFEA') >= 4.5 ? '#F4EFEA' : '#1a1a1a';
        set('--story-ink', ink);
        const sa = [c.accent2, c.accent].filter(Boolean).sort((a, b) => contrast(b, c.story) - contrast(a, c.story))[0];
        set('--story-accent', sa);
      }
    }
    const f = st.fonts;
    if (f) {
      if (f.display) { set('--display', `"${f.display.family}", ${f.display.fallback}`); set('--disp-w', f.display.w); }
      if (f.body) set('--body', `"${f.body.family}", ${f.body.fallback}`);
      if (f.hand) { set('--hand', `"${f.hand.family}", ${f.hand.fallback}`); set('--hs', f.hand.hs); }
    }
    if (st.textSize) set('--ts', st.textSize);
    if (st.titleSize) set('--tts', st.titleSize);
    if (st.headings === 'caps') { set('--head-tt', 'uppercase'); set('--head-ls', '.06em'); set('--head-scale', '.82'); }
    if (st.headings === 'italic') set('--head-fs', 'italic');
    if (st.align === 'left') set('--align', 'left');
  }

  /* ---------------- render ---------------- */
  function render(site, mount) {
    cleanups.forEach(fn => { try { fn(); } catch (_) {} });
    cleanups = [];
    SITE = site || {};
    const theme = THEMES[SITE.theme] || THEMES.apology;
    document.documentElement.dataset.theme = THEMES[SITE.theme] ? SITE.theme : 'apology';
    document.documentElement.dataset.culture = SITE.culture || '';

    let link = document.getElementById('kp-fonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'kp-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const st = SITE.style || {};
    const href = `https://fonts.googleapis.com/css2?${theme.fonts}${st.fontQuery ? '&' + st.fontQuery : ''}&display=swap`;
    if (link.href !== href) link.href = href;
    applyStyle(st);
    document.title = SITE.title || (SITE.to ? `For ${SITE.to}` : 'For you');

    const app = mount || document.getElementById('app');
    app.innerHTML = (SITE.sections || []).filter(s => s && s.on !== false && R[s.type]).map(s => R[s.type](s)).join('')
      + (SITE._badge ? `<a class="ks-badge" href="${esc(SITE._badge)}" target="_blank" rel="noopener">Made with <b>Keepsake</b></a>` : '');

    $$('canvas.amb', app).forEach(c => ambient(c, theme.ambient));
    $$('.s-story', app).forEach(initStory);
    $$('.s-counter', app).forEach(initCounter);
    $$('.s-reasons', app).forEach(initReasons);
    $$('.s-letter', app).forEach(initLetter);
    $$('.s-cake', app).forEach(r => initCake(r, theme));
    $$('.s-q', app).forEach(r => initQuestion(r, theme));
    $$('.s-plan', app).forEach(initPlan);
    $$('.s-invite', app).forEach(r => initInvite(r, theme));
    $$('.s-gallery', app).forEach(initGallery);
    EXT.forEach(x => { try { if (x.init) x.init(app, theme, SITE); } catch (e) { console.error(e); } });
    initReveals();
  }

  const EXT = [];
  function register(def) {
    Object.assign(R, def.sections || {});
    EXT.push(def);
  }
  window.Keepsake = { render, THEMES, register, h: { esc, fill, paras, lines, photo, head, burst, onCleanup, rnd, clamp, $, $$, word, reduce, NO, site: () => SITE } };
  (window.KEEPSAKE_EXT || []).forEach(register);
  if (window.SITE && document.getElementById('app')) render(window.SITE);
})();
