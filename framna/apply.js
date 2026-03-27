/* ============================================
   APPLY PAGES — Scroll Animation Engine
   Vanilla JS, no dependencies
   ============================================ */

/* --- Config Population (runs before animations) --- */
(function applyConfig() {
  if (!window.PAGE_CONFIG) return;
  var cfg = PAGE_CONFIG;

  // Populate text from data-config attributes
  Object.keys(cfg.text).forEach(function(key) {
    var el = document.querySelector('[data-config="' + key + '"]');
    if (el) el.innerHTML = cfg.text[key];
    // Also update duplicate title elements (proof step titles have a dup for animation)
    var dup = document.querySelector('[data-config-title-dup="' + key + '"]');
    if (dup) dup.innerHTML = cfg.text[key];
  });

  // Set company logo
  var logoImg = document.querySelector('[data-config-logo]');
  if (logoImg && cfg.company && cfg.company.logo) {
    logoImg.src = cfg.company.logo;
    logoImg.alt = cfg.company.name || '';
  }

  // Set greeting words
  if (cfg.greeting) {
    var greetBefore = document.querySelector('[data-config="greeting-before"]');
    var greetAfter = document.querySelector('[data-config="greeting-after"]');
    if (greetBefore && cfg.greeting[0]) greetBefore.textContent = cfg.greeting[0];
    if (greetAfter && cfg.greeting[1]) greetAfter.textContent = cfg.greeting[1];
  }

  // Set video
  if (cfg.video && cfg.video.vimeoId) {
    var iframe = document.querySelector('.video-section__player iframe');
    if (iframe) {
      var hash = cfg.video.vimeoHash ? '?h=' + cfg.video.vimeoHash + '&' : '?';
      iframe.src = 'https://player.vimeo.com/video/' + cfg.video.vimeoId + hash + 'title=0&byline=0&portrait=0&autoplay=1&muted=1&controls=0';
    }
  }

  // Populate skills from array
  if (cfg.skills) {
    var skillsList = document.querySelector('[data-config-skills]');
    if (skillsList) {
      skillsList.innerHTML = '';
      cfg.skills.forEach(function(skill) {
        var item = document.createElement('div');
        item.className = 'skills-item';
        item.innerHTML =
          '<span class="skills-item__num">(' + skill.num + ')</span>' +
          '<span class="skills-item__word">' + skill.word + '</span>' +
          '<span class="skills-item__desc">' + skill.desc + '</span>';
        skillsList.appendChild(item);
      });
    }
  }

  // Update contact links href attributes
  var emailLink = document.querySelector('[data-config="contact-email"]');
  if (emailLink && cfg.text['contact-email']) {
    emailLink.href = 'mailto:' + cfg.text['contact-email'];
  }
  var phoneLink = document.querySelector('[data-config="contact-phone"]');
  if (phoneLink && cfg.text['contact-phone']) {
    phoneLink.href = 'tel:' + cfg.text['contact-phone'].replace(/\s/g, '');
  }

  // Hide sections
  Object.keys(cfg.sections).forEach(function(key) {
    if (!cfg.sections[key]) {
      var sections = document.querySelectorAll('[data-section="' + key + '"]');
      sections.forEach(function(section) {
        section.style.display = 'none';
      });
    }
  });

  // Refresh ScrollTrigger after hiding sections
  if (typeof ScrollTrigger !== 'undefined') {
    setTimeout(function() { ScrollTrigger.refresh(); }, 100);
  }
})();

/* --- Lenis Smooth Scroll --- */
(function () {
  if (typeof Lenis === 'undefined') return;

  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true
  });

  // Sync Lenis with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
})();

(function () {
  'use strict';

  // Force scroll to top on refresh
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Ensure scroll position is 0 before unload so browser remembers top
  window.addEventListener('beforeunload', function () {
    window.scrollTo(0, 0);
  });

  // --- Scroll Reveal via IntersectionObserver ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show everything immediately
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // --- Subtle Parallax on Large Text ---
  const parallaxElements = document.querySelectorAll('.large-text[data-parallax]');

  if (parallaxElements.length > 0) {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          parallaxElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;
            const offset = (center - viewportCenter) * 0.06;
            el.style.transform = 'translateY(' + offset + 'px)';
          });

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

})();

