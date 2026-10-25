"""Run the existing offline CSV report and independent check as one local job."""
import argparse
from pathlib import Path
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser(description="生成 CSV Insight 报告，再独立核对；任一步失败即停止。")
    parser.add_argument("--input", required=True, type=Path, help="相对当前终端目录的 CSV 路径")
    parser.add_argument("--output", required=True, type=Path, help="相对当前终端目录的 Markdown 路径")
    args = parser.parse_args()
    case = Path(__file__).resolve().parents[1] / "cases/C-csv-insight"
    source = args.input.resolve()
    destination = args.output.resolve()
    if not (case / "report.py").is_file() or not (case / "verify_totals.py").is_file():
        parser.error("案例 C 文件缺失；请保留本脚本在完整教材 extensions 目录中。")
    for command in [
        [sys.executable, "-B", str(case / "report.py"), "--input", str(source), "--output", str(destination)],
        [sys.executable, "-B", str(case / "verify_totals.py"), "--input", str(source), "--report", str(destination)],
    ]:
        result = subprocess.run(command, check=False)
        if result.returncode:
            print("任务未通过，未继续后续步骤；请勿把旧报告或未核对报告当作本次成功结果。", file=sys.stderr)
            return result.returncode
    print("本地生成与核对完成；没有发送、上传或创建定时任务。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
