"""Turn a pile of findings into a score, a grade and a breakdown."""

from __future__ import annotations

from collections import Counter

from .rules import Finding, INFO, MAJOR, MINOR

# How much each severity subtracts, per 1000 lines of code.
SEVERITY_WEIGHT = {MAJOR: 6.0, MINOR: 2.0, INFO: 0.4}

GRADE_BANDS = ((90, "A"), (80, "B"), (70, "C"), (60, "D"), (0, "F"))


def grade_for(score: float) -> str:
    for threshold, letter in GRADE_BANDS:
        if score >= threshold:
            return letter
    return "F"


def compute_score(findings: list[Finding], total_loc: int) -> dict:
    """Compute the overall score and supporting breakdowns.

    The score is ``100`` minus a *penalty density* (weighted penalties per
    1000 lines), so a large clean repo isn't punished for its size and a tiny
    messy one isn't flattered by it.
    """
    penalty = sum(SEVERITY_WEIGHT[f.severity] for f in findings)
    kloc = max(total_loc, 1) / 1000
    density = penalty / kloc
    score = max(0, min(100, round(100 - density, 1)))

    by_severity = Counter(f.severity for f in findings)
    by_category = Counter(f.category for f in findings)
    by_rule = Counter(f.rule for f in findings)

    return {
        "score": score,
        "grade": grade_for(score),
        "penalty": round(penalty, 1),
        "by_severity": {
            "major": by_severity.get(MAJOR, 0),
            "minor": by_severity.get(MINOR, 0),
            "info": by_severity.get(INFO, 0),
        },
        "by_category": dict(by_category.most_common()),
        "by_rule": dict(by_rule.most_common()),
    }
