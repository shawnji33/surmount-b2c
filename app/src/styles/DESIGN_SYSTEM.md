# Surmount design-system contract

## One authority, three layers

`tokens.css` is the canonical Surmount token layer. It is generated from the
team's Untitled UI-based Figma token export and must not be edited by hand.

`product-roles.css` composes those primitives into recurring Surmount product
patterns: typography hierarchy, guided-flow geometry, quiet card surfaces, and
interaction feedback. It may combine canonical variables, but it must not
redefine a primitive or introduce a second visual scale.

`shadcn-bridge.css` is the only translation layer. It maps those canonical
tokens to shadcn's semantic roles (`--primary`, `--card`, `--border`,
`--ring`, and so on). It must never introduce literal visual values.

In `globals.css`, import `product-roles.css` before `tailwindcss`; Tailwind v4's
development import expansion can omit a custom-property-only file when it is
placed after the framework import.

## Building product UI

1. Start with an existing component in `src/components/ui`.
2. Use shadcn semantic utilities for component styling, product roles for
   recurring Surmount patterns, and canonical tokens for one-off CSS-module
   composition.
3. Use `className` for composition and layout, not one-off component colors,
   type, shadows, or radii.
4. If a Figma design needs a primitive that does not exist, add it to Figma and
   regenerate `tokens.css`. If the primitive exists but the product pattern is
   recurring, compose it in `product-roles.css` instead.

## Typography contract

The Figma typography library is represented exactly in `tokens.css` and is
verified by `npm run ds:type`.

| Role | Size / line height |
| --- | --- |
| Text xxs → xl | 10/13, 12/18, 14/20, 16/24, 18/28, 20/30 |
| Display xxxs → 2xl | 18/24, 20/26, 24/32, 30/38, 36/44, 48/60, 60/72, 72/90 |

Use 12px only for captions, 14px for dense supporting UI, and 16px for body
copy and form values. Default body tracking is neutral; negative tracking is
reserved for display styles. Use the loaded Regular, Medium, Semibold, and
Bold weights rather than requesting a browser-synthesized weight.

## Guided onboarding and checklist pattern

The Get started flow is the reference implementation for trust-sensitive,
multi-step product guidance:

- Keep the content frame narrow: a 650px composed maximum with a 40px step rail,
  20px rail-to-card gap, and 20px vertical rhythm between sections.
- Use a restrained hierarchy: page title 24/32 medium, section title 16/24
  medium, card title 14/20 medium, and supporting text 12/18 regular.
- Build quiet white cards with the secondary border, 12px outer radius, and a
  low-contrast layered shadow. Nested controls use a 10px radius.
- Reserve the soft brand surface for the recommended path; status must also be
  conveyed with text and an icon or dot, never color alone.
- Show locked work with muted semantic foregrounds and no elevation. Do not
  reduce the opacity of actionable text or controls.
- Use 150ms ease-out feedback for hover and press, a 0.96 press scale, hover
  effects only on hover-capable pointers, and a complete reduced-motion path.

## Namespace rule

`primary`, `secondary`, `background`, `card`, `muted`, `accent`, `border`,
and `ring` are reserved for shadcn semantics. Older Untitled-derived utility
aliases use the `uui-*` namespace (for example `bg-uui-primary`).

## Warning color contract

Warning uses the Figma amber-to-brown ramp from `50` (`#FCF8EA`) through `950`
(`#3D1B0C`). Semantic warning surfaces, foregrounds, and utility values map to
that same ramp in both themes. Run `npm run ds:warning` after a token refresh.

## Figma handoff rule

Use Figma MCP output for structure, hierarchy, content, and component intent.
Translate visual values through the token and bridge layers; do not paste
literal hex colors, arbitrary radii, or screen-specific shadows into product
code.
