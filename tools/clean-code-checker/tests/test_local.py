"""Unit tests for local directory scanning in cleancode.local."""

import os
import shutil
import tempfile
import unittest

from cleancode import analyze_local


class AnalyzeLocalTests(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="cleancode_test_")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def _write_file(self, rel_path: str, content: str) -> str:
        full_path = os.path.join(self.test_dir, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        return full_path

    def test_analyze_local_basic(self):
        self._write_file("main.py", "def add(a: int, b: int) -> int:\n    return a + b\n")
        self._write_file("util.py", "def mul(x: int, y: int) -> int:\n    return x * y\n")
        self._write_file("nested/app.js", "function greet(name) {\n    return 'Hello ' + name;\n}\n")

        report = analyze_local(self.test_dir)

        self.assertIn("repo", report)
        self.assertIn("stats", report)
        self.assertIn("summary", report)
        self.assertIn("files", report)

        repo = report["repo"]
        self.assertEqual(repo["owner"], "local")
        self.assertEqual(repo["name"], os.path.basename(os.path.abspath(self.test_dir)))
        self.assertEqual(repo["full_name"], os.path.abspath(self.test_dir))
        self.assertEqual(repo["default_branch"], "local")

        stats = report["stats"]
        self.assertEqual(stats["files_analyzed"], 3)
        self.assertGreater(stats["total_loc"], 0)
        self.assertIn("Python", stats["languages"])
        self.assertIn("JavaScript", stats["languages"])

        summary = report["summary"]
        self.assertGreaterEqual(summary["score"], 90)
        self.assertEqual(summary["grade"], "A")

    def test_skip_directories_and_hidden_files(self):
        self._write_file("valid.py", "x = 1\n")
        self._write_file(".hidden/secret.py", "y = 2\n")
        self._write_file(".hidden_file.py", "z = 3\n")
        self._write_file("node_modules/package.js", "var a = 1;\n")
        self._write_file("__pycache__/cached.py", "var b = 1;\n")
        self._write_file("dist/bundle.js", "var c = 1;\n")

        report = analyze_local(self.test_dir)
        self.assertEqual(report["stats"]["files_analyzed"], 1)
        self.assertEqual(report["files"][0]["path"] if report["files"] else "valid.py", "valid.py")

    def test_include_tests_flag(self):
        self._write_file("app.py", "def run():\n    return 42\n")
        self._write_file("tests/test_app.py", "def test_run():\n    assert True\n")
        self._write_file("test_calc.py", "def test_add():\n    assert True\n")

        report_no_tests = analyze_local(self.test_dir, include_tests=False)
        self.assertEqual(report_no_tests["stats"]["files_analyzed"], 1)

        report_with_tests = analyze_local(self.test_dir, include_tests=True)
        self.assertEqual(report_with_tests["stats"]["files_analyzed"], 3)

    def test_empty_directory(self):
        report = analyze_local(self.test_dir)
        self.assertEqual(report["stats"]["files_analyzed"], 0)
        self.assertEqual(report["stats"]["total_loc"], 0)
        self.assertEqual(report["summary"]["score"], 100)
        self.assertEqual(report["summary"]["grade"], "A")
        self.assertEqual(report["files"], [])

    def test_nonexistent_directory_raises(self):
        non_existent = os.path.join(self.test_dir, "does_not_exist")
        with self.assertRaises(FileNotFoundError):
            analyze_local(non_existent)

    def test_path_is_file_raises_not_a_directory(self):
        file_path = self._write_file("file.py", "x = 1\n")
        with self.assertRaises(NotADirectoryError):
            analyze_local(file_path)

    def test_binary_file_skipped(self):
        self._write_file("clean.py", "x = 1\n")
        bin_path = os.path.join(self.test_dir, "binary.py")
        with open(bin_path, "wb") as f:
            f.write(b"x = 1\x00\x01\x02\n")

        report = analyze_local(self.test_dir)
        self.assertEqual(report["stats"]["files_analyzed"], 1)

    def test_max_files_cap(self):
        for i in range(10):
            self._write_file(f"file_{i}.py", f"x{i} = {i}\n")

        report = analyze_local(self.test_dir, max_files=4)
        self.assertEqual(report["stats"]["files_analyzed"], 4)


if __name__ == "__main__":
    unittest.main()
