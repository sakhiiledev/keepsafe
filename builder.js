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
  let guestPub = null;    // { id, token, slug, published } when published without an account

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
  // ask the browser not to clear our storage when space runs low
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}

  /* ---------- drafts: every change is kept on this device, with or without an account ----------
     guest drafts: key "draft:<template>"   account projects: key "project:<id>"
     value: { site, template, ts, project? } */
  const draftKey = () => project ? 'project:' + project.id : 'draft:' + key;
  const lsGet = k => { try { return JSON.parse(localStorage.getItem('keepsake:' + k) || 'null'); } catch (_) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem('keepsake:' + k, JSON.stringify(v)); return true; } catch (_) { return false; } };
  const lsDel = k => { try { localStorage.removeItem('keepsake:' + k); } catch (_) {} };
  async function readDraft(k) {
    let v = await db.get(k);
    if (!v && k.startsWith('draft:')) v = await db.get(k.slice(6));       // drafts saved by the older builder
    if (v && v.sections) v = { site: v, ts: 0, template: k.replace(/^draft:/, '') };
    const l = lsGet(k);
    if (l && (!v || (l.ts || 0) > (v.ts || 0))) v = l;
    return v && v.site ? v : null;
  }
  let lastDraft = 0, draftTimer, draftOk = true, baseline = null;
  const markClean = () => { baseline = JSON.stringify(site); };
  function writeDraft(now) {
    clearTimeout(draftTimer);
    const go = () => {
      if (!site) return Promise.resolve();
      if (!project && !lastDraft && baseline === JSON.stringify(site)) return Promise.resolve();   // untouched template: nothing to keep
      const rec = { site, template: key, ts: Date.now(), guest: !project && guestPub ? guestPub : null, project: project ? { id: project.id, title: project.title, slug: project.slug, published: project.published } : null };
      const k = draftKey();
      return db.set(k, rec).then(() => { draftOk = true; lsDel(k); lastDraft = rec.ts; })
        .catch(() => { draftOk = lsSet(k, rec); if (draftOk) lastDraft = rec.ts; })
        .then(() => { if (!project) showDraftState(); });
    };
    if (now) return go();
    draftTimer = setTimeout(go, 300);
    return Promise.resolve();
  }
  const hhmm = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  function showDraftState() {
    if (!draftOk) { cloudState('Not saved on this device', 'bad'); $('#saved').textContent = 'This browser is blocking storage (private mode or full). Use Project › Save project file so you don\'t lose work.'; return; }
    cloudState((guestPub && guestPub.published ? 'Live · ' : '') + 'Draft saved · ' + hhmm(lastDraft), 'ok');
    $('#saved').textContent = me ? 'Your draft is kept on this device. Use "Save to my account" to keep it in your projects.' : 'Your draft is kept on this device, even if you close the tab. Sign in to keep it in your account too.';
  }
  // save straight away when the tab is hidden or closed, so nothing is lost
  const flush = () => { if (site) { writeDraft(true); if (project && pending) cloudSave(); } };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);

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
  let saveTimer, pending = false;
  function save() {
    clearTimeout(saveTimer);
    writeDraft();
    if (!project && guestPub && guestPub.published) { clearTimeout(guestTimer); guestTimer = setTimeout(guestSync, 2000); cloudState('Live page · updating soon…', 'busy'); }
    if (project) { pending = true; cloudState(navigator.onLine ? 'Saving soon…' : 'Offline · draft kept on this device', 'busy'); saveTimer = setTimeout(cloudSave, 1200); }
  }
  window.addEventListener('online', () => { if (project && pending) { toast('Back online. Saving your changes…'); cloudSave(); } });
  window.addEventListener('offline', () => { if (project) cloudState('Offline · draft kept on this device', 'busy'); });
  setInterval(() => { if (project && pending && navigator.onLine && !saving) cloudSave(); }, 30000);

  /* ---------- cloud (account) saving ---------- */
  function cloudState(text, cls) { const el = $('#cloud-state'); if (!el) return; el.textContent = text; el.className = 'cloud-state' + (cls ? ' ' + cls : ''); }
  const titleFor = st => {
    const names = [st.to, st.from].filter(Boolean).join(' & ');
    return ((names ? names + ' · ' : '') + (T[key] ? T[key].name : key)).slice(0, 160);
  };
  // move any embedded photos/songs (data: URLs) into storage so projects stay small
  async function liftMedia(obj, opts) {
    const jobs = [];
    const walk = (o, kind) => {
      for (const k in o) {
        const v = o[k];
        if (typeof v === 'string' && v.startsWith('data:') && v.length > 200) jobs.push(K.upload(v, /^data:audio/.test(v) ? 'song' : 'photo', opts).then(url => { o[k] = url; }));
        else if (v && typeof v === 'object') walk(v);
      }
    };
    walk(obj);
    await Promise.all(jobs);
    return jobs.length;
  }
  /* ---------- publishing without an account ---------- */
  let guestTimer, guestBusy = false;
  const suggestSlug = () => K.slugify([site.to, site.from].filter(Boolean).join(' ')) || K.slugify(T[key] ? T[key].name : key) || 'my-page';
  async function guestSync() {
    if (!guestPub || !guestPub.published || guestBusy) return;
    if (!navigator.onLine) { cloudState('Offline · live page updates when you\'re back', 'busy'); return; }
    guestBusy = true;
    try {
      if (await liftMedia(site, { guest: true })) { renderForm(); writeDraft(true); }
      const { error } = await K.guest.update(guestPub, { p_site: site, p_title: titleFor(site) });
      if (error) throw error;
      cloudState('Live · updated ' + hhmm(Date.now()), 'ok');
    } catch (err) { cloudState('Live page not updated · will retry', 'busy'); clearTimeout(guestTimer); guestTimer = setTimeout(guestSync, 30000); }
    finally { guestBusy = false; }
  }
  window.addEventListener('online', () => { if (guestPub && guestPub.published) guestSync(); });

  function guestDialog() {
    const g = guestPub;
    const live = g && g.published;
    const m = K.modal(`
      <h2>${live ? 'Your page is live' : 'Publish your page'}</h2>
      <p class="k-sub">${live ? 'Edits you make here update the live page automatically.' : 'No account needed. You get a link to share right away.'}</p>
      <label class="k-f"><span>Web address</span>
        <span class="k-slug"><span class="k-pre">${K.esc(location.host)}/p/</span><input type="text" id="g-slug" value="${K.esc(g ? g.slug : suggestSlug())}" maxlength="60" autocomplete="off" spellcheck="false"></span>
      </label>
      <p class="k-msg" id="g-msg" aria-live="polite"></p>
      <div class="k-live" id="g-live" hidden>
        <a id="g-link" href="#" target="_blank" rel="noopener"></a>
        <div class="k-row"><button type="button" class="k-btn ghost" id="g-copy">Copy link</button><a class="k-btn ghost" id="g-wa" target="_blank" rel="noopener" href="#">Share on WhatsApp</a><button type="button" class="k-btn ghost" id="g-rsvp">RSVPs</button></div>
      </div>
      <div id="g-rsvps"></div>
      <p class="fine" style="margin-top:14px">Guest pages stay live for 30 days and can only be edited from this browser. <a href="#" id="g-acct">Create a free account</a> to keep it for good, edit from any device and get RSVPs in a dashboard.</p>
      <div class="k-row end">
        ${live ? '<button type="button" class="k-btn ghost danger" id="g-off">Take offline</button>' : ''}
        <button type="button" class="k-btn" id="g-go">${live ? 'Update address' : g ? 'Publish again' : 'Publish'}</button>
      </div>`);
    const $m = q => m.el.querySelector(q), input = $m('#g-slug'), msg = $m('#g-msg');
    const say = (t, cls) => { msg.textContent = t; msg.className = 'k-msg' + (cls ? ' ' + cls : ''); };
    const showLive = slug => {
      const url = K.pageUrl(slug);
      $m('#g-live').hidden = false; $m('#g-link').href = url; $m('#g-link').textContent = url;
      $m('#g-wa').href = 'https://wa.me/?text=' + encodeURIComponent(`You're invited! ${url}`);
    };
    if (live) showLive(g.slug);
    input.addEventListener('input', () => { const v = K.slugify(input.value); if (v !== input.value) input.value = v; say(''); });
    $m('#g-copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText($m('#g-link').href); say('Link copied.', 'good'); } catch (_) { say('Select the link and copy it.'); } });
    $m('#g-acct').addEventListener('click', e => { e.preventDefault(); m.close(); cloudCreate(); });
    $m('#g-rsvp').addEventListener('click', async () => {
      const box = $m('#g-rsvps'); box.innerHTML = '<p class="k-msg">Loading…</p>';
      const { data, error } = await K.guest.rsvps(guestPub);
      if (error) { box.innerHTML = `<p class="k-msg bad">${K.esc(K.nice(error))}</p>`; return; }
      const seen = new Set(), rows = data.filter(r => { const k = r.name.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
      const people = rows.filter(r => r.attending).reduce((a, r) => a + (r.guests || 1), 0);
      box.innerHTML = rows.length ? `<p class="k-msg good">${people} coming · ${rows.filter(r => !r.attending).length} can't make it</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Reply</th><th>Guests</th><th>Message</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${K.esc(r.name)}</b></td><td><span class="pill ${r.attending ? 'yes' : 'no'}">${r.attending ? 'Coming' : 'Can\'t come'}</span></td><td>${r.attending ? r.guests : '–'}</td><td>${K.esc(r.message || '')}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="k-msg">No replies yet.</p>';
    });
    const off = $m('#g-off');
    if (off) off.addEventListener('click', async () => {
      const { error } = await K.guest.update(guestPub, { p_published: false });
      if (error) { say(K.nice(error), 'bad'); return; }
      guestPub.published = false; K.guest.store.put(Object.assign({ template: key, title: titleFor(site) }, guestPub)); writeDraft(true);
      cloudState('Page offline', ''); m.close(); toast('Your page is offline. Publish again any time.');
    });
    $m('#g-go').addEventListener('click', async () => {
      const slug = K.slugify(input.value);
      if (!K.slugOk(slug)) { say('Use 3 to 60 lowercase letters, numbers or dashes.', 'bad'); input.focus(); return; }
      const b = $m('#g-go'); b.disabled = true; say('Publishing…');
      try {
        if (!guestPub || slug !== guestPub.slug) {
          const { data: free } = await K.sb.rpc('slug_available', { p_slug: slug });
          if (free === false) throw new Error('SLUG_TAKEN');
        }
        site._siteUrl = K.pageUrl(slug);
        await liftMedia(site, { guest: true });
        if (guestPub) {
          const { data, error } = await K.guest.update(guestPub, { p_site: site, p_title: titleFor(site), p_slug: slug, p_published: true });
          if (error) throw error;
          Object.assign(guestPub, { slug: data[0].slug, published: true });
        } else {
          const { data, error } = await K.guest.publish(key, titleFor(site), slug, site);
          if (error) throw error;
          guestPub = { id: data[0].id, token: data[0].token, slug, published: true };
        }
        K.guest.store.put(Object.assign({ template: key, title: titleFor(site) }, guestPub));
        await writeDraft(true); renderForm(); push();
        showLive(guestPub.slug); say('Published. Share the link with your guests.', 'good');
        b.textContent = 'Update address';
        cloudState('Live · updated ' + hhmm(Date.now()), 'ok');
      } catch (err) {
        const t = K.nice(err);
        msg.innerHTML = K.esc(t) + (/Pro plan|account/.test(t) ? ' <a href="pricing.html">See plans</a>' : '');
        msg.className = 'k-msg bad';
      } finally { b.disabled = false; }
    });
  }

  let saving = false, again = false;
  async function cloudSave() {
    if (!project) return;
    if (saving) { again = true; return; }
    if (!navigator.onLine) { cloudState('Offline · draft kept on this device', 'busy'); return; }
    saving = true; pending = false; cloudState('Saving…', 'busy');
    try {
      if (await liftMedia(site)) { renderForm(); if (ready) frame.contentWindow.postMessage({ type: 'keepsake:site', site }, location.origin); }
      const { data, error } = await K.projects.save(project.id, { site, title: titleFor(site), template: key });
      if (error) throw error;
      project = Object.assign(project, data);
      cloudState('Saved · ' + hhmm(Date.now()), 'ok'); $('#saved').textContent = 'Saved to your account and on this device. Changes save automatically.';
    } catch (err) {
      pending = true;
      cloudState('Draft kept on this device · will retry', 'busy');
      const m = K.nice(err); if (!/reach the server/.test(m)) toast(m);
    }
    finally { saving = false; if (again) { again = false; cloudSave(); } }
  }
  async function cloudCreate() {
    if (!K) { toast('Accounts are not set up on this copy.'); return false; }
    if (!me) { await writeDraft(true); location.href = 'login.html?mode=up&next=' + encodeURIComponent('builder.html?t=' + key + '&save=1'); return false; }
    const btn = $('#cloud-save'); btn.disabled = true; cloudState('Saving…', 'busy');
    try {
      await liftMedia(site);
      let data, error;
      if (guestPub) {
        ({ error } = await K.guest.claim(guestPub));
        if (!error) ({ data, error } = await K.projects.save(guestPub.id, { site, title: titleFor(site) }));
        if (!error) { K.guest.store.drop(guestPub.id); guestPub = null; }
      } else ({ data, error } = await K.projects.create(key, site, titleFor(site)));
      if (error) throw error;
      project = data;
      history.replaceState(null, '', `?id=${project.id}`);
      await db.del('draft:' + key); await db.del(key); lsDel('draft:' + key);
      writeDraft(true);
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
      if (v === 'none') {
        return `<div class="f img-off"><span>${esc(label)}</span><div class="img-pick">
          <span class="hint">No photo here. It won't show on the page.</span>
          <label class="file-btn">Add a photo<input type="file" accept="image/*" data-img='${p}'></label>
        </div></div>`;
      }
      return `<div class="f"><span>${esc(label)}</span><div class="img-pick">
        ${v ? `<img class="thumb" src="${esc(v)}" alt="">` : '<span class="thumb" aria-hidden="true"></span>'}
        <label class="file-btn">${v ? 'Change' : 'Choose photo'}<input type="file" accept="image/*" data-img='${p}'></label>
        <button type="button" class="link-btn" data-nophoto='${p}' title="Take this photo spot off the page">${v ? 'Remove photo' : 'No photo here'}</button>
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
    if (b.dataset.nophoto) { setPath(site, JSON.parse(b.dataset.nophoto), 'none'); renderForm(); push(); toast('Photo spot removed. Use "Add a photo" to bring it back.'); }
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
    clearTimeout(saveTimer);
    await writeDraft(true);          // keep the current template's draft before switching
    key = next;
    history.replaceState(null, '', `?t=${key}`);
    const d = await readDraft('draft:' + key);
    site = d ? prep(d.site) : Object.assign(fresh(key), keep);
    guestPub = d && d.guest ? d.guest : null;
    lastDraft = d ? d.ts || 1 : 0; markClean(); if (d) showDraftState(); else cloudState('', '');
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
    if (!project) { await db.del('draft:' + key); await db.del(key); lsDel('draft:' + key); }
    site = fresh(key); lastDraft = 0; markClean(); cloudState('', '');
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
  window.addEventListener('beforeunload', e => { flush(); if (project && (saving || pending) && navigator.onLine) { e.preventDefault(); e.returnValue = ''; } });

  $('#cloud-save').addEventListener('click', () => cloudCreate());
  $('#publish').addEventListener('click', async () => {
    if (!K) { toast('Publishing isn\'t set up on this copy. Use Download instead.'); return; }
    if (!project && !me) { clearTimeout(saveTimer); guestDialog(); return; }
    if (!project && !(await cloudCreate())) return;
    clearTimeout(saveTimer); await cloudSave();
    K.publishDialog(project, upd => { project = Object.assign(project, upd); if (upd.slug && site._siteUrl !== K.pageUrl(upd.slug)) { site._siteUrl = K.pageUrl(upd.slug); renderForm(); push(); } });
  });

  (async () => {
    renderTplMenu();
    renderAddMenu();
    if (K) { me = await K.profile().catch(() => null); K.mountAccount($('[data-account]')); }
    const id = params.get('id');
    if (id && K) {
      const local = await readDraft('project:' + id);
      const signedIn = me || (await K.user().catch(() => null));
      if (!signedIn && !local) { location.replace('login.html?next=' + encodeURIComponent('builder.html?id=' + id)); return; }
      const { data, error } = signedIn ? await K.projects.get(id) : { data: null, error: new Error('Failed to fetch') };
      if (data) {
        project = data; key = T[data.template] ? data.template : key; site = prep(data.site);
        delete project.site;
        const serverTs = Date.parse(data.updated_at) || 0;
        if (local && local.ts > serverTs + 2000 && JSON.stringify(local.site) !== JSON.stringify(data.site)) {
          site = prep(local.site); pending = true;
          toast('Restored changes you made on this device that hadn\'t reached your account yet.');
          setTimeout(cloudSave, 800);
        } else { cloudState('Saved', 'ok'); }
      } else if (local && (!error || /reach the server/.test(K.nice(error)))) {
        // offline: keep editing from the copy on this device; it syncs when you're back online
        project = Object.assign({ id }, local.project || {}); key = T[local.template] ? local.template : key; site = prep(local.site);
        pending = true; cloudState('Offline · draft kept on this device', 'busy');
        toast('You\'re offline. Editing the copy saved on this device.');
      } else { toast(error ? K.nice(error) : 'That project wasn\'t found.'); setTimeout(() => { location.href = 'dashboard.html'; }, 1600); return; }
      $('#cloud-save').hidden = true;
      $('#saved').textContent = 'Saved to your account and on this device. Changes save automatically.';
      renderTplMenu();
    } else {
      const d = await readDraft('draft:' + key);
      site = prep(d ? d.site : fresh(key));
      guestPub = d && d.guest ? d.guest : null;
      if (guestPub && guestPub.published) cloudState('Live · ' + location.host + '/p/' + guestPub.slug, 'ok');
      if (d && d.ts) { lastDraft = d.ts; showDraftState(); if (d.ts > Date.now() - 864e5 * 60) toast('Welcome back. Your draft is just as you left it.'); }
    }
    if (!project && params.get('save') === '1' && me) { history.replaceState(null, '', `?t=${key}`); cloudCreate(); }
    markClean();
    renderForm();
    const first = $('#sections .sec-card'); if (first) first.open = true;
    loadFrame();
  })();
})();
