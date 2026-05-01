from __future__ import annotations
import argparse
import json
from pathlib import Path
import yaml

from extract_pdf_content import extract_text
from cleanup_text import cleanup_text
from html_builder import build_html, build_payload, guess_subtitle, make_excerpt
from image_processing import process_images
from slugify_util import slugify
from review_report import write_review_report

def main() -> None:
    parser = argparse.ArgumentParser(description="Process one blog package (PDF + images).")
    parser.add_argument("--pdf", required=True, help="Path to source PDF")
    parser.add_argument("--images", nargs="*", default=[], help="Image paths")
    parser.add_argument("--output-dir", required=True, help="Output directory")
    parser.add_argument("--config", default="config.example.yaml", help="Config YAML")
    args = parser.parse_args()

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    img_out = out / "images"
    img_out.mkdir(exist_ok=True)

    cfg_path = Path(args.config)
    cfg = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) if cfg_path.exists() else {}

    raw = extract_text(args.pdf)
    (out / "article_text_raw.txt").write_text(raw, encoding="utf-8")

    cleanup = cleanup_text(
        raw,
        remove_patterns=cfg.get("cleanup", {}).get("remove_lines_matching"),
        heading_patterns=cfg.get("cleanup", {}).get("heading_patterns"),
    )
    (out / "article_text_clean.txt").write_text(cleanup["text_clean"], encoding="utf-8")

    title = cleanup["title"]
    slug = slugify(title)
    lines = cleanup["lines"]
    subtitle = guess_subtitle(lines, title)
    excerpt = make_excerpt(lines)
    author = cfg.get("author_default", "Author Name")
    status = cfg.get("status_default", "draft")

    images = process_images(
        args.images,
        str(img_out),
        slug=slug,
        output_format=cfg.get("image", {}).get("output_format", "WEBP"),
        quality=int(cfg.get("image", {}).get("quality", 82)),
        min_width_warning=int(cfg.get("image", {}).get("min_width_warning", 1200)),
        max_width=int(cfg.get("image", {}).get("max_width", 2200)),
    ) if args.images else []

    html = build_html(lines, title, author, subtitle)
    (out / "draft.html").write_text(html, encoding="utf-8")

    payload = build_payload(lines, title, author, slug, subtitle, excerpt, images, status=status)
    payload["categories"] = [cfg.get("category_default", "Blog")]
    payload["tags"] = cfg.get("tags_default", [])
    payload["source_pdf"] = args.pdf
    payload["source_images"] = args.images

    (out / "draft_payload.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    write_review_report(
        str(out / "review_report.md"),
        title=title,
        subtitle=subtitle,
        excerpt=excerpt,
        images=images,
        cleanup_warnings=cleanup["warnings"],
    )

    print(f"Processed package into {out}")

if __name__ == "__main__":
    main()
