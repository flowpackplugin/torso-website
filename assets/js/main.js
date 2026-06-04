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
  burger.addEventListener('click', () => menu.classList.toggle('open'));
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
// price tabs + discount stack(roll) animation
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function regStr(el) {
    var row = el.closest('.price-row'); var r = row && row.querySelector('.reg');
    return r ? r.textContent.trim() : null;
  }
  // build a vertical roller: [original price] over [discounted price]
  function build(el) {
    if (el.dataset.roll) return true;
    var endStr = el.textContent.trim(), st = regStr(el);
    if (!st) return false;
    var a = parseInt(st.replace(/[^0-9]/g, ''), 10), b = parseInt(endStr.replace(/[^0-9]/g, ''), 10);
    if (!a || !b || a <= b) return false;
    el.dataset.roll = '1';
    el.innerHTML = '<span class="roll"><span class="roll__col"><span>' + st + '</span><span>' + endStr + '</span></span></span>';
    return true;
  }
  if (!reduce) document.querySelectorAll('.price-card .pay .hot').forEach(build);
  function animateCard(card) {
    if (!card || reduce) return;
    card.querySelectorAll('.pay .hot').forEach(function (el, i) {
      if (el.dataset.done) return;
      var col = el.querySelector('.roll__col');
      if (!col) return;
      el.dataset.done = '1';
      setTimeout(function () { col.classList.add('go'); }, 150 + i * 150);
    });
  }
  var active = document.querySelector('.price-card:not(.hidden)');
  if (active && !reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { animateCard(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.18 });
    io.observe(active);
  }
  var tabs = document.querySelectorAll('.price-tab');
  var thumb = document.querySelector('.price-tabs__thumb');
  function moveThumb(btn) {
    if (!thumb || !btn) return;
    thumb.style.left = btn.offsetLeft + 'px';
    thumb.style.top = btn.offsetTop + 'px';
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.height = btn.offsetHeight + 'px';
  }
  var activeTab = document.querySelector('.price-tab.active');
  if (activeTab) {
    // jump to start position without animating
    if (thumb) { var pre = thumb.style.transition; thumb.style.transition = 'none'; moveThumb(activeTab); requestAnimationFrame(function () { thumb.style.transition = pre; }); }
  }
  window.addEventListener('resize', function () { moveThumb(document.querySelector('.price-tab.active')); });
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      moveThumb(t);
      document.querySelectorAll('.price-card').forEach(function (c) { c.classList.add('hidden'); });
      var shown = document.getElementById('price-' + t.dataset.tab);
      shown.classList.remove('hidden');
      animateCard(shown);
    });
  });
})();
