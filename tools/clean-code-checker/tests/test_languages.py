"""Tests for language detection and file-selection policy."""

import unittest

from cleancode.languages import (
    MAX_FILES,
    is_test_path,
    language_for,
    select_code_files,
    should_skip,
)


class LanguageForTests(unittest.TestCase):
    def test_known_extensions(self):
        self.assertEqual(language_for("src/app.py"), "Python")
        self.assertEqual(language_for("src/App.tsx"), "TypeScript")
        self.assertEqual(language_for("main.GO"), "Go")  # case-insensitive

    def test_unknown_extension(self):
        self.assertIsNone(language_for("README.md"))
        self.assertIsNone(language_for("data.json"))


class TestPathTests(unittest.TestCase):
    def test_detects_tests(self):
        for path in ["tests/test_x.py", "src/foo.test.js", "app/__tests__/a.ts", "spec/b_spec.rb"]:
            self.assertTrue(is_test_path(path), path)

    def test_non_tests(self):
        for path in ["src/app.py", "lib/contest.py", "src/latest.js"]:
            self.assertFalse(is_test_path(path), path)


class ShouldSkipTests(unittest.TestCase):
    def test_skips_vendor_dirs_case_insensitive(self):
        self.assertTrue(should_skip("Node_Modules/x.js", 100))
        self.assertTrue(should_skip("VENDOR/y.py", 100))
        self.assertTrue(should_skip("Pods/z.swift", 100))

    def test_skips_minified_case_insensitive(self):
        self.assertTrue(should_skip("app.MIN.js", 100))
        self.assertTrue(should_skip("bundle.BUNDLE.js", 100))

    def test_skips_oversized(self):
        self.assertTrue(should_skip("src/app.py", 10_000_000))

    def test_keeps_real_source(self):
        self.assertFalse(should_skip("src/app.py", 100))


class SelectCodeFilesTests(unittest.TestCase):
    def _tree(self, entries):
        return [{"type": "blob", "path": p, "size": s, "sha": "x"} for p, s in entries]

    def test_excludes_tests_by_default(self):
        tree = self._tree([("src/a.py", 100), ("tests/test_a.py", 100)])
        paths = [f["path"] for f in select_code_files(tree)]
        self.assertEqual(paths, ["src/a.py"])

    def test_includes_tests_when_requested(self):
        tree = self._tree([("src/a.py", 100), ("tests/test_a.py", 100)])
        paths = {f["path"] for f in select_code_files(tree, include_tests=True)}
        self.assertEqual(paths, {"src/a.py", "tests/test_a.py"})

    def test_adds_language_and_sorts_by_size(self):
        tree = self._tree([("small.py", 10), ("big.py", 999)])
        selected = select_code_files(tree)
        self.assertEqual(selected[0]["path"], "big.py")
        self.assertEqual(selected[0]["language"], "Python")

    def test_ignores_non_blobs_and_unknown_types(self):
        tree = [
            {"type": "tree", "path": "src", "size": 0},
            {"type": "blob", "path": "a.py", "size": 10},
            {"type": "blob", "path": "README.md", "size": 10},
        ]
        self.assertEqual([f["path"] for f in select_code_files(tree)], ["a.py"])

    def test_respects_max_files_cap(self):
        tree = self._tree([(f"f{i}.py", i + 1) for i in range(MAX_FILES + 50)])
        self.assertEqual(len(select_code_files(tree)), MAX_FILES)


if __name__ == "__main__":
    unittest.main()
