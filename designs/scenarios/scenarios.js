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
      caption: '1/3 complete · 2 documents needed',
      progressActive: 1,
      progressColor: 'orange',
      href: '../onboarding/account-setup.html',
      tag: 'Onboarding · Step 1',
    },
    'docs-submitted': {
      name: 'Documents submitted — under review',
      description: 'User uploaded their identity documents and is waiting for the compliance team to review them.',
      title: 'Your application is under review',
      caption: '1/3 complete · Usually within 1–2 business days',
      progressActive: 1,
      progressColor: 'blue-light',
      cardBackground: 'linear-gradient(110.95deg, rgb(247,248,250) 2.49%, rgb(245,247,250) 99.18%)',
      logoSrc: '../assets/illustrations/surmount-logo-mark-blue.png',
      href: '../onboarding/application-review.html',
      tag: 'Onboarding · Step 1',
    },
    'identity-approved': {
      name: 'Identity approved — make first deposit',
      description: 'Identity verified. Next step is adding funds to the investing account.',
      title: 'Make your first deposit',
      caption: '2/3 complete · Bank account not connected',
      segmentColors: ['#4d9a51', 'linear-gradient(to right, #3b7e3f, #71b775)', 'rgba(59,126,63,0.2)'],
      cardBackground: 'linear-gradient(110.52deg, rgb(247,250,247) 2.49%, rgb(245,250,245) 99.18%)',
      logoSrc: '../assets/illustrations/surmount-logo-mark-green.png',
      href: '../onboarding/fund-account.html',
      tag: 'Onboarding · Step 2',
    },
    'needs-strategy': {
      name: 'Funded — pick first strategy',
      description: 'Account funded. User needs to pick their first investment strategy to activate the account.',
      title: 'Pick your first strategy',
      caption: '2/3 complete',
      segmentColors: ['#4d9a51', '#4d9a51', 'linear-gradient(to right, #3b7e3f, #71b775)'],
      cardBackground: 'linear-gradient(110.52deg, rgb(247,250,247) 2.49%, rgb(245,250,245) 99.18%)',
      logoSrc: '../assets/illustrations/surmount-logo-mark-green.png',
      href: '../onboarding/pick-strategy.html',
      tag: 'Onboarding · Step 3',
    },
    'account-ready': {
      name: 'Fully onboarded — dashboard',
      description: 'User has completed all onboarding steps. No banner shown — full dashboard view.',
      hideCard: true,
      tag: 'Onboarding · Complete',
    },
    'account-rejected': {
      name: 'Application rejected — unable to approve',
      description: 'System was unable to approve the user\'s application. Card shows rejection message with support contact info. Dismissable via ×.',
      replaceCard: true,
      tag: 'Onboarding · Error',
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
    'blue-light': {
      active: 'linear-gradient(to right, #406ad0, #75a5e5)',
      inactive: 'rgba(64,106,208,0.2)',
    },
    green: {
      active: 'linear-gradient(to right, #316434, #4d9a51)',
      inactive: 'rgba(49,100,52,0.15)',
    },
  };

  function buildRejectionCard() {
    const div = document.createElement('div');
    div.className = 'verify-card';
    div.style.cssText = [
      'cursor:default',
      'background:linear-gradient(104.53deg,#ffffff 2.49%,#fafafa 99.18%)',
      'display:flex',
      'flex-direction:column',
      'gap:20px',
      'padding:20px',
      'border-radius:12px',
      'border:1px solid rgba(0,0,0,0.06)',
      'box-shadow:0px 2px 6px rgba(10,13,18,0.03)',
      'font-family:\'Geist\',system-ui,sans-serif',
      'letter-spacing:-0.3px',
    ].join(';');

    div.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="position:relative;width:60px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
          <div style="position:absolute;inset:0;background:rgba(255,255,255,0.5);backdrop-filter:blur(2.3px);-webkit-backdrop-filter:blur(2.3px);border-radius:10px;box-shadow:inset 0px 0px 4px rgba(118,118,118,0.13)"></div>
          <img src="../assets/illustrations/surmount-logo-mark-gray.png" alt="Surmount" style="width:36px;height:36px;object-fit:contain;position:relative;z-index:1">
        </div>
        <button class="rejection-dismiss-btn" style="width:24px;height:24px;border:none;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;color:rgba(10,13,18,0.35);transition:color 150ms ease;flex-shrink:0" aria-label="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px">
        <p style="font-size:18px;font-weight:500;color:rgba(10,13,18,0.9);line-height:28px;letter-spacing:-0.3px;font-family:\'Geist\',system-ui,sans-serif">We’re unable to approve your application</p>
        <p style="font-size:14px;font-weight:400;color:rgba(10,13,18,0.7);line-height:20px;letter-spacing:-0.3px;font-family:\'Geist\',system-ui,sans-serif">Based on the information provided, we can’t proceed with your application. If you believe this is an error or have questions, our support team is here to help.</p>
      </div>
      <div style="background:#f5f5f5;border-radius:6px;padding:12px">
        <p style="font-size:12px;font-weight:400;color:rgba(10,13,18,0.7);line-height:18px;letter-spacing:-0.2px;font-family:\'Geist\',system-ui,sans-serif">Email us at <a href="mailto:support@surmount.ai" style="color:rgba(10,13,18,0.9);font-weight:500;text-decoration:underline;text-underline-offset:2px">support@surmount.ai</a> or call <a href="tel:+19296821617" style="color:rgba(10,13,18,0.9);font-weight:500;text-decoration:underline;text-underline-offset:2px">+1 (929) 682-1617</a></p>
      </div>
    `;

    div.querySelector('.rejection-dismiss-btn').addEventListener('mouseenter', function () {
      this.style.color = 'rgba(10,13,18,0.7)';
    });
    div.querySelector('.rejection-dismiss-btn').addEventListener('mouseleave', function () {
      this.style.color = 'rgba(10,13,18,0.35)';
    });
    div.querySelector('.rejection-dismiss-btn').addEventListener('click', function () {
      div.style.transition = 'opacity 220ms ease, transform 220ms ease';
      div.style.opacity = '0';
      div.style.transform = 'translateY(-6px)';
      setTimeout(() => div.remove(), 240);
    });

    return div;
  }

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

    if (scenario.replaceCard) {
      const rejectionCard = buildRejectionCard();
      card.parentNode.replaceChild(rejectionCard, card);
      addBanner(id, scenario);
      return;
    }

    // Patch card background
    if (scenario.cardBackground) card.style.background = scenario.cardBackground;

    // Patch logo image
    if (scenario.logoSrc) {
      const logo = card.querySelector('.verify-card-logo img');
      if (logo) logo.src = scenario.logoSrc;
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
    if (scenario.segmentColors) {
      segments.forEach((seg, i) => {
        seg.style.background = scenario.segmentColors[i] || 'rgba(0,0,0,0.08)';
        seg.classList.toggle('active', !!scenario.segmentColors[i] && !scenario.segmentColors[i].startsWith('rgba'));
      });
    } else {
      const colors = PROGRESS_COLORS[scenario.progressColor || 'orange'];
      segments.forEach((seg, i) => {
        const isActive = i < (scenario.progressActive || 1);
        seg.style.background = isActive ? colors.active : colors.inactive;
        seg.classList.toggle('active', isActive);
      });
    }

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
