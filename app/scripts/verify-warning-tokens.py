#!/usr/bin/env python3
"""Verify the Surmount warning ramp and its semantic light/dark mappings."""
import pathlib
import re
import sys

TOKENS = pathlib.Path(__file__).resolve().parent.parent / "src" / "styles" / "tokens.css"

RAMP = {
    "50": "#fcf8ea", "100": "#f9efc8", "200": "#f5dd93",
    "300": "#efc355", "400": "#e8a927", "500": "#d99319",
    "600": "#bb7013", "700": "#955013", "800": "#763d16",
    "900": "#6a3519", "950": "#3d1b0c",
}

LIGHT = {
    "--color-bg-warning-primary": RAMP["50"],
    "--color-bg-warning-secondary": RAMP["100"],
    "--color-fg-warning-primary": RAMP["600"],
    "--color-text-warning-primary-600": RAMP["600"],
    "--color-bg-warning-solid": RAMP["600"],
    "--color-fg-warning-secondary": RAMP["500"],
}

DARK = {
    "--color-bg-warning-primary": RAMP["950"],
    "--color-bg-warning-secondary": RAMP["600"],
    "--color-fg-warning-primary": RAMP["500"],
    "--color-text-warning-primary-600": RAMP["400"],
    "--color-fg-warning-secondary": RAMP["400"],
}


def block_values(css: str, selector: str) -> dict[str, str]:
    match = re.search(re.escape(selector) + r"\s*\{(.*?)\n\}", css, re.S)
    if not match:
        return {}
    return dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", match.group(1)))


css = TOKENS.read_text().lower()
light_css, _ = css.split(':root[data-theme="dark"]', 1)
root = dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", light_css))
dark = block_values(css, ':root[data-theme="dark"]')
expected_root = {f"--color-warning-{step}": value for step, value in RAMP.items()} | LIGHT
mismatches = [
    (scope, name, expected, values.get(name, "<missing>"))
    for scope, values, expected_values in (("light", root, expected_root), ("dark", dark, DARK))
    for name, expected in expected_values.items()
    if values.get(name) != expected
]

if mismatches:
    print("Warning token drift detected:")
    for scope, name, expected, found in mismatches:
        print(f"  {scope} {name}: expected {expected}, found {found}")
    sys.exit(1)

print(f"PASS — {len(RAMP)} warning ramp steps and semantic mappings match the Figma source.")
