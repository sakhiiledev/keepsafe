/* Keepsake cloud: accounts, projects, publishing and uploads (Supabase). Loaded after config.js and vendor/supabase. */
(() => {
  'use strict';
  const C = window.KEEPSAKE_CONFIG;
  const ok = C && window.supabase && C.supabaseUrl && C.supabaseKey;
  const sb = ok ? window.supabase.createClient(C.supabaseUrl, C.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ERR = {
    FREE_LIMIT_PROJECTS: 'The free plan holds 3 projects. Delete one or upgrade to Pro to save more.',
    FREE_LIMIT_PUBLISHED: 'The free plan can publish 1 page at a time. Unpublish the other page or upgrade to Pro.',
    PREMIUM_TEMPLATE: 'Premium invitations need the Pro plan to publish. You can still edit and preview it.',
    SLUG_REQUIRED: 'Choose a web address for the page first.',
    NOT_ADMIN: 'Only admins can do that.',
    'duplicate key value violates unique constraint "projects_slug_key"': 'That web address is taken. Try another one.',
    'Invalid login credentials': 'That email and password don\'t match. Check them or reset your password.',
    'Email not confirmed': 'Confirm your email first. We sent you a link when you signed up.',
    'User already registered': 'There\'s already an account with that email. Sign in instead.'
  };
  function nice(err) {
    if (!err) return 'Something went wrong. Try again.';
    const m = String(err.message || err);
    for (const k in ERR) if (m.includes(k)) return ERR[k];
    if (/projects_slug_check|slug/.test(m)) return 'Use 3 to 60 lowercase letters, numbers or dashes for the web address.';
    if (/Failed to fetch|NetworkError|network/i.test(m)) return 'Can\'t reach the server. Check your connection and try again.';
    if (/site_size/.test(m)) return 'This project is too large to save. Remove some photos or a long song.';
    return m;
  }

  let profileCache = null;
  async function session() { if (!sb) return null; const { data } = await sb.auth.getSession(); return data.session; }
  async function user() { const s = await session(); return s ? s.user : null; }
  async function profile(force) {
    const u = await user(); if (!u) return null;
    if (profileCache && !force && profileCache.id === u.id) return profileCache;
    const { data, error } = await sb.from('profiles').select('id, full_name, plan, is_admin').eq('id', u.id).maybeSingle();
    if (error) throw error;
    profileCache = Object.assign({ email: u.email, plan: 'free', is_admin: false }, data || {}, { email: u.email });
    return profileCache;
  }
  async function requireAuth() {
    const u = await user();
    if (!u) { location.replace('login.html?next=' + encodeURIComponent(location.pathname.replace(/^\//, '') + location.search)); return null; }
    return u;
  }
  async function signOut() { if (sb) await sb.auth.signOut(); profileCache = null; location.href = 'index.html'; }
  const isPaid = p => p && (p.plan === 'pro' || p.plan === 'business');

  /* ---------- projects ---------- */
  const COLS = 'id, template, title, slug, published, published_at, created_at, updated_at';
  const projects = {
    list: () => sb.from('projects').select(COLS).order('updated_at', { ascending: false }),
    get: id => sb.from('projects').select(COLS + ', site').eq('id', id).maybeSingle(),
    create: (template, site, title) => sb.from('projects').insert({ template, site, title: (title || 'Untitled').slice(0, 160) }).select(COLS).single(),
    save: (id, patch) => sb.from('projects').update(patch).eq('id', id).select(COLS).single(),
    remove: id => sb.from('projects').delete().eq('id', id),
    rsvps: id => sb.from('rsvps').select('*').eq('project_id', id).order('created_at', { ascending: false })
  };

  /* ---------- uploads: data URL -> public URL in the media bucket ---------- */
  async function upload(dataUrl, kind) {
    const u = await user(); if (!u || !/^data:/.test(dataUrl)) return dataUrl;
    const blob = await (await fetch(dataUrl)).blob();
    const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/wav': 'wav' })[blob.type] || 'bin';
    const path = `${u.id}/${kind || 'media'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from('media').upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  /* ---------- slugs ---------- */
  const slugify = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
  const slugOk = s => /^[a-z0-9][a-z0-9-]{2,60}$/.test(s);
  const pageUrl = slug => `${location.origin}/p/${slug}`;

  /* ---------- small modal used by builder + dashboard ---------- */
  function modal(html, { wide } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'k-modal';
    wrap.innerHTML = `<div class="k-dialog${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}<button type="button" class="k-x" aria-label="Close">✕</button></div>`;
    document.body.appendChild(wrap);
    const prev = document.activeElement;
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('.k-x')) close(); });
    setTimeout(() => { const f = wrap.querySelector('input, button:not(.k-x), a'); if (f) f.focus(); }, 30);
    return { el: wrap, close };
  }

  /* publish dialog: choose slug, publish/unpublish, copy + share link */
  function publishDialog(project, onDone) {
    const suggestion = project.slug || slugify(project.title) || 'my-page';
    const m = modal(`
      <h2>${project.published ? 'Your page is live' : 'Publish your page'}</h2>
      <p class="k-sub">Guests open this link. RSVPs arrive in your dashboard.</p>
      <label class="k-f"><span>Web address</span>
        <span class="k-slug"><span class="k-pre">${esc(location.host)}/p/</span><input type="text" id="k-slug" value="${esc(suggestion)}" maxlength="60" autocomplete="off" spellcheck="false"></span>
      </label>
      <p class="k-msg" id="k-msg" aria-live="polite"></p>
      <div class="k-live" id="k-live" ${project.published ? '' : 'hidden'}>
        <a id="k-link" href="${project.slug ? esc(pageUrl(project.slug)) : '#'}" target="_blank" rel="noopener">${project.slug ? esc(pageUrl(project.slug)) : ''}</a>
        <div class="k-row"><button type="button" class="k-btn ghost" id="k-copy">Copy link</button><a class="k-btn ghost" id="k-wa" target="_blank" rel="noopener" href="#">Share on WhatsApp</a></div>
      </div>
      <div class="k-row end">
        ${project.published ? '<button type="button" class="k-btn ghost danger" id="k-unpub">Unpublish</button>' : ''}
        <button type="button" class="k-btn" id="k-pub">${project.published ? 'Update address' : 'Publish'}</button>
      </div>`);
    const $ = s => m.el.querySelector(s);
    const input = $('#k-slug'), msg = $('#k-msg');
    const setLive = slug => {
      const url = pageUrl(slug);
      $('#k-live').hidden = false; $('#k-link').href = url; $('#k-link').textContent = url;
      $('#k-wa').href = 'https://wa.me/?text=' + encodeURIComponent(`You're invited! ${url}`);
    };
    if (project.published && project.slug) setLive(project.slug);
    input.addEventListener('input', () => { const v = slugify(input.value); if (v !== input.value) input.value = v; msg.textContent = ''; });
    $('#k-copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#k-link').href); msg.textContent = 'Link copied.'; } catch (_) { msg.textContent = 'Select the link and copy it.'; } });
    $('#k-pub').addEventListener('click', async () => {
      const slug = slugify(input.value);
      if (!slugOk(slug)) { msg.textContent = 'Use 3 to 60 lowercase letters, numbers or dashes.'; input.focus(); return; }
      const b = $('#k-pub'); b.disabled = true; msg.textContent = 'Publishing…';
      if (slug !== project.slug) {
        const { data: free } = await sb.rpc('slug_available', { p_slug: slug });
        if (free === false) { msg.textContent = 'That web address is taken. Try another one.'; b.disabled = false; return; }
      }
      const { data, error } = await projects.save(project.id, { slug, published: true });
      b.disabled = false;
      if (error) { msg.innerHTML = esc(nice(error)) + (/plan|Pro/.test(nice(error)) ? ' <a href="pricing.html">See plans</a>' : ''); return; }
      Object.assign(project, data); setLive(slug); msg.textContent = 'Published. Share the link with your guests.';
      b.textContent = 'Update address';
      if (onDone) onDone(data);
    });
    const un = $('#k-unpub');
    if (un) un.addEventListener('click', async () => {
      const { data, error } = await projects.save(project.id, { published: false });
      if (error) { msg.textContent = nice(error); return; }
      Object.assign(project, data); if (onDone) onDone(data); m.close();
    });
    return m;
  }

  /* header account chip: <span data-account></span> */
  async function mountAccount(el) {
    if (!el) return;
    const p = await profile().catch(() => null);
    if (!p) { el.innerHTML = '<a class="k-acc" href="login.html">Sign in</a>'; return; }
    el.innerHTML = `<a class="k-acc" href="dashboard.html" title="${esc(p.email)}">My projects${isPaid(p) ? ` <b class="k-plan">${esc(C.plans[p.plan].name)}</b>` : ''}</a>`;
  }

  window.KCloud = { ready: !!sb, sb, config: C, esc, nice, user, profile, requireAuth, signOut, isPaid, projects, upload, slugify, slugOk, pageUrl, modal, publishDialog, mountAccount };
})();
