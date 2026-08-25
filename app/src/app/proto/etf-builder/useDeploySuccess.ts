'use client';

import { useRouter } from 'next/navigation';
import s from './DeployToast.module.css';

// DeployOverlay (real production, @/app/home/builder/_shared) exposes a single onClose — fired
// identically whether the user backs out mid-flow or clicks "Done" after a successful deposit, so
// there's no hook to distinguish them without editing that shared component. Treating every close
// as "done" and routing to /home/builder (the real "Create" page, per Sidebar.tsx's nav entry) is
// the trade-off: it's the only path DeployOverlay's success screen actually reaches in practice.
//
// The toast has to be a plain DOM node, not React state: /proto/etf-builder and /home/builder only
// share the app's root layout, so navigating between them unmounts this page's whole React tree —
// any React-rendered toast would vanish with it. A node appended directly to document.body sits
// outside whatever Next mounts its route tree into, so it survives the client-side transition.
const TOAST_PAINT_DELAY_MS = 200;
const TOAST_VISIBLE_MS = 2400;
const TOAST_EXIT_MS = 250;

function showDeployToast(strategyName: string) {
  const el = document.createElement('div');
  el.className = s.toast;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 20 20');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('class', s.icon);
  // Static, hand-authored markup only — never interpolate strategyName (user text) into innerHTML.
  icon.innerHTML = '<circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />'
    + '<path d="M6 10.2 L8.7 13 L14 7.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />';

  const text = document.createElement('span');
  text.textContent = `"${strategyName || 'Strategy'}" has been deployed`;

  el.append(icon, text);
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.dataset.open = 'true';
    });
  });

  window.setTimeout(() => {
    delete el.dataset.open;
    window.setTimeout(() => el.remove(), TOAST_EXIT_MS);
  }, TOAST_VISIBLE_MS);
}

export function useDeploySuccess() {
  const router = useRouter();

  function handleDeployOverlayClose(strategyName: string) {
    router.push('/home/builder');
    window.setTimeout(() => showDeployToast(strategyName), TOAST_PAINT_DELAY_MS);
  }

  return { handleDeployOverlayClose };
}
