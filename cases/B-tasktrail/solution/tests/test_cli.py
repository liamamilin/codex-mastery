import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ENTRY = Path(__file__).resolve().parents[1] / "tasktrail.py"


class TaskTrailTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.data = Path(self.temporary.name) / "tasks.json"

    def run_cli(self, *arguments):
        return subprocess.run([sys.executable, "-X", "utf8", "-B", str(ENTRY), "--data", str(self.data), *arguments], capture_output=True, text=True, encoding="utf-8")

    def test_add_done_and_read_in_separate_processes(self):
        self.assertEqual(self.run_cli("add", "整理资料").returncode, 0)
        self.assertIn("[ ] #1 整理资料", self.run_cli("list").stdout)
        self.assertEqual(self.run_cli("done", "1").returncode, 0)
        self.assertIn("[x] #1 整理资料", self.run_cli("list").stdout)
        self.assertTrue(json.loads(self.data.read_text(encoding="utf-8"))["tasks"][0]["done"])

    def test_rejected_operations_do_not_change_data(self):
        self.run_cli("add", "保留这条")
        before = self.data.read_bytes()
        for arguments in [("add", "  "), ("done", "999")]:
            with self.subTest(arguments=arguments):
                result = self.run_cli(*arguments)
                self.assertEqual(result.returncode, 2)
                self.assertIn("错误", result.stderr)
                self.assertEqual(self.data.read_bytes(), before)

    def test_broken_json_is_not_overwritten(self):
        self.data.write_text("{broken", encoding="utf-8")
        self.assertEqual(self.run_cli("add", "不能覆盖旧数据").returncode, 2)
        self.assertEqual(self.data.read_text(encoding="utf-8"), "{broken")

    def test_status_filters_keep_data_and_default_behavior(self):
        empty = self.run_cli("list")
        self.assertEqual(empty.returncode, 0)
        self.assertIn("没有符合条件的任务", empty.stdout)
        self.assertFalse(self.data.exists())
        self.run_cli("add", "未完成样本")
        self.run_cli("add", "已完成样本")
        self.run_cli("done", "2")
        before = self.data.read_bytes()
        opened = self.run_cli("list", "--status", "open")
        done = self.run_cli("list", "--status", "done")
        self.assertEqual(opened.returncode, 0)
        self.assertEqual(done.returncode, 0)
        self.assertIn("[ ] #1 未完成样本", opened.stdout)
        self.assertNotIn("#2", opened.stdout)
        self.assertIn("[x] #2 已完成样本", done.stdout)
        self.assertNotIn("#1", done.stdout)
        self.assertEqual(self.run_cli("list").stdout, self.run_cli("list", "--status", "all").stdout)
        self.assertEqual(self.run_cli("list", "--status", "unknown").returncode, 2)
        self.assertEqual(self.data.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
