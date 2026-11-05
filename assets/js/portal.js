/* Braids By Mimi — Owner Portal (DEMO).
   Everything runs on sample data held in memory through one data layer (DB below), so it feels live for the visit
   and resets on reload. Nothing is sent anywhere. Swap seam: replace DB.* with Supabase calls (// TODO: Supabase)
   and the deposit buttons with Stripe / Square links (// TODO: payments) — the UI does not change. */
(function () {
  'use strict';
  var doc = document, win = window;
  var MENU = win.MIMI_MENU || { cats: [], gallery: [] };
  var reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtTime(m) { var h = Math.floor(m / 60), mi = m % 60, ap = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12; return hh + (mi ? ':' + pad(mi) : '') + ' ' + ap; }
  function fmtDay(d, long) { return d.toLocaleDateString('en-US', long ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' }); }
  function rel(d) { var n = Math.round((d - TODAY) / 864e5); if (n === 0) return 'Today'; if (n === 1) return 'Tomorrow'; if (n === -1) return 'Yesterday'; return fmtDay(d); }
  function sms(phone, body) { return 'sms:' + phone.replace(/[^\d+]/g, '') + '?&body=' + encodeURIComponent(body); }
  function initials(n) { return n.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase(); }
  var ICON = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    cal: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    msg: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>', left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
    out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>'
  };
  function ic(n) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICON[n] + '</svg>'; }

  /* ---------------- data layer (demo) ---------------- */
  var SVC = {}; MENU.cats.forEach(function (c) { c.items.forEach(function (it) { SVC[c.id + ':' + it.id] = { cat: c.id, catLabel: c.short, id: it.id, label: it.label, price: it.price, from: it.from }; }); });
  // Estimated chair time per category (minutes). Mimi sets real times in Settings. Demo values.
  var DUR = { knotless: 300, boho: 300, cornrows: 120, twists: 300, locs: 240, 'sew-in': 180, kids: 120 };
  function svc(k) { return SVC[k] || { cat: 'knotless', catLabel: 'Knotless', label: k, price: 0 }; }
  function priceOf(k) { var s = svc(k); if (s.id === 'stitch') return 8 * s.price; if (s.id === 'zigzag') return 6 * s.price; return s.price || ({ senegalese: 180, spring: 170, coco: 160, crochet: 150 })[s.id] || 150; }

  var CLIENT_SEED = [
    ['Keisha M.', '(301) 555-0142', ['VIP'], 'Color 1B with 30 at the ends. Tender at the nape, go easy on the edges.'],
    ['Aaliyah T.', '(240) 555-0187', ['Regular'], 'Likes medium knotless, waist length. Brings her own inspo.'],
    ['Fatou D.', '(301) 555-0119', ['VIP'], 'Prefers French. Fulani with beads, gold cuffs.'],
    ['Brianna W.', '(202) 555-0163', ['Regular'], 'Boho bob every 6 weeks. Curls must stay defined, uses mousse.'],
    ['Nadia K.', '(301) 555-0128', ['New'], 'Found you on Instagram. First time doing boho.'],
    ['Destiny R.', '(240) 555-0151', ['Regular'], 'Stitch cornrows, 8 to the back. Very punctual.'],
    ['Marie-Claire B.', '(301) 555-0177', ['VIP'], 'Island twist, waist. Allergic to some synthetic hair: use pre-stretched, pre-washed.'],
    ['Jasmine L.', '(202) 555-0134', ['Regular'], 'Soft locs, brings her own hair (2 packs).'],
    ['Imani S.', '(240) 555-0109', ['New'], 'Walk-in from Landover Rd. Wants lemonade braids.'],
    ['Tasha G.', '(301) 555-0195', ['Regular'], 'Daughter (8) gets kids styles same day.'],
    ['Ama O.', '(240) 555-0116', ['VIP'], 'Small medium knotless, waist. Books every 7 weeks.'],
    ['Courtney P.', '(202) 555-0148', ['Regular'], 'Sew-in, leave out middle part.'],
    ['Zainab A.', '(301) 555-0182', ['New'], 'Senegalese twists, midback.'],
    ['Kiara H.', '(240) 555-0124', ['Regular'], 'Zigzag cornrows, 6 braids. Pays deposit right away.']
  ];
  var FAV = ['knotless:medium-waist', 'knotless:smallmed-waist', 'cornrows:fulani', 'boho:bob-boho', 'boho:knotless-boho-midback', 'cornrows:stitch', 'twists:island-waist', 'locs:soft-locs', 'cornrows:lemonade', 'kids:kids', 'knotless:smallmed-midback', 'sew-in:sew-in', 'twists:senegalese', 'cornrows:zigzag'];
  var DB = { clients: [], appts: [], requests: [], settings: { deposit: 25, walkins: true, buffer: 15, reminders: true, autoThanks: true, hours: [[1, 'Monday', '07:00', '19:00', true], [2, 'Tuesday', '07:00', '19:00', true], [3, 'Wednesday', '07:00', '19:00', true], [4, 'Thursday', '07:00', '19:00', true], [5, 'Friday', '07:00', '19:00', true], [6, 'Saturday', '07:00', '19:00', true], [0, 'Sunday', '07:00', '18:00', true]] }, seq: 1 };
  function id() { return 'x' + (DB.seq++); }

  // deterministic pseudo-random so the demo looks the same every load
  var seed = 13; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  CLIENT_SEED.forEach(function (c, i) {
    var cl = { id: id(), name: c[0], phone: c[1], tags: c[2], notes: c[3], fav: FAV[i], visits: [], photos: [] };
    var n = c[2][0] === 'New' ? 0 : 2 + Math.floor(rnd() * 5);
    for (var v = n; v >= 1; v--) {
      var d = addDays(TODAY, -(v * 42 + Math.floor(rnd() * 20) + 9));
      cl.visits.push({ date: d, svc: cl.fav, price: priceOf(cl.fav) });
    }
    var g = MENU.gallery.filter(function (x) { return x.cat === svc(cl.fav).cat || (svc(cl.fav).cat === 'locs' && x.cat === 'twists'); });
    if (!g.length) g = MENU.gallery;
    cl.photos = cl.visits.slice(-4).map(function (v, k) { return { src: g[(i + k) % g.length].src, alt: g[(i + k) % g.length].alt, date: v.date }; });
    DB.clients.push(cl);
  });
  function client(cid) { return DB.clients.filter(function (c) { return c.id === cid; })[0]; }

  function addAppt(o) {
    var a = { id: id(), client: o.client, svc: o.svc, date: o.date, start: o.start, dur: o.dur || DUR[svc(o.svc).cat] || 180, price: o.price || priceOf(o.svc), deposit: o.deposit || 0, status: o.status || 'confirmed', note: o.note || '', source: o.source || 'Text' };
    DB.appts.push(a); return a;
  }
  // Schedule: past 8 weeks (for money charts), today, next 6 days
  (function seedAppts() {
    var C = DB.clients;
    for (var w = 56; w >= 1; w--) {
      var d = addDays(TODAY, -w); var count = d.getDay() === 0 ? 1 : 2; var POOL = [0, 1, 2, 5, 6, 7, 8];
      for (var k = 0; k < count; k++) {
        var cl = C[POOL[Math.floor(rnd() * POOL.length)]];
        var st = rnd() < 0.05 ? 'noshow' : 'done';
        addAppt({ client: cl.id, svc: cl.fav, date: d, start: (k === 0 ? 8 * 60 : 13 * 60 + 30), status: st, deposit: 25, source: rnd() < .5 ? 'Website' : 'Text' });
      }
    }
    var t = [
      [0, 'knotless:medium-waist', 7 * 60, 'done', 'Arrived early. 1B/30.'],
      [6, 'cornrows:stitch', 12 * 60 + 15, 'confirmed', '8 stitch braids to the back ($15 each).'],
      [9, 'kids:kids', 14 * 60 + 30, 'pending', 'Daughter, 8. Two-strand with beads.'],
      [13, 'cornrows:zigzag', 16 * 60 + 45, 'confirmed', '6 zigzag cornrows ($20 each).']
    ];
    t.forEach(function (x) { addAppt({ client: C[x[0]].id, svc: x[1], date: TODAY, start: x[2], status: x[3], deposit: x[3] === 'pending' ? 0 : 25, note: x[4] }); });
    var plan = [[1, 10, 'knotless:smallmed-waist', 8 * 60], [1, 2, 'cornrows:fulani', 14 * 60], [2, 5, 'cornrows:stitch', 9 * 60], [2, 6, 'twists:island-waist', 12 * 60], [3, 7, 'locs:soft-locs', 8 * 60 + 30], [3, 7, 'sew-in:sew-in', 14 * 60], [4, 1, 'knotless:medium-midback', 7 * 60 + 30], [4, 12, 'twists:senegalese', 13 * 60], [5, 4, 'boho:knotless-boho-midback', 8 * 60], [5, 5, 'cornrows:fulani', 13 * 60 + 30], [5, 8, 'cornrows:lemonade', 16 * 60 + 30], [6, 0, 'boho:french-curl-bob', 9 * 60]];
    plan.forEach(function (p, i) { addAppt({ client: C[p[1]].id, svc: p[2], date: addDays(TODAY, p[0]), start: p[3], status: i % 4 === 3 ? 'pending' : 'confirmed', deposit: i % 4 === 3 ? 0 : 25, source: i % 2 ? 'Website' : 'Text' }); });
  })();
  // Website booking requests (same fields as the site's booking builder)
  DB.requests = [
    { id: id(), name: 'Tasha', phone: '(301) 555-0195', svc: 'boho:french-curl-bob', price: '$260', day: addDays(TODAY, 3), time: 'Afternoon (1 to 4 PM)', notes: 'Color 1B, want it for my birthday weekend', at: new Date(Date.now() - 38 * 60000), status: 'new' },
    { id: id(), name: 'Rochelle', phone: '(240) 555-0171', svc: 'knotless:medium-topbutt', price: '$200', day: addDays(TODAY, 2), time: 'Morning (7 to 10 AM)', notes: 'Top of the butt, color 27/613 mix. Can you do 7 AM?', at: new Date(Date.now() - 3 * 3600000), status: 'new' },
    { id: id(), name: 'Grace', phone: '(301) 555-0138', svc: 'cornrows:fulani', price: 'From $180', day: addDays(TODAY, 5), time: 'Flexible', notes: 'With beads and gold cuffs. Je parle français aussi.', at: new Date(Date.now() - 20 * 3600000), status: 'new' },
    { id: id(), name: 'Monique', phone: '(202) 555-0156', svc: 'twists:senegalese', price: 'Text for price', day: addDays(TODAY, 6), time: 'Late morning (10 AM to 1 PM)', notes: 'Midback Senegalese twists, how much?', at: new Date(Date.now() - 26 * 3600000), status: 'new' }
  ];
  DB.menu = JSON.parse(JSON.stringify(MENU.cats)).map(function (c) { c.items.forEach(function (it) { it.show = true; }); return c; });

  /* ---------------- UI state ---------------- */
  var state = { view: 'today', calDay: new Date(TODAY), calWeekStart: addDays(TODAY, -((TODAY.getDay() + 6) % 7)), clientQ: '', clientTag: 'All' };
  var main = $('#pt-main'), toastEl = $('#pt-toast'), lastFocus = null;
  function toast(t) { toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2600); }
  function apptsOn(d) { return DB.appts.filter(function (a) { return sameDay(a.date, d) && a.status !== 'cancelled'; }).sort(function (a, b) { return a.start - b.start; }); }
  function openReq() { return DB.requests.filter(function (r) { return r.status === 'new'; }); }
  var ST = { confirmed: 'Confirmed', pending: 'Deposit due', arrived: 'Arrived', inchair: 'In the chair', done: 'Done', noshow: 'No-show', cancelled: 'Cancelled' };
  function chip(s) { return '<span class="chip st-' + s + '">' + ST[s] + '</span>'; }
  function nowMin() { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }

  function badges() {
    var n = openReq().length;
    $$('[data-count="requests"]').forEach(function (b) { b.textContent = n; b.hidden = !n; });
  }

  /* ---------------- views ---------------- */
  var V = {};
  V.today = function () {
    var list = apptsOn(TODAY);
    var booked = list.reduce(function (s, a) { return s + (a.status === 'noshow' ? 0 : a.price); }, 0);
    var deps = list.reduce(function (s, a) { return s + a.deposit; }, 0);
    var done = list.filter(function (a) { return a.status === 'done'; }).length;
    var nm = nowMin();
    var next = list.filter(function (a) { return a.status !== 'done' && a.status !== 'noshow'; })[0];
    var hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : (hr < 17 ? 'Good afternoon' : 'Good evening');
    var weekRev = DB.appts.filter(function (a) { return a.status === 'done' && a.date >= addDays(TODAY, -6) && a.date <= TODAY; }).reduce(function (s, a) { return s + a.price; }, 0);
    var due = rebookDue().slice(0, 3);
    var h = '<div class="pt-h"><div><h1>' + greet + ', <em>Mimi.</em></h1><p>' + fmtDay(TODAY, true) + ' · ' + list.length + ' clients on the books</p></div>' +
      '<div class="acts"><button class="btn btn-pink" data-act="new-appt">' + ic('plus') + 'New appointment</button><button class="btn btn-line" data-act="walkin">Add walk-in</button></div></div>';
    h += '<div class="kpis"><div class="kpi"><span>Booked today</span><b>' + money(booked) + '</b><small>' + done + ' of ' + list.length + ' done</small></div>' +
      '<div class="kpi"><span>Deposits in</span><b>' + money(deps) + '</b><small>' + list.filter(function (a) { return a.status === 'pending'; }).length + ' still due</small></div>' +
      '<div class="kpi"><span>New requests</span><b>' + openReq().length + '</b><small>from the website</small></div>' +
      '<div class="kpi"><span>Last 7 days</span><b>' + money(weekRev) + '</b><small>completed services</small></div></div>';
    h += '<div class="grid-2" style-x><div>';
    h += '<h2 class="pt-sub">Up next <small>' + (next ? rel(next.date) : '') + '</small></h2>';
    if (next) {
      var c = client(next.client), s = svc(next.svc);
      h += '<div class="next"><div class="when">' + fmtTime(next.start) + '<small>' + Math.round(next.dur / 60 * 10) / 10 + ' hrs est.</small></div><span class="lbl">' + (next.start <= nm ? 'Should be here now' : 'Next client') + '</span>' +
        '<h3>' + esc(c.name) + '</h3><p class="meta">' + esc(s.catLabel + ' · ' + s.label) + ' · ' + money(next.price) + ' ' + chip(next.status) + '</p>' +
        (c.notes ? '<p class="note">' + esc(next.note || c.notes) + '</p>' : '') +
        '<div class="acts">' + (next.status === 'pending' ? '<a class="btn btn-gold" href="' + sms(c.phone, 'Hi ' + c.name.split(' ')[0] + '! Mimi here. To hold your ' + fmtTime(next.start) + ' appointment today, please send the $' + DB.settings.deposit + ' deposit. See you soon!') + '">' + ic('msg') + 'Ask for deposit</a>' : '') +
        (next.status === 'confirmed' || next.status === 'pending' ? '<button class="btn btn-pink" data-act="status" data-id="' + next.id + '" data-to="arrived">' + ic('check') + 'Mark arrived</button>' : '') +
        (next.status === 'arrived' ? '<button class="btn btn-pink" data-act="status" data-id="' + next.id + '" data-to="inchair">Start service</button>' : '') +
        (next.status === 'inchair' ? '<button class="btn btn-pink" data-act="checkout" data-id="' + next.id + '">' + ic('check') + 'Finish and check out</button>' : '') +
        '<a class="btn btn-ghost" href="' + sms(c.phone, 'Hi ' + c.name.split(' ')[0] + '! Mimi here, just confirming your ' + s.label.toLowerCase() + ' at ' + fmtTime(next.start) + '. Suite B, Room 6, 6492 Landover Rd. See you soon!') + '">' + ic('msg') + 'Text</a>' +
        '<button class="btn btn-ghost" data-act="appt" data-id="' + next.id + '">Details</button></div></div>';
    } else h += '<div class="empty">All done for today. Time to rest those hands.</div>';
    h += '<h2 class="pt-sub">Today\'s chair <small>' + list.length + ' appointments</small></h2><ul class="list">' + (list.length ? list.map(apptRow).join('') : '<li class="empty">No appointments yet today.</li>') + '</ul></div><div>';
    var rq = openReq();
    h += '<h2 class="pt-sub">Website requests <a class="btn btn-ghost btn-sm" href="#requests">See all</a></h2>';
    h += rq.length ? '<ul class="list">' + rq.slice(0, 3).map(function (r) { var s = svc(r.svc); return '<li><a class="appt" href="#requests"><span class="t">' + esc(r.price) + '<small>' + ago(r.at) + '</small></span><span><span class="who">' + esc(r.name) + '</span><span class="what">' + esc(s.label) + ' · ' + rel(r.day) + '</span></span><span class="side"><span class="chip new">New</span></span></a></li>'; }).join('') + '</ul>' : '<div class="empty">No new requests.</div>';
    h += '<h2 class="pt-sub">Due for a rebook <small>money on the table</small></h2>';
    h += due.length ? '<ul class="list">' + due.map(dueRow).join('') + '</ul>' : '<div class="empty">Everyone is booked.</div>';
    h += '</div></div>';
    return h;
  };
  function ago(d) { var m = Math.round((Date.now() - d) / 60000); if (m < 60) return m + ' min ago'; var hh = Math.round(m / 60); if (hh < 24) return hh + ' hr ago'; return Math.round(hh / 24) + ' days ago'; }
  function apptRow(a) {
    var c = client(a.client), s = svc(a.svc);
    return '<li><button class="appt' + (a.status === 'done' ? ' is-done' : '') + '" data-act="appt" data-id="' + a.id + '"><span class="t">' + fmtTime(a.start).split(' ')[0] + '<small>' + fmtTime(a.start).split(' ')[1] + ' · ' + Math.round(a.dur / 60 * 10) / 10 + ' h</small></span>' +
      '<span><span class="who">' + esc(c.name) + '</span><span class="what">' + esc(s.label) + '</span></span><span class="side"><span class="amt">' + money(a.price) + '</span>' + chip(a.status) + '</span></button></li>';
  }
  function lastVisit(c) { var v = DB.appts.filter(function (a) { return a.client === c.id && a.status === 'done'; }).sort(function (a, b) { return b.date - a.date; })[0]; return v ? v.date : (c.visits.length ? c.visits[c.visits.length - 1].date : null); }
  function nextAppt(c) { return DB.appts.filter(function (a) { return a.client === c.id && a.date >= TODAY && a.status !== 'cancelled' && a.status !== 'done' && a.status !== 'noshow'; }).sort(function (a, b) { return a.date - b.date; })[0]; }
  function rebookDue() {
    return DB.clients.map(function (c) { var lv = lastVisit(c); return { c: c, lv: lv, due: lv ? addDays(lv, 42) : null }; })
      .filter(function (x) { return x.due && !nextAppt(x.c) && x.due <= addDays(TODAY, 14); })
      .sort(function (a, b) { return a.due - b.due; });
  }
  function dueRow(x) {
    var c = x.c, s = svc(c.fav), late = x.due < TODAY;
    var body = 'Hi ' + c.name.split(' ')[0] + '! Mimi here. It has been about ' + Math.max(4, Math.round((TODAY - x.lv) / 6048e5)) + ' weeks since your ' + s.label.toLowerCase() + '. Ready for a fresh set? I have openings this week. Reply with a day that works!';
    return '<li><div class="appt" style-x><span class="t">' + (late ? '<span class="due">Late</span>' : rel(x.due)) + '<small>due</small></span><span><span class="who">' + esc(c.name) + '</span><span class="what">' + esc(s.label) + ' · last ' + fmtDay(x.lv) + '</span></span><span class="side"><a class="btn btn-pink btn-sm" href="' + sms(c.phone, body) + '">' + ic('msg') + 'Text</a></span></div></li>';
  }

  V.requests = function () {
    var rq = DB.requests.filter(function (r) { return r.status === 'new'; }), handled = DB.requests.filter(function (r) { return r.status !== 'new'; });
    var h = '<div class="pt-h"><div><h1>Booking <em>requests.</em></h1><p>Sent from the "Book" builder on your website. Confirm in one tap; a text to the client is written for you.</p></div></div>';
    h += rq.length ? '<div class="reqs">' + rq.map(reqCard).join('') + '</div>' : '<div class="empty">You are all caught up. New website requests land here.</div>';
    if (handled.length) h += '<h2 class="pt-sub">Handled <small>this visit</small></h2><ul class="list">' + handled.map(function (r) { return '<li><div class="appt"><span class="t">' + esc(r.price) + '</span><span><span class="who">' + esc(r.name) + '</span><span class="what">' + esc(svc(r.svc).label) + '</span></span><span class="side">' + (r.status === 'booked' ? chip('confirmed') : '<span class="chip st-cancelled">Declined</span>') + '</span></div></li>'; }).join('') + '</ul>';
    return h;
  };
  function reqCard(r) {
    var s = svc(r.svc), first = r.name;
    return '<article class="req"><div class="req-top"><div><span class="chip new">New</span> <span class="src">Website · ' + ago(r.at) + '</span><h3>' + esc(r.name) + '</h3></div><span class="req-price">' + esc(r.price) + '</span></div>' +
      '<dl><dt>Style</dt><dd>' + esc(s.catLabel + ' · ' + s.label) + '</dd><dt>Day</dt><dd>' + fmtDay(r.day, true) + '</dd><dt>Time</dt><dd>' + esc(r.time) + '</dd><dt>Phone</dt><dd><a href="tel:' + r.phone.replace(/\D/g, '') + '">' + esc(r.phone) + '</a></dd>' + (r.notes ? '<dt>Notes</dt><dd>' + esc(r.notes) + '</dd>' : '') + '</dl>' +
      '<div class="acts"><button class="btn btn-pink" data-act="confirm-req" data-id="' + r.id + '">' + ic('check') + 'Confirm a time</button>' +
      '<a class="btn btn-ghost" href="' + sms(r.phone, 'Hi ' + first + '! Mimi here, thanks for your request for ' + s.label.toLowerCase() + '. Can you send me a photo of your hair and your inspo pic so I can confirm your price?') + '">' + ic('msg') + 'Ask for a photo</a>' +
      '<button class="btn btn-danger" data-act="decline-req" data-id="' + r.id + '">Decline</button></div></article>';
  }

  V.calendar = function () {
    var ws = state.calWeekStart, days = []; for (var i = 0; i < 7; i++) days.push(addDays(ws, i));
    var h = '<div class="pt-h"><div><h1>Your <em>calendar.</em></h1><p>' + fmtDay(days[0]) + ' to ' + fmtDay(days[6]) + '</p></div><div class="cal-nav"><button class="icon-btn" data-act="wk" data-n="-7" aria-label="Previous week">' + ic('left') + '</button><button class="btn btn-ghost btn-sm" data-act="wk" data-n="0">This week</button><button class="icon-btn" data-act="wk" data-n="7" aria-label="Next week">' + ic('right') + '</button><button class="btn btn-pink btn-sm" data-act="new-appt">' + ic('plus') + 'New</button></div></div>';
    h += '<div class="week" role="group" aria-label="Pick a day">' + days.map(function (d) { var n = apptsOn(d).length; return '<button class="day-btn' + (sameDay(d, TODAY) ? ' today' : '') + '" data-act="day" data-d="' + dkey(d) + '" aria-pressed="' + sameDay(d, state.calDay) + '"><small>' + d.toLocaleDateString('en-US', { weekday: 'short' }) + '</small><b>' + d.getDate() + '</b><i>' + (n ? n + ' appt' + (n > 1 ? 's' : '') : '·') + '</i></button>'; }).join('') + '</div>';
    // laptop week grid 7 AM - 8 PM
    var H0 = 7 * 60, H1 = 20 * 60, PX = 48 / 60, colH = (H1 - H0) * PX;
    h += '<div class="wk-grid" aria-hidden="false"><div class="wk-head"></div>' + days.map(function (d) { return '<div class="wk-head' + (sameDay(d, TODAY) ? ' today' : '') + '">' + d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) + '</div>'; }).join('');
    h += '<div class="wk-times" data-h="' + colH + '">'; for (var m = H0; m <= H1; m += 60) h += '<span data-top="' + ((m - H0) * PX) + '">' + fmtTime(m).replace(':00', '') + '</span>'; h += '</div>';
    days.forEach(function (d) {
      h += '<div class="wk-col' + (sameDay(d, TODAY) ? ' today' : '') + '" data-h="' + colH + '">';
      apptsOn(d).forEach(function (a) { var c = client(a.client), s = svc(a.svc); h += '<button class="blk c-' + s.cat + ' st-' + a.status + (a.status === 'done' ? ' is-done' : '') + '" data-act="appt" data-id="' + a.id + '" data-top="' + Math.max(0, (a.start - H0) * PX) + '" data-hh="' + Math.min(a.dur, H1 - a.start) * PX + '"><b>' + esc(c.name) + '</b>' + fmtTime(a.start) + ' · ' + esc(s.label) + '</button>'; });
      if (sameDay(d, TODAY)) { var nm = nowMin(); if (nm > H0 && nm < H1) h += '<span class="now-line" data-top="' + (nm - H0) * PX + '"></span>'; }
      h += '</div>';
    });
    h += '</div>';
    var list = apptsOn(state.calDay);
    h += '<div class="cal-day-list"><h2 class="pt-sub">' + rel(state.calDay) + ' <small>' + fmtDay(state.calDay, true) + '</small></h2><ul class="list">' + (list.length ? list.map(apptRow).join('') : '<li class="empty">Nothing booked. Open for walk-ins.</li>') + '</ul></div>';
    h += '<div class="legend">' + DB.menu.map(function (c) { return '<span><i class="c-' + c.id + '"></i>' + esc(c.short) + '</span>'; }).join('') + '<span>Dashed = deposit due</span></div>';
    return h;
  };

  V.clients = function () {
    var q = state.clientQ.toLowerCase(), tag = state.clientTag;
    var rows = DB.clients.filter(function (c) { return (!q || (c.name + ' ' + c.phone + ' ' + c.notes).toLowerCase().indexOf(q) > -1) && (tag === 'All' || c.tags.indexOf(tag) > -1 || (tag === 'Due' && rebookDue().some(function (x) { return x.c === c; }))); });
    var h = '<div class="pt-h"><div><h1>Your <em>clients.</em></h1><p>' + DB.clients.length + ' clients · hair notes, history and their braid journey in one place.</p></div><button class="btn btn-pink" data-act="new-client">' + ic('plus') + 'Add client</button></div>';
    h += '<div class="search"><input type="search" id="cq" placeholder="Search name, phone or notes" value="' + esc(state.clientQ) + '" aria-label="Search clients"><div class="seg" role="group" aria-label="Filter">' + ['All', 'VIP', 'Regular', 'New', 'Due'].map(function (t) { return '<button data-act="ctag" data-t="' + t + '" aria-pressed="' + (t === tag) + '">' + (t === 'Due' ? 'Due to rebook' : t) + '</button>'; }).join('') + '</div></div>';
    h += '<ul class="list" id="clist">' + (rows.length ? rows.map(clientRow).join('') : '<li class="empty">No clients match.</li>') + '</ul>';
    return h;
  };
  function spent(c) { return DB.appts.filter(function (a) { return a.client === c.id && a.status === 'done'; }).reduce(function (s, a) { return s + a.price; }, 0) + c.visits.reduce(function (s, v) { return s + v.price; }, 0); }
  function clientRow(c) {
    var lv = lastVisit(c), na = nextAppt(c), isDue = rebookDue().some(function (x) { return x.c === c; });
    return '<li><button class="cl" data-act="client" data-id="' + c.id + '"><span class="av" aria-hidden="true">' + initials(c.name) + '</span><span><b>' + esc(c.name) + ' ' + c.tags.map(function (t) { return t === 'VIP' ? '<span class="chip vip">VIP</span>' : (t === 'New' ? '<span class="chip new">New</span>' : ''); }).join('') + '</b><small>' + esc(svc(c.fav).label) + (na ? ' · next ' + rel(na.date) : (lv ? ' · last ' + fmtDay(lv) : '')) + '</small></span><span class="r">' + (isDue ? '<span class="due">Due</span><br>' : '') + '<b>' + money(spent(c)) + '</b><br>lifetime</span></button></li>';
  }

  V.money = function () {
    var wks = []; for (var i = 7; i >= 0; i--) { var s = addDays(state.calWeekStart, -7 * i), e = addDays(s, 6); var tot = DB.appts.filter(function (a) { return a.status === 'done' && a.date >= s && a.date <= e; }).reduce(function (x, a) { return x + a.price; }, 0); wks.push({ s: s, tot: tot, cur: i === 0 }); }
    var max = Math.max.apply(null, wks.map(function (w) { return w.tot; }).concat([1]));
    var d30 = DB.appts.filter(function (a) { return a.date >= addDays(TODAY, -30) && a.date <= TODAY; });
    var done30 = d30.filter(function (a) { return a.status === 'done'; }), rev30 = done30.reduce(function (s, a) { return s + a.price; }, 0);
    var ns = d30.filter(function (a) { return a.status === 'noshow'; }).length;
    var web = d30.filter(function (a) { return a.source === 'Website'; }).length;
    var byS = {}; done30.forEach(function (a) { var l = svc(a.svc).label; byS[l] = (byS[l] || 0) + a.price; });
    var top = Object.keys(byS).map(function (k) { return [k, byS[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
    var byD = [0, 0, 0, 0, 0, 0, 0]; done30.forEach(function (a) { byD[a.date.getDay()] += a.price; });
    var dn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], dmax = Math.max.apply(null, byD.concat([1]));
    var upcoming = DB.appts.filter(function (a) { return a.date > TODAY && a.status !== 'cancelled'; }).reduce(function (s, a) { return s + a.price; }, 0);
    var h = '<div class="pt-h"><div><h1>Your <em>money.</em></h1><p>Last 30 days. Demo numbers from sample appointments.</p></div></div>';
    h += '<div class="kpis"><div class="kpi"><span>Revenue</span><b>' + money(rev30) + '</b><small>' + done30.length + ' services</small></div><div class="kpi"><span>Average ticket</span><b>' + money(done30.length ? rev30 / done30.length : 0) + '</b><small>per client</small></div><div class="kpi"><span>Booked ahead</span><b>' + money(upcoming) + '</b><small>next 7 days</small></div><div class="kpi"><span>From website</span><b>' + Math.round(web / Math.max(1, d30.length) * 100) + '%</b><small>' + ns + ' no-show' + (ns === 1 ? '' : 's') + '</small></div></div>';
    h += '<div class="grid-2"><div class="panel"><h2 class="pt-sub" style-x>Weekly revenue <small>8 weeks</small></h2><div class="chart" role="img" aria-label="Weekly revenue for the last 8 weeks">' + wks.map(function (w) { return '<div class="col' + (w.cur ? ' cur' : '') + '"><em>' + money(w.tot) + '</em><div class="bar" data-hh="' + Math.round(w.tot / max * 150) + '"></div><small>' + (w.s.getMonth() + 1) + '/' + w.s.getDate() + '</small></div>'; }).join('') + '</div></div>';
    h += '<div class="panel"><h2 class="pt-sub">Top services <small>30 days</small></h2><ul class="hbars">' + top.map(function (t) { return '<li><span>' + esc(t[0]) + '</span><b>' + money(t[1]) + '</b><span class="trk"><i data-w="' + Math.round(t[1] / top[0][1] * 100) + '"></i></span></li>'; }).join('') + '</ul></div></div>';
    h += '<div class="grid-2"><div class="panel"><h2 class="pt-sub">Busiest days</h2><ul class="hbars">' + [1, 2, 3, 4, 5, 6, 0].map(function (i) { return '<li><span>' + dn[i] + '</span><b>' + money(byD[i]) + '</b><span class="trk"><i data-w="' + Math.round(byD[i] / dmax * 100) + '"></i></span></li>'; }).join('') + '</ul></div>';
    h += '<div class="panel"><h2 class="pt-sub">Rebook list <small>text them today</small></h2><ul class="list">' + (rebookDue().slice(0, 5).map(dueRow).join('') || '<li class="empty">Everyone is booked.</li>') + '</ul></div></div>';
    return h;
  };

  V.menu = function () {
    var h = '<div class="pt-h"><div><h1>Menu <em>&amp; prices.</em></h1><p>Change a price or hide a style and it updates your website menu, price finder and booking builder together.</p></div><button class="btn btn-pink" data-act="publish">' + ic('check') + 'Publish to website</button></div>';
    DB.menu.forEach(function (c) {
      h += '<div class="panel" style-x><h2 class="pt-sub">' + esc(c.label) + '</h2><div class="mt-wrap"><table class="mt"><thead><tr><th>Style</th><th>Price</th><th>"From"</th><th>On site</th></tr></thead><tbody>' +
        c.items.map(function (it) { return '<tr><td>' + esc(it.label) + '<br><small class="pt-small">' + esc(it.note) + '</small></td><td><label class="sr-only" for="p-' + c.id + it.id + '">Price for ' + esc(it.label) + '</label><input type="number" min="0" step="5" id="p-' + c.id + it.id + '" data-act="price" data-c="' + c.id + '" data-i="' + it.id + '" value="' + (it.price == null ? '' : it.price) + '" placeholder="Text"></td><td><label class="sw"><input type="checkbox" data-act="from" data-c="' + c.id + '" data-i="' + it.id + '"' + (it.from ? ' checked' : '') + '><span></span><span class="sr-only">Show as starting price</span></label></td><td><label class="sw"><input type="checkbox" data-act="show" data-c="' + c.id + '" data-i="' + it.id + '"' + (it.show ? ' checked' : '') + '><span></span><span class="sr-only">Show on website</span></label></td></tr>'; }).join('') +
        '</tbody></table></div></div>';
    });
    return h;
  };

  V.settings = function () {
    var S = DB.settings;
    var h = '<div class="pt-h"><div><h1>Shop <em>settings.</em></h1><p>Hours, deposit and booking rules. Your website reads these.</p></div><button class="btn btn-pink" data-act="save-settings">' + ic('check') + 'Save</button></div><div class="set">';
    h += '<div class="panel"><h2 class="pt-sub">Hours</h2><table class="hrs"><tbody>' + S.hours.map(function (r, i) { return '<tr><td>' + r[1] + '</td><td><label class="sw"><input type="checkbox" data-act="hopen" data-i="' + i + '"' + (r[4] ? ' checked' : '') + '><span></span><span class="sr-only">Open on ' + r[1] + '</span></label></td><td><label class="sr-only" for="ho' + i + '">Opens</label><input type="time" id="ho' + i + '" value="' + r[2] + '"></td><td><label class="sr-only" for="hc' + i + '">Closes</label><input type="time" id="hc' + i + '" value="' + r[3] + '"></td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<div class="panel"><h2 class="pt-sub">Booking rules</h2>' +
      '<div class="field"><label for="dep">Deposit to hold an appointment</label><input id="dep" type="number" min="0" step="5" value="' + S.deposit + '"></div>' +
      '<div class="field"><label for="buf">Break between clients (minutes)</label><input id="buf" type="number" min="0" step="5" value="' + S.buffer + '"></div>' +
      '<div class="row"><span>Walk-ins welcome</span><label class="sw"><input type="checkbox"' + (S.walkins ? ' checked' : '') + '><span></span><span class="sr-only">Walk-ins welcome</span></label></div>' +
      '<div class="row"><span>Text clients a reminder the day before</span><label class="sw"><input type="checkbox"' + (S.reminders ? ' checked' : '') + '><span></span><span class="sr-only">Reminders</span></label></div>' +
      '<div class="row"><span>Send a thank-you + review link after each visit</span><label class="sw"><input type="checkbox"' + (S.autoThanks ? ' checked' : '') + '><span></span><span class="sr-only">Thank-you texts</span></label></div>' +
      '<div class="field" style-x><label for="pay">Deposit payment link (Cash App, Zelle, Square or Stripe)</label><input id="pay" placeholder="Add your payment link"></div></div>';
    h += '<div class="panel"><h2 class="pt-sub">Chair time by style <small>for the calendar</small></h2>' + DB.menu.map(function (c) { return '<div class="row"><span>' + esc(c.short) + '</span><span><label class="sr-only" for="du-' + c.id + '">Hours for ' + esc(c.short) + '</label><input class="mt-in" id="du-' + c.id + '" type="number" min="1" max="12" step="0.5" value="' + DUR[c.id] / 60 + '" data-act="dur" data-c="' + c.id + '" style-x> hrs</span></div>'; }).join('') + '</div>';
    h += '<div class="panel"><h2 class="pt-sub">About this demo</h2><p class="pt-small">This portal is a working demo built for Braids By Mimi by Couture House Co. It runs on sample clients and appointments so you can click through everything. When it goes live, website requests, deposits and reminders connect to your real phone number and payment link, and your data is kept private behind your login.</p><a class="btn btn-ghost" href="index.html">' + ic('site') + 'Back to the website</a></div>';
    return h + '</div>';
  };

  V.more = function () {
    var h = '<div class="pt-h"><div><h1>More</h1></div></div><ul class="list">';
    [['money', 'chart', 'Money', 'Revenue, top styles, rebook list'], ['menu', 'menu', 'Menu & prices', 'Edit prices on your website'], ['settings', 'gear', 'Settings', 'Hours, deposit, booking rules']].forEach(function (x) { h += '<li><a class="cl" href="#' + x[0] + '"><span class="av" aria-hidden="true">' + ic(x[1]) + '</span><span><b>' + x[2] + '</b><small>' + x[3] + '</small></span><span class="r">' + ic('right') + '</span></a></li>'; });
    return h + '<li><a class="cl" href="index.html"><span class="av" aria-hidden="true">' + ic('site') + '</span><span><b>View website</b><small>braids-by-mimi.netlify.app</small></span><span class="r">' + ic('right') + '</span></a></li><li><button class="cl" data-act="logout"><span class="av" aria-hidden="true">' + ic('out') + '</span><span><b>Sign out</b><small>Leave the demo</small></span><span class="r"></span></button></li></ul>';
  };

  /* ---------------- render + router ---------------- */
  var TITLES = { today: 'Today', requests: 'Requests', calendar: 'Calendar', clients: 'Clients', money: 'Money', menu: 'Menu & prices', settings: 'Settings', more: 'More' };
  function render() {
    var v = V[state.view] ? state.view : 'today';
    main.innerHTML = V[v]();
    $('#pt-title').textContent = TITLES[v];
    $$('.pt-side a.nav, .pt-tabs a').forEach(function (a) { var t = a.getAttribute('href').slice(1); var on = t === v || (t === 'more' && /money|menu|settings/.test(v)); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    // positions are set through the CSSOM (strict CSP: no inline style attributes)
    $$('[data-top]', main).forEach(function (e) { e.style.top = e.getAttribute('data-top') + 'px'; });
    $$('[data-hh]', main).forEach(function (e) { e.style.height = Math.max(22, +e.getAttribute('data-hh')) + 'px'; });
    $$('[data-h]', main).forEach(function (e) { e.style.height = e.getAttribute('data-h') + 'px'; });
    $$('[data-w]', main).forEach(function (e) { e.style.width = e.getAttribute('data-w') + '%'; });
    $$('[style-x]', main).forEach(function (e) { e.removeAttribute('style-x'); });
    badges();
    var cq = $('#cq'); if (cq) cq.addEventListener('input', function () { state.clientQ = cq.value; var ul = $('#clist'); var tmp = doc.createElement('div'); tmp.innerHTML = V.clients(); ul.innerHTML = $('#clist', tmp).innerHTML; });
  }
  function route() { var h = (location.hash || '#today').slice(1); if (!V[h]) h = 'today'; state.view = h; render(); win.scrollTo(0, 0); var t = $('h1', main); if (t && doc.activeElement && doc.activeElement !== doc.body) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }

  /* ---------------- drawers + modals ---------------- */
  var scrim = $('#pt-scrim');
  function openLayer(html, center) {
    lastFocus = doc.activeElement;
    scrim.className = 'scrim' + (center ? ' center' : '');
    scrim.innerHTML = html; scrim.hidden = false; doc.body.style.overflow = 'hidden';
    var f = scrim.querySelector('input,select,textarea,button,a'); if (f) f.focus();
  }
  function closeLayer() { scrim.hidden = true; scrim.innerHTML = ''; doc.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  scrim.addEventListener('click', function (e) { if (e.target === scrim) closeLayer(); });
  doc.addEventListener('keydown', function (e) {
    if (scrim.hidden) return;
    if (e.key === 'Escape') closeLayer();
    if (e.key === 'Tab') { var f = $$('a,button,input,select,textarea', scrim).filter(function (x) { return !x.disabled && x.offsetParent !== null; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  function drawerTop(t) { return '<div class="drawer-top"><h2>' + t + '</h2><button class="icon-btn" data-act="close" aria-label="Close">' + ic('x') + '</button></div>'; }

  function apptDrawer(a) {
    var c = client(a.client), s = svc(a.svc), first = c.name.split(' ')[0];
    var h = '<div class="drawer" role="dialog" aria-modal="true" aria-label="Appointment">' + drawerTop(esc(c.name)) + '<div class="drawer-body">';
    h += '<p>' + chip(a.status) + ' <span class="pt-small">Booked by ' + esc(a.source) + '</span></p><h3 class="pt-sub">' + esc(s.catLabel + ' · ' + s.label) + '</h3>';
    h += '<div class="stats"><div><b>' + fmtTime(a.start) + '</b><span>' + rel(a.date) + '</span></div><div><b>' + money(a.price) + '</b><span>price</span></div><div><b>' + money(a.deposit) + '</b><span>deposit</span></div></div>';
    if (a.note || c.notes) h += '<p class="note">' + esc(a.note || c.notes) + '</p>';
    h += '<div class="acts">';
    if (a.status === 'pending') h += '<button class="btn btn-gold" data-act="dep-paid" data-id="' + a.id + '">' + ic('check') + 'Deposit received</button><a class="btn btn-ghost" href="' + sms(c.phone, 'Hi ' + first + '! Mimi here. Please send your $' + DB.settings.deposit + ' deposit to hold ' + rel(a.date).toLowerCase() + ' at ' + fmtTime(a.start) + '. Thank you!') + '">' + ic('msg') + 'Ask for deposit</a>';
    if (a.status === 'confirmed' || a.status === 'pending') h += '<button class="btn btn-pink" data-act="status" data-id="' + a.id + '" data-to="arrived">Mark arrived</button>';
    if (a.status === 'arrived') h += '<button class="btn btn-pink" data-act="status" data-id="' + a.id + '" data-to="inchair">Start service</button>';
    if (a.status === 'inchair' || a.status === 'arrived') h += '<button class="btn btn-gold" data-act="checkout" data-id="' + a.id + '">' + ic('check') + 'Check out</button>';
    h += '<a class="btn btn-ghost" href="' + sms(c.phone, 'Hi ' + first + '! Mimi here. ') + '">' + ic('msg') + 'Text</a><a class="btn btn-ghost" href="tel:' + c.phone.replace(/\D/g, '') + '">' + ic('phone') + 'Call</a>';
    h += '</div>';
    if (a.status !== 'done' && a.status !== 'noshow' && a.status !== 'cancelled') {
      h += '<h3 class="pt-sub">Move it</h3><div class="f-row"><div class="field"><label for="mv-d">Day</label><input id="mv-d" type="date" value="' + dkey(a.date) + '"></div><div class="field"><label for="mv-t">Time</label><input id="mv-t" type="time" step="900" value="' + pad(Math.floor(a.start / 60)) + ':' + pad(a.start % 60) + '"></div></div>' +
        '<div class="acts"><button class="btn btn-line" data-act="move" data-id="' + a.id + '">Reschedule</button><button class="btn btn-danger" data-act="status" data-id="' + a.id + '" data-to="noshow">No-show</button><button class="btn btn-danger" data-act="status" data-id="' + a.id + '" data-to="cancelled">Cancel</button></div>';
    }
    h += '<h3 class="pt-sub">Client</h3><button class="cl" data-act="client" data-id="' + c.id + '"><span class="av" aria-hidden="true">' + initials(c.name) + '</span><span><b>' + esc(c.name) + '</b><small>' + esc(c.phone) + '</small></span><span class="r"><b>' + money(spent(c)) + '</b><br>lifetime</span></button>';
    return h + '</div></div>';
  }
  function clientDrawer(c) {
    var past = DB.appts.filter(function (a) { return a.client === c.id && a.date <= TODAY && a.status === 'done'; }).map(function (a) { return { date: a.date, svc: a.svc, price: a.price }; }).concat(c.visits).sort(function (a, b) { return b.date - a.date; });
    var lv = lastVisit(c), na = nextAppt(c), first = c.name.split(' ')[0];
    var h = '<div class="drawer" role="dialog" aria-modal="true" aria-label="Client">' + drawerTop(esc(c.name)) + '<div class="drawer-body">';
    h += '<p>' + c.tags.map(function (t) { return '<span class="chip ' + (t === 'VIP' ? 'vip' : t === 'New' ? 'new' : '') + '">' + t + '</span>'; }).join(' ') + ' <span class="pt-small">' + esc(c.phone) + '</span></p>';
    h += '<div class="stats"><div><b>' + past.length + '</b><span>visits</span></div><div><b>' + money(spent(c)) + '</b><span>lifetime</span></div><div><b>' + (na ? rel(na.date) : (lv ? rel(addDays(lv, 42)) : 'New')) + '</b><span>' + (na ? 'next visit' : 'rebook due') + '</span></div></div>';
    h += '<div class="acts"><button class="btn btn-pink" data-act="new-appt" data-client="' + c.id + '">' + ic('plus') + 'Book again</button><a class="btn btn-ghost" href="' + sms(c.phone, 'Hi ' + first + '! Mimi here. ') + '">' + ic('msg') + 'Text</a><a class="btn btn-ghost" href="tel:' + c.phone.replace(/\D/g, '') + '">' + ic('phone') + 'Call</a></div>';
    h += '<h3 class="pt-sub">Hair notes</h3><div class="field"><label class="sr-only" for="cn">Hair notes</label><textarea id="cn">' + esc(c.notes) + '</textarea></div><button class="btn btn-line btn-sm" data-act="save-notes" data-id="' + c.id + '">Save notes</button>';
    if (c.photos.length) h += '<h3 class="pt-sub">Braid journey <small>photos from each visit</small></h3><div class="journey">' + c.photos.slice().reverse().map(function (p) { return '<figure><img src="' + p.src + '" alt="' + esc(p.alt) + '" loading="lazy" width="300" height="375"><figcaption>' + fmtDay(p.date) + '</figcaption></figure>'; }).join('') + '</div><p class="pt-small">Sample photos from your gallery. Live, you add the after-photo at checkout and the client sees it in her account.</p>';
    h += '<h3 class="pt-sub">History</h3><ul class="hist">' + (past.length ? past.map(function (v) { return '<li><b>' + esc(svc(v.svc).label) + '</b><span>' + fmtDay(v.date) + ' · ' + money(v.price) + '</span></li>'; }).join('') : '<li><span>No visits yet.</span></li>') + '</ul>';
    return h + '</div></div>';
  }
  function svcOptions(sel) { return DB.menu.map(function (c) { return '<optgroup label="' + esc(c.label) + '">' + c.items.map(function (it) { var k = c.id + ':' + it.id; return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(it.label) + (it.price != null ? ' · ' + (it.from ? 'from ' : '') + '$' + it.price : '') + '</option>'; }).join('') + '</optgroup>'; }).join(''); }
  function apptModal(o) {
    o = o || {};
    var c = o.client ? client(o.client) : null;
    var h = '<form class="modal" id="am" role="dialog" aria-modal="true" aria-labelledby="am-h"><h2 id="am-h">' + (o.walkin ? 'Add a walk-in' : (o.req ? 'Confirm request' : 'New appointment')) + '</h2>';
    if (o.req) h += '<input type="hidden" name="req" value="' + o.req.id + '">';
    h += '<div class="field"><label for="am-c">Client</label><select id="am-c" name="client"><option value="__new">+ New client</option>' + DB.clients.map(function (x) { return '<option value="' + x.id + '"' + (c && c.id === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></div>';
    h += '<div class="f-row" id="am-new"' + (c ? ' hidden' : '') + '><div class="field"><label for="am-n">Name</label><input id="am-n" name="name" value="' + esc(o.req ? o.req.name : '') + '" autocomplete="off"></div><div class="field"><label for="am-p">Mobile</label><input id="am-p" name="phone" type="tel" value="' + esc(o.req ? o.req.phone : '') + '"></div></div>';
    h += '<div class="field"><label for="am-s">Style</label><select id="am-s" name="svc">' + svcOptions(o.svc || (c ? c.fav : 'knotless:medium-midback')) + '</select></div>';
    var d = o.date || TODAY, t = o.time || (o.walkin ? Math.ceil(nowMin() / 15) * 15 : 9 * 60);
    h += '<div class="f-row"><div class="field"><label for="am-d">Day</label><input id="am-d" name="date" type="date" value="' + dkey(d) + '"></div><div class="field"><label for="am-t">Start</label><input id="am-t" name="time" type="time" step="900" value="' + pad(Math.floor(t / 60) % 24) + ':' + pad(t % 60) + '"></div></div>';
    h += '<div class="field"><label for="am-dep">Deposit</label><select id="am-dep" name="dep"><option value="paid">$' + DB.settings.deposit + ' received</option><option value="due"' + (o.req ? ' selected' : '') + '>Deposit due (text her)</option><option value="none"' + (o.walkin ? ' selected' : '') + '>No deposit (walk-in)</option></select></div>';
    h += '<div class="field"><label for="am-no">Notes</label><textarea id="am-no" name="note">' + esc(o.req ? o.req.notes : '') + '</textarea></div>';
    h += '<p class="f-err" id="am-err" role="alert"></p><div class="acts"><button class="btn btn-pink" type="submit">' + ic('check') + (o.req ? 'Book and text her' : 'Save') + '</button><button class="btn btn-ghost" type="button" data-act="close">Cancel</button></div></form>';
    openLayer(h, true);
    var sel = $('#am-c'); sel.addEventListener('change', function () { $('#am-new').hidden = sel.value !== '__new'; });
    if (o.req) { var match = DB.clients.filter(function (x) { return x.phone.replace(/\D/g, '') === o.req.phone.replace(/\D/g, ''); })[0]; if (match) { sel.value = match.id; $('#am-new').hidden = true; } else { sel.value = '__new'; } }
    $('#am').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, err = $('#am-err');
      var cid = f.client.value;
      if (cid === '__new') {
        if (!f.name.value.trim()) { err.textContent = 'Add the client\'s name.'; f.name.focus(); return; }
        var nc = { id: id(), name: f.name.value.trim(), phone: f.phone.value.trim() || '(000) 000-0000', tags: ['New'], notes: '', fav: f.svc.value, visits: [], photos: [] }; DB.clients.push(nc); cid = nc.id;
      }
      var tp = f.time.value.split(':'), start = (+tp[0]) * 60 + (+tp[1]);
      var ap = addAppt({ client: cid, svc: f.svc.value, date: fromKey(f.date.value), start: start, status: f.dep.value === 'due' ? 'pending' : (o.walkin ? 'arrived' : 'confirmed'), deposit: f.dep.value === 'paid' ? DB.settings.deposit : 0, note: f.note.value, source: o.walkin ? 'Walk-in' : (o.req ? 'Website' : 'Text') });
      var cl = client(cid), first = cl.name.split(' ')[0], s = svc(ap.svc);
      if (o.req) {
        o.req.status = 'booked';
        var body = 'Hi ' + first + '! Mimi here. You are booked for ' + s.label.toLowerCase() + ' on ' + fmtDay(ap.date, true) + ' at ' + fmtTime(ap.start) + '. Please send the $' + DB.settings.deposit + ' deposit to hold your spot. Suite B, Room 6, 6492 Landover Rd, Cheverly. See you then!';
        closeLayer(); toast('Booked. Opening your text to ' + first + '...');
        setTimeout(function () { win.location.href = sms(cl.phone, body); }, 500);
      } else { closeLayer(); toast((o.walkin ? 'Walk-in added: ' : 'Booked: ') + first + ', ' + rel(ap.date) + ' at ' + fmtTime(ap.start)); }
      state.calDay = new Date(ap.date); render();
    });
  }
  function checkoutModal(a) {
    var c = client(a.client), bal = Math.max(0, a.price - a.deposit);
    var h = '<form class="modal" id="co" role="dialog" aria-modal="true" aria-labelledby="co-h"><h2 id="co-h">Check out ' + esc(c.name.split(' ')[0]) + '</h2>' +
      '<div class="stats"><div><b>' + money(a.price) + '</b><span>service</span></div><div><b>-' + money(a.deposit) + '</b><span>deposit</span></div><div><b>' + money(bal) + '</b><span>balance</span></div></div>' +
      '<div class="field"><label for="co-tip">Tip</label><input id="co-tip" type="number" min="0" step="5" value="0"></div>' +
      '<div class="field"><label for="co-m">Paid with</label><select id="co-m"><option>Cash</option><option>Cash App</option><option>Zelle</option><option>Card</option></select></div>' +
      '<div class="row"><span>Text a thank-you + Google review link</span><label class="sw"><input type="checkbox" id="co-ty" checked><span></span><span class="sr-only">Send thank-you text</span></label></div>' +
      '<div class="acts"><button class="btn btn-pink" type="submit">' + ic('check') + 'Complete visit</button><button class="btn btn-ghost" type="button" data-act="close">Cancel</button></div></form>';
    openLayer(h, true);
    $('#co').addEventListener('submit', function (e) {
      e.preventDefault(); a.status = 'done'; var tip = +$('#co-tip').value || 0, ty = $('#co-ty').checked; closeLayer();
      toast('Done. ' + money(bal + tip) + ' collected' + (tip ? ' (incl. ' + money(tip) + ' tip)' : '') + '.');
      render();
      if (ty) setTimeout(function () { win.location.href = sms(c.phone, 'Thank you ' + c.name.split(' ')[0] + '! I loved doing your braids today. If you have a minute, a Google review means the world to me: https://www.google.com/maps/search/?api=1&query=Braids+By+Mimi+Cheverly+MD . See you next time! - Mimi'); }, 600);
    });
  }

  /* ---------------- actions (event delegation) ---------------- */
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act'), aid = b.getAttribute('data-id');
    var A = aid ? DB.appts.filter(function (x) { return x.id === aid; })[0] : null;
    switch (act) {
      case 'close': closeLayer(); break;
      case 'appt': if (A) openLayer(apptDrawer(A)); break;
      case 'client': var C = client(aid); if (C) openLayer(clientDrawer(C)); break;
      case 'new-appt': closeLayer(); apptModal({ client: b.getAttribute('data-client') }); break;
      case 'walkin': apptModal({ walkin: true, date: TODAY }); break;
      case 'new-client': apptModal({}); $('#am-c').value = '__new'; $('#am-new').hidden = false; $('#am-n').focus(); break;
      case 'status': if (A) { A.status = b.getAttribute('data-to'); closeLayer(); toast(client(A.client).name.split(' ')[0] + ': ' + ST[A.status]); render(); } break;
      case 'dep-paid': if (A) { A.deposit = DB.settings.deposit; A.status = 'confirmed'; closeLayer(); toast('Deposit received. Appointment confirmed.'); render(); } break;
      case 'checkout': if (A) { closeLayer(); checkoutModal(A); } break;
      case 'move': if (A) { var d = $('#mv-d').value, t = $('#mv-t').value.split(':'); A.date = fromKey(d); A.start = (+t[0]) * 60 + (+t[1]); closeLayer(); toast('Moved to ' + rel(A.date) + ' at ' + fmtTime(A.start)); state.calDay = new Date(A.date); render(); } break;
      case 'confirm-req': var R = DB.requests.filter(function (r) { return r.id === aid; })[0]; if (R) { var tm = /Morning/.test(R.time) ? 8 * 60 : /Late/.test(R.time) ? 10 * 60 + 30 : /Afternoon/.test(R.time) ? 13 * 60 + 30 : /Evening/.test(R.time) ? 16 * 60 : 9 * 60; apptModal({ req: R, svc: R.svc, date: R.day, time: tm }); } break;
      case 'decline-req': var R2 = DB.requests.filter(function (r) { return r.id === aid; })[0]; if (R2) { R2.status = 'declined'; render(); toast('Declined. Opening a polite reply...'); setTimeout(function () { win.location.href = sms(R2.phone, 'Hi ' + R2.name + '! Mimi here. Thank you so much for your request. I am fully booked that day, but I would love to fit you in another day this week. What works for you?'); }, 500); } break;
      case 'wk': var n = +b.getAttribute('data-n'); state.calWeekStart = n === 0 ? addDays(TODAY, -((TODAY.getDay() + 6) % 7)) : addDays(state.calWeekStart, n); state.calDay = n === 0 ? new Date(TODAY) : new Date(state.calWeekStart); render(); break;
      case 'day': state.calDay = fromKey(b.getAttribute('data-d')); render(); break;
      case 'ctag': state.clientTag = b.getAttribute('data-t'); render(); break;
      case 'save-notes': var C2 = client(aid); C2.notes = $('#cn').value; toast('Notes saved.'); break;
      case 'publish': toast('Published. Your website menu now shows these prices (demo).'); break;
      case 'save-settings': var dep = +$('#dep').value; if (dep >= 0) DB.settings.deposit = dep; toast('Settings saved (demo).'); break;
      case 'logout': doc.getElementById('pt-app').hidden = true; doc.getElementById('pt-login').hidden = false; location.hash = ''; break;
    }
  });
  doc.addEventListener('change', function (e) {
    var t = e.target, act = t.getAttribute('data-act'); if (!act) return;
    var cat = DB.menu.filter(function (c) { return c.id === t.getAttribute('data-c'); })[0], it = cat && cat.items.filter(function (i) { return i.id === t.getAttribute('data-i'); })[0];
    if (act === 'price' && it) { it.price = t.value === '' ? null : +t.value; SVC[cat.id + ':' + it.id].price = it.price; toast(it.label + ': ' + (it.price == null ? 'text for price' : '$' + it.price)); }
    if (act === 'from' && it) { it.from = t.checked; SVC[cat.id + ':' + it.id].from = it.from; }
    if (act === 'show' && it) { it.show = t.checked; toast(it.label + (it.show ? ' is on your site' : ' hidden from your site')); }
    if (act === 'dur') { DUR[t.getAttribute('data-c')] = Math.round(+t.value * 60); }
    if (act === 'hopen') { DB.settings.hours[+t.getAttribute('data-i')][4] = t.checked; }
  });

  /* ---------------- login (demo) ---------------- */
  $('#pt-enter').addEventListener('submit', function (e) {
    e.preventDefault();
    var pin = $('#pt-pin').value.trim();
    if (pin !== '1234') { $('#pt-lerr').textContent = 'Demo PIN is 1234.'; $('#pt-pin').focus(); return; }
    $('#pt-login').hidden = true; $('#pt-app').hidden = false;
    if (!location.hash) location.hash = '#today'; else route();
  });
  win.addEventListener('hashchange', function () { if (!$('#pt-app').hidden) { closeLayer(); route(); } });
  badges();
})();
