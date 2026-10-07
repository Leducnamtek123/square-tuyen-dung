"""Tests for scoring and grading."""

import unittest

from cleancode.rules import Finding
from cleancode.scoring import compute_score, grade_for


def finding(severity):
    return Finding("r", "Category", severity, 1, "msg")


class GradeForTests(unittest.TestCase):
    def test_bands(self):
        self.assertEqual(grade_for(95), "A")
        self.assertEqual(grade_for(90), "A")
        self.assertEqual(grade_for(85), "B")
        self.assertEqual(grade_for(72), "C")
        self.assertEqual(grade_for(61), "D")
        self.assertEqual(grade_for(40), "F")
        self.assertEqual(grade_for(0), "F")


class ComputeScoreTests(unittest.TestCase):
    def test_clean_repo_scores_100(self):
        result = compute_score([], 1000)
        self.assertEqual(result["score"], 100)
        self.assertEqual(result["grade"], "A")

    def test_zero_loc_does_not_divide_by_zero(self):
        result = compute_score([finding("major")], 0)
        self.assertIsInstance(result["score"], (int, float))
        self.assertGreaterEqual(result["score"], 0)

    def test_score_is_clamped_to_zero(self):
        findings = [finding("major") for _ in range(100)]
        result = compute_score(findings, 100)  # huge penalty density
        self.assertEqual(result["score"], 0)
        self.assertEqual(result["grade"], "F")

    def test_severity_breakdown(self):
        findings = [finding("major"), finding("minor"), finding("minor"), finding("info")]
        result = compute_score(findings, 10_000)
        self.assertEqual(result["by_severity"], {"major": 1, "minor": 2, "info": 1})

    def test_density_is_size_neutral(self):
        # The same findings-per-KLOC should yield the same score at any size.
        small = compute_score([finding("minor")] * 5, 1000)
        large = compute_score([finding("minor")] * 50, 10_000)
        self.assertEqual(small["score"], large["score"])


if __name__ == "__main__":
    unittest.main()
