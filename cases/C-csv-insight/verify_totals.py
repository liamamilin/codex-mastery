"""Independent path: CSV rows + set + column sums; does not import report.py."""
import argparse
from collections import Counter, defaultdict
import csv
from datetime import date
import html
import json
from pathlib import Path
import re
import sys


def independently_count(input_path):
    with Path(input_path).open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.reader(handle, strict=True))
    rows = [row for row in rows if row]
    if not rows or len(rows[0]) != 4 or set(rows[0]) != {"date", "channel", "visits", "signups"}:
        raise ValueError("四列输入表头不正确")
    indexes = {name: rows[0].index(name) for name in rows[0]}
    unique = set()
    accepted = []
    missing = duplicates = 0
    for row in rows[1:]:
        if len(row) != 4:
            raise ValueError("数据列数不正确")
        fields = [row[indexes[name]].strip() for name in ("date", "channel", "visits", "signups")]
        if any(value == "" for value in fields):
            missing += 1
            continue
        when, channel, visits, signups = fields
        if date.fromisoformat(when).isoformat() != when:
            raise ValueError("日期格式不正确")
        if not visits.isascii() or not visits.isdigit() or not signups.isascii() or not signups.isdigit():
            raise ValueError("数值不是非负整数")
        item = (when, channel, int(visits), int(signups))
        if item[3] > item[2]:
            raise ValueError("注册数大于访问数")
        if item in unique:
            duplicates += 1
        else:
            unique.add(item)
            accepted.append(item)
    if not accepted:
        raise ValueError("没有可计入记录")
    visits_by_channel = defaultdict(list)
    signups_by_channel = defaultdict(list)
    counts = Counter(item[1] for item in accepted)
    for _, channel, visits, signups in accepted:
        visits_by_channel[channel].append(visits)
        signups_by_channel[channel].append(signups)
    return {
        "input_records": len(rows) - 1, "included_records": len(accepted),
        "missing_records": missing, "duplicate_records": duplicates,
        "visits": sum(row[2] for row in accepted), "signups": sum(row[3] for row in accepted),
        "channels": {channel: {"records": counts[channel], "visits": sum(visits_by_channel[channel]), "signups": sum(signups_by_channel[channel])} for channel in counts},
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description="使用独立统计路径核对 summary.md 数字")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        expected = independently_count(args.input)
        content = args.report.read_text(encoding="utf-8")
        block = re.search(r"```json\s*([\s\S]*?)```", content)
        if not block or json.loads(block.group(1)) != expected:
            raise ValueError("报告核对数值与独立统计不一致")
        # Validate what the reader sees, not just the machine-readable appendix.
        for label, key in [("总访问数", "visits"), ("总注册数", "signups")]:
            if content.splitlines().count(f"- {label}：**{expected[key]}**") != 1:
                raise ValueError(f"正文{label}与独立统计不一致")
        for label, key in [("输入记录", "input_records"), ("计入记录", "included_records"), ("排除空值记录", "missing_records"), ("排除重复记录", "duplicate_records")]:
            if content.splitlines().count(f"- {label}：{expected[key]}") != 1:
                raise ValueError(f"正文{label}与独立统计不一致")
        section = re.search(r"^## 按渠道汇总\s*\n(.*?)(?=^## |\Z)", content, re.MULTILINE | re.DOTALL)
        actual_rows = [line.strip() for line in section.group(1).splitlines() if line.strip().startswith("|")] if section else []
        expected_rows = ["| 渠道 | 计入记录 | 访问数 | 注册数 |", "| --- | ---: | ---: | ---: |"]
        for channel, totals in sorted(expected["channels"].items()):
            # These are Markdown display escapes, not report.py's aggregation path.
            cell = html.escape(channel).replace("|", r"\|").replace("\n", " ").replace("\r", " ")
            expected_rows.append(f"| {cell} | {totals['records']} | {totals['visits']} | {totals['signups']} |")
        if actual_rows != expected_rows:
            raise ValueError("正文渠道表与独立统计不一致")
        print(f"独立核对通过：访问 {expected['visits']}，注册 {expected['signups']}；计入 {expected['included_records']} 条，空值 {expected['missing_records']} 条，重复 {expected['duplicate_records']} 条。")
        return 0
    except (OSError, UnicodeError, ValueError, csv.Error) as error:
        print(f"核对失败：{error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
