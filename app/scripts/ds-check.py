#!/usr/bin/env python3
"""
Design-system conformance checker for the Surmount B2C app.

    npm run ds:check     report violations (exit 1 if any)
    npm run ds:fix       apply the fixes

Enforces the numeric scales in ~/Surmount/CLAUDE.md § "Numeric scales" and
~/Surmount/design.md § 4. Two independent transforms, both non-destructive
to design intent:

  1. SCALE  — snap off-scale px values onto the design-system scales.
              spacing/layout -> nearest even, ties up ("always a multiple of 2")
              font-size      -> the DS type scale (10 12 14 16 18 20 24 30 ...)
              line-height    -> nearest even
              border-radius  -> the DS radius scale (2 4 6 8 10 12 16 20 24)
              Only ODD or DECIMAL values are treated as violations; see
              fix_value() for why even-but-off-scale is reported, not rewritten.
  2. COLOR  — replace a raw literal ONLY when a DS token resolves to the exact
              same value. Property-aware, so `background: #fff` picks a bg token
              (flips in dark mode) and `color: #fff` picks a fg token (stays
              white). Pixel-identical output today, correct if dark mode lands.

Scope: production *.module.css plus app/globals.css. Files under app/proto are
excluded because they are intentionally exploratory. tokens.css is never
touched — it is generated from Figma and IS the scale.
"""
import argparse
import collections
import math
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'src'
TOKENS = ROOT / 'styles' / 'tokens.css'

# ── scales ────────────────────────────────────────────────────────────────────
TYPE_SCALE = [10, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72]
RADIUS_SCALE = [2, 4, 6, 8, 10, 12, 16, 20, 24]

SPACING_PROPS = re.compile(
    r'^(padding|margin|gap|row-gap|column-gap|top|left|right|bottom|inset|'
    r'width|height|min-width|min-height|max-width|max-height|flex-basis|'
    r'(padding|margin|inset|scroll-margin|scroll-padding)-[\w-]+)$'
)
RADIUS_PROPS = re.compile(r'^border(-[\w-]+)?-radius$')

# px here encodes a look (blur, thickness, travel), not a layout step — leave alone.
SKIP_PROPS = {
    'box-shadow', 'text-shadow', 'filter', 'backdrop-filter', 'transform',
    'background', 'background-image', 'background-position', 'background-size',
    'mask-image', '-webkit-mask-image', 'mask', 'clip-path', 'outline-offset',
    'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'text-underline-offset',
    'letter-spacing', 'word-spacing', 'transition', 'animation', 'will-change',
    'border', 'border-width', 'border-top', 'border-right', 'border-bottom',
    'border-left', 'border-top-width', 'border-right-width', 'border-bottom-width',
    'border-left-width', 'outline', 'outline-width', 'flex', 'content',
    'grid-template-columns', 'grid-template-rows', 'grid-auto-rows',
    'grid-auto-columns', 'perspective', 'translate', 'rotate', 'scale',
}


def snap_scale(n, scale):
    """
    Nearest value on an explicit scale. Every odd int sits exactly between two
    scale steps, so the tie-break decides everything: text sizes round UP
    (13->14 = text-sm, 15->16 = text-md; shrinking body copy hurts legibility
    and 1px costs nothing), display sizes round DOWN (an oversized heading is
    far more likely to wrap or overflow its container than an undersized one is
    to look wrong).
    """
    up = n <= 20
    return min(scale, key=lambda s: (abs(s - n), -s if up else s))


def snap_even(n):
    if n < 0.5:
        return 0          # sub-half-pixel is Figma export noise, not a value
    if n < 2:
        return 1          # 0.5 / 1 / 1.5 are hairlines — collapse to a real 1px
    if float(n).is_integer():
        return int(n) if n % 2 == 0 else int(n) + 1   # odd ints: only one way to go
    return int(round(n / 2.0) * 2)                     # decimals: nearest even


