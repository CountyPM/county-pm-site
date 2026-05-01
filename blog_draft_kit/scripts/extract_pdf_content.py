from __future__ import annotations
import argparse
from pathlib import Path
import fitz  # PyMuPDF

def extract_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    pages = []
    for page in doc:
        txt = page.get_text("text")
        pages.append(txt)
    return "\n\n".join(pages)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    text = extract_text(args.pdf)
    Path(args.out).write_text(text, encoding="utf-8")
    print(f"Wrote raw text to {args.out}")

if __name__ == "__main__":
    main()
