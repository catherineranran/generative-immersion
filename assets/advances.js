/* AI advances: picture-first cards from items.json, like the launch pad's AI updates. */
(function () {
  'use strict';

  var KINDS = [
    { k: 'video', name: 'Video models', one: 'Video model', c: '#86e3a6' },
    { k: 'world', name: 'World models', one: 'World model', c: '#8fd0ff' },
    { k: '3d', name: '3D worlds & splats', one: '3D world', c: '#c8b5ff' },
    { k: 'avatar', name: 'People & avatars', one: 'Avatars', c: '#ffb0cf' },
    { k: 'tool', name: 'Tools', one: 'Tool', c: '#ffd66e' },
    { k: 'paper', name: 'Papers', one: 'Paper', c: '#93e6dc' }
  ];
  var KIND = {};
  KINDS.forEach(function (x) { KIND[x.k] = x; });
  var NEW_DAYS = 14;

  var ICON = {
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none"/></svg>',
    paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zm0 0A2 2 0 0 0 6 22h12"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
  };

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
  function fmtDate(d) { return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; }
  function kindOf(it) { return KIND[it.kind] ? it.kind : 'tool'; }
  function isNew(it) {
    var d = parseDate(it.added);
    return !!d && (Date.now() - d.getTime()) / 864e5 <= NEW_DAYS;
  }

  var data = null, filter = 'all';

  function card(it, idx) {
    var k = KIND[kindOf(it)];
    var link = safeUrl(it.link);
    var d = parseDate(it.date);
    var img = it.img ? safeUrl(it.img) : '';
    var cover = img
      ? '<img src="' + esc(img) + '" alt="' + esc(it.imgAlt || '') + '" loading="' + (idx < 3 ? 'eager' : 'lazy') + '" width="800" height="450">'
      : '<div class="adv-tile"><span>' + esc(it.name) + '</span></div>';
    var extra = (it.links || []).map(function (l) {
      var u = safeUrl(l.url);
      if (!u) return '';
      return '<a class="icon-btn" href="' + esc(u) + '" target="_blank" rel="noopener" title="' + esc(l.label) + '" aria-label="' + esc(l.label) + ': ' + esc(it.name) + '">' + (ICON[l.icon] || ICON.ext) + '</a>';
    }).join('');
    return '<article class="adv-card" style="--k:' + k.c + '" data-id="' + esc(it.id) + '">' +
      (link ? '<a class="adv-cover" href="' + esc(link) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' + cover + '</a>'
            : '<div class="adv-cover">' + cover + '</div>') +
      '<div class="adv-body">' +
        '<div class="adv-top"><span class="adv-kind">' + esc(k.one) + '</span>' +
          (isNew(it) ? '<span class="adv-tag">New</span>' : '') +
          '<span class="spacer"></span>' +
          (d ? '<time class="adv-date" datetime="' + esc(it.date) + '">' + esc(fmtDate(d)) + '</time>' : '') +
        '</div>' +
        '<h2>' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(it.name) + '</a>' : esc(it.name)) + '</h2>' +
        (it.org ? '<p class="adv-org">' + esc(it.org) + '</p>' : '') +
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

  function renderChips(items) {
    var box = $('#advKinds'); if (!box) return;
    var counts = {};
    items.forEach(function (it) { var k = kindOf(it); counts[k] = (counts[k] || 0) + 1; });
    var present = KINDS.filter(function (x) { return counts[x.k]; });
    if (present.length < 2) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = [{ k: 'all', name: 'All', c: '#ffffff' }].concat(present).map(function (x) {
      var n = x.k === 'all' ? items.length : counts[x.k];
      return '<button type="button" class="chip" data-k="' + x.k + '" aria-pressed="' + (filter === x.k) + '" style="--k:' + x.c + '">' +
        (x.k === 'all' ? '' : '<i aria-hidden="true"></i>') + esc(x.name) + ' <span class="n">' + n + '</span></button>';
    }).join('');
  }

  function renderStats(items) {
    var box = $('#advStats'); if (!box) return;
    var dates = items.map(function (it) { return parseDate(it.date); }).filter(Boolean).sort(function (a, b) { return b - a; });
    var kinds = {};
    items.forEach(function (it) { kinds[kindOf(it)] = 1; });
    var updated = parseDate(data && data.updated);
    var tiles = [
      ['Entries', items.length, items.length === 1 ? 'more to come' : 'and counting'],
      ['Latest', dates[0] ? dates[0].toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '–', dates[0] ? fmtDate(dates[0]) : ''],
      ['Updated', updated ? updated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '–', Object.keys(kinds).length + (Object.keys(kinds).length === 1 ? ' kind' : ' kinds')]
    ];
    box.innerHTML = tiles.map(function (t) {
      return '<div class="adv-stat"><span>' + esc(t[0]) + '</span><b>' + esc(t[1]) + '</b><small>' + esc(t[2]) + '</small></div>';
    }).join('');
  }

  function render() {
    var items = (data && data.items) || [];
    items = items.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    renderStats(items);
    renderChips(items);
    var shown = filter === 'all' ? items : items.filter(function (it) { return kindOf(it) === filter; });
    var list = $('#advList');
    list.innerHTML = shown.length ? shown.map(function (it, i) { return card(it, i); }).join('') : '<p class="adv-empty">Nothing here yet.</p>';
  }

  document.addEventListener('click', function (e) {
    var chip = e.target.closest && e.target.closest('.chip[data-k]');
    if (!chip) return;
    filter = chip.getAttribute('data-k');
    render();
  });

  fetch('items.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) { data = j; render(); })
    .catch(function () {
      $('#advList').innerHTML = '<p class="adv-empty">The list could not be loaded. Try again in a moment.</p>';
    });
})();
