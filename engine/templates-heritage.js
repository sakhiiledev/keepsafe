/* Weddings, lobola, invitations and the premium collection */
(() => {
  const T = window.KEEPSAKE_TEMPLATES;
  const S = window.KEEPSAKE_SCHEMA;
  const cattlePhotos = ['assets/cattle/nguni-1.jpg', 'assets/cattle/nguni-2.jpg', 'assets/cattle/nguni-3.jpg', 'assets/cattle/nguni-4.jpg'];

  // Tag the original templates
  ['anniversary', 'birthday', 'apology', 'proposal', 'valentine', 'askout'].forEach(k => { if (T[k]) T[k].category = 'love'; });

  const rsvp = (o = {}) => Object.assign({ type: 'rsvp', heading: 'Will you join us?', kicker: 'RSVP', intro: 'Let us know if you can make it, so we can prepare a seat for you.', deadline: '1 March 2027', event: '{to} & {from}', when: 'Saturday, 24 April 2027', where: 'Our venue', whatsapp: '', maxGuests: 2, meals: '', askSong: 'yes' }, o);

  Object.assign(T, {
    lobola: {
      name: 'Lobola', category: 'wedding', cultures: true,
      blurb: 'Two families, one beginning. A walking Nguni herd, the day\'s programme, dress code and an RSVP, themed to your culture.',
      site: {
        theme: 'lobola', culture: 'zulu', to: 'Ayanda', from: 'Thabo',
        sections: [
          { type: 'hero', kicker: '{greet}', title: '{to} & {from}', sub: 'Two families, one new beginning.\nYou are warmly invited to our {lobola} celebration.' },
          { type: 'countdown', label: 'the families meet in', date: '2027-03-20T08:00', after: 'Today the families meet.' },
          { type: 'couple', heading: 'Two families', kicker: 'with the blessing of our elders', name1: '{to}', family1: 'daughter of the Dlamini family', text1: '', photo1: '', name2: '{from}', family2: 'son of the Mokoena family', text2: '', photo2: '', note: 'Our families are coming together to begin a new bond, and we would love you to be part of the day.' },
          { type: 'cattle', kicker: 'the language of cattle', heading: 'An old way of saying yes', intro: 'For many South African families, {lobola} is how two families begin to know and respect each other. Cattle have long been at its heart, counted in the kraal or honoured in spirit.', count: 11, unit: 'cattle', stamp: 'Agreed', after: 'The negotiations stay between the families. What we celebrate together is the bond.', photos: cattlePhotos },
          { type: 'programme', kicker: 'the order of the day', heading: 'The day', items: '08:00 — The groom\'s delegation arrives at the gate\n09:00 — The families sit down together\n12:30 — The families share a meal\n14:00 — Gifts are presented and the celebration begins\n17:00 — Thanks and farewell' },
          { type: 'dresscode', kicker: 'what to wear', heading: 'Dress code', text: 'Traditional attire is welcome and encouraged.', women: 'Traditional dress in the family colours, or an elegant dress with a headwrap.', men: 'Traditional attire, or smart trousers with a shirt.', colours: '' },
          { type: 'venue', kicker: 'where', heading: 'The bride\'s family home', name: 'The Dlamini family home', time: 'Saturday, 20 March 2027 · 08:00', address: '12 Example Street, Soweto, Johannesburg', notes: 'Street parking is available. The delegation is welcomed at 08:00, so please arrive on time.', photo: '', map: '' },
          rsvp({ heading: 'Will you join us?', intro: 'Let us know so we can prepare enough food for everyone.', event: '{to} & {from} · {lobola}', when: 'Saturday, 20 March 2027, 08:00', where: 'The Dlamini family home', askSong: 'no' }),
          { type: 'gallery', heading: 'Us', intro: 'A few of our favourite moments.', photos: [] },
          { type: 'closing', text: '{thanks} · {to} & {from}' }
        ]
      }
    },

    wedding: {
      name: 'Traditional wedding', category: 'wedding', cultures: true,
      blurb: 'A full traditional wedding page: countdown, couple, programme, attire, venue with maps, FAQ, gifts and a creative RSVP ticket.',
      site: {
        theme: 'wedding', culture: 'xhosa', to: 'Lindiwe', from: 'Sipho',
        sections: [
          { type: 'hero', kicker: '{invite}', title: '{to} & {from}', sub: 'to celebrate our {wedding},\nthe way our families have always done it.' },
          { type: 'countdown', label: 'we say yes in', date: '2027-04-24T10:00', after: 'Today we get married.' },
          { type: 'couple', heading: 'The couple', kicker: 'two hearts, two families', name1: '{to}', family1: 'daughter of the Nkosi family', text1: 'Loves early mornings, good music and her people.', photo1: '', name2: '{from}', family2: 'son of the Zondo family', text2: 'Never misses a game and never forgets a birthday.', photo2: '', note: '' },
          { type: 'memories', heading: 'How it began', items: [
            { photo: '', caption: 'the first day', title: 'We met at a friend\'s braai', text: 'One conversation turned into a whole evening, and the evening turned into everything since.' },
            { photo: '', caption: 'the families', title: 'Our families said yes', text: 'With our elders\' blessing, two families are becoming one.' }
          ] },
          { type: 'programme', kicker: 'the order of the day', heading: 'Programme', items: '10:00 — Arrival and welcome\n11:00 — The traditional ceremony\n13:00 — The bride is welcomed into her new family\n14:00 — Lunch and celebration\n16:00 — Dancing until late' },
          { type: 'dresscode', kicker: 'what to wear', heading: 'Attire', text: 'Come dressed in your traditional best. Our colours are below if you would like to match.', women: 'Traditional attire, or a long dress in our colours.', men: 'Traditional attire, or a suit with a touch of our colours.', colours: '' },
          { type: 'venue', kicker: 'where', heading: 'Venue', name: 'The Nkosi family homestead', time: 'Saturday, 24 April 2027 · 10:00', address: 'Example Road, Mthatha, Eastern Cape', notes: 'There is parking at the homestead. The road is gravel for the last 3 km.', photo: '', map: '' },
          { type: 'info', heading: 'Travel & stay', items: [
            { title: 'Accommodation', text: 'We have reserved rooms at a guesthouse 15 minutes away. Mention our names when you book.' },
            { title: 'Transport', text: 'A shuttle leaves town at 09:00 and returns after the celebration.' }
          ] },
          { type: 'faq', heading: 'Good to know', items: 'Can I bring my children? | Yes, families are welcome.\nIs there parking? | Yes, at the homestead.\nWhat time should I arrive? | Please arrive by 10:00 for the welcome.' },
          { type: 'gifts', heading: 'Gifts', text: 'Your presence is our gift. If you would like to bless us further, a contribution towards our new home would mean a lot.', details: 'Bank: Example Bank\nAccount name: {to} & {from}\nReference: Your name', link: '', linkLabel: '' },
          rsvp({ meals: 'Beef\nChicken\nVegetarian', event: '{to} & {from} · {wedding}', when: 'Saturday, 24 April 2027, 10:00', where: 'The Nkosi family homestead' }),
          { type: 'gallery', heading: 'Our moments', intro: '', photos: [] },
          { type: 'closing', text: '{thanks} · see you there' }
        ]
      }
    },

    whitewedding: {
      name: 'White wedding', category: 'wedding', cultures: true,
      blurb: 'Elegant and classic, with falling petals, ceremony and reception details, travel, gifts, FAQ and RSVP.',
      site: {
        theme: 'whitewedding', culture: 'english', to: 'Emma', from: 'Daniel',
        sections: [
          { type: 'hero', kicker: '{invite}', title: '{to} & {from}', sub: 'request the pleasure of your company\nas we begin our forever.' },
          { type: 'countdown', label: 'the big day is in', date: '2027-02-13T15:00', after: 'Today is the day.' },
          { type: 'couple', heading: 'The couple', kicker: '', name1: '{to}', family1: '', text1: '', photo1: '', name2: '{from}', family2: '', text2: '', photo2: '', note: '' },
          { type: 'story', heading: 'Our story', chapters: [
            { label: 'Where it started', text: 'A rainy afternoon, one umbrella, and a walk that lasted three hours.', photo: '' },
            { label: 'The question', text: 'On a mountain at sunrise, with shaking hands and a very happy yes.', photo: '' }
          ] },
          { type: 'programme', kicker: 'the day', heading: 'Order of the day', items: '15:00 — Ceremony\n16:00 — Canapés and photos\n18:00 — Reception and dinner\n20:00 — First dance\n23:30 — Carriages' },
          { type: 'venue', kicker: 'ceremony & reception', heading: 'Venue', name: 'Example Wine Estate', time: 'Saturday, 13 February 2027 · 15:00', address: 'Example Road, Franschhoek, Western Cape', notes: 'Free parking at the estate. The ceremony is outdoors, so ladies may prefer block heels.', photo: '', map: '' },
          { type: 'dresscode', kicker: 'what to wear', heading: 'Dress code', text: 'Black tie optional.', women: 'Floor-length or cocktail dresses. Please avoid white.', men: 'Suit and tie, or a tuxedo.', colours: '' },
          { type: 'info', heading: 'Travel & stay', items: [
            { title: 'Where to stay', text: 'Rooms are available on the estate and in town, ten minutes away.' },
            { title: 'Getting there', text: 'The estate is about an hour from Cape Town International Airport.' }
          ] },
          { type: 'gifts', heading: 'Gifts', text: 'Having you there is enough. If you would like to give a gift, we are saving for our honeymoon.', details: 'Bank: Example Bank\nReference: Your name', link: '', linkLabel: '' },
          { type: 'faq', heading: 'Questions', items: 'Are children welcome? | We love your little ones, but this will be an adults-only celebration.\nCan I bring a plus one? | Your invitation shows how many seats we have saved for you.' },
          rsvp({ meals: 'Beef fillet\nLine fish\nVegetarian', event: '{to} & {from}', when: 'Saturday, 13 February 2027, 15:00', where: 'Example Wine Estate', maxGuests: 2 }),
          { type: 'gallery', heading: 'Us', intro: '', photos: [] },
          { type: 'closing', text: 'with love, {to} & {from}' }
        ]
      }
    },

    invitation: {
      name: 'Wedding invitation', category: 'wedding', cultures: true,
      blurb: 'A short, beautiful invitation: names, countdown, venue, programme, attire and an RSVP that turns into a ticket.',
      site: {
        theme: 'invitation', culture: 'sotho', to: 'Palesa', from: 'Tumelo',
        sections: [
          { type: 'hero', kicker: '{invite}', title: '{to} & {from}', sub: 'Saturday, 15 May 2027\nto our {wedding}' },
          { type: 'countdown', label: 'counting down', date: '2027-05-15T11:00', after: 'Today is the day.' },
          { type: 'venue', kicker: 'where', heading: 'Join us at', name: 'Example Lodge', time: 'Saturday, 15 May 2027 · 11:00', address: 'Example Road, Clarens, Free State', notes: '', photo: '', map: '' },
          { type: 'programme', heading: 'The day', kicker: '', items: '11:00 — Ceremony\n13:00 — Lunch\n15:00 — Celebration' },
          { type: 'dresscode', heading: 'Dress code', kicker: '', text: 'Traditional or formal.', women: '', men: '', colours: '' },
          rsvp({ event: '{to} & {from}', when: 'Saturday, 15 May 2027, 11:00', where: 'Example Lodge', meals: 'Beef\nChicken\nVegetarian' }),
          { type: 'closing', text: '{thanks}' }
        ]
      }
    },

    savedate: {
      name: 'Save the date', category: 'wedding', cultures: true,
      blurb: 'One screen to say "keep the day free", with a live countdown and an add-to-calendar button.',
      site: {
        theme: 'savedate', culture: 'tswana', to: 'Naledi', from: 'Kagiso',
        sections: [
          { type: 'hero', kicker: 'save the date', title: '{to} & {from}', sub: 'are getting married\n18 September 2027 · Mahikeng' },
          { type: 'countdown', label: 'keep the day free', date: '2027-09-18T10:00', after: 'Today is the day!' },
          { type: 'venue', heading: 'Where', kicker: '', name: 'Mahikeng, North West', time: 'Saturday, 18 September 2027', address: 'Mahikeng, North West', notes: 'The formal invitation and venue details will follow.', photo: '', map: '' },
          { type: 'closing', text: 'formal invitation to follow' }
        ]
      }
    },

    /* ---------------- premium collection ---------------- */
    'premium-ivory': {
      name: 'Ivory Seal', category: 'premium', cultures: true, premium: true,
      blurb: 'Guests open a wax-sealed envelope with your monogram, and the letter rises out to reveal the full invitation.',
      site: {
        theme: 'invitation', culture: 'english', to: 'Amelia', from: 'James',
        sections: [
          { type: 'cover', variant: 'envelope', line: '{invite}', names: '{to} & {from}', date: '12 June 2027', monogram: '' },
          { type: 'hero', kicker: '{invite}', title: '{to} & {from}', sub: 'Saturday, 12 June 2027\nThe Example Estate, Stellenbosch' },
          { type: 'countdown', label: 'until we say I do', date: '2027-06-12T15:30', after: 'Today we say I do.' },
          { type: 'couple', heading: 'The couple', kicker: '', name1: '{to}', family1: '', text1: '', photo1: '', name2: '{from}', family2: '', text2: '', photo2: '', note: '' },
          { type: 'programme', heading: 'The day', kicker: '', items: '15:30 — Ceremony in the garden\n16:30 — Drinks on the lawn\n18:30 — Dinner\n21:00 — Dancing' },
          { type: 'venue', heading: 'Venue', kicker: '', name: 'The Example Estate', time: 'Saturday, 12 June 2027 · 15:30', address: 'Example Road, Stellenbosch', notes: '', photo: 'assets/culture/afrikaans-vineyard.jpg', map: '' },
          { type: 'dresscode', heading: 'Dress code', kicker: '', text: 'Black tie.', women: 'Evening gowns.', men: 'Tuxedo or dark suit.', colours: '' },
          { type: 'faq', heading: 'Good to know', items: 'Is there parking? | Yes, valet parking at the estate.\nWhat if it rains? | The ceremony moves to the glass pavilion.' },
          { type: 'gifts', heading: 'Gifts', text: 'Your presence is the gift. For those who have asked, a honeymoon fund is below.', details: 'Bank: Example Bank\nReference: Your name', link: '', linkLabel: '' },
          rsvp({ event: '{to} & {from}', when: 'Saturday, 12 June 2027, 15:30', where: 'The Example Estate', meals: 'Beef\nFish\nVegetarian' }),
          { type: 'closing', text: 'with love, {to} & {from}' }
        ]
      }
    },

    'premium-candle': {
      name: 'Candlelight', category: 'premium', cultures: true, premium: true,
      blurb: 'The page opens in darkness. Guests tap a candle to light it, and your names glow out of the dark.',
      site: {
        theme: 'whitewedding', to: 'Zinhle', from: 'Mpho',
        style: { colors: { bg: '#14100C', bg2: '#2A2117', ink: '#F3E6CC', accent: '#E3B868', accent2: '#B4553A', card: '#1E1812', story: '#0B0907' }, paletteId: 'custom' },
        sections: [
          { type: 'cover', variant: 'candle', line: '{invite}', names: '{to} & {from}', date: '30 October 2027', monogram: '' },
          { type: 'hero', kicker: 'an evening wedding', title: '{to} & {from}', sub: 'Saturday, 30 October 2027\nby candlelight' },
          { type: 'countdown', label: 'the evening begins in', date: '2027-10-30T18:00', after: 'Tonight is the night.' },
          { type: 'story', heading: 'Our story', chapters: [
            { label: 'The first spark', text: 'A power cut, a candle, and a conversation we never wanted to end.', photo: '' },
            { label: 'Forever', text: 'Some lights you just know you want to keep burning.', photo: '' }
          ] },
          { type: 'programme', heading: 'The evening', kicker: '', items: '18:00 — Ceremony by candlelight\n19:00 — Dinner\n21:00 — Dancing under the stars' },
          { type: 'venue', heading: 'Venue', kicker: '', name: 'Example Barn', time: 'Saturday, 30 October 2027 · 18:00', address: 'Example Farm Road, Magaliesberg', notes: 'It gets cool in the evening. Bring a wrap.', photo: '', map: '' },
          { type: 'dresscode', heading: 'Dress code', kicker: '', text: 'Evening formal in deep, warm tones.', women: '', men: '', colours: '#E3B868\n#B4553A\n#2A2117' },
          rsvp({ event: '{to} & {from}', when: 'Saturday, 30 October 2027, 18:00', where: 'Example Barn', meals: 'Lamb\nChicken\nVegetarian' }),
          { type: 'closing', text: 'see you by candlelight' }
        ]
      }
    },

    'premium-heritage': {
      name: 'Heritage Beadwork', category: 'premium', cultures: true, premium: true,
      blurb: 'An envelope trimmed in your culture\'s pattern opens into a traditional wedding invitation. Switch cultures and the whole look changes.',
      site: {
        theme: 'wedding', culture: 'ndebele', to: 'Nomsa', from: 'Bheki',
        sections: [
          { type: 'cover', variant: 'envelope', line: '{invite}', names: '{to} & {from}', date: '7 August 2027', monogram: '' },
          { type: 'hero', kicker: '{greet}', title: '{to} & {from}', sub: 'invite you to celebrate our {wedding}\nSaturday, 7 August 2027' },
          { type: 'countdown', label: 'the celebration begins in', date: '2027-08-07T10:00', after: 'Today we celebrate.' },
          { type: 'couple', heading: 'Two families', kicker: '', name1: '{to}', family1: 'of the Mahlangu family', text1: '', photo1: '', name2: '{from}', family2: 'of the Skosana family', text2: '', photo2: '', note: '' },
          { type: 'programme', heading: 'Programme', kicker: '', items: '10:00 — Welcome of guests\n11:00 — Traditional ceremony\n13:00 — Lunch\n15:00 — Celebration and dancing' },
          { type: 'dresscode', heading: 'Attire', kicker: '', text: 'Traditional attire is encouraged. Our colours are below.', women: '', men: '', colours: '' },
          { type: 'venue', heading: 'Venue', kicker: '', name: 'The Mahlangu homestead', time: 'Saturday, 7 August 2027 · 10:00', address: 'Example Road, KwaMhlanga, Mpumalanga', notes: '', photo: '', map: '' },
          rsvp({ event: '{to} & {from} · {wedding}', when: 'Saturday, 7 August 2027, 10:00', where: 'The Mahlangu homestead', meals: 'Beef\nChicken\nVegetarian' }),
          { type: 'gallery', heading: 'Our moments', intro: '', photos: [] },
          { type: 'closing', text: '{thanks}' }
        ]
      }
    },

    'premium-kraal': {
      name: 'Royal Kraal', category: 'premium', cultures: true, premium: true,
      blurb: 'Curtains part on a lobola invitation, then a walking Nguni herd counts up to the cattle offered. Dark and golden.',
      site: {
        theme: 'lobola', culture: 'venda', to: 'Mulalo', from: 'Rudzani',
        sections: [
          { type: 'cover', variant: 'curtain', line: '{greet}', names: '{to} & {from}', date: 'Saturday, 10 April 2027', monogram: '' },
          { type: 'hero', kicker: '{invite}', title: '{to} & {from}', sub: 'Our families invite you to our {lobola} celebration.' },
          { type: 'countdown', label: 'the families meet in', date: '2027-04-10T08:00', after: 'Today the families meet.' },
          { type: 'cattle', kicker: 'the kraal', heading: 'The herd', intro: 'Cattle have always carried the respect between families. Today we honour that tradition together.', count: 9, unit: 'cattle', stamp: 'Agreed', after: '', photos: cattlePhotos },
          { type: 'programme', heading: 'The day', kicker: '', items: '08:00 — The delegation arrives\n09:00 — The families meet\n13:00 — Shared meal\n15:00 — Celebration' },
          { type: 'dresscode', heading: 'Attire', kicker: '', text: 'Traditional attire is warmly welcome.', women: '', men: '', colours: '' },
          { type: 'venue', heading: 'Venue', kicker: '', name: 'The family home', time: 'Saturday, 10 April 2027 · 08:00', address: 'Example Village, Thohoyandou, Limpopo', notes: '', photo: '', map: '' },
          rsvp({ event: '{to} & {from} · {lobola}', when: 'Saturday, 10 April 2027, 08:00', where: 'The family home', askSong: 'no' }),
          { type: 'closing', text: '{thanks}' }
        ]
      }
    },

    'premium-scratch': {
      name: 'Golden Scratch', category: 'premium', cultures: true, premium: true,
      blurb: 'A save the date with a gold scratch card. Guests scratch with a finger to reveal the date, then add it to their calendar.',
      site: {
        theme: 'savedate', culture: 'tsonga', to: 'Hlulani', from: 'Tsakani',
        sections: [
          { type: 'hero', kicker: 'we have news', title: '{to} & {from}', sub: 'are getting married.\nScratch below to find out when.' },
          { type: 'scratch', heading: 'Save the date', kicker: '', above: 'save the date', reveal: '21 August 2027', below: 'Giyani, Limpopo', hint: 'scratch the gold with your finger' },
          { type: 'countdown', label: 'counting down', date: '2027-08-21T10:00', after: 'Today is the day!' },
          { type: 'closing', text: 'formal invitation to follow' }
        ]
      }
    },

    'premium-garden': {
      name: 'Garden Curtain', category: 'premium', cultures: true, premium: true,
      blurb: 'Curtains open onto a vineyard garden wedding, with your story, programme, travel tips and RSVP.',
      site: {
        theme: 'whitewedding', culture: 'afrikaans', to: 'Annelie', from: 'Ruan',
        sections: [
          { type: 'cover', variant: 'curtain', line: '{invite}', names: '{to} & {from}', date: '9 October 2027', monogram: '' },
          { type: 'hero', kicker: '{invite}', title: '{to} & {from}', sub: 'Saturday, 9 October 2027\nin the vineyards' },
          { type: 'countdown', label: 'the garden blooms in', date: '2027-10-09T15:00', after: 'Today is the day.' },
          { type: 'memories', heading: 'Our story', items: [
            { photo: '', caption: 'first date', title: 'Coffee that became dinner', text: 'We planned an hour and stayed until they closed.' },
            { photo: '', caption: 'the question', title: 'Under the oak tree', text: 'The easiest yes in the world.' }
          ] },
          { type: 'programme', heading: 'Program', kicker: '', items: '15:00 — Ceremony in the garden\n16:00 — Drinks among the vines\n18:00 — Dinner\n20:30 — Dancing' },
          { type: 'venue', heading: 'Venue', kicker: '', name: 'Example Wine Farm', time: 'Saturday, 9 October 2027 · 15:00', address: 'Example Road, Paarl, Western Cape', notes: '', photo: 'assets/culture/afrikaans-cape-dutch.jpg', map: '' },
          { type: 'info', heading: 'Travel & stay', items: [
            { title: 'Accommodation', text: 'Guesthouses in Paarl are ten minutes from the farm.' },
            { title: 'Shuttle', text: 'A shuttle runs back to Paarl after the reception.' }
          ] },
          rsvp({ event: '{to} & {from}', when: 'Saturday, 9 October 2027, 15:00', where: 'Example Wine Farm', meals: 'Lamb\nFish\nVegetarian' }),
          { type: 'closing', text: '{thanks}' }
        ]
      }
    }
  });

  Object.assign(S, {
    hero: { label: 'Opening', fields: [['kicker', 'Small line above', 'text'], ['title', 'Big title ({to} = their name)', 'text'], ['sub', 'Intro', 'textarea'], ['bg', 'Background photo (optional)', 'image']] },
    cover: { label: 'Opening cover (premium)', fields: [['variant', 'Style', 'select', null, [['envelope', 'Wax-sealed envelope'], ['curtain', 'Curtains'], ['candle', 'Tap to light a candle']]], ['line', 'Small line', 'text'], ['names', 'Names', 'text'], ['date', 'Date line', 'text'], ['monogram', 'Monogram (blank = initials)', 'text']] },
    countdown: { label: 'Countdown', fields: [['label', 'Line above', 'text'], ['date', 'Date and time', 'datetime-local'], ['after', 'Shown on the day', 'text']] },
    couple: { label: 'The couple', fields: [['heading', 'Heading', 'text'], ['kicker', 'Small line', 'text'], ['name1', 'First name', 'text'], ['family1', 'Family line', 'text'], ['text1', 'A line about them', 'text'], ['photo1', 'Photo', 'image'], ['name2', 'Second name', 'text'], ['family2', 'Family line', 'text'], ['text2', 'A line about them', 'text'], ['photo2', 'Photo', 'image'], ['note', 'Note below', 'textarea']] },
    cattle: { label: 'Cattle herd (lobola)', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['intro', 'Intro', 'textarea'], ['count', 'Number of cattle', 'number'], ['unit', 'Word after the number', 'text'], ['stamp', 'Stamp (e.g. Agreed)', 'text'], ['after', 'Line below', 'textarea'], ['photos', 'Cattle photos', 'images']] },
    programme: { label: 'Programme', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['items', 'Time — what happens (one per line)', 'textarea']] },
    dresscode: { label: 'Dress code', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['text', 'Intro', 'textarea'], ['women', 'For her', 'textarea'], ['men', 'For him', 'textarea'], ['colours', 'Colours, one hex per line (blank = theme colours)', 'textarea']] },
    venue: { label: 'Venue & map', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['name', 'Venue name', 'text'], ['time', 'Date and time line', 'text'], ['address', 'Address', 'text'], ['notes', 'Notes (parking, directions)', 'textarea'], ['photo', 'Photo', 'image'], ['map', 'Map link (blank = Google Maps search)', 'text']] },
    rsvp: { label: 'RSVP', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['intro', 'Intro', 'textarea'], ['deadline', 'Reply by', 'text'], ['event', 'Event name on the ticket', 'text'], ['when', 'When (on the ticket)', 'text'], ['where', 'Where (on the ticket)', 'text'], ['whatsapp', 'WhatsApp number for replies (e.g. 27821234567)', 'text'], ['maxGuests', 'Most guests per reply', 'number'], ['meals', 'Meal options, one per line (blank = none)', 'textarea'], ['askSong', 'Ask for a song request', 'select', null, [['yes', 'Yes'], ['no', 'No']]], ['_links', 'Personal guest links', 'guestlinks']] },
    faq: { label: 'FAQ', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['items', 'Question | Answer (one per line)', 'textarea']] },
    gifts: { label: 'Gifts', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['text', 'Message', 'textarea'], ['details', 'Details, Label: value per line (copy buttons)', 'textarea'], ['link', 'Registry link', 'text'], ['linkLabel', 'Registry button text', 'text']] },
    info: { label: 'Info cards (travel, stay)', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['items', 'Cards', 'items', [['title', 'Title', 'text'], ['text', 'Text', 'textarea']]]] },
    scratch: { label: 'Scratch to reveal (premium)', fields: [['kicker', 'Small line', 'text'], ['heading', 'Heading', 'text'], ['above', 'Line above the reveal', 'text'], ['reveal', 'Hidden text (e.g. the date)', 'text'], ['below', 'Line below', 'text'], ['hint', 'Hint', 'text']] }
  });
})();
