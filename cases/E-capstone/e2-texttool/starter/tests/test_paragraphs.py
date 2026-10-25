import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from paragraphs import summarize


class BasicParagraphTests(unittest.TestCase):
    def test_ordinary_two_paragraphs_keep_internal_newline(self):
        self.assertEqual(
            summarize("第一段第一行\n第一段第二行\n\n第二段。\n"),
            {
                "paragraph_count": 2,
                "paragraphs": ["第一段第一行\n第一段第二行", "第二段。"],
            },
        )

    def test_empty_input_has_no_paragraphs(self):
        self.assertEqual(summarize(""), {"paragraph_count": 0, "paragraphs": []})


if __name__ == "__main__":
    unittest.main()
