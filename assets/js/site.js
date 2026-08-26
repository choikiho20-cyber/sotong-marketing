/* 소통마케팅센터 — 홈 모션
   1) 헤더 경계선  1b) 헤더 실시간 시계  2) 스크롤 진행바  3) 스크롤 리빌 + SVG 흐름 신호
   4) 히어로 스포트라이트  5) 마그네틱 버튼  6) 카드 3D 틸트
   7) 숫자 카운터  8) 히어로 검색순위 시연 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── 1. 헤더 ── */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── 1b. 헤더 실시간 시계 (제천 = 한국표준시 고정) ── */
  var clockEl = document.querySelector('[data-clock]');
  if (clockEl) {
    try {
      var clockFmt = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short'
      });
      var partValue = function (parts, type) {
        var p = parts.filter(function (x) { return x.type === type; })[0];
        return p ? p.value : '';
      };
      var updateClock = function () {
        var parts = clockFmt.formatToParts(new Date());
        /* 예: 2026.08.26 수 09:06 */
        clockEl.textContent = partValue(parts, 'year') + '.' + partValue(parts, 'month') + '.' + partValue(parts, 'day') +
          ' ' + partValue(parts, 'weekday') + ' ' + partValue(parts, 'hour') + ':' + partValue(parts, 'minute');
      };
      updateClock();
      setInterval(updateClock, 30000);
    } catch (e) {
      clockEl.style.display = 'none';
    }
  }

  /* ── 2. 스크롤 진행바 ── */
  var progress = document.querySelector('[data-progress]');
  if (progress) {
    var updateProgress = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* ── 2b. 플로팅 상담 버튼 ──
     히어로를 지나면 나타나고, 마지막 CTA 구간에서는 숨는다(버튼 중복 방지) */
  var fab = document.querySelector('[data-fab]');
  if (fab) {
    var heroSec = document.querySelector('[data-hero]');
    var contact = document.querySelector('#contact');
    var atContact = false;
    var passedHero = false;

    var toggleFab = function () {
      fab.classList.toggle('is-on', passedHero && !atContact);
    };

    if ('IntersectionObserver' in window) {
      /* 스크롤 좌표 대신 두 구간을 직접 관찰한다 — 주소창 높이 변화나
         프로그래매틱 스크롤에 흔들리지 않는다 */
      if (heroSec) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { passedHero = !e.isIntersecting; });
          toggleFab();
        }, { threshold: 0 }).observe(heroSec);
      }
      if (contact) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { atContact = e.isIntersecting; });
          toggleFab();
        }, { threshold: 0.12 }).observe(contact);
      }
    } else {
      window.addEventListener('scroll', function () {
        passedHero = window.scrollY > window.innerHeight * 0.6;
        toggleFab();
      }, { passive: true });
    }
    toggleFab();
  }

  /* ── 3. 스크롤 리빌 + SVG 흐름 신호 ── */
  var pulseMotion = document.getElementById('pipePulseMotion');
  var targets = document.querySelectorAll('.rv, .pipe__svg');

  var activatePipe = function (svg) {
    if (reduced || !pulseMotion || typeof pulseMotion.beginElement !== 'function') return;
    try { pulseMotion.beginElement(); } catch (e) { /* SMIL 미지원 브라우저는 조용히 무시 */ }
  };

  var pipe = document.querySelector('.pipe__svg');
  var pipeVisible = false;

  var replayPipe = function () {
    if (!pipe || reduced) return;
    pipe.classList.remove('is-in');
    void pipe.offsetWidth;            // 리플로우 강제 — 애니메이션 재시작 트릭
    pipe.classList.add('is-in');
    activatePipe(pipe);
  };

  if (!('IntersectionObserver' in window) || reduced) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === pipe) {
          /* 파이프라인은 한 번으로 끝내지 않는다 — 들어올 때마다 다시 그린다 */
          pipeVisible = e.isIntersecting;
          if (e.isIntersecting) replayPipe();
          else pipe.classList.remove('is-in');
          return;
        }
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

    /* 보고 있는 동안에도 7.5초마다 처음부터 다시 — 모션이 계속 산다 */
    if (pipe) {
      setInterval(function () { if (pipeVisible) replayPipe(); }, 7500);
    }
  }

  /* SVG 선 길이를 실제 path 길이로 맞춘다 (dash 애니메이션용) */
  Array.prototype.forEach.call(document.querySelectorAll('.pipe__svg .ln'), function (p) {
    var len = Math.ceil(p.getTotalLength());
    p.style.setProperty('--len', len);
  });

  /* ── 4. 히어로 스포트라이트 (포인터 기기만) ── */
  var hero = document.querySelector('[data-hero]');
  if (hero && canHover && !reduced) {
    hero.addEventListener('pointermove', function (ev) {
      var r = hero.getBoundingClientRect();
      var mx = ((ev.clientX - r.left) / r.width) * 100;
      var my = ((ev.clientY - r.top) / r.height) * 100;
      hero.style.setProperty('--mx', mx + '%');
      hero.style.setProperty('--my', my + '%');
      hero.classList.add('has-spot');
    });
    hero.addEventListener('pointerleave', function () {
      hero.classList.remove('has-spot');
    });
  }

  /* ── 5. 마그네틱 버튼 (포인터 기기만) ── */
  if (canHover && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnetic]'), function (btn) {
      btn.addEventListener('pointermove', function (ev) {
        var r = btn.getBoundingClientRect();
        var mx = ev.clientX - (r.left + r.width / 2);
        var my = ev.clientY - (r.top + r.height / 2);
        btn.style.setProperty('--magx', (mx * 0.22).toFixed(1) + 'px');
        btn.style.setProperty('--magy', (my * 0.28).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--magx', '0px');
        btn.style.setProperty('--magy', '0px');
      });
    });
  }

  /* ── 6. 3트랙 카드 3D 틸트 (포인터 기기만) ── */
  if (canHover && !reduced) {
    Array.prototype.forEach.call(document.querySelectorAll('.track'), function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (py * -8).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ── 7. 숫자 카운터 ── */
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    var runCounter = function (el) {
      var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
      if (reduced) { el.textContent = target; return; }
      var start = null;
      var dur = 1100;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, runCounter);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    }
  }

  /* ── 8. 히어로 검색순위 시연 ── */
  var rank = document.querySelector('[data-rank]');
  if (!rank) return;

  var QUERY = rank.getAttribute('data-query') || '';
  var qEl = rank.querySelector('.rank__q');
  var caret = rank.querySelector('.rank__caret');
  var badge = rank.querySelector('.rank__badge');
  var items = Array.prototype.slice.call(rank.querySelectorAll('.rank__item'));

  /* 순서 = 아이템의 data-id 배열. 앞에 있을수록 상위 노출. */
  var STEPS = [
    ['a', 'b', 'c', 'd', 'e', 'f', 'me'],
    ['a', 'b', 'c', 'me', 'd', 'e', 'f'],
    ['me', 'a', 'b', 'c', 'd', 'e', 'f']
  ];

  function place(order) {
    order.forEach(function (id, slot) {
      var el = items.filter(function (n) { return n.dataset.id === id; })[0];
      if (!el) return;
      el.style.setProperty('--slot', slot);
      el.querySelector('.rank__no').textContent = slot + 1;
    });
  }

  if (reduced) {
    qEl.textContent = QUERY;
    caret.classList.add('is-off');
    place(STEPS[STEPS.length - 1]);
    items.forEach(function (el) { el.classList.add('is-in'); });
    badge.classList.add('is-on');
    return;
  }

  place(STEPS[0]);

  var t = 0;
  var at = function (ms, fn) { t = ms; setTimeout(fn, ms); };

  /* 검색어 타이핑 */
  at(700, function () {
    var i = 0;
    (function type() {
      qEl.textContent = QUERY.slice(0, ++i);
      if (i < QUERY.length) setTimeout(type, 85);
      else setTimeout(function () { caret.classList.add('is-off'); }, 400);
    })();
  });

  /* 결과 등장 */
  at(700 + QUERY.length * 85 + 250, function () {
    items.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-in'); }, i * 55);
    });
  });

  /* 순위 상승 — 7위 → 4위 → 1위 */
  var base = t + items.length * 55 + 900;
  setTimeout(function () { place(STEPS[1]); }, base);
  setTimeout(function () { place(STEPS[2]); }, base + 1000);
  setTimeout(function () { badge.classList.add('is-on'); }, base + 1750);
})();
