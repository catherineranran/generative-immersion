/* Generative Immersion: navigation, sky, technology strands and media. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }

  /* ---------- navigation: a white thumb on the current section (from ranranli.net) ---------- */
  (function nav() {
    var track = document.querySelector('.nav-track');
    if (!track) return;
    var thumb = track.querySelector('.nav-thumb');
    var items = Array.prototype.slice.call(track.querySelectorAll('.nav-item'));

    // Real refraction only renders in Chromium; elsewhere the plain blur is used.
    var brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
    if (brands.some(function (b) { return /Chromium/i.test(b.brand); })) root.classList.add('lg-refract');

    var sections = items.filter(function (i) { return !i.classList.contains('nav-brand'); }).map(function (item) {
      var href = item.getAttribute('href') || '';
      var el = href.charAt(0) === '#' && document.getElementById(href.slice(1));
      return el ? { item: item, el: el } : null;
    }).filter(Boolean);

    var page = items.filter(function (i) { return i.getAttribute('aria-current') === 'page'; })[0] || null;
    var current = page || (sections[0] && sections[0].item) || null;
    var hovered = null;

    function place(target, animate) {
      if (!target) { thumb.classList.remove('is-ready'); return; }
      thumb.classList.toggle('no-anim', !animate);
      thumb.style.width = target.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + target.offsetLeft + 'px)';
      thumb.classList.add('is-ready');
      items.forEach(function (i) { i.classList.toggle('is-current', i === target); });
      if (!animate) requestAnimationFrame(function () { thumb.classList.remove('no-anim'); });
    }
    function keepInView(target) {
      if (track.scrollWidth <= track.clientWidth) return;
      var left = target.offsetLeft - 24, right = target.offsetLeft + target.offsetWidth + 24;
      if (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth) {
        track.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
    function sectionAtTop() {
      if (page || !sections.length) return current;
      var line = window.innerHeight * 0.32, found = sections[0];
      sections.forEach(function (s) { if (s.el.getBoundingClientRect().top <= line) found = s; });
      // at the very bottom, the last section counts as reached
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) found = sections[sections.length - 1];
      return found.item;
    }
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var next = sectionAtTop();
        if (next !== current) {
          current = next;
          if (!hovered) { place(current, true); keepInView(current); }
        }
      });
    }
    items.forEach(function (item) {
      item.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; hovered = item; place(item, true); });
      item.addEventListener('focus', function () { hovered = item; place(item, true); keepInView(item); });
      item.addEventListener('blur', function () { hovered = null; place(current, true); });
      item.addEventListener('click', function () {
        if ((item.getAttribute('href') || '').charAt(0) === '#' && !item.classList.contains('nav-brand')) { current = item; place(item, true); }
      });
    });
    track.addEventListener('pointerleave', function () { hovered = null; place(current, true); });
    function edges() {
      var max = track.scrollWidth - track.clientWidth;
      track.classList.toggle('more-left', track.scrollLeft > 4);
      track.classList.toggle('more-right', track.scrollLeft < max - 4);
    }
    track.addEventListener('scroll', edges, { passive: true });
    window.addEventListener('resize', function () { edges(); place(hovered || current, false); });
    window.addEventListener('scroll', onScroll, { passive: true });
    current = sectionAtTop();
    place(current, false);
    edges();
    if (current) keepInView(current);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(hovered || current, false); edges(); });
  })();

  /* ---------- sky: dusk turns to night as the page reaches the people ---------- */
  (function sky() {
    var mark = document.getElementById('people');
    var canvas = document.querySelector('.sky-stars');
    if (!mark || !canvas) return;
    var ctx = canvas.getContext('2d');
    var stars = [], meteors = [], w = 0, h = 0, dpr = 1, night = 0, raf = 0, nextMeteor = 0;
    var tints = ['255,255,255', '255,255,255', '207,224,255', '255,230,199', '255,209,232'];

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(460, Math.round(w * h / 4200));
      stars = [];
      for (var i = 0; i < n; i++) {
        var big = Math.random() < 0.05;
        stars.push({
          x: Math.random() * w, y: Math.random() * h * 0.82,
          r: big ? 1.1 + Math.random() * 0.9 : 0.35 + Math.random() * 0.75,
          a: 0.35 + Math.random() * 0.65, s: 0.4 + Math.random() * 1.6, p: Math.random() * 6.28,
          c: tints[(Math.random() * tints.length) | 0], spark: big && Math.random() < 0.35
        });
      }
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var tw = reduceMotion ? 1 : 0.62 + 0.38 * Math.sin(t * 0.001 * st.s + st.p);
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = 'rgb(' + st.c + ')';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.2832); ctx.fill();
        if (st.spark) {
          // a four-pointed sparkle, as on ranranli.net
          ctx.globalAlpha = st.a * tw * 0.55;
          ctx.fillRect(st.x - st.r * 4, st.y - 0.35, st.r * 8, 0.7);
          ctx.fillRect(st.x - 0.35, st.y - st.r * 4, 0.7, st.r * 8);
        }
      }
      if (!reduceMotion) {
        if (night > 0.6 && t > nextMeteor) {
          meteors.push({ x: w * (0.35 + Math.random() * 0.6), y: h * Math.random() * 0.3, vx: -(4 + Math.random() * 3), vy: 2 + Math.random() * 1.5, life: 0 });
          nextMeteor = t + 4500 + Math.random() * 6500;
        }
        for (var m = meteors.length - 1; m >= 0; m--) {
          var me = meteors[m];
          me.life += 1; me.x += me.vx; me.y += me.vy;
          var fade = 1 - me.life / 55;
          if (fade <= 0) { meteors.splice(m, 1); continue; }
          var g = ctx.createLinearGradient(me.x, me.y, me.x - me.vx * 14, me.y - me.vy * 14);
          g.addColorStop(0, 'rgba(255,255,255,' + 0.9 * fade + ')');
          g.addColorStop(1, 'rgba(180,200,255,0)');
          ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(me.x, me.y); ctx.lineTo(me.x - me.vx * 14, me.y - me.vy * 14); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      raf = 0;
      if (night < 0.01 || document.hidden) return;
      draw(t || 0);
      if (!reduceMotion) raf = requestAnimationFrame(loop);
    }
    function update() {
      var r = mark.getBoundingClientRect(), vh = window.innerHeight;
      var start = vh * 1.2, end = vh * 0.3;
      var p = clamp((start - r.top) / (start - end), 0, 1);
      p = p * p * (3 - 2 * p);
      if (Math.abs(p - night) > 0.001) {
        night = p;
        root.style.setProperty('--night', p.toFixed(3));
      }
      if (night >= 0.01 && !raf) raf = requestAnimationFrame(loop);
    }
    size();
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', function () { size(); update(); if (reduceMotion && night >= 0.01) draw(0); });
    document.addEventListener('visibilitychange', update);
  })();

  /* ---------- technology strands: previous / next ---------- */
  (function board() {
    var wrap = document.getElementById('tech-board');
    if (!wrap) return;
    var prev = document.querySelector('[data-board="prev"]'), next = document.querySelector('[data-board="next"]');
    function step() {
      var s = wrap.querySelector('.strand');
      return s ? s.getBoundingClientRect().width + 18 : wrap.clientWidth * 0.8;
    }
    function state() {
      var max = wrap.scrollWidth - wrap.clientWidth;
      if (prev) prev.disabled = wrap.scrollLeft <= 4;
      if (next) next.disabled = wrap.scrollLeft >= max - 4;
    }
    if (prev) prev.addEventListener('click', function () { wrap.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { wrap.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    wrap.addEventListener('scroll', state, { passive: true });
    window.addEventListener('resize', state);
    state();
  })();

  /* ---------- videos: fetch only when near, play one at a time ---------- */
  (function videos() {
    var vids = Array.prototype.slice.call(document.querySelectorAll('video[data-src]'));
    if (!vids.length) return;
    function arm(v) {
      if (v.getAttribute('src')) return;
      v.src = v.getAttribute('data-src');
      v.preload = 'metadata';
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { arm(e.target); io.unobserve(e.target); } });
      }, { root: null, rootMargin: '600px' });
      vids.forEach(function (v) { io.observe(v); });
    } else {
      vids.forEach(arm);
    }
    // if the official clip ever stops loading, point to where it can be watched
    vids.forEach(function (v) {
      v.addEventListener('error', function () {
        var href = v.getAttribute('data-fallback');
        if (!href || v.parentNode.querySelector('.media-fallback')) return;
        var a = document.createElement('a');
        a.className = 'media-fallback'; a.href = href; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Watch this clip on the official page \u2197';
        v.parentNode.appendChild(a);
      });
    });
    document.addEventListener('play', function (e) {
      if (e.target.tagName !== 'VIDEO') return;
      vids.forEach(function (v) { if (v !== e.target && !v.paused) v.pause(); });
    }, true);
  })();

  /* ---------- YouTube: load the player only when asked ---------- */
  (function youtube() {
    var links = Array.prototype.slice.call(document.querySelectorAll('a.yt[data-yt]'));
    links.forEach(function (a) {
      var id = a.getAttribute('data-yt');
      var img = a.querySelector('img');
      if (img) img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
      // use the large still when YouTube has one (a missing one comes back as a 120px placeholder)
      var big = new Image();
      big.onload = function () { if (big.naturalWidth > 200 && img) img.src = big.src; };
      big.src = 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg';
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
        e.preventDefault();
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
        f.title = a.getAttribute('aria-label') ? a.getAttribute('aria-label').replace(/^Play /, '') : 'YouTube video';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        f.allowFullscreen = true;
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        a.replaceWith(f);
        document.querySelectorAll('video').forEach(function (v) { if (!v.paused) v.pause(); });
      });
    });
  })();

  /* ---------- the year in the footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
})();
