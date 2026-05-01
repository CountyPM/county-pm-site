from __future__ import annotations
import argparse
from pathlib import Path
from typing import List, Dict, Any
from PIL import Image, ImageOps
from slugify_util import slugify

def process_images(image_paths: List[str], out_dir: str, slug: str,
                   output_format: str = "WEBP", quality: int = 82,
                   min_width_warning: int = 1200, max_width: int = 2200) -> List[Dict[str, Any]]:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    results = []

    for idx, p in enumerate(image_paths, start=1):
        src = Path(p)
        img = Image.open(src)
        img = ImageOps.exif_transpose(img).convert("RGB")
        width, height = img.size

        warnings = []
        if width < min_width_warning:
            warnings.append(f"Image width {width}px is below preferred minimum {min_width_warning}px.")

        # Best-effort upscale if small
        if width < min_width_warning:
            scale = min_width_warning / max(width, 1)
            new_size = (int(width * scale), int(height * scale))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            width, height = img.size

        if width > max_width:
            scale = max_width / width
            img = img.resize((int(width * scale), int(height * scale)), Image.Resampling.LANCZOS)
            width, height = img.size

        suffix = "hero" if idx == 1 else f"{idx-1:02d}"
        stem = f"{slug}-{suffix}"
        ext = ".webp" if output_format.upper() == "WEBP" else ".jpg"
        out_name = stem + ext
        out_path = out / out_name

        save_kwargs = {"quality": quality}
        img.save(out_path, format=output_format.upper(), **save_kwargs)

        results.append({
            "source_path": str(src),
            "output_path": str(out_path),
            "output_name": out_name,
            "width": width,
            "height": height,
            "alt_text": f"Illustration for {slug.replace('-', ' ')}",
            "warnings": warnings,
        })

    return results

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--images", nargs="+", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--slug", required=True)
    args = parser.parse_args()
    items = process_images(args.images, args.out_dir, args.slug)
    for item in items:
        print(item["output_path"])

if __name__ == "__main__":
    main()
