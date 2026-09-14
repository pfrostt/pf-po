/* ============================================
   VISUAL PAGE EDITOR
   Loads only when URL contains ?edit
   ============================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'page-editor-' + window.location.pathname;
  var workingConfig = JSON.parse(JSON.stringify(window.PAGE_CONFIG || {}));

  // Restore from localStorage if available
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      var parsed = JSON.parse(saved);
      mergeDeep(workingConfig, parsed);
      applyWorkingConfig();
    } catch (e) { /* ignore corrupt data */ }
  }

  // --- Deep merge helper ---
  function mergeDeep(target, source) {
    for (var key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  // --- Save to localStorage ---
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workingConfig));
  }

  // --- Re-apply working config to DOM ---
  function applyWorkingConfig() {
    var cfg = workingConfig;

    Object.keys(cfg.text).forEach(function (key) {
      var el = document.querySelector('[data-config="' + key + '"]');
      if (el && !el.hasAttribute('contenteditable')) el.innerHTML = cfg.text[key];
      var dup = document.querySelector('[data-config-title-dup="' + key + '"]');
      if (dup) dup.innerHTML = cfg.text[key];
    });

    var logoImg = document.querySelector('[data-config-logo]');
    if (logoImg && cfg.company) {
      logoImg.src = cfg.company.logo;
      logoImg.alt = cfg.company.name || '';
    }

    if (cfg.greeting) {
      var gb = document.querySelector('[data-config="greeting-before"]');
      var ga = document.querySelector('[data-config="greeting-after"]');
      if (gb) gb.textContent = cfg.greeting[0];
      if (ga) ga.textContent = cfg.greeting[1];
    }

    if (cfg.video && cfg.video.vimeoId) {
      var iframe = document.querySelector('.video-section__player iframe');
      if (iframe) {
        var hash = cfg.video.vimeoHash ? '?h=' + cfg.video.vimeoHash + '&' : '?';
        iframe.src = 'https://player.vimeo.com/video/' + cfg.video.vimeoId + hash + 'title=0&byline=0&portrait=0&autoplay=1&muted=1&controls=0';
      }
    }

    Object.keys(cfg.sections).forEach(function (key) {
      var sections = document.querySelectorAll('[data-section="' + key + '"]');
      sections.forEach(function (s) {
        s.style.display = cfg.sections[key] ? '' : 'none';
      });
    });

    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(function () { ScrollTrigger.refresh(); }, 150);
    }
  }

  // --- Inject editor styles ---
  var style = document.createElement('style');
  style.textContent =
    '#editor-banner{position:fixed;top:0;left:0;right:0;z-index:10000;background:#2563eb;color:#fff;text-align:center;padding:6px 0;font:600 13px/1 system-ui,sans-serif;letter-spacing:2px;pointer-events:none}' +
    '#editor-panel{position:fixed;top:40px;right:16px;width:300px;max-height:calc(100vh - 56px);overflow-y:auto;z-index:9999;background:#1e1e2e;color:#cdd6f4;border-radius:12px;padding:20px;font:13px/1.5 system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.4)}' +
    '#editor-panel h3{margin:0 0 12px;font-size:14px;color:#89b4fa;border-bottom:1px solid #313244;padding-bottom:8px}' +
    '#editor-panel label{display:block;margin:8px 0 4px;font-size:12px;color:#a6adc8}' +
    '#editor-panel input[type="text"]{width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #45475a;border-radius:6px;background:#313244;color:#cdd6f4;font-size:13px;outline:none}' +
    '#editor-panel input[type="text"]:focus{border-color:#89b4fa}' +
    '.editor-section-heading{font-size:12px;color:#89b4fa;margin:12px 0 6px;padding-top:8px;border-top:1px solid #313244;font-weight:600}' +
    '.editor-toggle{display:flex;align-items:center;justify-content:space-between;padding:4px 0}' +
    '.editor-toggle span{font-size:12px;color:#a6adc8}' +
    '.editor-switch{position:relative;width:36px;height:20px;cursor:pointer}' +
    '.editor-switch input{opacity:0;width:0;height:0;position:absolute}' +
    '.editor-switch .slider{position:absolute;inset:0;background:#45475a;border-radius:20px;transition:.2s}' +
    '.editor-switch .slider:before{content:"";position:absolute;height:14px;width:14px;left:3px;bottom:3px;background:#cdd6f4;border-radius:50%;transition:.2s}' +
    '.editor-switch input:checked+.slider{background:#89b4fa}' +
    '.editor-switch input:checked+.slider:before{transform:translateX(16px)}' +
    '.editor-section{margin-bottom:16px}' +
    '#editor-panel button{display:block;width:100%;padding:8px;border:none;border-radius:6px;font:600 13px system-ui,sans-serif;cursor:pointer;margin-top:8px}' +
    '.editor-btn-export{background:#a6e3a1;color:#1e1e2e}' +
    '.editor-btn-export:hover{background:#94e2d5}' +
    '.editor-btn-reset{background:#45475a;color:#cdd6f4}' +
    '.editor-btn-reset:hover{background:#585b70}' +
    /* Inline editable elements */
    '[data-config].editor-hoverable{outline:2px dashed transparent;outline-offset:2px;cursor:pointer;transition:outline-color .15s}' +
    '[data-config].editor-hoverable:hover{outline-color:#2563eb}' +
    '[data-config][contenteditable="true"]{outline:2px solid #2563eb!important;outline-offset:2px;background:rgba(37,99,235,0.05);min-height:1em}' +
    '[data-section].editor-section-off{opacity:0.3;pointer-events:none}' +
    /* Edit mode: hide play overlay */
    'body.editor-active .video-play-overlay{display:none!important}' +
    /* Edit mode: fix video outro layout */
    'body.editor-active .video-outro{position:relative!important;top:auto!important}' +
    /* Edit mode: fix proof step titles — show primary, hide duplicate, disable slide mask */
    'body.editor-active .proof-step__title-mask{overflow:visible!important}' +
    'body.editor-active .proof-step__title-slide{transform:none!important;display:block}' +
    'body.editor-active [data-config-title-dup]{display:none!important}' +
    'body.editor-active .proof-step__title-text[data-config]{display:block}' +
    /* Edit mode: skills inline editing */
    'body.editor-active .skills-item{pointer-events:auto}' +
    'body.editor-active .skills-item__word.editor-hoverable:hover{outline-color:#2563eb}' +
    'body.editor-active .skills-item__desc.editor-hoverable:hover{outline-color:#2563eb}';
  document.head.appendChild(style);

  // Add editor-active class to body
  document.body.classList.add('editor-active');

  // Kill ALL ScrollTrigger instances so no scroll animation runs in edit mode
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(function (st) {
      st.kill(true);
    });
    ScrollTrigger.refresh();
  }

  // Force-reset GSAP-animated elements to their visual end state
  if (typeof gsap !== 'undefined') {
    // Video player: reset to full-size natural state
    var playerEl = document.getElementById('videoPlayer');
    if (playerEl) {
      gsap.set(playerEl, { scale: 1, rotate: 0, y: 0, borderRadius: '16px', clearProps: '' });
    }

    // Video text elements: force visible
    var videoHeading = document.querySelector('.video-section__heading');
    var videoSub = document.querySelector('.video-section__sub');
    var videoText1 = document.getElementById('videoText1');
    var videoOutro = document.getElementById('videoOutro');
    [videoHeading, videoSub, videoText1, videoOutro].forEach(function (el) {
      if (el) gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' });
    });

    // Video footer: reset position for full-scale player
    var footer = document.querySelector('.video-section__footer');
    if (footer) {
      footer.style.position = 'relative';
      footer.style.top = 'auto';
    }

    // Skills box: reset to expanded (end) state
    var skillsBox = document.querySelector('.skills-box');
    if (skillsBox) {
      gsap.set(skillsBox, { marginLeft: '30px', marginRight: '30px', marginTop: '0px', marginBottom: '0px', borderRadius: '19px' });
    }

    // Skills items: force visible
    document.querySelectorAll('.skills-item__num').forEach(function (el) {
      gsap.set(el, { opacity: 1 });
    });
    document.querySelectorAll('.skills-item__desc').forEach(function (el) {
      gsap.set(el, { opacity: 1 });
    });

    // Proof box: reset parallax
    var proofBox = document.getElementById('proofBox');
    if (proofBox) gsap.set(proofBox, { y: 0 });

    // Char-by-char reveals: force visible
    document.querySelectorAll('.char').forEach(function (el) {
      gsap.set(el, { opacity: 1 });
    });
  }

  // Kill GSAP hover handlers on skills by intercepting events
  document.querySelectorAll('.skills-item').forEach(function (item) {
    item.addEventListener('mouseenter', function (e) { e.stopImmediatePropagation(); }, true);
    item.addEventListener('mouseleave', function (e) { e.stopImmediatePropagation(); }, true);
  });

  // Make skills sub-elements inline-editable
  document.querySelectorAll('.skills-item').forEach(function (item, index) {
    var wordEl = item.querySelector('.skills-item__word');
    var descEl = item.querySelector('.skills-item__desc');

    [wordEl, descEl].forEach(function (el) {
      if (!el) return;
      el.classList.add('editor-hoverable');

      el.addEventListener('click', function (e) {
        if (el.getAttribute('contenteditable') === 'true') return;
        e.preventDefault();
        e.stopPropagation();
        el.setAttribute('contenteditable', 'true');
        el.focus();
      });

      el.addEventListener('blur', function () {
        el.removeAttribute('contenteditable');
        if (!workingConfig.skills[index]) return;
        if (el === wordEl) {
          workingConfig.skills[index].word = el.textContent;
        } else {
          workingConfig.skills[index].desc = el.textContent;
        }
        persist();
      });

      el.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') el.blur();
      });
    });
  });

  // --- Edit mode banner ---
  var banner = document.createElement('div');
  banner.id = 'editor-banner';
  banner.textContent = 'EDIT MODE';
  document.body.appendChild(banner);

  // --- Build sidebar panel ---
  var panel = document.createElement('div');
  panel.id = 'editor-panel';

  var html = '<h3>Page Editor</h3>';

  // Company
  html += '<div class="editor-section">';
  html += '<label>Company Name</label>';
  html += '<input type="text" id="ed-company-name" value="' + escAttr(workingConfig.company.name) + '">';
  html += '<label>Company Logo URL</label>';
  html += '<input type="text" id="ed-company-logo" value="' + escAttr(workingConfig.company.logo) + '">';
  html += '</div>';

  // Greeting
  html += '<div class="editor-section">';
  html += '<label>Greeting (before logo)</label>';
  html += '<input type="text" id="ed-greeting-0" value="' + escAttr(workingConfig.greeting[0]) + '">';
  html += '<label>Greeting (after logo)</label>';
  html += '<input type="text" id="ed-greeting-1" value="' + escAttr(workingConfig.greeting[1]) + '">';
  html += '</div>';

  // Video
  html += '<div class="editor-section">';
  html += '<div class="editor-section-heading">Video</div>';
  html += '<label>Vimeo URL or ID</label>';
  html += '<input type="text" id="ed-video" value="' + escAttr(workingConfig.video.vimeoId) + '" placeholder="e.g. 1140568272 or full URL">';
  html += '</div>';

  // Section toggles
  html += '<div class="editor-section">';
  html += '<div class="editor-section-heading">Sections</div>';
  var sectionLabels = {
    hero: 'Hero', whyAxis: 'Why Axis', clients: 'Clients',
    video: 'Video', skills: 'Skills', proof: 'Framework', closing: 'Closing'
  };
  Object.keys(workingConfig.sections).forEach(function (key) {
    var checked = workingConfig.sections[key] ? ' checked' : '';
    html += '<div class="editor-toggle"><span>' + sectionLabels[key] + '</span>' +
      '<label class="editor-switch"><input type="checkbox" data-section-toggle="' + key + '"' + checked + '>' +
      '<span class="slider"></span></label></div>';
  });
  html += '</div>';

  // Buttons
  html += '<button class="editor-btn-export" id="ed-export">Export Config</button>';
  html += '<button class="editor-btn-reset" id="ed-reset">Reset Changes</button>';

  panel.innerHTML = html;
  document.body.appendChild(panel);

  // --- Make text elements editable ---
  var editables = document.querySelectorAll('[data-config]');
  editables.forEach(function (el) {
    el.classList.add('editor-hoverable');

    el.addEventListener('click', function (e) {
      if (el.getAttribute('contenteditable') === 'true') return;
      e.preventDefault();
      e.stopPropagation();
      el.setAttribute('contenteditable', 'true');
      el.focus();
    });

    el.addEventListener('blur', function () {
      el.removeAttribute('contenteditable');
      var key = el.getAttribute('data-config');
      if (key && workingConfig.text[key] !== undefined) {
        workingConfig.text[key] = el.innerHTML;
        // Sync duplicate title elements
        var dup = document.querySelector('[data-config-title-dup="' + key + '"]');
        if (dup) dup.innerHTML = el.innerHTML;
        persist();
      }
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        el.blur();
      }
    });
  });

  // --- Panel input handlers ---
  bindInput('ed-company-name', function (val) {
    workingConfig.company.name = val;
    var logo = document.querySelector('[data-config-logo]');
    if (logo) logo.alt = val;
    persist();
  });

  bindInput('ed-company-logo', function (val) {
    workingConfig.company.logo = val;
    var logo = document.querySelector('[data-config-logo]');
    if (logo) logo.src = val;
    persist();
  });

  bindInput('ed-greeting-0', function (val) {
    workingConfig.greeting[0] = val;
    var el = document.querySelector('[data-config="greeting-before"]');
    if (el) el.textContent = val;
    persist();
  });

  bindInput('ed-greeting-1', function (val) {
    workingConfig.greeting[1] = val;
    var el = document.querySelector('[data-config="greeting-after"]');
    if (el) el.textContent = val;
    persist();
  });

  bindInput('ed-video', function (val) {
    var match = val.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    var id = match ? match[1] : val.replace(/\D/g, '');
    var hashMatch = val.match(/[?&]h=([a-f0-9]+)/);
    workingConfig.video.vimeoId = id;
    if (hashMatch) workingConfig.video.vimeoHash = hashMatch[1];
    var iframe = document.querySelector('.video-section__player iframe');
    if (iframe && id) {
      var hash = workingConfig.video.vimeoHash ? '?h=' + workingConfig.video.vimeoHash + '&' : '?';
      iframe.src = 'https://player.vimeo.com/video/' + id + hash + 'title=0&byline=0&portrait=0&autoplay=1&muted=1&controls=0';
    }
    persist();
  });

  // --- Section toggles ---
  var toggles = panel.querySelectorAll('[data-section-toggle]');
  toggles.forEach(function (toggle) {
    toggle.addEventListener('change', function () {
      var key = toggle.getAttribute('data-section-toggle');
      workingConfig.sections[key] = toggle.checked;
      var sections = document.querySelectorAll('[data-section="' + key + '"]');
      sections.forEach(function (s) {
        if (toggle.checked) {
          s.style.display = '';
          s.classList.remove('editor-section-off');
        } else {
          s.style.display = 'none';
          s.classList.add('editor-section-off');
        }
      });
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(function () { ScrollTrigger.refresh(); }, 150);
      }
      persist();
    });
  });

  // --- Export config ---
  document.getElementById('ed-export').addEventListener('click', function () {
    var output = 'var PAGE_CONFIG = ' + JSON.stringify(workingConfig, null, 2) + ';\n';
    var blob = new Blob([output], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'page-config.js';
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- Reset ---
  document.getElementById('ed-reset').addEventListener('click', function () {
    if (!confirm('Reset all changes? This clears your edits and reloads the page.')) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });

  // --- Helpers ---
  function escAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bindInput(id, handler) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () { handler(el.value); });
  }
})();
