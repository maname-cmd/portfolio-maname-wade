/* Site Maname Wade : interactions (thème, menu mobile, filtres, vidéos, formulaire) */
(function () {
  'use strict';
  var page = document.getElementById('page');
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- Thème clair / sombre ---------- */
  function currentTheme() { return page.classList.contains('theme-dark') ? 'dark' : 'light'; }
  function applyTheme(t) {
    page.classList.remove('theme-light', 'theme-dark');
    page.classList.add('theme-' + t);
    var label = t === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair';
    document.querySelectorAll('.theme-toggle').forEach(function (b) { b.setAttribute('aria-label', label); b.setAttribute('title', label); });
  }
  applyTheme(currentTheme());
  document.querySelectorAll('.theme-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = currentTheme() === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('mw-theme', t); } catch (e) {}
      applyTheme(t);
    });
  });
  window.addEventListener('storage', function (e) {
    if (e.key === 'mw-theme' && (e.newValue === 'light' || e.newValue === 'dark')) applyTheme(e.newValue);
  });

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('[data-menu-open]');
  if (burger) {
    var logo = document.querySelector('.site-nav-brand .mw-logo');
    var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav-links a'));
    var menu = document.createElement('div');
    menu.className = 'mobile-menu'; menu.id = 'mobile-menu'; menu.hidden = true;
    menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'Menu');
    var html = '<div class="mobile-menu-top">' + (logo ? logo.outerHTML : '') +
      '<button class="mobile-menu-close" type="button" aria-label="Fermer le menu">×</button></div><ul class="mobile-menu-links">';
    links.forEach(function (a) {
      html += '<li><a class="mobile-menu-link" href="' + a.getAttribute('href') + '"' + (a.getAttribute('aria-current') || a.classList.contains('is-current') ? ' aria-current="page"' : '') + '>' + a.textContent + '</a></li>';
    });
    html += '</ul><div class="mobile-menu-foot"><a class="mw-btn mw-btn-primary mw-btn-lg" href="contact.html">Me contacter</a></div>';
    menu.innerHTML = html;
    page.appendChild(menu);
    var closeBtn = menu.querySelector('.mobile-menu-close');
    var open = function () { menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('menu-open'); closeBtn.focus(); };
    var close = function () { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); burger.focus(); };
    burger.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.hidden = true; document.body.classList.remove('menu-open'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 767 && !menu.hidden) close(); });
  }

  /* ---------- Filtres de projets ---------- */
  var chips = document.querySelectorAll('[data-filter]');
  if (chips.length) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.work-card[data-cat]'));
    var track = document.querySelector('[data-track]');
    var countEl = document.querySelector('.work-count, [data-count]');
    var setFilter = function (f) {
      chips.forEach(function (c) {
        var on = c.getAttribute('data-filter') === f;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = cards.filter(function (c) { return f === 'all' || c.getAttribute('data-cat') === f; });
      cards.forEach(function (c) {
        var vis = shown.indexOf(c) > -1;
        c.hidden = !vis;
        if (c.getAttribute('data-wide')) c.classList.toggle('work-card--wide', f === 'all');
      });
      var total = shown.length;
      shown.forEach(function (c, i) {
        var idx = c.querySelector('[data-index]');
        if (idx) idx.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + (total < 10 ? '0' : '') + total;
      });
      document.querySelectorAll('[data-count-label]').forEach(function (el) { el.textContent = total + ' projet' + (total > 1 ? 's' : ''); });
      if (track) { track.scrollTo({ left: 0 }); updateBar(); }
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { setFilter(c.getAttribute('data-filter')); }); });
  }

  /* ---------- Carrousel de l'accueil ---------- */
  var trackEl = document.querySelector('[data-track]');
  var bar = document.querySelector('[data-track-bar]');
  function updateBar() {
    if (!trackEl || !bar) return;
    var max = trackEl.scrollWidth - trackEl.clientWidth;
    var p = max > 0 ? trackEl.scrollLeft / max : 1;
    bar.style.width = Math.max(12, Math.round(p * 100)) + '%';
  }
  if (trackEl) {
    trackEl.addEventListener('scroll', updateBar, { passive: true });
    var step = function (dir) { trackEl.scrollBy({ left: dir * 424, behavior: reduced ? 'auto' : 'smooth' }); };
    var prev = document.querySelector('[data-track-prev]'), next = document.querySelector('[data-track-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    updateBar();
  }

  /* ---------- Vidéo « Mon profil en 60 secondes » ---------- */
  var mv = document.querySelector('video.mvid-video');
  if (mv) {
    var section = mv.closest('.mvid') || mv.parentNode;
    var small = false;
    try { small = window.matchMedia('(max-width: 767px)').matches; } catch (e) {}
    mv.src = small ? mv.getAttribute('data-src-sm') : mv.getAttribute('data-src-lg');
    mv.muted = true; mv.loop = true; mv.playsInline = true;
    var userPaused = false;
    var big = section.querySelector('[data-mvid-big]');
    var playBtn = section.querySelector('[data-mvid-play]');
    var soundBtn = section.querySelector('[data-mvid-sound]');
    var sync = function () {
      var playing = !mv.paused;
      section.classList.toggle('is-paused', !playing);
      var l = playing ? 'Mettre la vidéo en pause' : 'Lire la vidéo';
      if (playBtn) { playBtn.setAttribute('aria-label', l); playBtn.setAttribute('title', l); }
      if (big) big.hidden = playing || !(userPaused || reduced);
    };
    var play = function () { var p = mv.play(); if (p && p.catch) p.catch(function () {}); };
    mv.addEventListener('play', sync); mv.addEventListener('pause', sync);
    sync();
    if (!reduced && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio >= 0.4) { if (!userPaused) play(); }
          else if (!mv.paused) mv.pause();
        });
      }, { threshold: [0, 0.4, 0.8] }).observe(mv);
    }
    var toggle = function () { if (mv.paused) { userPaused = false; play(); } else { userPaused = true; mv.pause(); } sync(); };
    if (playBtn) playBtn.addEventListener('click', toggle);
    if (big) big.addEventListener('click', toggle);
    if (soundBtn) soundBtn.addEventListener('click', function () {
      var mute = !mv.muted;
      if (!mute) { try { mv.currentTime = 0; } catch (e) {} userPaused = false; mv.muted = false; play(); }
      else mv.muted = true;
      section.classList.toggle('has-sound', !mv.muted);
      soundBtn.setAttribute('aria-pressed', mv.muted ? 'false' : 'true');
      sync();
    });
  }

  /* ---------- Vidéo de présentation du Parcours (fichier hébergé sur le site) ---------- */
  var vh = document.querySelector('[data-vhero]');
  if (vh) {
    var pv = vh.querySelector('video.vhero-video');
    var poster = vh.querySelector('[data-vhero-play]');
    var muteBtn = vh.querySelector('[data-vhero-mute]');
    var sm = false;
    try { sm = window.matchMedia('(max-width: 767px)').matches; } catch (e) {}
    var loaded = false;
    var load = function () { if (!loaded) { pv.src = sm ? pv.getAttribute('data-src-sm') : pv.getAttribute('data-src-lg'); loaded = true; } };
    var playV = function () { load(); var pr = pv.play(); if (pr && pr.catch) pr.catch(function () {}); };
    pv.muted = true; pv.loop = true; pv.playsInline = true;
    var userStopped = false;
    var setSound = function (on) {
      pv.muted = !on;
      poster.hidden = on;
      muteBtn.hidden = !on;
    };
    // Sans animation réduite : la vidéo se lance sans le son quand elle arrive à l'écran
    if (!reduced) {
      poster.classList.add('vhero-poster--live');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && en.intersectionRatio >= 0.4) { if (!userStopped) playV(); }
            else if (!pv.paused) pv.pause();
          });
        }, { threshold: [0, 0.4, 0.8] }).observe(pv);
      } else { playV(); }
    }
    // Clic sur l'affiche : on repart du début avec le son
    poster.addEventListener('click', function () {
      userStopped = false;
      load();
      try { pv.currentTime = 0; } catch (e) {}
      setSound(true);
      playV();
      muteBtn.focus();
    });
    muteBtn.addEventListener('click', function () { setSound(false); poster.focus(); });
  }


  /* ---------- Lecture des vidéos YouTube dans une fenêtre (cartes avec data-yt) ---------- */
  var ytCards = document.querySelectorAll('a[data-yt]');
  if (ytCards.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'vmodal';
    dlg.setAttribute('aria-label', 'Lecture de la vidéo');
    dlg.innerHTML = '<div class="vmodal-box"><div class="vmodal-top"><p class="vmodal-title"></p>' +
      '<button class="vmodal-close" type="button" aria-label="Fermer la vidéo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="vmodal-player"></div><a class="vmodal-link" target="_blank" rel="noopener">Ouvrir sur YouTube</a></div>';
    page.appendChild(dlg);
    var player = dlg.querySelector('.vmodal-player'), titleEl = dlg.querySelector('.vmodal-title'), ytLink = dlg.querySelector('.vmodal-link');
    var opener = null;
    var closeDlg = function () { if (dlg.open) dlg.close(); };
    dlg.addEventListener('close', function () { player.innerHTML = ''; document.body.classList.remove('menu-open'); if (opener) opener.focus(); });
    dlg.querySelector('.vmodal-close').addEventListener('click', closeDlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });
    ytCards.forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        opener = a;
        var id = a.getAttribute('data-yt'), t = (a.querySelector('h2, h3') || {}).textContent || 'Vidéo';
        titleEl.textContent = t;
        dlg.setAttribute('aria-label', t);
        ytLink.href = a.getAttribute('href');
        var im = a.querySelector('img');
        if (im) { var pv = document.createElement('img'); pv.className = 'vmodal-poster'; pv.src = im.getAttribute('src'); pv.alt = ''; player.appendChild(pv); }
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        f.title = t;
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        player.appendChild(f);
        document.body.classList.add('menu-open');
        dlg.showModal();
      });
    });
  }

  /* ---------- Accordéon des certifications ---------- */
  document.querySelectorAll('.acc-btn[aria-controls]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.acc-btn[aria-controls]').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.querySelector('.acc-sign').textContent = '+';
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        btn.querySelector('.acc-sign').textContent = '−';
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
      }
    });
  });

  /* ---------- Formulaire de contact (Netlify Forms) ---------- */
  var form = document.querySelector('form[data-netlify]');
  if (form) {
    var ok = document.querySelector('[data-form-success]');
    var err = document.querySelector('[data-form-error]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true; err.hidden = true;
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); form.hidden = true; ok.hidden = false; ok.querySelector('button').focus(); })
        .catch(function () { err.hidden = false; })
        .then(function () { btn.disabled = false; });
    });
    var again = document.querySelector('[data-form-reset]');
    if (again) again.addEventListener('click', function () { ok.hidden = true; form.hidden = false; form.querySelector('input:not([type=hidden])').focus(); });
  }
})();
