/* Look panel: colours, fonts and type controls */
(() => {
  'use strict';
  const C = window.KEEPSAKE_CATALOG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  let open = false;

  // Load every catalog font once so the builder can preview them (and the video can use them)
  (() => {
    const fams = [...C.fonts.display, ...C.fonts.body, ...C.fonts.hand].map(f => f.q);
    const chunk = (arr, n) => arr.reduce((a, x, i) => (i % n ? a[a.length - 1].push(x) : a.push([x]), a), []);
    chunk(fams, 14).forEach(group => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?${group.join('&')}&display=swap`;
      document.head.appendChild(l);
    });
  })();

  function defaults(site) {
    const d = C.themeDefaults[site.theme] || C.themeDefaults.apology;
    const pal = C.palettes.find(p => p.id === d.palette);
    const pair = C.pairings.find(p => p.id === d.pairing);
    return { palette: pal, pairing: pair };
  }
  function fontsFor(pair) {
    return { display: C.find('display', pair.d), body: C.find('body', pair.b), hand: C.find('hand', pair.h) };
  }
  // The look the page is actually using (custom if set, otherwise the template's own)
  function effective(site) {
    const st = site.style || {};
    const d = defaults(site);
    return {
      colors: st.colors || clone(d.palette.c),
      fonts: st.fonts || fontsFor(d.pairing),
      paletteId: st.colors ? (st.paletteId || 'custom') : d.palette.id,
      pairingId: st.fonts ? (st.pairingId || 'custom') : d.pairing.id,
      headings: st.headings || 'normal',
      titleSize: st.titleSize || 1,
      textSize: st.textSize || 1
    };
  }
  window.KEEPSAKE_LOOK = { effective };

  function ensure(site) {
    if (!site.style) site.style = {};
    return site.style;
  }
  function syncQuery(st) {
    if (!st.fonts) { delete st.fontQuery; return; }
    st.fontQuery = [...new Set(['display', 'body', 'hand'].map(r => st.fonts[r].q))].join('&');
  }

  const fontOpt = (role, cur) => C.fonts[role].map(f => `<option value="${esc(f.family)}" ${f.family === cur ? 'selected' : ''} style="font-family:'${esc(f.family)}'">${esc(f.family)}</option>`).join('');

  function render() {
    const host = $('#look');
    if (!host) return;
    const site = window.KB.getSite();
    if (!site) return;
    const e = effective(site);
    host.innerHTML = `
      <details class="card sec-card look" ${open ? 'open' : ''}>
        <summary><span class="sec-name">Look: colours & fonts</span>
          <span class="look-peek" aria-hidden="true">${['bg', 'accent', 'accent2', 'ink'].map(k => `<i style="background:${esc(e.colors[k])}"></i>`).join('')}</span>
        </summary>
        <div class="sec-body">
          <div class="f"><span>Colour palette</span>
            <div class="pals" role="radiogroup" aria-label="Colour palette">
              ${C.palettes.map(p => `<button type="button" class="pal" role="radio" aria-checked="${p.id === e.paletteId}" data-pal="${p.id}" title="${esc(p.name)}">
                <span class="pal-sw" style="background:${p.c.bg}"><i style="background:${p.c.accent}"></i><i style="background:${p.c.accent2}"></i><i style="background:${p.c.ink}"></i></span>
                <span class="pal-name">${esc(p.name)}</span></button>`).join('')}
            </div>
          </div>
          <details class="sub" ${e.paletteId === 'custom' ? 'open' : ''}>
            <summary>Customise colours</summary>
            <div class="clrs">
              ${Object.entries(C.colorLabels).map(([k, l]) => `<label class="clr"><input type="color" id="clr-${k}" data-clr="${k}" value="${esc(e.colors[k])}"><span>${esc(l)}</span></label>`).join('')}
            </div>
          </details>

          <div class="f"><span>Font pairing</span>
            <div class="pairs" role="radiogroup" aria-label="Font pairing">
              ${C.pairings.map(p => `<button type="button" class="pair" role="radio" aria-checked="${p.id === e.pairingId}" data-pair="${p.id}">
                <b style="font-family:'${esc(p.d)}'">${esc(p.name)}</b>
                <span style="font-family:'${esc(p.b)}'">${esc(p.d)} + ${esc(p.b)}</span>
                <em style="font-family:'${esc(p.h)}'">with love</em></button>`).join('')}
            </div>
          </div>

          <div class="fonts-row">
            <label class="f"><span>Headings</span><select id="font-display" data-font="display">${fontOpt('display', e.fonts.display.family)}</select></label>
            <label class="f"><span>Body text</span><select id="font-body" data-font="body">${fontOpt('body', e.fonts.body.family)}</select></label>
            <label class="f"><span>Handwriting</span><select id="font-hand" data-font="hand">${fontOpt('hand', e.fonts.hand.family)}</select></label>
          </div>

          <div class="row3">
            <label class="f"><span>Heading style</span>
              <select id="type-headings" data-type="headings">
                ${[['normal', 'Normal'], ['caps', 'All caps'], ['italic', 'Italic']].map(([v, l]) => `<option value="${v}" ${v === e.headings ? 'selected' : ''}>${l}</option>`).join('')}
              </select></label>
            <label class="f"><span>Title size <output id="out-title">${Math.round(e.titleSize * 100)}%</output></span><input type="range" id="type-title" data-type="titleSize" min="0.7" max="1.3" step="0.05" value="${e.titleSize}"></label>
            <label class="f"><span>Text size <output id="out-text">${Math.round(e.textSize * 100)}%</output></span><input type="range" id="type-text" data-type="textSize" min="0.85" max="1.25" step="0.05" value="${e.textSize}"></label>
          </div>

          <button type="button" class="ghost-btn" id="look-reset">Use the template's own colours and fonts</button>
        </div>
      </details>`;
  }

  document.addEventListener('toggle', ev => {
    if (ev.target.classList && ev.target.classList.contains('look')) open = ev.target.open;
  }, true);

  document.addEventListener('click', ev => {
    const b = ev.target.closest('#look button');
    if (!b) return;
    const site = window.KB.getSite();
    if (b.dataset.pal) {
      const p = C.palettes.find(x => x.id === b.dataset.pal);
      const st = ensure(site);
      st.colors = clone(p.c); st.paletteId = p.id;
    } else if (b.dataset.pair) {
      const p = C.pairings.find(x => x.id === b.dataset.pair);
      const st = ensure(site);
      st.fonts = fontsFor(p); st.pairingId = p.id; syncQuery(st);
    } else if (b.id === 'look-reset') {
      delete site.style;
    } else return;
    render(); window.KB.push();
  });

  document.addEventListener('input', ev => {
    const el = ev.target;
    if (!el.closest || !el.closest('#look')) return;
    const site = window.KB.getSite();
    const e = effective(site);
    const st = ensure(site);
    if (el.dataset.clr) {
      if (!st.colors) st.colors = e.colors;
      st.colors[el.dataset.clr] = el.value; st.paletteId = 'custom';
      $$('.pal', $('#look')).forEach(p => p.setAttribute('aria-checked', 'false'));
      const peek = $$('.look-peek i'); ['bg', 'accent', 'accent2', 'ink'].forEach((k, i) => { if (peek[i]) peek[i].style.background = st.colors[k]; });
    } else if (el.dataset.type === 'titleSize' || el.dataset.type === 'textSize') {
      st[el.dataset.type] = parseFloat(el.value);
      $(el.dataset.type === 'titleSize' ? '#out-title' : '#out-text').textContent = Math.round(el.value * 100) + '%';
    } else return;
    window.KB.push();
  });

  document.addEventListener('change', ev => {
    const el = ev.target;
    if (!el.closest || !el.closest('#look')) return;
    const site = window.KB.getSite();
    const st = ensure(site);
    if (el.dataset.font) {
      if (!st.fonts) st.fonts = effective(site).fonts;
      st.fonts[el.dataset.font] = C.find(el.dataset.font, el.value);
      st.pairingId = 'custom'; syncQuery(st);
      $$('.pair', $('#look')).forEach(p => p.setAttribute('aria-checked', 'false'));
    } else if (el.dataset.type === 'headings') {
      st.headings = el.value;
    } else return;
    window.KB.push();
  });

  window.KB_onForm = render;
  render();
})();
