/* AI advances: five horizontal strands of picture-first cards, filled from items.json.
   Each strand is a row of cards, newest first, that scrolls sideways (like the
   Exhibition page on ranranli.net, with its columns turned on their side). */
(function () {
  'use strict';

  // The strands, in page order. An item's "kind" in items.json picks its strand.
  var STRANDS = [
    { k: 'video', name: 'Video models', c: '#86e3a6',
      desc: 'Clips with sound, made from text and references: fixed stimuli where one cue changes.' },
    { k: 'world', name: 'Real-time world models', c: '#8fd0ff',
      desc: 'Worlds generated as people move and act in them: scenarios that respond to the participant.' },
    { k: '3d', name: '3D worlds & objects', c: '#c8b5ff',
      desc: 'Lasting 3D scenes and props: the same world for every participant, in a headset.' },
    { k: 'people', name: 'Virtual people', c: '#ffb0cf',
      desc: 'Avatars, voices and characters you can talk to: confederates who answer back.',
      empty: 'Coming soon: avatars, voices and characters that participants can talk to.' },
    { k: 'device', name: 'Equipment: Headsets & glasses', short: 'Headsets & glasses', c: '#ffd66e',
      desc: 'Where participants see it all: weight, a see-through view of the room, eye tracking, price.' }
  ];
  var BY_KIND = {};
  STRANDS.forEach(function (s, i) { s.n = ('0' + (i + 1)).slice(-2); s.id = 'strand-' + s.k; BY_KIND[s.k] = s; });
  var NEW_DAYS = 14;

  var ICON = {
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none"/></svg>',
    paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zm0 0A2 2 0 0 0 6 22h12"/></svg>',
    world: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>'
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) {
    if (!u) return '';
    try {
      var url = new URL(u, location.href);
      return /^https?:$/.test(url.protocol) ? url.href : '';
    } catch (e) { return ''; }
  }
  function parseDate(s) { var d = s ? new Date(s + 'T12:00:00') : null; return d && !isNaN(d) ? d : null; }
  // month names spelled out here, so September reads "Sep" in every browser
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) { return d ? d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() : ''; }
  function fmtMonth(d) { return d ? MONTHS[d.getMonth()] + ' ' + d.getFullYear() : ''; }
  function isNew(it) {
    var d = parseDate(it.added);
    return !!d && (Date.now() - d.getTime()) / 864e5 <= NEW_DAYS;
  }

  var data = null;

  function card(it, first) {
    var link = safeUrl(it.link);
    var d = parseDate(it.date);
    var rel = d ? '<time datetime="' + esc(it.date) + '">' + esc(fmtMonth(d)) + '</time>' : '';
    var when = rel ? esc(it.dateNote || 'released') + ' ' + rel : '';
    var byline = it.org ? esc(it.org) + (when ? ', ' + when : '') : (when ? when.charAt(0).toUpperCase() + when.slice(1) : '');
    var img = it.img ? safeUrl(it.img) : '';
    var cover = img
      ? '<img src="' + esc(img) + '" alt="' + esc(it.imgAlt || '') + '" loading="' + (first ? 'eager' : 'lazy') + '" width="800" height="450">'
      : '<div class="adv-tile"><span>' + esc(it.name) + '</span></div>';
    var extra = (it.links || []).map(function (l) {
      var u = safeUrl(l.url);
      if (!u) return '';
      return '<a class="icon-btn" href="' + esc(u) + '" target="_blank" rel="noopener" title="' + esc(l.label) + '" aria-label="' + esc(l.label) + ': ' + esc(it.name) + '">' + (ICON[l.icon] || ICON.ext) + '</a>';
    }).join('');
    var tags = (isNew(it) ? '<span class="adv-tag">New</span>' : '') +
      (it.status ? '<span class="adv-status">' + esc(it.status) + '</span>' : '');
    return '<article class="adv-card" data-id="' + esc(it.id) + '">' +
      (link ? '<a class="adv-cover" href="' + esc(link) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' + cover + '</a>'
            : '<div class="adv-cover">' + cover + '</div>') +
      '<div class="adv-body">' +
        (tags ? '<div class="adv-top">' + tags + '</div>' : '') +
        '<h3>' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(it.name) + '</a>' : esc(it.name)) + '</h3>' +
        (byline ? '<p class="adv-org">' + byline + '</p>' : '') +
        (it.summary ? '<p class="adv-sum" title="' + esc(it.summary) + '">' + esc(it.summary) + '</p>' : '') +
        (it.why ? '<p class="adv-why"><span class="label">For research</span>' + esc(it.why) + '</p>' : '') +
        '<div class="adv-actions">' +
          (link ? '<a class="btn small primary" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(it.linkLabel || 'Open') + ' ' + ICON.ext + '</a>' : '') +
          '<span class="spacer"></span>' + extra +
          (it.credit ? '<span class="icon-btn" tabindex="0" role="img" title="' + esc(it.credit) + '" aria-label="' + esc(it.credit) + '">' + ICON.info + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function strand(s, items) {
    var label = s.short || s.name;
    return '<section class="adv-strand" id="' + s.id + '" style="--k:' + s.c + '" aria-labelledby="' + s.id + '-title">' +
      '<header class="adv-strand-head">' +
        '<span class="adv-strand-num" aria-hidden="true">' + s.n + '</span>' +
        '<div class="adv-strand-titles"><h2 id="' + s.id + '-title">' + esc(s.name) + '</h2><p>' + esc(s.desc) + '</p></div>' +
        '<span class="adv-count" title="' + items.length + (items.length === 1 ? ' entry' : ' entries') + '">' + items.length + '</span>' +
        '<div class="adv-strand-nav">' +
          '<button class="icon-btn" type="button" data-dir="-1" aria-controls="' + s.id + '-row" aria-label="Back in ' + esc(label) + '">' + ICON.prev + '</button>' +
          '<button class="icon-btn" type="button" data-dir="1" aria-controls="' + s.id + '-row" aria-label="More in ' + esc(label) + '">' + ICON.next + '</button>' +
        '</div>' +
      '</header>' +
      '<div class="adv-row" id="' + s.id + '-row" tabindex="0" role="region" aria-label="' + esc(label) + ', newest first">' +
        (items.length ? items.map(function (it, i) { return card(it, i === 0); }).join('')
                      : '<p class="adv-row-empty">' + esc(s.empty || 'Nothing here yet.') + '</p>') +
      '</div>' +
    '</section>';
  }

  function renderJump(groups) {
    var box = $('#advJump'); if (!box) return;
    box.innerHTML = STRANDS.map(function (s) {
      return '<a class="chip" href="#' + s.id + '" style="--k:' + s.c + '"><i aria-hidden="true"></i>' + esc(s.short || s.name) +
        ' <span class="n">' + groups[s.k].length + '</span></a>';
    }).join('');
  }

  function renderStats(items) {
    var box = $('#advStats'); if (!box) return;
    var dates = items.map(function (it) { return parseDate(it.date); }).filter(Boolean).sort(function (a, b) { return b - a; });
    var updated = parseDate(data && data.updated);
    var tiles = [
      ['Entries', items.length, 'and counting'],
      ['Latest', dates[0] ? fmtMonth(dates[0]) : '–', dates[0] ? fmtDate(dates[0]) : ''],
      ['Updated', updated ? updated.getDate() + ' ' + MONTHS[updated.getMonth()] : '–', STRANDS.length + ' strands']
    ];
    box.innerHTML = tiles.map(function (t) {
      return '<div class="adv-stat"><span>' + esc(t[0]) + '</span><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></div>';
    }).join('');
  }

  // show the arrows only when a strand holds more cards than fit
  function watchRows() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.adv-row'));
    function check() {
      rows.forEach(function (row) {
        row.parentNode.classList.toggle('no-x', row.scrollWidth <= row.clientWidth + 2);
      });
    }
    check();
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(check);
      rows.forEach(function (row) { ro.observe(row); });
    } else {
      window.addEventListener('resize', check);
    }
  }

  function render() {
    var all = ((data && data.items) || []).filter(function (it) { return BY_KIND[it.kind]; });
    var groups = {};
    STRANDS.forEach(function (s) { groups[s.k] = []; });
    all.forEach(function (it) { groups[it.kind].push(it); });
    STRANDS.forEach(function (s) {
      // newest first; items with the same date keep their order in items.json
      groups[s.k] = groups[s.k].map(function (it, i) { return { it: it, i: i }; })
        .sort(function (a, b) { return (b.it.date || '').localeCompare(a.it.date || '') || (a.i - b.i); })
        .map(function (o) { return o.it; });
    });
    renderStats(all);
    renderJump(groups);
    $('#advStrands').innerHTML = STRANDS.map(function (s) { return strand(s, groups[s.k]); }).join('');
    watchRows();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.adv-strand-nav [data-dir]');
    if (!btn) return;
    var row = document.getElementById(btn.getAttribute('aria-controls'));
    if (!row) return;
    var first = row.querySelector('.adv-card');
    var step = first ? first.getBoundingClientRect().width + 14 : row.clientWidth * 0.8;
    row.scrollBy({ left: Number(btn.getAttribute('data-dir')) * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  fetch('items.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) { data = j; render(); })
    .catch(function () {
      $('#advStrands').innerHTML = '<p class="adv-empty">The strands could not be loaded. Try again in a moment.</p>';
    });
})();
