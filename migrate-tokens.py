#!/usr/bin/env python3
"""
Surmount B2C — Token Migration Script
Brings every HTML prototype into the canonical design-system token set.

Changes applied to every file:
  1. Replace :root block with canonical tokens + legacy aliases
  2. font-weight:600 / font-weight:700  →  font-weight:500
  3. letter-spacing:-0.5px on body where missing
  4. prefers-reduced-motion block where missing
  5. #16A34A  →  #316434  (wrong success dot colour)
  6. letter-spacing:0.64px / 0.72px / 0.8px  →  letter-spacing:0  (positive LS ban)
  7. Sidebar.js: add --color-gray-* aliases so var() refs keep resolving
"""

import re, os, sys

# ── Canonical :root ────────────────────────────────────────────────────────────
CANONICAL_ROOT = """:root{
  /* ═══ CANONICAL TOKENS — Surmount Design System (github.com/shawnji33/design-system-surmount) ═══ */

  /* Primitive grays */
  --color-gray-lm-25:#fcfcfc;  --color-gray-lm-50:#fafafa;
  --color-gray-lm-100:#f5f5f5; --color-gray-lm-200:#e9e9eb;
  --color-gray-lm-300:#d5d6d9; --color-gray-lm-400:#a3a7ae;
  --color-gray-lm-500:#717680; --color-gray-lm-600:#535861;
  --color-gray-lm-700:#414651; --color-gray-lm-800:#252b37;
  --color-gray-lm-900:#181d27;

  /* Brand */
  --color-brand-25:#f7faff;  --color-brand-50:#f1f6fd;
  --color-brand-100:#e0eaf9; --color-brand-200:#c8dbf5;
  --color-brand-300:#8eb8eb; --color-brand-400:#75a5e5;
  --color-brand-500:#5585dc; --color-brand-600:#406ad0;
  --color-brand-700:#3757be; --color-brand-800:#32499b;
  --color-brand-900:#2d3f7b;

  /* Success */
  --color-success-50:#eef7ee;  --color-success-100:#e4f4e5;
  --color-success-200:#cbe7cc; --color-success-300:#a2d3a5;
  --color-success-400:#71b775; --color-success-500:#4d9a51;
  --color-success-600:#3b7e3f; --color-success-700:#316434;

  /* Error */
  --color-error-50:#fbf5f5;  --color-error-100:#f9eceb;
  --color-error-200:#f3d7d5; --color-error-300:#eabbb7;
  --color-error-400:#db948e; --color-error-500:#cb6f68;
  --color-error-600:#b6544c; --color-error-700:#98443d;

  /* Warning */
  --color-warning-50:#fef7ee;  --color-warning-100:#fdedd7;
  --color-warning-200:#f9d7af; --color-warning-300:#f5ba7c;
  --color-warning-400:#f19246; --color-warning-500:#ed7828;
  --color-warning-600:#de5b18; --color-warning-700:#b84416;

  /* Backgrounds */
  --color-bg-primary:#ffffff;
  --color-bg-secondary:#fafafa;
  --color-bg-tertiary:#f5f5f5;
  --color-bg-primary-hover:#fafafa;
  --color-bg-secondary-hover:#f5f5f5;
  --color-bg-disabled:#f5f5f5;
  --color-bg-brand-primary:#f1f6fd;
  --color-bg-brand-secondary:#e0eaf9;
  --color-bg-brand-solid:#406ad0;
  --color-bg-brand-solid-hover:#3757be;
  --color-bg-error-primary:#fbf5f5;
  --color-bg-success-primary:#eef7ee;
  --color-bg-success-secondary:#e4f4e5;
  --color-bg-warning-primary:#fef7ee;

  /* Foreground / text */
  --color-fg-primary-900:#181d27;
  --color-fg-secondary-700:#414651;
  --color-fg-tertiary-600:#535861;
  --color-fg-quaternary-400:#a3a7ae;
  --color-fg-disabled:#a3a7ae;
  --color-fg-white:#ffffff;
  --color-fg-brand-primary-600:#406ad0;
  --color-fg-brand-secondary-500:#5585dc;
  --color-fg-success-primary:#3b7e3f;
  --color-fg-error-primary:#b6544c;
  --color-fg-warning-primary:#de5b18;

  /* Semantic text (alpha-based — use fg-* for solid colours in prototypes) */
  --color-text-primary-900:#0a0d12e5;
  --color-text-secondary-700:#0a0d12b2;
  --color-text-tertiary-600:#0a0d1299;
  --color-text-brand-secondary-700:#3757be;
  --color-text-brand-tertiary-600:#406ad0;
  --color-text-disabled:#0a0d1266;
  --color-text-placeholder:#0a0d1266;

  /* Borders */
  --color-border-primary:#00000016;
  --color-border-secondary:#00000010;
  --color-border-brand:#5585dc;
  --color-border-error:#cb6f68;
  --color-border-error-subtle:#eabbb7;
  --color-border-disabled-subtle:#e9e9eb;
  --color-border-tertiary:#0000000a;

  /* Utility semantic */
  --color-utility-brand-50:#f1f6fd;  --color-utility-brand-100:#e0eaf9;
  --color-utility-brand-200:#c8dbf5; --color-utility-brand-600:#406ad0;
  --color-utility-brand-700:#3757be;
  --color-utility-success-50:#eef7ee; --color-utility-success-200:#cbe7cc;
  --color-utility-success-600:#3b7e3f; --color-utility-success-700:#316434;
  --color-utility-error-50:#fbf5f5;  --color-utility-error-200:#f3d7d5;
  --color-utility-error-600:#b6544c; --color-utility-error-700:#98443d;
  --color-utility-warning-50:#fef7ee; --color-utility-warning-200:#f9d7af;
  --color-utility-warning-600:#de5b18; --color-utility-warning-700:#b84416;
  --color-utility-gray-50:#fafafa;   --color-utility-gray-100:#f5f5f5;
  --color-utility-gray-200:#e9e9eb;  --color-utility-gray-400:#a3a7ae;
  --color-utility-gray-500:#717680;  --color-utility-gray-600:#535861;
  --color-utility-gray-700:#414651;

  /* Misc */
  --color-alpha-black-10:#0a0d1219; --color-alpha-black-20:#0a0d1233;
  --color-alpha-black-40:#0a0d1266; --color-alpha-black-60:#0a0d1299;
  --color-alpha-black-80:#0a0d12cc; --color-alpha-black-90:#0a0d12e5;
  --color-alpha-white-10:#ffffff19; --color-alpha-white-20:#ffffff33;
  --color-alpha-white-40:#ffffff66; --color-alpha-white-60:#ffffff99;
  --color-alpha-white-80:#ffffffcc; --color-alpha-white-90:#ffffffe5;
  --color-alpha-white-12:#ffffff1f;
  --focus-ring:#5585dc;

  /* Typography */
  --font-family-display:'Inter',sans-serif;
  --font-family-body:'Geist',system-ui,sans-serif;
  --font-family-serif:'Source Serif 4','Georgia',serif;

  /* Font sizes */
  --font-size-text-xs:12px; --font-size-text-sm:14px;
  --font-size-text-md:16px; --font-size-text-lg:18px;
  --font-size-text-xl:20px; --font-size-display-xs:24px;
  --font-size-display-sm:30px; --font-size-display-md:36px;

  /* Line heights */
  --line-height-text-xs:18px; --line-height-text-sm:20px;
  --line-height-text-md:24px; --line-height-text-lg:28px;
  --line-height-text-xl:30px; --line-height-display-xs:32px;

  /* Spacing */
  --spacing-xxs:2px; --spacing-xs:4px;  --spacing-sm:6px;
  --spacing-md:8px;  --spacing-lg:12px; --spacing-xl:16px;
  --spacing-2xl:20px; --spacing-3xl:24px; --spacing-4xl:32px;
  --spacing-5xl:40px; --spacing-6xl:48px; --spacing-7xl:64px;
  --spacing-2-5:10px; --spacing-3-5:14px;

  /* Border radius */
  --radius-xs:4px; --radius-sm:6px; --radius-md:8px;
  --radius-lg:10px; --radius-xl:12px; --radius-2xl:16px;
  --radius-3xl:20px; --radius-4xl:24px; --radius-full:9999px;

  /* Shadows (colour tokens only — construct full values locally) */
  --shadow-xs-color:rgba(10,13,18,0.05);
  --shadow-card-color:rgba(10,13,18,0.03);
  /* Full shadow shorthand helpers */
  --shadow-xs:0px 1px 2px rgba(10,13,18,0.05);
  --shadow-card:0px 2px 12px rgba(10,13,18,0.03);
  --shadow-sm:0 1px 3px rgba(10,13,18,0.06),0 1px 2px rgba(10,13,18,0.04);
  --shadow-overlay:0 8px 40px rgba(10,13,18,0.18),0 0 0 1px rgba(10,13,18,0.06);

  /* ═══ LEGACY ALIASES — backward compat. Do not use in new CSS ═══ */
  /* Gray scale (old naming) */
  --color-white:#ffffff;
  --color-base-white:#ffffff;
  --color-gray-50:var(--color-gray-lm-50);
  --color-gray-100:var(--color-gray-lm-100);
  --color-gray-200:var(--color-gray-lm-200);
  --color-gray-300:var(--color-gray-lm-300);
  --color-gray-400:var(--color-gray-lm-400);
  --color-gray-500:var(--color-gray-lm-500);
  --color-gray-600:var(--color-gray-lm-600);
  --color-gray-700:var(--color-gray-lm-700);
  --color-gray-900:var(--color-gray-lm-900);
  /* Surface → Background */
  --color-surface:var(--color-bg-primary);
  --color-surface-default:var(--color-bg-primary);
  --color-surface-subtle:var(--color-bg-secondary);
  /* Text → Foreground */
  --color-text-primary:var(--color-fg-primary-900);
  --color-text-secondary:var(--color-fg-secondary-700);
  --color-text-tertiary:var(--color-gray-lm-500);
  --color-text-success:var(--color-utility-success-700);
  --color-text-error:var(--color-utility-error-700);
  --color-success-text:var(--color-utility-success-700);
  --color-error-text:var(--color-utility-error-700);
  --color-success-dot:var(--color-utility-success-700);
  --color-success-bg:var(--color-utility-success-50);
  /* Border */
  --color-border-default:var(--color-border-secondary);
  --color-border-container:var(--color-border-primary);
  --color-border-strong:rgba(0,0,0,0.14);
  /* Font (shorthand aliases) */
  --font-display:var(--font-family-display);
  --font-body:var(--font-family-body);
  /* Font sizes (old --text-*) */
  --text-xs:var(--font-size-text-xs);
  --text-sm:var(--font-size-text-sm);
  --text-md:var(--font-size-text-md);
  --text-lg:var(--font-size-text-lg);
  --text-xl:var(--font-size-text-xl);
  --text-2xl:var(--font-size-display-xs);
  /* Font weights — semibold/bold capped at 500 */
  --font-weight-regular:400;
  --font-weight-medium:500;
  --font-weight-semibold:500;
  --font-weight-bold:500;
  /* Spacing (old --space-*) */
  --space-1:var(--spacing-xs);   --space-1-5:var(--spacing-sm);
  --space-2:var(--spacing-md);   --space-2-5:var(--spacing-2-5);
  --space-3:var(--spacing-lg);   --space-4:var(--spacing-xl);
  --space-5:var(--spacing-2xl);  --space-6:var(--spacing-3xl);
  --space-7:28px;                --space-8:var(--spacing-4xl);
  --space-10:var(--spacing-5xl);
  /* invest.html bespoke aliases */
  --b600:var(--color-brand-600);
  --b700:var(--color-bg-brand-solid-hover);
  --text-primary:var(--color-fg-primary-900);
  --text-secondary:var(--color-fg-secondary-700);
  --text-tertiary:var(--color-gray-lm-500);
  --text-disabled:rgba(10,13,18,0.4);
  --border-default:var(--color-border-secondary);
  --surface-bg:var(--color-bg-secondary);
  --surface-secondary:var(--color-bg-tertiary);
  /* chart / data vis */
  --chart-line:#3b7e3f;
  --chart-grad-top:rgba(162,211,165,0.9);
  --chart-grad-bot:rgba(162,211,165,0);
  --chart-baseline:rgba(65,70,81,0.32);
  --shadow-subtle:var(--shadow-card);
}"""

