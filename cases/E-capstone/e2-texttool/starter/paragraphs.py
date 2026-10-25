"""Read UTF-8 notes and print a paragraph inventory. Graduation starter."""

import argparse
import json
import sys
from pathlib import Path


def split_paragraphs(text):
    return [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]


def summarize(text):
    paragraphs = split_paragraphs(text)
    return {"paragraph_count": len(paragraphs), "paragraphs": paragraphs}


def main(argv=None):
    parser = argparse.ArgumentParser(description="把 UTF-8 文本整理为段落清单 JSON。")
    parser.add_argument("input", type=Path, help="输入文本路径")
    parser.add_argument("--output", type=Path, help="可选输出文件路径")
    args = parser.parse_args(argv)
    try:
        text = args.input.read_text(encoding="utf-8")
        rendered = json.dumps(summarize(text), ensure_ascii=False, indent=2) + "\n"
        if args.output:
            if args.output.resolve() == args.input.resolve() or (args.output.exists() and args.output.samefile(args.input)):
                raise ValueError("输出路径不能覆盖输入文件。")
            args.output.write_text(rendered, encoding="utf-8")
        else:
            print(rendered, end="")
    except (OSError, UnicodeError, ValueError) as exc:
        print("处理失败：{}".format(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
