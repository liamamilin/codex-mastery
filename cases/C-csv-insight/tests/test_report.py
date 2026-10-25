import csv
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.input = Path(self.temporary.name) / "activity.csv"
        self.output = Path(self.temporary.name) / "summary.md"
        self.input.write_bytes((ROOT / "input/activity.csv").read_bytes())

    def run_report(self, output=None):
        return subprocess.run([sys.executable, "-X", "utf8", "-B", str(ROOT / "report.py"), "--input", str(self.input), "--output", str(output or self.output)], capture_output=True, text=True, encoding="utf-8")

    def totals(self):
        content = self.output.read_text(encoding="utf-8")
        return json.loads(re.search(r"```json\s*([\s\S]*?)```", content).group(1))

    def test_sample_totals_quality_and_independent_check(self):
        self.assertEqual(self.run_report().returncode, 0)
        totals = self.totals()
        self.assertEqual((totals["visits"], totals["signups"]), (2155, 267))
        self.assertEqual((totals["input_records"], totals["included_records"], totals["missing_records"], totals["duplicate_records"]), (24, 21, 2, 1))
        self.assertEqual(totals["channels"]["search"], {"records": 7, "visits": 1030, "signups": 104})
        content = self.output.read_text(encoding="utf-8")
        self.assertIn("排除第 23 行：与第 2 行完全重复", content)
        self.assertIn("排除第 24 行：空字段 visits", content)
        self.assertIn("排除第 25 行：空字段 signups", content)
        checked = subprocess.run([sys.executable, "-X", "utf8", "-B", str(ROOT / "verify_totals.py"), "--input", str(self.input), "--report", str(self.output)], capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_repeat_is_stable_and_one_row_change_has_known_delta(self):
        self.assertEqual(self.run_report().returncode, 0)
        first = self.output.read_bytes()
        self.assertEqual(self.run_report().returncode, 0)
        self.assertEqual(self.output.read_bytes(), first)
        with self.input.open(encoding="utf-8", newline="") as handle:
            rows = list(csv.reader(handle))
        # A non-duplicated record; changing the duplicate pair would change deduplication too.
        rows[2][2] = str(int(rows[2][2]) + 7)
        with self.input.open("w", encoding="utf-8", newline="") as handle:
            csv.writer(handle).writerows(rows)
        self.assertEqual(self.run_report().returncode, 0)
        self.assertEqual((self.totals()["visits"], self.totals()["signups"]), (2162, 267))

    def test_bad_number_never_overwrites_previous_report(self):
        self.assertEqual(self.run_report().returncode, 0)
        before = self.output.read_bytes()
        text = self.input.read_text(encoding="utf-8").replace("newsletter,80,16", "newsletter,eighty,16")
        self.input.write_text(text, encoding="utf-8")
        result = self.run_report()
        self.assertEqual(result.returncode, 2)
        self.assertIn("必须是非负整数", result.stderr)
        self.assertEqual(self.output.read_bytes(), before)

    def test_schema_and_same_path_fail_without_data_loss(self):
        before_input = self.input.read_bytes()
        self.assertEqual(self.run_report(output=self.input).returncode, 2)
        self.assertEqual(self.input.read_bytes(), before_input)
        self.output.write_text("保留已有报告", encoding="utf-8")
        self.input.write_text("date,visits\n2026-10-01,1\n", encoding="utf-8")
        self.assertEqual(self.run_report().returncode, 2)
        self.assertEqual(self.output.read_text(encoding="utf-8"), "保留已有报告")

    def test_independent_check_rejects_visible_table_and_quality_tampering(self):
        self.assertEqual(self.run_report().returncode, 0)
        original = self.output.read_text(encoding="utf-8")
        mutations = [
            ("| search | 7 | 1030 | 104 |", "| search | 7 | 9999 | 104 |"),
            ("- 排除空值记录：2", "- 排除空值记录：0"),
        ]
        for before, after in mutations:
            with self.subTest(change=before):
                self.assertIn(before, original)
                self.output.write_text(original.replace(before, after), encoding="utf-8")
                checked = subprocess.run([sys.executable, "-X", "utf8", "-B", str(ROOT / "verify_totals.py"), "--input", str(self.input), "--report", str(self.output)], capture_output=True, text=True, encoding="utf-8")
                self.assertEqual(checked.returncode, 2, checked.stdout)
                self.assertIn("不一致", checked.stderr)


if __name__ == "__main__":
    unittest.main()