# ── Additional per-file fixes ─────────────────────────────────────────────────

BODY_LETTER_SPACING = "letter-spacing:-0.5px;"

REDUCED_MOTION = """
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition-duration:0.01ms !important;animation-duration:0.01ms !important}
}"""

# ── Helpers ───────────────────────────────────────────────────────────────────

root_re = re.compile(r':root\s*\{[^}]*\}', re.DOTALL)

def replace_root(html: str) -> str:
    """Replace the first :root{} block with the canonical one."""
    if ':root' not in html:
        return html
    return root_re.sub(CANONICAL_ROOT, html, count=1)

def fix_font_weights(html: str) -> str:
    """Downgrade hardcoded font-weight 600/700 → 500 inside <style> blocks."""
    def fix_style(m):
        s = m.group(0)
        s = re.sub(r'font-weight\s*:\s*(600|700|bold|semibold)', 'font-weight:500', s)
        return s
    return re.sub(r'<style[^>]*>.*?</style>', fix_style, html, flags=re.DOTALL | re.IGNORECASE)

def fix_body_letter_spacing(html: str) -> str:
    """Ensure body{} has letter-spacing:-0.5px."""
    if 'letter-spacing:-0.5px' in html or "letter-spacing: -0.5px" in html:
        return html
    def add_ls(m):
        s = m.group(0)
        # inject into first body{ block inside <style>
        s = re.sub(r'(body\s*\{)', r'\1' + BODY_LETTER_SPACING, s, count=1)
        return s
    return re.sub(r'<style[^>]*>.*?</style>', add_ls, html, flags=re.DOTALL | re.IGNORECASE)

