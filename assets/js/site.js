/* Braids By Mimi — site behaviour. No libraries. Everything works without JS; motion is off under prefers-reduced-motion. */
(function () {
  'use strict';
  var doc = document, win = window;
  var reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in win;
  var PHONE = '+14694419208';

  /* ---------- Mobile menu ---------- */
  var btn = doc.querySelector('.menu-btn'), nav = doc.getElementById('mnav');
  if (btn && nav) {
    var closeB = nav.querySelector('.mnav-close');
    var open = function () { nav.hidden = false; btn.setAttribute('aria-expanded', 'true'); doc.body.style.overflow = 'hidden'; closeB.focus(); };
    var close = function () { nav.hidden = true; btn.setAttribute('aria-expanded', 'false'); doc.body.style.overflow = ''; btn.focus(); };
    btn.addEventListener('click', open);
    closeB.addEventListener('click', close);
    nav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = nav.querySelectorAll('a,button'); var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { doc.body.style.overflow = ''; }); });
  }

  /* ---------- Reveals: content, braid rules, emblem dividers, foil words ---------- */
  var revealSel = '.rv,.braid-rule,.emblem-div,.foil,.hd';
  var items = doc.querySelectorAll(revealSel);
  if (!hasIO || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Line-art loops: poster first (LCP), phones load only the phone file, paused off-screen ---------- */
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  doc.querySelectorAll('.art-box[data-loop]').forEach(function (box) {
    var video = box.querySelector('.art-video');
    if (!video || reduce || saveData || !hasIO || !win.matchMedia) return;
    var mq = box.getAttribute('data-mq'), mql = mq ? win.matchMedia(mq) : null;
    var cur = '', onScreen = false;
    function play() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    function load() {
      var f = (mql && mql.matches) ? box.getAttribute('data-d') : (box.getAttribute('data-m') || box.getAttribute('data-d'));
      if (!f || f === cur) return; cur = f;
      box.classList.remove('is-playing');
      while (video.firstChild) video.removeChild(video.firstChild);
      [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
        var so = doc.createElement('source'); so.src = f + '.' + t[0]; so.type = t[1]; video.appendChild(so);
      });
      video.muted = true; video.preload = 'auto'; video.load();
      if (onScreen) play();
    }
    video.addEventListener('playing', function () { box.classList.add('is-playing'); });
    var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { near.disconnect(); load(); } }, { rootMargin: '400px 0px' });
    near.observe(box);
    new IntersectionObserver(function (en) {
      onScreen = en[0].isIntersecting;
      if (onScreen) { if (cur) play(); } else if (cur) video.pause();
    }).observe(box);
    if (mql) { var h = function () { if (cur) load(); }; if (mql.addEventListener) mql.addEventListener('change', h); else if (mql.addListener) mql.addListener(h); }
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) video.pause(); else if (onScreen && cur) play(); });
  });

  /* ---------- Hero glints: placed in the art's own coordinate space (desktop vs phone art) ---------- */
  var gbox = doc.querySelector('.art-box--hero');
  if (gbox && win.matchMedia) {
    var gmq = win.matchMedia(gbox.getAttribute('data-mq'));
    var place = function () {
      gbox.querySelectorAll('.glint').forEach(function (g) {
        var d = gmq.matches; g.style.left = g.getAttribute(d ? 'data-x' : 'data-mx') + '%'; g.style.top = g.getAttribute(d ? 'data-y' : 'data-my') + '%';
      });
    };
    place(); if (gmq.addEventListener) gmq.addEventListener('change', place); else if (gmq.addListener) gmq.addListener(place);
  }

  /* ---------- Scroll: progress braid, emblem turn, mobile action bar ---------- */
  var prog = doc.querySelector('.progress span');
  var mbar = doc.querySelector('.mbar');
  var hero = doc.querySelector('.hero, .page-hero, .nf');
  var emblems = doc.querySelectorAll('.emblem-div');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = win.scrollY || win.pageYOffset, h = doc.documentElement.scrollHeight - win.innerHeight;
    if (prog) prog.style.setProperty('--p', h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
    if (mbar) {
      var limit = hero ? hero.offsetTop + hero.offsetHeight * 0.6 : 300;
      mbar.classList.toggle('show', y > limit);
    }
    if (!reduce) {
      emblems.forEach(function (e) {
        var r = e.getBoundingClientRect(); var c = (r.top + r.height / 2 - win.innerHeight / 2) / win.innerHeight;
        if (Math.abs(c) < 1.2) e.style.setProperty('--er', (c * -10).toFixed(2) + 'deg');
      });
    }
  }
  win.addEventListener('scroll', function () { if (!ticking) { ticking = true; win.requestAnimationFrame(onScroll); } }, { passive: true });
  win.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Hours: highlight today ---------- */
  var today = new Date().getDay();
  doc.querySelectorAll('.hours tr[data-d]').forEach(function (tr) { if (+tr.getAttribute('data-d') === today) tr.classList.add('today'); });

  /* ---------- Price finder + booking builder ---------- */
  function money(n) { return '$' + n; }
  doc.querySelectorAll('[data-builder]').forEach(function (form) {
    var mini = form.getAttribute('data-builder') === 'mini';
    var cats = form.querySelectorAll('input[name="category"]');
    var groups = form.querySelectorAll('.svc-group');
    var priceEl = form.querySelector('.sum-price'), nameEl = form.querySelector('.sum-name'), noteEl = form.querySelector('.sum-note');
    var smsA = form.querySelector('[data-sms]'), bookA = form.querySelector('[data-book]');
    var err = form.querySelector('.f-err'), ok = form.querySelector('.b-ok');
    var hidSvc = form.querySelector('input[name="service-chosen"]'), hidPrice = form.querySelector('input[name="price-shown"]');
    var lastPrice = '';

    function activeGroup() {
      var c = form.querySelector('input[name="category"]:checked');
      return c ? form.querySelector('.svc-group[data-cat="' + c.value + '"]') : null;
    }
    function showGroup() {
      var g = activeGroup();
      groups.forEach(function (x) {
        var on = x === g; x.hidden = !on;
        x.querySelectorAll('input').forEach(function (i) { i.disabled = !on; });
      });
      if (g && !g.querySelector('input:checked')) { var f = g.querySelector('input'); if (f) f.checked = true; }
      update();
    }
    function chosen() { var g = activeGroup(); return g ? g.querySelector('input[name="service"]:checked') : null; }
    function update() {
      var s = chosen(); if (!s) return;
      var p = s.getAttribute('data-price'), from = s.getAttribute('data-from') === '1', label = s.getAttribute('data-label');
      var cat = form.querySelector('input[name="category"]:checked');
      var txt = p ? (from ? 'From ' + money(p) : money(p)) : 'Text for price';
      if (priceEl && txt !== lastPrice) {
        priceEl.textContent = txt; lastPrice = txt;
        if (!reduce) { priceEl.classList.remove('tick'); void priceEl.offsetWidth; priceEl.classList.add('tick'); }
      }
      if (nameEl) nameEl.textContent = cat.getAttribute('data-label') + ' · ' + label;
      if (noteEl) noteEl.textContent = s.getAttribute('data-note') || '';
      if (hidSvc) hidSvc.value = cat.getAttribute('data-label') + ' - ' + label;
      if (hidPrice) hidPrice.value = txt;
      if (bookA) bookA.href = 'book.html?cat=' + encodeURIComponent(cat.value) + '&svc=' + encodeURIComponent(s.value) + '#builder';
      if (smsA) smsA.href = smsHref();
    }
    function val(n) { var e = form.querySelector('[name="' + n + '"]'); if (!e) return ''; if (e.type === 'radio') { var c = form.querySelector('[name="' + n + '"]:checked'); return c ? c.value : ''; } return (e.value || '').trim(); }
    function smsHref() {
      var s = chosen(), cat = form.querySelector('input[name="category"]:checked');
      var lines = ['Hi Mimi! I found you on your website and want to book:'];
      if (s && cat) lines.push(cat.getAttribute('data-label') + ' - ' + s.getAttribute('data-label') + ' (' + (hidPrice ? hidPrice.value : '') + ')');
      var d = val('date'), t = val('time'), n = val('name'), m = val('notes');
      if (d) { var dt = new Date(d + 'T12:00:00'); lines.push('Day: ' + (isNaN(dt) ? d : dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))); }
      if (t) lines.push('Time: ' + t);
      if (m) lines.push('Notes: ' + m);
      if (n) lines.push('Name: ' + n);
      lines.push('I understand the $25 deposit holds my spot.');
      return 'sms:' + PHONE + '?&body=' + encodeURIComponent(lines.join('\n'));
    }
    cats.forEach(function (c) { c.addEventListener('change', showGroup); });
    form.addEventListener('change', function (e) { if (e.target.name !== 'category') update(); });
    form.addEventListener('input', function () { if (smsA) smsA.href = smsHref(); });

    /* prefill from ?cat=&svc= */
    try {
      var q = new URLSearchParams(win.location.search), qc = q.get('cat'), qs = q.get('svc');
      if (qc) { var ci = form.querySelector('input[name="category"][value="' + qc.replace(/"/g, '') + '"]'); if (ci) ci.checked = true; }
      showGroup();
      if (qs) { var si = form.querySelector('.svc-group:not([hidden]) input[value="' + qs.replace(/"/g, '') + '"]'); if (si) { si.checked = true; update(); } }
    } catch (e) { showGroup(); }

    /* min date = today */
    var di = form.querySelector('input[type="date"]');
    if (di) { var t = new Date(); var iso = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10); di.min = iso; }

    if (mini) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (err) err.textContent = '';
      var name = val('name'), phone = val('phone');
      if (!name || phone.replace(/\D/g, '').length < 10) {
        if (err) err.textContent = 'Add your name and a 10-digit mobile number so Mimi can text you back.';
        (name ? form.querySelector('[name="phone"]') : form.querySelector('[name="name"]')).focus();
        return;
      }
      var data = new FormData(form); var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });
      var sendBtn = form.querySelector('button[type="submit"]'); if (sendBtn) sendBtn.disabled = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); ok.innerHTML = '<strong>Request sent.</strong> Mimi will text you back to confirm your day, time and the $25 deposit. Need her sooner? Tap "Text Mimi" above.'; })
        .catch(function () { ok.innerHTML = '<strong>Almost there.</strong> Online requests switch on when the site goes live. For now, tap "Text Mimi" and your request is written for you.'; })
        .then(function () { ok.classList.add('show'); if (sendBtn) sendBtn.disabled = false; ok.setAttribute('tabindex', '-1'); ok.focus(); });
    });
  });

  /* ---------- Gallery: filters + lightbox ---------- */
  var grid = doc.querySelector('[data-gallery]');
  if (grid) {
    var fbtns = doc.querySelectorAll('.filters button');
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        fbtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        grid.querySelectorAll('.g-item').forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-cat') === f); if (!it.hidden) it.classList.add('is-in'); });
      });
    });
  }
  var lb = doc.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), list = [], idx = 0, opener = null;
    function visible() { return Array.prototype.filter.call(doc.querySelectorAll('.g-btn'), function (b) { return !b.closest('.g-item').hidden && b.offsetParent !== null; }); }
    function show(i) { list = visible(); idx = (i + list.length) % list.length; var b = list[idx]; lbImg.src = b.getAttribute('data-full'); lbImg.alt = b.querySelector('img').alt; lbCap.textContent = b.querySelector('img').alt; }
    doc.querySelectorAll('.g-btn').forEach(function (b) {
      b.addEventListener('click', function () { opener = b; list = visible(); show(list.indexOf(b)); lb.hidden = false; doc.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); });
    });
    function shut() { lb.hidden = true; doc.body.style.overflow = ''; lbImg.removeAttribute('src'); if (opener) opener.focus(); }
    lb.querySelector('.lb-close').addEventListener('click', shut);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) shut(); });
    var tx = null, ty = null;
    lb.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return; var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; tx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) shut();
    }, { passive: true });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') shut(); else if (e.key === 'ArrowLeft') show(idx - 1); else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') { var f = lb.querySelectorAll('button'); var a = f[0], z = f[f.length - 1]; if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
  }

  /* ---------- Services chips: highlight the section in view ---------- */
  var chips = doc.querySelectorAll('.chips-nav a');
  if (chips.length && hasIO) {
    var map = {}; chips.forEach(function (c) { map[c.getAttribute('href').slice(1)] = c; });
    var cio = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { chips.forEach(function (c) { c.classList.remove('is-on'); }); var c = map[en.target.id]; if (c) { c.classList.add('is-on'); if (c.scrollIntoView && !reduce) { var ul = c.parentNode.parentNode; ul.scrollTo({ left: c.offsetLeft - 20, behavior: 'smooth' }); } } } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    doc.querySelectorAll('.cat[id]').forEach(function (s) { cio.observe(s); });
  }
})();
