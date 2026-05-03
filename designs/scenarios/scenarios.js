/**
 * scenarios.js — Surmount B2C onboarding scenario patcher
 * Reads ?scenario=<id> from the URL and patches the homepage's
 * onboarding verify card to reflect a specific edge case state.
 * Load this script at the bottom of home/homepage.html.
 */

(function () {
  const SCENARIOS = {
    'new-user': {
      name: 'New user — verify identity',
      description: 'First-time user who has submitted their application and needs to verify their identity.',
      title: 'Verify your identity to continue',
      caption: '25% complete · 2 documents needed',
      progressActive: 1,
      progressColor: 'orange',
      href: '../onboarding/account-setup.html',
      tag: 'Onboarding · Step 1',
    },
    'docs-submitted': {
      name: 'Documents submitted — under review',
      description: 'User uploaded their identity documents and is waiting for the compliance team to review them.',
      title: 'Documents under review',
      caption: '50% complete · Usually 1–2 business days',
      progressActive: 2,
      progressColor: 'blue',
      href: '../onboarding/application-review.html',
      tag: 'Onboarding · Step 2',
    },
    'identity-approved': {
      name: 'Identity approved — make first deposit',
      description: 'Identity verified. Next step is adding funds to the investing account.',
      title: 'Make your first deposit',
      caption: '75% complete · Add funds to start investing',
      progressActive: 3,
      progressColor: 'blue',
      href: '../onboarding/fund-account.html',
      tag: 'Onboarding · Step 3',
    },
    'needs-strategy': {
      name: 'Funded — pick first strategy',
      description: 'Account funded. User needs to pick their first investment strategy to activate the account.',
      title: 'Pick your first strategy',
      caption: '90% complete · One last step',
      progressActive: 4,
      progressColor: 'blue',
      href: '../onboarding/account-setup.html',
      tag: 'Onboarding · Step 4',
    },
    'account-ready': {
      name: 'Fully onboarded — dashboard',
      description: 'User has completed all onboarding steps. No banner shown — full dashboard view.',
      hideCard: true,
      tag: 'Onboarding · Complete',
    },
  };

  const PROGRESS_COLORS = {
    orange: {
      active: 'linear-gradient(to right, #de5b18, #f19246)',
      inactive: 'rgba(222,91,24,0.2)',
    },
    blue: {
      active: 'linear-gradient(to right, #3757be, #406ad0)',
      inactive: 'rgba(64,106,208,0.15)',
    },
    green: {
      active: 'linear-gradient(to right, #316434, #4d9a51)',
      inactive: 'rgba(49,100,52,0.15)',
    },
  };

  function applyScenario(id) {
    const scenario = SCENARIOS[id];
    if (!scenario) return;

    const card = document.querySelector('.verify-card');
    if (!card) return;

    if (scenario.hideCard) {
      card.style.display = 'none';
      addBanner(id, scenario);
      return;
    }

    // Patch href
    if (scenario.href) card.href = scenario.href;

    // Patch title
    const title = card.querySelector('.verify-card-title');
    if (title && scenario.title) title.textContent = scenario.title;

    // Patch caption
    const caption = card.querySelector('.verify-card-caption');
    if (caption && scenario.caption) caption.textContent = scenario.caption;

    // Patch progress segments
    const segments = card.querySelectorAll('.verify-progress-seg');
    const colors = PROGRESS_COLORS[scenario.progressColor || 'orange'];
    segments.forEach((seg, i) => {
      const isActive = i < (scenario.progressActive || 1);
      seg.style.background = isActive ? colors.active : colors.inactive;
      seg.classList.toggle('active', isActive);
    });

    addBanner(id, scenario);
  }

  function addBanner(id, scenario) {
    const banner = document.createElement('div');
    banner.id = 'scenario-banner';
    banner.style.cssText = [
      'position:fixed;bottom:16px;left:50%;transform:translateX(-50%)',
      'background:rgba(24,29,39,0.92)',
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)',
      'color:#fff;font-family:\'Geist\',system-ui,sans-serif',
      'font-size:13px;font-weight:400;letter-spacing:-0.2px',
      'padding:8px 14px 8px 12px',
      'border-radius:10px',
      'display:flex;align-items:center;gap:10px',
      'z-index:9999;pointer-events:none',
      'box-shadow:0 4px 16px rgba(10,13,18,0.25)',
      'white-space:nowrap',
    ].join(';');

    banner.innerHTML = `
      <span style="background:rgba(255,255,255,0.12);padding:2px 7px;border-radius:5px;font-size:11px;font-weight:500;color:rgba(255,255,255,0.7)">${scenario.tag || id}</span>
      <span style="color:rgba(255,255,255,0.9)">${scenario.name}</span>
      <a href="../scenarios/index.html" style="color:rgba(255,255,255,0.45);text-decoration:none;font-size:12px;pointer-events:all;margin-left:4px">All scenarios →</a>
    `;
    document.body.appendChild(banner);
  }

  // Run on DOMContentLoaded
  function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('scenario');
    if (id) applyScenario(id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose scenario data for the index page
  window.SURMOUNT_SCENARIOS = SCENARIOS;
})();
