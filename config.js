/* Keepsake settings. The key below is the public (publishable) key: it is safe in the browser
   because every table is protected by row-level security in Supabase. */
window.KEEPSAKE_CONFIG = {
  supabaseUrl: 'https://jujztlacxcgpnrolpcen.supabase.co',
  supabaseKey: 'sb_publishable_fqnF-_KNLLUfS-WmcsJtQA_THRscziw',
  brand: 'Keepsake',
  company: 'LamTech Solutions',
  supportEmail: 'sakhile979@gmail.com',
  currency: 'R',
  // Payment: until a gateway (PayFast / Yoco / Paystack) is connected, upgrades are requests you approve in Admin.
  paymentNote: 'We\'ll send you an invoice by email (EFT or card). Your plan switches on as soon as it\'s paid.',
  plans: {
    free: {
      name: 'Free', price: 0, per: '',
      blurb: 'Try every template and share one page.',
      features: ['Every template in the builder', 'Save up to 3 projects', 'Publish 1 page with your own link', 'RSVPs collected in your dashboard', 'Small "Made with Keepsake" note on the page']
    },
    pro: {
      name: 'Pro', price: 149, per: 'per month',
      blurb: 'For your wedding, lobola or big day.',
      features: ['Premium invitations (envelope, curtain, candle, scratch)', 'Unlimited projects', 'Unlimited published pages', 'No Keepsake note on pages or downloads', 'RSVP export to CSV']
    },
    business: {
      name: 'Business', price: 449, per: 'per month',
      blurb: 'For planners, venues and decor studios.',
      features: ['Everything in Pro', 'Build pages for your clients', 'Priority WhatsApp support', 'Your logo in the footer (on request)']
    }
  },
  limits: { free: { projects: 3, published: 1 } }
};
