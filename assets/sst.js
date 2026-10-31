/* =========================================================
   S.S Trading Company — site features (served from GitHub)
   Settings come from window.SST, set in the Blogger theme.
   ========================================================= */
(function () {
  'use strict';
  var C = window.SST || {};
  var WA = C.whatsapp || '';     // set in the Blogger theme (window.SST)
  var EMAIL = C.email || '';
  var NAME = C.name || 'S.S Trading Company';
  /* Folder this script was loaded from: catalog.json and products/ sit next to it */
  var ME = document.currentScript || document.querySelector('script[src*="sst.js"]');
  var BASE = ME ? ME.src.replace(/sst\.js.*$/, '') : '';

  var ICON_WA = '<svg class="i i-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
  var ICON_MAIL = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  var ICON_SEARCH = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function waUrl(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  /* Open WhatsApp in a new tab; in-app browsers (WhatsApp, Instagram, Facebook) block that, so fall back to this tab */
  function openWa(url) {
    var w = null;
    try { w = window.open(url, '_blank'); } catch (e) {}
    if (w) { try { w.opener = null; } catch (e) {} } else { location.href = url; }
  }

  /* ---- WhatsApp links: <a data-wa="Bearings"> opens a chat asking about that item.
          Every WhatsApp button gets the WhatsApp logo, including buttons pasted into Blogger pages. ---- */
  function waLinks(root) {
    $$('[data-wa], [data-wa-text]', root).forEach(function (a) {
      var item = a.getAttribute('data-wa'), text = a.getAttribute('data-wa-text');
      var msg = text ? (WA_TEXT[text] || text)
        : item ? 'Hello ' + NAME + ', I need a price / availability for: ' + item
        : 'Hello ' + NAME + ', I have an enquiry.';
      a.href = waUrl(msg);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    $$('.btn-wa, .m-wa', root).forEach(function (b) {
      var old = $('svg', b);
      if (old && old.classList.contains('i-wa')) return;
      if (old) old.parentNode.removeChild(old);
      b.insertAdjacentHTML('afterbegin', ICON_WA);
    });
  }

  /* ---- Quote form: drop <div data-sst-quote></div> anywhere (pages, posts) ---- */
  var qid = 0;
  function quoteForm(box) {
    qid++;
    var given = box.getAttribute('data-item') || new URLSearchParams(location.search).get('item') || '';
    var f = function (n, label, type, opt) {
      opt = opt || {};
      var id = 'q' + qid + '-' + n;
      var input = type === 'textarea'
        ? '<textarea id="' + id + '" name="' + n + '" rows="3" placeholder="' + esc(opt.ph || '') + '">' + esc(opt.val || '') + '</textarea>'
        : '<input id="' + id + '" name="' + n + '" type="' + type + '" placeholder="' + esc(opt.ph || '') + '" value="' + esc(opt.val || '') + '"' + (opt.auto ? ' autocomplete="' + opt.auto + '"' : '') + '/>';
      return '<label class="field' + (opt.full ? ' full' : '') + '" for="' + id + '"><span>' + label + (opt.req ? '' : ' <small>optional</small>') + '</span>' + input + '</label>';
    };
    var dealer = location.hash === '#dealer' || box.getAttribute('data-mode') === 'dealer';
    box.innerHTML =
      '<div class="qmode" role="group" aria-label="Who is buying"><button type="button" data-mode="retail">Single parts</button><button type="button" data-mode="dealer">Dealer / bulk</button></div>' +
      '<form class="qform" novalidate>' +
      f('name', 'Your name', 'text', { req: 1, auto: 'name', ph: 'e.g. Rajesh Kumar' }) +
      f('phone', 'Mobile number', 'tel', { req: 1, auto: 'tel', ph: '10-digit mobile' }) +
      f('firm', 'Company / firm', 'text', { auto: 'organization', ph: 'Firm name' }) +
      f('city', 'City', 'text', { auto: 'address-level2', ph: 'City' }) +
      f('part', 'Part / product needed', 'textarea', { req: 1, full: 1, val: given, ph: 'Part name + machine model, e.g. Gear cover, Shaktiman' }) +
      f('qty', 'Quantity', 'text', { full: 1, ph: 'e.g. 20 pcs' }) +
      f('gstin', 'GSTIN', 'text', { full: 1, ph: 'For your GST invoice' }) +
      '<div class="qform-actions full">' +
      '<button class="btn btn-wa" type="submit" value="wa">' + ICON_WA + ' Send on WhatsApp</button>' +
      '<button class="btn btn-line" type="submit" value="mail">' + ICON_MAIL + ' Email</button>' +
      '</div>' +
      '<p class="qform-msg full" role="alert" hidden></p>' +
      '<p class="qform-note full">We usually reply within working hours on the same day.</p>' +
      '</form>';
    var form = $('form', box), msg = $('.qform-msg', box);
    /* read fields by name: form.elements.item would be the collection's item() method, not a field */
    var field = function (k) { return form.querySelector('[name="' + k + '"]'); };
    var via = 'wa';
    $$('button[type=submit]', form).forEach(function (b) { b.addEventListener('click', function () { via = b.value; }); });
    var label = function (k, text, req) { $('span', field(k).closest('.field')).innerHTML = text + (req ? '' : ' <small>optional</small>'); };
    var setMode = function (d) {
      dealer = d;
      $$('.qmode button', box).forEach(function (b) { b.classList.toggle('is-on', (b.getAttribute('data-mode') === 'dealer') === d); });
      label('firm', d ? 'Firm / shop name' : 'Company / firm', d);
      label('city', 'City', d);
      label('part', d ? 'Parts and quantities you need' : 'Part / product needed', true);
      label('qty', d ? 'Monthly requirement' : 'Quantity', false);
      field('qty').placeholder = d ? 'e.g. 50 gear covers a month' : 'e.g. 20 pcs';
      field('gstin').closest('.field').hidden = !d;
    };
    $$('.qmode button', box).forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode') === 'dealer'); }); });
    setMode(dealer);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {};
      ['name', 'phone', 'firm', 'city', 'part', 'qty', 'gstin'].forEach(function (k) { v[k] = (field(k).value || '').trim(); });
      var bad = [];
      if (!v.name) bad.push('name');
      if (!/^[0-9+\-\s]{10,15}$/.test(v.phone)) bad.push('phone');
      if (dealer && !v.firm) bad.push('firm');
      if (dealer && !v.city) bad.push('city');
      if (!v.part) bad.push('part');
      $$('.field', form).forEach(function (l) { l.classList.remove('err'); });
      if (bad.length) {
        bad.forEach(function (k) { field(k).closest('.field').classList.add('err'); });
        msg.textContent = dealer ? 'Please fill in your name, mobile, firm, city and the parts you need.'
          : 'Please fill in your name, a 10-digit mobile number and the part you need.';
        msg.hidden = false;
        field(bad[0]).focus();
        return;
      }
      msg.hidden = true;
      var lines = [
        (dealer ? 'Dealer / bulk enquiry — ' : 'Quote request — ') + NAME,
        '',
        'Name: ' + v.name,
        'Mobile: ' + v.phone,
        v.firm ? 'Firm: ' + v.firm : '',
        v.city ? 'City: ' + v.city : '',
        'Requirement: ' + v.part,
        v.qty ? (dealer ? 'Monthly requirement: ' : 'Quantity: ') + v.qty : '',
        dealer && v.gstin ? 'GSTIN: ' + v.gstin : ''
      ].filter(function (x, i) { return x || i === 1; });
      var text = lines.join('\n');
      if (window.gtag) window.gtag('event', 'generate_lead', { method: via });
      if (via === 'mail') {
        location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent((dealer ? 'Dealer enquiry: ' : 'Quote request: ') + v.part.slice(0, 60)) + '&body=' + encodeURIComponent(text);
      } else {
        openWa(waUrl(text));
      }
    });
  }

  /* ---- Lightbox for catalogue photos: one photo, or several with previous / next ---- */
  var lb, lbList = [], lbAt = 0, lbAlt = '';
  function lbShow() {
    var img = $('img', lb);
    img.src = lbList[lbAt];
    img.alt = lbAlt + (lbList.length > 1 ? ' (photo ' + (lbAt + 1) + ' of ' + lbList.length + ')' : '');
    $('.lb-count', lb).textContent = lbList.length > 1 ? (lbAt + 1) + ' / ' + lbList.length : '';
    lb.classList.toggle('multi', lbList.length > 1);
  }
  function lbStep(d) { lbAt = (lbAt + d + lbList.length) % lbList.length; lbShow(); }
  function openLightbox(list, alt) {
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.innerHTML = '<img alt=""/><button class="lb-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
        '<button class="lb-next" type="button" aria-label="Next photo">&#8250;</button><span class="lb-count"></span>' +
        '<button class="lb-close" type="button" aria-label="Close">&#215;</button>';
      lb.addEventListener('click', function (e) {
        if (e.target.closest('.lb-prev')) return lbStep(-1);
        if (e.target.closest('.lb-next') || (e.target.tagName === 'IMG' && lbList.length > 1)) return lbStep(1);
        lb.classList.remove('open');
      });
      var x0 = null;
      lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (x0 === null || lbList.length < 2) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) lbStep(dx < 0 ? 1 : -1);
        x0 = null;
      });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') lb.classList.remove('open');
        if (e.key === 'ArrowRight' && lbList.length > 1) lbStep(1);
        if (e.key === 'ArrowLeft' && lbList.length > 1) lbStep(-1);
      });
      document.body.appendChild(lb);
    }
    lbList = list; lbAt = 0; lbAlt = alt || '';
    lbShow();
    lb.classList.add('open');
  }

  /* ---- Products catalogue: built from catalog.json, with filter chips, search and an enquiry list ---- */
  function renderCatalog(box, data) {
    var chips = '<button class="chip is-on" type="button" data-filter="all">All parts <b>' + data.parts.length + '</b></button>' +
      data.machines.map(function (m) {
        return '<button class="chip" type="button" data-filter="' + esc(m.id) + '">' + esc(m.name) + ' <b>' + m.count + '</b></button>';
      }).join('');
    var cards = data.parts.map(function (p) {
      var imgs = p.imgs.map(function (i) { return BASE + 'products/' + i; });
      var more = imgs.length > 1 ? '<span class="part-more">' + imgs.length + ' photos</span>' : '';
      return '<article class="part" data-cat="' + esc(p.machines.join(' ')) + '" data-name="' + esc(p.label) + '" data-imgs="' + esc(imgs.join('|')) + '">' +
        '<button class="part-img" type="button" aria-label="Enlarge photo of ' + esc(p.label) + '"><img src="' + esc(imgs[0]) + '" alt="' + esc(p.label) + '" loading="lazy" width="400" height="400">' + more + '</button>' +
        '<div class="part-body"><h3>' + esc(p.name) + '</h3><p class="fits">' + esc(p.fits) + '</p>' +
        '<div class="part-actions"><a class="btn btn-wa btn-sm" data-wa="' + esc(p.label) + '" href="#">Enquire</a>' +
        '<button class="btn btn-line btn-sm part-add" type="button" aria-pressed="false">+ List</button></div></div></article>';
    }).join('');
    box.innerHTML =
      '<div class="cat-tools"><div class="chips" role="toolbar" aria-label="Filter by machine">' + chips + '</div>' +
      '<label class="cat-search">' + ICON_SEARCH + '<input type="search" placeholder="Search parts, e.g. gear cover, U bolt" aria-label="Search parts"></label></div>' +
      '<div class="parts-grid">' + cards + '</div>' +
      '<p class="empty-note" hidden>No part matches. Send us the part name or a photo on <a data-wa="" href="#">WhatsApp</a> and we&#39;ll find it.</p>';
    waLinks(box);
  }

  function initCatalog(box) {
    var parts = $$('.part', box), chips = $$('.chip', box), q = $('.cat-search input', box), none = $('.empty-note', box);
    var current = 'all';
    var apply = function () {
      var words = (q.value || '').toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
      parts.forEach(function (p) {
        var hay = (p.getAttribute('data-name') + ' ' + $('.fits', p).textContent).toLowerCase();
        var ok = (current === 'all' || (' ' + p.getAttribute('data-cat') + ' ').indexOf(' ' + current + ' ') >= 0) &&
          words.every(function (w) { return hay.indexOf(w) >= 0; });
        p.hidden = !ok;
        if (ok) shown++;
      });
      none.hidden = shown > 0;
    };
    var pick = function (id, scroll) {
      if (!chips.some(function (c) { return c.getAttribute('data-filter') === id; })) id = 'all';
      current = id;
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter') === id;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on && c.parentNode.scrollWidth > c.parentNode.clientWidth) {
          c.parentNode.scrollLeft = c.offsetLeft - 16;   // keep the selected chip in view on phones
        }
      });
      apply();
      if (scroll) box.scrollIntoView({ block: 'start' });
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var id = c.getAttribute('data-filter');
        pick(id);
        try { history.replaceState(null, '', id === 'all' ? location.pathname : '#' + id); } catch (e) {}
      });
    });
    q.addEventListener('input', apply);
    var given = new URLSearchParams(location.search).get('q');
    if (given) { q.value = given; apply(); }
    /* /p/products.html#rotavator opens with that machine selected */
    if (location.hash.length > 1) pick(location.hash.slice(1), true);
    window.addEventListener('hashchange', function () { pick(location.hash.slice(1) || 'all', true); });

    parts.forEach(function (p) {
      $('.part-img', p).addEventListener('click', function () {
        var list = (p.getAttribute('data-imgs') || $('img', p).src).split('|');
        openLightbox(list, p.getAttribute('data-name'));
      });
    });

    /* Enquiry list: tick several parts, send them in one WhatsApp message */
    var KEY = 'sst-list', list = [];
    try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
    var bar = document.createElement('div');
    bar.className = 'elist';
    bar.innerHTML = '<span class="elist-n"></span><button class="clear" type="button">Clear</button><a class="btn btn-wa btn-sm" href="#">' + ICON_WA + ' Send list</a>';
    document.body.appendChild(bar);
    var send = $('a', bar);
    var sync = function () {
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
      parts.forEach(function (p) {
        var on = list.indexOf(p.getAttribute('data-name')) >= 0;
        p.classList.toggle('in-list', on);
        var b = $('.part-add', p);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.textContent = on ? '✓ Added' : '+ List';
      });
      $('.elist-n', bar).textContent = list.length + (list.length === 1 ? ' part' : ' parts') + ' in your list';
      bar.classList.toggle('show', list.length > 0);
      send.href = waUrl('Hello ' + NAME + ', please send price / availability for:\n' +
        list.map(function (n, i) { return (i + 1) + '. ' + n; }).join('\n'));
    };
    parts.forEach(function (p) {
      $('.part-add', p).addEventListener('click', function () {
        var n = p.getAttribute('data-name'), i = list.indexOf(n);
        if (i >= 0) list.splice(i, 1); else list.push(n);
        sync();
      });
    });
    $('.clear', bar).addEventListener('click', function () { list = []; sync(); });
    send.target = '_blank';
    send.rel = 'noopener';
    sync();
  }

  /* ---- Language lines: <p class="tri"> shows English, Hindi and Punjabi one after another ---- */
  var triTimer = null;
  function rotateLines() {
    $$('.tri:not(.rot)').forEach(function (p) {
      var kids = $$('span[lang]', p);
      if (kids.length < 2) return;
      p.classList.add('rot');
      kids.forEach(function (k, i) { k.classList.toggle('is-on', i === 0); });
    });
    if (triTimer) return;
    triTimer = setInterval(function () {
      if (document.hidden) return;                 // pause while the tab isn't visible
      $$('.tri.rot').forEach(function (p) {
        var kids = $$('span[lang]', p), at = kids.indexOf($('.is-on', p));
        kids[at].classList.remove('is-on');
        kids[(at + 1) % kids.length].classList.add('is-on');
      });
    }, 2600);
  }

  /* ---- Ready-made WhatsApp messages: <a data-wa-text="photo|dealer"> ---- */
  var WA_TEXT = {
    photo: 'Hello ' + NAME + ', I am sending a photo of the part I need. Please tell me the price and availability.\nMachine (brand / model): ',
    dealer: 'Hello ' + NAME + ', I am a dealer / bulk buyer. Please share your dealer rates.\nFirm: \nCity: '
  };

  /* ---- Help button: quick links, and the guided tour ---- */
  var TOURS = {
    home: [
      ['#quick', 'Request a quote, WhatsApp or call our sales desk from here.'],
      ['.hero .btn-wa', 'Not sure of the part name? Send a photo of it on WhatsApp.'],
      ['#dealers', 'Dealers and workshops can request special rates here.'],
      ['.faq-toggle', 'Answers to common questions are here.'],
      ['.help-btn', 'Need help any time? Tap here.']
    ],
    products: [
      ['.chips', 'Tap your machine to see only its parts.'],
      ['.cat-search', 'Or search by name, e.g. “gear cover” or “U bolt”.'],
      ['.part:not([hidden]) .part-add', 'Tap “+ List” on every part you need…'],
      ['.part:not([hidden]) .btn-wa', '…or tap Enquire to ask about one part on WhatsApp.']
    ],
    quote: [
      ['.qmode', 'Buying for a shop or workshop? Choose Dealer / bulk.'],
      ['.qform-actions', 'Send your request on WhatsApp or by email. We reply the same working day.']
    ]
  };
  function pageKind() {
    if (document.body.classList.contains('is-home')) return 'home';
    if ($('[data-sst-catalog] .part')) return 'products';
    if ($('.quote-page .qform')) return 'quote';
    return '';
  }
  function visible(el) { var r = el && el.getBoundingClientRect(); return r && r.width > 0 && r.height > 0; }
  function tour(kind) {
    var steps = (TOURS[kind] || []).filter(function (s) { return visible($(s[0])); });
    if (!steps.length) return;
    var dim = document.createElement('div'), spot = document.createElement('div'), tip = document.createElement('div');
    dim.className = 'tour-dim'; spot.className = 'tour-spot'; tip.className = 'tour-tip';
    tip.setAttribute('role', 'dialog');
    dim.appendChild(spot); document.body.appendChild(dim); document.body.appendChild(tip);
    var at = 0;
    var end = function () {
      dim.remove(); tip.remove();
      window.removeEventListener('resize', place); window.removeEventListener('scroll', place);
      try { localStorage.setItem('sst-tour-' + kind, '1'); } catch (e) {}
    };
    var place = function () {
      var el = $(steps[at][0]); if (!el) return;
      var r = el.getBoundingClientRect(), pad = 6;
      spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
      spot.style.width = (r.width + 2 * pad) + 'px'; spot.style.height = (r.height + 2 * pad) + 'px';
      var below = r.bottom + 14, tw = tip.offsetWidth, th = tip.offsetHeight;
      var bar = $('.mbar'), barH = bar && visible(bar) ? bar.offsetHeight : 0;
      var top = below + th < innerHeight - barH ? below
        : r.top - th - 14 > 12 ? r.top - th - 14
        : innerHeight - barH - th - 12;            // tall target (e.g. on phones): tip at the bottom of the screen
      tip.style.top = top + 'px';
      tip.style.left = Math.min(Math.max(16, r.left), innerWidth - tw - 16) + 'px';
    };
    var show = function () {
      var el = $(steps[at][0]);
      el.scrollIntoView({ block: 'center', behavior: 'instant' });   // jump, so the tip is placed at the final position
      tip.innerHTML = '<span class="tour-n">' + (at + 1) + ' of ' + steps.length + '</span><p>' + esc(steps[at][1]) + '</p>' +
        '<div class="tour-nav"><button class="tour-skip" type="button">Skip tour</button>' +
        (at ? '<button class="btn btn-line" type="button" data-go="-1">Back</button>' : '') +
        '<button class="btn btn-navy" type="button" data-go="1">' + (at === steps.length - 1 ? 'Done' : 'Next') + '</button></div>';
      setTimeout(place, 60);
    };
    tip.addEventListener('click', function (e) {
      if (e.target.closest('.tour-skip')) return end();
      var go = e.target.closest('[data-go]');
      if (!go) return;
      at += +go.getAttribute('data-go');
      if (at >= steps.length) return end();
      show();
    });
    window.addEventListener('resize', place); window.addEventListener('scroll', place, { passive: true });
    show();
  }
  function helpButton() {
    var kind = pageKind();
    var btn = document.createElement('button');
    btn.className = 'help-btn'; btn.type = 'button'; btn.innerHTML = '<b>?</b> Help';
    btn.setAttribute('aria-expanded', 'false');
    var panel = document.createElement('div');
    panel.className = 'help-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Help');
    panel.innerHTML = '<button class="help-close" type="button" aria-label="Close">&#215;</button>' +
      '<h3>Help</h3><p class="tri"><span lang="en">How can we help?</span><span lang="hi">हम कैसे मदद करें?</span><span lang="pa">ਅਸੀਂ ਕਿਵੇਂ ਮਦਦ ਕਰੀਏ?</span></p>' +
      (TOURS[kind] ? '<button class="hp" type="button" data-tour="1">&#9654; Show me how this page works</button>' : '') +
      '<a class="hp-wa" data-wa-text="photo" href="#">' + ICON_WA + ' Send a part photo on WhatsApp</a>' +
      '<a href="tel:+918528686005">&#9742; Call 85286 86005</a>' +
      '<a href="/p/get-quote.html">&#9998; Get a quote</a>' +
      '<a href="/p/get-quote.html#dealer">&#9733; Dealer / bulk enquiry</a>' +
      '<a href="/#faq">? Questions buyers ask</a>';
    document.body.appendChild(btn); document.body.appendChild(panel);
    waLinks(panel);
    rotateLines();
    var toggle = function (open) { panel.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.addEventListener('click', function () { toggle(!panel.classList.contains('open')); });
    $('.help-close', panel).addEventListener('click', function () { toggle(false); });
    var t = $('[data-tour]', panel);
    if (t) t.addEventListener('click', function () { toggle(false); tour(kind); });
    /* first visit: show the tour once */
    var seen = null;
    try { seen = localStorage.getItem('sst-tour-' + kind); } catch (e) { seen = '1'; }
    if (TOURS[kind] && !seen) setTimeout(function () { tour(kind); }, 1500);
  }

  /* ---- Start everything once the page content is in place ---- */
  function boot() {
    waLinks();
    $$('[data-sst-quote]').forEach(quoteForm);

    /* mobile menu */
    var tog = $('.nav-toggle'), nav = $('.nav');
    if (tog && nav) {
      tog.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
    }
    /* highlight the current page in the menu */
    $$('.nav a').forEach(function (a) {
      var p = a.getAttribute('href');
      if (p && p !== '/' && location.pathname.indexOf(p.replace(/#.*/, '')) === 0 && p.indexOf('#') < 0) a.classList.add('active');
    });

    /* back to top */
    var top = $('.to-top');
    if (top) {
      window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 600); }, { passive: true });
      top.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
    }

    /* year in footer */
    $$('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });

    /* product posts on label pages: use the post's first image */
    $$('.prod-img[data-img]').forEach(function (d) {
      d.style.backgroundImage = 'url("' + d.getAttribute('data-img') + '")';
      d.innerHTML = '';
    });

    /* questions buyers ask: open the drawer when a link points to it */
    var faq = $('#faq .faq-drawer');
    if (faq) {
      var openFaq = function () {
        if (location.hash !== '#faq') return;
        faq.open = true;
        faq.scrollIntoView({ block: 'start' });
      };
      openFaq();
      window.addEventListener('hashchange', openFaq);
      document.addEventListener('click', function (e) {   // the Help panel link, even when #faq is already in the address
        var l = e.target.closest('a[href="/#faq"], a[href="#faq"]');
        if (!l) return;
        e.preventDefault();
        if (location.hash !== '#faq') history.pushState(null, '', '#faq');
        openFaq();
      });
    }
    rotateLines();

    /* products catalogue */
    var cat = $('[data-sst-catalog]');
    if (cat) {
      if ($('.part', cat)) {
        initCatalog(cat);
      } else {
        fetch(BASE + 'catalog.json', { cache: 'no-cache' })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (data) { renderCatalog(cat, data); initCatalog(cat); helpButton(); })
          .catch(function () {
            cat.innerHTML = '<p class="empty-note">The parts list could not load. Please refresh the page, or <a data-wa="" href="#">ask us on WhatsApp</a>.</p>';
            waLinks(cat);
            helpButton();
          });
      }
    } else {
      helpButton();
    }
  }

  /* Safety net: if Blogger shows a page without its content (the posts gadget missing from the layout),
     load that page's content from Blogger's own page feed, then start as normal. */
  function start() {
    var area = $('.blog-area');
    var emptyPage = document.body.classList.contains('is-page') && area && !$('.post-body', area);
    if (!emptyPage) return boot();
    fetch('/feeds/pages/default?alt=json&max-results=100')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var here = location.pathname;
        var entry = (d.feed.entry || []).filter(function (e) {
          return e.link.some(function (l) { return l.rel === 'alternate' && new URL(l.href).pathname === here; });
        })[0];
        if (entry) area.innerHTML = '<article class="post-body entry-content">' + entry.content.$t + '</article>';
      })
      .catch(function () {})
      .then(boot);
  }
  start();
})();
