/* Template defaults (demo copy) and the field schema the builder uses */
window.KEEPSAKE_TEMPLATES = {
  anniversary: {
    name: 'Anniversary',
    blurb: 'A starlit page with a live "together for" counter, your story, flip-card reasons and a dinner invite.',
    site: {
      theme: 'anniversary', to: 'Naledi', from: 'Sam',
      sections: [
        { type: 'hero', kicker: 'happy anniversary,', title: '{to}', sub: 'Another year of you and me.\nHere\'s to every ordinary day that turned out to be my favourite.' },
        { type: 'counter', label: 'we\'ve been us for', since: '2023-02-14T19:00', after: 'and I\'d choose every one of those seconds again.' },
        { type: 'story', heading: 'How it happened', chapters: [
          { label: 'The first hello', text: 'I almost didn\'t say anything. I\'m so glad I did.', photo: '' },
          { label: 'The first date', text: 'I talked too much, you laughed anyway, and I walked home grinning like an idiot.', photo: '' },
          { label: 'The moment I knew', text: 'It wasn\'t anything big. You just looked at me across the room, and everything went quiet.', photo: '' },
          { label: 'Now', text: 'Somehow you\'ve become my favourite person, my safe place and my best friend, all at once.', photo: '' }
        ] },
        { type: 'memories', heading: 'Some of my favourite days', items: [
          { photo: '', caption: 'that trip', title: 'The road trip', text: 'Wrong turns, terrible snacks and the best sunset I\'ve ever seen. I\'d get lost with you again any day.' },
          { photo: '', caption: 'lazy sunday', title: 'The quiet days', text: 'Honestly, some of my best memories are the ones where we did nothing at all. Just us, and that was enough.' },
          { photo: '', caption: 'you, glowing', title: 'Watching you win', text: 'Seeing you go after what you want is one of my favourite things in the world. I\'m so proud of you.' }
        ] },
        { type: 'reasons', style: 'cards', heading: 'Reasons I love you', intro: 'Tap a card. There are more where these came from.', items: 'The way you laugh at your own jokes before you finish them\nHow you always know when something\'s wrong\nYour terrible singing in the car\nThe way you make everyone around you feel welcome\nHow hard you work for the things you want\nYour hugs, which fix almost everything\nThat you still hold my hand in public\nHow you believe in me, even when I don\'t' },
        { type: 'gallery', heading: 'Us, mostly', intro: 'Tap any photo.', photos: [] },
        { type: 'letter', heading: 'I wrote you something', body: 'Another year with you, and I still get butterflies when you walk into a room.\nThank you for your patience, your kindness, and for loving me on the days I wasn\'t easy to love.\nI don\'t know what the next year holds, but I know I want to spend it next to you.', sign: 'Forever yours,\n{from}' },
        { type: 'invite', kicker: 'one more thing', date: 'Saturday, 14 February', time: '19:00', place: 'Somewhere special', body: 'I\'ve booked us a table to celebrate. All you have to do is show up looking like you.', dress: 'Dress up a little', note: '', accept: 'I\'ll be there', thanks: 'can\'t wait ♡ here are the details' },
        { type: 'closing', text: 'here\'s to forever, {to} ♡' }
      ]
    }
  },

  birthday: {
    name: 'Birthday',
    blurb: 'Bright and playful, with a cake they blow out candle by candle, highlights of their year and a surprise invite.',
    site: {
      theme: 'birthday', to: 'Lerato', from: 'Kai',
      sections: [
        { type: 'hero', kicker: 'it\'s your day,', title: 'Happy birthday, {to}!', sub: 'Grab some cake.\nThis whole page is about you.' },
        { type: 'cake', heading: 'Make a wish', candles: 25, wish: 'Wish made! I hope every single one comes true, and I\'ll be right here helping.' },
        { type: 'memories', heading: 'Your year in highlights', items: [
          { photo: '', caption: 'the big win', title: 'You did the thing', text: 'You said you would, and you did. Watching you go after it all year has been incredible.' },
          { photo: '', caption: 'chaos, as usual', title: 'The funniest night', text: 'I still can\'t think about it without laughing. Nobody makes ordinary nights feel like adventures the way you do.' },
          { photo: '', caption: 'golden hour', title: 'Just you being you', text: 'Kind, loud, generous and completely yourself. Never change.' }
        ] },
        { type: 'reasons', style: 'cards', heading: 'Things I love about you', intro: 'Tap to flip.', items: 'Your laugh can fix a bad day\nYou remember everyone\'s little details\nYou turn up for the people you love, every time\nYour dance moves (yes, all of them)\nYou\'re braver than you think\nYou make everything more fun' },
        { type: 'gallery', heading: 'Your year in pictures', intro: '', photos: [] },
        { type: 'letter', heading: 'Your birthday card', body: 'Happy birthday to one of my favourite people in the whole world.\nI hope this year is soft where you need it to be and wild where you want it to be.\nThank you for being exactly who you are.', sign: 'Lots of love,\n{from}' },
        { type: 'invite', kicker: 'one more surprise', date: 'Saturday', time: '19:00', place: 'It\'s a surprise', body: 'I\'ve planned a little something to celebrate you. All you have to do is show up.', dress: 'Something fun', note: 'Bring your appetite', accept: 'I\'m in!', thanks: 'yay! here\'s what you need to know' },
        { type: 'closing', text: 'happy birthday, {to} 🎉' }
      ]
    }
  },

  apology: {
    name: 'Apology',
    blurb: 'Soft and honest. Rain-on-glass storytelling, memory lane, a sealed letter, a heart that mends with each promise, and an invite.',
    site: {
      theme: 'apology', to: 'Amara', from: 'Jordan',
      sections: [
        { type: 'hero', kicker: 'this one is for you,', title: '{to}', sub: 'Before you close this, give me a few quiet minutes.\nScroll slowly. I meant every word.' },
        { type: 'story', heading: 'Since you left', chapters: [
          { label: 'Day one', text: 'I watched you walk away and didn\'t know what to do with my hands. I drove home in silence, replaying every word.', photo: '' },
          { label: 'That night', text: 'I kept reaching for my phone to tell you something, then remembering I\'d lost the right to.', photo: '' },
          { label: 'Day two', text: 'The quiet got loud. Every song, every street, every joke I wanted to send you led back to us.', photo: '' },
          { label: 'Today', text: 'I\'m not writing this to make the hurt smaller. I\'m writing it because you deserve to hear me own it.', photo: '' }
        ] },
        { type: 'memories', heading: 'Memory lane', items: [
          { photo: '', caption: 'early days', title: 'Where it started', text: 'I still remember how nervous I was. You made it so easy to be myself, and I never told you how much that meant.' },
          { photo: '', caption: 'always in my corner', title: 'My biggest supporter', text: 'Every time I doubted myself, you were the one who believed first. I want to be that for you too.' }
        ] },
        { type: 'letter', heading: 'I wrote you a letter', body: 'I hurt you, and there\'s no version of this where that\'s okay.\nYou trusted me, and I didn\'t protect that trust the way you always protected mine. I\'m not going to hide behind excuses.\nI\'m sorry for making you feel like you weren\'t my priority, because you always should have been.\nIf you can find it in your heart to give me another chance, I\'ll spend every day showing you, not just telling you.', sign: 'I\'m sorry. I love you.\n{from}' },
        { type: 'reasons', style: 'mend', heading: 'What I\'ll do differently', intro: 'I broke something precious. This is how I\'ll put it back together, one piece at a time.', items: 'I will tell you the truth, even when it\'s hard\nYou will come first, not my plans and not my friends\nWhen you need me, I\'ll be there. Not later. There.\nI\'ll listen to understand you, not to defend myself\nWhen we disagree, I\'ll stay calm and come back to fix it\nI\'ll prove all of this with what I do, not just with words' },
        { type: 'gallery', heading: 'Us, mostly', intro: 'A few of my favourite days.', photos: [] },
        { type: 'invite', kicker: 'an invitation', date: 'Saturday', time: '13:30', place: 'Our favourite spot', body: 'Let me take you out and say all of this face to face. No pressure. Just a table for two and an honest conversation.', dress: 'Whatever makes you feel beautiful', note: '', accept: 'Accept', thanks: 'thank you. here are the details ♡' },
        { type: 'closing', text: 'see you soon, {to}' }
      ]
    }
  },

  proposal: {
    name: 'Proposal',
    blurb: 'Elegant and calm. Your story, why it\'s them, a love letter, then a ring box that opens to the question.',
    site: {
      theme: 'proposal', to: 'Zola', from: 'Liam',
      sections: [
        { type: 'hero', kicker: 'for the love of my life,', title: '{to}', sub: 'I\'ve been trying to find the right words for months.\nI think I finally have them.' },
        { type: 'story', heading: 'Our story', chapters: [
          { label: 'Where we began', text: 'Two strangers, one ordinary day, and a conversation I didn\'t want to end.', photo: '' },
          { label: 'Falling', text: 'It happened slowly, then all at once. Suddenly every plan I made had you in it.', photo: '' },
          { label: 'Home', text: 'Somewhere along the way, home stopped being a place. It became you.', photo: '' },
          { label: 'Today', text: 'And today I want to ask you something I\'ve known the answer to for a long time.', photo: '' }
        ] },
        { type: 'memories', heading: 'Moments I\'ll never forget', items: [
          { photo: '', caption: 'the first trip', title: 'The first time I said it', text: 'My voice shook. You smiled like you already knew. I think you did.' },
          { photo: '', caption: 'us', title: 'Every ordinary morning', text: 'Coffee, your sleepy face, and the feeling that I\'m exactly where I\'m meant to be.' }
        ] },
        { type: 'reasons', style: 'list', heading: 'Why you', intro: '', items: 'Because you make me want to be better\nBecause you laugh with your whole body\nBecause you\'re kind when no one is watching\nBecause you\'re my best friend\nBecause with you, forever doesn\'t sound long enough' },
        { type: 'gallery', heading: 'Us, so far', intro: '', photos: [] },
        { type: 'letter', heading: 'Before I ask', body: 'I don\'t have a perfect speech. I just have the truth.\nYou are the best thing that has ever happened to me. You make the hard days lighter and the good days golden.\nI want to build a life with you, a home with you, a future full of you.', sign: 'With all my heart,\n{from}' },
        { type: 'question', variant: 'ringbox', gate: false, question: 'Will you marry me?', yes: 'Yes!', no: '', after: 'You just made me the happiest person alive. I can\'t wait to spend forever with you.' },
        { type: 'closing', text: 'forever starts now' }
      ]
    }
  },

  valentine: {
    name: 'Valentine',
    blurb: 'Sweet and cheeky. Flip-card reasons, memories, and a "will you be my Valentine?" where the No button runs away.',
    site: {
      theme: 'valentine', to: 'Thandi', from: 'Alex',
      sections: [
        { type: 'hero', kicker: 'hey you,', title: '{to}', sub: 'I made you something.\nKeep scrolling, there\'s a question at the end.' },
        { type: 'reasons', style: 'cards', heading: 'Why it has to be you', intro: 'Tap each one.', items: 'Your smile is genuinely unfair\nYou laugh at my jokes, even the bad ones\nYou give the best hugs on the planet\nYou\'re the first person I want to tell everything\nYou make boring days feel like dates\nYou\'re you, and that\'s my favourite thing' },
        { type: 'memories', heading: 'Us, lately', items: [
          { photo: '', caption: 'cutest day', title: 'That one afternoon', text: 'We had no plan and somehow it turned into one of my favourite days ever.' },
          { photo: '', caption: 'us being silly', title: 'Every silly moment', text: 'With you I get to be completely myself. That\'s rare, and I don\'t take it for granted.' }
        ] },
        { type: 'gallery', heading: 'My favourite pictures', intro: '', photos: [] },
        { type: 'question', variant: 'dodge', gate: true, question: 'Will you be my Valentine?', yes: 'Yes', no: 'No', after: 'I knew you\'d say yes 😌 Scroll down, I\'ve planned something.' },
        { type: 'invite', kicker: 'our valentine\'s date', date: 'Saturday, 14 February', time: '18:30', place: 'Somewhere cute', body: 'Dinner, dessert and you. That\'s the whole plan.', dress: 'Something red ♡', note: '', accept: 'It\'s a date', thanks: 'yay ♡ here are the details' },
        { type: 'closing', text: 'happy valentine\'s, {to} ♡' }
      ]
    }
  },

  askout: {
    name: 'Ask out',
    blurb: 'Fun and low-pressure. A few things you\'ve noticed, a dodgy No button, then they pick the first date.',
    site: {
      theme: 'askout', to: 'Mia', from: 'Leo',
      sections: [
        { type: 'hero', kicker: 'okay, so…', title: 'Hi {to}', sub: 'I\'ve wanted to ask you something for a while.\nI figured I\'d do it properly.' },
        { type: 'reasons', style: 'list', heading: 'Things I\'ve noticed about you', intro: '', items: 'You\'re genuinely funny, not just "nice" funny\nYou\'re kind to everyone, even the waiter\nYour taste in music is suspiciously good\nTalking to you is the best part of my day' },
        { type: 'question', variant: 'dodge', gate: true, question: 'Will you go out with me?', yes: 'Yes', no: 'No', after: 'Wait, really?! Okay okay. Let\'s pick the plan 👇' },
        { type: 'plan', heading: 'Pick our first date', intro: 'Your call. I\'m happy with any of these.', options: 'Coffee & a walk — easy, chilled, lots of talking\nSunset picnic — snacks, a blanket, golden hour\nArcade night — I will beat you, sorry in advance\nDinner somewhere new — you pick the cuisine', button: 'Lock it in', after: 'It\'s a date: {choice}. I\'ll message you the details 😊' },
        { type: 'closing', text: 'can\'t wait, {to}' }
      ]
    }
  }
};

