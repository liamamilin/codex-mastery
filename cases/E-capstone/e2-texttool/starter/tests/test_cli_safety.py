"""Input protection only: does not solve or test the graduation split defect."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ENTRY = Path(__file__).resolve().parents[1] / "paragraphs.py"


class InputSafetyTests(unittest.TestCase):
    def test_output_cannot_overwrite_input_or_its_hardlink(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "input.txt"
            source.write_text("第一段。\n\n第二段。\n", encoding="utf-8")
            alias = Path(directory) / "alias.txt"
            try:
                os.link(source, alias)
            except (OSError, NotImplementedError) as error:
                self.skipTest(f"本文件系统不支持硬链接：{error}")
            before = source.read_bytes()
            for output in (source, alias):
                with self.subTest(output=output.name):
                    result = subprocess.run([sys.executable, "-X", "utf8", "-B", str(ENTRY), str(source), "--output", str(output)], capture_output=True, text=True, encoding="utf-8")
                    self.assertEqual(result.returncode, 2)
                    self.assertIn("不能覆盖输入", result.stderr)
                    self.assertEqual(source.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
