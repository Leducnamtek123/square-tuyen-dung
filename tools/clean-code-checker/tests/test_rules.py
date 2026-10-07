"""Tests for the rule set, including regression tests for reviewed bugs."""

import unittest

from cleancode.rules import analyze_file


def rules_of(path, language, src):
    return [f.rule for f in analyze_file(path, language, src)]


def findings_of(path, language, src, rule):
    return [f for f in analyze_file(path, language, src) if f.rule == rule]


class RuleFiringTests(unittest.TestCase):
    def test_long_function(self):
        body = "\n".join(f"    x{i} = {i}" for i in range(60))
        src = f"def big():\n{body}\n"
        self.assertIn("long-function", rules_of("a.py", "Python", src))

    def test_too_many_params(self):
        src = "def f(a, b, c, d, e):\n    return a\n"
        self.assertIn("too-many-params", rules_of("a.py", "Python", src))

    def test_long_file(self):
        src = "\n".join("x = 1" for _ in range(401)) + "\n"
        self.assertIn("long-file", rules_of("a.py", "Python", src))

    def test_long_line(self):
        src = "x = '" + "a" * 130 + "'\n"
        self.assertIn("long-line", rules_of("a.py", "Python", src))

    def test_deep_nesting_fires_inside_function(self):
        src = ("def f():\n"
               "    if a:\n"
               "        if b:\n"
               "            if c:\n"
               "                if d:\n"
               "                    x = 1\n")
        self.assertIn("deep-nesting", rules_of("a.py", "Python", src))

    def test_high_complexity(self):
        conds = "\n".join(f"    if x == {i}:\n        pass" for i in range(12))
        src = f"def f(x):\n{conds}\n"
        self.assertIn("high-complexity", rules_of("a.py", "Python", src))

    def test_todo_comment(self):
        self.assertIn("todo-comment", rules_of("a.py", "Python", "x = 1  # TODO: fix\n"))

    def test_trailing_whitespace(self):
        self.assertIn("trailing-whitespace", rules_of("a.py", "Python", "x = 1   \n"))

    def test_commented_out_code(self):
        self.assertIn("commented-code", rules_of("a.py", "Python", "# return compute()\nx = 1\n"))

    def test_debug_statement(self):
        self.assertIn("debug-statement", rules_of("a.py", "Python", 'def f():\n    print("dbg")\n'))


class MagicNumberTests(unittest.TestCase):
    def test_repeated_number_flagged(self):
        src = "a = 3600\nb = 3600\nc = 3600\n"
        self.assertEqual(len(findings_of("a.py", "Python", src, "magic-number")), 1)

    def test_single_occurrence_not_flagged(self):
        src = "a = 3600\nb = 5\n"
        self.assertEqual(findings_of("a.py", "Python", src, "magic-number"), [])

    def test_named_constant_skipped(self):
        src = "TIMEOUT = 3600\nTIMEOUT = 3600\nTIMEOUT = 3600\n"
        self.assertEqual(findings_of("a.py", "Python", src, "magic-number"), [])

    def test_tests_excluded(self):
        src = "a = 3600\nb = 3600\nc = 3600\n"
        self.assertEqual(findings_of("test_x.py", "Python", src, "magic-number"), [])


class RegressionTests(unittest.TestCase):
    """Lock in the fixes the multi-agent review surfaced."""

    def test_class_method_baseline_not_deep_nesting(self):
        # class + def must not count as nesting levels (was a false positive).
        src = ("class C:\n"
               "    def m(self):\n"
               "        if a:\n"
               "            return 1\n")
        self.assertNotIn("deep-nesting", rules_of("a.py", "Python", src))

    def test_numbers_in_escaped_strings_not_magic(self):
        line = '    x = "code_\\"777\\" here"\n'
        src = "def f():\n" + line + line + line
        self.assertEqual(findings_of("a.py", "Python", src, "magic-number"), [])

    def test_branch_keywords_in_comment_not_complexity(self):
        src = ("function a(b) {\n"
               "  // if for while if for while if for while if for while if for\n"
               "  return b;\n"
               "}\n")
        self.assertEqual(findings_of("a.js", "JavaScript", src, "high-complexity"), [])

    def test_print_inside_string_not_debug(self):
        src = 'def f():\n    msg = "call print() please"\n    return msg\n'
        self.assertEqual(findings_of("a.py", "Python", src, "debug-statement"), [])

    def test_multiline_arguments_hanging_indent_not_deep_nesting(self):
        src = ("def f():\n"
               "    return do_something(\n"
               "        arg1,\n"
               "        arg2,\n"
               "        Finding(\n"
               "            nested_arg1,\n"
               "            nested_arg2,\n"
               "        ),\n"
               "    )\n")
        self.assertNotIn("deep-nesting", rules_of("a.py", "Python", src))

    def test_multiline_docstring_indent_not_deep_nesting(self):
        src = ("def f():\n"
               '    """\n'
               "        Some heavily indented documentation.\n"
               "            Even more indented example here.\n"
               '    """\n'
               "    return 1\n")
        self.assertNotIn("deep-nesting", rules_of("a.py", "Python", src))

    def test_backslash_continuation_not_deep_nesting(self):
        src = ("def f():\n"
               "    x = 1 + \\\n"
               "        2 + \\\n"
               "        3\n"
               "    return x\n")
        self.assertNotIn("deep-nesting", rules_of("a.py", "Python", src))

    def test_multiline_dict_or_list_not_deep_nesting(self):
        src = ("def f():\n"
               "    data = {\n"
               '        "key": [\n'
               '            {"nested": 1},\n'
               '            {"nested": 2},\n'
               "        ],\n"
               "    }\n"
               "    return data\n")
        self.assertNotIn("deep-nesting", rules_of("a.py", "Python", src))


class DuplicateBlockTests(unittest.TestCase):
    BLOCK = ("    connection = open_pooled_connection(host, port)\n"
             "    connection.set_timeout(default_timeout_seconds)\n"
             "    connection.authenticate(username, password)\n"
             "    response = connection.execute(query, parameters)\n"
             "    connection.commit_transaction()\n"
             "    connection.release_back_to_pool()\n")

    def test_real_duplicate_detected_once(self):
        src = f"def a():\n{self.BLOCK}    return 1\n\ndef b():\n{self.BLOCK}    return 2\n"
        self.assertEqual(len(findings_of("a.py", "Python", src, "duplicate-block")), 1)

    def test_duplicated_docstring_prose_not_flagged(self):
        prose = ('    """This is a long shared explanation sentence number one here today.\n'
                 '    This is a long shared explanation sentence number two here today now.\n'
                 '    This is a long shared explanation sentence number three here also too.\n'
                 '    This is a long shared explanation sentence number four here as well ok.\n'
                 '    This is a long shared explanation sentence number five here you know.\n'
                 '    This is a long shared explanation sentence number six here indeed yes."""\n')
        src = f"def a():\n{prose}    return 1\n\ndef b():\n{prose}    return 2\n"
        self.assertEqual(findings_of("a.py", "Python", src, "duplicate-block"), [])


if __name__ == "__main__":
    unittest.main()
