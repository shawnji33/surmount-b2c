<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Surmount motion pattern

When building microinteractions for Surmount UI, keep persistent containers mounted and animate only the content inside them. If a panel, card, modal, or sticky shell changes height, animate the measured container height with a restrained non-spring ease-in-out transition while inner copy/media uses a subtle opacity/vertical shift. Avoid remounting the whole container for state changes because it makes the card feel like it disappeared and reappeared. Respect `prefers-reduced-motion`.
