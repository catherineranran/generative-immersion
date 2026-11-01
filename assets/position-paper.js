/* Position paper: a password lock in the manner of ranranli.net/projects/scalable-immersion.
   The details behind the lock (title, authors, the Google Doc) are encrypted below with AES-GCM,
   the key derived from the password with PBKDF2-SHA-256 (250,000 rounds), so this public
   repository holds neither the password nor the document link. */
(function () {
  'use strict';

  var SEALED = {
    salt: "5WAc+3MLa4SXgfLIPrSRQQ==",
    iv: "awogDw0VQFlPvzRL",
    ciphertext: "2kbMekyeTcO+3U4PTzBW9cLXmrklmjixMs0ttFyopGZob+OsLdUCyZQQq1h6U6B+mp/uYuqXb40f/+h7wzPX+VG+YLJu1/iIcqP+LnPoFg3yXCeB7daxfVizyrMuVxtTsrWKgX3M2KVCWiM/nnw1u9MjmtCHKjfG3mq/NOMcag4ERaAj9NuL0fFOdH+IP9inXPfr3r9cgbyvjjii0sKH8iMkn8dqmgStndBXcHsiICMH9DQ9ZZsAbDcFpNgrH2SQICKYUfncXR+wbhkQTrES0mYsvHsIw8Fg4Rgni+OaTDT896YIi87FEOFSjM6YBLt5tidlIlrwQGmkd5RzOlOGhY3x6yzm93h+irccWbA9PWMEOOAfcRFTiisjZNAwILjb4T3VoZUMVn+ShxH8dSs6B4WtHOcp6dfX0r1aquU3T+vkirnxNgnFn69hY/op5HvIGw/JOM0OPZbJeJRRR4T2gcdD5QqzJ6T2iwMFN8cq4uiQkXZiP3i4ducmvlFVqC7jz7vSuHizHQZQ+DTgXgdvfhO92s/4uFKPHTRm7qxk"
  };

  var lock = document.getElementById('pp-lock');
  var content = document.getElementById('pp-content');
  var form = document.getElementById('pp-form');
  var input = document.getElementById('pp-password');
  var msg = document.getElementById('pp-msg');
  if (!lock || !content || !form || !input || !msg) return;

  function bytes(b64) {
    var s = atob(b64), out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  function unseal(password) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (material) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: bytes(SEALED.salt), iterations: 250000, hash: 'SHA-256' },
          material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(SEALED.iv) }, key, bytes(SEALED.ciphertext)); })
      .then(function (plain) { return JSON.parse(new TextDecoder().decode(plain)); });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function safe(u) {
    try { var url = new URL(u); return url.protocol === 'https:' ? url.href : ''; } catch (e) { return ''; }
  }
  function previewUrl(u) {
    var m = /\/document\/d\/([^/?#]+)/.exec(u);
    return m ? 'https://docs.google.com/document/d/' + m[1] + '/preview' : '';
  }
  function docLink(url, cls, label) {
    var a = el('a', cls);
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.append(label + ' ');
    var arrow = el('span', null, '↗');
    arrow.setAttribute('aria-hidden', 'true');
    a.append(arrow);
    return a;
  }

  function relock() {
    content.replaceChildren();
    content.hidden = true;
    lock.hidden = false;
    input.value = '';
    msg.textContent = '';
    input.focus();
    window.scrollTo(0, 0);
  }

  function render(p) {
    var url = safe(p.documentUrl);

    var hero = el('header', 'pp-hero glass');
    var copy = el('div', 'pp-hero-copy');
    copy.append(el('p', 'label', p.label || 'Position paper'));
    var h1 = el('h1', null, p.title);
    h1.id = 'pp-title';
    copy.append(h1);
    if (p.subtitle) copy.append(el('p', 'pp-sub', p.subtitle));
    if (p.authors) copy.append(el('p', 'pp-authors', p.authors));
    var lockBtn = el('button', 'btn small', 'Lock');
    lockBtn.type = 'button';
    lockBtn.addEventListener('click', relock);
    hero.append(copy, lockBtn);

    var doc = el('section', 'pp-doc glass');
    doc.setAttribute('aria-labelledby', 'pp-doc-title');
    var head = el('div', 'pp-doc-head');
    var headCopy = el('div');
    headCopy.append(el('p', 'label', 'Document preview'));
    var h2 = el('h2', null, p.documentTitle || p.title);
    h2.id = 'pp-doc-title';
    headCopy.append(h2);
    head.append(headCopy);
    if (url) head.append(docLink(url, 'btn primary small', 'Open in Google Docs'));
    doc.append(head);
    var src = url && previewUrl(url);
    if (src) {
      var frame = el('iframe', 'pp-frame');
      frame.src = src;
      frame.title = (p.documentTitle || p.title) + ' (preview)';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      doc.append(frame);
    }

    var note = el('p', 'pp-note', 'Google Drive permissions apply when opening or editing the document.');

    content.replaceChildren(hero, doc, note);
    lock.hidden = true;
    content.hidden = false;
    h1.setAttribute('tabindex', '-1');
    h1.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!window.crypto || !crypto.subtle) {
      msg.textContent = 'This browser cannot open the lock. Please try a current browser.';
      return;
    }
    msg.textContent = 'Unlocking…';
    unseal(input.value.trim()).then(function (p) {
      msg.textContent = '';
      render(p);
    }, function () {
      msg.textContent = 'That password did not work.';
      input.select();
    });
  });
})();
