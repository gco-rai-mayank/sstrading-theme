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

  /* ---- WhatsApp links: <a data-wa="Bearings"> opens a chat asking about that item ---- */
  function waLinks(root) {
    $$('[data-wa]', root).forEach(function (a) {
      var item = a.getAttribute('data-wa');
      var msg = item
        ? 'Hello ' + NAME + ', I need a price / availability for: ' + item
        : 'Hello ' + NAME + ', I have an enquiry.';
      a.href = waUrl(msg);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  /* Everything below needs the page content in place; see start() at the bottom */
  function boot() {
    waLinks();

    var ICON_WA = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 9.5c.3 2.2 2.3 4.3 4.5 4.8l1.2-1.2 2 1-.6 1.8c-3.6.4-7.6-3.5-7.3-7.2L10.6 8l1 2z" fill="currentColor" stroke="none"/></svg>';
    var ICON_MAIL = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
    var ICON_SEARCH = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

    /* ---- Quote form: drop <div data-sst-quote></div> anywhere (pages, posts) ---- */
    var qid = 0;
    function quoteForm(box) {
      qid++;
      var item = box.getAttribute('data-item') || new URLSearchParams(location.search).get('item') || '';
      var f = function (n, label, type, opt) {
        opt = opt || {};
        var id = 'q' + qid + '-' + n;
        var input = type === 'textarea'
          ? '<textarea id="' + id + '" name="' + n + '" rows="3" placeholder="' + esc(opt.ph || '') + '">' + esc(opt.val || '') + '</textarea>'
          : '<input id="' + id + '" name="' + n + '" type="' + type + '" placeholder="' + esc(opt.ph || '') + '" value="' + esc(opt.val || '') + '"' + (opt.auto ? ' autocomplete="' + opt.auto + '"' : '') + '/>';
        return '<label class="field' + (opt.full ? ' full' : '') + '" for="' + id + '"><span>' + label + (opt.req ? '' : ' <small>optional</small>') + '</span>' + input + '</label>';
      };
      box.innerHTML =
        '<form class="qform" novalidate>' +
        f('name', 'Your name', 'text', { req: 1, auto: 'name', ph: 'e.g. Rajesh Kumar' }) +
        f('phone', 'Mobile number', 'tel', { req: 1, auto: 'tel', ph: '10-digit mobile' }) +
        f('firm', 'Company / firm', 'text', { auto: 'organization', ph: 'Firm name' }) +
        f('city', 'City', 'text', { auto: 'address-level2', ph: 'City' }) +
        f('item', 'Part / product needed', 'textarea', { req: 1, full: 1, val: item, ph: 'Part name + machine model, e.g. Gear cover, Shaktiman' }) +
        f('qty', 'Quantity', 'text', { full: 1, ph: 'e.g. 20 pcs' }) +
        '<div class="qform-actions full">' +
        '<button class="btn btn-wa" type="submit" value="wa">' + ICON_WA + ' Send on WhatsApp</button>' +
        '<button class="btn btn-line" type="submit" value="mail">' + ICON_MAIL + ' Email</button>' +
        '</div>' +
        '<p class="qform-msg full" role="alert" hidden></p>' +
        '<p class="qform-note full">We usually reply within working hours on the same day.</p>' +
        '</form>';
      var form = $('form', box), msg = $('.qform-msg', box);
      var via = 'wa';
      $$('button[type=submit]', form).forEach(function (b) { b.addEventListener('click', function () { via = b.value; }); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = {};
        ['name', 'phone', 'firm', 'city', 'item', 'qty'].forEach(function (k) { v[k] = (form.elements[k].value || '').trim(); });
        var bad = [];
        if (!v.name) bad.push('name');
        if (!/^[0-9+\-\s]{10,15}$/.test(v.phone)) bad.push('phone');
        if (!v.item) bad.push('item');
        $$('.field', form).forEach(function (l) { l.classList.remove('err'); });
        if (bad.length) {
          bad.forEach(function (k) { form.elements[k].closest('.field').classList.add('err'); });
          msg.textContent = 'Please fill in your name, a 10-digit mobile number and the part you need.';
          msg.hidden = false;
          form.elements[bad[0]].focus();
          return;
        }
        msg.hidden = true;
        var lines = [
          'Quote request — ' + NAME,
          '',
          'Name: ' + v.name,
          'Mobile: ' + v.phone,
          v.firm ? 'Firm: ' + v.firm : '',
          v.city ? 'City: ' + v.city : '',
          'Requirement: ' + v.item,
          v.qty ? 'Quantity: ' + v.qty : ''
        ].filter(function (x, i) { return x || i === 1; });
        var text = lines.join('\n');
        if (window.gtag) window.gtag('event', 'generate_lead', { method: via });
        if (via === 'mail') {
          location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Quote request: ' + v.item.slice(0, 60)) + '&body=' + encodeURIComponent(text);
        } else {
          openWa(waUrl(text));
        }
      });
    }
    $$('[data-sst-quote]').forEach(quoteForm);

    /* ---- Mobile menu ---- */
    var tog = $('.nav-toggle'), nav = $('.nav');
    if (tog && nav) {
      tog.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
    }
    /* Highlight the current page in the menu */
    $$('.nav a').forEach(function (a) {
      var p = a.getAttribute('href');
      if (p && p !== '/' && location.pathname.indexOf(p.replace(/#.*/, '')) === 0 && p.indexOf('#') < 0) a.classList.add('active');
    });

    /* ---- Back to top ---- */
    var top = $('.to-top');
    if (top) {
      window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 600); }, { passive: true });
      top.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
    }

    /* ---- Year in footer ---- */
    $$('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });

    /* ---- Product cards (label / search pages): use the post's first image ---- */
    $$('.prod-img[data-img]').forEach(function (d) {
      d.style.backgroundImage = 'url("' + d.getAttribute('data-img') + '")';
      d.innerHTML = '';
    });

    /* ---- Contact page: show Blogger's contact form inside <div data-sst-contact></div> ---- */
    var slot = $('[data-sst-contact]'), cf = $('.contact-src form') && $('.contact-src');   // only if the gadget really has its form
    if (slot && cf) { slot.appendChild(cf); cf.classList.add('show'); }
    else if (slot && EMAIL) { slot.innerHTML = '<a class="btn btn-navy" href="mailto:' + esc(EMAIL) + '">' + ICON_MAIL + ' Email ' + esc(EMAIL) + '</a>'; }

    /* ---- Lightbox: one photo, or several with previous / next ---- */
    var lb, lbList = [], lbAt = 0, lbAlt = '';
    function lbShow() {
      var img = $('img', lb);
      img.src = lbList[lbAt];
      img.alt = lbAlt + (lbList.length > 1 ? ' (photo ' + (lbAt + 1) + ' of ' + lbList.length + ')' : '');
      $('.lb-count', lb).textContent = lbList.length > 1 ? (lbAt + 1) + ' / ' + lbList.length : '';
      lb.classList.toggle('multi', lbList.length > 1);
    }
    function lbStep(d) { lbAt = (lbAt + d + lbList.length) % lbList.length; lbShow(); }
    function openLightbox(list, alt, at) {
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
          if (Math.abs(dx) > 40) { lbStep(dx < 0 ? 1 : -1); }
          x0 = null;
        });
        document.body.appendChild(lb);
      }
      lbList = list; lbAt = at || 0; lbAlt = alt || '';
      lbShow();
      lb.classList.add('open');
    }
    document.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open');
      if (e.key === 'ArrowRight' && lbList.length > 1) lbStep(1);
      if (e.key === 'ArrowLeft' && lbList.length > 1) lbStep(-1);
    });
    /* Gallery page: <div class="gallery-grid"> with <img> inside */
    $$('.gallery-grid img').forEach(function (img) {
      img.addEventListener('click', function () {
        var src = (img.closest('a') && img.closest('a').href) || img.src;
        openLightbox([src.replace(/\/s\d+(-[a-z0-9-]+)?\//, '/s1600/')], img.alt);
      });
    });
    /* Stop Blogger's image links from leaving the page in the gallery */
    $$('.gallery-grid a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

    /* ---- Products catalogue: built from catalog.json, with filter chips, search and an enquiry list ---- */
    var cat = $('[data-sst-catalog]');
    if (cat) {
      if ($('.part', cat)) {
        initCatalog(cat);
      } else {
        fetch(BASE + 'catalog.json', { cache: 'no-cache' })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (data) { renderCatalog(cat, data); initCatalog(cat); })
          .catch(function () {
            cat.innerHTML = '<p class="empty-note">The parts list could not load. Please refresh the page, or <a data-wa="" href="#">ask us on WhatsApp</a>.</p>';
            waLinks(cat);
          });
      }
    }

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
        chips.forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-filter') === id); });
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
