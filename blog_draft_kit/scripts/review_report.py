from __future__ import annotations
from pathlib import Path
from typing import List, Dict, Any

def write_review_report(out_path: str, title: str, subtitle: str, excerpt: str,
                        images: List[Dict[str, Any]], cleanup_warnings: List[str]) -> None:
    lines = [
        f"# Review Report",
        "",
        f"## Draft summary",
        f"- Title: {title}",
        f"- Subtitle: {subtitle or '(none generated)'}",
        f"- Excerpt: {excerpt or '(none generated)'}",
        "",
        "## Image processing",
    ]
    if images:
        for img in images:
            warn = "; ".join(img.get("warnings", [])) or "OK"
            lines.append(f"- {img['output_name']}: {img['width']}x{img['height']} — {warn}")
    else:
        lines.append("- No images processed")

    lines += ["", "## Warnings"]
    if cleanup_warnings or any(img.get("warnings") for img in images):
        for w in cleanup_warnings:
            lines.append(f"- {w}")
        for img in images:
            for w in img.get("warnings", []):
                lines.append(f"- {img['output_name']}: {w}")
    else:
        lines.append("- No major warnings")

    lines += ["", "## TODOs", "- Review title/subtitle", "- Confirm image choices in CMS", "- Confirm category/tags", "- Confirm final publish date"]
    Path(out_path).write_text("\n".join(lines), encoding="utf-8")
