/**
 * Surmount App Sidebar — shared component
 * Usage: <script src="sidebar.js"></script>
 *        <app-sidebar active="create"></app-sidebar>  (active: "home" | "marketplace" | "builder" | "create")
 */

const SIDEBAR_CSS = `
<style id="sidebar-styles">
app-sidebar{align-self:stretch;display:flex;flex-shrink:0;}
.app-sidebar{width:100px;flex:1;background:transparent;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:32px 28px 24px;z-index:300;position:relative;}
.app-sidebar-top{display:flex;flex-direction:column;align-items:center;gap:32px;}
.app-sidebar-logo{flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .12s;}
.app-sidebar-logo:hover{opacity:.85;}
.app-sidebar-logo svg{width:38px;height:38px;}
.app-sidebar-nav{display:flex;flex-direction:column;align-items:center;gap:16px;}
.sidebar-nav-item{position:relative;display:flex;align-items:center;}
.sidebar-nav-btn{width:32px;height:32px;border-radius:8px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--color-gray-500,#717680);transition:background .12s,color .12s;}
.sidebar-nav-btn svg{width:18px;height:18px;fill:none;flex-shrink:0;stroke:currentColor;}
.sidebar-nav-btn:hover{background:var(--color-gray-200,#E9EAEB);color:var(--color-gray-900,#181D27);}
.sidebar-nav-btn.active{background:var(--color-gray-200,#E9EAEB);color:var(--color-gray-900,#181D27);}
.sidebar-tooltip{position:absolute;left:calc(100% + 8px);top:50%;transform:translateY(-50%) translateX(-6px);background:var(--color-gray-900,#181D27);color:#fff;font-size:11px;font-weight:500;font-family:var(--font-family-body,'Geist',sans-serif);padding:5px 8px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;z-index:400;box-shadow:0 2px 8px rgba(10,13,18,0.18);}
.sidebar-tooltip::before{content:'';position:absolute;right:100%;top:50%;transform:translateY(-50%);border:5px solid transparent;border-right-color:var(--color-gray-900,#181D27);}
.sidebar-nav-item:hover .sidebar-tooltip{opacity:1;transform:translateY(-50%) translateX(0);}
.sidebar-avatar{width:32px;height:32px;border-radius:50%;background:#f1f1f1;border:0.75px solid rgba(0,0,0,0.08);box-shadow:0 2px 12px 0 rgba(10,13,18,0.03);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;flex-shrink:0;transition:box-shadow .12s;}
.sidebar-avatar:hover{box-shadow:0 0 0 3px rgba(123,120,214,0.2);}
.sidebar-avatar-inner{width:18px;height:18px;border-radius:50%;background:#7b78d6;border:0.5px solid rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;font-family:var(--font-family-body,'Geist',sans-serif);letter-spacing:0.2px;}
</style>`;

