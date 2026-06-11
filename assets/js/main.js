// nav: solid on scroll
const nav = document.querySelector('.nav');
if (nav){
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40 || nav.dataset.always === '1');
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
}
// mobile burger
const burger = document.querySelector('.nav__burger');
const menu = document.querySelector('.nav__menu');
if (burger && menu){
  // scissors toggle (closed by default, opens with the menu)
  burger.innerHTML = '<svg viewBox="0 0 26 24" aria-hidden="true">' +
    '<g class="handles">' +
      '<circle cx="5" cy="8" r="2.5"/><circle cx="5" cy="16" r="2.5"/>' +
      '<line x1="6.9" y1="9.3" x2="13" y2="12"/><line x1="6.9" y1="14.7" x2="13" y2="12"/>' +
    '</g>' +
    '<g class="bl bl-a"><line x1="12" y1="12" x2="24.5" y2="11"/></g>' +
    '<g class="bl bl-b"><line x1="12" y1="12" x2="24.5" y2="13"/></g>' +
    '<circle class="pivot" cx="12.6" cy="12" r="1"/>' +
    '</svg>';
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // close the overlay when a link is tapped
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }));
}
// open only EXTERNAL links in a new tab; internal pages stay in the same tab
document.querySelectorAll('a[href]').forEach(a => {
  const h = a.getAttribute('href') || '';
  if (/^https?:\/\//i.test(h)) {
    a.target = '_blank';
    a.rel = 'noopener';
  } else {
    a.removeAttribute('target');
  }
});
// scroll reveal (fade + rise on enter)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sel = '.shead, .feature, .price-card, .price-tabs, .split > div, .split .slideshow,' +
            ' .split img, .band > *, .info-row, .gal img, .map-links, .loc-map, #reserve';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!els.length) return;
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) { el.classList.add('in'); return; } // already in view
    el.classList.add('reveal');
    // light stagger inside card grids
    var p = el.parentElement;
    if (p && (p.classList.contains('feature-grid') || p.classList.contains('desg-grid') || p.classList.contains('gal'))) {
      var idx = Array.prototype.indexOf.call(p.children, el);
      el.style.transitionDelay = Math.min(idx * 0.14, 0.7) + 's';
    }
    io.observe(el);
  });
})();
// auto slideshow (crossfade)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.slideshow').forEach(function (ss) {
    var slides = ss.querySelectorAll('.slide');
    if (slides.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 3800);
  });
})();
// designer intro — reveal sentence by sentence
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intros = document.querySelectorAll('.desg__b > p:not(.desg__sns):not(.desg__promo)');
  if (!intros.length) return;
  intros.forEach(function (p, ci) {
    var txt = p.textContent.trim();
    var parts = txt.split(/(?<=[.])\s+/).filter(Boolean);
    if (parts.length < 2) return;
    p.innerHTML = parts.map(function (s) { return '<span class="sent">' + s + '</span>'; }).join(' ');
    var sents = p.querySelectorAll('.sent');
    if (reduce) { sents.forEach(function (s) { s.classList.add('in'); }); return; }
    var base = 1100 + ci * 170; // after each card has entered
    sents.forEach(function (s, si) {
      setTimeout(function () { s.classList.add('in'); }, base + si * 360);
    });
  });
})();
// program tabs (디렉터 / 원장) — pill slide, elegant fade (no discount roll)
(function () {
  var tabs = document.querySelectorAll('.price-tab');
  if (!tabs.length) return;
  var thumb = document.querySelector('.price-tabs__thumb');
  function moveThumb(btn) {
    if (!thumb || !btn) return;
    thumb.style.left = btn.offsetLeft + 'px';
    thumb.style.top = btn.offsetTop + 'px';
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.height = btn.offsetHeight + 'px';
  }
  var activeTab = document.querySelector('.price-tab.active');
  if (activeTab && thumb) {
    var pre = thumb.style.transition; thumb.style.transition = 'none'; moveThumb(activeTab);
    requestAnimationFrame(function () { thumb.style.transition = pre; });
  }
  window.addEventListener('resize', function () { moveThumb(document.querySelector('.price-tab.active')); });
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      moveThumb(t);
      document.querySelectorAll('.price-card').forEach(function (c) { c.classList.add('hidden'); });
      var shown = document.getElementById('price-' + t.dataset.tab);
      if (shown) shown.classList.remove('hidden');
    });
  });
})();
// price digit-roll animation (each digit slots up into place, stacking)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function build(el) {
    if (el.dataset.roll) return;
    el.dataset.roll = '1';
    var str = el.textContent.trim();
    var wrap = document.createElement('span'); wrap.className = 'num';
    var digits = [];
    for (var i = 0; i < str.length; i++) {
      var c = str[i];
      if (c >= '0' && c <= '9') {
        var dig = document.createElement('span'); dig.className = 'dig';
        var col = document.createElement('span'); col.className = 'dig__col';
        for (var n = 0; n <= 9; n++) { var sp = document.createElement('span'); sp.textContent = n; col.appendChild(sp); }
        dig.appendChild(col); wrap.appendChild(dig);
        digits.push({ col: col, target: parseInt(c, 10) });
      } else {
        var s = document.createElement('span'); s.className = 'comma'; s.textContent = c; wrap.appendChild(s);
      }
    }
    el.innerHTML = ''; el.appendChild(wrap);
    el._digits = digits;
  }
  function settle(el) {                 // jump straight to value (no motion)
    if (el._digits) el._digits.forEach(function (d) { d.col.style.transition = 'none'; d.col.style.opacity = '1'; d.col.style.transform = 'translateY(-' + d.target + 'em)'; });
  }
  function roll(el, base) {
    if (!el._digits) return;
    el._digits.forEach(function (d, i) {
      d.col.style.transition = 'none';
      d.col.style.transform = 'translateY(0)';      // reset to 0
      d.col.style.opacity = '0';
      void d.col.offsetHeight;                        // reflow
      setTimeout(function () {
        d.col.style.transition = 'transform .42s cubic-bezier(.16,.84,.44,1), opacity .38s ease';
        d.col.style.transform = 'translateY(-' + d.target + 'em)';
        d.col.style.opacity = '1';
      }, base + i * 45);                              // stack one by one (left → right)
    });
  }
  function animateCard(card) {
    if (!card) return;
    card.querySelectorAll('.pay').forEach(function (el) { build(el); });
    if (reduce) { card.querySelectorAll('.pay').forEach(settle); return; }
    var rows = card.querySelectorAll('.pay'), r = 0;
    rows.forEach(function (el) { roll(el, r * 70); r++; }); // each row offset, digits stagger within
  }
  var active = document.querySelector('.price-card:not(.hidden)');
  if (active && !reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { animateCard(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    io.observe(active);
  } else { animateCard(active); }
  document.querySelectorAll('.price-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      setTimeout(function () { animateCard(document.getElementById('price-' + t.dataset.tab)); }, 40);
    });
  });
})();
// stance heading — typewriter when it scrolls into view
(function () {
  var el = document.querySelector('.stance__h');
  if (!el) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var full = el.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  if (reduce) return;
  // second line is a sibling heading (same big style) — clear it; types in after the strike
  var answerEl = el.parentNode.querySelector('.stance__h--a');
  var answerFull = answerEl ? answerEl.textContent.trim() : '';
  // reserve final height up front so nothing shifts as text types in
  if (answerEl) { answerEl.style.minHeight = answerEl.offsetHeight + 'px'; answerEl.textContent = ''; }
  // lead paragraph — typed in too (same effect), preserving its <b>
  var leadEl = el.parentNode.querySelector('.stance__p--lead');
  var leadSegs = leadEl ? collectSegs(leadEl) : null;
  if (leadEl) { leadEl.style.minHeight = leadEl.offsetHeight + 'px'; leadEl.innerHTML = ''; leadEl.style.opacity = '0'; }

  // read a node's children into typed segments (text / <b> / <br>)
  function collectSegs(node) {
    var segs = [], ns = node.childNodes;
    for (var j = 0; j < ns.length; j++) {
      var n = ns[j];
      if (n.nodeType === 3) segs.push({ t: n.textContent, b: false });
      else if (n.nodeName === 'BR') segs.push({ t: '\n', b: false });
      else segs.push({ t: n.textContent, b: n.nodeName === 'B' });
    }
    return segs;
  }
  // per-character reveal driver (each glyph fades in from blur)
  function animate(spans, done, mult) {
    mult = mult || 1;
    var i = 0;
    (function step() {
      if (i >= spans.length) { if (done) done(); return; }
      spans[i].el.classList.add('on'); i++;
      var prev = spans[i - 1].ch;
      var ease = i < 5 ? 1.2 : 1;
      var base = (27 * ease + Math.random() * 16) * mult;
      var delay = prev === '\n' ? 200 : (prev === ',' || prev === '?' || prev === '.' ? 150 * mult : base);
      setTimeout(step, delay);
    })();
  }
  // soft per-character typewriter (plain text, with \n support)
  function typeText(target, text, done) {
    var tw = document.createElement('span'); tw.className = 'tw';
    var spans = [];
    for (var k = 0; k < text.length; k++) {
      if (text[k] === '\n') { tw.appendChild(document.createElement('br')); continue; }
      var s = document.createElement('span');
      s.className = 'ch'; s.textContent = text[k];
      tw.appendChild(s); spans.push({ el: s, ch: text[k] });
    }
    target.innerHTML = ''; target.appendChild(tw);
    animate(spans, done);
  }
  // same typewriter, but keeps bold runs (segments from collectSegs)
  function typeSegs(target, segs, done, mult) {
    var tw = document.createElement('span'); tw.className = 'tw';
    var spans = [];
    for (var g = 0; g < segs.length; g++) {
      var holder = tw;
      if (segs[g].b) { var bEl = document.createElement('b'); tw.appendChild(bEl); holder = bEl; }
      var t = segs[g].t;
      for (var k = 0; k < t.length; k++) {
        if (t[k] === '\n') { holder.appendChild(document.createElement('br')); continue; }
        var s = document.createElement('span');
        s.className = 'ch'; s.textContent = t[k];
        holder.appendChild(s); spans.push({ el: s, ch: t[k] });
      }
    }
    target.innerHTML = ''; target.appendChild(tw);
    animate(spans, done, mult);
  }
  function run() {
    typeText(el, full, function () { setTimeout(strike, 650); });
  }
  function strike() {
    el.classList.add('struck');                          // draw the line across the question
    setTimeout(function () {
      if (answerEl) typeText(answerEl, answerFull, function () {  // then the answer
        if (leadEl && leadSegs) setTimeout(function () {          // then the lead paragraph
          leadEl.style.opacity = '1'; typeSegs(leadEl, leadSegs, null, 1.6);
        }, 320);
      });
    }, 760);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(el); run(); } });
    }, { threshold: 0.5 });
    io.observe(el);
  } else { run(); }
})();
// hero hook — soft typewriter on load (keeps the bold second line)
(function () {
  var el = document.querySelector('.hero__hook');
  if (!el) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var parts = [
    { t: '추구미를 몰라도 괜찮습니다.', b: false },
    { br: true },
    { t: '우리가 찾아내고 조각하니까요.', b: true }
  ];
  el.style.animation = 'none'; el.style.opacity = '1';
  el.innerHTML = '';
  var spans = [];
  parts.forEach(function (p) {
    if (p.br) { el.appendChild(document.createElement('br')); return; }
    var holder = el;
    if (p.b) { var b = document.createElement('b'); el.appendChild(b); holder = b; }
    for (var i = 0; i < p.t.length; i++) {
      var s = document.createElement('span'); s.className = 'ch'; s.textContent = p.t[i];
      holder.appendChild(s); spans.push({ el: s, ch: p.t[i] });
    }
  });
  var i = 0;
  (function step() {
    if (i >= spans.length) return;
    spans[i].el.classList.add('on'); i++;
    var prev = spans[i - 1].ch;
    var ease = i < 5 ? 1.2 : 1;
    var base = 27 * ease + Math.random() * 15;
    setTimeout(step, prev === '.' ? 160 : base);
  })();
})();
// generic scroll-in typewriter for any [data-typer] element
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-typer]'));
  if (!els.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  function type(el) {
    var text = el.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    var tw = document.createElement('span'); tw.className = 'tw';
    var spans = [];
    for (var k = 0; k < text.length; k++) {
      if (text[k] === '\n') { tw.appendChild(document.createElement('br')); continue; }
      var s = document.createElement('span'); s.className = 'ch'; s.textContent = text[k];
      tw.appendChild(s); spans.push({ el: s, ch: text[k] });
    }
    el.innerHTML = ''; el.appendChild(tw);
    var i = 0;
    (function step() {
      if (i >= spans.length) return;
      spans[i].el.classList.add('on'); i++;
      var prev = spans[i - 1].ch;
      var ease = i < 5 ? 1.2 : 1;
      var base = 27 * ease + Math.random() * 16;
      setTimeout(step, prev === '\n' ? 190 : (prev === ',' || prev === '.' || prev === '?' ? 150 : base));
    })();
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); type(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(type); }
})();
// before / after — scroll-driven wipe (Before → After as you scroll)
(function () {
  var bas = Array.prototype.slice.call(document.querySelectorAll('[data-ba]'));
  if (!bas.length) return;
  var raf = false;
  function apply() {
    raf = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    bas.forEach(function (ba) {
      var r = ba.getBoundingClientRect();
      // hold on Before until the photo is well into view, then wipe to After by the time
      // it reaches the viewport center (After stays fully revealed while still on screen)
      var startTop = vh * 0.58;            // p=0 — transition begins here (later start)
      var endTop = vh / 2 - r.height / 2;  // p=1 — fully After when centered
      var p = (startTop - r.top) / (startTop - endTop);
      p = Math.max(0, Math.min(1, p));
      // start showing Before (100%), end on After (0%)
      ba.style.setProperty('--pos', ((1 - p) * 100).toFixed(1) + '%');
    });
  }
  function onScroll() { if (!raf) { raf = true; requestAnimationFrame(apply); } }
  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
// archive category filter
(function () {
  var tabs = document.querySelectorAll('.arc-tab');
  if (!tabs.length) return;
  var items = document.querySelectorAll('.arc');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      var cat = t.dataset.cat;
      items.forEach(function (it) {
        var show = cat === 'all' || it.dataset.cat === cat;
        it.classList.toggle('is-hidden', !show);
      });
    });
  });
})();
