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

  return { fonts, find, pairings, palettes, themeDefaults, colorLabels };
})();