const SIDEBAR_LOGO = `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#sb_f0)"><path d="M3 14.8C3 10.3196 3 8.07937 3.87195 6.36808C4.63893 4.86278 5.86278 3.63893 7.36808 2.87195C9.07937 2 11.3196 2 15.8 2H22.2C26.6804 2 28.9206 2 30.6319 2.87195C32.1372 3.63893 33.3611 4.86278 34.1281 6.36808C35 8.07937 35 10.3196 35 14.8V21.2C35 25.6804 35 27.9206 34.1281 29.6319C33.3611 31.1372 32.1372 32.3611 30.6319 33.1281C28.9206 34 26.6804 34 22.2 34H15.8C11.3196 34 9.07937 34 7.36808 33.1281C5.86278 32.3611 4.63893 31.1372 3.87195 29.6319C3 27.9206 3 25.6804 3 21.2V14.8Z" fill="url(#sb_p0)"/><path d="M18.9982 13.1366C18.7314 13.3201 18.4774 13.5264 18.2363 13.7556L17.0473 14.888C16.5042 14.6108 15.9021 14.473 15.3023 14.473C14.3537 14.473 13.4058 14.8171 12.6831 15.5054C11.9844 16.1725 11.5993 17.0568 11.5993 17.9994H9C9 16.3954 9.65481 14.888 10.8462 13.7556C13.064 11.6435 16.537 11.4371 19.0006 13.1366H18.9982Z" fill="url(#sb_p1)"/><path d="M23.3671 18.8083L20.9498 21.1103L19.7607 22.2421C19.5196 22.4719 19.2657 22.6782 18.9982 22.8617C17.9016 23.6185 16.6008 23.9981 15.3023 23.9981C13.6884 23.9981 12.0745 23.4122 10.8462 22.2421C9.65481 21.108 9 19.6006 9 17.9972H11.5993C11.5993 18.9392 11.9844 19.8258 12.6831 20.4906C13.916 21.6647 15.8102 21.8357 17.238 21.0039C17.4809 20.8622 17.7109 20.6913 17.9233 20.4906L19.2306 19.2462L21.5279 17.0586H21.5297C22.0376 16.5727 22.8615 16.5727 23.3671 17.0569C23.8751 17.5405 23.8751 18.3242 23.3671 18.8061V18.8083Z" fill="url(#sb_p2)"/><path d="M28.9994 17.999H26.4001C26.4001 17.0564 26.015 16.1726 25.3164 15.505C24.5937 14.8173 23.6457 14.4732 22.6971 14.4732C22.0248 14.4732 21.353 14.6464 20.7614 14.9922C20.5185 15.134 20.2886 15.3049 20.0785 15.505L18.7689 16.7523L16.4697 18.9416C16.2158 19.1834 15.8828 19.3046 15.5498 19.3046C15.2169 19.3046 14.8839 19.1834 14.63 18.9416C14.122 18.458 14.122 17.6737 14.63 17.1918L17.0479 14.8899L18.237 13.7581C18.4775 13.5283 18.7314 13.322 18.9988 13.1385C21.4624 11.439 24.9331 11.6454 27.1515 13.7581C28.3423 14.8922 28.9971 16.3996 28.9971 18.0013L28.9994 17.999Z" fill="url(#sb_p3)"/><path d="M29 17.9991C29 19.6025 28.3452 21.1099 27.1538 22.2445C25.9255 23.4141 24.3116 24 22.6977 24C21.3992 24 20.0984 23.6204 19.0012 22.8636C19.2686 22.6801 19.5226 22.4738 19.7631 22.2445L20.9521 21.1122C21.4952 21.3894 22.0956 21.5272 22.6977 21.5272C23.6457 21.5272 24.5937 21.183 25.3163 20.4948C26.015 19.8277 26.4007 18.944 26.4007 18.0014H29V17.9991Z" fill="url(#sb_p4)"/></g><defs><filter id="sb_f0" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="1"/><feGaussianBlur stdDeviation="1"/><feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.06 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="e1"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="1"/><feGaussianBlur stdDeviation="1.5"/><feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0509804 0 0 0 0 0.0705882 0 0 0 0.1 0"/><feBlend mode="normal" in2="e1" result="e2"/><feBlend mode="normal" in="SourceGraphic" in2="e2" result="shape"/></filter><linearGradient id="sb_p0" x1="3" y1="2" x2="35" y2="34" gradientUnits="userSpaceOnUse"><stop stop-color="#F5F7FA"/><stop offset="1" stop-color="#C3CFE2"/></linearGradient><linearGradient id="sb_p1" x1="9" y1="14.9848" x2="19.0001" y2="15.0677" gradientUnits="userSpaceOnUse"><stop stop-color="#34A6ED"/><stop offset="1" stop-color="#1047D2"/></linearGradient><linearGradient id="sb_p2" x1="9" y1="20.3279" x2="23.747" y2="20.476" gradientUnits="userSpaceOnUse"><stop stop-color="#34A6ED"/><stop offset="1" stop-color="#54E3DF"/></linearGradient><linearGradient id="sb_p3" x1="14.249" y1="15.6351" x2="28.9983" y2="15.7833" gradientUnits="userSpaceOnUse"><stop stop-color="#54E3DF"/><stop offset="1" stop-color="#34A6ED"/></linearGradient><linearGradient id="sb_p4" x1="19.0012" y1="20.9846" x2="28.9996" y2="21.0675" gradientUnits="userSpaceOnUse"><stop stop-color="#1047D2"/><stop offset="1" stop-color="#34A6ED"/></linearGradient></defs></svg>`;

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    href: '/homepage.html',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8.65487 1.84268C8.42065 1.66051 8.30354 1.56943 8.17423 1.53442C8.06013 1.50352 7.93987 1.50352 7.82577 1.53442C7.69646 1.56943 7.57935 1.66051 7.34513 1.84268L2.82359 5.35943C2.52135 5.59451 2.37022 5.71205 2.26135 5.85925C2.16491 5.98964 2.09307 6.13654 2.04935 6.29272C2 6.46903 2 6.66048 2 7.04338V11.8667C2 12.6134 2 12.9868 2.14532 13.272C2.27316 13.5229 2.47713 13.7268 2.72801 13.8547C3.01323 14 3.3866 14 4.13333 14H5.46667C5.65335 14 5.74669 14 5.818 13.9637C5.88072 13.9317 5.93171 13.8807 5.96367 13.818C6 13.7467 6 13.6534 6 13.4667V9.06667C6 8.6933 6 8.50662 6.07266 8.36401C6.13658 8.23857 6.23857 8.13658 6.36401 8.07267C6.50661 8 6.6933 8 7.06667 8H8.93333C9.3067 8 9.49339 8 9.63599 8.07267C9.76144 8.13658 9.86342 8.23857 9.92734 8.36401C10 8.50662 10 8.6933 10 9.06667V13.4667C10 13.6534 10 13.7467 10.0363 13.818C10.0683 13.8807 10.1193 13.9317 10.182 13.9637C10.2533 14 10.3466 14 10.5333 14H11.8667C12.6134 14 12.9868 14 13.272 13.8547C13.5229 13.7268 13.7268 13.5229 13.8547 13.272C14 12.9868 14 12.6134 14 11.8667V7.04338C14 6.66048 14 6.46903 13.9506 6.29272C13.9069 6.13654 13.8351 5.98964 13.7386 5.85925C13.6298 5.71205 13.4787 5.59451 13.1764 5.35943L8.65487 1.84268Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    href: null,
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 14V10.4C10 10.0266 10 9.83995 9.92734 9.69734C9.86342 9.5719 9.76144 9.46991 9.63599 9.406C9.49339 9.33333 9.3067 9.33333 8.93333 9.33333H7.06667C6.6933 9.33333 6.50661 9.33333 6.36401 9.406C6.23857 9.46991 6.13658 9.5719 6.07266 9.69734C6 9.83995 6 10.0266 6 10.4V14M2 4.66667C2 5.77124 2.89543 6.66667 4 6.66667C5.10457 6.66667 6 5.77124 6 4.66667C6 5.77124 6.89543 6.66667 8 6.66667C9.10457 6.66667 10 5.77124 10 4.66667C10 5.77124 10.8954 6.66667 12 6.66667C13.1046 6.66667 14 5.77124 14 4.66667M4.13333 14H11.8667C12.6134 14 12.9868 14 13.272 13.8547C13.5229 13.7268 13.7268 13.5229 13.8547 13.272C14 12.9868 14 12.6134 14 11.8667V4.13333C14 3.3866 14 3.01323 13.8547 2.72801C13.7268 2.47713 13.5229 2.27316 13.272 2.14532C12.9868 2 12.6134 2 11.8667 2H4.13333C3.3866 2 3.01323 2 2.72801 2.14532C2.47713 2.27316 2.27316 2.47713 2.14532 2.72801C2 3.01323 2 3.3866 2 4.13333V11.8667C2 12.6134 2 12.9868 2.14532 13.272C2.27316 13.5229 2.47713 13.7268 2.72801 13.8547C3.01323 14 3.3866 14 4.13333 14Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    key: 'builder',
    label: 'Strategy Builder',
    href: '/stratey-builder/create.html',
    icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#sb_nav_clip)"><path d="M8.66666 9.33333L6.66666 7.33333M10.0069 2.33333V1.33333M12.6331 3.37377L13.3402 2.66666M12.6331 8.66666L13.3402 9.37377M7.34023 3.37377L6.63313 2.66666M13.6736 5.99999H14.6736M4.08758 13.9124L10.2458 7.75424C10.5098 7.49023 10.6418 7.35822 10.6912 7.20601C10.7347 7.07211 10.7347 6.92788 10.6912 6.79398C10.6418 6.64176 10.5098 6.50976 10.2458 6.24575L9.75425 5.75424C9.49023 5.49023 9.35823 5.35823 9.20601 5.30877C9.07211 5.26526 8.92788 5.26526 8.79399 5.30877C8.64177 5.35823 8.50976 5.49023 8.24575 5.75424L2.08758 11.9124C1.82357 12.1764 1.69156 12.3084 1.6421 12.4606C1.5986 12.5945 1.5986 12.7388 1.6421 12.8727C1.69156 13.0249 1.82357 13.1569 2.08758 13.4209L2.57908 13.9124C2.8431 14.1764 2.9751 14.3084 3.12732 14.3579C3.26122 14.4014 3.40545 14.4014 3.53934 14.3579C3.69156 14.3084 3.82357 14.1764 4.08758 13.9124Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="sb_nav_clip"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>`
  }
];

