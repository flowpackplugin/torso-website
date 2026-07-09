// nav: solid on scroll
const nav = document.querySelector('.nav');
if (nav){
  const hero = document.querySelector('body.home-film .hero--film');
  // on mobile home, keep the bar transparent over the dark hero — only go solid
  // once the hero has scrolled away, so no white bar floats over the dark film
  const threshold = () => {
    if (hero && window.matchMedia('(max-width:560px)').matches) return hero.offsetHeight - 70;
    return 40;
  };
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > threshold() || nav.dataset.always === '1');
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
}
// mobile burger — toggles the full-screen split menu (.nav__nav) overlay
const burger = document.querySelector('.nav__burger');
const navWrap = document.querySelector('.nav__nav');
if (burger && navWrap){
  // scissors toggle (closed by default, opens with the menu)
  burger.innerHTML = '<svg viewBox="0 0 26 24" aria-hidden="true">' +
    '<g class="handles">' +
      '<circle cx="5.1" cy="8.3" r="2.05"/><circle cx="5.1" cy="15.7" r="2.05"/>' +
      '<line x1="6.95" y1="9.45" x2="11" y2="12"/><line x1="6.95" y1="14.55" x2="11" y2="12"/>' +
    '</g>' +
    '<g class="bl bl-a"><line x1="11" y1="12" x2="24" y2="10.1"/></g>' +
    '<g class="bl bl-b"><line x1="11" y1="12" x2="24" y2="13.9"/></g>' +
    '<circle class="pivot" cx="11" cy="12" r="0.9"/>' +
    '</svg>';
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // close the overlay when any link is tapped
  navWrap.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}
