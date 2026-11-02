(() => {
  'use strict';
  const T = window.KEEPSAKE_TEMPLATES;
  const SCHEMA = window.KEEPSAKE_SCHEMA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clone = o => JSON.parse(JSON.stringify(o));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const params = new URLSearchParams(location.search);
  let key = T[params.get('t')] ? params.get('t') : 'anniversary';
  let site;

  /* ---------- storage (IndexedDB, images make localStorage too small) ---------- */
  const db = (() => {
    let p;
    const open = () => p || (p = new Promise((res, rej) => {
      const r = indexedDB.open('keepsake', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('projects');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const tx = (mode, fn) => open().then(d => new Promise((res, rej) => {
      const t = d.transaction('projects', mode); const req = fn(t.objectStore('projects'));
      t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error);
    }));
    return {
      get: k => tx('readonly', s => s.get(k)).catch(() => null),
      set: (k, v) => tx('readwrite', s => s.put(v, k)),
      del: k => tx('readwrite', s => s.delete(k)).catch(() => null)
    };
  })();

  /* ---------- helpers ---------- */
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.id);
    toast.id = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function readImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 1400, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', .82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file could not be read as an image. Try a JPG or PNG.')); };
      img.src = url;
    });
  }

  function armed(btn, label) {
    if (btn.dataset.armed === '1') { btn.dataset.armed = ''; return true; }
    const old = btn.innerHTML;
    btn.dataset.armed = '1'; btn.innerHTML = label; btn.classList.add('armed');
    setTimeout(() => { if (btn.isConnected && btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.innerHTML = old; btn.classList.remove('armed'); } }, 3000);
    return false;
  }

  const getPath = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, v) => { const last = path[path.length - 1]; getPath(obj, path.slice(0, -1))[last] = v; };

  function blankFor(type) {
    for (const k in T) { const s = T[k].site.sections.find(x => x.type === type); if (s) return clone(s); }
    return { type };
  }
  function blankItem(sub) {
    const o = {}; sub.forEach(([k, , kind]) => { o[k] = kind === 'image' ? '' : ''; }); return o;
  }

  /* ---------- preview ---------- */
  const frame = $('#preview');
  let ready = false, timer;
  window.addEventListener('message', e => {
    if (e.origin === location.origin && e.data && e.data.type === 'keepsake:ready') { ready = true; push(true); }
  });
  function push(now) {
    clearTimeout(timer);
    const go = () => {
      if (ready) frame.contentWindow.postMessage({ type: 'keepsake:site', site }, location.origin);
      save();
    };
    if (now) go(); else timer = setTimeout(go, 350);
  }
  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      db.set(key, site).then(() => { $('#saved').textContent = 'Saved on this device.'; })
        .catch(() => { $('#saved').textContent = 'Couldn\'t autosave here. Use Project › Save project file.'; });
    }, 600);
  }

  /* ---------- form rendering ---------- */
  function fieldHTML(def, path) {
    const [k, label, kind, sub] = def;
    const p = JSON.stringify(path.concat(k));
    const v = getPath(site, path.concat(k));
    if (kind === 'text' || kind === 'number' || kind === 'datetime-local') {
      return `<label class="f"><span>${esc(label)}</span><input type="${kind}" data-path='${p}' value="${esc(v ?? '')}"${kind === 'number' ? ' min="1" max="40"' : ''}></label>`;
    }
    if (kind === 'textarea') {
      const val = Array.isArray(v) ? v.join('\n') : (v ?? '');
      return `<label class="f"><span>${esc(label)}</span><textarea data-path='${p}' rows="4">${esc(val)}</textarea></label>`;
    }
    if (kind === 'image') {
      return `<div class="f"><span>${esc(label)}</span><div class="img-pick">
        ${v ? `<img class="thumb" src="${esc(v)}" alt="">` : '<span class="thumb" aria-hidden="true"></span>'}
        <label class="file-btn">${v ? 'Change' : 'Choose photo'}<input type="file" accept="image/*" data-img='${p}'></label>
        ${v ? `<button type="button" class="link-btn" data-clear='${p}'>Remove</button>` : ''}
      </div></div>`;
    }
    if (kind === 'images') {
      const arr = Array.isArray(v) ? v : [];
      return `<div class="f"><span>${esc(label)} (${arr.length})</span><div class="thumbs">
        ${arr.map((src, i) => `<div class="t"><img src="${esc(src)}" alt=""><button type="button" aria-label="Remove photo" data-remove='${JSON.stringify(path.concat(k, i))}'>×</button></div>`).join('')}
        <label class="file-btn">+ Add photos<input type="file" accept="image/*" multiple data-imgs='${p}'></label>
      </div></div>`;
    }
    if (kind === 'items') {
      const arr = Array.isArray(v) ? v : [];
      return `<div class="f"><span>${esc(label)}</span><div class="items">
        ${arr.map((it, i) => `<div class="item"><div class="item-head"><span>${i + 1}</span>
          <span><button type="button" class="icon" title="Move up" data-move='${JSON.stringify(path.concat(k, i))}' data-dir="-1" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" class="icon" title="Remove" data-remove='${JSON.stringify(path.concat(k, i))}'>✕</button></span></div>
          ${sub.map(sd => fieldHTML(sd, path.concat(k, i))).join('')}</div>`).join('')}
        <button type="button" class="ghost-btn" data-additem='${p}' data-sub='${esc(JSON.stringify(sub))}'>+ Add ${esc(label.toLowerCase().replace(/s$/, ''))}</button>
      </div></div>`;
    }
    return '';
  }

  function renderForm() {
    $('#to').value = site.to || '';
    $('#from').value = site.from || '';
    const openState = $$('#sections .sec-card').map(d => d.open);
    $('#sections').innerHTML = site.sections.map((s, i) => {
      const sc = SCHEMA[s.type];
      if (!sc) return '';
      const name = s.type === 'reasons' && sc.styles ? sc.styles[s.style || 'list'] : sc.label;
      const on = s.on !== false;
      const styleSel = s.type === 'reasons' ? `<label class="f"><span>Style</span><select data-path='${JSON.stringify(['sections', i, 'style'])}'>${Object.entries(sc.styles).map(([k, l]) => `<option value="${k}" ${k === (s.style || 'list') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>` : '';
      return `<details class="card sec-card${on ? '' : ' off'}" ${openState[i] ? 'open' : ''}>
        <summary>
          <span class="sec-name">${esc(name)}</span>
          <span class="sec-tools">
            <button type="button" class="icon" title="Move up" data-smove="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="icon" title="Move down" data-smove="${i}" data-dir="1" ${i === site.sections.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="icon" title="Delete section" data-sdel="${i}">✕</button>
            <label class="switch" title="Show this section"><input type="checkbox" data-son="${i}" ${on ? 'checked' : ''} aria-label="Show ${esc(name)}"><span></span></label>
          </span>
        </summary>
        <div class="sec-body">${styleSel}${sc.fields.map(fd => fieldHTML(fd, ['sections', i])).join('')}</div>
      </details>`;
    }).join('');
    afterForm();
  }

  function afterForm() { if (typeof window.KB_onForm === 'function') window.KB_onForm(); }

  function renderAddMenu() {
    $('#add-type').innerHTML = Object.entries(SCHEMA).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  }

  function renderTplMenu() {
    $('#tpl').innerHTML = Object.entries(T).map(([k, v]) => `<option value="${k}" ${k === key ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
  }

  /* ---------- events ---------- */
  const panel = $('.panel');

  panel.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'to' || el.id === 'from') { site[el.id] = el.value; push(); return; }
    if (!el.dataset.path) return;
    const path = JSON.parse(el.dataset.path);
    setPath(site, path, el.value);
    push();
  });

  panel.addEventListener('change', async e => {
    const el = e.target;
    if (el.dataset.path && el.tagName === 'SELECT') { setPath(site, JSON.parse(el.dataset.path), el.value); renderForm(); push(); return; }
    if (el.dataset.son) {
      site.sections[+el.dataset.son].on = el.checked;
      el.closest('.sec-card').classList.toggle('off', !el.checked);
      push(); return;
    }
    if (el.dataset.img && el.files[0]) {
      try { setPath(site, JSON.parse(el.dataset.img), await readImage(el.files[0])); renderForm(); push(); }
      catch (err) { toast(err.message); }
      return;
    }
    if (el.dataset.imgs && el.files.length) {
      const path = JSON.parse(el.dataset.imgs);
      const arr = Array.isArray(getPath(site, path)) ? getPath(site, path) : [];
      toast('Adding photos…');
      for (const f of el.files) { try { arr.push(await readImage(f)); } catch (err) { toast(err.message); } }
      setPath(site, path, arr);
      renderForm(); push();
      toast(`${arr.length} photo${arr.length === 1 ? '' : 's'} in the gallery`);
    }
  });

  panel.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.closest('summary')) e.preventDefault();
    if (b.dataset.clear) { setPath(site, JSON.parse(b.dataset.clear), ''); renderForm(); push(); }
    else if (b.dataset.remove) {
      const path = JSON.parse(b.dataset.remove); const idx = path.pop();
      getPath(site, path).splice(idx, 1); renderForm(); push();
    }
    else if (b.dataset.move) {
      const path = JSON.parse(b.dataset.move); const idx = path.pop(); const arr = getPath(site, path);
      const j = idx + (+b.dataset.dir); if (j < 0 || j >= arr.length) return;
      [arr[idx], arr[j]] = [arr[j], arr[idx]]; renderForm(); push();
    }
    else if (b.dataset.additem) {
      const path = JSON.parse(b.dataset.additem);
      if (!Array.isArray(getPath(site, path))) setPath(site, path, []);
      getPath(site, path).push(blankItem(JSON.parse(b.dataset.sub)));
      renderForm(); push();
    }
    else if (b.dataset.smove) {
      const i = +b.dataset.smove, j = i + (+b.dataset.dir);
      if (j < 0 || j >= site.sections.length) return;
      const open = $$('#sections .sec-card').map(d => d.open);
      [site.sections[i], site.sections[j]] = [site.sections[j], site.sections[i]];
      [open[i], open[j]] = [open[j], open[i]];
      renderForm(); $$('#sections .sec-card').forEach((d, k) => { d.open = open[k]; }); push();
    }
    else if (b.dataset.sdel) {
      const i = +b.dataset.sdel;
      if (!armed(b, 'Delete?')) return;
      site.sections.splice(i, 1); renderForm(); push();
    }
  });

  $('#add-btn').addEventListener('click', () => {
    const type = $('#add-type').value;
    const s = blankFor(type);
    const closingAt = site.sections.findIndex(x => x.type === 'closing');
    site.sections.splice(closingAt === -1 ? site.sections.length : closingAt, 0, s);
    renderForm();
    const cards = $$('#sections .sec-card');
    const card = cards[closingAt === -1 ? cards.length - 1 : closingAt];
    card.open = true; card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    push();
    toast(`${SCHEMA[type].label} added`);
  });

  $('#tpl').addEventListener('change', async e => {
    const next = e.target.value;
    const keep = { to: site.to, from: site.from };
    key = next;
    history.replaceState(null, '', `?t=${key}`);
    site = (await db.get(key)) || Object.assign(clone(T[key].site), keep);
    renderForm();
    loadFrame();
  });

  $$('.seg button').forEach(b => b.addEventListener('click', () => {
    $$('.seg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('.frame-wrap').dataset.view = b.dataset.view;
  }));
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $('.work').dataset.tab = b.dataset.tab;
  }));

  $('#reset').addEventListener('click', async e => {
    if (!armed(e.currentTarget, 'Tap again to clear everything')) return;
    $('.more').open = false;
    await db.del(key);
    site = clone(T[key].site);
    renderForm(); push(true);
    toast('Template reset');
  });

  $('#save-json').addEventListener('click', () => {
    $('.more').open = false;
    const blob = new Blob([JSON.stringify({ keepsake: 1, template: key, site })], { type: 'application/json' });
    downloadBlob(blob, `${slug(site.to)}-${key}-project.json`);
    toast('Project saved. Open it later with Project › Open project file.');
  });
  $('#load-json').addEventListener('change', async e => {
    $('.more').open = false;
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data.site || !data.site.sections) throw new Error();
      key = T[data.template] ? data.template : key;
      site = data.site;
      renderTplMenu(); renderForm(); loadFrame();
      history.replaceState(null, '', `?t=${key}`);
      toast('Project opened');
    } catch (_) { toast('That file isn\'t a Keepsake project.'); }
    e.target.value = '';
  });

  /* ---------- download ---------- */
  const slug = s => (String(s || 'for-you').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'for-you');
  function downloadBlob(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  $('#download').addEventListener('click', async () => {
    const btn = $('#download');
    btn.disabled = true; btn.textContent = 'Building…';
    try {
      const [css, js] = await Promise.all(['engine/engine.css', 'engine/engine.js'].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(); return r.text(); })));
      const data = JSON.stringify(site).replace(/</g, '\\u003c');
      const title = esc(site.to ? `For ${site.to}` : 'For you');
      const html = `<!doctype html>
<html lang="en" data-theme="${esc(site.theme)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<script>window.SITE=${data};</script>
<script>${js}</script>
</body>
</html>`;
      const blob = new Blob([html], { type: 'text/html' });
      downloadBlob(blob, `${slug(site.to)}-${key}.html`);
      const mb = blob.size / 1048576;
      toast(mb > 12 ? `Downloaded (${mb.toFixed(1)} MB). That's large; fewer photos will load faster.` : 'Downloaded. Open it, or upload it to Vercel or Netlify to share.');
    } catch (_) {
      toast('Download needs the builder to be opened from a web address, not straight from a file.');
    } finally {
      btn.disabled = false; btn.textContent = 'Download site';
    }
  });

  window.KB = { getSite: () => site, push, toast, key: () => key, renderForm, downloadBlob: (b, n) => downloadBlob(b, n), slug: s => slug(s) };

  /* ---------- boot ---------- */
  function loadFrame() { ready = false; frame.src = `preview.html?t=${key}`; }

  (async () => {
    renderTplMenu();
    renderAddMenu();
    site = (await db.get(key)) || clone(T[key].site);
    renderForm();
    const first = $('#sections .sec-card'); if (first) first.open = true;
    loadFrame();
  })();
})();
