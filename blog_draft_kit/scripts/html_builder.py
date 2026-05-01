from __future__ import annotations
import html
import re
from typing import List, Dict, Any

def guess_subtitle(lines: List[str], title: str) -> str:
    for line in lines[:12]:
        s = line.strip()
        if s and s != title and len(s) > 40 and len(s) < 180 and not s.isupper():
            return s
    return ""

def make_excerpt(lines: List[str]) -> str:
    prose = [ln for ln in lines if not ln.isupper() and len(ln.split()) > 6]
    excerpt = " ".join(prose[:2]).strip()
    return excerpt[:220].rsplit(" ", 1)[0] + "…" if len(excerpt) > 220 else excerpt

def is_callout(line: str) -> bool:
    return line.startswith('"') and line.endswith('"') and len(line.split()) > 6

def is_heading(line: str) -> bool:
    return bool(re.match(r"^(THE [A-Z0-9 ,&'’\-]+|LESSON FOR [A-Z0-9 ,&'’\-]+|PART \d+ OF \d+.*)$", line))

def build_html(lines: List[str], title: str, author: str, subtitle: str = "") -> str:
    body = []
    for line in lines:
        s = line.strip()
        if not s or s == title or s == subtitle:
            continue
        esc = html.escape(s)
        if is_heading(s):
            tag = "h2" if s.startswith("THE ") or s.startswith("LESSON FOR ") else "h3"
            body.append(f"<{tag}>{esc.title() if s.isupper() else esc}</{tag}>")
        elif is_callout(s):
            body.append(f"<blockquote><p>{esc}</p></blockquote>")
        else:
            body.append(f"<p>{esc}</p>")

    subtitle_html = f"<p class='subtitle'>{html.escape(subtitle)}</p>" if subtitle else ""
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>{html.escape(title)}</title>
</head>
<body>
  <article>
    <h1>{html.escape(title)}</h1>
    {subtitle_html}
    <p class='byline'>By {html.escape(author)}</p>
    {''.join(body)}
  </article>
</body>
</html>
"""

def build_payload(lines: List[str], title: str, author: str, slug: str, subtitle: str,
                  excerpt: str, images: List[Dict[str, str]], status: str = "draft") -> Dict[str, Any]:
    hero = images[0]["output_name"] if images else ""
    extra_slots = [img["output_name"] for img in images[1:5]]

    payload = {
        "post_title": title,
        "post_subtitle": subtitle,
        "slug": slug,
        "author_name": author,
        "excerpt": excerpt,
        "meta_description": excerpt,
        "status": status,
        "hero_image": hero,
        "image_slots": extra_slots,
        "body_html": build_html(lines, title, author, subtitle),
    }
    return payload