def fix_value(prop, raw):
    """
    Only ODD or DECIMAL values are treated as violations.

    An even value that isn't on a named scale (font-size: 32px, radius: 22px)
    is left alone deliberately: the rule given was "times of 2" for spacing and
    "4 6 8 10 12 ... or the ones we already have" for type, and snapping even
    display sizes would silently resize ~28 headings across onboarding and home.
    Those are reported separately instead so they stay an opt-in decision.
    """
    n = float(raw)
    if n in (0, 999, 9999):
        return None
    is_violation = (not float(n).is_integer()) or (int(n) % 2 == 1)
    if not is_violation:
        return None
    if prop == 'font-size':
        out = snap_scale(n, TYPE_SCALE)
    elif prop == 'line-height':
        out = snap_even(n)
    elif RADIUS_PROPS.match(prop):
        out = snap_scale(n, RADIUS_SCALE) if n <= 26 else snap_even(n)
    elif SPACING_PROPS.match(prop):
        out = snap_even(n)
    else:
        return None
    return out if out != n else None


# ── color token table + ranking ───────────────────────────────────────────────
def norm_hex(h):
    h = h.lower().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) == 8 and h.endswith('ff'):
        h = h[:6]
    return '#' + h


def load_tokens():
    text = TOKENS.read_text()
    text = re.sub(r':root\[data-theme="dark"\]\s*\{.*?\n\}', '', text, flags=re.S)
    table = collections.defaultdict(list)
    for name, val in re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', text):
        val = val.strip()
        if re.fullmatch(r'#[0-9a-fA-F]{3,8}', val):
            table[norm_hex(val)].append(name)
    return table


TOKEN_TABLE = load_tokens()

# A token carrying one of these is a *state* of some other token — never the
# right name for a resting-state literal that merely happens to share its value.
STATE_RE = re.compile(r'-(hover|active|pressed|focus|focused|disabled|visited|alt|selected)(-|$)')
# Component-scoped tokens: correct value, wrong meaning outside that component.
COMPONENT_RE = re.compile(
    r'--color-(slider|toggle|button|footer|header|nav|breadcrumb|tooltip|badge|'
    r'avatar|thumbnail|social|app-store|wysiwyg|mockup|icon-featured|text-editor|'
    r'alpha|screen-mockup)'
)
# Raw ramps. CLAUDE.md wants semantic tokens, and gray-lm/gray-dm are mode-specific.
PRIMITIVE_RE = re.compile(
    r'^--color-(gray-lm|gray-dm|white|black|error|success|warning|brand|gray|'
    r'blue|indigo|purple|pink|orange|yellow|green|teal|cyan)-?\d*$'
)

FAMILY_PREFIX = {
    'bg':     ('--color-bg-', '--color-utility-', '--color-fg-', '--color-text-'),
    'fg':     ('--color-fg-', '--color-text-', '--color-utility-'),
    'border': ('--color-border-', '--color-utility-', '--color-fg-'),
}


def family_for(prop):
    if prop.startswith('border') or prop in ('outline', 'outline-color', 'column-rule-color'):
        return 'border'
    if prop in ('color', 'fill', 'stroke', 'caret-color', 'accent-color',
                '-webkit-text-fill-color', 'text-decoration-color'):
        return 'fg'
    if prop.startswith('background'):
        return 'bg'
    return None


def pick_token(prop, hexval):
    names = TOKEN_TABLE.get(hexval)
    fam = family_for(prop)
    if not names or not fam:
        return None
    best, best_score = None, None
    for n in names:
        if STATE_RE.search(n) or COMPONENT_RE.match(n) or PRIMITIVE_RE.match(n):
            continue
        try:
            rank = next(i for i, p in enumerate(FAMILY_PREFIX[fam]) if n.startswith(p))
        except StopIteration:
            continue
        # family rank first, then fewer segments (less specialized) wins
        score = (rank, n.count('-'), len(n))
        if best_score is None or score < best_score:
            best, best_score = n, score
    return best


