/* ============================================
   LIBERTÉ COFFEE V2 — Page Scripts
   ============================================ */
(function () {
  'use strict';


  /* ---------- Hamburger toggle ---------- */
  var hamburger = document.getElementById('hamburger');
  var siteNav = document.getElementById('siteNav');

  if (hamburger && siteNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('is-open');
      siteNav.classList.toggle('is-open');
    });
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true
  });

  window.lenis = lenis;

  /* ---------- GSAP ScrollTrigger sync ---------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ---------- Hero pinned timeline ---------- */
    var heroIndex = document.querySelector('.hero__index');
    var heroBox = document.querySelector('.hero__box');
    var isMobile = window.innerWidth < 1025;

    if (heroIndex && heroBox) {
      if (isMobile) {
        /* Mobile: simple fade out of the entire hero box */
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero-wrap',
            start: 'top top',
            end: '+=30%',
            scrub: true
          }
        });

        tl.to([heroBox, '.hero__reindeer'], {
          opacity: 0,
          duration: 1,
          ease: 'none'
        }, 0);

      } else {
        /* Desktop/tablet: full pinned animation with title + index repositioning */
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero-wrap',
            start: 'top top',
            end: '+=40%',
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            onLeave: function () {
              gsap.set('.hero__index-fixed', { opacity: 1, pointerEvents: 'auto' });
              gsap.set(heroIndex, { opacity: 0 });
            },
            onEnterBack: function () {
              gsap.set('.hero__index-fixed', { opacity: 0, pointerEvents: 'none' });
              gsap.set(heroIndex, { opacity: 1 });
            }
          }
        });

        var heroTitle = document.querySelector('.hero__title');

        /* Box bg + tagline fade out (first 40%) */
        tl.to('.hero__box-bg, .hero__tagline', {
          opacity: 0,
          duration: 0.4,
          ease: 'none'
        }, 0);

        /* Reindeer fades out slightly later (first 55%) */
        tl.to('.hero__reindeer', {
          opacity: 0,
          duration: 0.55,
          ease: 'none'
        }, 0);

        /* Title moves to top-left corner, aligned with logo */
        tl.to(heroTitle, {
          x: function () {
            var titleRect = heroTitle.getBoundingClientRect();
            return 24 - titleRect.left;
          },
          y: function () {
            var titleRect = heroTitle.getBoundingClientRect();
            return 80 - titleRect.top;
          },
          scale: 0.85,
          transformOrigin: 'top left',
          duration: 1,
          ease: 'power2.out'
        }, 0);

        /* Dim non-first index rows to match fixed index */
        tl.to('.hero__index .hero__index-row:not(:first-child)', {
          opacity: 0.3,
          duration: 0.3,
          ease: 'none'
        }, 0);

        /* Index moves to bottom-left area */
        tl.to(heroIndex, {
          x: function () {
            var indexRect = heroIndex.getBoundingClientRect();
            return (window.innerWidth * 0.08) - indexRect.left;
          },
          y: function () {
            var indexRect = heroIndex.getBoundingClientRect();
            var targetBottom = window.innerHeight * 0.95;
            return (targetBottom - indexRect.height) - indexRect.top;
          },
          width: 160,
          scale: 0.85,
          transformOrigin: 'bottom left',
          duration: 1,
          ease: 'power2.out'
        }, 0);
      }
    }

    /* ---------- Hero video parallax (scrolls out slower) ---------- */
    var heroVideo = document.querySelector('.hero__video-wrap');
    if (heroVideo) {
      gsap.to(heroVideo, {
        yPercent: isMobile ? 8 : 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-wrap',
          start: 'bottom bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    /* ---------- Solution unboxing ---------- */
    var solOpenBox = document.querySelector('.solution__box-open');
    var solClosedBox = document.querySelector('.solution__box-closed');

    if (solOpenBox && solClosedBox) {
      // Align open box left edge with closed box
      function positionSolOpenBox() {
        solOpenBox.style.left = solClosedBox.offsetLeft + 'px';
      }
      positionSolOpenBox();
      window.addEventListener('resize', positionSolOpenBox);

      var solBox = document.querySelector('.solution__box');

      var solTl = gsap.timeline({
        scrollTrigger: {
          trigger: solBox,
          start: 'top bottom',
          end: 'top 25%',
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      // Unboxing: closed slides right, open slides left
      solTl.to(solClosedBox, {
        x: function () { return solOpenBox.offsetWidth / 2; },
        duration: 1,
        ease: 'none'
      }, 0);

      solTl.to(solOpenBox, {
        x: function () { return -(solOpenBox.offsetWidth / 2) + 5; },
        duration: 1,
        ease: 'none'
      }, 0);

      // Parallax: box drifts down (desktop only)
      if (window.innerWidth >= 1025) {
        gsap.to(solBox, {
          yPercent: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scene--solution',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }

    /* ---------- Brand video parallax ---------- */
    var brandVideo = document.querySelector('.brand__video-wrap');
    if (brandVideo) {
      gsap.to(brandVideo, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.scene--brand',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    /* ---------- Mountain bottom parallax (moves down + shrinks) ---------- */
    var mountainBottom = document.querySelector('.brand__mountain-bottom');
    if (mountainBottom) {
      gsap.fromTo(mountainBottom, {
        yPercent: 0,
        scale: 1.8
      }, {
        yPercent: 30,
        scale: 1.65,
        ease: 'none',
        scrollTrigger: {
          trigger: mountainBottom,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    /* ---------- Brand logo + foil parallax ---------- */
    var brandLogo = document.querySelector('.brand__logo');
    var brandFoil = document.querySelector('.brand__foil');
    if (brandLogo && brandFoil) {
      gsap.to(brandFoil, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.brand__logo-wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
      gsap.to(brandLogo, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.brand__logo-wrap',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    /* ---------- Index section highlighting ---------- */
    var contentSections = document.querySelectorAll('[data-section-index]');
    var fixedRows = document.querySelectorAll('.hero__index-fixed .hero__index-row');
    var fixedIndex = document.querySelector('.hero__index-fixed');

    function activateRow(idx, section) {
      fixedRows.forEach(function(row, j) {
        row.classList.toggle('is-active', j === idx);
      });
      if (fixedIndex) {
        fixedIndex.classList.toggle('is-light', section.classList.contains('scene--light'));
      }
    }

    contentSections.forEach(function(section) {
      var idx = parseInt(section.getAttribute('data-section-index'), 10);
      ScrollTrigger.create({
        trigger: section,
        start: 'top 95%',
        end: 'bottom 95%',
        onEnter: function() { activateRow(idx, section); },
        onEnterBack: function() { activateRow(idx, section); }
      });
    });

    /* ---------- Index color inversion for brand dark section ---------- */
    var brandDark = document.querySelector('.brand__dark');
    if (fixedIndex && brandDark) {
      ScrollTrigger.create({
        trigger: brandDark,
        start: 'top 95%',
        end: 'bottom 95%',
        onEnter: function() { fixedIndex.classList.add('is-inverted'); },
        onLeave: function() { fixedIndex.classList.remove('is-inverted'); },
        onEnterBack: function() { fixedIndex.classList.add('is-inverted'); },
        onLeaveBack: function() { fixedIndex.classList.remove('is-inverted'); }
      });
    }

    /* ---------- Fixed index click-to-scroll ---------- */
    fixedRows.forEach(function(row) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() {
        var idx = parseInt(row.getAttribute('data-index-row'), 10);
        var target = document.querySelector('[data-section-index="' + idx + '"]');
        if (!target) return;
        var heading = target.querySelector('h2');
        if (!heading) return;
        var offset = heading.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.15;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      });
    });

    /* ---------- Inline index click-to-scroll ---------- */
    var inlineRows = document.querySelectorAll('.hero__index .hero__index-row');
    inlineRows.forEach(function(row) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() {
        var idx = parseInt(row.getAttribute('data-index-row'), 10);
        var target = document.querySelector('[data-section-index="' + idx + '"]');
        if (!target) return;
        var heading = target.querySelector('h2');
        if (!heading) return;
        var offset = heading.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.15;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      });
    });

    /* ---------- Fixed index scrolls away with skills section ---------- */
    var skillsBoxEl = document.querySelector('.skills-box');
    if (fixedIndex && skillsBoxEl) {
      var distance = window.innerHeight;
      gsap.to(fixedIndex, {
        y: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: skillsBoxEl,
          start: 'bottom 95%',
          end: '+=' + distance,
          scrub: true
        }
      });
    }

    /* ---------- Scroll timeline indicator ---------- */
    var timelineDot = document.querySelector('.scroll-timeline__dot');
    if (timelineDot) {
      gsap.to(timelineDot, {
        top: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
    }
  }

  /* ---------- 3D mouse follow on hero box ---------- */
  var box3d = document.querySelector('.hero__box');
  if (box3d && window.innerWidth >= 768) {
    var MAX_ROT = 8;
    var LERP = 0.06;
    var rotX = 0;
    var rotY = 0;

    var isHeroVisible = true;
    var heroObserver = new IntersectionObserver(
      function(entries) { isHeroVisible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    heroObserver.observe(document.querySelector('.hero-wrap'));

    function boxTiltLoop() {
      if (!isHeroVisible) {
        requestAnimationFrame(boxTiltLoop);
        return;
      }

      var scrolled = window.scrollY > 5;

      if (!scrolled) {
        var targetRotY = window.__mouseX * MAX_ROT;
        var targetRotX = window.__mouseY * -MAX_ROT;

        rotX += (targetRotX - rotX) * LERP;
        rotY += (targetRotY - rotY) * LERP;
      } else {
        rotX += (0 - rotX) * 0.15;
        rotY += (0 - rotY) * 0.15;
      }

      var tilt = Math.sqrt(rotX * rotX + rotY * rotY);
      var lift = scrolled ? 0 : (tilt / MAX_ROT) * 12;
      box3d.style.transform =
        'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateZ(' + lift.toFixed(1) + 'px)';

      requestAnimationFrame(boxTiltLoop);
    }

    requestAnimationFrame(boxTiltLoop);
  }

  /* ---------- Idle spotlight — rotate one highlighted card ---------- */
  var gapCards = document.querySelector('.gap__cards');

  if (gapCards && window.innerWidth >= 768) {
    var interactiveCards = gapCards.querySelectorAll('.gap__card[data-card="interactive"]');
    var spotlightIndex = 0;
    var spotlightTimer = null;

    function setSpotlight(idx) {
      interactiveCards.forEach(function (c) { c.classList.remove('gap__card--spotlight'); });
      interactiveCards[idx].classList.add('gap__card--spotlight');
    }

    function startSpotlight() {
      gapCards.classList.add('gap__cards--idle');
      setSpotlight(spotlightIndex);
      spotlightTimer = setInterval(function () {
        spotlightIndex = (spotlightIndex + 1) % interactiveCards.length;
        setSpotlight(spotlightIndex);
      }, 3000);
    }

    function stopSpotlight() {
      gapCards.classList.remove('gap__cards--idle');
      interactiveCards.forEach(function (c) { c.classList.remove('gap__card--spotlight'); });
      clearInterval(spotlightTimer);
      spotlightTimer = null;
    }

    startSpotlight();

    gapCards.addEventListener('mouseenter', stopSpotlight);
    gapCards.addEventListener('mouseleave', startSpotlight);

    /* ---------- 2D card drift (follows mouse anywhere) ---------- */
    var cards = gapCards.querySelectorAll('.gap__card[data-card="interactive"]');
    var driftMouseX = 0;
    var driftMouseY = 0;

    var cardDriftStates = [];
    cards.forEach(function () {
      cardDriftStates.push({ cx: 0, cy: 0 });
    });

    var MAX_DRIFT = 12;
    var DRIFT_LERP = 0.06;

    var gapRectCache = { container: null, cards: [] };

    function refreshGapRects() {
      var rect = gapCards.getBoundingClientRect();
      gapRectCache.container = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
      gapRectCache.cards = Array.from(cards).map(function(c) {
        var cr = c.getBoundingClientRect();
        return { left: cr.left + window.scrollX, top: cr.top + window.scrollY, width: cr.width, height: cr.height };
      });
    }

    var isGapVisible = false;
    var gapObserver = new IntersectionObserver(
      function(entries) {
        isGapVisible = entries[0].isIntersecting;
        if (isGapVisible) refreshGapRects();
      },
      { threshold: 0 }
    );
    gapObserver.observe(gapCards);
    refreshGapRects();
    window.addEventListener('resize', refreshGapRects);

    document.addEventListener('mousemove', function (e) {
      if (!gapRectCache.container) return;
      var rect = gapRectCache.container;
      driftMouseX = ((e.pageX - rect.left) / rect.width) * 2 - 1;
      driftMouseY = ((e.pageY - rect.top) / rect.height) * 2 - 1;
    }, { passive: true });

    function cardDriftLoop() {
      if (!isGapVisible) {
        requestAnimationFrame(cardDriftLoop);
        return;
      }

      var containerRect = gapRectCache.container;
      var cardRects = gapRectCache.cards;
      if (!containerRect) { requestAnimationFrame(cardDriftLoop); return; }

      // Batch all writes
      for (var i = 0; i < cards.length; i++) {
        var st = cardDriftStates[i];
        var cr = cardRects[i];
        var ccx = ((cr.left + cr.width / 2 - containerRect.left) / containerRect.width) * 2 - 1;
        var ccy = ((cr.top + cr.height / 2 - containerRect.top) / containerRect.height) * 2 - 1;

        var dx = ccx - driftMouseX;
        var dy = ccy - driftMouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var influence = Math.max(0, 1 - dist * 0.5);
        var variation = 0.7 + (((i * 7 + 3) % 5) / 5) * 0.6;

        var tx = dx * influence * MAX_DRIFT * variation;
        var ty = dy * influence * MAX_DRIFT * variation;

        st.cx += (tx - st.cx) * DRIFT_LERP;
        st.cy += (ty - st.cy) * DRIFT_LERP;

        if (Math.abs(st.cx) > 0.05 || Math.abs(st.cy) > 0.05) {
          cards[i].style.translate = st.cx.toFixed(2) + 'px ' + st.cy.toFixed(2) + 'px';
        }
      }

      requestAnimationFrame(cardDriftLoop);
    }

    requestAnimationFrame(cardDriftLoop);
  }

  /* ---------- Supply chain — Bottle parallax ---------- */
  var supplyBottle = document.querySelector('.supply__hero-img');
  if (supplyBottle) {
    gsap.to(supplyBottle, {
      yPercent: 2,
      ease: 'none',
      scrollTrigger: {
        trigger: '.scene--supply',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ---------- Pivot image parallax ---------- */
  var pivotImage = document.querySelector('.pivot__image');
  if (pivotImage) {
    gsap.fromTo(pivotImage, {
      yPercent: -15
    }, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.scene--pivot',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ---------- Result — iPhone mockup parallax ---------- */
  var mockupWrap = document.querySelector('.result__mockup-wrap');
  if (mockupWrap) {
    gsap.fromTo(mockupWrap,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.scene--result',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  }

  /* ---------- Result — Shipment list scrub scroll ---------- */
  var shipmentList = document.querySelector('.result__shipment-list');
  if (shipmentList) {
    var scrollDist = 0;
    ScrollTrigger.create({
      trigger: '.scene--result',
      start: 'top 60%',
      end: 'bottom top',
      scrub: true,
      onRefresh: function() {
        scrollDist = shipmentList.scrollHeight - shipmentList.parentElement.clientHeight + 40;
      },
      onUpdate: function (self) {
        gsap.set(shipmentList, { y: -scrollDist * self.progress });
      }
    });
  }

  /* ---------- Supply chain — Idle spotlight + card drift ---------- */
  var supplyCards = document.querySelector('.supply__cards');

  if (supplyCards && window.innerWidth >= 768) {
    var supInteractive = supplyCards.querySelectorAll('.supply__card[data-card="interactive"]');
    var supSpotIdx = 0;
    var supSpotTimer = null;

    function setSupSpotlight(idx) {
      supInteractive.forEach(function (c) { c.classList.remove('supply__card--spotlight'); });
      supInteractive[idx].classList.add('supply__card--spotlight');
    }

    function startSupSpotlight() {
      supplyCards.classList.add('supply__cards--idle');
      setSupSpotlight(supSpotIdx);
      supSpotTimer = setInterval(function () {
        supSpotIdx = (supSpotIdx + 1) % supInteractive.length;
        setSupSpotlight(supSpotIdx);
      }, 3000);
    }

    function stopSupSpotlight() {
      supplyCards.classList.remove('supply__cards--idle');
      supInteractive.forEach(function (c) { c.classList.remove('supply__card--spotlight'); });
      clearInterval(supSpotTimer);
      supSpotTimer = null;
    }

    startSupSpotlight();

    supplyCards.addEventListener('mouseenter', stopSupSpotlight);
    supplyCards.addEventListener('mouseleave', startSupSpotlight);

    /* 2D card drift */
    var supDriftCards = supplyCards.querySelectorAll('.supply__card');
    var supDriftMouseX = 0;
    var supDriftMouseY = 0;

    var supDriftStates = [];
    supDriftCards.forEach(function () {
      supDriftStates.push({ cx: 0, cy: 0 });
    });

    var SUP_MAX_DRIFT = 12;
    var SUP_DRIFT_LERP = 0.06;

    var supRectCache = { container: null, cards: [] };

    function refreshSupRects() {
      var rect = supplyCards.getBoundingClientRect();
      supRectCache.container = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
      supRectCache.cards = Array.from(supDriftCards).map(function(c) {
        var cr = c.getBoundingClientRect();
        return { left: cr.left + window.scrollX, top: cr.top + window.scrollY, width: cr.width, height: cr.height };
      });
    }

    var isSupVisible = false;
    var supObserver = new IntersectionObserver(
      function(entries) {
        isSupVisible = entries[0].isIntersecting;
        if (isSupVisible) refreshSupRects();
      },
      { threshold: 0 }
    );
    supObserver.observe(supplyCards);
    refreshSupRects();
    window.addEventListener('resize', refreshSupRects);

    document.addEventListener('mousemove', function (e) {
      if (!supRectCache.container) return;
      var rect = supRectCache.container;
      supDriftMouseX = ((e.pageX - rect.left) / rect.width) * 2 - 1;
      supDriftMouseY = ((e.pageY - rect.top) / rect.height) * 2 - 1;
    }, { passive: true });

    function supDriftLoop() {
      if (!isSupVisible) {
        requestAnimationFrame(supDriftLoop);
        return;
      }

      var containerRect = supRectCache.container;
      var cardRects = supRectCache.cards;
      if (!containerRect) { requestAnimationFrame(supDriftLoop); return; }

      for (var i = 0; i < supDriftCards.length; i++) {
        var st = supDriftStates[i];
        var cr = cardRects[i];
        var ccx = ((cr.left + cr.width / 2 - containerRect.left) / containerRect.width) * 2 - 1;
        var ccy = ((cr.top + cr.height / 2 - containerRect.top) / containerRect.height) * 2 - 1;

        var dx = ccx - supDriftMouseX;
        var dy = ccy - supDriftMouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var influence = Math.max(0, 1 - dist * 0.5);
        var variation = 0.7 + (((i * 7 + 3) % 5) / 5) * 0.6;

        var tx = dx * influence * SUP_MAX_DRIFT * variation;
        var ty = dy * influence * SUP_MAX_DRIFT * variation;

        st.cx += (tx - st.cx) * SUP_DRIFT_LERP;
        st.cy += (ty - st.cy) * SUP_DRIFT_LERP;

        if (Math.abs(st.cx) > 0.05 || Math.abs(st.cy) > 0.05) {
          supDriftCards[i].style.translate = st.cx.toFixed(2) + 'px ' + st.cy.toFixed(2) + 'px';
        }
      }

      requestAnimationFrame(supDriftLoop);
    }

    requestAnimationFrame(supDriftLoop);
  }

  /* ---------- Solution card stack — drift + spread + restack ---------- */
  var solCards = document.querySelector('.solution__cards');

  if (solCards && window.innerWidth >= 768) {
    var sCards = solCards.querySelectorAll('.solution__card');
    // State: 'stacked-left' | 'spread' | 'stacked-right'
    var cardState = 'stacked-left';

    // Organic rotations per state
    var stackedLeftRots  = [-2, 4, -3, 5];
    var spreadRots       = [-1, 1, -0.5, 1.5];
    var stackedRightRots = [3, -4, 2, -3];

    // Spread offsets (px, based on 140px card width * 1.05 gap)
    var spreadOffsets = [0, 147, 294, 441];

    // Center-stack x = midpoint of the spread area
    function getCenterX() {
      var lastSpread = spreadOffsets[spreadOffsets.length - 1];
      return (lastSpread + 140) / 2 - 70; // center of total spread width minus half card
    }

    // Set initial stacked-left state
    sCards.forEach(function (card, i) {
      gsap.set(card, { rotation: stackedLeftRots[i], x: 0 });
    });

    // Helper: animate to spread
    function animateToSpread(dur) {
      cardState = 'spread';
      sCards.forEach(function (card, i) {
        gsap.to(card, {
          x: spreadOffsets[i],
          rotation: spreadRots[i],
          duration: dur || 0.6,
          ease: 'power3.out',
          delay: i * 0.06
        });
      });
    }

    // Helper: animate to stacked-left
    function animateToStackedLeft(dur) {
      cardState = 'stacked-left';
      sCards.forEach(function (card, i) {
        gsap.to(card, {
          x: 0,
          rotation: stackedLeftRots[i],
          duration: dur || 0.5,
          ease: 'power2.inOut',
          delay: (sCards.length - 1 - i) * 0.04
        });
      });
    }

    // Helper: animate to stacked-center
    function animateToStackedCenter(dur) {
      cardState = 'stacked-center';
      var centerX = getCenterX();
      sCards.forEach(function (card, i) {
        gsap.to(card, {
          x: centerX,
          rotation: stackedRightRots[i],
          duration: dur || 0.5,
          ease: 'power2.inOut',
          delay: i * 0.04
        });
      });
    }

    // Trigger 1: spread at 80vh, restack-left on leave-back
    ScrollTrigger.create({
      trigger: solCards,
      start: 'top 80%',
      onEnter: function () {
        if (cardState === 'stacked-left') animateToSpread();
      },
      onLeaveBack: function () {
        if (cardState === 'spread') animateToStackedLeft();
      }
    });

    // Trigger 2: restack-right at 20vh, spread on leave-back
    ScrollTrigger.create({
      trigger: solCards,
      start: 'top 30%',
      onEnter: function () {
        if (cardState === 'spread') animateToStackedCenter();
      },
      onLeaveBack: function () {
        if (cardState === 'stacked-center') animateToSpread();
      }
    });

    // Hover spread — only when stacked-left (not yet scrolled)
    solCards.addEventListener('mouseenter', function () {
      if (cardState !== 'stacked-left') return;
      animateToSpread(0.5);
    });

    solCards.addEventListener('mouseleave', function () {
      // Only collapse if scroll hasn't passed the 60vh trigger
      var rect = solCards.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.8) return;
      animateToStackedLeft(0.4);
    });

    // Mouse-drift for solution cards (same pattern as gap cards)
    var solDriftMouseX = 0;
    var solDriftMouseY = 0;
    var solDriftStates = [];
    sCards.forEach(function () { solDriftStates.push({ cx: 0, cy: 0 }); });

    var solRectCache = { container: null, cards: [] };

    function refreshSolRects() {
      var rect = solCards.getBoundingClientRect();
      solRectCache.container = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
      solRectCache.cards = Array.from(sCards).map(function(c) {
        var cr = c.getBoundingClientRect();
        return { left: cr.left + window.scrollX, top: cr.top + window.scrollY, width: cr.width, height: cr.height };
      });
    }

    refreshSolRects();
    window.addEventListener('resize', refreshSolRects);

    var SOL_MAX_DRIFT = 10;
    var SOL_DRIFT_LERP = 0.05;

    var isSolVisible = false;
    var solObserver = new IntersectionObserver(
      function (entries) {
        isSolVisible = entries[0].isIntersecting;
        if (isSolVisible) refreshSolRects();
      },
      { threshold: 0 }
    );
    solObserver.observe(solCards);

    document.addEventListener('mousemove', function (e) {
      if (!solRectCache.container) return;
      var rect = solRectCache.container;
      solDriftMouseX = ((e.pageX - rect.left) / rect.width) * 2 - 1;
      solDriftMouseY = ((e.pageY - rect.top) / rect.height) * 2 - 1;
    }, { passive: true });

    function solCardDriftLoop() {
      if (!isSolVisible) {
        requestAnimationFrame(solCardDriftLoop);
        return;
      }

      var containerRect = solRectCache.container;
      var cardRects = solRectCache.cards;
      if (!containerRect) { requestAnimationFrame(solCardDriftLoop); return; }

      // Batch all writes
      for (var i = 0; i < sCards.length; i++) {
        var st = solDriftStates[i];
        var cr = cardRects[i];
        var ccx = ((cr.left + cr.width / 2 - containerRect.left) / (containerRect.width || 1)) * 2 - 1;
        var ccy = ((cr.top + cr.height / 2 - containerRect.top) / (containerRect.height || 1)) * 2 - 1;

        var dx = ccx - solDriftMouseX;
        var dy = ccy - solDriftMouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var influence = Math.max(0, 1 - dist * 0.4);
        var variation = 0.7 + (((i * 5 + 2) % 4) / 4) * 0.6;

        var tx = dx * influence * SOL_MAX_DRIFT * variation;
        var ty = dy * influence * SOL_MAX_DRIFT * variation;

        st.cx += (tx - st.cx) * SOL_DRIFT_LERP;
        st.cy += (ty - st.cy) * SOL_DRIFT_LERP;

        if (Math.abs(st.cx) > 0.05 || Math.abs(st.cy) > 0.05) {
          sCards[i].style.translate = st.cx.toFixed(2) + 'px ' + st.cy.toFixed(2) + 'px';
        }
      }

      requestAnimationFrame(solCardDriftLoop);
    }

    requestAnimationFrame(solCardDriftLoop);
  }

  /* ---------- Skills Section: scroll-driven box growth + hover interaction ---------- */
  var skillsSection = document.getElementById('skillsSection');
  var skillsBox = skillsSection ? skillsSection.querySelector('.skills-box') : null;

  if (skillsSection && skillsBox && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Box grows from 75% to 100% width on scroll-in
    var skillsTl = gsap.timeline({
      scrollTrigger: {
        trigger: skillsSection,
        start: 'top 100%',
        end: 'top 50%',
        scrub: 0.5
      }
    });

    skillsTl.fromTo(skillsBox,
      { clipPath: 'inset(0 12.5% 0 12.5% round 19px)' },
      { clipPath: 'inset(0 0% 0 0% round 19px)', duration: 1, ease: 'none' },
      0
    );

    // Box shrinks back on scroll-out (after section leaves viewport)
    var shrinkTl = gsap.timeline({
      scrollTrigger: {
        trigger: skillsSection,
        start: 'bottom 20%',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    shrinkTl.fromTo(skillsBox,
      { clipPath: 'inset(0 0% 0 0% round 19px)' },
      { clipPath: 'inset(0 12.5% 0 12.5% round 19px)', duration: 1, ease: 'none' },
      0
    );

    // Hover interaction: character-by-character animation
    var skillsItems = skillsSection.querySelectorAll('.skills-item');
    var skillsMobile = window.matchMedia('(max-width: 1024px)').matches;

    function splitIntoChars(el) {
      var text = el.textContent;
      el.textContent = '';
      var spans = [];
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        span.style.display = 'inline-block';
        el.appendChild(span);
        spans.push(span);
      }
      return spans;
    }

    function restoreText(el, originalText) {
      el.textContent = originalText;
    }

    skillsItems.forEach(function (item) {
      var numEl = item.querySelector('.skills-item__num');
      var descEl = item.querySelector('.skills-item__desc');
      var numText = numEl.textContent;

      if (skillsMobile) {
        gsap.set(numEl, { opacity: 1 });
        gsap.set(descEl, { opacity: 1 });
      } else {
        item.addEventListener('mouseenter', function () {
          item.classList.add('is-hovered');

          gsap.killTweensOf(numEl);
          gsap.killTweensOf(descEl);
          restoreText(numEl, numText);

          var numChars = splitIntoChars(numEl);
          gsap.fromTo(numChars,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out' }
          );
          gsap.to(numEl, { opacity: 1, duration: 0.01 });

          gsap.to(descEl, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        });

        item.addEventListener('mouseleave', function () {
          item.classList.remove('is-hovered');

          gsap.killTweensOf(numEl);
          gsap.killTweensOf(descEl);
          var numSpans = numEl.querySelectorAll('span');
          if (numSpans.length) numSpans.forEach(function (s) { gsap.killTweensOf(s); });

          restoreText(numEl, numText);
          gsap.set(numEl, { opacity: 0 });
          gsap.set(descEl, { opacity: 0 });
        });
      }
    });
  }

})();
