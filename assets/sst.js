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

  var ICON_ARROW = '<svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
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
      /* "gear cover, u bolt" shows either: commas separate alternatives, words within one must all match */
      var alts = (q.value || '').toLowerCase().split(',').map(function (a) { return a.split(/\s+/).filter(Boolean); })
        .filter(function (a) { return a.length; }), shown = 0;
      parts.forEach(function (p) {
        var hay = (p.getAttribute('data-name') + ' ' + $('.fits', p).textContent).toLowerCase();
        var ok = (current === 'all' || (' ' + p.getAttribute('data-cat') + ' ').indexOf(' ' + current + ' ') >= 0) &&
          (!alts.length || alts.some(function (ws) { return ws.every(function (w) { return hay.indexOf(w) >= 0; }); }));
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
    /* /p/products.html?part=rotavator-rotor opens with that part in view (the home page photo strip links here) */
    var want = new URLSearchParams(location.search).get('part');
    var hit = want && parts.filter(function (p) { return (p.getAttribute('data-imgs') || '').indexOf('/products/' + want + '.') >= 0; })[0];
    if (hit) {
      if (hit.hidden) pick('all');
      hit.classList.add('is-target');
      var toPart = function () { hit.scrollIntoView({ block: 'center', behavior: 'instant' }); };
      setTimeout(toPart, 80);
      window.addEventListener('load', toPart);   // again once fonts and photos have settled the layout
    }

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
      (WA ? fillTokens('<a href="{{tel}}">&#9742; Call {{show}}</a>') : '') +
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

  /* ---- Language: English, Hindi or Punjabi. Our own everyday wording is in sst-lang.js,
     loaded only when a visitor picks हिंदी or ਪੰਜਾਬੀ; the choice is remembered on this device. ---- */
  var LANGS = [['en', 'English'], ['hi', 'हिंदी'], ['pa', 'ਪੰਜਾਬੀ']];
  var LANG = 'en';
  try { LANG = localStorage.getItem('sst-lang') || 'en'; } catch (e) {}
  if (!/^(hi|pa)$/.test(LANG)) LANG = 'en';
  /* names, part names, the trilingual lines and the chat picture stay as they are */
  var KEEP = '.tri, .brand-name, .brand-tag, .brand-tile b, .bt, .brand-logo, .part h3, .phone, .lang-switch, script, style, textarea, [data-tr]';
  var TR_TAGS = 'h1, h2, h3, h4, p, li, summary, dt, dd, a, button, span, b, small, label, option';
  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function tr(root, L) {
    var k = LANG === 'hi' ? 0 : 1;
    var swap = function (t) {
      if (L.words[t]) return L.words[t][k];
      for (var i = 0; i < L.patterns.length; i++) {
        if (L.patterns[i][0].test(t)) return t.replace(L.patterns[i][0], L.patterns[i][1][k]);
      }
      return null;
    };
    /* whole elements first, so a sentence with bold words inside stays one sentence; icons keep their place */
    var els = root.nodeType === 1 && root.matches(TR_TAGS) ? [root] : [];
    els.concat($$(TR_TAGS, root)).forEach(function (el) {
      if (el.closest(KEEP) || el.querySelector('input, textarea, select, button')) return;   // never wipe a form field
      var w = L.words[norm(el.textContent)];
      if (!w) return;
      var before = '', after = '', seen = false;
      Array.prototype.slice.call(el.childNodes).forEach(function (c) {
        if (c.nodeType === 1 && /^(svg|img)$/i.test(c.tagName)) { if (seen) after += c.outerHTML; else before += c.outerHTML; }
        else if (norm(c.textContent)) seen = true;
      });
      el.innerHTML = before + (before ? ' ' : '') + w[k] + (after ? ' ' : '') + after;
      el.setAttribute('data-tr', '');
    });
    /* then single pieces of text, e.g. a button label next to a count */
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, todo = [];
    while ((n = walk.nextNode())) todo.push(n);
    todo.forEach(function (t) {
      var v = norm(t.nodeValue), out;
      if (!v || !t.parentNode || t.parentNode.closest(KEEP)) return;
      if ((out = swap(v)) !== null) t.nodeValue = t.nodeValue.replace(t.nodeValue.trim(), out);
    });
    if (root.nodeType === 1) $$('[placeholder]', root).forEach(function (f) {
      var out = swap(f.getAttribute('placeholder'));
      if (out !== null) f.setAttribute('placeholder', out);
    });
  }
  function langLive(L) {
    tr(document.body, L);
    /* parts list, quote form, help panel and tour are built later: translate them as they appear */
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        var el = m.target.nodeType === 1 ? m.target : m.target.parentNode;
        if (!el || !el.isConnected || el.closest('.lang-switch')) return;
        el.removeAttribute('data-tr');
        tr(el, L);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder'] });
  }
  function langSwitch() {
    /* a choice made with the earlier Google translation is cleared */
    if (/googtrans=/.test(document.cookie)) {
      var host = location.hostname.replace(/^www\./, '');
      ['', ';domain=' + host, ';domain=.' + host].forEach(function (d) {
        document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT' + d;
      });
    }
    var bar = $('.topbar .container');
    if (!bar) return;
    var box = document.createElement('div');
    box.className = 'lang-switch';
    box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Language');
    box.innerHTML = LANGS.map(function (l) {
      return '<button type="button" lang="' + l[0] + '" data-lang="' + l[0] + '" aria-pressed="' + (l[0] === LANG) + '"' +
        (l[0] === LANG ? ' class="is-on"' : '') + '>' + l[1] + '</button>';
    }).join('');
    bar.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]');
      if (!b || b.getAttribute('data-lang') === LANG) return;
      try { localStorage.setItem('sst-lang', b.getAttribute('data-lang')); } catch (e2) {}
      location.reload();
    });
  }
  function langStart() {
    if (LANG === 'en') return;
    document.documentElement.lang = LANG;
    var s = document.createElement('script');
    s.src = BASE + 'sst-lang.js';
    s.onload = function () { if (window.SST_LANG) langLive(window.SST_LANG); };
    document.head.appendChild(s);
  }

  /* ---- Start everything once the page content is in place ---- */
  function boot() {
    langSwitch();
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

    /* home photo strip: each photo opens its own part (also covers a theme pasted before these links) */
    $$('.rib').forEach(function (a) {
      var m = ($('img', a) || {}).src && $('img', a).src.match(/\/products\/([^\/.]+)\.\w+$/);
      if (m) a.href = '/p/products.html?part=' + m[1];
    });

    /* brands page: link each brand to the parts in the list made for it */
    var brandTiles = $$('.brand-tile[data-brand]');
    if (brandTiles.length) {
      fetch(BASE + 'catalog.json', { cache: 'no-cache' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          brandTiles.forEach(function (t) {
            var term = t.getAttribute('data-brand');   // e.g. "Shaktiman, SRT": parts named with either
            var names = term.toLowerCase().split(/\s*,\s*/);
            var n = data.parts.filter(function (p) {
              var nm = p.name.toLowerCase();
              return names.some(function (x) { return nm.indexOf(x) >= 0; });
            }).length;
            if (!n) return;
            var a = document.createElement('a');
            a.className = 'brand-more';
            a.href = '/p/products.html?q=' + encodeURIComponent(term);
            a.innerHTML = 'View ' + n + (n === 1 ? ' part' : ' parts') + ' ' + ICON_ARROW;
            var acts = $('.brand-acts', t);
            acts.insertBefore(a, acts.firstChild);   // above the button, so the buttons line up across a row
          });
        })
        .catch(function () {});
    }

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
    langStart();
  }

  /* ---- Pages from GitHub: a Blogger page holds only <div data-sst-page="about-us">short fallback</div>,
          and the real content comes from pages/about-us.html next to this script. Edit that file and push:
          the live page changes, nothing to paste in Blogger.
          Phone numbers and email stay in the theme (window.SST), so the public repo has none. In page files use
          {{base}} = this folder, {{email}}, and for a number: {{tel}} {{wa}} {{show}} (main WhatsApp) or
          {{tel:key}} {{wa:key}} {{show:key}} for window.SST.phones[key]. ---- */
  function fillTokens(html) {
    return html.replace(/\{\{(\w+)(?::(\w+))?\}\}/g, function (m, kind, who) {
      if (kind === 'base') return BASE;
      if (kind === 'email') return EMAIL;
      var num = who ? (C.phones || {})[who] : WA;
      if (!num) return kind === 'show' ? '' : '/p/contact-us.html';
      if (kind === 'tel') return 'tel:+' + num;
      if (kind === 'wa') return 'https://wa.me/' + num;
      if (kind === 'show') return num.replace(/^91(?=\d{10}$)/, '').replace(/^(\d{5})(\d{5})$/, '$1 $2');
      return m;
    });
  }
  function loadPages(done) {
    var slots = $$('[data-sst-page]'), left = slots.length;
    if (!left) return done();
    slots.forEach(function (el) {
      el.classList.add('is-loading');   // shimmer placeholder (sst.css) until the content arrives
      fetch(BASE + 'pages/' + el.getAttribute('data-sst-page') + '.html', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (html) {
          el.innerHTML = fillTokens(html);
          $$('script', el).forEach(function (old) {   // scripts added with innerHTML don't run: recreate them
            var s = document.createElement('script');
            Array.prototype.forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
            s.text = old.text;
            old.parentNode.replaceChild(s, old);
          });
          el.classList.add('is-loaded');   // sections fade in one after another
        })
        .catch(function () { el.classList.add('is-failed'); })   // keep the fallback text that is in the Blogger page
        .then(function () { el.classList.remove('is-loading'); if (--left === 0) done(); });
    });
  }

  /* Safety net: if Blogger shows a page without its content (the posts gadget missing from the layout),
     load that page's content from Blogger's own page feed, then start as normal. */
  function start() {
    var area = $('.blog-area');
    var emptyPage = document.body.classList.contains('is-page') && area && !$('.post-body', area);
    if (!emptyPage) return loadPages(boot);
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
      .then(function () { loadPages(boot); });
  }
  start();
})();

