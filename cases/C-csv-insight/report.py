"""Deterministic offline CSV summary. No network or third-party packages."""
import argparse
import csv
from datetime import date
import html
import json
import os
from pathlib import Path
import re
import sys
import tempfile

FIELDS = ("date", "channel", "visits", "signups")


class DataError(Exception):
    pass


def analyze(input_path):
    records = []
    seen = {}
    missing = []
    duplicates = []
    input_count = 0
    try:
        with Path(input_path).open(encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle, strict=True)
            if not reader.fieldnames or len(reader.fieldnames) != len(FIELDS) or set(reader.fieldnames) != set(FIELDS):
                raise DataError("表头必须且只能包含 date,channel,visits,signups 四列。")
            for row in reader:
                input_count += 1
                line = reader.line_num
                if None in row or any(value is None for value in row.values()):
                    raise DataError(f"第 {line} 行的列数与表头不一致。")
                cleaned = {key: row[key].strip() for key in FIELDS}
                empty = [key for key in FIELDS if not cleaned[key]]
                if empty:
                    missing.append({"line": line, "fields": empty})
                    continue
                try:
                    parsed_date = date.fromisoformat(cleaned["date"])
                    if parsed_date.isoformat() != cleaned["date"]:
                        raise ValueError("date")
                except ValueError as error:
                    raise DataError(f"第 {line} 行日期不是有效 YYYY-MM-DD。") from error
                for field in ("visits", "signups"):
                    if not re.fullmatch(r"[0-9]+", cleaned[field]):
                        raise DataError(f"第 {line} 行 {field} 必须是非负整数。")
                visits, signups = int(cleaned["visits"]), int(cleaned["signups"])
                if signups > visits:
                    raise DataError(f"第 {line} 行注册数大于访问数，需先确认数据定义。")
                identity = (cleaned["date"], cleaned["channel"], visits, signups)
                if identity in seen:
                    duplicates.append({"line": line, "first_line": seen[identity]})
                    continue
                seen[identity] = line
                records.append(identity)
    except (OSError, UnicodeError, csv.Error) as error:
        raise DataError(f"无法读取 CSV：{error}") from error
    if not records:
        raise DataError("没有可计入的完整有效记录，未生成报告。")
    channels = {}
    for _, channel, visits, signups in records:
        group = channels.setdefault(channel, {"records": 0, "visits": 0, "signups": 0})
        group["records"] += 1
        group["visits"] += visits
        group["signups"] += signups
    return {
        "source": Path(input_path).name,
        "input_count": input_count,
        "included_count": len(records),
        "missing": missing,
        "duplicates": duplicates,
        "visits": sum(item[2] for item in records),
        "signups": sum(item[3] for item in records),
        "first_date": min(item[0] for item in records),
        "last_date": max(item[0] for item in records),
        "channels": channels,
    }


def escape_cell(value):
    return html.escape(str(value)).replace("|", r"\|").replace("\n", " ").replace("\r", " ")


def render(summary):
    lines = [
        "# Activity 离线数据摘要", "",
        f"输入文件：`{escape_cell(summary['source'])}`。此报告只描述输入记录，不推断增长原因或业务效果。", "",
        "## 统计结果", "",
        f"- 输入记录：{summary['input_count']}",
        f"- 计入记录：{summary['included_count']}",
        f"- 排除空值记录：{len(summary['missing'])}",
        f"- 排除重复记录：{len(summary['duplicates'])}",
        f"- 总访问数：**{summary['visits']}**",
        f"- 总注册数：**{summary['signups']}**",
        f"- 计入记录日期：{summary['first_date']} 至 {summary['last_date']}", "",
        "## 按渠道汇总", "",
        "| 渠道 | 计入记录 | 访问数 | 注册数 |", "| --- | ---: | ---: | ---: |",
    ]
    for channel, group in sorted(summary["channels"].items()):
        lines.append(f"| {escape_cell(channel)} | {group['records']} | {group['visits']} | {group['signups']} |")
    lines += ["", "## 数据质量与策略", "",
        "- 任一必需字段为空：排除该整行，不把空值自动当作零；下面列出原 CSV 行号。",
        "- 去首尾空格、将数值解析为整数后，四字段完全相同：只计第一条；相同日期和渠道但数值不同的行不擅自去重。",
        "- 日期、列数、数值格式或注册数大于访问数：拒绝整次生成，保留已有报告。",
        "- 渠道名称区分大小写；没有根据名称猜测合并规则。空白物理行由 CSV 读取器忽略，不计为数据记录。", ""]
    if summary["missing"]:
        for item in summary["missing"]:
            lines.append(f"- 排除第 {item['line']} 行：空字段 {', '.join(item['fields'])}。")
    else:
        lines.append("- 没有排除空值记录。")
    if summary["duplicates"]:
        for item in summary["duplicates"]:
            lines.append(f"- 排除第 {item['line']} 行：与第 {item['first_line']} 行完全重复。")
    else:
        lines.append("- 没有排除重复记录。")
    # Stable machine-readable totals let an independent script check the human report.
    lines += ["", "## 核对数值", "", "```json", json.dumps({
        "input_records": summary["input_count"], "included_records": summary["included_count"],
        "missing_records": len(summary["missing"]), "duplicate_records": len(summary["duplicates"]),
        "visits": summary["visits"], "signups": summary["signups"], "channels": summary["channels"],
    }, ensure_ascii=False, sort_keys=True, indent=2), "```", ""]
    return "\n".join(lines)


def save_report(output_path, content):
    output = Path(output_path)
    temporary = None
    try:
        output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=output.parent, delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(content)
        os.replace(temporary, output)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def main(argv=None):
    parser = argparse.ArgumentParser(description="把离线 activity.csv 汇总为可核对的 Markdown")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        if args.input.resolve() == args.output.resolve():
            raise DataError("输入与输出不能是同一个文件。")
        summary = analyze(args.input)
        save_report(args.output, render(summary))
        print(f"已生成 {args.output}：计入 {summary['included_count']} 条，访问 {summary['visits']}，注册 {summary['signups']}；排除空值 {len(summary['missing'])} 条、重复 {len(summary['duplicates'])} 条。")
        return 0
    except (DataError, OSError) as error:
        print(f"错误：{error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
