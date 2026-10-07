"""Language detection and file-selection policy.

This module decides *which* files are worth analysing and *what language*
each file is written in. Keeping this knowledge in one place means the rules
engine never has to guess.
"""

from __future__ import annotations

import posixpath

# Map of file extension -> human-readable language name.
EXTENSION_TO_LANGUAGE: dict[str, str] = {
    ".py": "Python",
    ".js": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".java": "Java",
    ".kt": "Kotlin",
    ".swift": "Swift",
    ".go": "Go",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".c": "C",
    ".h": "C",
    ".cc": "C++",
    ".cpp": "C++",
    ".cxx": "C++",
    ".hpp": "C++",
    ".cs": "C#",
    ".scala": "Scala",
    ".dart": "Dart",
    ".vue": "Vue",
    ".svelte": "Svelte",
}

# Languages whose function bodies we know how to delimit. Function-level rules
# (length, parameter count) only run for these; line-level rules run for all.
BRACE_LANGUAGES = {
    "JavaScript", "TypeScript", "Java", "Kotlin", "Swift", "Go", "Rust",
    "PHP", "C", "C++", "C#", "Scala", "Dart",
}
FUNCTION_AWARE_LANGUAGES = BRACE_LANGUAGES | {"Python"}

# Comment markers per language, used by several rules.
LINE_COMMENT = {
    "Python": "#", "Ruby": "#",
    "JavaScript": "//", "TypeScript": "//", "Java": "//", "Kotlin": "//",
    "Swift": "//", "Go": "//", "Rust": "//", "PHP": "//", "C": "//",
    "C++": "//", "C#": "//", "Scala": "//", "Dart": "//", "Vue": "//",
    "Svelte": "//",
}

# Directory names that are vendored / generated / not the author's code.
SKIP_DIRECTORIES = {
    "node_modules", "vendor", "bower_components", "dist", "build", "out",
    "target", "bin", "obj", ".git", ".svn", ".hg", "__pycache__", ".venv",
    "venv", "env", ".tox", ".next", ".nuxt", ".cache", "coverage",
    "site-packages", "third_party", "thirdparty", "deps", ".idea", ".vscode",
    "migrations", "generated", "gen", "pods",
    # Illustrative / non-production code that follows looser conventions:
    "examples", "example", "demo", "demos", "sample", "samples",
    "benchmark", "benchmarks", "fixtures", "fixture",
}

# Filename substrings that mark generated or minified files.
SKIP_FILENAME_MARKERS = (".min.", ".bundle.", "-min.", ".map", ".lock")

# Hard limits to keep an analysis fast and within GitHub's rate limits.
MAX_FILES = 400
MAX_FILE_BYTES = 400_000


def language_for(path: str) -> str | None:
    """Return the language name for *path*, or ``None`` if not a code file."""
    _, ext = posixpath.splitext(path.lower())
    return EXTENSION_TO_LANGUAGE.get(ext)


def is_test_path(path: str) -> bool:
    """Heuristically decide whether *path* is a test file.

    Magic-number and a few other noisy rules are relaxed for tests, where
    literal values are expected and idiomatic.
    """
    lowered = path.lower()
    parts = lowered.split("/")
    if any(part in ("test", "tests", "__tests__", "spec", "specs") for part in parts):
        return True
    name = parts[-1]
    return (
        name in ("test.py", "tests.py", "test.js", "tests.js", "test.ts", "tests.ts")
        or name.startswith("test_")
        or name.endswith("_test.py")
        or ".test." in name
        or ".spec." in name
    )


def should_skip(path: str, size: int) -> bool:
    """Return ``True`` when *path* must be excluded from the analysis."""
    if size > MAX_FILE_BYTES:
        return True
    parts = path.lower().split("/")  # case-insensitive, like is_test_path
    if any(part in SKIP_DIRECTORIES for part in parts[:-1]):
        return True
    name = parts[-1]
    return any(marker in name for marker in SKIP_FILENAME_MARKERS)


def select_code_files(tree: list[dict], include_tests: bool = False) -> list[dict]:
    """Pick the analysable code files from a Git tree.

    *tree* is the raw list returned by :meth:`GitHubClient.get_tree`. Test files
    are excluded by default (their long blocks and repeated setup follow
    different conventions than production code). The result is sorted
    largest-first (bigger files tend to hide more issues) and capped at
    :data:`MAX_FILES`. Each returned item carries an extra ``language`` key.
    """
    selected: list[dict] = []
    for entry in tree:
        if entry.get("type") != "blob":
            continue
        path = entry["path"]
        size = entry.get("size", 0)
        if should_skip(path, size):
            continue
        if not include_tests and is_test_path(path):
            continue
        language = language_for(path)
        if language is None:
            continue
        selected.append({**entry, "language": language})

    selected.sort(key=lambda item: item.get("size", 0), reverse=True)
    return selected[:MAX_FILES]