/* --- Text Reveal: scroll-driven letter-by-letter opacity --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var wrapper = document.getElementById('textReveal');
  if (!wrapper) return;

  var columnParagraphs = wrapper.querySelectorAll('.about-column');
  var outroParagraph = wrapper.querySelector('.about-outro');
  var columnChars = [];
  var outroChars = [];

  function splitChars(p, arr) {
    var text = p.textContent;
    p.textContent = '';
    for (var i = 0; i < text.length; i++) {
      if (text[i] === ' ') {
        p.appendChild(document.createTextNode(' '));
        continue;
      }
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i];
      span.style.display = 'inline';
      p.appendChild(span);
      arr.push(span);
    }
  }

  columnParagraphs.forEach(function (p) { splitChars(p, columnChars); });
  if (outroParagraph) splitChars(outroParagraph, outroChars);

  // Sequenced reveal: columns → line → outro in one unified timeline
  var aboutLine = document.getElementById('aboutLine');

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#textReveal',
      start: 'top 75%',
      end: 'top 25%',
      scrub: true
    }
  });

  // Scroll range: 75% → 25% (50% of viewport)
  // Line completes at 0.9 → trigger top at 30%
  // Outro completes at 1.0 → trigger top at 25%
  var colStagger = columnChars.length > 1 ? 0.45 / columnChars.length : 0.45;

  // Phase 1 (0 → 0.45): column chars reveal letter by letter
  tl.to(columnChars, {
    opacity: 1,
    stagger: colStagger,
    duration: colStagger,
    ease: 'none'
  }, 0);

  // Phase 2 (0.45 → 0.9): line draws left→right, completes at 70vh
  if (aboutLine) {
    tl.to(aboutLine, {
      scaleX: 1,
      ease: 'none',
      duration: 0.45
    }, 0.45);
  }

  // Phase 2b (0.65 → 1.0): outro chars reveal, completes at 75vh
  if (outroChars.length) {
    var outroStagger = outroChars.length > 1 ? 0.35 / outroChars.length : 0.35;
    tl.to(outroChars, {
      opacity: 1,
      stagger: outroStagger,
      duration: outroStagger,
      ease: 'none'
    }, 0.65);
  }

  // Parallax: outro + line share the same trigger so they stay in sync
  var parallaxTrigger = {
    trigger: aboutLine,
    start: 'bottom bottom',
    end: 'top 55%',
    scrub: true
  };

  if (outroParagraph) {
    gsap.to(outroParagraph, {
      y: '20vh',
      ease: 'none',
      scrollTrigger: Object.assign({}, parallaxTrigger)
    });
  }

  if (aboutLine) {
    gsap.to(aboutLine, {
      y: '20vh',
      ease: 'none',
      scrollTrigger: Object.assign({}, parallaxTrigger)
    });
  }

  // Vertical line: reveals top→bottom between horizontal line and next section
  var aboutVLine = document.getElementById('aboutVLine');
  if (aboutVLine) {
    gsap.to(aboutVLine, {
      y: '20vh',
      ease: 'none',
      scrollTrigger: Object.assign({}, parallaxTrigger)
    });

    gsap.to(aboutVLine, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: aboutVLine,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true
      }
    });
  }

})();

/* --- Clients Outro: scroll-driven letter-by-letter reveal --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var el = document.getElementById('clientsOutro');
  if (!el) return;

  var chars = [];
  var text = el.textContent;
  el.textContent = '';
  for (var i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      el.appendChild(document.createTextNode(' '));
      continue;
    }
    var span = document.createElement('span');
    span.className = 'char';
    span.textContent = text[i];
    span.style.display = 'inline';
    el.appendChild(span);
    chars.push(span);
  }

  if (chars.length) {
    var stagger = chars.length > 1 ? 1 / chars.length : 1;
    gsap.to(chars, {
      opacity: 1,
      stagger: stagger,
      duration: stagger,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'top 75%',
        scrub: true
      }
    });
  }
})();

/* --- Clients Section: negative parallax on heading + outro --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var heading = document.querySelector('.clients-heading');
  var outro = document.getElementById('clientsOutro');
  var section = document.querySelector('.clients-section');
  if (!section) return;

  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) return;

  var targets = [heading, outro].filter(Boolean);
  targets.forEach(function (el) {
    gsap.to(el, {
      y: '15vh',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
})();

/* --- Video Showcase: scroll-driven zoom + Vimeo control --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory();
  window.scrollTo(0, 0);

  var section      = document.getElementById('videoSection');
  var playerEl     = document.getElementById('videoPlayer');
  var text1        = document.getElementById('videoText1');
  var text2        = document.getElementById('videoText2');
  var overlay      = document.getElementById('videoPlayOverlay');
  var pauseBtn     = document.getElementById('videoPauseBtn');
  var subtitlesBtn = document.getElementById('videoSubtitlesBtn');
  var volumeEl     = document.getElementById('videoVolume');
  var volumeFill   = document.getElementById('videoVolumeFill');
  var progressEl   = document.getElementById('videoProgress');
  var progressFill = document.getElementById('videoProgressFill');
  var iframe       = playerEl ? playerEl.querySelector('iframe') : null;
  if (!section || !playerEl) return;
  var isMobile = window.matchMedia('(max-width: 767px)').matches;
  var isSmallMobile = window.matchMedia('(max-width: 390px)').matches;

  var heading = section.querySelector('.video-section__heading');
  var sub     = section.querySelector('.video-section__sub');

  // --- Mobile: graduated line-height per word, responsive sizing ---
  if (isMobile && heading) {
    var rawText = heading.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
    var words = rawText.split(/\s+/).filter(function (w) { return w.length > 0; });
    heading.innerHTML = '';
    var containerWidth = window.innerWidth - 10;
    var measure = document.createElement('span');
    measure.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-family:inherit;font-weight:inherit;font-size:100px;';
    heading.appendChild(measure);
    // Find the longest word and size all words to that
    var maxWordWidth = 0;
    for (var wi = 0; wi < words.length; wi++) {
      measure.textContent = words[wi];
      if (measure.offsetWidth > maxWordWidth) maxWordWidth = measure.offsetWidth;
    }
    var fixedSize = (containerWidth / maxWordWidth) * 100;
    heading.removeChild(measure);
    for (var wi = 0; wi < words.length; wi++) {
      var isStory = words[wi].toLowerCase() === 'story';
      var wordSpan = document.createElement('span');
      wordSpan.style.lineHeight = isStory ? '1.2' : '0.8';
      wordSpan.style.display = 'block';
      wordSpan.style.fontSize = fixedSize + 'px';
      wordSpan.textContent = words[wi];
      if (isStory) {
        wordSpan.classList.add('heading-italic');
      }
      heading.appendChild(wordSpan);
    }
  }

  // --- State ---
  var vimeo       = null;
  var isLooping   = true;
  var isPlaying   = false;
  var isFullScale = false;
  var subtitlesOn = false;
  var savedTime   = 0;
  var videoDuration = 0;
  var LOOP_END    = 5;

  // --- Vimeo init (only if SDK loaded) ---
  if (typeof Vimeo !== 'undefined' && iframe) {
    vimeo = new Vimeo.Player(iframe);

    vimeo.on('timeupdate', function (data) {
      if (isLooping && data.seconds >= LOOP_END) {
        vimeo.setCurrentTime(0);
      }
      if (isPlaying && progressFill && data.duration > 0) {
        savedTime = data.seconds;
        videoDuration = data.duration;
        progressFill.style.width = ((data.seconds / data.duration) * 100) + '%';
      }
    });

    vimeo.ready().then(function () {
      vimeo.setVolume(0);
      vimeo.getDuration().then(function (d) { videoDuration = d; });
      vimeo.play();
      window.focus();
    });

    vimeo.on('ended', function () {
      isPlaying = false;
      isLooping = true;
      savedTime = 0;
      if (progressFill) progressFill.style.width = '0%';
      playerEl.classList.remove('is-playing');
      vimeo.setVolume(0);
      vimeo.setCurrentTime(0);
      vimeo.play();
      if (isFullScale && overlay) overlay.classList.add('is-visible');
    });
  }

  // --- GSAP scroll timeline ---
  if (isMobile) {
    // Mobile: no pin, natural flow — video scales up on scroll
    gsap.fromTo(playerEl,
      { scale: 0.3, rotate: 3, borderRadius: '24px' },
      { scale: 1.0, rotate: 0, borderRadius: '16px', ease: 'none',
        scrollTrigger: {
          trigger: playerEl,
          start: 'top 100%',
          end: 'top 30%',
          scrub: 0.5,
          onUpdate: function (self) {
            if (self.progress >= 0.90 && !isFullScale) {
              isFullScale = true;
              if (!isPlaying && overlay) overlay.classList.add('is-visible');
            } else if (self.progress < 0.90 && isFullScale) {
              isFullScale = false;
              if (isPlaying) {
                isPlaying = false;
                playerEl.classList.remove('is-playing');
                if (vimeo) { vimeo.setVolume(0); vimeo.pause(); }
              }
              if (overlay) overlay.classList.remove('is-visible');
            }
          }
        }
      }
    );
    // "Now imagine..." fades in after video
    gsap.fromTo(text1,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, ease: 'none',
        scrollTrigger: {
          trigger: text1,
          start: 'top 85%',
          end: 'top 60%',
          scrub: true
        }
      }
    );
  } else {
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=160%',
        pin: true,
        scrub: 0.5,
        onUpdate: function (self) {
          var progress = self.progress;
          if (progress >= 0.50 && !isFullScale) {
            isFullScale = true;
            if (!isPlaying && overlay) overlay.classList.add('is-visible');
          } else if (progress < 0.50 && isFullScale) {
            isFullScale = false;
            if (isPlaying) {
              isPlaying = false;
              playerEl.classList.remove('is-playing');
              if (vimeo) { vimeo.setVolume(0); vimeo.pause(); }
            }
            if (overlay) overlay.classList.remove('is-visible');
          }
        }
      }
    });
    tl.fromTo(playerEl,
      { scale: 0.3, rotate: 3, y: 0, borderRadius: '48px' },
      { scale: 0.88, rotate: 0, y: '-20vh', borderRadius: '24px', duration: 0.50, ease: 'none' },
      0
    );
    tl.fromTo(heading, { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.25, ease: 'none' }, 0.10);
    tl.fromTo(sub,     { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.20, ease: 'none' }, 0.15);
    tl.fromTo(text1,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.15, ease: 'none' }, 0.25);
  }

  // --- Position footer responsively below video ---
  var footer = section.querySelector('.video-section__footer');
  function positionFooter() {
    if (!footer) return;
    if (isMobile) {
      // Mobile: footer flows naturally, no absolute positioning needed
      footer.style.position = 'relative';
      footer.style.top = 'auto';
    } else {
      var videoCenter = window.innerHeight * 0.30;
      var videoVisualHalfH = (playerEl.offsetHeight * 0.88) / 2;
      footer.style.top = 'calc(' + (videoCenter + videoVisualHalfH) + 'px + 15rem)';
    }
  }
  positionFooter();
  window.addEventListener('resize', positionFooter);

  // --- Video Outro: char-by-char reveal inside the pinned timeline ---
  var videoOutro = document.getElementById('videoOutro');
  if (videoOutro) {
    var outroChars = [];
    var outroText = videoOutro.textContent;
    videoOutro.textContent = '';
    for (var i = 0; i < outroText.length; i++) {
      if (outroText[i] === ' ') {
        videoOutro.appendChild(document.createTextNode(' '));
        continue;
      }
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = outroText[i];
      span.style.display = 'inline';
      videoOutro.appendChild(span);
      outroChars.push(span);
    }

    if (isMobile) {
      // Mobile: standalone scroll-triggered char reveal (no pin)
      gsap.to(videoOutro, {
        opacity: 1, duration: 0.01, ease: 'none',
        scrollTrigger: {
          trigger: videoOutro,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      if (outroChars.length) {
        gsap.to(outroChars, {
          opacity: 1,
          stagger: 0.02,
          duration: 0.02,
          ease: 'none',
          scrollTrigger: {
            trigger: videoOutro,
            start: 'top 90%',
            end: 'top 70%',
            scrub: true
          }
        });
      }
    } else {
      // Desktop: reveal inside pinned timeline
      var outroStart = 0.55;
      tl.to(videoOutro, { opacity: 1, duration: 0.01, ease: 'none' }, outroStart);

      if (outroChars.length) {
        var totalReveal = 0.20;
        var charDuration = outroChars.length > 1 ? totalReveal / outroChars.length : totalReveal;
        tl.to(outroChars, {
          opacity: 1,
          stagger: charDuration,
          duration: charDuration,
          ease: 'none'
        }, outroStart);
      }

      tl.to(videoOutro, { top: '75vh', duration: 0.20, ease: 'none' }, 0.55);
    }
  }

  // --- Play button ---
  if (overlay) {
    overlay.addEventListener('click', function () {
      isLooping = false;
      isPlaying = true;
      overlay.classList.remove('is-visible');
      playerEl.classList.add('is-playing');
      if (vimeo) {
        vimeo.setVolume(0.85);
        vimeo.play();
      }
    });
  }

  // --- Pause button (hover controls) ---
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      isPlaying = false;
      playerEl.classList.remove('is-playing');
      if (vimeo) vimeo.pause();
      if (isFullScale && overlay) overlay.classList.add('is-visible');
    });
  }

  // --- Subtitles toggle ---
  if (subtitlesBtn) {
    subtitlesBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!vimeo) return;
      if (subtitlesOn) {
        vimeo.disableTextTrack();
        subtitlesBtn.classList.remove('is-active');
        subtitlesOn = false;
      } else {
        vimeo.getTextTracks().then(function (tracks) {
          if (tracks.length > 0) {
            vimeo.enableTextTrack(tracks[0].language, tracks[0].kind);
            subtitlesBtn.classList.add('is-active');
            subtitlesOn = true;
          }
        });
      }
    });
  }

  // --- Volume bar ---
  if (volumeEl && volumeFill && vimeo) {
    var dragging = false;

    function setVolumeFromEvent(e) {
      var rect = volumeEl.querySelector('.video-controls__volume-track').getBoundingClientRect();
      var y = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
      vimeo.setVolume(y);
      volumeFill.style.height = (y * 100) + '%';
    }

    volumeEl.addEventListener('mousedown', function (e) {
      e.stopPropagation();
      dragging = true;
      setVolumeFromEvent(e);
    });

    document.addEventListener('mousemove', function (e) {
      if (dragging) setVolumeFromEvent(e);
    });

    document.addEventListener('mouseup', function () {
      dragging = false;
    });

    // Sync fill on play (starts at full volume)
    vimeo.on('volumechange', function (data) {
      volumeFill.style.height = (data.volume * 100) + '%';
    });
  }

  // --- Progress bar seek ---
  if (progressEl && progressFill && vimeo) {
    progressEl.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!videoDuration) return;
      var rect = progressEl.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      var seekTo = ratio * videoDuration;
      savedTime = seekTo;
      progressFill.style.width = (ratio * 100) + '%';
      vimeo.setCurrentTime(seekTo);
    });
  }
})();

/* --- Skills Section: scroll-driven box growth + hover interaction --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var skillsSection = document.getElementById('skillsSection');
  var skillsBox = skillsSection ? skillsSection.querySelector('.skills-box') : null;
  if (!skillsSection || !skillsBox) return;

  // --- GSAP scroll animation: box grows to fill viewport ---
  // Expansion happens as the section scrolls into view (no pin)
  var skillsTl = gsap.timeline({
    scrollTrigger: {
      trigger: skillsSection,
      start: 'top 100%',
      end: 'top 50%',
      scrub: 0.5
    }
  });

  gsap.set(skillsBox, { borderRadius: '19px' });
  skillsTl.fromTo(skillsBox,
    { marginLeft: '30px', marginRight: '30px', marginTop: '30px', marginBottom: '30px' },
    { marginLeft: '0px', marginRight: '0px', marginTop: '0px', marginBottom: '0px', duration: 1, ease: 'none' },
    0
  );

  // --- GSAP scroll animation: box shrinks on exit ---
  var shrinkTl = gsap.timeline({
    scrollTrigger: {
      trigger: skillsSection,
      start: 'bottom bottom',
      end: 'bottom 20%',
      scrub: 0.5
    }
  });

  shrinkTl.fromTo(skillsBox,
    { marginLeft: '0px', marginRight: '0px', marginTop: '0px', marginBottom: '0px' },
    { marginLeft: '30px', marginRight: '30px', marginTop: '30px', marginBottom: '30px', duration: 1, ease: 'none' },
    0
  );

  // --- Hover interaction: character-by-character animation ---
  var skillsItems = skillsSection.querySelectorAll('.skills-item');
  var skillsMobile = window.matchMedia('(max-width: 767px)').matches;

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
    var descText = descEl.textContent;

    if (skillsMobile) {
      // Mobile: always visible, no interaction
      gsap.set(numEl, { opacity: 1 });
      gsap.set(descEl, { opacity: 1 });
    } else {
      // Desktop: hover interaction
      item.addEventListener('mouseenter', function () {
        item.classList.add('is-hovered');

        // Kill any running tweens to prevent stale state
        gsap.killTweensOf(numEl);
        gsap.killTweensOf(descEl);
        restoreText(numEl, numText);

        // Split and animate number
        var numChars = splitIntoChars(numEl);
        gsap.fromTo(numChars,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, stagger: 0.03, duration: 0.3, ease: 'power2.out' }
        );
        gsap.to(numEl, { opacity: 1, duration: 0.01 });

        // Fade in description
        gsap.to(descEl, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      });

      item.addEventListener('mouseleave', function () {
        item.classList.remove('is-hovered');

        // Kill any running tweens and reset immediately
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
})();

/* --- Proof Section: faster scroll-up parallax --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var proofSection = document.getElementById('proofSection');
  var proofBox = document.getElementById('proofBox');
  if (!proofSection || !proofBox) return;

  gsap.fromTo(proofBox,
    { y: '15vh' },
    {
      y: '0vh',
      ease: 'none',
      scrollTrigger: {
        trigger: proofSection,
        start: 'top bottom',
        end: 'top top',
        scrub: 0.5
      }
    }
  );
})();

/* --- Proof Closing: scroll-driven letter-by-letter reveal --- */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var el = document.getElementById('proofClosing');
  var proofContent = document.querySelector('.proof-content');
  var proofLeft = document.querySelector('.proof-left');
  if (!el || !proofContent || !proofLeft) return;

  // Sticky releases when proof-content bottom = 40vh + proof-left height
  var stickyTopPx = window.innerHeight * 0.4;
  var unstickPoint = stickyTopPx + proofLeft.offsetHeight;

  var chars = [];
  var text = el.textContent;
  el.textContent = '';
  for (var i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      el.appendChild(document.createTextNode(' '));
      continue;
    }
    var span = document.createElement('span');
    span.className = 'char';
    span.textContent = text[i];
    span.style.display = 'inline';
    el.appendChild(span);
    chars.push(span);
  }

  if (chars.length) {
    var stagger = chars.length > 1 ? 1 / chars.length : 1;
    gsap.to(chars, {
      opacity: 1,
      stagger: stagger,
      duration: stagger,
      ease: 'none',
      scrollTrigger: {
        trigger: proofContent,
        start: 'bottom ' + unstickPoint + 'px',
        end: 'bottom ' + (unstickPoint - window.innerHeight * 0.15) + 'px',
        scrub: true
      }
    });
  }

  gsap.to(el, {
    y: '35vh',
    ease: 'none',
    scrollTrigger: {
      trigger: document.querySelector('.proof-section'),
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
})();

/* --- Conditionally load visual editor --- */
if (window.location.search.indexOf('edit') !== -1) {
  var editorScript = document.createElement('script');
  editorScript.src = 'editor.js';
  document.body.appendChild(editorScript);
}
