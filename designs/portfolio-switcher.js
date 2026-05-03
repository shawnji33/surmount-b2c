/**
 * Surmount Portfolio Switcher — shared web component
 *
 * Vanilla port of design-system-surmount/components/ui/portfolio-switcher.tsx.
 *
 * Usage:
 *   <script src="../portfolio-switcher.js"></script>
 *   <portfolio-switcher selected="cash"></portfolio-switcher>
 *
 * Attributes:
 *   - selected: id of the initially selected portfolio (default "cash")
 *   - assets-base: relative path prefix for broker avatars (default "../assets/brokers")
 *
 * Events: emits "ps-change" with { detail: { id } } when a portfolio is picked.
 */

(function () {
  if (window.customElements.get('portfolio-switcher')) return;

  /* ─── Shared CSS (injected once) ──────────────────────────────────────── */
  const CSS = `
  <style id="portfolio-switcher-styles">
  portfolio-switcher{display:inline-flex}
  .ps-root{position:relative;display:inline-flex}
  .ps-trigger{
    display:inline-flex;align-items:center;gap:8px;
    padding:6px 8px 6px 8px;
    background:var(--color-bg-secondary,#fafafa);
    border:1px solid var(--color-border-secondary,rgba(0,0,0,0.06));
    border-radius:9999px;
    box-shadow:0 2px 12px rgba(10,13,18,0.03);
    font-family:var(--font-family-body,'Geist',sans-serif);
    font-size:14px;font-weight:500;
    color:var(--color-text-secondary-700,rgba(10,13,18,0.7));
    line-height:20px;
    white-space:nowrap;
    cursor:pointer;
    user-select:none;
    transition:border-color 150ms ease, box-shadow 150ms ease;
  }
  .ps-trigger:hover{border-color:var(--color-border-primary,rgba(0,0,0,0.09))}
  .ps-trigger[aria-expanded="true"]{
    border-color:var(--color-border-primary,rgba(0,0,0,0.09));
    box-shadow:0 2px 12px rgba(10,13,18,0.05);
  }
  .ps-avatar{
    width:24px;height:24px;border-radius:50%;
    border:0.5px solid rgba(10,13,18,0.10);
    overflow:hidden;flex-shrink:0;
    background:var(--color-bg-tertiary,#f5f5f5);
    display:inline-flex;align-items:center;justify-content:center;
  }
  .ps-avatar img{width:100%;height:100%;object-fit:cover;display:block}
  .ps-avatar-icon{
    color:var(--color-fg-secondary-700,#414651);
    background:var(--color-bg-tertiary,#f5f5f5);
  }
  .ps-avatar-icon svg{width:14px;height:14px;display:block}
  .ps-chevron{
    width:20px;height:20px;flex-shrink:0;
    display:inline-flex;align-items:center;justify-content:center;
    color:var(--color-fg-secondary-700,#414651);
    transition:transform 200ms ease;
  }
  .ps-chevron svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.67;stroke-linecap:round;stroke-linejoin:round}
  .ps-trigger[aria-expanded="true"] .ps-chevron{transform:rotate(180deg)}

  /* Menu — appended to <body> so ancestor overflow does not clip it */
  .ps-menu{
    position:fixed;
    min-width:240px;
    z-index:1000;
    background:var(--color-bg-primary,#fff);
    border:1px solid var(--color-border-secondary,rgba(0,0,0,0.06));
    border-radius:12px;
    box-shadow:0 8px 28px rgba(10,13,18,0.12),0 2px 6px rgba(10,13,18,0.04);
    padding:6px 0;
    display:flex;flex-direction:column;gap:2px;
    transform-origin:top left;
    opacity:0;transform:scale(0.97) translateY(-2px);
    pointer-events:none;
    transition:opacity 160ms ease, transform 200ms cubic-bezier(0.16,1,0.3,1);
    font-family:var(--font-family-body,'Geist',sans-serif);
  }
  .ps-menu[data-open="true"]{
    opacity:1;transform:scale(1) translateY(0);
    pointer-events:auto;
  }
  .ps-item{
    display:flex;align-items:center;gap:8px;
    margin:0 6px;
    padding:8px;
    border-radius:6px;
    background:transparent;
    border:none;
    font:inherit;
    font-size:14px;font-weight:500;
    color:var(--color-text-secondary-700,rgba(10,13,18,0.7));
    text-align:left;
    white-space:nowrap;
    cursor:pointer;
    transition:background 120ms ease;
    letter-spacing:-0.5px;
  }
  .ps-item:hover{background:var(--color-bg-primary-hover,#fafafa)}
  .ps-item-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
  .ps-check{
    width:20px;height:20px;flex-shrink:0;margin-left:8px;
    display:inline-flex;align-items:center;justify-content:center;
    color:var(--color-fg-secondary-700,#414651);
    visibility:hidden;
  }
  .ps-check svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.67;stroke-linecap:round;stroke-linejoin:round}
  .ps-item[aria-selected="true"] .ps-check{visibility:visible}
  .ps-divider{height:1px;background:var(--color-border-secondary,rgba(0,0,0,0.06));margin:6px}
  .ps-add-icon{
    width:24px;height:24px;flex-shrink:0;
    display:inline-flex;align-items:center;justify-content:center;
    color:var(--color-fg-secondary-700,#414651);
  }
  .ps-add-icon svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.67;stroke-linecap:round;stroke-linejoin:round}
  </style>`;

  /* ─── Default portfolio data ──────────────────────────────────────────── */
  const ALL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;

  const DEFAULT_PORTFOLIOS = [
    { id: 'all',       name: 'All accounts',  icon: ALL_ICON,        href: 'home/homepage.html' },
    { id: 'cash',      name: 'Surmount Cash', avatar: 'surmount.png', href: 'cash/cash.html' },
    { id: 'robinhood', name: 'Robinhood',     avatar: 'robinhood.png' },
    { id: 'ibkr',      name: 'IBKR',          avatar: 'ibkr.png'      },
    { id: 'schwab',    name: 'Schwab',        avatar: 'schwab.png'    },
  ];

  const CHEV  = `<svg viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>`;
  const CHECK = `<svg viewBox="0 0 16 16"><polyline points="3.5,8.5 6.5,11.5 12.5,5.5"/></svg>`;
  const PLUS  = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><path d="M6.5 10h7M10 6.5v7"/></svg>`;

  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  class PortfolioSwitcher extends HTMLElement {
    connectedCallback() {
      // Inject styles once
      if (!document.getElementById('portfolio-switcher-styles')) {
        document.head.insertAdjacentHTML('beforeend', CSS);
      }

      const assetsBase = this.getAttribute('assets-base') || '../assets/brokers';
      const pagesBase = this.getAttribute('pages-base') || '..';
      this._portfolios = DEFAULT_PORTFOLIOS.map(p => ({
        ...p,
        // Resolve avatar path only when an image filename was given
        avatar: p.avatar ? `${assetsBase}/${p.avatar}` : null,
        href: p.href ? `${pagesBase}/${p.href}` : null,
      }));
      this._selectedId = this.getAttribute('selected') || 'all';
      this._isOpen = false;

      // Root container inside the custom element
      this._root = document.createElement('div');
      this._root.className = 'ps-root';
      this.appendChild(this._root);

      // Menu — appended to <body> so it escapes ancestor overflow:hidden / scroll containers
      this._menu = document.createElement('div');
      this._menu.className = 'ps-menu';
      this._menu.setAttribute('role', 'listbox');
      this._menu.setAttribute('aria-label', 'Portfolios');
      this._menu.dataset.open = 'false';
      document.body.appendChild(this._menu);

      this._renderTrigger();
      this._renderMenu();
      this._wire();
    }

    disconnectedCallback() {
      if (this._menu && this._menu.parentNode) this._menu.parentNode.removeChild(this._menu);
      window.removeEventListener('resize', this._reposition);
      document.removeEventListener('scroll', this._reposition, true);
      document.removeEventListener('mousedown', this._onDocMouseDown);
      document.removeEventListener('keydown', this._onKey);
    }

    _selected() {
      return this._portfolios.find(p => p.id === this._selectedId) || this._portfolios[0];
    }

    _renderAvatar(p) {
      if (p.icon) {
        return `<span class="ps-avatar ps-avatar-icon" aria-hidden="true">${p.icon}</span>`;
      }
      return `<span class="ps-avatar"><img src="${esc(p.avatar)}" alt=""></span>`;
    }

    _renderTrigger() {
      const sel = this._selected();
      this._root.innerHTML = `
        <button class="ps-trigger" type="button"
                aria-haspopup="listbox"
                aria-expanded="${this._isOpen}"
                data-action="toggle">
          ${this._renderAvatar(sel)}
          <span>${esc(sel.name)}</span>
          <span class="ps-chevron" aria-hidden="true">${CHEV}</span>
        </button>`;
    }

    _renderMenu() {
      const sel = this._selected();
      this._menu.innerHTML = `
        ${this._portfolios.map(p => `
          <button class="ps-item" type="button" role="option"
                  aria-selected="${p.id === sel.id}"
                  data-action="select" data-id="${esc(p.id)}">
            ${this._renderAvatar(p)}
            <span class="ps-item-name">${esc(p.name)}</span>
            <span class="ps-check" aria-hidden="true">${CHECK}</span>
          </button>`).join('')}
        <div class="ps-divider" role="separator"></div>
        <button class="ps-item" type="button" data-action="add">
          <span class="ps-add-icon" aria-hidden="true">${PLUS}</span>
          <span class="ps-item-name">Add accounts</span>
        </button>`;
    }

    _positionMenu() {
      const trig = this._root.querySelector('.ps-trigger');
      if (!trig) return;
      const r = trig.getBoundingClientRect();
      this._menu.style.top  = `${r.bottom + 4}px`;
      this._menu.style.left = `${r.left}px`;
    }

    _setOpen(open) {
      this._isOpen = open;
      this._menu.dataset.open = String(open);
      const trig = this._root.querySelector('.ps-trigger');
      if (trig) trig.setAttribute('aria-expanded', String(open));
      if (open) this._positionMenu();
    }

    _wire() {
      const self = this;

      this._root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-action="toggle"]');
        if (!t) return;
        self._setOpen(!self._isOpen);
      });

      this._menu.addEventListener('click', (e) => {
        const t = e.target.closest('[data-action]');
        if (!t) return;
        const action = t.dataset.action;
        if (action === 'select') {
          const id = t.dataset.id;
          const next = self._portfolios.find(p => p.id === id);
          self._setOpen(false);
          // Navigate to the portfolio's page if it has one and we're not already there
          if (next && next.href) {
            const here = window.location.pathname;
            // Compare last path segment for resilience to relative resolution
            if (!here.endsWith(next.href.replace(/^\.\.\//, '/').replace(/^\.\//, '/'))) {
              window.location.href = next.href;
              return;
            }
          }
          self._selectedId = id;
          self._renderTrigger();
          self._renderMenu();
          self.dispatchEvent(new CustomEvent('ps-change', { detail: { id }, bubbles: true }));
        } else if (action === 'add') {
          self._setOpen(false);
          self.dispatchEvent(new CustomEvent('ps-add', { bubbles: true }));
        }
      });

      this._reposition = () => { if (self._isOpen) self._positionMenu(); };
      window.addEventListener('resize', this._reposition);
      document.addEventListener('scroll', this._reposition, true);

      this._onDocMouseDown = (e) => {
        if (!self._isOpen) return;
        if (self.contains(e.target) || self._menu.contains(e.target)) return;
        self._setOpen(false);
      };
      document.addEventListener('mousedown', this._onDocMouseDown);

      this._onKey = (e) => {
        if (e.key === 'Escape' && self._isOpen) {
          self._setOpen(false);
          const trig = self._root.querySelector('.ps-trigger');
          if (trig) trig.focus();
        }
      };
      document.addEventListener('keydown', this._onKey);
    }
  }

  customElements.define('portfolio-switcher', PortfolioSwitcher);
})();