// mobile floating Reserve button: rises once you leave the hero (2nd section),
// tucks away again near the booking section + while the menu is open
(function () {
  var fab = document.querySelector('.fab-reserve');
  if (!fab) return;
  var rsv = document.getElementById('reserve');
  function onScroll() {
    var show = window.scrollY > window.innerHeight * 0.6;
    // tuck away once the booking section (programs) is in view
    if (show && rsv && rsv.getBoundingClientRect().top < window.innerHeight * 0.9) show = false;
    // ...and near the footer on every page, so it never overlaps the bottom CTA
    if (show && (window.innerHeight + window.scrollY) > document.documentElement.scrollHeight - 140) show = false;
    fab.classList.toggle('show', show);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
// corephoto cards: hover-play on desktop, autoplay muted-loop on touch
(function () {
  var vids = document.querySelectorAll('.corephoto__img video');
  if (!vids.length) return;
  vids.forEach(function (v) { v.muted = true; v.loop = true; v.playsInline = true; });
  var touch = window.matchMedia && window.matchMedia('(hover:none)').matches;
  if (touch) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.play().catch(function () {}); }
          else { e.target.pause(); }
        });
      }, { threshold: 0.25 });
      vids.forEach(function (v) { io.observe(v); });
    } else {
      vids.forEach(function (v) { v.autoplay = true; v.play().catch(function () {}); });
    }
  } else {
    vids.forEach(function (v) {
      var card = v.closest('.corephoto');
      card.addEventListener('mouseenter', function () { v.play().catch(function () {}); });
      card.addEventListener('mouseleave', function () { v.pause(); try { v.currentTime = 0; } catch (e) {} });
    });
  }
})();
// 코어 카드 대표 미디어 로테이션 (영상 1 + 사진 3 크로스페이드)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) return;
  var canHover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  document.querySelectorAll('.corephoto__img').forEach(function (wrap) {
    var layers = Array.prototype.slice.call(wrap.children);
    if (layers.length < 2) return;
    var i = 0, timer = null;
    function show(k) {
      layers[i].classList.remove('on');
      i = k;
      layers[i].classList.add('on');
    }
    function step() { show((i + 1) % layers.length); }
    function start() { if (!timer) timer = setInterval(step, 3800); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.2 }).observe(wrap);
    } else { start(); }
    if (canHover) {
      var card = wrap.closest('.corephoto');
      card.addEventListener('mouseenter', function () { stop(); show(0); });
      card.addEventListener('mouseleave', function () { start(); });
    }
  });
})();
// ── 추구미 미디어 공용 데이터 (홈 패널 + 스타일 페이지 공용) ──
var TORSO_MEDIA = (function () {
  var V = 'assets/video/styles/';
  var IMG = 'assets/img/styles/';
  // n = 영상 개수(진성), photos = 사진별 시술 디자이너 (pX-Y_01.jpg부터 순서대로)
  // groups = 같은 인물의 사진 번호 묶음 → 한 타일에서 자동 크로스페이드 (미지정 시 사진 1장 = 타일 1개)
  var CORES = {
    sharp: { idx: '01', key: 'Sharp Core', name: '샤프 코어', styles: [
      { code: '1-1', name: '슬릭댄디', n: 4, photos: ['junyoung','junyoung','junyoung','jinhoon','jinhoon'],
        groups: [[1,2,3],[4,5]] },
      { code: '1-2', name: '필러스', n: 3, photos: ['junyoung','junyoung','junyoung','junghoon'],
        groups: [[1],[2,3],[4]] },
      { code: '1-3', name: '드롭 · 아이비 · 크롭', n: 5, photos: ['jinhoon','jinhoon','jinhoon','jinhoon','jinhoon'],
        groups: [[1,2,3],[4,5]] }
    ]},
    soft: { idx: '02', key: 'Soft Core', name: '소프트 코어', styles: [
      { code: '2-1', name: '시스루 댄디', n: 3, photos: ['junyoung','junyoung','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon'],
        groups: [[1,2],[3],[4,5,6,7],[8,9],[10,11,12]] },
      { code: '2-2', name: '세미리프', n: 3, photos: ['junyoung','junyoung','junyoung','jinhoon','jinhoon','junyoung'],
        groups: [[1,2,3],[4,5],[6]] },
      { code: '2-3', name: '쉐도우', n: 1, photos: ['junyoung','junyoung','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon','jinhoon'],
        groups: [[1,2],[3,4],[5,6,7],[8],[9]] }
    ]},
    classic: { idx: '03', key: 'Classic Core', name: '클래식 코어', styles: [
      { code: '3-1', name: '슬릭백', n: 3, photos: ['junyoung','junyoung'],
        groups: [[1,2]] },
      { code: '3-2', name: '가일', n: 1, photos: ['junghoon'] },
      { code: '3-3', name: '포마드', n: 2 }
    ]},
    archive: { idx: '04', key: 'Archive Core', name: '아카이브 코어', styles: [
      { code: '4-1', name: '텍스처컷', n: 4, photos: ['junyoung','junyoung','junyoung','junyoung','junyoung','junyoung'],
        groups: [[1,2,3],[4,5,6]] },
      { code: '4-2', name: '빈티지', n: 4, photos: ['jinhoon','jinhoon','jinhoon','junyoung','junyoung','junyoung'],
        groups: [[1,2,3],[4,5,6]] },
      { code: '4-3', name: '히피', n: 3 }
    ]}
  };
  // 디자이너별 네이버 예약 링크
  var BOOK = 'https://booking.naver.com/booking/13/bizes/242540/items/';
  var DESIGNERS = {
    jinsung:  { name: '진성',  url: BOOK + '3696795' },
    junyoung: { name: '준영',  url: BOOK + '6961265' },
    jinhoon:  { name: '진훈',  url: BOOK + '6826157' },
    junghoon: { name: '정훈',  url: BOOK + '7652510' },
    shop:     { name: '예약하기', url: BOOK + '6970009' } // 매장 공용
  };
  // 영상 → 시술 디자이너 마킹 (원장 마킹표 확정 시 여기만 채우면 됨)
  // 예: '1-1_01': 'junyoung',  ← 미마킹 영상 기본값은 진성 원장
  var VIDEO_DESIGNER = {};
  function pad2(k) { return (k < 10 ? '0' : '') + k; }
  // 사진 타일 묶음 목록 (groups 미지정 시 사진 1장 = 타일 1개)
  function groupsOf(st) {
    if (!st.photos) return [];
    if (st.groups) return st.groups;
    return st.photos.map(function (_, i) { return [i + 1]; });
  }
  // 타일 1개 HTML (영상+사진 공용, i = 1부터 시작하는 통합 인덱스)
  function tileHTML(st, i) {
    var isVid = i <= st.n;
    var media, dz;
    if (isVid) {
      var vid = st.code + '_' + pad2(i);
      dz = DESIGNERS[VIDEO_DESIGNER[vid]] || DESIGNERS.jinsung;
      media = '<video src="' + V + 's' + vid + '.mp4" muted loop playsinline preload="none"></video>';
    } else {
      var g = groupsOf(st)[i - st.n - 1];
      dz = DESIGNERS[st.photos[g[0] - 1]] || DESIGNERS.shop;
      if (g.length === 1) {
        media = '<img src="' + IMG + 'p' + st.code + '_' + pad2(g[0]) + '.jpg" alt="' + st.name + ' 시술 사진" loading="lazy">';
      } else {
        // 같은 인물 여러 컷 → 한 타일에서 자동 크로스페이드
        media = '<div class="pfade pfade--' + g.length + '">' + g.map(function (k, gi) {
          return '<img src="' + IMG + 'p' + st.code + '_' + pad2(k) + '.jpg" alt="' + st.name + ' 시술 사진 ' + (gi + 1) + '/' + g.length + '" loading="lazy" style="animation-delay:' + (gi * 2.5) + 's">';
        }).join('') + '</div>';
      }
    }
    return '<span class="vitem__tag">' + st.code + ' ' + st.name + ' · ' + i + '</span>' + media +
      '<a class="vitem__book" href="' + dz.url + '" target="_blank" rel="noopener">✂︎ ' + dz.name + ' · 예약</a>';
  }
  function count(st) { return st.n + groupsOf(st).length; }
  return { CORES: CORES, DESIGNERS: DESIGNERS, tileHTML: tileHTML, count: count };
})();

