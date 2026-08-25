# Design QA — Promptfolio generated strategy dashboard

- Source visual truth: `/Users/shawnji/Library/Application Support/CleanShot/media/media_H8Yhpd6FX4/CleanShot 2026-08-25 at 08.46.09.png`
- Browser-rendered implementation: `/Users/shawnji/Surmount/B2C/app/.design-qa/promptfolio-dashboard.png`
- Combined comparison: `/Users/shawnji/Surmount/B2C/app/.design-qa/promptfolio-comparison.png`
- Route: `http://localhost:3010/home/builder/promptfolio?stage=building`
- Source pixels: 943 × 732 px
- Implementation crop: 1249 × 707 px from the 1781 × 1089 desktop preview
- State: completed local demo build, rules popover closed, generated strategy visible
- Density normalization: comparison scales each dashboard crop proportionally; the implementation keeps live dynamic data and the source keeps its static sample data

## Full-view comparison evidence

The implementation preserves the fixed Promptfolio workspace and conversation column while adopting the reference dashboard hierarchy on the right. The chart, key statistics, and holdings table now read as a single family of gray shells with inset white content surfaces.

## Focused comparison evidence

`.design-qa/promptfolio-comparison.png` places the supplied reference and the browser-rendered dashboard in one image. The final implementation matches the reference's panel grouping, surface contrast, header treatment, rounded inset bodies, table header placement, row separators, and compact density.

## Required fidelity surfaces

- Fonts and typography: existing Inter/product typography remains intact. Panel titles, metric labels, values, table headers, and row copy preserve the reference hierarchy without introducing a new type treatment.
- Spacing and layout: top cards retain the chart/statistics split, use a 10px outer shell inset, and align their white content panels. The table uses an outer gray header area and an 8px inset white row surface.
- Colors and tokens: gray shells are derived from existing surface tokens with `color-mix`; white content stays on `--color-bg-primary`; existing success, error, and chart colors remain semantic.
- Shape and surfaces: all three panels share the same border, radius, and subtle `0 2px 12px rgba(10, 13, 18, 0.03)` elevation. Nested radii are four pixels tighter than their parents.
- Image quality and asset fidelity: the source contains no required raster hero art. Existing ticker logos and the live chart remain the correct product assets.
- Copy and content: dynamic strategy values differ from the reference sample by design; the information order and visual density match.
- States and interactions: the rules trigger still opens the ETF/No-code rule editor; inline weight editing remains available; the loading skeleton now uses the same shell/inset geometry as the loaded dashboard.
- Accessibility and resilience: semantic headings and labels remain present, keyboard interactions are unchanged, reduced-motion handling is preserved, and the top cards stack below 1100px to avoid a compressed chart.

## Comparison history

### Pass 1

- P1: Chart, statistics, and table were flat white cards, so the reference's gray-shell/white-inset hierarchy was missing.
- P2: Holdings rows were too tall and the header looked like a separate filled strip rather than part of the shell.
- Fixes: introduced shared gray shell surfaces, inset white bodies, matched nested radii, moved table labels into the shell, and reduced row height and padding.

### Pass 2

- P2: The loaded state matched the reference but the loading skeleton still used the older flat-card geometry.
- Fixes: added matching chart/statistics skeleton bodies and an inset skeleton row surface so the reveal is layout-stable.

### Pass 3

- No actionable P0/P1/P2 fidelity issues remain.
- Runtime console errors: none.
- Rules popover behavior: verified visible and keyboard-dismissible.
- Narrow desktop check: no body-level horizontal overflow; top panels stack below 1100px and the table retains its internal horizontal scroll surface.

## Follow-up polish

- P3: The number of holdings is dynamic, so the table may be shorter than the six-row static reference when users remove assets.

final result: passed
