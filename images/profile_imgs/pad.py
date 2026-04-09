#!/usr/bin/env python3
import argparse
from pathlib import Path
from PIL import Image, ImageOps


def pad_image_in_place(
    path: str,
    pad: int = 200,
    top: bool = False,
    bottom: bool = False,
    left: bool = False,
    right: bool = False,
) -> None:
    img_path = Path(path)

    with Image.open(img_path) as img:
        img = ImageOps.exif_transpose(img)

        has_alpha = img.mode in ("RGBA", "LA") or ("transparency" in img.info)
        if has_alpha:
            img = img.convert("RGBA")
            bg_color = (255, 255, 255, 255)
        else:
            img = img.convert("RGB")
            bg_color = (255, 255, 255)

        pad_top = pad if top else 0
        pad_bottom = pad if bottom else 0
        pad_left = pad if left else 0
        pad_right = pad if right else 0

        new_width = img.width + pad_left + pad_right
        new_height = img.height + pad_top + pad_bottom

        new_img = Image.new(img.mode, (new_width, new_height), bg_color)
        new_img.paste(img, (pad_left, pad_top))

        save_kwargs = {}
        if img_path.suffix.lower() in {".jpg", ".jpeg"}:
            save_kwargs["quality"] = 95

        new_img.save(img_path, **save_kwargs)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("-t", "--top", action="store_true", help="pad top")
    parser.add_argument("-b", "--bottom", action="store_true", help="pad bottom")
    parser.add_argument("-l", "--left", action="store_true", help="pad left")
    parser.add_argument("-r", "--right", action="store_true", help="pad right")
    parser.add_argument("image", help="image file to modify in place")
    parser.add_argument("--pad", type=int, default=200, help="padding in pixels per side")

    args = parser.parse_args()

    # default behavior: top only, if no side flags were given
    if not (args.top or args.bottom or args.left or args.right):
        args.top = True

    pad_image_in_place(
        args.image,
        pad=args.pad,
        top=args.top,
        bottom=args.bottom,
        left=args.left,
        right=args.right,
    )


if __name__ == "__main__":
    main()