# ── declaration-level rewriting ───────────────────────────────────────────────
COMMENT_RE = re.compile(r'/\*.*?\*/', re.S)
# A declaration: property, then value running to the next ; or }. Requiring the
# terminator is what keeps `a:hover {` and `@media (min-width: 900px)` out.
DECL_RE = re.compile(r'(?<![\w-])([-a-zA-Z][-a-zA-Z0-9]*)(\s*:\s*)([^;{}]*?)(\s*)(?=[;}])')
VARCALL_RE = re.compile(r'var\([^()]*(?:\([^()]*\)[^()]*)*\)')
PX_RE = re.compile(r'(?<![\w.#-])(\d+(?:\.\d+)?)px')
HEX_RE = re.compile(r'#[0-9a-fA-F]{3,8}\b')


def rewrite_value(path, prop, val, do_scale, do_color, stats):
    new = val
    if do_scale and prop not in SKIP_PROPS:
        # Mask var() first — its fallbacks mirror tokens; editing them desyncs the two.
        holes = []

        def stash(m):
            holes.append(m.group(0))
            return f'\x00{len(holes) - 1}\x00'

        masked = VARCALL_RE.sub(stash, new)

        def sub_px(m):
            fixed = fix_value(prop, m.group(1))
            if fixed is None:
                return m.group(0)
            stats['scale'][(str(path), prop, m.group(1), str(fixed))] += 1
            return f'{fixed}px'

        masked = PX_RE.sub(sub_px, masked)
        # Sub-half-pixel Figma noise snaps to 0; collapse the now-pointless calc.
        masked = re.sub(r'calc\(\s*([^()]+?)\s*[-+]\s*0px\s*\)', r'\1', masked)
        for i, h in enumerate(holes):
            masked = masked.replace(f'\x00{i}\x00', h)
        new = masked

    if do_color:
        holes = []

        def stash2(m):
            holes.append(m.group(0))
            return f'\x01{len(holes) - 1}\x01'

        masked = VARCALL_RE.sub(stash2, new)  # a hex inside var() is the token's own value

        def sub_hex(m):
            tok = pick_token(prop, norm_hex(m.group(0)))
            if not tok:
                return m.group(0)
            stats['color'][(str(path), prop, m.group(0), tok)] += 1
            return f'var({tok})'

        masked = HEX_RE.sub(sub_hex, masked)
        for i, h in enumerate(holes):
            masked = masked.replace(f'\x01{i}\x01', h)
        new = masked
    return new


