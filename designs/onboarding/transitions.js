/* ═══ Linear-style page transitions + modal animator ═══════════════════
 * Within /onboarding/: intercepts clicks, SPA-swaps the body, drives
 * document.startViewTransition so the topbar stays anchored while
 * <main> slides.
 *
 * Outside /onboarding/ (e.g. homepage): does NOT intercept — it just
 * sets the nav direction on sessionStorage and lets the browser do a
 * native navigation. Cross-document view transitions (declared in
 * transitions.css with `@view-transition { navigation: auto }`) animate
 * the page swap.
 * ──────────────────────────────────────────────────────────────────── */

(function () {
  const DIR_KEY = 'surm-nav-dir';
  const root    = document.documentElement;
  const origin  = location.origin;

  root.dataset.navDir = sessionStorage.getItem(DIR_KEY) || 'forward';

  function setDir(dir) {
    sessionStorage.setItem(DIR_KEY, dir);
    root.dataset.navDir = dir;
  }

  function isWithinOnboarding() {
    return location.pathname.includes('/onboarding/');
  }

  function extractUrl(el) {
    if (el.dataset && el.dataset.navTo) return el.dataset.navTo;
    if (el.tagName === 'A') return el.getAttribute('href');
    const oc = el.getAttribute('onclick');
    if (oc) {
      const m = oc.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (m) return m[1];
    }
    return null;
  }

  function isInternal(url) {
    if (!url) return false;
    if (url.startsWith('#'))          return false;
    if (url.startsWith('javascript:')) return false;
    try {
      const u = new URL(url, location.href);
      if (u.origin !== origin) return false;
      return u.pathname.includes('/onboarding/') && u.pathname.endsWith('.html');
    } catch { return false; }
  }

  // ─── SPA swap (same-document) ────────────────────────────────────────
  async function swapTo(url) {
    const res  = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
    if (!res.ok) throw new Error('fetch ' + res.status);
    const html = await res.text();
    const doc  = new DOMParser().parseFromString(html, 'text/html');

    document.head.querySelectorAll('style').forEach(n => n.remove());
    doc.head.querySelectorAll('style').forEach(n => {
      document.head.appendChild(n.cloneNode(true));
    });

    document.title = doc.title;

    document.body.innerHTML = doc.body.innerHTML;
    document.body.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      old.replaceWith(s);
    });

    window.scrollTo(0, 0);
  }

  // ─── Page transition helpers (animate <main> on each SPA nav) ────────
  const TRANSITION_OUT_MS = 200;
  const TRANSITION_IN_MS  = 260;

  function nextFrame() {
    return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  }
  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  let inFlight = false;

  async function navigate(url, direction, { push = true } = {}) {
    if (inFlight) return;
    inFlight = true;
    setDir(direction);

    try {
      const oldMain = document.querySelector('main');
      // 1) Animate the current <main> out (direction-aware)
      if (oldMain) {
        oldMain.classList.add(
          'flow-leave',
          direction === 'forward' ? 'flow-leave--forward' : 'flow-leave--backward'
        );
        await wait(TRANSITION_OUT_MS);
      }

      // 2) Swap DOM
      await swapTo(url);
      if (push) history.pushState({ spa: true }, '', url);

      // 3) Mount the new <main> in its starting (off-screen) state, then
      //    flush layout and remove the class so it transitions in.
      const newMain = document.querySelector('main');
      if (newMain) {
        newMain.classList.add(
          'flow-enter',
          direction === 'forward' ? 'flow-enter--forward' : 'flow-enter--backward'
        );
        // Update progress bar BEFORE we let the page paint, so the
        // bar's width animation runs in parallel with the main slide.
        updateFlowProgress();
        await nextFrame();
        newMain.classList.remove('flow-enter--forward', 'flow-enter--backward');
        // Clean up the marker class once the in-transition completes.
        setTimeout(() => newMain.classList.remove('flow-enter'), TRANSITION_IN_MS + 80);
      } else {
        updateFlowProgress();
      }
    } catch (err) {
      console.warn('[surm-nav] fallback:', err);
      location.href = url;
    } finally {
      inFlight = false;
    }
  }

  // ─── Flow progress indicator (3 phases) ──────────────────────────────
  // The cash-account opening flow has three logical phases. The progress
  // bar renders one equal-width segment per phase, with a gap between
  // them. Within each phase, the segment fills proportionally to the
  // user's step. Earlier phases fill to 100%; later phases stay at 0%.
  // Matches the actual page-to-page nav (each page's primary CTA).
  const FLOW_PHASES = [
    // 1) Identity & financial profile
    ['legal-name', 'date-of-birth', 'address', 'citizenship', 'ssn', 'phone', 'verify-phone',
     'employment', 'occupation', 'annual-income', 'net-worth', 'funding-source', 'regulatory'],
    // 2) Investment profile
    ['investing-style', 'financial-goal', 'financial-situation',
     'time-horizon', 'risk-tolerance', 'investment-allocation', 'terms'],
    // 3) Fund the account
    ['fund-account', 'fund-amount', 'fund-review', 'fund-success'],
  ];
  const PROG_KEY = 'surm-flow-progress';
  // Bump when the progress-fill formula changes so any stale start-pcts
  // saved by an earlier formula get discarded instead of animating from
  // the wrong "from" value on the next page load.
  const PROG_VERSION = 'v2';
  const PROG_VERSION_KEY = 'surm-flow-progress-version';
  try {
    if (sessionStorage.getItem(PROG_VERSION_KEY) !== PROG_VERSION) {
      sessionStorage.removeItem(PROG_KEY);
      sessionStorage.setItem(PROG_VERSION_KEY, PROG_VERSION);
    }
  } catch (_) {}

  function pageSlug() {
    const m = location.pathname.match(/\/([\w-]+)\.html$/);
    return m ? m[1] : '';
  }

  // Locate slug across phases. Returns { phase, step, len } or null.
  function locateInFlow(slug) {
    for (let p = 0; p < FLOW_PHASES.length; p++) {
      const i = FLOW_PHASES[p].indexOf(slug);
      if (i >= 0) return { phase: p, step: i + 1, len: FLOW_PHASES[p].length };
    }
    return null;
  }

  // For each segment: 100 if past, 0 if future, partial if current.
  // The current phase fills based on *completed* steps, not the current step
  // — i.e. the first page of any phase shows the segment empty, since the
  // user hasn't completed any steps in that phase yet. The segment hits
  // 100% only when the user moves on to the next phase.
  function computeSegmentPcts(loc) {
    return FLOW_PHASES.map((phase, p) => {
      if (p < loc.phase) return 100;
      if (p > loc.phase) return 0;
      return ((loc.step - 1) / loc.len) * 100;
    });
  }

  function updateFlowProgress() {
    const slug = pageSlug();
    const loc = locateInFlow(slug);
    const topbar = document.querySelector('.topbar');
    let bar = document.querySelector('.flow-progress');

    // Page isn't in the tracked flow — remove any stale bar + stored state.
    if (!topbar || !loc) {
      if (bar) bar.remove();
      try { sessionStorage.removeItem(PROG_KEY); } catch (_) {}
      return;
    }

    // Inject the bar (one segment per phase) directly after the topbar.
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'flow-progress';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-label', 'Account opening progress');
      // Three equal-width segments. Within each segment the fill advances
      // by step/len, so questions inside the same phase share the segment
      // equally — but a phase-2 question fills its segment more aggressively
      // than a phase-1 question (since phase 2 has fewer steps).
      let segHtml = '';
      for (let p = 0; p < FLOW_PHASES.length; p++) {
        segHtml += '<div class="flow-progress-seg"><div class="flow-progress-fill"></div></div>';
      }
      bar.innerHTML = segHtml;
      topbar.parentNode.insertBefore(bar, topbar.nextSibling);
    }

    const segs = bar.querySelectorAll('.flow-progress-seg');
    const targetPcts = computeSegmentPcts(loc);

    // Read previous segment pcts (saved as a JSON array). Allows the
    // CSS width transition to animate from old → new across SPA swaps.
    let startPcts = null;
    try {
      const stored = sessionStorage.getItem(PROG_KEY);
      if (stored) startPcts = JSON.parse(stored);
    } catch (_) {}

    const havePrev = Array.isArray(startPcts)
      && startPcts.length === FLOW_PHASES.length
      && startPcts.some((v, i) => v !== targetPcts[i]);

    if (havePrev) {
      // 1) Paint at previous pcts with transition off.
      bar.classList.add('flow-progress--no-anim');
      segs.forEach((seg, i) => {
        const fill = seg.querySelector('.flow-progress-fill');
        if (fill) fill.style.setProperty('--progress', startPcts[i] + '%');
      });
      // 2) Force a layout flush so the next change is treated as a real
      //    transition rather than coalesced into a single paint.
      bar.offsetWidth;
      // 3) Restore transition + set target pcts on the next frame.
      requestAnimationFrame(() => {
        bar.classList.remove('flow-progress--no-anim');
        requestAnimationFrame(() => {
          segs.forEach((seg, i) => {
            const fill = seg.querySelector('.flow-progress-fill');
            if (fill) fill.style.setProperty('--progress', targetPcts[i] + '%');
          });
        });
      });
    } else {
      segs.forEach((seg, i) => {
        const fill = seg.querySelector('.flow-progress-fill');
        if (fill) fill.style.setProperty('--progress', targetPcts[i] + '%');
      });
    }

    try { sessionStorage.setItem(PROG_KEY, JSON.stringify(targetPcts)); } catch (_) {}

    // ARIA — flatten to overall step / overall total for assistive tech.
    const overallTotal = FLOW_PHASES.reduce((sum, p) => sum + p.length, 0);
    let overallStep = loc.step;
    for (let p = 0; p < loc.phase; p++) overallStep += FLOW_PHASES[p].length;
    bar.dataset.phase = String(loc.phase + 1);
    bar.dataset.step  = String(overallStep);
    bar.dataset.total = String(overallTotal);
    bar.setAttribute('aria-valuenow', String(overallStep));
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(overallTotal));
  }

  // Initial render — run as soon as DOM is interactive.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFlowProgress, { once: true });
  } else {
    updateFlowProgress();
  }

  // ─── Modal close animator ────────────────────────────────────────────
  function closeModalAnimated(modal) {
    if (!modal || modal.hidden || modal.dataset.closing === '1') return;
    modal.dataset.closing = '1';
    modal.classList.add('closing');

    const card = modal.querySelector('.modal-card') || modal;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      card.removeEventListener('animationend', finish);
      clearTimeout(fallback);
      modal.classList.remove('closing');
      modal.hidden = true;
      delete modal.dataset.closing;
      document.body.style.overflow = '';
    };
    card.addEventListener('animationend', finish, { once: true });
    const fallback = setTimeout(finish, 260);
  }

  // ─── Click interception ──────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // Modal dismiss — animate out
    const dismiss = e.target.closest('[data-modal-dismiss]');
    if (dismiss) {
      const modal = dismiss.closest('.modal-root');
      if (modal && !modal.hidden) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeModalAnimated(modal);
      }
      return;
    }

    // Back button (topbar Back, or any element with data-nav="back")
    const back = e.target.closest('.topbar-back, [data-nav="back"]');
    if (back) {
      setDir('backward');
      if (isWithinOnboarding() && history.length > 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        history.back();
      }
      // else: fall through, inline onclick handles (and cross-doc transition fires)
      return;
    }

    // Generic forward nav
    const el = e.target.closest(
      '.cta, .topbar-close, .btn-primary-full, .btn-secondary-full, a[href], [data-nav-to]'
    );
    if (!el) return;
    const url = extractUrl(el);
    if (!isInternal(url)) return;

    setDir('forward');

    // Outside onboarding → let browser navigate; cross-doc view transition handles it.
    if (!isWithinOnboarding()) return;

    // Inside onboarding → SPA swap.
    e.preventDefault();
    e.stopImmediatePropagation();
    navigate(url, 'forward');
  }, true);

  // ESC to dismiss modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modal = document.querySelector('.modal-root:not([hidden])');
    if (!modal) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    closeModalAnimated(modal);
  }, true);

  // Browser back/forward
  window.addEventListener('popstate', () => {
    if (isWithinOnboarding()) navigate(location.href, 'backward', { push: false });
  });
})();