/* "Add as a preferred source on Google" (Google Search Top Stories): Google's official button at the top of the footer.
   Docs: developers.google.com/search/docs/appearance/preferred-sources. If Google's script can't load (blocked or offline),
   a plain link to the same Google page is shown instead. */
;(function () {
  function add() {
    var foot = document.querySelector('footer');
    if (!foot || document.querySelector('[google-add-preferred-source-btn]')) return;
    var root = document.documentElement, t = (root.getAttribute('data-theme') || root.className || '') + ' ' + (document.body.className || '');
    var dark = /dark|black/.test(t) || (!/light|sepia/.test(t) && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var box = document.createElement('div'), btn = document.createElement('div');
    box.className = 'pref-source'; box.style.cssText = 'display:flex;justify-content:center;min-height:40px;padding:0 12px 28px;margin:0 auto 36px;max-width:1200px;' +
      'border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent)';   // its own band, clear of the link columns
    btn.setAttribute('google-add-preferred-source-btn', ''); btn.setAttribute('data-theme', dark ? 'dark' : 'light');
    box.appendChild(btn); foot.insertBefore(box, foot.firstChild);
    var s = document.createElement('script'); s.async = true; s.src = 'https://news.google.com/swg/js/v1/publisher.js';
    document.head.appendChild(s);
    setTimeout(function () {   // fallback: Google's deep link
      if (btn.childNodes.length) return;
      var a = document.createElement('a');
      a.href = 'https://www.google.com/preferences/source?q=' + encodeURIComponent(location.hostname.replace(/^www\./, ''));
      a.target = '_blank'; a.rel = 'noopener'; a.textContent = '★ Add us as a preferred source on Google';
      a.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border:1px solid currentColor;border-radius:999px;font:600 14px/1.2 system-ui,sans-serif;text-decoration:none;color:inherit;opacity:.85';
      btn.appendChild(a);
    }, 6000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();

/* Header: a compact "Preferred source on Google" button (Google's G; the words show on wide screens). It opens Google's own
   page for adding this site as a preferred source, the deep link Google documents for custom buttons. */
;(function () {
  function add() {
    if (document.querySelector('.pref-src-head')) return;
    var box = document.querySelector('.nav-actions, .ns-actions'), before = null;
    if (box) before = box.querySelector('[aria-label*="dark" i], [aria-label*="light" i]') || box.firstElementChild;
    else { var cta = document.querySelector('header .header-cta'); if (!cta) return; box = cta.parentNode; before = cta; }
    var navLink = !document.querySelector('.nav-actions, .ns-actions') && document.querySelector('header nav a');   // no actions box: match the menu's text colour
    var a = document.createElement('a');
    a.className = 'pref-src-head';
    a.href = 'https://www.google.com/preferences/source?q=' + encodeURIComponent(location.hostname.replace(/^www\./, ''));
    a.target = '_blank'; a.rel = 'noopener';
    a.title = 'Add us as a preferred source on Google'; a.setAttribute('aria-label', a.title);
    a.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
      '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
      '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
      '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>' +
      '</svg><span>Preferred source</span>';
    box.insertBefore(a, before);
    if (navLink) a.style.color = getComputedStyle(navLink).color;
    var st = document.createElement('style');
    st.textContent = '.pref-src-head{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-width:38px;height:38px;padding:0 9px;box-sizing:border-box;' +
      'border-radius:999px;border:1px solid color-mix(in srgb,currentColor 22%,transparent);color:inherit;text-decoration:none;font:600 13px/1 system-ui,sans-serif;white-space:nowrap;flex:none}' +
      '.pref-src-head:hover{border-color:color-mix(in srgb,currentColor 45%,transparent)}.pref-src-head svg{width:18px;height:18px;flex:none}' +
      '.pref-src-head span{display:none}@media (min-width:1100px){.pref-src-head{padding:0 13px}.pref-src-head span{display:inline}}';
    document.head.appendChild(st);
    // only where it fits: on a crowded phone header it steps aside (the footer button is still there)
    var header = a.closest('header') || box, t = 0;
    function fit() {
      a.style.display = '';
      if (document.documentElement.scrollWidth > innerWidth + 1 || header.scrollWidth > header.clientWidth + 1 || box.scrollWidth > box.clientWidth + 1) a.style.display = 'none';
    }
    fit(); setTimeout(fit, 1500);
    addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 150); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
})();