function sidebarNavigate(href) {
  // If we're in the shell, update the iframe. Otherwise navigate normally.
  const frame = document.getElementById('main-frame');
  if (frame) {
    frame.src = href;
  } else {
    window.location.href = href;
  }
}

class AppSidebar extends HTMLElement {
  connectedCallback() {
    // If running inside an iframe, hide — the parent shell provides the sidebar.
    if (window.self !== window.top) {
      this.style.display = 'none';
      return;
    }

    // Inject styles once
    if (!document.getElementById('sidebar-styles')) {
      document.head.insertAdjacentHTML('beforeend', SIDEBAR_CSS);
    }

    const active = this.getAttribute('active') || '';

    const navItems = NAV_ITEMS.map(item => `
      <div class="sidebar-nav-item">
        <button class="sidebar-nav-btn${active === item.key ? ' active' : ''}" title="${item.label}"${item.href ? ` onclick="sidebarNavigate('${item.href}')"` : ''}>
          ${item.icon}
        </button>
        <div class="sidebar-tooltip">${item.label}</div>
      </div>`).join('');

    this.innerHTML = `
      <nav class="app-sidebar">
        <div class="app-sidebar-top">
          <div class="app-sidebar-logo">${SIDEBAR_LOGO}</div>
          <div class="app-sidebar-nav">${navItems}</div>
        </div>
        <div class="sidebar-avatar">
          <div class="sidebar-avatar-inner">L</div>
        </div>
      </nav>`;
  }
}

customElements.define('app-sidebar', AppSidebar);
