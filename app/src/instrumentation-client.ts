// Lapse (dev-only animation inspector) patches the global clock —
// requestAnimationFrame, performance.now, Date.now, setTimeout, setInterval.
// Libraries that cache those before the patch lands keep the real clock and
// never slow down; d3-timer (pulled in by @xyflow/react) binds
// requestAnimationFrame at module eval, so winning that race matters here.
//
// This file is the earliest client hook Next gives us: it runs after the
// document loads but *before* React hydration, so the patch is installed
// before any app or vendor module evaluates.
//
// The NODE_ENV check is statically replaced at build time, leaving the import
// as dead code in production — neither the clock patch nor the ~1.7 MB panel
// enters the production bundle. A static top-level import could not be
// excluded: the package marks dist/install.mjs in its `sideEffects` field,
// which pins it into any bundle that references it.
if (process.env.NODE_ENV !== 'production') {
  import('@aiforui/lapse/install').catch(() => {
    // Never let the inspector break app boot.
  });
}