def process(path, do_scale, do_color, stats):
    text = path.read_text()
    # Blank out comments positionally so offsets stay valid, then restore.
    comments = []

    def hide(m):
        comments.append(m.group(0))
        return '\x02' * len(m.group(0))

    masked = COMMENT_RE.sub(hide, text)

    out, last = [], 0
    for m in DECL_RE.finditer(masked):
        prop, sep, val, tail = m.group(1), m.group(2), m.group(3), m.group(4)
        if prop.startswith('--') or '\x02' in val:
            continue  # custom-property declarations ARE the scale; never rewrite
        new = rewrite_value(path, prop, val, do_scale, do_color, stats)
        if new == val:
            continue
        out.append(masked[last:m.start(3)])
        out.append(new)
        last = m.end(3)
    out.append(masked[last:])
    result = ''.join(out)

    it = iter(comments)
    result = re.sub(r'\x02+', lambda _: next(it), result)
    return result


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--no-scale', action='store_true')
    ap.add_argument('--no-color', action='store_true')
    ap.add_argument('--only', default=None)
    ap.add_argument('--verbose', action='store_true')
    args = ap.parse_args()

    files = [
        f for f in sorted(ROOT.rglob('*.module.css'))
        if 'proto' not in f.relative_to(ROOT).parts
    ] + [ROOT / 'app' / 'globals.css']
    if args.only:
        files = [f for f in files if args.only in str(f)]

    stats = {'scale': collections.Counter(), 'color': collections.Counter()}
    changed = []
    for f in files:
        before = f.read_text()
        after = process(f, not args.no_scale, not args.no_color, stats)
        if after != before:
            changed.append(f)
            if args.apply:
                f.write_text(after)

    n_scale = sum(stats['scale'].values())
    n_color = sum(stats['color'].values())
    verb = "fixed" if args.apply else "to fix"
    print(f"{len(changed)} file(s), {n_scale} scale + {n_color} color violation(s) {verb}")

    agg = collections.Counter()
    for (p, prop, old, newv), c in stats['scale'].items():
        agg[(prop, old, newv)] += c
    if agg:
        print("\n--- off-scale px ---")
        for (prop, old, newv), c in agg.most_common(200):
            print(f"  {c:4d}  {prop}: {old}px -> {newv}px")
        if args.verbose:
            for (p, prop, old, newv), c in sorted(stats['scale'].items()):
                print(f"        {pathlib.Path(p).relative_to(ROOT)}  {prop}: {old}px -> {newv}px")

    agg2 = collections.Counter()
    for (p, prop, old, tok), c in stats['color'].items():
        agg2[(prop, old, tok)] += c
    if agg2:
        print("\n--- literals with an exact-value token ---")
        for (prop, old, tok), c in agg2.most_common(200):
            print(f"  {c:4d}  {prop}: {old} -> var({tok})")
        if args.verbose:
            for (p, prop, old, tok), c in sorted(stats['color'].items()):
                print(f"        {pathlib.Path(p).relative_to(ROOT)}  {prop}: {old} -> var({tok})")

    # What we deliberately did NOT touch, so it can be reported honestly.
    skipped = collections.Counter()
    for f in files:
        masked = COMMENT_RE.sub(lambda m: '\x02' * len(m.group(0)), f.read_text())
        for m in DECL_RE.finditer(masked):
            prop, val = m.group(1), m.group(3)
            if prop.startswith('--') or '\x02' in val:
                continue
            for hm in HEX_RE.finditer(VARCALL_RE.sub('', val)):
                if not pick_token(prop, norm_hex(hm.group(0))):
                    skipped[(prop, norm_hex(hm.group(0)))] += 1
    print("\n--- colors left as literals (no exact-value semantic token) ---")
    for (prop, h), c in skipped.most_common(25):
        print(f"  {c:4d}  {prop}: {h}   candidates={TOKEN_TABLE.get(h) or 'none'}")

    # Even, therefore compliant with the stated rule, but not on a named DS scale.
    offscale = collections.Counter()
    for f in files:
        masked = COMMENT_RE.sub(lambda m: '\x02' * len(m.group(0)), f.read_text())
        for m in DECL_RE.finditer(masked):
            prop, val = m.group(1), m.group(3)
            if prop.startswith('--') or '\x02' in val or prop in SKIP_PROPS:
                continue
            for pm in PX_RE.finditer(VARCALL_RE.sub('', val)):
                n = float(pm.group(1))
                if not float(n).is_integer() or int(n) % 2 or n in (0, 999, 9999):
                    continue
                if prop == 'font-size' and int(n) not in TYPE_SCALE:
                    offscale[('font-size', int(n))] += 1
                elif RADIUS_PROPS.match(prop) and n <= 26 and int(n) not in RADIUS_SCALE:
                    offscale[('border-radius', int(n))] += 1
    if offscale:
        print("\n--- advisory: even, but not on a named DS scale ---")
        print("    (compliant with the multiple-of-2 rule; snapping these would resize")
        print("     real headings, so it is a deliberate call — do NOT 'fix' silently)")
        for (prop, n), c in sorted(offscale.items(), key=lambda x: (-x[1], x[0])):
            print(f"  {c:4d}  {prop}: {n}px")

    if n_scale or n_color:
        if not args.apply:
            print("\nFAIL — run `npm run ds:fix` to apply, then re-check.")
            sys.exit(1)
        print("\nApplied. Re-run `npm run ds:check` to confirm, then verify the UI.")
    else:
        print("\nPASS — every px value is on scale and every tokenizable literal is a token.")
