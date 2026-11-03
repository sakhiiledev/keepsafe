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
  const K = window.KCloud && window.KCloud.ready ? window.KCloud : null;
  let me = null;          // signed-in profile, or null
  let project = null;     // cloud project row when editing a saved project

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
        const data = c.toDataURL('image/jpeg', .82);
        if (project && K) K.upload(data, 'photo').then(res, () => res(data)); else res(data);
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

  function prep(st) {
    const C = window.KEEPSAKE_CATALOG;
    if (st && st.culture && C && !(st.style && st.style.colors)) C.applyCulture(st, st.culture);
    return st;
  }
  function fresh(k) {
    const st = clone(T[k].site);
    const c = params.get('c');
    if (c && T[k].cultures && window.KEEPSAKE_CATALOG) window.KEEPSAKE_CATALOG.applyCulture(st, c);
    return prep(st);
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
    if (project) { cloudState('Unsaved changes', 'busy'); saveTimer = setTimeout(cloudSave, 1200); return; }
    saveTimer = setTimeout(() => {
      db.set(key, site).then(() => { $('#saved').textContent = me ? 'Saved on this device. Use "Save to my account" to keep it in your projects.' : 'Saved on this device. Sign in to save it to your account.'; })
        .catch(() => { $('#saved').textContent = 'Couldn\'t autosave here. Use Project › Save project file.'; });
    }, 600);
  }

  /* ---------- cloud (account) saving ---------- */
  function cloudState(text, cls) { const el = $('#cloud-state'); if (!el) return; el.textContent = text; el.className = 'cloud-state' + (cls ? ' ' + cls : ''); }
  const titleFor = st => {
    const names = [st.to, st.from].filter(Boolean).join(' & ');
    return ((names ? names + ' · ' : '') + (T[key] ? T[key].name : key)).slice(0, 160);
  };
  // move any embedded photos/songs (data: URLs) into storage so projects stay small
  async function liftMedia(obj) {
    const jobs = [];
    const walk = (o, kind) => {
      for (const k in o) {
        const v = o[k];
        if (typeof v === 'string' && v.startsWith('data:') && v.length > 200) jobs.push(K.upload(v, /^data:audio/.test(v) ? 'song' : 'photo').then(url => { o[k] = url; }));
        else if (v && typeof v === 'object') walk(v);
      }
    };
    walk(obj);
    await Promise.all(jobs);
    return jobs.length;
  }
  let saving = false, again = false;
  async function cloudSave() {
    if (!project) return;
    if (saving) { again = true; return; }
    saving = true; cloudState('Saving…', 'busy');
    try {
      if (await liftMedia(site)) { renderForm(); if (ready) frame.contentWindow.postMessage({ type: 'keepsake:site', site }, location.origin); }
      const { data, error } = await K.projects.save(project.id, { site, title: titleFor(site), template: key });
      if (error) throw error;
      project = Object.assign(project, data);
      cloudState('Saved', 'ok'); $('#saved').textContent = 'Saved to your account. Changes save automatically.';
    } catch (err) { cloudState('Not saved', 'bad'); toast(K.nice(err)); }
    finally { saving = false; if (again) { again = false; cloudSave(); } }
  }
  async function cloudCreate() {
    if (!K) { toast('Accounts are not set up on this copy.'); return false; }
    if (!me) { await db.set(key, site).catch(() => {}); location.href = 'login.html?mode=up&next=' + encodeURIComponent('builder.html?t=' + key + '&save=1'); return false; }
    const btn = $('#cloud-save'); btn.disabled = true; cloudState('Saving…', 'busy');
    try {
      await liftMedia(site);
      const { data, error } = await K.projects.create(key, site, titleFor(site));
      if (error) throw error;
      project = data;
      history.replaceState(null, '', `?id=${project.id}`);
      await db.del(key);
      btn.hidden = true; cloudState('Saved', 'ok');
      $('#saved').textContent = 'Saved to your account. Changes save automatically.';
      renderForm(); push(true);
      toast('Saved to your projects');
      return true;
    } catch (err) {
      cloudState('Not saved', 'bad');
      const m = K.nice(err);
      if (/plan|Pro/.test(m)) { const d = K.modal(`<h2>Your free projects are full</h2><p class="k-sub">${K.esc(m)}</p><div class="k-row end"><a class="k-btn ghost" href="dashboard.html">Manage projects</a><a class="k-btn gold" href="pricing.html">See plans</a></div>`); }
      else toast(m);
      return false;
    } finally { btn.disabled = false; }
  }

  /* ---------- form rendering ---------- */
  function fieldHTML(def, path) {
    const [k, label, kind, sub] = def;
    const p = JSON.stringify(path.concat(k));
    const v = getPath(site, path.concat(k));
    if (kind === 'text' || kind === 'number' || kind === 'datetime-local') {
      return `<label class="f"><span>${esc(label)}</span><input type="${kind}" data-path='${p}' value="${esc(v ?? '')}"${kind === 'number' ? ' min="1" max="40"' : ''}></label>`;
    }
    if (kind === 'select') {
      const opts = def[4] || [];
      return `<label class="f"><span>${esc(label)}</span><select data-path='${p}'>${opts.map(([v, l]) => `<option value="${esc(v)}" ${(v ?? '') === (getPath(site, path.concat(k)) ?? opts[0][0]) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
    }
    if (kind === 'guestlinks') {
      return `<div class="f guestlinks"><span>${esc(label)}</span>
        <p class="hint">Each guest gets their own link that greets them by name and limits how many people they can RSVP for. Paste your website address after you publish it.</p>
        <input type="text" class="gl-base" placeholder="https://your-site.vercel.app" value="${esc(site._siteUrl || '')}">
        <textarea class="gl-list" rows="4" placeholder="One guest per line: Name, extra guests&#10;Thandi Mokoena, 1&#10;Uncle Sipho, 3">${esc(site._guests || '')}</textarea>
        <div class="gl-out"></div></div>`;
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

  function renderWho() {
    const C = window.KEEPSAKE_CATALOG;
    const box = $('#who-extra');
    if (!box || !C) return;
    const cult = T[key] && T[key].cultures;
    box.innerHTML = `
      ${cult ? `<label class="f"><span>Culture theme</span>
        <select id="culture">
          <option value="">None (keep my own colours)</option>
          ${C.cultures.map(c => `<option value="${c.id}" ${site.culture === c.id ? 'selected' : ''}>${esc(c.name)} · ${esc(c.lang)}</option>`).join('')}
        </select></label>
        <p class="hint">Sets colours, fonts, the heritage pattern, greetings and a scenery photo. Words like <code>{greet}</code>, <code>{invite}</code>, <code>{lobola}</code>, <code>{wedding}</code> and <code>{thanks}</code> change with it. Please check spelling with family.</p>` : ''}
      <div class="f"><span>Background song (optional)</span>
        <span class="img-pick">
          <label class="file-btn">${site.music && site.music.src ? 'Change song' : 'Choose a song'}<input type="file" id="music" accept="audio/*"></label>
          ${site.music && site.music.src ? `<span class="hint">${esc(site.music.name || 'song added')}</span><button type="button" class="link-btn" id="music-x">Remove</button>` : '<span class="hint">Plays when guests tap the music button or open the cover.</span>'}
        </span></div>`;
  }

  function renderGuestLinks() {
    $$('.guestlinks').forEach(box => {
      const base = (box.querySelector('.gl-base').value || '').trim().replace(/\/$/, '');
      const rows = box.querySelector('.gl-list').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [n, p] = l.split(','); return { n: n.trim(), p: parseInt(p, 10) || 0 }; });
      box.querySelector('.gl-out').innerHTML = rows.map(r => {
        const url = `${base || 'https://your-site'}/?guest=${encodeURIComponent(r.n)}&plus=${r.p}`;
        const msg = `Hi ${r.n.split(' ')[0]}, you're invited! Open your personal invitation: ${url}`;
        return `<div class="gl-row"><b>${esc(r.n)}</b><span class="gl-url">${esc(url)}</span><a class="link-btn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Send on WhatsApp</a></div>`;
      }).join('');
    });
  }

  function renderForm() {
    $('#to').value = site.to || '';
    renderWho();
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

  function afterForm() { renderGuestLinks(); if (typeof window.KB_onForm === 'function') window.KB_onForm(); }

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
    if (el.classList.contains('gl-base')) { site._siteUrl = el.value; renderGuestLinks(); save(); return; }
    if (el.classList.contains('gl-list')) { site._guests = el.value; renderGuestLinks(); save(); return; }
    if (!el.dataset.path) return;
    const path = JSON.parse(el.dataset.path);
    setPath(site, path, el.value);
    push();
  });

  panel.addEventListener('change', async e => {
    const el = e.target;
    if (el.id === 'culture') {
      if (el.value) window.KEEPSAKE_CATALOG.applyCulture(site, el.value);
      else { delete site.culture; delete site.words; delete site.pattern; }
      renderForm(); push(); toast(el.value ? 'Culture theme applied' : 'Culture theme removed'); return;
    }
    if (el.id === 'music' && el.files[0]) {
      const f = el.files[0];
      if (f.size > 8 * 1048576) { toast('That song is over 8 MB. Try a shorter or smaller MP3.'); return; }
      const src = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });
      let url = src;
      if (project && K) { toast('Uploading song…'); try { url = await K.upload(src, 'song'); } catch (err) { toast(K.nice(err)); return; } }
      site.music = { src: url, name: f.name }; renderForm(); push(); toast('Song added'); return;
    }
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
    if (b.id === 'music-x') { delete site.music; renderForm(); push(); return; }
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
    if (project) { location.href = `builder.html?t=${next}`; return; }
    const keep = { to: site.to, from: site.from };
    key = next;
    history.replaceState(null, '', `?t=${key}`);
    site = (await db.get(key)) || Object.assign(fresh(key), keep);
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
    if (!project) await db.del(key);
    site = fresh(key);
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
      const files = ['engine/engine.css', 'engine/heritage.css', 'engine/heritage.js', 'engine/engine.js'];
      const [css1, css2, jsH, jsE] = await Promise.all(files.map(u => fetch(u).then(r => { if (!r.ok) throw new Error(); return r.text(); })));
      const css = css1 + '\n' + css2, js = jsH + '\n' + jsE;
      // bundled photos (assets/...) are inlined so the single file works anywhere
      const out = clone(site); delete out._siteUrl; delete out._guests;
      if (!(K && K.isPaid(me))) out._badge = location.origin + '/';
      const assetUrls = [...new Set(JSON.stringify(out).match(/(?:assets\/[\w\/.-]+\.(?:jpg|jpeg|png|webp)|https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/media\/[\w\/.-]+)/g) || [])];
      const map = {};
      await Promise.all(assetUrls.map(async u => {
        const b = await fetch(u).then(r => r.blob());
        map[u] = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
      }));
      let json = JSON.stringify(out);
      assetUrls.forEach(u => { json = json.split(u).join(map[u]); });
      const data = json.replace(/</g, '\\u003c');
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
      btn.disabled = false; btn.textContent = 'Download';
    }
  });

  window.KB = { getSite: () => site, push, toast, key: () => key, renderForm, downloadBlob: (b, n) => downloadBlob(b, n), slug: s => slug(s) };

  /* ---------- boot ---------- */
  function loadFrame() { ready = false; frame.src = `preview.html?t=${key}`; }
  window.addEventListener('beforeunload', e => { if (project && (saving || $('#cloud-state').classList.contains('busy'))) { cloudSave(); e.preventDefault(); e.returnValue = ''; } });

  $('#cloud-save').addEventListener('click', () => cloudCreate());
  $('#publish').addEventListener('click', async () => {
    if (!project && !(await cloudCreate())) return;
    clearTimeout(saveTimer); await cloudSave();
    K.publishDialog(project, upd => { project = Object.assign(project, upd); });
  });

  (async () => {
    renderTplMenu();
    renderAddMenu();
    if (K) { me = await K.profile().catch(() => null); K.mountAccount($('[data-account]')); }
    const id = params.get('id');
    if (id && K) {
      if (!me) { location.replace('login.html?next=' + encodeURIComponent('builder.html?id=' + id)); return; }
      const { data, error } = await K.projects.get(id);
      if (error || !data) { toast(error ? K.nice(error) : 'That project wasn\'t found.'); setTimeout(() => { location.href = 'dashboard.html'; }, 1600); return; }
      project = data; key = T[data.template] ? data.template : key; site = prep(data.site);
      delete project.site;
      $('#cloud-save').hidden = true; cloudState('Saved', 'ok');
      $('#saved').textContent = 'Saved to your account. Changes save automatically.';
      renderTplMenu();
    } else site = prep((await db.get(key)) || fresh(key));
    if (!project && params.get('save') === '1' && me) { history.replaceState(null, '', `?t=${key}`); cloudCreate(); }
    renderForm();
    const first = $('#sections .sec-card'); if (first) first.open = true;
    loadFrame();
  })();
})();
