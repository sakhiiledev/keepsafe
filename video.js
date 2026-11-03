/* Make video: turns the finished page into a short video, recorded in the browser */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const AMBIENT = { apology: 'rain', anniversary: 'stars', birthday: 'confetti', proposal: 'petals', valentine: 'hearts', askout: 'sparkles' };

  /* ---------- dialog ---------- */
  const dlg = document.createElement('dialog');
  dlg.className = 'vid-dlg';
  dlg.innerHTML = `
    <form method="dialog" class="vid-in" id="vid-form">
      <div class="vid-head">
        <h2>Make a video</h2>
        <button type="button" class="icon" id="vid-x" aria-label="Close">✕</button>
      </div>

      <div class="vid-step" id="vid-setup">
        <p class="hint">Turns the page into a short video: the title, each memory and photo, your list, the question or invite, and the closing line, in your colours and fonts. Good for WhatsApp, Instagram or TikTok.</p>
        <div class="f"><span>Shape</span>
          <div class="seg seg-wide" role="radiogroup" aria-label="Video shape">
            <button type="button" data-shape="portrait" aria-pressed="true">Portrait 9:16<small>Status, Reels, TikTok</small></button>
            <button type="button" data-shape="square" aria-pressed="false">Square 1:1<small>Instagram post</small></button>
            <button type="button" data-shape="landscape" aria-pressed="false">Landscape 16:9<small>TV, YouTube</small></button>
          </div>
        </div>
        <div class="f"><span>Pace</span>
          <div class="seg seg-wide" role="radiogroup" aria-label="Pace">
            <button type="button" data-pace="1.25" aria-pressed="false">Slow</button>
            <button type="button" data-pace="1" aria-pressed="true">Normal</button>
            <button type="button" data-pace="0.8" aria-pressed="false">Quick</button>
          </div>
        </div>
        <label class="f"><span>Song (optional)</span>
          <span class="img-pick"><label class="file-btn">Choose a song<input type="file" id="vid-song" accept="audio/*"></label><span class="hint" id="vid-song-name">No song. The video will be silent.</span></span>
        </label>
        <p class="hint" id="vid-length"></p>
        <button type="button" class="primary wide" id="vid-go">Record video</button>
        <p class="hint">Recording plays in real time. Keep this tab open and in front until it finishes.</p>
      </div>

      <div class="vid-step" id="vid-rec" hidden>
        <div class="vid-canvas-wrap"><canvas id="vid-canvas"></canvas></div>
        <div class="vid-bar"><span id="vid-fill"></span></div>
        <p class="hint" id="vid-status">Recording…</p>
        <button type="button" class="ghost-btn" id="vid-stop">Stop</button>
      </div>

      <div class="vid-step" id="vid-done" hidden>
        <div class="vid-canvas-wrap"><video id="vid-out" controls playsinline></video></div>
        <p class="hint" id="vid-note"></p>
        <div class="vid-actions">
          <button type="button" class="primary" id="vid-save">Download video</button>
          <button type="button" class="ghost-btn" id="vid-again">Make another</button>
        </div>
      </div>
    </form>`;
  document.body.appendChild(dlg);

  const opts = { shape: 'portrait', pace: 1, song: null };
  let rec = null, stopFlag = false, lastBlob = null, lastExt = 'mp4', audioCtx = null;

  function showStep(id) { ['vid-setup', 'vid-rec', 'vid-done'].forEach(s => { $('#' + s, dlg).hidden = s !== id; }); }

  dlg.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.shape) { opts.shape = b.dataset.shape; b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); updateLength(); }
    if (b.dataset.pace) { opts.pace = parseFloat(b.dataset.pace); b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); updateLength(); }
  });
  $('#vid-x', dlg).addEventListener('click', () => { stopFlag = true; dlg.close(); });
  dlg.addEventListener('close', () => { stopFlag = true; });
  $('#vid-song', dlg).addEventListener('change', e => {
    opts.song = e.target.files[0] || null;
    $('#vid-song-name', dlg).textContent = opts.song ? opts.song.name : 'No song. The video will be silent.';
  });
  $('#vid-go', dlg).addEventListener('click', () => record().catch(err => {
    showStep('vid-setup');
    window.KB.toast(err.message || 'The video could not be recorded in this browser.');
  }));
  $('#vid-stop', dlg).addEventListener('click', () => { stopFlag = true; });
  $('#vid-again', dlg).addEventListener('click', () => showStep('vid-setup'));
  $('#vid-save', dlg).addEventListener('click', () => {
    if (!lastBlob) return;
    const site = window.KB.getSite();
    window.KB.downloadBlob(lastBlob, `${window.KB.slug(site.to)}-${window.KB.key()}.${lastExt}`);
  });

  function openDialog() {
    showStep('vid-setup');
    updateLength();
    dlg.showModal();
  }
  document.addEventListener('click', e => { if (e.target.closest('#make-video')) openDialog(); });

  /* ---------- content → scenes ---------- */
  function buildScenes(site) {
    const W0 = { greet: 'Welcome', invite: "You're invited", thanks: 'Thank you', lobola: 'lobola', wedding: 'wedding', culture: '', lang: '', yes: "I'll be there", no: "Can't make it" };
    const wd = Object.assign({}, W0, site.words || {});
    const fill = s => String(s || '').replace(/\{to\}/g, site.to || '').replace(/\{from\}/g, site.from || '').replace(/\{(greet|invite|thanks|lobola|wedding|culture|lang|yes|no)\}/g, (_, k) => wd[k] || '');
    const fmt = v => { const d = new Date(v); return isNaN(d) ? (v || '') : d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
    const firstSentences = (t, n = 2) => {
      const parts = fill(t).replace(/\n+/g, ' ').match(/[^.!?]+[.!?]*/g) || [];
      return parts.slice(0, n).join(' ').trim();
    };
    const lines = t => (Array.isArray(t) ? t : String(t || '').split('\n')).map(x => x.trim()).filter(Boolean);
    const out = [];
    for (const s of (site.sections || [])) {
      if (!s || s.on === false) continue;
      if (s.type === 'hero') out.push({ k: 'title', d: 4, kicker: fill(s.kicker), title: fill(s.title), sub: fill(s.sub).replace(/\n+/g, ' · '), img: s.bg || '' });
      else if (s.type === 'countdown') {
        const dt = new Date(s.date);
        if (!isNaN(dt)) { const days = Math.max(0, Math.ceil((dt - Date.now()) / 86400000)); out.push({ k: 'big', d: 3.8, kicker: fill(s.label), big: String(days), unit: days === 1 ? 'day to go' : 'days to go', sub: fmt(s.date) }); }
      } else if (s.type === 'couple') out.push({ k: 'title', d: 4, kicker: fill(s.heading), title: `${fill(s.name1)} & ${fill(s.name2)}`, sub: [fill(s.family1), fill(s.family2)].filter(Boolean).join(' · '), img: '' });
      else if (s.type === 'cattle') out.push({ k: 'big', d: 4.4, kicker: fill(s.heading), big: String(parseInt(s.count, 10) || 1), unit: fill(s.unit || 'cattle'), sub: fill(s.stamp) });
      else if (s.type === 'programme') { const it = lines(s.items).slice(0, 5).map(fill); if (it.length) out.push({ k: 'list', d: .9 + it.length * 2, title: fill(s.heading), items: it }); }
      else if (s.type === 'venue') out.push({ k: 'invite', d: 4.4, kicker: fill(s.heading || 'where'), date: fill(s.name), time: '', place: [fill(s.time), fill(s.address)].filter(Boolean).join(' · ') });
      else if (s.type === 'rsvp') out.push({ k: 'heading', d: 3, title: s.deadline ? `Kindly RSVP by ${fill(s.deadline)}` : 'Kindly RSVP' });
      else if (s.type === 'scratch') out.push({ k: 'title', d: 4.2, kicker: fill(s.above), title: fill(s.reveal), sub: fill(s.below), img: '' });
      else if (s.type === 'story') {
        if (s.heading) out.push({ k: 'heading', d: 2.4, title: fill(s.heading) });
        (s.chapters || []).forEach(c => out.push({ k: 'photo', d: 4.2, img: c.photo, label: fill(c.label), text: firstSentences(c.text, 2) }));
      } else if (s.type === 'memories') {
        if (s.heading) out.push({ k: 'heading', d: 2.4, title: fill(s.heading) });
        (s.items || []).forEach(m => out.push({ k: 'photo', d: 4.6, img: m.photo, label: fill(m.caption), title: fill(m.title), text: firstSentences(m.text, 1) }));
      } else if (s.type === 'counter') {
        const since = new Date(s.since);
        if (!isNaN(since)) out.push({ k: 'big', d: 3.6, kicker: fill(s.label), big: Math.floor((Date.now() - since) / 86400000).toLocaleString(), unit: 'days', sub: firstSentences(s.after, 1) });
      } else if (s.type === 'reasons') {
        const items = lines(s.items).slice(0, 5);
        if (items.length) out.push({ k: 'list', d: .9 + items.length * 2.3, title: fill(s.heading), items: items.map(fill) });
      } else if (s.type === 'cake') out.push({ k: 'cake', d: 4, title: fill(s.heading), candles: Math.min(40, parseInt(s.candles, 10) || 5) });
      else if (s.type === 'letter') { const t = firstSentences(s.body, 3); if (t) out.push({ k: 'quote', d: 5.4, text: t, sign: fill(s.sign) }); }
      else if (s.type === 'gallery') {
        const imgs = (s.photos || []).filter(Boolean).slice(0, 10);
        if (imgs.length) out.push({ k: 'montage', d: Math.max(3, imgs.length * 1.6), imgs, title: fill(s.heading) });
      } else if (s.type === 'question') out.push({ k: 'question', d: 4.6, title: fill(s.question), yes: fill(s.yes || 'Yes') });
      else if (s.type === 'invite') out.push({ k: 'invite', d: 4.4, kicker: fill(s.kicker), date: fill(s.date), time: fill(s.time), place: fill(s.place) });
      else if (s.type === 'plan') { const o = lines(s.options).map(l => l.split(/\s+[—–-]\s+/)[0]).slice(0, 4); if (o.length) out.push({ k: 'list', d: .9 + o.length * 2, title: fill(s.heading), items: o.map(fill) }); }
      else if (s.type === 'closing') out.push({ k: 'closing', d: 3.6, title: fill(s.text) });
    }
    if (!out.length) out.push({ k: 'title', d: 4, kicker: 'for', title: site.to || 'you', sub: '' });
    return out;
  }

  function updateLength() {
    const site = window.KB.getSite();
    if (!site) return;
    const total = buildScenes(site).reduce((a, s) => a + s.d * opts.pace, 0);
    $('#vid-length', dlg).textContent = `About ${Math.round(total)} seconds long.`;
  }

  /* ---------- drawing helpers ---------- */
  function wrap(ctx, text, maxW) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const out = []; let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
    }
    if (line) out.push(line);
    return out;
  }
  // Largest font size (<= max) where text fits in maxLines within maxW
  function fit(ctx, text, fontFn, max, maxW, maxLines, min = 18) {
    let size = max;
    while (size > min) {
      ctx.font = fontFn(size);
      const l = wrap(ctx, text, maxW);
      if (l.length <= maxLines && l.every(x => ctx.measureText(x).width <= maxW)) return { size, lines: l };
      size *= .92;
    }
    ctx.font = fontFn(min);
    return { size: min, lines: wrap(ctx, text, maxW) };
  }
  function drawLines(ctx, lines, x, y, lh, align = 'center') {
    ctx.textAlign = align;
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  }
  function cover(ctx, img, x, y, w, h, zoom = 1, panX = 0, panY = 0) {
    const r = Math.max(w / img.width, h / img.height) * zoom;
    const iw = img.width * r, ih = img.height * r;
    ctx.drawImage(img, x + (w - iw) / 2 + panX * (iw - w) / 2, y + (h - ih) / 2 + panY * (ih - h) / 2, iw, ih);
  }
  function heart(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r * .3);
    ctx.bezierCurveTo(x, y, x - r, y, x - r, y + r * .35);
    ctx.bezierCurveTo(x - r, y + r * .8, x, y + r * 1.05, x, y + r * 1.4);
    ctx.bezierCurveTo(x, y + r * 1.05, x + r, y + r * .8, x + r, y + r * .35);
    ctx.bezierCurveTo(x + r, y, x, y, x, y + r * .3);
    ctx.fill();
  }

  /* ---------- the renderer ---------- */
  function makeRenderer(canvas, site, look, scenes, imgs) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const U = Math.min(W, H) / 1080; // unit scale
    const c = look.colors, f = look.fonts;
    const caps = look.headings === 'caps', ital = look.headings === 'italic';
    const D = s => `${ital ? 'italic ' : ''}${f.display.w || 400} ${s}px "${f.display.family}", ${f.display.fallback}`;
    const B = (s, w = 400, it = false) => `${it ? 'italic ' : ''}${w} ${s}px "${f.body.family}", ${f.body.fallback}`;
    const Hd = s => `400 ${s * (f.hand.hs || 1)}px "${f.hand.family}", ${f.hand.fallback}`;
    const T = s => caps ? String(s).toUpperCase() : s;
    const pad = 90 * U, maxW = W - pad * 2;
    const ambient = AMBIENT[site.theme] || 'hearts';
    const parts = Array.from({ length: ambient === 'stars' ? 120 : ambient === 'rain' ? 140 : 40 }, () => ({ x: rnd(0, W), y: rnd(0, H), s: rnd(.5, 1.2), v: rnd(.4, 1.1), a: rnd(0, 6.28), col: [c.accent, c.accent2, c.bg2][(Math.random() * 3) | 0] }));
    let total = 0; const starts = scenes.map(s => { const st = total; total += s.d; return st; });
    const TR = .7; // crossfade seconds

    function bgFill(col) { ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); }
    function particles(t, dark) {
      for (const p of parts) {
        if (ambient === 'rain') {
          const y = (p.y + t * 900 * p.s) % (H + 40) - 20;
          ctx.strokeStyle = dark ? 'rgba(210,222,240,.28)' : 'rgba(80,90,110,.18)'; ctx.lineWidth = 2 * U * p.s;
          ctx.beginPath(); ctx.moveTo(p.x, y); ctx.lineTo(p.x - 3 * U, y + 26 * U * p.s); ctx.stroke();
        } else if (ambient === 'stars') {
          ctx.globalAlpha = .2 + .8 * Math.abs(Math.sin(t * p.v * 1.4 + p.a)); ctx.fillStyle = '#FFF2D6';
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.4 * U * p.s, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1;
        } else if (ambient === 'hearts') {
          const y = H + 40 - ((p.y + t * 60 * p.v) % (H + 80));
          ctx.globalAlpha = .4; ctx.fillStyle = p.col; heart(ctx, p.x + Math.sin(t + p.a) * 14 * U, y, 14 * U * p.s); ctx.globalAlpha = 1;
        } else if (ambient === 'petals' || ambient === 'confetti') {
          const y = (p.y + t * 80 * p.v) % (H + 40) - 20;
          ctx.save(); ctx.translate(p.x + Math.sin(t + p.a) * 20 * U, y); ctx.rotate(p.a + t * p.v); ctx.globalAlpha = .7; ctx.fillStyle = p.col;
          if (ambient === 'petals') { ctx.beginPath(); ctx.ellipse(0, 0, 13 * U * p.s, 7 * U * p.s, 0, 0, 6.28); ctx.fill(); }
          else ctx.fillRect(-8 * U * p.s, -4 * U * p.s, 16 * U * p.s, 8 * U * p.s);
          ctx.restore(); ctx.globalAlpha = 1;
        } else {
          const k = Math.abs(Math.sin(t * 1.6 * p.v + p.a)); const r = 9 * U * p.s * (.5 + k * .5);
          ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = .2 + k * .7; ctx.fillStyle = p.col;
          ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r); ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
        }
      }
    }
    const fadeIn = (p, start, dur = .12) => clamp((p - start) / dur);

    function placeholder(x, y, w, h) {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, c.bg2); g.addColorStop(1, c.accent2);
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.55)'; heart(ctx, x + w / 2, y + h / 2 - 40 * U, 46 * U);
    }

    function drawScene(s, lt) { // lt: seconds into scene
      const p = clamp(lt / s.d);
      ctx.save();
      if (s.k === 'title' || s.k === 'heading' || s.k === 'closing') {
        bgFill(c.bg); particles(lt + s.d, lum(c.bg) < .4);
        const cy = H / 2;
        const bgImg = s.k === 'title' && s.img && imgs.get(s.img);
        if (bgImg) {
          cover(ctx, bgImg, 0, 0, W, H, 1.1 - .08 * ease(p), 0, 0);
          ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, W, H);
        }
        if (s.k === 'title') {
          const t = fit(ctx, T(s.title), D, 230 * U, maxW, 3, 40);
          const lh = t.size * 1.0; const ty = cy - (t.lines.length - 1) * lh / 2 + t.size * .3 - 40 * U;
          ctx.fillStyle = bgImg ? '#ffffff' : c.accent; ctx.globalAlpha = fadeIn(p, 0, .15);
          const k = fit(ctx, s.kicker, Hd, 70 * U, maxW, 1); ctx.font = Hd(k.size); drawLines(ctx, k.lines, W / 2, ty - t.size * .95 - 24 * U, 0);
          ctx.globalAlpha = fadeIn(p, .08, .2); ctx.fillStyle = bgImg ? '#ffffff' : c.ink;
          ctx.font = D(t.size);
          ctx.translate(0, (1 - easeOut(fadeIn(p, .08, .25))) * 40 * U);
          drawLines(ctx, t.lines, W / 2, ty, lh);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          if (s.sub) { ctx.globalAlpha = fadeIn(p, .3, .2); ctx.fillStyle = bgImg ? 'rgba(255,255,255,.92)' : c.ink; ctx.font = B(40 * U, 400, true); drawLines(ctx, wrap(ctx, s.sub, maxW * .85), W / 2, ty + (t.lines.length - 1) * lh + 110 * U, 56 * U); }
        } else {
          ctx.globalAlpha = fadeIn(p, 0, .25); ctx.fillStyle = s.k === 'closing' ? c.accent : c.ink;
          const fn = s.k === 'closing' ? Hd : D;
          const t = fit(ctx, s.k === 'closing' ? s.title : T(s.title), fn, (s.k === 'closing' ? 120 : 150) * U, maxW, 3, 36); ctx.font = fn(t.size);
          const lh = t.size * 1.08; drawLines(ctx, t.lines, W / 2, cy - (t.lines.length - 1) * lh / 2 + t.size * .3, lh);
          if (s.k === 'closing') { ctx.globalAlpha = fadeIn(p, .35, .25) * .9; ctx.fillStyle = c.accent; heart(ctx, W / 2, cy + (t.lines.length) * lh / 2 + 50 * U, 30 * U); }
        }
      } else if (s.k === 'photo' && !(s.img && imgs.get(s.img))) {
        bgFill(c.story); particles(lt, lum(c.story) < .4);
        const ink = contrastInk(c.story) === '#ffffff' ? '#F4EFEA' : '#1a1a1a';
        let y = H / 2 - 120 * U;
        ctx.globalAlpha = fadeIn(p, 0, .15);
        if (s.label) { ctx.fillStyle = c.accent2; ctx.font = Hd(64 * U); drawLines(ctx, [s.label], W / 2, y, 0); y += 40 * U; }
        if (s.title) { ctx.fillStyle = ink; const t = fit(ctx, T(s.title), D, 110 * U, maxW, 2, 30); ctx.font = D(t.size); drawLines(ctx, t.lines, W / 2, y + t.size, t.size * 1.05); y += t.size * 1.05 * t.lines.length + 20 * U; }
        ctx.globalAlpha = fadeIn(p, .12, .2); ctx.fillStyle = ink;
        const r = fit(ctx, s.text, x => B(x, 400, true), 56 * U, maxW * .9, 6, 28); ctx.font = B(r.size, 400, true);
        drawLines(ctx, r.lines, W / 2, y + r.size * 1.4, r.size * 1.35);
      } else if (s.k === 'photo') {
        const img = s.img && imgs.get(s.img);
        bgFill('#000');
        if (img) cover(ctx, img, 0, 0, W, H, 1.12 - .1 * ease(p), Math.sin(s.d) * .4 * (p - .5), 0);
        else placeholder(0, 0, W, H);
        const g = ctx.createLinearGradient(0, H * .35, 0, H);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.78)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        let y = H - pad - 20 * U;
        ctx.textAlign = 'left';
        const textLines = s.text ? (ctx.font = B(42 * U), wrap(ctx, s.text, maxW)) : [];
        const blockH = textLines.length * 58 * U;
        y -= blockH;
        if (s.title) { ctx.font = D(80 * U); y -= 20 * U; }
        ctx.globalAlpha = fadeIn(p, .05, .15);
        if (s.label) { ctx.fillStyle = c.accent2; const k = fit(ctx, s.label, Hd, 58 * U, maxW, 1); ctx.font = Hd(k.size); ctx.fillText(k.lines[0] || '', pad, y - (s.title ? 100 * U : 30 * U)); }
        if (s.title) { ctx.fillStyle = '#fff'; const t = fit(ctx, T(s.title), D, 84 * U, maxW, 2, 30); ctx.font = D(t.size); t.lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, pad, y - (t.lines.length - 1 - i) * t.size * 1.05)); y += 30 * U; }
        ctx.globalAlpha = fadeIn(p, .15, .2); ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = B(42 * U);
        textLines.forEach((l, i) => ctx.fillText(l, pad, y + 40 * U + i * 58 * U));
      } else if (s.k === 'montage') {
        bgFill(c.bg); particles(lt, lum(c.bg) < .4);
        const n = s.imgs.length, per = s.d / n;
        const i = Math.min(n - 1, Math.floor(lt / per)), lp = (lt - i * per) / per;
        for (let k = Math.max(0, i - 2); k <= i; k++) {
          const img = imgs.get(s.imgs[k]); const age = i - k;
          const pw = Math.min(W, H) * .72, ph = pw * 1.18;
          ctx.save();
          ctx.translate(W / 2 + (k % 2 ? 1 : -1) * 30 * U * age, H / 2 + 20 * U);
          ctx.rotate(((k * 37) % 9 - 4) * Math.PI / 180);
          const enter = k === i ? easeOut(clamp(lp / .25)) : 1;
          ctx.translate(0, (1 - enter) * H * .6);
          ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 40 * U; ctx.shadowOffsetY = 18 * U;
          ctx.fillStyle = '#fff'; ctx.fillRect(-pw / 2 - 22 * U, -ph / 2 - 22 * U, pw + 44 * U, ph + 110 * U);
          ctx.shadowColor = 'transparent';
          ctx.beginPath(); ctx.rect(-pw / 2, -ph / 2, pw, ph); ctx.clip();
          if (img) cover(ctx, img, -pw / 2, -ph / 2, pw, ph, 1.04); else placeholder(-pw / 2, -ph / 2, pw, ph);
          ctx.restore();
        }
        if (s.title) { ctx.fillStyle = c.ink; ctx.globalAlpha = .95; const t = fit(ctx, T(s.title), D, 90 * U, maxW, 1, 30); ctx.font = D(t.size); drawLines(ctx, t.lines, W / 2, pad + t.size, 0); }
      } else if (s.k === 'list') {
        bgFill(c.accent); particles(lt, lum(c.accent) < .4);
        const on = contrastInk(c.accent);
        ctx.fillStyle = on; ctx.globalAlpha = .9;
        const t = fit(ctx, T(s.title || ''), D, 76 * U, maxW, 2, 30); ctx.font = D(t.size);
        drawLines(ctx, t.lines, W / 2, pad + t.size, t.size * 1.05);
        const n = s.items.length, per = (s.d - .6) / n;
        const idx = Math.min(n - 1, Math.floor(Math.max(0, lt - .3) / per));
        const lp = clamp((lt - .3 - idx * per) / per);
        const a = Math.min(clamp(lp / .18), clamp((1 - lp) / .14 + (idx === n - 1 ? 1 : 0)));
        ctx.globalAlpha = a;
        const r = fit(ctx, s.items[idx], s2 => B(s2, 500), 84 * U, maxW * .9, 5, 30);
        ctx.font = B(r.size, 500); const lh = r.size * 1.25;
        const y0 = H / 2 - (r.lines.length - 1) * lh / 2 + r.size * .3 + (1 - easeOut(clamp(lp / .2))) * 40 * U;
        drawLines(ctx, r.lines, W / 2, y0, lh);
        ctx.globalAlpha = .85; ctx.font = Hd(54 * U);
        ctx.fillText(`♥ ${idx + 1} of ${n}`, W / 2, H - pad);
      } else if (s.k === 'big') {
        bgFill(c.bg); particles(lt, lum(c.bg) < .4);
        ctx.fillStyle = c.accent; ctx.font = Hd(64 * U); drawLines(ctx, [s.kicker], W / 2, H / 2 - 210 * U, 0);
        const shown = Math.round(parseInt(String(s.big).replace(/\D/g, ''), 10) * easeOut(clamp(p / .5)));
        ctx.font = D(260 * U); ctx.fillText(shown.toLocaleString(), W / 2, H / 2 + 60 * U);
        ctx.fillStyle = c.ink; ctx.font = B(44 * U, 600); ctx.fillText(s.unit.toUpperCase(), W / 2, H / 2 + 150 * U);
        if (s.sub) { ctx.globalAlpha = fadeIn(p, .45, .2); ctx.font = B(40 * U, 400, true); drawLines(ctx, wrap(ctx, s.sub, maxW * .85), W / 2, H / 2 + 260 * U, 54 * U); }
      } else if (s.k === 'quote') {
        bgFill(c.card); particles(lt, lum(c.card) < .4);
        ctx.fillStyle = c.accent; ctx.globalAlpha = .25; ctx.font = D(360 * U); ctx.textAlign = 'center'; ctx.fillText('“', W / 2, H * .3);
        ctx.globalAlpha = 1; ctx.fillStyle = c.ink;
        const words = s.text.split(/\s+/); const shown = words.slice(0, Math.ceil(words.length * clamp(p / .7))).join(' ');
        ctx.font = B(50 * U, 400, true); const all = wrap(ctx, s.text, maxW * .9); const lh = 72 * U;
        const y0 = H / 2 - (all.length - 1) * lh / 2;
        const ls = wrap(ctx, shown, maxW * .9); drawLines(ctx, ls, W / 2, y0, lh);
        if (s.sign) { ctx.globalAlpha = fadeIn(p, .72, .12); ctx.fillStyle = c.accent; ctx.font = Hd(58 * U); drawLines(ctx, s.sign.split('\n').slice(0, 2), W / 2, y0 + all.length * lh + 70 * U, 66 * U); }
      } else if (s.k === 'question') {
        bgFill(c.bg); particles(lt, lum(c.bg) < .4);
        ctx.fillStyle = c.ink; ctx.globalAlpha = fadeIn(p, 0, .15);
        const t = fit(ctx, T(s.title), D, 150 * U, maxW, 4, 36); ctx.font = D(t.size);
        const lh = t.size * 1.06; const ty = H / 2 - (t.lines.length - 1) * lh / 2 - 60 * U;
        drawLines(ctx, t.lines, W / 2, ty, lh);
        const a = fadeIn(p, .45, .1);
        if (a > 0) {
          ctx.globalAlpha = a; const bw = 300 * U, bh = 110 * U, bx = W / 2 - bw / 2, by = ty + t.lines.length * lh + 20 * U;
          const sc = 1 + .08 * Math.sin(lt * 4) * a;
          ctx.save(); ctx.translate(W / 2, by + bh / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -(by + bh / 2));
          ctx.fillStyle = c.accent; roundRect(ctx, bx, by, bw, bh, bh / 2); ctx.fill();
          ctx.fillStyle = contrastInk(c.accent); ctx.font = D(54 * U); ctx.textAlign = 'center'; ctx.fillText(T(s.yes), W / 2, by + bh / 2 + 19 * U);
          ctx.restore();
        }
        if (p > .7) { ctx.globalAlpha = (p - .7) / .3; ctx.fillStyle = c.accent; for (let i = 0; i < 14; i++) heart(ctx, W * ((i * 0.071 + .03) % 1), H - ((lt * 220 + i * 140) % (H + 100)), (16 + (i % 4) * 6) * U); }
      } else if (s.k === 'invite') {
        bgFill(c.bg); particles(lt, lum(c.bg) < .4);
        const cw = Math.min(W - pad * 1.2, 860 * U), chh = Math.min(H - pad * 2, 980 * U), cx = W / 2 - cw / 2, cyy = H / 2 - chh / 2;
        const rise = easeOut(fadeIn(p, 0, .2));
        ctx.translate(0, (1 - rise) * 60 * U); ctx.globalAlpha = rise;
        ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 50 * U; ctx.shadowOffsetY = 20 * U;
        ctx.fillStyle = c.card; roundRect(ctx, cx, cyy, cw, chh, 26 * U); ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.strokeStyle = c.accent; ctx.globalAlpha = rise * .4; ctx.lineWidth = 2 * U; roundRect(ctx, cx + 22 * U, cyy + 22 * U, cw - 44 * U, chh - 44 * U, 18 * U); ctx.stroke();
        ctx.globalAlpha = rise; ctx.textAlign = 'center';
        let y = cyy + chh * .26;
        ctx.fillStyle = c.accent; ctx.font = Hd(56 * U); ctx.fillText(s.kicker || 'an invitation', W / 2, y);
        ctx.fillStyle = c.ink; const t = fit(ctx, T(s.date || ''), D, 96 * U, cw - 120 * U, 2, 30); ctx.font = D(t.size); drawLines(ctx, t.lines, W / 2, y + t.size * 1.3, t.size * 1.05);
        y += t.size * 1.3 + (t.lines.length - 1) * t.size * 1.05;
        if (s.time) { ctx.fillStyle = c.accent; ctx.font = D(150 * U); ctx.fillText(s.time, W / 2, y + 170 * U); y += 170 * U; }
        if (s.place) { ctx.fillStyle = c.ink; ctx.font = B(44 * U, 500); drawLines(ctx, wrap(ctx, s.place, cw - 140 * U).slice(0, 2), W / 2, y + 100 * U, 56 * U); }
      } else if (s.k === 'cake') {
        bgFill(c.bg); particles(lt, lum(c.bg) < .4);
        ctx.fillStyle = c.ink; const t = fit(ctx, T(s.title || 'Make a wish'), D, 130 * U, maxW, 2, 36); ctx.font = D(t.size); drawLines(ctx, t.lines, W / 2, H * .28, t.size * 1.05);
        const cw = Math.min(W * .62, 640 * U), base = H * .72;
        ctx.fillStyle = c.accent; roundRect(ctx, W / 2 - cw / 2, base - 170 * U, cw, 170 * U, 20 * U); ctx.fill();
        ctx.fillStyle = c.card; roundRect(ctx, W / 2 - cw * .38, base - 300 * U, cw * .76, 130 * U, 18 * U); ctx.fill();
        const n = Math.min(s.candles, 14); const out = clamp((p - .45) / .4) * n;
        for (let i = 0; i < n; i++) {
          const x = W / 2 - cw * .32 + (cw * .64) * (n === 1 ? .5 : i / (n - 1)), y = base - 300 * U;
          ctx.fillStyle = c.accent2; ctx.fillRect(x - 7 * U, y - 70 * U, 14 * U, 70 * U);
          if (i >= out) { ctx.fillStyle = '#FFC845'; ctx.beginPath(); ctx.ellipse(x, y - 92 * U + Math.sin(lt * 9 + i) * 2 * U, 10 * U, 18 * U, 0, 0, 6.28); ctx.fill(); }
        }
      }
      ctx.restore();
    }
    function roundRect(cx, x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    function hexRgb(h) { let x = String(h || '').replace('#', ''); if (x.length === 3) x = x.split('').map(v => v + v).join(''); return [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16) / 255); }
    function lum(h) { const [r, g, b] = hexRgb(h).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * r + .7152 * g + .0722 * b; }
    function contrastInk(bg) { const L = lum(bg); return (1.05 / (L + .05)) >= 3 ? '#ffffff' : '#1a1a1a'; }

    return {
      total,
      draw(t) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.textBaseline = 'alphabetic';
        let i = starts.findIndex((st, k) => t >= st && t < st + scenes[k].d);
        if (i === -1) i = scenes.length - 1;
        const lt = t - starts[i];
        drawScene(scenes[i], lt);
        const left = scenes[i].d - lt;
        if (left < TR && i < scenes.length - 1) {
          const a = ease(1 - left / TR);
          off.width = W; off.height = H;
          ctxRef.toOff();
          drawScene(scenes[i + 1], TR - left);
          ctxRef.toMain();
          ctx.globalAlpha = a;
          ctx.drawImage(off, 0, 0);
          ctx.globalAlpha = 1;
        }
        // global fade in/out
        if (t < .5) { ctx.globalAlpha = 1 - t / .5; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
        if (total - t < .8) { ctx.globalAlpha = clamp(1 - (total - t) / .8); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
        ctx.globalAlpha = 1;
      }
    };

  }

  const off = document.createElement('canvas');
  const ctxRef = { toOff() {}, toMain() {} };

  /* ---------- recording ---------- */
  async function loadImages(scenes) {
    const srcs = new Set();
    scenes.forEach(s => { if (s.img) srcs.add(s.img); (s.imgs || []).forEach(x => srcs.add(x)); });
    const map = new Map();
    await Promise.all([...srcs].map(src => new Promise(res => {
      const im = new Image();
      im.onload = () => { map.set(src, im); res(); };
      im.onerror = () => res();
      im.src = src;
    })));
    return map;
  }

  async function record() {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('This browser can\'t record video. Try Chrome, Edge or Safari on a computer.');
    const site = window.KB.getSite();
    const look = window.KEEPSAKE_LOOK.effective(site);
    const scenes = buildScenes(site).map(s => Object.assign({}, s, { d: s.d * opts.pace }));
    const size = { portrait: [1080, 1920], square: [1080, 1080], landscape: [1920, 1080] }[opts.shape];
    const canvas = $('#vid-canvas', dlg);
    canvas.width = size[0]; canvas.height = size[1];
    $('.vid-canvas-wrap', dlg).style.aspectRatio = `${size[0]} / ${size[1]}`;

    showStep('vid-rec');
    $('#vid-status', dlg).textContent = 'Getting fonts and photos ready…';
    await Promise.all(['display', 'body', 'hand'].map(r => document.fonts.load(`${look.fonts[r].w || 400} 60px "${look.fonts[r].family}"`).catch(() => {})));
    const imgs = await loadImages(scenes);
    const R = makeRendererSwappable(canvas, site, look, scenes, imgs);

    const stream = canvas.captureStream(30);
    let src = null;
    if (opts.song) {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const buf = await audioCtx.decodeAudioData(await opts.song.arrayBuffer());
        src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = buf.duration < R.total;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1);
        gain.gain.setValueAtTime(1, audioCtx.currentTime + Math.max(1, R.total - 1.5));
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + R.total);
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(gain).connect(dest);
        stream.addTrack(dest.stream.getAudioTracks()[0]);
      } catch (_) { window.KB.toast('That song couldn\'t be read, so the video will be silent.'); src = null; }
    }

    const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mime = types.find(t => MediaRecorder.isTypeSupported(t));
    if (!mime) throw new Error('This browser can\'t record video. Try Chrome, Edge or Safari on a computer.');
    lastExt = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
    const chunks = [];
    rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise(res => { rec.onstop = res; });

    stopFlag = false;
    R.draw(0);
    rec.start(500);
    if (src) src.start();
    const t0 = performance.now();
    let hiddenWarned = false;
    await new Promise(res => {
      function frame() {
        const t = (performance.now() - t0) / 1000;
        if (stopFlag || t >= R.total) { R.draw(Math.min(t, R.total - .01)); return res(); }
        R.draw(t);
        $('#vid-fill', dlg).style.width = (t / R.total * 100).toFixed(1) + '%';
        $('#vid-status', dlg).textContent = `Recording… ${Math.ceil(R.total - t)}s left`;
        if (document.hidden && !hiddenWarned) { hiddenWarned = true; }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
    rec.stop();
    if (src) { try { src.stop(); } catch (_) {} }
    await done;
    stream.getTracks().forEach(t => t.stop());
    if (stopFlag && !dlg.open) return;

    lastBlob = new Blob(chunks, { type: mime.split(';')[0] });
    const v = $('#vid-out', dlg);
    if (v.src) URL.revokeObjectURL(v.src);
    v.src = URL.createObjectURL(lastBlob);
    $('.vid-canvas-wrap', $('#vid-done', dlg)).style.aspectRatio = `${size[0]} / ${size[1]}`;
    const mb = (lastBlob.size / 1048576).toFixed(1);
    $('#vid-note', dlg).textContent = lastExt === 'mp4'
      ? `MP4, ${mb} MB. Ready for WhatsApp, Instagram and TikTok.`
      : `WebM, ${mb} MB. Plays in Chrome and on Android. For iPhone or WhatsApp, record again in Safari or a recent Chrome, which save MP4.`
      + (hiddenWarned ? ' The tab was hidden while recording, so some parts may have frozen.' : '');
    showStep('vid-done');
  }

  // makeRenderer with a swappable drawing context for crossfades
  function makeRendererSwappable(canvas, site, look, scenes, imgs) {
    // Wrap: create a proxy canvas context whose target can be swapped
    const main = canvas.getContext('2d');
    let target = main;
    const handler = {
      get(_, prop) { const v = target[prop]; return typeof v === 'function' ? v.bind(target) : v; },
      set(_, prop, val) { target[prop] = val; return true; }
    };
    const proxyCtx = new Proxy({}, handler);
    const fakeCanvas = { width: canvas.width, height: canvas.height, getContext: () => proxyCtx };
    const offCtx = off.getContext('2d');
    ctxRef.toOff = () => { target = offCtx; };
    ctxRef.toMain = () => { target = main; };
    off.width = canvas.width; off.height = canvas.height;
    return makeRenderer(fakeCanvas, site, look, scenes, imgs);
  }
})();
