/* ============================================
   LIBERTE COFFEE — Page Scripts
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

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  window.lenis = lenis;

  /* ---------- GSAP ScrollTrigger sync ---------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* ---------- Mountain reveal animation ---------- */
    var isMobile = window.innerWidth <= 767;
    var startScale = isMobile ? 3 : 5;
    var pinDistance = isMobile ? '+=150%' : '+=200%';

    // Set initial transform via GSAP (controls translate + scale together)
    gsap.set('.mountain-reveal__svg', {
      scale: startScale,
      xPercent: -50,
      yPercent: -50,
      transformOrigin: 'center center',
      visibility: 'visible'
    });

    var revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.mountain-reveal',
        pin: true,
        scrub: 1,
        start: 'top top',
        end: pinDistance,
        invalidateOnRefresh: true
      }
    });

    // Phase 1 (0% – 80%): SVG shrinks + fades, bg transitions
    revealTl.to('.mountain-reveal__svg', {
      scale: 1,
      opacity: 0,
      duration: 0.8,
      ease: 'none'
    }, 0);

    revealTl.to('.mountain-reveal__bg', {
      backgroundColor: '#F5F4ED',
      duration: 0.8,
      ease: 'none'
    }, 0);

    // Phase 2 (80% – 100%): brand fades in
    revealTl.to('.mountain-reveal__brand', {
      opacity: 1,
      duration: 0.2,
      ease: 'none'
    }, 0.8);
  }

  /* ---------- Snap scroll (desktop/tablet only) ---------- */
  if (typeof gsap !== 'undefined' && typeof Observer !== 'undefined' && window.innerWidth > 767) {
    gsap.registerPlugin(Observer);

    var sectionKeys = ['hero']; // Add more section keys as sections are added
    var sections = [];
    for (var i = 0; i < sectionKeys.length; i++) {
      var el = document.querySelector('[data-section="' + sectionKeys[i] + '"]');
      if (el) sections.push(el);
    }

    if (sections.length > 1) {
      var total = sections.length;
      var currentIndex = 0;
      var isSnapping = false;
      var snapTimer = null;
      var SNAP_COOLDOWN = 50;
      var SNAP_DURATION = 1.1;
      var SAFETY_TIMEOUT = (SNAP_DURATION * 1000) + 400;

      function sectionTop(el) {
        return el.getBoundingClientRect().top + window.scrollY;
      }

      function unlock() {
        clearTimeout(snapTimer);
        isSnapping = false;
        lenis.start();
      }

      function snapTo(index) {
        if (index < 0 || index >= total) return;
        if (isSnapping) return;
        isSnapping = true;
        currentIndex = index;

        lenis.scrollTo(window.scrollY, { immediate: true });
        lenis.stop();

        clearTimeout(snapTimer);
        snapTimer = setTimeout(unlock, SAFETY_TIMEOUT);

        var startY = window.scrollY;
        var endY = sectionTop(sections[index]);
        var obj = { y: startY };

        gsap.to(obj, {
          y: endY,
          duration: SNAP_DURATION,
          ease: 'power2.out',
          onUpdate: function () {
            window.scrollTo(0, obj.y);
          },
          onComplete: function () {
            clearTimeout(snapTimer);
            setTimeout(unlock, SNAP_COOLDOWN);
          }
        });
      }

      function syncIndex() {
        var scroll = window.scrollY;
        var viewH = window.innerHeight;
        for (var j = total - 1; j >= 0; j--) {
          if (scroll >= sectionTop(sections[j]) - viewH * 0.5) {
            currentIndex = j;
            return;
          }
        }
        currentIndex = 0;
      }

      Observer.create({
        type: 'wheel,touch',
        tolerance: 50,
        preventDefault: true,
        onUp: function () {
          if (isSnapping) return;
          syncIndex();
          snapTo(currentIndex - 1);
        },
        onDown: function () {
          if (isSnapping) return;
          syncIndex();
          snapTo(currentIndex + 1);
        }
      });
    }
  }

})();
