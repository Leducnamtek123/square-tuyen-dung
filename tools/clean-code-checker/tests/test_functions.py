"""Tests for function-boundary and parameter detection."""

import unittest

from cleancode.functions import count_params, find_functions


def fns(language, text):
    return find_functions(language, text, text.splitlines())


class ParamCountTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(count_params(""), 0)

    def test_simple(self):
        self.assertEqual(count_params("a, b, c"), 3)

    def test_ignores_self_and_cls(self):
        self.assertEqual(count_params("self, a, b"), 2)
        self.assertEqual(count_params("cls, a"), 1)

    def test_ignores_variadic(self):
        self.assertEqual(count_params("a, *args, **kwargs"), 1)
        self.assertEqual(count_params("a, ...rest"), 1)

    def test_nested_brackets_not_split(self):
        self.assertEqual(count_params("a: dict[str, int], b: list[int]"), 2)

    def test_defaults_with_commas_in_brackets(self):
        self.assertEqual(count_params("a=[1, 2, 3], b=4"), 2)


class PythonDetectionTests(unittest.TestCase):
    def test_detects_def_with_span(self):
        src = "def foo(a, b):\n    x = 1\n    return x\n"
        functions = fns("Python", src)
        self.assertEqual(len(functions), 1)
        fn = functions[0]
        self.assertEqual(fn.name, "foo")
        self.assertEqual(fn.start_line, 1)
        self.assertEqual(fn.end_line, 3)
        self.assertEqual(fn.param_count, 2)

    def test_multiline_signature(self):
        src = "def foo(\n    a,\n    b,\n    c,\n):\n    return a\n"
        functions = fns("Python", src)
        self.assertEqual(functions[0].param_count, 3)

    def test_method_indented(self):
        src = "class C:\n    def m(self, a):\n        return a\n\n    def n(self):\n        pass\n"
        functions = fns("Python", src)
        names = sorted(f.name for f in functions)
        self.assertEqual(names, ["m", "n"])

    def test_def_keyword_in_comment_not_detected(self):
        src = "# def fake(a, b):\nx = 1\n"
        self.assertEqual(fns("Python", src), [])


class BraceDetectionTests(unittest.TestCase):
    def test_named_function(self):
        src = "function add(a, b) {\n  return a + b;\n}\n"
        functions = fns("JavaScript", src)
        self.assertEqual(len(functions), 1)
        self.assertEqual(functions[0].name, "add")
        self.assertEqual(functions[0].param_count, 2)

    def test_arrow_function(self):
        src = "const mul = (a, b) => {\n  return a * b;\n};\n"
        functions = fns("JavaScript", src)
        self.assertEqual(len(functions), 1)
        self.assertEqual(functions[0].name, "mul")

    def test_signature_in_comment_not_detected(self):
        # The JSDoc false-positive that inflated express's long-function count.
        src = "/**\n * callback(err) is invoked\n */\nfunction real(a) {\n  return a;\n}\n"
        functions = fns("JavaScript", src)
        self.assertEqual([f.name for f in functions], ["real"])

    def test_control_flow_not_detected_as_function(self):
        src = "function f(x) {\n  if (x) { return 1; }\n  for (;;) { break; }\n}\n"
        self.assertEqual([f.name for f in fns("JavaScript", src)], ["f"])

    def test_unclosed_string_with_trailing_backslash_does_not_crash(self):
        # Exercises the _skip_string bounds guard via _match_brace.
        src = 'function f() {\n  var s = "oops\\\n}\n'
        # Should not raise; detection may simply find nothing.
        fns("JavaScript", src)


if __name__ == "__main__":
    unittest.main()
