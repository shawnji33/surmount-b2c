#!/usr/bin/env python3
"""Verify the imported typography tokens against the Surmount Figma library.

The source values are intentionally kept here as a compact contract, not a
second token system. When design exports are refreshed, this check catches
accidental size/leading drift before product components consume it.
"""
import pathlib
import re
import sys

TOKENS = pathlib.Path(__file__).resolve().parent.parent / "src" / "styles" / "tokens.css"

EXPECTED = {
    "--font-family-display": "Inter",
    "--font-family-body": "Geist",
    "--font-weight-regular": "400",
    "--font-weight-medium": "500",
    "--font-weight-semibold": "600",
    "--font-weight-bold": "700",
    "--font-size-text-xxs": "10px",
    "--font-size-text-xs": "12px",
    "--font-size-text-sm": "14px",
    "--font-size-text-md": "16px",
    "--font-size-text-lg": "18px",
    "--font-size-text-xl": "20px",
    "--font-size-display-xxxs": "18px",
    "--font-size-display-xxs": "20px",
    "--font-size-display-xs": "24px",
    "--font-size-display-sm": "30px",
    "--font-size-display-md": "36px",
    "--font-size-display-lg": "48px",
    "--font-size-display-xl": "60px",
    "--font-size-display-2xl": "72px",
    "--line-height-text-xxs": "13px",
    "--line-height-text-xs": "18px",
    "--line-height-text-sm": "20px",
    "--line-height-text-md": "24px",
    "--line-height-text-lg": "28px",
    "--line-height-text-xl": "30px",
    "--line-height-display-xxxs": "24px",
    "--line-height-display-xxs": "26px",
    "--line-height-display-xs": "32px",
    "--line-height-display-sm": "38px",
    "--line-height-display-md": "44px",
    "--line-height-display-lg": "60px",
    "--line-height-display-xl": "72px",
    "--line-height-display-2xl": "90px",
}


def values_from(path: pathlib.Path) -> dict[str, str]:
    return {
        name: value.strip()
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", path.read_text())
    }


actual = values_from(TOKENS)
mismatches = [
    (name, expected, actual.get(name, "<missing>"))
    for name, expected in EXPECTED.items()
    if actual.get(name) != expected
]

if mismatches:
    print("Typography token drift detected:")
    for name, expected, found in mismatches:
        print(f"  {name}: expected {expected}, found {found}")
    sys.exit(1)

print(f"PASS — {len(EXPECTED)} Surmount Figma typography tokens match.")