def fix_reduced_motion(html: str) -> str:
    """Add prefers-reduced-motion block if not present."""
    if 'prefers-reduced-motion' in html:
        return html
    # Insert before </style>
    return re.sub(r'(</style>)', REDUCED_MOTION + r'\n\1', html, count=1, flags=re.IGNORECASE)

def fix_bad_colors(html: str) -> str:
    """Replace wrong success dot colour and other bad hardcoded values."""
    # Wrong success green → canonical
    html = html.replace('#16A34A', '#316434').replace('#16a34a', '#316434')
    return html

def fix_positive_letter_spacing(html: str) -> str:
    """Remove positive letter-spacing on category labels (marketplace)."""
    # Targets patterns like letter-spacing:0.64px / 0.72px / 0.8px inside style blocks
    def fix_style(m):
        s = m.group(0)
        s = re.sub(r'letter-spacing\s*:\s*0\.[0-9]+px', 'letter-spacing:0', s)
        return s
    return re.sub(r'<style[^>]*>.*?</style>', fix_style, html, flags=re.DOTALL | re.IGNORECASE)

def process_file(path: str) -> None:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html
    html = replace_root(html)
    html = fix_font_weights(html)
    html = fix_body_letter_spacing(html)
    html = fix_reduced_motion(html)
    html = fix_bad_colors(html)
    html = fix_positive_letter_spacing(html)

    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  ✓  {os.path.relpath(path)}")
    else:
        print(f"  –  {os.path.relpath(path)}  (no changes)")

# ── Main ──────────────────────────────────────────────────────────────────────

DESIGNS = "/Users/shawnji/Surmount/B2C/designs"

# All HTML files except node_modules / rn-app
targets = []
for root, dirs, files in os.walk(DESIGNS):
    dirs[:] = [d for d in dirs if d not in ('node_modules', 'rn-app', 'rn')]
    for f in files:
        if f.endswith('.html'):
            targets.append(os.path.join(root, f))

targets.sort()
print(f"Processing {len(targets)} files...\n")
for t in targets:
    process_file(t)

print("\nDone.")