window.KEEPSAKE_SCHEMA = {
  hero:     { label: 'Opening', fields: [['kicker', 'Small line above', 'text'], ['title', 'Big title ({to} = their name)', 'text'], ['sub', 'Intro', 'textarea']] },
  counter:  { label: 'Time-together counter', fields: [['label', 'Line above', 'text'], ['since', 'Together since', 'datetime-local'], ['after', 'Line below', 'textarea']] },
  story:    { label: 'Story (scroll scenes)', fields: [['heading', 'Heading', 'text'], ['chapters', 'Chapters', 'items', [['label', 'Chapter title', 'text'], ['text', 'What happened', 'textarea'], ['photo', 'Photo', 'image']]]] },
  memories: { label: 'Memory lane', fields: [['heading', 'Heading', 'text'], ['items', 'Memories', 'items', [['photo', 'Photo', 'image'], ['caption', 'Photo caption', 'text'], ['title', 'Title', 'text'], ['text', 'The memory', 'textarea']]]] },
  reasons:  { label: 'List', styles: { cards: 'Reasons (flip cards)', mend: 'Promises (heart mends as they read)', list: 'Numbered list' }, fields: [['heading', 'Heading', 'text'], ['intro', 'Intro', 'textarea'], ['items', 'One per line', 'textarea']] },
  letter:   { label: 'Sealed letter', fields: [['heading', 'Line above the envelope', 'text'], ['body', 'The letter (new line = new paragraph)', 'textarea'], ['sign', 'Sign-off', 'textarea']] },
  cake:     { label: 'Birthday cake', fields: [['heading', 'Heading', 'text'], ['candles', 'Number of candles', 'number'], ['wish', 'After the last candle', 'textarea']] },
  question: { label: 'The big question', fields: [['question', 'Question', 'text'], ['yes', 'Yes button', 'text'], ['no', 'No button (runs away)', 'text'], ['after', 'After they say yes', 'textarea']] },
  plan:     { label: 'Pick a plan', fields: [['heading', 'Heading', 'text'], ['intro', 'Intro', 'textarea'], ['options', 'Options, one per line (Title — description)', 'textarea'], ['button', 'Button', 'text'], ['after', 'After choosing ({choice} = their pick)', 'text']] },
  invite:   { label: 'Invite', fields: [['kicker', 'Small line', 'text'], ['date', 'Date', 'text'], ['time', 'Time', 'text'], ['body', 'Invite text', 'textarea'], ['accept', 'Button', 'text'], ['thanks', 'After accepting', 'text'], ['place', 'Where', 'text'], ['dress', 'Dress code', 'text'], ['note', 'Extra note', 'text']] },
  gallery:  { label: 'Photo gallery', fields: [['heading', 'Heading', 'text'], ['intro', 'Intro', 'text'], ['photos', 'Photos', 'images']] },
  closing:  { label: 'Closing line', fields: [['text', 'Text', 'text']] }
};
