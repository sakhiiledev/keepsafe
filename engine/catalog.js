/* Style catalog: colour palettes, fonts and pairings the builder offers */
window.KEEPSAKE_CATALOG = (() => {
  // [name, google query, fallback stack, weight used for display, hand size factor]
  const F = (family, q, fallback, w = 400, hs = 1) => ({ family, q: q || 'family=' + family.replace(/ /g, '+'), fallback, w, hs });
  const fonts = {
    display: [
      F('Gloock', null, 'Georgia, serif'),
      F('Instrument Serif', 'family=Instrument+Serif:ital@0;1', 'Georgia, serif'),
      F('Playfair Display', 'family=Playfair+Display:ital,wght@0,400..800;1,400..800', 'Georgia, serif', 500),
      F('DM Serif Display', 'family=DM+Serif+Display:ital@0;1', 'Georgia, serif'),
      F('Cormorant Garamond', 'family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700', 'Georgia, serif', 600),
      F('Fraunces', 'family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800', 'Georgia, serif', 500),
      F('Young Serif', null, 'Georgia, serif'),
      F('Abril Fatface', null, 'Georgia, serif'),
      F('Italiana', null, 'Georgia, serif'),
      F('Bagel Fat One', null, 'system-ui, sans-serif'),
      F('Shrikhand', null, 'Georgia, serif'),
      F('Fredoka', 'family=Fredoka:wght@400..700', 'system-ui, sans-serif', 600),
      F('Bricolage Grotesque', 'family=Bricolage+Grotesque:opsz,wght@12..96,400..800', 'system-ui, sans-serif', 700),
      F('Unbounded', 'family=Unbounded:wght@400..800', 'system-ui, sans-serif', 600),
      F('Syne', 'family=Syne:wght@400..800', 'system-ui, sans-serif', 700),
      F('Righteous', null, 'system-ui, sans-serif')
    ],
    body: [
      F('Newsreader', 'family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500', 'Georgia, serif'),
      F('Lora', 'family=Lora:ital,wght@0,400..600;1,400', 'Georgia, serif'),
      F('Source Serif 4', 'family=Source+Serif+4:ital,opsz,wght@0,8..60,300..600;1,8..60,300..500', 'Georgia, serif'),
      F('Literata', 'family=Literata:ital,opsz,wght@0,7..72,300..600;1,7..72,300..500', 'Georgia, serif'),
      F('EB Garamond', 'family=EB+Garamond:ital,wght@0,400..600;1,400', 'Georgia, serif'),
      F('Crimson Pro', 'family=Crimson+Pro:ital,wght@0,300..600;1,300..500', 'Georgia, serif'),
      F('Figtree', 'family=Figtree:ital,wght@0,300..600;1,300..500', 'system-ui, sans-serif'),
      F('DM Sans', 'family=DM+Sans:ital,opsz,wght@0,9..40,300..600;1,9..40,300..500', 'system-ui, sans-serif'),
      F('Nunito', 'family=Nunito:ital,wght@0,400..700;1,400', 'system-ui, sans-serif'),
      F('Outfit', 'family=Outfit:wght@300..600', 'system-ui, sans-serif'),
      F('Work Sans', 'family=Work+Sans:ital,wght@0,300..600;1,300..500', 'system-ui, sans-serif'),
      F('Manrope', 'family=Manrope:wght@300..700', 'system-ui, sans-serif'),
      F('Karla', 'family=Karla:ital,wght@0,300..600;1,300..500', 'system-ui, sans-serif'),
      F('Jost', 'family=Jost:ital,wght@0,300..600;1,300..500', 'system-ui, sans-serif')
    ],
    hand: [
      F('Nanum Pen Script', null, 'cursive', 400, 1.55),
      F('Caveat', 'family=Caveat:wght@500..700', 'cursive', 400, 1.3),
      F('Gaegu', 'family=Gaegu:wght@700', 'cursive', 400, 1.3),
      F('Kalam', 'family=Kalam:wght@400', 'cursive', 400, 1.1),
      F('Gochi Hand', null, 'cursive', 400, 1.2),
      F('Patrick Hand', null, 'cursive', 400, 1.15),
      F('Shadows Into Light', null, 'cursive', 400, 1.2),
      F('Indie Flower', null, 'cursive', 400, 1.15),
      F('Dancing Script', 'family=Dancing+Script:wght@500..700', 'cursive', 400, 1.25),
      F('Homemade Apple', null, 'cursive', 400, 0.95),
      F('Pinyon Script', null, 'cursive', 400, 1.45),
      F('Great Vibes', null, 'cursive', 400, 1.45)
    ]
  };
  const find = (role, family) => fonts[role].find(f => f.family === family) || fonts[role][0];

  const pairings = [
    { id: 'loveletter', name: 'Love letter', d: 'Gloock', b: 'Newsreader', h: 'Nanum Pen Script' },
    { id: 'champagne', name: 'Champagne', d: 'Instrument Serif', b: 'Figtree', h: 'Caveat' },
    { id: 'party', name: 'Party', d: 'Bagel Fat One', b: 'DM Sans', h: 'Gaegu' },
    { id: 'vows', name: 'Vows', d: 'Italiana', b: 'Lora', h: 'Pinyon Script' },
    { id: 'sweetheart', name: 'Sweetheart', d: 'Shrikhand', b: 'Nunito', h: 'Gochi Hand' },
    { id: 'playful', name: 'Playful', d: 'Fredoka', b: 'Outfit', h: 'Patrick Hand' },
    { id: 'editorial', name: 'Editorial', d: 'Playfair Display', b: 'Source Serif 4', h: 'Dancing Script' },
    { id: 'storybook', name: 'Storybook', d: 'Fraunces', b: 'Literata', h: 'Indie Flower' },
    { id: 'classic', name: 'Classic romance', d: 'Cormorant Garamond', b: 'EB Garamond', h: 'Great Vibes' },
    { id: 'modern', name: 'Modern', d: 'Bricolage Grotesque', b: 'Work Sans', h: 'Kalam' },
    { id: 'bold', name: 'Bold', d: 'Unbounded', b: 'Manrope', h: 'Shadows Into Light' },
    { id: 'retro', name: 'Retro', d: 'Righteous', b: 'Karla', h: 'Homemade Apple' },
    { id: 'gallery', name: 'Gallery', d: 'DM Serif Display', b: 'Jost', h: 'Caveat' },
    { id: 'poster', name: 'Poster', d: 'Abril Fatface', b: 'Crimson Pro', h: 'Dancing Script' }
  ];

  // bg, bg2 (soft), ink (text), accent, accent2, card, story (dark band)
  const palettes = [
    { id: 'rose', name: 'Rose milk', c: { bg: '#FBEFF1', bg2: '#F4C6D0', ink: '#2E1A26', accent: '#C0153F', accent2: '#F08AA2', card: '#FFFBFC', story: '#12161E' } },
    { id: 'champagne', name: 'Champagne night', c: { bg: '#1D1219', bg2: '#3A2431', ink: '#F3E6D8', accent: '#D9A85B', accent2: '#A2445F', card: '#2A1A23', story: '#120B10' } },
    { id: 'butter', name: 'Butter party', c: { bg: '#FFF1CC', bg2: '#FFC7A1', ink: '#2B2118', accent: '#FF5C39', accent2: '#23B5A6', card: '#FFFFFF', story: '#2B2118' } },
    { id: 'sage', name: 'Sage vows', c: { bg: '#E6ECE4', bg2: '#C9D6C5', ink: '#1E2A23', accent: '#A07B42', accent2: '#7C9A86', card: '#F6F8F4', story: '#1E2A23' } },
    { id: 'sweet', name: 'Sweetheart', c: { bg: '#FFE1EA', bg2: '#FFB3C7', ink: '#5A0E2C', accent: '#E8174F', accent2: '#FF8FAB', card: '#FFF6F8', story: '#5A0E2C' } },
    { id: 'periwinkle', name: 'Periwinkle', c: { bg: '#E8EFFF', bg2: '#C5D4FF', ink: '#1A2547', accent: '#5B4BDB', accent2: '#FFC845', card: '#FFFFFF', story: '#1A2547' } },
    { id: 'ocean', name: 'Midnight ocean', c: { bg: '#0F1C2E', bg2: '#1E3350', ink: '#E6EEF7', accent: '#6FC3DF', accent2: '#F2A07B', card: '#17283F', story: '#0A1422' } },
    { id: 'lavender', name: 'Lavender haze', c: { bg: '#F1ECFA', bg2: '#D9CCF2', ink: '#2C2340', accent: '#7B4FE0', accent2: '#F59EB5', card: '#FFFFFF', story: '#221B33' } },
    { id: 'terracotta', name: 'Terracotta sun', c: { bg: '#F7E7DA', bg2: '#EBC3A6', ink: '#3B2418', accent: '#C4532E', accent2: '#6E8B5B', card: '#FFF8F2', story: '#2A1A12' } },
    { id: 'emerald', name: 'Emerald & gold', c: { bg: '#0E2620', bg2: '#1C3D33', ink: '#EFE6D2', accent: '#D4AF5A', accent2: '#7FB89E', card: '#15312A', story: '#0A1C17' } },
    { id: 'peach', name: 'Peach fuzz', c: { bg: '#FFE9DF', bg2: '#FFC9B5', ink: '#4A2A22', accent: '#F0603E', accent2: '#4FA59A', card: '#FFFFFF', story: '#4A2A22' } },
    { id: 'mono', name: 'Black & white', c: { bg: '#FAFAF7', bg2: '#E4E4DE', ink: '#141414', accent: '#141414', accent2: '#8C8C84', card: '#FFFFFF', story: '#141414' } }
  ];

  const themeDefaults = {
    apology: { palette: 'rose', pairing: 'loveletter' },
    anniversary: { palette: 'champagne', pairing: 'champagne' },
    birthday: { palette: 'butter', pairing: 'party' },
    proposal: { palette: 'sage', pairing: 'vows' },
    valentine: { palette: 'sweet', pairing: 'sweetheart' },
    askout: { palette: 'periwinkle', pairing: 'playful' }
  };

  const colorLabels = { bg: 'Background', bg2: 'Soft colour', ink: 'Text', accent: 'Accent', accent2: 'Second accent', card: 'Cards', story: 'Story background' };

  // South African cultures, one per official spoken language.
  // Words are a friendly starting point; families should check spelling and usage.
  const cultures = [
    { id: 'zulu', name: 'Zulu', lang: 'isiZulu', pattern: 'beads', pairing: 'poster',
      c: { bg: '#FBF5EC', bg2: '#F1D9B5', ink: '#1C1714', accent: '#C1121F', accent2: '#1D4E89', card: '#FFFFFF', story: '#1C1714' },
      img: 'assets/culture/zulu-drakensberg.jpg', detail: ['assets/culture/zulu-beadwork.jpg', 'assets/culture/woven-baskets.jpg'],
      w: { greet: 'Sanibonani', invite: 'Siyanimema', thanks: 'Siyabonga', lobola: 'ilobolo', wedding: 'umshado', yes: 'Ngizofika', no: 'Angeke ngikwazi' } },
    { id: 'xhosa', name: 'Xhosa', lang: 'isiXhosa', pattern: 'braid', pairing: 'editorial',
      c: { bg: '#F7F5F1', bg2: '#E9DCCB', ink: '#121212', accent: '#D9601E', accent2: '#121212', card: '#FFFFFF', story: '#121212' },
      img: 'assets/culture/xhosa-coast.jpg', detail: ['assets/culture/xhosa-cattle-coast.jpg', 'assets/culture/beadwork-patterns.jpg'],
      w: { greet: 'Molweni', invite: 'Siyanimema', thanks: 'Enkosi', lobola: 'ikhazi', wedding: 'umtshato', yes: 'Ndiza kuza', no: 'Andizukukwazi' } },
    { id: 'ndebele', name: 'Ndebele', lang: 'isiNdebele', pattern: 'ndebele', pairing: 'bold',
      c: { bg: '#F6F6F1', bg2: '#E4E7F2', ink: '#111111', accent: '#1F5FD1', accent2: '#F2B705', card: '#FFFFFF', story: '#111111' },
      img: 'assets/culture/ndebele-painted-house.jpg', detail: ['assets/culture/beadwork-patterns.jpg'],
      w: { greet: 'Lotjhani', invite: 'Siyanimema', thanks: 'Siyathokoza', lobola: 'lobola', wedding: 'umtjhado', yes: "I'll be there", no: "Can't make it" } },
    { id: 'swati', name: 'Swati', lang: 'siSwati', pattern: 'emahiya', pairing: 'gallery',
      c: { bg: '#FFF6F2', bg2: '#F6D3C8', ink: '#2A0B0B', accent: '#B5121B', accent2: '#1C4A86', card: '#FFFFFF', story: '#2A0B0B' },
      img: 'assets/culture/swati-valley.jpg', detail: ['assets/culture/woven-baskets.jpg'],
      w: { greet: 'Sanibonani', invite: 'Siyanimema', thanks: 'Siyabonga', lobola: 'lobola', wedding: 'umtsimba', yes: "I'll be there", no: "Can't make it" } },
    { id: 'sotho', name: 'Sotho', lang: 'Sesotho', pattern: 'shweshwe', pairing: 'storybook',
      c: { bg: '#EEF1F8', bg2: '#CFD8EE', ink: '#13203D', accent: '#26479A', accent2: '#C9A227', card: '#FFFFFF', story: '#13203D' },
      img: 'assets/culture/sotho-highlands.jpg', detail: ['assets/culture/sotho-mokorotlo.jpg', 'assets/culture/sotho-village.jpg'],
      w: { greet: 'Lumelang', invite: 'Re a le memela', thanks: 'Re a leboha', lobola: 'bohali', wedding: 'lenyalo', yes: 'Ke tla ba teng', no: "Can't make it" } },
    { id: 'tswana', name: 'Tswana', lang: 'Setswana', pattern: 'diamond', pairing: 'modern',
      c: { bg: '#EDF4FB', bg2: '#C9DEF2', ink: '#0D2740', accent: '#1F72B8', accent2: '#0D2740', card: '#FFFFFF', story: '#0D2740' },
      img: 'assets/culture/tswana-savanna.jpg', detail: ['assets/culture/woven-baskets.jpg'],
      w: { greet: 'Dumelang', invite: 'Re a lo laletsa', thanks: 'Re a leboga', lobola: 'bogadi', wedding: 'lenyalo', yes: 'Ke tla nna teng', no: "Can't make it" } },
    { id: 'pedi', name: 'Pedi', lang: 'Sepedi', pattern: 'hempe', pairing: 'party',
      c: { bg: '#FFF1F6', bg2: '#FFD2E4', ink: '#2B0D2E', accent: '#D6006E', accent2: '#F28C28', card: '#FFFFFF', story: '#2B0D2E' },
      img: 'assets/culture/beadwork-patterns.jpg', detail: ['assets/culture/venda-baobab.jpg'],
      w: { greet: 'Thobela', invite: 'Re a le laletša', thanks: 'Ke a leboga', lobola: 'magadi', wedding: 'lenyalo', yes: 'Ke tla ba gona', no: "Can't make it" } },
    { id: 'venda', name: 'Venda', lang: 'Tshivenda', pattern: 'minwenda', pairing: 'retro',
      c: { bg: '#151515', bg2: '#2A2A2A', ink: '#F6F1E7', accent: '#F4C430', accent2: '#E63946', card: '#1F1F1F', story: '#0B0B0B' },
      img: 'assets/culture/venda-baobab.jpg', detail: ['assets/culture/woven-baskets.jpg'],
      w: { greet: 'Ndaa! Aa!', invite: 'Ri a ni ramba', thanks: 'Ndo livhuwa', lobola: 'mamalo', wedding: 'mbingano', yes: "I'll be there", no: "Can't make it" } },
    { id: 'tsonga', name: 'Tsonga', lang: 'Xitsonga', pattern: 'xibelani', pairing: 'playful',
      c: { bg: '#FFF8E8', bg2: '#FFE0A8', ink: '#2B1B0E', accent: '#E06D00', accent2: '#1F9A8A', card: '#FFFFFF', story: '#2B1B0E' },
      img: 'assets/culture/woven-baskets.jpg', detail: ['assets/culture/tswana-savanna.jpg'],
      w: { greet: 'Avuxeni', invite: 'Hi mi rhamba', thanks: 'Inkomu', lobola: 'lovolo', wedding: 'vukati', yes: "I'll be there", no: "Can't make it" } },
    { id: 'afrikaans', name: 'Afrikaans', lang: 'Afrikaans', pattern: 'fynbos', pairing: 'classic',
      c: { bg: '#EEF0EA', bg2: '#D6DCCB', ink: '#22302A', accent: '#8A5A3B', accent2: '#C9708A', card: '#FBFBF8', story: '#22302A' },
      img: 'assets/culture/afrikaans-cape-dutch.jpg', detail: ['assets/culture/afrikaans-vineyard.jpg'],
      w: { greet: 'Welkom', invite: 'Ons nooi julle uit', thanks: 'Baie dankie', lobola: 'lobola', wedding: 'troue', yes: 'Ons sal daar wees', no: 'Ons kan ongelukkig nie' } },
    { id: 'english', name: 'English', lang: 'English', pattern: 'classic', pairing: 'vows',
      c: { bg: '#FAFAF7', bg2: '#E6E9E2', ink: '#1E1E1E', accent: '#9C7C38', accent2: '#8FA596', card: '#FFFFFF', story: '#1E1E1E' },
      img: 'assets/culture/english-protea.jpg', detail: ['assets/culture/afrikaans-vineyard.jpg'],
      w: { greet: 'Welcome', invite: "You're invited", thanks: 'Thank you', lobola: 'lobola', wedding: 'wedding', yes: "I'll be there", no: "Can't make it" } }
  ];

  // Apply a culture to a site: colours, fonts, pattern, words and (default) hero photo
  function applyCulture(site, id, opts = {}) {
    const cu = cultures.find(c => c.id === id);
    if (!cu) return site;
    const prev = cultures.find(c => c.id === site.culture);
    site.culture = cu.id;
    site.words = Object.assign({ culture: cu.name, lang: cu.lang }, cu.w);
    site.pattern = cu.pattern;
    const pair = pairings.find(p => p.id === cu.pairing);
    site.style = Object.assign({}, site.style || {}, {
      colors: Object.assign({}, cu.c), paletteId: 'culture',
      fonts: { display: find('display', pair.d), body: find('body', pair.b), hand: find('hand', pair.h) }, pairingId: pair.id
    });
    site.style.fontQuery = [...new Set(['display', 'body', 'hand'].map(r => site.style.fonts[r].q))].join('&');
    // swap culture photos only where the photo is still a culture default (never the customer's own)
    const defaults = new Set(cultures.flatMap(c => [c.img, ...c.detail]));
    (site.sections || []).forEach(s => {
      if (s.type === 'hero' && (!s.bg || defaults.has(s.bg)) && s.bg !== '') s.bg = cu.img;
      if (s.type === 'venue' && (!s.photo || defaults.has(s.photo))) s.photo = cu.detail[0] || cu.img;
    });
    return site;
  }

  return { fonts, find, pairings, palettes, themeDefaults, colorLabels, cultures, applyCulture };
})();