// 추구미 코어 카드 클릭 → 인라인 패널에 스타일별 영상 전체 나열 (자동재생, UI 없음)
(function () {
  var panel = document.getElementById('corePanel');
  var panelIn = document.getElementById('corePanelIn');
  if (!panel || !panelIn) return;
  var CORES = TORSO_MEDIA.CORES;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.corephoto--click'));
  var openKey = null;
  var vio = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.play().catch(function () {}); }
      else { e.target.pause(); }
    });
  }, { threshold: 0.2 }) : null;
  var mq = window.matchMedia('(max-width:900px)');
  function close() {
    openKey = null;
    cards.forEach(function (el) { el.classList.remove('sel'); });
    panel.classList.remove('open');
    document.body.classList.remove('core-lock');
    panelIn.querySelectorAll('video').forEach(function (v) { v.pause(); if (vio) vio.unobserve(v); });
    setTimeout(function () { if (!openKey) panelIn.innerHTML = ''; }, 600);
  }
  function render(key) {
    var core = CORES[key];
    panelIn.innerHTML = '';
    var head = document.createElement('div'); head.className = 'core-panel__head';
    head.innerHTML = '<span class="core-panel__core">' + core.idx + ' · ' + core.key + ' — ' + core.name + '</span>' +
      '<button class="core-panel__x" type="button">닫기 ×</button>';
    head.querySelector('button').addEventListener('click', close);
    panelIn.appendChild(head);
    var strip = document.createElement('div'); strip.className = 'vgrid vgrid--one';
    core.styles.forEach(function (st) {
      var lab = document.createElement('div'); lab.className = 'vsep';
      lab.innerHTML = '<small>' + st.code + '</small><span>' + st.name + '</span>';
      strip.appendChild(lab);
      var total = TORSO_MEDIA.count(st);
      for (var i = 1; i <= total; i++) {
        var d = document.createElement('div'); d.className = 'vitem';
        d.innerHTML = TORSO_MEDIA.tileHTML(st, i);
        strip.appendChild(d);
      }
    });
    // 타일 순차 슬라이드 인: 왼쪽부터 하나씩 딜레이
    // (모바일은 오버레이 슬라이드 업 .5s가 끝나갈 때부터 시작해 자연스럽게 이어지도록)
    var baseDelay = mq.matches ? 0.35 : 0.1;
    Array.prototype.forEach.call(strip.children, function (el, i) {
      el.style.animationDelay = (baseDelay + i * 0.06).toFixed(2) + 's';
    });
    panelIn.appendChild(strip);
    panelIn.querySelectorAll('video').forEach(function (v) {
      v.muted = true;
      if (vio) vio.observe(v); else { v.autoplay = true; v.play().catch(function () {}); }
    });
    if (mq.matches) {
      // 모바일: 미디어가 준비되면 페이드 인 — 갑자기 팝인하지 않도록 (pfade 묶음은 자체 크로스페이드)
      Array.prototype.forEach.call(strip.querySelectorAll('.vitem>img'), function (im) {
        if (im.complete && im.naturalWidth) { im.classList.add('ld'); }
        else { im.addEventListener('load', function () { im.classList.add('ld'); }, { once: true }); }
      });
      Array.prototype.forEach.call(strip.querySelectorAll('.vitem>video'), function (v) {
        if (v.readyState >= 2) { v.classList.add('ld'); }
        else { v.addEventListener('loadeddata', function () { v.classList.add('ld'); }, { once: true }); }
      });
    }
  }
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var key = card.dataset.core;
      if (openKey === key) { close(); return; }
      openKey = key;
      cards.forEach(function (el) { el.classList.toggle('sel', el === card); });
      if (mq.matches) {
        // 모바일: 오버레이 슬라이드 업을 먼저 시작(빈 패널) → 무거운 타일 렌더는 살짝 뒤에
        // (렌더의 DOM 작업이 슬라이드 트랜지션 시작을 끊어 버벅이던 문제 분리)
        document.body.classList.add('core-lock');
        panel.classList.add('open');
        panel.scrollTop = 0;
        setTimeout(function () { if (openKey === key) render(key); }, 90);
      } else {
        render(key);
        panel.classList.add('open');
        setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 150);
      }
    });
  });
})();
// 스타일 페이지: 스타일별 영상·사진 전체 나열 (.smedia[data-style])
(function () {
  var grids = document.querySelectorAll('.smedia[data-style]');
  if (!grids.length) return;
  var byCode = {};
  Object.keys(TORSO_MEDIA.CORES).forEach(function (k) {
    TORSO_MEDIA.CORES[k].styles.forEach(function (st) { byCode[st.code] = st; });
  });
  var vio = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.play().catch(function () {}); }
      else { e.target.pause(); }
    });
  }, { threshold: 0.2 }) : null;
  grids.forEach(function (g) {
    var st = byCode[g.dataset.style];
    if (!st) return;
    var total = TORSO_MEDIA.count(st);
    for (var i = 1; i <= total; i++) {
      var d = document.createElement('div'); d.className = 'vitem';
      d.innerHTML = TORSO_MEDIA.tileHTML(st, i);
      g.appendChild(d);
    }
    g.querySelectorAll('video').forEach(function (v) {
      v.muted = true;
      if (vio) vio.observe(v); else { v.autoplay = true; v.play().catch(function () {}); }
    });
  });
})();
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
            ' .split img, .band > *, .info-row, .gal img, .map-links, .loc-map, #reserve,' +
            ' .corephoto, .stat, .tocademy, .styleblock';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!els.length) return;
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 8% 0px' });
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) { el.classList.add('in'); return; } // already in view
    el.classList.add('reveal');
    // light stagger inside card grids
    var p = el.parentElement;
    if (p && (p.classList.contains('feature-grid') || p.classList.contains('desg-grid') || p.classList.contains('gal') || p.classList.contains('corephoto-grid') || p.classList.contains('stat-grid'))) {
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
// program prices — tabs (디렉터 / 실장 / 원장) + discount toggles + digit-roll
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs = document.querySelectorAll('.price-tab');
  if (!tabs.length) return;
  var thumb = document.querySelector('.price-tabs__thumb');

  // build a number string into slot columns (digits roll up into place)
  function fmt(n) { return n.toLocaleString('en-US'); }
  function buildNum(text) {
    var wrap = document.createElement('span'); wrap.className = 'num';
    var digits = [];
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
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
    return { wrap: wrap, digits: digits };
  }
  function settle(digits) { digits.forEach(function (d) { d.col.style.transition = 'none'; d.col.style.opacity = '1'; d.col.style.transform = 'translateY(-' + d.target + 'em)'; }); }
  function roll(digits, base) {
    digits.forEach(function (d, i) {
      d.col.style.transition = 'none'; d.col.style.transform = 'translateY(0)'; d.col.style.opacity = '0';
      void d.col.offsetHeight;
      setTimeout(function () {
        d.col.style.transition = 'transform .42s cubic-bezier(.16,.84,.44,1), opacity .38s ease';
        d.col.style.transform = 'translateY(-' + d.target + 'em)'; d.col.style.opacity = '1';
      }, base + i * 45);
    });
  }
  function discounted(base, mode) {
    if (mode === 'npay') return Math.round(base * 0.9);
    if (mode === 'first') return Math.round(base * 0.5);
    if (mode === 'first30') return Math.round(base * 0.7);
    return base;
  }
  var WHO = { first: { pct: '50%', names: '진훈 · 정훈' }, first30: { pct: '30%', names: '준영' } };
  function updateWho(card) {
    var who = card.querySelector('[data-disc-who]');
    if (!who) return;
    var info = WHO[card.dataset.disc || ''];
    if (info) {
      who.innerHTML = '<span class="price-who__pct">' + info.pct + '</span> 첫 방문 할인 디자이너 · <strong>' + info.names + '</strong>';
      who.hidden = false;
    } else {
      who.hidden = true;
    }
  }
  function renderPay(el, mode, rowIdx, doAnim) {
    var base = parseInt(el.dataset.base, 10);
    if (!base) return;                                   // skip 추후 공개 rows
    el.classList.remove('is-disc'); el.innerHTML = '';
    if (!mode) {
      var cur = buildNum(fmt(base)); el.appendChild(cur.wrap);
      if (doAnim && !reduce) roll(cur.digits, rowIdx * 70); else settle(cur.digits);
    } else {
      var oldEl = document.createElement('s'); oldEl.className = 'pay__old'; oldEl.textContent = fmt(base); el.appendChild(oldEl);
      var neu = document.createElement('span'); neu.className = 'pay__new pay__new--' + mode;
      var nn = buildNum(fmt(discounted(base, mode))); neu.appendChild(nn.wrap); el.appendChild(neu);
      var lbl = document.createElement('span'); lbl.className = 'pay__lbl pay__lbl--' + mode;
      var lblMap = { npay: 'N페이 10%', first: '첫방문 50%', first30: '첫방문 30%' };
      lbl.textContent = lblMap[mode] || ''; el.appendChild(lbl);
      if (doAnim && !reduce) roll(nn.digits, 60); else settle(nn.digits);
      void el.offsetHeight;
      requestAnimationFrame(function () { el.classList.add('is-disc'); });   // draw strike + reveal new
    }
  }
  function renderCard(card, doAnim) {
    if (!card) return;
    var mode = card.dataset.disc || '', idx = 0;
    card.querySelectorAll('.pay').forEach(function (el) {
      if (!el.dataset.base) return;
      renderPay(el, mode, idx, doAnim); idx++;
    });
    updateWho(card);
  }

  // discount toggle buttons (mutually exclusive within a card)
  document.querySelectorAll('.price-card').forEach(function (card) {
    card.querySelectorAll('.perk--btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = (card.dataset.disc === btn.dataset.disc) ? '' : btn.dataset.disc;
        card.dataset.disc = next;
        card.querySelectorAll('.perk--btn').forEach(function (b) {
          b.setAttribute('aria-pressed', b.dataset.disc === next ? 'true' : 'false');
        });
        renderCard(card, true);
      });
    });
  });

  // tabs: pill slide + show/hide cards
  function moveThumb(btn) {
    if (!thumb || !btn) return;
    thumb.style.left = btn.offsetLeft + 'px'; thumb.style.top = btn.offsetTop + 'px';
    thumb.style.width = btn.offsetWidth + 'px'; thumb.style.height = btn.offsetHeight + 'px';
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
      t.classList.add('active'); moveThumb(t);
      document.querySelectorAll('.price-card').forEach(function (c) { c.classList.add('hidden'); });
      var shown = document.getElementById('price-' + t.dataset.tab);
      if (shown) { shown.classList.remove('hidden'); renderCard(shown, true); }
    });
  });

  // initial: settle base values, then roll when the active card scrolls into view
  var active = document.querySelector('.price-card:not(.hidden)');
  if (active) {
    renderCard(active, false);
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { renderCard(e.target, true); io.unobserve(e.target); } });
      }, { threshold: 0.2 });
      io.observe(active);
    }
  }
})();
// ── typewriter module: hero opener (question→strike→answer) + manifesto (lead + closing) ──
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // read a node's children into typed segments (text / <b> / <br>)
  function collectSegs(node) {
    var segs = [], ns = node.childNodes;
    for (var j = 0; j < ns.length; j++) {
      var n = ns[j];
      if (n.nodeType === 3) segs.push({ t: n.textContent.replace(/\s+/g, ' '), b: false });
      else if (n.nodeName === 'BR') segs.push({ t: '\n', b: false });
      else segs.push({ t: n.textContent.replace(/\s+/g, ' '), b: n.nodeName === 'B' });
    }
    if (segs.length) {                                   // drop indentation/newlines at the very ends
      segs[0].t = segs[0].t.replace(/^\s+/, '');
      segs[segs.length - 1].t = segs[segs.length - 1].t.replace(/\s+$/, '');
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
      var base = (14 * ease + Math.random() * 8) * mult;
      var delay = prev === '\n' ? 120 : (prev === ',' || prev === '?' || prev === '.' ? 90 * mult : base);
      setTimeout(step, delay);
    })();
  }
  // typewriter that preserves bold runs (segments from collectSegs)
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

  // HERO opener: type the question, strike it, then type the answer
  (function () {
    var q = document.querySelector('.hero__q');
    if (!q) return;
    var a = document.querySelector('.hero__a');
    var qSegs = collectSegs(q);
    var aSegs = a ? collectSegs(a) : null;
    if (reduce) return;
    q.style.animation = 'none'; q.style.minHeight = q.offsetHeight + 'px'; q.innerHTML = ''; q.style.opacity = '1';
    if (a) { a.style.animation = 'none'; a.style.minHeight = a.offsetHeight + 'px'; a.innerHTML = ''; a.style.opacity = '0'; }
    setTimeout(function () {
      typeSegs(q, qSegs, function () {
        if (a) setTimeout(function () { a.style.opacity = '1'; typeSegs(a, aSegs); }, 220);
      });
    }, 150);
  })();

  // PROOF hook: type the differentiation line when scrolled into view
  (function () {
    var el = document.querySelector('.proof__hook');
    if (!el) return;
    var segs = collectSegs(el);
    if (reduce) return;
    el.style.minHeight = el.offsetHeight + 'px'; el.innerHTML = ''; el.style.opacity = '0';
    function run() { el.style.opacity = '1'; typeSegs(el, segs, null, 1.2); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); run(); } });
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      io.observe(el);
      // safety net: reveal anyway if it's on screen but never triggered
      setTimeout(function () {
        if (el.style.opacity === '0') {
          var r = el.getBoundingClientRect();
          if (r.top < (window.innerHeight || 0) && r.bottom > 0) { io.disconnect(); run(); }
        }
      }, 1400);
    } else { run(); }
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
      var base = 14 * ease + Math.random() * 8;
      setTimeout(step, prev === '\n' ? 120 : (prev === ',' || prev === '.' || prev === '?' ? 90 : base));
    })();
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); type(e.target); } });
    }, { threshold: 0.2 });
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
// authority stats — slot digit-roll (same as program prices) when scrolled into view
(function () {
  var nums = Array.prototype.slice.call(document.querySelectorAll('.stat__num'));
  if (!nums.length) return;
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
  function settle(el) {
    if (el._digits) el._digits.forEach(function (d) {
      d.col.style.transition = 'none'; d.col.style.opacity = '1';
      d.col.style.transform = 'translateY(-' + (d.target * 1.25) + 'em)';
    });
  }
  function roll(el) {
    if (!el._digits) return;
    el._digits.forEach(function (d, i) {
      d.col.style.transition = 'none';
      d.col.style.transform = 'translateY(0)';
      d.col.style.opacity = '0';
      void d.col.offsetHeight;
      setTimeout(function () {
        d.col.style.transition = 'transform .7s cubic-bezier(.16,.84,.44,1), opacity .5s ease';
        d.col.style.transform = 'translateY(-' + (d.target * 1.25) + 'em)';
        d.col.style.opacity = '1';
      }, i * 80);
    });
  }
  nums.forEach(build);
  if (reduce || !('IntersectionObserver' in window)) { nums.forEach(settle); return; }
  nums.forEach(function (el) {                       // hidden until scrolled into view
    if (el._digits) el._digits.forEach(function (d) { d.col.style.opacity = '0'; });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); roll(e.target); } });
  }, { threshold: 0.45 });
  nums.forEach(function (el) { io.observe(el); });
})();
// scroll progress (thin top line)
(function () {
  var bar = document.createElement('div'); bar.id = 'scrollprog'; document.body.appendChild(bar);
  var raf = false;
  function upd() {
    raf = false;
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  function onScroll() { if (!raf) { raf = true; requestAnimationFrame(upd); } }
  upd(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
})();
// before/after comparison slider — drag anywhere on the image (touch + mouse + pen) plus keyboard via the range
(function () {
  document.querySelectorAll('.ba').forEach(function (ba) {
    var range = ba.querySelector('.ba__range');
    function apply(v) {
      v = Math.max(0, Math.min(100, v));
      ba.style.setProperty('--pos', v + '%');
      // pill glow: handle to the right reveals more "before", lighting the BEFORE pill; left lights AFTER
      ba.style.setProperty('--b-glow', Math.max(0, (v - 50) / 50).toFixed(3));
      ba.style.setProperty('--a-glow', Math.max(0, (50 - v) / 50).toFixed(3));
      if (range && +range.value !== v) range.value = v;
    }
    function posFromX(clientX) {
      var r = ba.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    }
    if (range) {
      range.addEventListener('input', function () { apply(+range.value); ba.classList.add('is-touched'); });
      apply(+range.value);
    } else {
      apply(50);
    }
    // pointer drag from anywhere on the image; decide horizontal vs vertical so the page can still scroll
    var active = false, decided = false, startX = 0, startY = 0;
    ba.addEventListener('pointerdown', function (e) {
      active = true; decided = false; startX = e.clientX; startY = e.clientY;
    });
    ba.addEventListener('pointermove', function (e) {
      if (!active) return;
      if (!decided) {
        var dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx < 5 && dy < 5) return;          // too small to judge yet
        if (dy > dx) { active = false; return; } // vertical intent -> let the page scroll
        decided = true;
        try { ba.setPointerCapture(e.pointerId); } catch (err) {}
        ba.classList.add('is-touched');
        apply(posFromX(startX));               // snap to where the drag began
      }
      e.preventDefault();
      apply(posFromX(e.clientX));
    }, { passive: false });
    function end() { active = false; decided = false; }
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
  });
})();
// before/after — mobile auto-sweep tied to scroll (so visitors see the reveal without dragging)
// As each comparison slider travels through the viewport, the divider sweeps Before<->After.
// Manual drag wins: once a slider is touched it stops auto-driving. Desktop uses hover-reveal, so skip there.
(function () {
  var finePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (finePointer) return;                       // desktop hover devices keep the hover-to-reveal behaviour
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var bas = Array.prototype.slice.call(document.querySelectorAll('.rev--ba .ba'));
  if (!bas.length) return;
  if (reduce) {                                  // no motion: rest at a clear half/half comparison
    bas.forEach(function (ba) { if (!ba.classList.contains('is-touched')) ba.style.setProperty('--pos', '50%'); });
    return;
  }
  function setPos(ba, v) {
    v = Math.max(0, Math.min(100, v));
    ba.style.setProperty('--pos', v.toFixed(1) + '%');
    ba.style.setProperty('--b-glow', Math.max(0, (v - 50) / 50).toFixed(3));
    ba.style.setProperty('--a-glow', Math.max(0, (50 - v) / 50).toFixed(3));
  }
  var raf = false;
  function apply() {
    raf = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    bas.forEach(function (ba) {
      if (ba.classList.contains('is-touched')) return;   // user took over — leave it alone
      var r = ba.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;            // off-screen: don't bother
      // Concentrate the full Before<->After sweep into the comfortable viewing band so the
      // divider + grip visibly travel ACROSS the card while it's on screen — not only when it's
      // half-cut at the extreme top/bottom edges (which felt like "the photo changes but the
      // handle stays put"). Card entering from the bottom = Before(100); leaving at top = After(0).
      var centre = r.top + r.height / 2;
      var startBand = vh * 0.82;                          // well into view from the bottom -> Before
      var endBand = vh * 0.18;                            // about to leave at the top      -> After
      var p = (startBand - centre) / (startBand - endBand);
      p = Math.max(0, Math.min(1, p));                    // 0 -> 1 as the card scrolls upward
      setPos(ba, (1 - p) * 100);
    });
  }
  function onScroll() { if (!raf) { raf = true; requestAnimationFrame(apply); } }
  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

// ===== GA4 이벤트 트래킹: 예약 버튼 클릭 =====
// booking_click = 네이버 예약 링크 클릭(실질 전환 지표), reserve_click = 사이트 내 예약 유도 버튼
(function () {
  var BOOK_NAMES = { '3696795': '진성', '6961265': '준영', '6826157': '진훈', '7652510': '정훈', '6970009': '매장공용' };
  var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  function btnLocation(a) {
    if (a.classList.contains('vitem__book')) return 'style_tile';
    if (a.classList.contains('desg__book')) return 'designer_card';
    if (a.classList.contains('fab-reserve')) return 'floating';
    if (a.classList.contains('nav__cta')) return 'nav';
    if (a.closest('.foot')) return 'footer';
    if (a.closest('.band')) return 'cta_band';
    if (a.closest('.hero')) return 'hero';
    if (a.closest('.desg')) return 'designer_sns';
    return 'other';
  }
  document.addEventListener('click', function (e) {
    if (typeof gtag !== 'function') return;
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('booking.naver.com') !== -1) {
      var m = href.match(/items\/(\d+)/);
      gtag('event', 'booking_click', {
        designer: (m && BOOK_NAMES[m[1]]) || 'unknown',
        button_location: btnLocation(a),
        page_name: page
      });
    } else if (href.indexOf('designers.html') !== -1 &&
      (a.classList.contains('fab-reserve') || a.classList.contains('nav__cta') || a.classList.contains('btn'))) {
      gtag('event', 'reserve_click', { button_location: btnLocation(a), page_name: page });
    }
  }, true);
})();
