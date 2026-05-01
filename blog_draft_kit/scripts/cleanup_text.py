from __future__ import annotations
import re
from pathlib import Path
from typing import Iterable, Tuple, List, Dict, Any

DEFAULT_REMOVE_PATTERNS = [
    r"^County Property Management .* Page \d+$",
    r"^County Property Management$",
    r"^www\.c-p-m\.com.*$",
    r"^\(\d{3}\) \d{3}-\d{4}$",
    r"^Page \d+$",
]

DEFAULT_HEADING_PATTERNS = [
    r"^THE [A-Z0-9 ,&'’\-]+$",
    r"^LESSON FOR [A-Z0-9 ,&'’\-]+$",
    r"^PART \d+ OF \d+.*$",
]

def normalize_quotes(text: str) -> str:
    return (
        text.replace("“", '"')
            .replace("”", '"')
            .replace("’", "'")
            .replace("‘", "'")
            .replace("—", "—")
    )

def should_remove_line(line: str, remove_patterns: Iterable[str]) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    for pat in remove_patterns:
        if re.match(pat, stripped):
            return True
    return False

def is_heading(line: str, heading_patterns: Iterable[str]) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    for pat in heading_patterns:
        if re.match(pat, stripped):
            return True
    return False

def merge_broken_lines(lines: List[str], heading_patterns: Iterable[str]) -> List[str]:
    merged: List[str] = []
    buf = ""

    def flush():
        nonlocal buf
        if buf.strip():
            merged.append(re.sub(r"\s+", " ", buf).strip())
        buf = ""

    for raw in lines:
        line = raw.strip()
        if not line:
            flush()
            continue

        if is_heading(line, heading_patterns):
            flush()
            merged.append(line)
            continue

        if not buf:
            buf = line
            continue

        # Continue paragraph if previous line does not clearly end a paragraph
        if re.search(r"[a-z0-9,;:\)]$", buf) and re.match(r"^[a-z0-9\"'(]", line, re.I):
            buf += " " + line
        else:
            # Also merge if current line is very short and looks like wrap continuation
            if len(line.split()) <= 5 and not re.search(r"[.!?]$", buf):
                buf += " " + line
            else:
                flush()
                buf = line

    flush()
    return merged

def extract_title(lines: List[str]) -> str:
    for i, line in enumerate(lines[:40]):
        s = line.strip()
        if len(s) >= 8 and len(s) <= 120:
            if s.isupper() and len(s.split()) >= 3:
                # likely banner/header, skip some
                continue
            if not re.match(r"^(By |PART \d|County Property Management|EST\.|WWW\.)", s, re.I):
                return s
    return "Untitled Post"

def cleanup_text(text: str,
                 remove_patterns: Iterable[str] | None = None,
                 heading_patterns: Iterable[str] | None = None) -> Dict[str, Any]:
    remove_patterns = list(remove_patterns or DEFAULT_REMOVE_PATTERNS)
    heading_patterns = list(heading_patterns or DEFAULT_HEADING_PATTERNS)

    text = normalize_quotes(text)
    text = text.replace("\x0c", "\n")
    text = re.sub(r"[ \t]+", " ", text)

    raw_lines = [ln.rstrip() for ln in text.splitlines()]
    kept = [ln for ln in raw_lines if not should_remove_line(ln, remove_patterns)]
    kept = [ln for ln in kept if ln.strip() not in {"✦", "∞", "⚠", "“", "”"}]

    merged = merge_broken_lines(kept, heading_patterns)
    title = extract_title(merged)

    warnings = []
    if sum(1 for x in merged if is_heading(x, heading_patterns)) == 0:
        warnings.append("No clear headings detected; structure may need manual review.")

    return {
        "title": title,
        "lines": merged,
        "text_clean": "\n\n".join(merged).strip(),
        "warnings": warnings,
    }

def main() -> None:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--infile", required=True)
    parser.add_argument("--outfile", required=True)
    args = parser.parse_args()
    text = Path(args.infile).read_text(encoding="utf-8")
    result = cleanup_text(text)
    Path(args.outfile).write_text(result["text_clean"], encoding="utf-8")
    print(f"Wrote cleaned text to {args.outfile}")

if __name__ == "__main__":
    main()
