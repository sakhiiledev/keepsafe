/* Keepsake heritage + premium sections: patterns, cattle herd, programme, couple, countdown,
   dress code, venue, RSVP ticket, FAQ, gifts, info cards, opening cover, scratch reveal, music */
(function (ext) { if (window.Keepsake && window.Keepsake.register) window.Keepsake.register(ext); else (window.KEEPSAKE_EXT = window.KEEPSAKE_EXT || []).push(ext); })((() => {
  'use strict';
  let H; // helpers from the engine, set at init
  const hh = () => H || (H = window.Keepsake.h);

  /* ---------------- heritage patterns (drawn, original tiles) ---------------- */
  function tile(id, c) {
    const w = '#ffffff', k = c.ink, a = c.accent, b = c.accent2, s = c.bg2;
    switch (id) {
      case 'beads': // beadwork triangles with bead dots
        return { w: 48, h: 28, svg: `<rect width="48" height="28" fill="${k}"/><path d="M0 28 L12 6 L24 28Z" fill="${a}"/><path d="M24 28 L36 6 L48 28Z" fill="${b}"/><path d="M12 6 L24 28 L36 6Z" fill="${w}"/>${[4, 12, 20, 28, 36, 44].map(x => `<circle cx="${x}" cy="3" r="1.8" fill="${s}"/>`).join('')}` };
      case 'braid': // parallel braid lines
        return { w: 40, h: 28, svg: `<rect width="40" height="28" fill="${c.bg}"/><rect y="3" width="40" height="3" fill="${k}"/><rect y="9" width="40" height="2" fill="${k}"/><rect y="13" width="40" height="3" fill="${a}"/><rect y="18" width="40" height="2" fill="${k}"/><rect y="22" width="40" height="3" fill="${k}"/>` };
      case 'ndebele':
        return { w: 56, h: 28, svg: `<rect width="56" height="28" fill="${w}"/><g stroke="${k}" stroke-width="2.5"><path d="M2 26 V8 H14 V2 H26 V26Z" fill="${a}"/><path d="M30 26 V2 H54 V14 H42 V26Z" fill="${b}"/></g><rect x="8" y="14" width="10" height="6" fill="${w}" stroke="${k}" stroke-width="2"/><rect x="36" y="6" width="12" height="4" fill="#2E8B57" stroke="${k}" stroke-width="2"/>` };
      case 'emahiya':
        return { w: 36, h: 28, svg: `<rect width="36" height="28" fill="${a}"/><circle cx="18" cy="14" r="8" fill="none" stroke="${w}" stroke-width="2"/><circle cx="18" cy="14" r="3.5" fill="${b}"/><circle cx="0" cy="14" r="4" fill="${w}"/><circle cx="36" cy="14" r="4" fill="${w}"/>` };
      case 'shweshwe':
        return { w: 28, h: 28, svg: `<rect width="28" height="28" fill="${a}"/>${[[7, 7], [21, 21], [21, 7], [7, 21]].map(([x, y], i) => i < 2 ? `<g fill="${w}"><circle cx="${x}" cy="${y - 3}" r="1.6"/><circle cx="${x + 3}" cy="${y}" r="1.6"/><circle cx="${x}" cy="${y + 3}" r="1.6"/><circle cx="${x - 3}" cy="${y}" r="1.6"/></g>` : `<circle cx="${x}" cy="${y}" r="1.2" fill="${w}"/>`).join('')}` };
      case 'diamond':
        return { w: 28, h: 28, svg: `<rect width="28" height="28" fill="${a}"/><path d="M14 2 L26 14 L14 26 L2 14Z" fill="none" stroke="${w}" stroke-width="1.6"/><path d="M14 9 L19 14 L14 19 L9 14Z" fill="${w}"/>` };
      case 'hempe':
        return { w: 40, h: 28, svg: [a, b, '#1E7BD8', '#F5C400', w].map((col, i) => `<rect x="${i * 8}" width="8" height="28" fill="${col}"/>`).join('') };
      case 'minwenda':
        return { w: 20, h: 28, svg: `<rect width="20" height="28" fill="#0b0b0b"/><rect y="4" width="20" height="3" fill="#E63946"/><rect y="9" width="20" height="2" fill="#F4C430"/><rect y="13" width="20" height="3" fill="#2A9D4B"/><rect y="18" width="20" height="2" fill="#1E6FD9"/><rect y="22" width="20" height="3" fill="#F4C430"/>` };
      case 'xibelani':
        return { w: 32, h: 28, svg: `<rect width="32" height="28" fill="${c.bg}"/><path d="M0 8 L8 2 L16 8 L24 2 L32 8" fill="none" stroke="${a}" stroke-width="3"/><path d="M0 16 L8 10 L16 16 L24 10 L32 16" fill="none" stroke="${b}" stroke-width="3"/><path d="M0 24 L8 18 L16 24 L24 18 L32 24" fill="none" stroke="#C2185B" stroke-width="3"/>` };
      case 'fynbos':
        return { w: 44, h: 28, svg: `<rect width="44" height="28" fill="${c.bg}"/><path d="M4 22 C14 20 30 20 40 22" stroke="${b}" stroke-width="1.4" fill="none"/><g fill="${a}"><ellipse cx="12" cy="16" rx="5" ry="2.4" transform="rotate(-30 12 16)"/><ellipse cx="22" cy="14" rx="5" ry="2.4" transform="rotate(25 22 14)"/><ellipse cx="32" cy="16" rx="5" ry="2.4" transform="rotate(-30 32 16)"/></g><circle cx="22" cy="8" r="2.6" fill="${b}"/>` };
      default: // classic
        return { w: 40, h: 28, svg: `<rect width="40" height="28" fill="${c.bg}"/><rect y="10" width="40" height="1.2" fill="${a}"/><rect y="17" width="40" height="1.2" fill="${a}"/><circle cx="20" cy="14" r="2.2" fill="${a}"/>` };
    }
  }
  function applyPattern(site) {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const c = {};
    ['bg', 'bg2', 'ink', 'accent', 'accent2', 'card'].forEach(k => { c[k] = cs.getPropertyValue('--' + k).trim() || '#888'; });
    const t = tile(site.pattern || 'classic', c);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}" viewBox="0 0 ${t.w} ${t.h}">${t.svg}</svg>`;
    root.style.setProperty('--pattern', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
    root.style.setProperty('--pattern-w', t.w + 'px');
    root.dataset.pattern = site.pattern ? 'on' : '';
  }

  /* ---------------- Nguni cow (drawn) ---------------- */
  const HIDES = [
    { base: '#F4EFE6', patch: '#1A1A1A' }, { base: '#F4EFE6', patch: '#8B3A1E' }, { base: '#1C1C1C', patch: '#F4EFE6' },
    { base: '#8B3A1E', patch: '#F4EFE6', few: true }, { base: '#EFE8DA', patch: '#9A4A2A', roan: true }, { base: '#C9A06A', patch: '#6B4423', few: true },
    { base: '#EFE8DA', patch: '#2B2B2B', roan: true }, { base: '#5A3A2A', patch: '#E9DCC6' }
  ];
  function seeded(n) { let x = Math.sin(n * 9301 + 49297) * 233280; return () => { x = Math.sin(x) * 10000; return x - Math.floor(x); }; }
  function cowSVG(i) {
    const r = seeded(i + 1), h = HIDES[i % HIDES.length], id = 'cw' + i + Math.floor(r() * 1e6);
    const patches = Array.from({ length: h.few ? 2 : 4 + Math.floor(r() * 3) }, () => `<ellipse cx="${40 + r() * 140}" cy="${40 + r() * 60}" rx="${10 + r() * 22}" ry="${7 + r() * 14}" fill="${h.patch}" transform="rotate(${(r() * 60 - 30).toFixed(0)} 100 70)"/>`).join('');
    const specks = h.roan ? Array.from({ length: 70 }, () => `<circle cx="${(40 + r() * 140).toFixed(1)}" cy="${(38 + r() * 66).toFixed(1)}" r="${(0.8 + r() * 1.4).toFixed(1)}" fill="${h.patch}" opacity=".8"/>`).join('') : '';
    const body = 'M50 60 C55 38 95 36 120 40 C140 30 160 34 168 48 C178 62 176 90 160 98 C140 106 80 108 60 100 C42 92 44 72 50 60 Z';
    const legs = (x, cls) => `<g class="leg ${cls}" style="transform-origin:${x + 4}px 96px"><rect x="${x}" y="92" width="9" height="44" rx="4" fill="${h.base}" stroke="rgba(0,0,0,.25)" stroke-width="1"/><rect x="${x - 0.5}" y="132" width="10" height="7" rx="2" fill="#2a2a2a"/></g>`;
    return `<svg class="cow" viewBox="0 0 220 150" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
      <path class="tail" d="M50 62 C38 74 40 96 42 112" stroke="${h.base}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="42" cy="114" rx="4" ry="7" fill="${h.patch}"/>
      ${legs(62, 'b1')}${legs(80, 'b2')}
      <g class="torso">
        <path d="${body}" fill="${h.base}" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>
        <g clip-path="url(#${id})">${patches}${specks}</g>
        <path d="M158 46 C168 44 178 50 184 56 L172 74 C166 70 160 62 158 46Z" fill="${h.base}"/>
        <g class="head">
          <ellipse cx="190" cy="64" rx="15" ry="12" fill="${h.base}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
          <ellipse cx="201" cy="73" rx="8" ry="6" fill="#d9b9a6"/>
          <circle cx="199" cy="72" r="1.2" fill="#3a2a22"/><circle cx="204" cy="72" r="1.2" fill="#3a2a22"/>
          <circle cx="192" cy="60" r="1.8" fill="#1a1a1a"/>
          <ellipse cx="178" cy="56" rx="6" ry="3" fill="${h.patch}" transform="rotate(-25 178 56)"/>
          <path d="M184 53 C176 38 186 26 197 28" stroke="#EADFC8" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <path d="M193 52 C198 38 210 34 215 41" stroke="#EADFC8" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        </g>
      </g>
      ${legs(138, 'f1')}${legs(154, 'f2')}
    </svg>`;
  }

  const E = s => hh().esc(s), F = s => hh().fill(s), P = t => hh().paras(t), L = t => hh().lines(t), PH = (s, a) => hh().photo(s, a), HD = (h, k) => hh().head(h, k);
  const initials = () => { const st = hh().site(); return ((st.to || '').trim()[0] || '') + ((st.from || '').trim()[0] || ''); };
  const safeUrl = u => { const v = String(u || '').trim(); return /^(https?:|mailto:|tel:)/i.test(v) ? v : (v && !/^[a-z][\w+.-]*:/i.test(v) ? 'https://' + v.replace(/^\/+/, '') : '#'); };
  const mapsUrl = q => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q || '');

  /* ---------------- sections ---------------- */
  const sections = {
    cattle: s => {
      const n = Math.max(1, Math.min(99, parseInt(s.count, 10) || 1));
      const shown = Math.min(n, 11);
      const photos = (s.photos && s.photos.length) ? s.photos : [];
      return `
      <section class="sec s-cattle">
        ${HD(s.heading, s.kicker)}
        ${s.intro ? `<div class="r-intro">${P(s.intro)}</div>` : ''}
        <div class="field">
          <div class="herd">${Array.from({ length: shown }, (_, i) => `<div class="cow-wrap" style="--i:${i}">${cowSVG(i)}</div>`).join('')}
            ${n > shown ? `<div class="cow-more hand">+${n - shown}</div>` : ''}</div>
          <div class="grass" aria-hidden="true"></div>
        </div>
        <div class="cattle-count"><b class="disp" data-to="${n}">0</b><span>${E(s.unit || (n === 1 ? 'cow' : 'cows'))}</span></div>
        ${s.stamp ? `<div class="stamp disp" aria-hidden="true">${F(s.stamp)}</div>` : ''}
        ${s.after ? `<div class="c-after">${P(s.after)}</div>` : ''}
        ${photos.length ? `<div class="cattle-strip">${photos.map((p, i) => `<figure class="polaroid mini" style="--r:${(i % 2 ? 1 : -1) * (2 + i % 3)}deg">${PH(p)}</figure>`).join('')}</div>` : ''}
      </section>`;
    },

    programme: s => {
      const items = L(s.items).map(l => { const m = l.split(/\s+[—–-]\s+/); return m.length > 1 ? { t: m[0], d: m.slice(1).join(' — ') } : { t: '', d: l }; });
      return `
      <section class="sec s-prog">
        ${HD(s.heading, s.kicker)}
        <ol class="prog">${items.map(i => `<li class="reveal"><span class="disp pt">${F(i.t)}</span><span class="pd">${F(i.d)}</span></li>`).join('')}</ol>
      </section>`;
    },

    couple: s => `
      <section class="sec s-couple">
        ${HD(s.heading, s.kicker)}
        <div class="duo">
          <div class="person reveal">${`<div class="ring-photo">${PH(s.photo1)}</div>`}<h3 class="disp">${F(s.name1)}</h3>${s.family1 ? `<p class="hand fam">${F(s.family1)}</p>` : ''}${s.text1 ? `<p>${F(s.text1)}</p>` : ''}</div>
          <div class="amp disp" aria-hidden="true">&amp;</div>
          <div class="person reveal">${`<div class="ring-photo">${PH(s.photo2)}</div>`}<h3 class="disp">${F(s.name2)}</h3>${s.family2 ? `<p class="hand fam">${F(s.family2)}</p>` : ''}${s.text2 ? `<p>${F(s.text2)}</p>` : ''}</div>
        </div>
        ${s.note ? `<div class="r-intro couple-note">${P(s.note)}</div>` : ''}
      </section>`,

    countdown: s => `
      <section class="sec s-countdown">
        ${s.label ? `<p class="hand kick">${F(s.label)}</p>` : ''}
        ${s.date ? `<p class="disp cd-date">${E(fmtDate(s.date))}</p>` : ''}
        <div class="count cd" data-date="${E(s.date)}">${['days', 'hours', 'minutes', 'seconds'].map(u => `<div class="unit"><b class="disp" data-u="${u}">0</b><span>${u}</span></div>`).join('')}</div>
        <p class="cd-after" hidden>${F(s.after || 'Today is the day.')}</p>
        <button class="btn ghost add-cal" type="button">Add to calendar</button>
      </section>`,

    dresscode: s => {
      const st = hh().site();
      const custom = L(s.colours).filter(x => /^#?[0-9a-f]{3,6}$/i.test(x)).map(x => x[0] === '#' ? x : '#' + x);
      const c = (st.style && st.style.colors) || {};
      const sw = custom.length ? custom : [c.accent, c.accent2, c.bg2, c.ink].filter(Boolean);
      return `
      <section class="sec s-dress">
        ${HD(s.heading, s.kicker)}
        ${s.text ? `<div class="r-intro">${P(s.text)}</div>` : ''}
        <div class="swatches">${(sw.length ? sw : ['var(--accent)', 'var(--accent2)', 'var(--bg2)', 'var(--ink)']).map(col => `<span class="sw" style="background:${E(col)}"></span>`).join('')}</div>
        ${st.pattern ? `<div class="pattern-sample" aria-hidden="true"></div>` : ''}
        <div class="dress-cols">
          ${s.women ? `<div class="dress-card reveal"><p class="hand">${E(s.womenLabel || 'For her')}</p>${P(s.women)}</div>` : ''}
          ${s.men ? `<div class="dress-card reveal"><p class="hand">${E(s.menLabel || 'For him')}</p>${P(s.men)}</div>` : ''}
        </div>
      </section>`;
    },

    venue: s => `
      <section class="sec s-venue">
        ${HD(s.heading, s.kicker)}
        <div class="venue-card reveal">
          ${s.photo ? `<div class="venue-photo">${PH(s.photo)}</div>` : ''}
          <div class="venue-body">
            <h3 class="disp">${F(s.name)}</h3>
            ${s.time ? `<p class="venue-time">${F(s.time)}</p>` : ''}
            ${s.address ? `<p class="venue-addr">${F(s.address)}</p>` : ''}
            ${s.notes ? `<div class="venue-notes">${P(s.notes)}</div>` : ''}
            <div class="venue-btns">
              <a class="btn" href="${E(safeUrl(s.map) !== '#' ? safeUrl(s.map) : mapsUrl((s.name || '') + ' ' + (s.address || '')))}" target="_blank" rel="noopener">Open in Maps</a>
              ${s.address ? `<button class="btn ghost copy" type="button" data-copy="${E(s.address)}">Copy address</button>` : ''}
            </div>
          </div>
        </div>
      </section>`,

    rsvp: s => {
      const meals = L(s.meals);
      return `
      <section class="sec s-rsvp" data-wa="${E((s.whatsapp || '').replace(/[^\d]/g, ''))}" data-max="${E(s.maxGuests || 4)}" data-event="${F(s.event || '')}" data-when="${F(s.when || '')}" data-where="${F(s.where || '')}">
        ${HD(s.heading || 'RSVP', s.kicker)}
        <div class="rsvp-card">
          <div class="rsvp-step" data-step="name">
            <p class="rsvp-hello disp"></p>
            ${s.intro ? `<div class="rsvp-intro">${P(s.intro)}</div>` : ''}
            ${s.deadline ? `<p class="hand rsvp-by">kindly reply by ${F(s.deadline)}</p>` : ''}
            <label class="rsvp-field"><span>Your name</span><input type="text" class="r-name" autocomplete="name" placeholder="Full name"></label>
            <div class="rsvp-choice">
              <button type="button" class="choice yes"><span class="ch-mark">✓</span><b class="disp">${E(hh().word('yes'))}</b><small>Joyfully accept</small></button>
              <button type="button" class="choice no"><span class="ch-mark">✕</span><b class="disp">${E(hh().word('no'))}</b><small>Regretfully decline</small></button>
            </div>
            <p class="rsvp-err" hidden>Please add your name first.</p>
          </div>

          <div class="rsvp-step" data-step="details" hidden>
            <div class="rsvp-field"><span>How many of you are coming?</span>
              <div class="stepper"><button type="button" class="st-minus" aria-label="Fewer guests">−</button><output class="disp st-n">1</output><button type="button" class="st-plus" aria-label="More guests">+</button></div>
              <div class="people" aria-hidden="true"></div>
              <p class="hint plus-hint" hidden></p>
            </div>
            ${meals.length ? `<div class="rsvp-field"><span>Meal preference</span><div class="chips">${meals.map(m => `<button type="button" class="chip" aria-pressed="false">${F(m)}</button>`).join('')}</div></div>` : ''}
            <label class="rsvp-field"><span>Allergies or dietary needs</span><input type="text" class="r-diet" placeholder="Optional"></label>
            ${s.askSong !== 'no' ? `<label class="rsvp-field"><span>A song that will get you dancing</span><input type="text" class="r-song" placeholder="Optional"></label>` : ''}
            <label class="rsvp-field"><span>A message for ${F('{to} & {from}')}</span><textarea class="r-msg" rows="3" placeholder="Optional"></textarea></label>
            <div class="rsvp-actions"><button type="button" class="btn ghost r-back">Back</button><button type="button" class="btn r-send">Confirm</button></div>
          </div>

          <div class="rsvp-step" data-step="ticket" hidden>
            <div class="ticket">
              <div class="t-main">
                <p class="hand t-kick">${F('{invite}')}</p>
                <h3 class="disp t-event">${F(s.event || '{to} & {from}')}</h3>
                <dl class="t-rows">
                  <div><dt>Guest</dt><dd class="t-name"></dd></div>
                  <div><dt>Admit</dt><dd class="t-n"></dd></div>
                  ${s.when ? `<div><dt>When</dt><dd>${F(s.when)}</dd></div>` : ''}
                  ${s.where ? `<div><dt>Where</dt><dd>${F(s.where)}</dd></div>` : ''}
                  <div class="t-meal-row" hidden><dt>Meal</dt><dd class="t-meal"></dd></div>
                </dl>
              </div>
              <div class="t-stub"><div class="barcode" aria-hidden="true"></div><span class="t-code"></span></div>
            </div>
            <p class="rsvp-thanks hand"></p>
            <div class="rsvp-actions wrap">
              <a class="btn r-wa" target="_blank" rel="noopener">Send my reply on WhatsApp</a>
              <button type="button" class="btn ghost r-cal">Add to calendar</button>
              <button type="button" class="btn ghost r-edit">Change my answer</button>
            </div>
          </div>

          <div class="rsvp-step" data-step="declined" hidden>
            <p class="disp rsvp-miss">We'll miss you.</p>
            <label class="rsvp-field"><span>Leave a message for ${F('{to} & {from}')}</span><textarea class="r-msg2" rows="3" placeholder="Optional"></textarea></label>
            <div class="rsvp-actions wrap"><a class="btn r-wa2" target="_blank" rel="noopener">Send my reply on WhatsApp</a><button type="button" class="btn ghost r-edit">Change my answer</button></div>
          </div>
        </div>
      </section>`;
    },

    faq: s => {
      const items = L(s.items).map(l => { const [q, ...a] = l.split('|'); return { q: q.trim(), a: a.join('|').trim() }; });
      return `
      <section class="sec s-faq">
        ${HD(s.heading || 'Good to know', s.kicker)}
        <div class="faq">${items.map(i => `<details class="faq-item reveal"><summary class="disp">${F(i.q)}</summary><p>${F(i.a)}</p></details>`).join('')}</div>
      </section>`;
    },

    gifts: s => {
      const rows = L(s.details).map(l => { const [k, ...v] = l.split(':'); return { k: k.trim(), v: v.join(':').trim() }; });
      return `
      <section class="sec s-gifts">
        ${HD(s.heading || 'Gifts', s.kicker)}
        ${s.text ? `<div class="r-intro">${P(s.text)}</div>` : ''}
        ${rows.length ? `<div class="det gift-det reveal">${rows.map(r => `<div class="det-row"><span>${F(r.k)}</span><span>${F(r.v)} <button type="button" class="copy mini-copy" data-copy="${E(r.v)}" aria-label="Copy ${E(r.k)}">copy</button></span></div>`).join('')}</div>` : ''}
        ${s.link ? `<p class="gift-link"><a class="btn" href="${E(safeUrl(s.link))}" target="_blank" rel="noopener">${E(s.linkLabel || 'View our registry')}</a></p>` : ''}
      </section>`;
    },

    info: s => `
      <section class="sec s-info">
        ${HD(s.heading, s.kicker)}
        <div class="info-grid">${(s.items || []).map(i => `<div class="info-card reveal"><h3 class="disp">${F(i.title)}</h3>${P(i.text)}</div>`).join('')}</div>
      </section>`,

    cover: s => {
      const v = s.variant || 'envelope';
      const names = F(s.names || '{to} & {from}');
      return `
      <section class="s-cover cover-${v}" role="dialog" aria-label="Invitation cover">
        ${v === 'envelope' ? `
          <button class="cv-env" type="button" aria-label="Open the invitation">
            <span class="cv-back"></span><span class="cv-letter"><span class="hand">${F(s.line || '{invite}')}</span><span class="disp">${names}</span>${s.date ? `<span class="cv-date">${F(s.date)}</span>` : ''}</span>
            <span class="cv-front"></span><span class="cv-flap"></span>
            <span class="cv-seal disp">${E(s.monogram || initials())}</span>
          </button>` : ''}
        ${v === 'curtain' ? `
          <div class="cv-stage"><p class="hand">${F(s.line || '{invite}')}</p><h2 class="disp">${names}</h2>${s.date ? `<p class="cv-date">${F(s.date)}</p>` : ''}</div>
          <span class="cv-curtain l" aria-hidden="true"></span><span class="cv-curtain r" aria-hidden="true"></span>
          <button class="cv-open btn" type="button">Open</button>` : ''}
        ${v === 'candle' ? `
          <div class="cv-dark">
            <button class="cv-candle" type="button" aria-label="Light the candle"><span class="wax"></span><span class="wick"></span><span class="fl"></span></button>
            <p class="hand cv-hint">tap the candle</p>
            <div class="cv-lit"><p class="hand">${F(s.line || '{invite}')}</p><h2 class="disp">${names}</h2>${s.date ? `<p class="cv-date">${F(s.date)}</p>` : ''}<button class="btn cv-enter" type="button">Enter</button></div>
          </div>` : ''}
        <p class="cv-tap hand">${v === 'envelope' ? 'tap the seal to open' : ''}</p>
      </section>`;
    },

    scratch: s => `
      <section class="sec s-scratch">
        ${HD(s.heading, s.kicker)}
        <div class="scratch-card">
          <div class="scratch-under"><p class="hand">${F(s.above || 'save the date')}</p><p class="disp sc-big">${F(s.reveal || '')}</p>${s.below ? `<p>${F(s.below)}</p>` : ''}</div>
          <canvas class="scratch-top" aria-label="Scratch to reveal"></canvas>
        </div>
        <p class="hand scratch-hint">${F(s.hint || 'scratch the card with your finger')}</p>
      </section>`
  };

  function fmtDate(v) {
    const d = new Date(v);
    if (isNaN(d)) return v || '';
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function icsDownload(title, start, location, durationH = 6) {
    const d = new Date(start); if (isNaN(d)) return;
    const f = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(d.getTime() + durationH * 3600000);
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Keepsake//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@keepsake', 'DTSTAMP:' + f(new Date()), 'DTSTART:' + f(d), 'DTEND:' + f(end), 'SUMMARY:' + String(title).replace(/\n/g, ' '), 'LOCATION:' + String(location || '').replace(/\n/g, ' '), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'save-the-date.ics'; document.body.appendChild(a); a.click(); a.remove();
  }
  function findEventDate() {
    const st = hh().site();
    const cd = (st.sections || []).find(x => x.type === 'countdown' && x.date);
    const v = (st.sections || []).find(x => x.type === 'venue');
    return { date: cd && cd.date, where: v ? [v.name, v.address].filter(Boolean).join(', ') : '' };
  }
  async function copyText(btn) {
    const t = btn.dataset.copy;
    try { await navigator.clipboard.writeText(t); btn.textContent = 'copied ✓'; }
    catch (_) { const r = document.createRange(); r.selectNodeContents(btn.parentElement); getSelection().removeAllRanges(); getSelection().addRange(r); btn.textContent = 'selected'; }
    setTimeout(() => { btn.textContent = btn.classList.contains('mini-copy') ? 'copy' : 'Copy address'; }, 1800);
  }

  /* ---------------- interactions ---------------- */
  function initCattle(root) {
    const { onCleanup, clamp } = hh();
    const n = +root.querySelector('.cattle-count b').dataset.to;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      root.classList.add('walking');
      const b = root.querySelector('.cattle-count b');
      const t0 = performance.now(), dur = hh().reduce ? 1 : 2600;
      (function step(now) {
        const p = clamp((now - t0) / dur);
        b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
        else { root.classList.add('arrived'); }
      })(t0);
    }, { threshold: .35 });
    io.observe(root);
    onCleanup(() => io.disconnect());
  }

  function initCountdown(root) {
    const el = root.querySelector('.cd');
    const target = new Date(el.dataset.date);
    const set = (u, v) => { const b = el.querySelector(`[data-u="${u}"]`); if (b) b.textContent = v; };
    function tick() {
      if (isNaN(target)) { ['days', 'hours', 'minutes', 'seconds'].forEach(u => set(u, '—')); return; }
      let d = (target - Date.now()) / 1000;
      if (d <= 0) { el.hidden = true; root.querySelector('.cd-after').hidden = false; return; }
      set('days', Math.floor(d / 86400).toLocaleString()); d %= 86400;
      set('hours', Math.floor(d / 3600)); d %= 3600;
      set('minutes', Math.floor(d / 60)); set('seconds', Math.floor(d % 60));
    }
    tick(); const id = setInterval(tick, 1000); hh().onCleanup(() => clearInterval(id));
    root.querySelector('.add-cal').addEventListener('click', () => {
      const st = hh().site(); const ev = findEventDate();
      icsDownload(hh().fill('{to} & {from}').replace(/&amp;/g, '&'), el.dataset.date, ev.where);
    });
  }

  function initRsvp(root, theme) {
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    const params = new URLSearchParams(location.search);
    const guest = params.get('guest') || '';
    const plusParam = params.get('plus');
    const max = Math.max(1, Math.min(20, plusParam !== null ? 1 + (parseInt(plusParam, 10) || 0) : (parseInt(root.dataset.max, 10) || 4)));
    const st = hh().site();
    const key = 'keepsake-rsvp:' + (st.to || '') + (st.from || '');
    let state = { name: guest, yes: null, n: 1, meals: [], diet: '', song: '', msg: '' };
    try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (saved) state = Object.assign(state, saved); } catch (_) {}
    const show = id => $$('.rsvp-step').forEach(x => { x.hidden = x.dataset.step !== id; });
    $('.rsvp-hello').textContent = state.name ? `Hello, ${state.name}` : hh().word('greet');
    $('.r-name').value = state.name;
    if (plusParam !== null) { const ph = $('.plus-hint'); ph.hidden = false; ph.textContent = max > 1 ? `Your invitation is for you and up to ${max - 1} guest${max > 2 ? 's' : ''}.` : 'Your invitation is for you.'; }

    function people() {
      $('.st-n').textContent = state.n;
      $('.people').innerHTML = Array.from({ length: state.n }, (_, i) => `<i style="--d:${i * 60}ms"></i>`).join('');
      $('.st-minus').disabled = state.n <= 1; $('.st-plus').disabled = state.n >= max;
    }
    function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) {} }
    // published pages (view.html) set this hook to store replies in the couple's dashboard
    function report() {
      if (typeof window.KEEPSAKE_ON_RSVP !== 'function') return;
      try { window.KEEPSAKE_ON_RSVP({ name: state.name, attending: state.yes === true, guests: state.yes ? state.n : 0, meals: state.meals, dietary: state.diet, song: state.song, message: state.msg }); } catch (_) {}
    }
    function waLink(text) {
      const num = root.dataset.wa;
      return (num ? `https://wa.me/${num}` : 'https://wa.me/') + '?text=' + encodeURIComponent(text);
    }
    function ticket() {
      $('.t-name').textContent = state.name;
      $('.t-n').textContent = state.n + (state.n === 1 ? ' guest' : ' guests');
      const mealRow = $('.t-meal-row'); if (state.meals.length) { mealRow.hidden = false; $('.t-meal').textContent = state.meals.join(', '); } else mealRow.hidden = true;
      let h = 0; for (const ch of state.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      $('.t-code').textContent = 'No. ' + String(h % 100000).padStart(5, '0');
      $('.barcode').innerHTML = Array.from({ length: 30 }, (_, i) => `<i style="height:${1 + ((h >> (i % 24)) & 3)}px"></i>`).join('');
      $('.rsvp-thanks').textContent = `${hh().word('thanks')}, ${state.name.split(' ')[0]}. We can't wait to celebrate with you.`;
      const ev = root.dataset.event || hh().fill('{to} & {from}').replace(/&amp;/g, '&');
      const lines = [`RSVP: ${ev}`, `${state.name} will be there (${state.n} ${state.n === 1 ? 'guest' : 'guests'}).`];
      if (state.meals.length) lines.push('Meal: ' + state.meals.join(', '));
      if (state.diet) lines.push('Dietary: ' + state.diet);
      if (state.song) lines.push('Song request: ' + state.song);
      if (state.msg) lines.push('Message: ' + state.msg);
      $('.r-wa').href = waLink(lines.join('\n'));
    }
    function declined() {
      const ev = root.dataset.event || hh().fill('{to} & {from}').replace(/&amp;/g, '&');
      const upd = () => { $('.r-wa2').href = waLink(`RSVP: ${ev}\n${state.name} can't make it, sadly.${state.msg ? '\nMessage: ' + state.msg : ''}`); };
      $('.r-msg2').value = state.msg; upd();
      $('.r-msg2').oninput = e => { state.msg = e.target.value; save(); upd(); };
    }

    people();
    if (state.yes === true && state.name) { ticket(); show('ticket'); }
    else if (state.yes === false && state.name) { declined(); show('declined'); }

    const needName = () => { state.name = $('.r-name').value.trim(); const ok = !!state.name; $('.rsvp-err').hidden = ok; if (!ok) $('.r-name').focus(); return ok; };
    $('.choice.yes').addEventListener('click', () => { if (!needName()) return; state.yes = true; save(); show('details'); hh().burst(theme.burst); });
    $('.choice.no').addEventListener('click', () => { if (!needName()) return; state.yes = false; save(); declined(); show('declined'); report(); });
    $('.st-minus').addEventListener('click', () => { state.n = Math.max(1, state.n - 1); people(); });
    $('.st-plus').addEventListener('click', () => { state.n = Math.min(max, state.n + 1); people(); });
    $$('.chip').forEach(c => c.addEventListener('click', () => {
      const on = c.getAttribute('aria-pressed') !== 'true'; c.setAttribute('aria-pressed', String(on));
      state.meals = $$('.chip[aria-pressed="true"]').map(x => x.textContent);
    }));
    $$('.chip').forEach(c => { if (state.meals.includes(c.textContent)) c.setAttribute('aria-pressed', 'true'); });
    if ($('.r-diet')) $('.r-diet').value = state.diet;
    if ($('.r-song')) $('.r-song').value = state.song;
    $('.r-msg').value = state.msg;
    $('.r-back').addEventListener('click', () => show('name'));
    $('.r-send').addEventListener('click', () => {
      state.diet = $('.r-diet') ? $('.r-diet').value.trim() : '';
      state.song = $('.r-song') ? $('.r-song').value.trim() : '';
      state.msg = $('.r-msg').value.trim();
      save(); ticket(); show('ticket'); hh().burst(theme.burst); report();
      $('.ticket').classList.remove('print'); void $('.ticket').offsetWidth; $('.ticket').classList.add('print');
    });
    $$('.r-edit').forEach(b => b.addEventListener('click', () => { state.yes = null; save(); show('name'); }));
    $('.r-cal').addEventListener('click', () => { const ev = findEventDate(); icsDownload(root.dataset.event || hh().fill('{to} & {from}').replace(/&amp;/g, '&'), ev.date, root.dataset.where || ev.where); });
  }

  function initCover(root) {
    const doc = document.documentElement;
    if (window.KEEPSAKE_COVER_OPENED) { root.classList.add('opening', 'gone'); return; }
    doc.classList.add('cover-locked');
    const open = () => {
      if (root.classList.contains('opening')) return;
      root.classList.add('opening');
      window.KEEPSAKE_COVER_OPENED = true;
      startMusic();
      setTimeout(() => { root.classList.add('gone'); doc.classList.remove('cover-locked'); }, hh().reduce ? 0 : 1700);
    };
    hh().onCleanup(() => doc.classList.remove('cover-locked'));
    const env = root.querySelector('.cv-env'); if (env) env.addEventListener('click', open);
    const cur = root.querySelector('.cv-open'); if (cur) cur.addEventListener('click', open);
    const candle = root.querySelector('.cv-candle');
    if (candle) {
      candle.addEventListener('click', () => { root.classList.add('lit'); startMusic(); });
      root.querySelector('.cv-enter').addEventListener('click', open);
    }
  }

  function initScratch(root, theme) {
    const cv = root.querySelector('.scratch-top');
    const card = root.querySelector('.scratch-card');
    const ctx = cv.getContext('2d');
    let done = false, drawing = false;
    function paint() {
      const r = card.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cs = getComputedStyle(document.documentElement);
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#D8C08A'); g.addColorStop(.5, '#F3E3B5'); g.addColorStop(1, '#BF9F5E');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 160; i++) ctx.fillRect(Math.random() * r.width, Math.random() * r.height, 1.5, 1.5);
      ctx.fillStyle = 'rgba(60,40,10,.55)'; ctx.font = `600 ${Math.max(16, r.width / 18)}px ${cs.getPropertyValue('--body')}`; ctx.textAlign = 'center';
      ctx.fillText('scratch here', r.width / 2, r.height / 2 + 6);
    }
    paint();
    const onR = () => { if (!done) paint(); };
    window.addEventListener('resize', onR); hh().onCleanup(() => window.removeEventListener('resize', onR));
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function scratch(e) {
      if (!drawing || done) return;
      const [x, y] = pos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
      check();
    }
    let last = 0;
    function check() {
      const now = performance.now(); if (now - last < 200) return; last = now;
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let clear = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] === 0) clear++;
      if (clear / (d.length / 64) > .5) { done = true; cv.classList.add('cleared'); hh().burst(theme.burst); }
    }
    cv.addEventListener('pointerdown', e => { drawing = true; cv.setPointerCapture(e.pointerId); scratch(e); });
    cv.addEventListener('pointermove', scratch);
    cv.addEventListener('pointerup', () => { drawing = false; });
    cv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { done = true; cv.classList.add('cleared'); } });
    cv.tabIndex = 0;
  }

  /* ---------------- music ---------------- */
  let audio = null;
  function setupMusic(site) {
    let btn = document.getElementById('kp-music');
    if (!site.music || !site.music.src) { if (btn) btn.remove(); if (audio) { audio.pause(); } return; }
    if (!audio) { audio = new Audio(); audio.loop = true; }
    if (audio.src !== site.music.src) audio.src = site.music.src;
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'kp-music'; btn.type = 'button'; btn.className = 'music-btn';
      btn.setAttribute('aria-label', 'Play music');
      btn.innerHTML = '<span class="eq"><i></i><i></i><i></i></span>';
      document.body.appendChild(btn);
      btn.addEventListener('click', () => { if (audio.paused) startMusic(); else { audio.pause(); btn.classList.remove('on'); btn.setAttribute('aria-label', 'Play music'); } });
    }
  }
  function startMusic() {
    if (!audio || !audio.src) return;
    audio.play().then(() => { const b = document.getElementById('kp-music'); if (b) { b.classList.add('on'); b.setAttribute('aria-label', 'Pause music'); } }).catch(() => {});
  }

  return {
    sections,
    init(app, theme, site) {
      H = window.Keepsake.h;
      applyPattern(site);
      setupMusic(site);
      app.querySelectorAll('.s-cattle').forEach(initCattle);
      app.querySelectorAll('.s-countdown').forEach(initCountdown);
      app.querySelectorAll('.s-rsvp').forEach(r => initRsvp(r, theme));
      app.querySelectorAll('.s-cover').forEach(initCover);
      app.querySelectorAll('.s-scratch').forEach(r => initScratch(r, theme));
      app.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => copyText(b)));
    }
  };
})());
