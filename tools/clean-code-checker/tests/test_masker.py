"""Tests for the comment/string masker.

The masker's core contract is length and newline preservation — several rules
rely on ``masked_lines`` lining up 1:1 with the original lines. These tests pin
that invariant (including the EOF edge cases a review found) plus correctness.
"""

import random
import unittest

from cleancode.text_utils import mask_comments_and_strings as mask


class MaskerInvariantTests(unittest.TestCase):
    EDGE_CASES = [
        'x = "hello\\"',                 # trailing backslash inside string at EOF
        'a = "line\\\ncont"',            # escaped newline inside string
        'y = 1 /* unclosed comment',     # unclosed block comment at EOF
        'z = "unterminated',             # unterminated string at EOF
        'msg = "He said \\"hi\\" now"',  # escaped quotes inside string
        '/* a */ b /* c',                # trailing unclosed block comment
        'q = `tpl ${x}\nline2`',         # multi-line template literal
        '',                              # empty
        '\n\n\n',                        # only newlines
        '// just a comment\\',           # line comment ending in backslash
    ]

    def assert_invariant(self, text):
        masked = mask(text)
        self.assertEqual(len(masked), len(text), f"length changed for {text!r}")
        self.assertEqual(masked.count("\n"), text.count("\n"), f"newline count changed for {text!r}")
        self.assertEqual(len(masked.splitlines()), len(text.splitlines()),
                         f"line count changed for {text!r}")

    def test_edge_cases_preserve_length_and_newlines(self):
        for case in self.EDGE_CASES:
            with self.subTest(case=case):
                self.assert_invariant(case)

    def test_random_inputs_preserve_invariant(self):
        rng = random.Random(1234)
        alphabet = list('abc 123(){};=\n\t"\'`/*\\#+')
        for _ in range(500):
            text = "".join(rng.choice(alphabet) for _ in range(rng.randint(0, 60)))
            self.assert_invariant(text)


class MaskerCorrectnessTests(unittest.TestCase):
    def test_blanks_double_quoted_string_contents(self):
        self.assertEqual(mask('a = "secret123"'), 'a =            ')

    def test_blanks_line_comment(self):
        masked = mask("code() // a branch if for")
        self.assertNotIn("if", masked)
        self.assertTrue(masked.startswith("code()"))

    def test_blanks_block_comment_but_keeps_code_after(self):
        masked = mask("a /* if for while */ b")
        self.assertNotIn("if", masked)
        self.assertIn("a", masked)
        self.assertIn("b", masked)

    def test_keeps_code_identifiers_and_braces(self):
        masked = mask('function f() { return 1; }')
        self.assertIn("function f()", masked)
        self.assertIn("{", masked)
        self.assertIn("}", masked)

    def test_escaped_quote_does_not_end_string_early(self):
        # The whole string (including the escaped quote) must be blanked, so the
        # trailing real code stays visible and nothing inside leaks.
        masked = mask('x = "a\\"500\\"b" + y')
        self.assertNotIn("500", masked)
        self.assertIn("+ y", masked)


if __name__ == "__main__":
    unittest.main()
