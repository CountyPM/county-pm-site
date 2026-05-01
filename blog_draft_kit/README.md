# Blog Draft Kit

Starter kit for turning emailed blog-post packages (PDF + PNG/JPG images) into:
- cleaned article text
- structured HTML body
- processed web images
- a CMS draft payload JSON
- a human-readable review report

## What this kit does now

- Extracts text from a PDF using **PyMuPDF** (`fitz`)
- Cleans repeated headers/footers, page markers, broken line wraps, and obvious PDF artifacts
- Tries to preserve semantic sections and turn them into HTML headings
- Processes images with Pillow:
  - renames to slug-based names
  - can upscale small images (best-effort)
  - compresses for web
  - generates simple alt text placeholders
- Produces:
  - `draft.html`
  - `draft_payload.json`
  - `review_report.md`

## What it does not do yet

- It does **not** log into your CMS yet
- It does **not** read Gmail directly yet

Those can be added next, but I kept this first version reliable and safe.

## Recommended first run

```bash
pip install -r requirements.txt

python scripts/process_package.py \
  --pdf "/path/to/article.pdf" \
  --images "/path/to/image1.png" "/path/to/image2.png" \
  --output-dir output/run1
```

## Output files

- `article_text_raw.txt`
- `article_text_clean.txt`
- `draft.html`
- `draft_payload.json`
- `review_report.md`
- processed images in `images/`

## Suggested workflow

1. Put one PDF and 1–3 images in a folder
2. Run `process_package.py`
3. Review `review_report.md`
4. Open `draft.html`
5. Copy/paste or import into your CMS
6. When ready, we can add:
   - Gmail label polling
   - AppFolio browser automation
   - stronger image-quality rules
   - CMS-specific field mapping

## Notes

- If a PDF is mostly image-based/scanned, text extraction quality may be poor.
- If an image is very pixelated, the script flags it but cannot truly “restore” missing detail.
