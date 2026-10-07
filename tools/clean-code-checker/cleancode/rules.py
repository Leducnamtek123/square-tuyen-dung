"""The clean-code rule set.

Each rule inspects one file and yields :class:`Finding` objects. Rules are
deliberately small and independent so the set is easy to extend: add a function
that takes a :class:`FileContext` and append it to :data:`RULES`.
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from dataclasses import dataclass, field

from .functions import Function, find_functions
from .languages import BRACE_LANGUAGES, LINE_COMMENT, is_test_path
from .text_utils import mask_comments_and_strings

# Severities, ordered by how much they hurt the score.
MAJOR, MINOR, INFO = "major", "minor", "info"

# Thresholds. Tweaking these in one place re-tunes the whole checker.
LONG_LINE = 120
VERY_LONG_LINE = 200
LONG_FILE = 400
HUGE_FILE = 800
LONG_FUNCTION = 50
HUGE_FUNCTION = 100
MAX_PARAMS = 4
MANY_PARAMS = 7
MAX_NESTING = 4
DEEP_NESTING = 6
COMPLEXITY_WARN = 10
COMPLEXITY_HIGH = 20
DUPLICATE_BLOCK = 6  # lines

# Never report a single rule more than this many times per file; the rest are
# rolled into one summarising finding so reports stay readable.
MAX_PER_RULE = 12


@dataclass
class Finding:
    rule: str
    category: str
    severity: str
    line: int
    message: str


@dataclass
class FileContext:
    path: str
    language: str
    text: str
    lines: list[str] = field(default_factory=list)
    masked_lines: list[str] = field(default_factory=list)
    functions: list[Function] = field(default_factory=list)
    is_test: bool = False

    @classmethod
    def build(cls, path: str, language: str, text: str) -> "FileContext":
        lines = text.splitlines()
        return cls(
            path=path,
            language=language,
            text=text,
            lines=lines,
            masked_lines=mask_comments_and_strings(text).splitlines(),
            functions=find_functions(language, text, lines),
            is_test=is_test_path(path),
        )

    @property
    def comment_marker(self) -> str:
        return LINE_COMMENT.get(self.language, "#")

    def is_comment(self, line: str) -> bool:
        stripped = line.strip()
        return bool(stripped) and stripped.startswith(self.comment_marker)

    def code_at(self, number: int) -> str:
        """Return the masked code on 1-based line *number*, minus any trailing comment.

        String and ``//`` / ``/* */`` comment contents are already blanked in
        ``masked_lines``; this additionally drops a trailing ``#`` comment (the
        masker leaves those intact) so number/keyword rules never see comments.
        """
        if not 1 <= number <= len(self.masked_lines):
            return ""
        code = self.masked_lines[number - 1]
        position = code.find(self.comment_marker)
        return code[:position] if position != -1 else code


def _cap(rule: str, category: str, severity: str, findings: list[Finding]) -> list[Finding]:
    """Truncate an over-long finding list, leaving a count of the remainder."""
    if len(findings) <= MAX_PER_RULE:
        return findings
    kept = findings[:MAX_PER_RULE]
    extra = len(findings) - MAX_PER_RULE
    kept.append(Finding(rule, category, severity, findings[MAX_PER_RULE].line,
                        f"...and {extra} more occurrence(s) in this file."))
    return kept


# --------------------------------------------------------------------------
# Rules
# --------------------------------------------------------------------------

def rule_long_functions(ctx: FileContext) -> Iterator[Finding]:
    for fn in ctx.functions:
        if fn.length > HUGE_FUNCTION:
            yield Finding("long-function", "Function size", MAJOR, fn.start_line,
                          f"Function '{fn.name}' is {fn.length} lines long "
                          f"(keep functions under {LONG_FUNCTION}).")
        elif fn.length > LONG_FUNCTION:
            yield Finding("long-function", "Function size", MINOR, fn.start_line,
                          f"Function '{fn.name}' is {fn.length} lines long "
                          f"(aim for under {LONG_FUNCTION}).")


def rule_too_many_params(ctx: FileContext) -> Iterator[Finding]:
    for fn in ctx.functions:
        if fn.param_count > MANY_PARAMS:
            yield Finding("too-many-params", "Function size", MAJOR, fn.start_line,
                          f"Function '{fn.name}' takes {fn.param_count} parameters "
                          f"(more than {MAX_PARAMS} hurts readability; consider an object).")
        elif fn.param_count > MAX_PARAMS:
            yield Finding("too-many-params", "Function size", MINOR, fn.start_line,
                          f"Function '{fn.name}' takes {fn.param_count} parameters "
                          f"(prefer {MAX_PARAMS} or fewer).")


def rule_long_file(ctx: FileContext) -> Iterator[Finding]:
    count = len(ctx.lines)
    if count > HUGE_FILE:
        yield Finding("long-file", "File size", MAJOR, 1,
                      f"File has {count} lines (over {HUGE_FILE}); split it into modules.")
    elif count > LONG_FILE:
        yield Finding("long-file", "File size", MINOR, 1,
                      f"File has {count} lines (aim for under {LONG_FILE}).")


def rule_long_lines(ctx: FileContext) -> Iterator[Finding]:
    found: list[Finding] = []
    for number, line in enumerate(ctx.lines, start=1):
        width = len(line.expandtabs(4))
        if width > VERY_LONG_LINE:
            found.append(Finding("long-line", "Formatting", MINOR, number,
                                 f"Line is {width} characters wide (over {VERY_LONG_LINE})."))
        elif width > LONG_LINE:
            found.append(Finding("long-line", "Formatting", INFO, number,
                                 f"Line is {width} characters wide (over {LONG_LINE})."))
    yield from _cap("long-line", "Formatting", INFO, found)


def rule_deep_nesting(ctx: FileContext) -> Iterator[Finding]:
    """Flag control-flow nested too deeply *inside a function*.

    Depth is measured relative to the function body, so a method's ``class`` and
    ``def`` indentation don't count — only nested ``if``/``for``/``while`` blocks
    do. At most one finding per function (its worst spot) keeps reports readable.
    """
    unit = _detect_indent_unit(ctx.masked_lines)
    spans = _nesting_spans(ctx, unit)
    track_braces = ctx.language not in BRACE_LANGUAGES
    for base_indent, start, end in spans:
        worst_depth, worst_line = 0, start
        open_brackets = 0
        preceding_backslash = False
        for number in range(start, end + 1):
            line = ctx.lines[number - 1]
            if not line.strip() or ctx.is_comment(line):
                continue
            if number - 1 < len(ctx.masked_lines) and ctx.masked_lines[number - 1].strip() == "":
                continue

            is_continuation = open_brackets > 0 or preceding_backslash
            if not is_continuation:
                indent = _indent_width(line)
                depth = (indent - base_indent) // unit - 1  # direct body == 0
                if depth > worst_depth:
                    worst_depth, worst_line = depth, number

            code = ctx.code_at(number)
            for ch in code:
                if ch in ("(", "[") or (track_braces and ch == "{"):
                    open_brackets += 1
                elif (ch in (")", "]") or (track_braces and ch == "}")) and open_brackets > 0:
                    open_brackets -= 1
            preceding_backslash = code.rstrip().endswith("\\")

        if worst_depth >= DEEP_NESTING:
            yield Finding("deep-nesting", "Complexity", MAJOR, worst_line,
                          f"Logic nested {worst_depth} levels deep "
                          f"(over {MAX_NESTING}); extract a function or return early.")
        elif worst_depth >= MAX_NESTING:
            yield Finding("deep-nesting", "Complexity", MINOR, worst_line,
                          f"Logic nested {worst_depth} levels deep (aim for {MAX_NESTING}).")


_BRANCH = re.compile(r"\b(if|elif|else if|for|while|case|catch|except)\b|&&|\|\||(?<![<>=!])\?(?!\.)")


def rule_high_complexity(ctx: FileContext) -> Iterator[Finding]:
    for fn in ctx.functions:
        # Masked lines so branch keywords in comments/strings are not counted.
        body = "\n".join(ctx.masked_lines[fn.start_line - 1: fn.end_line])
        branches = len(_BRANCH.findall(body))
        if branches > COMPLEXITY_HIGH:
            yield Finding("high-complexity", "Complexity", MAJOR, fn.start_line,
                          f"Function '{fn.name}' has ~{branches} branches "
                          f"(very high; break it apart).")
        elif branches > COMPLEXITY_WARN:
            yield Finding("high-complexity", "Complexity", MINOR, fn.start_line,
                          f"Function '{fn.name}' has ~{branches} branches "
                          f"(high cyclomatic complexity).")


_NUMBER = re.compile(r"(?<![\w.])-?\d+(?:\.\d+)?(?![\w.])")
_ALLOWED_NUMBERS = {"0", "1", "2", "-1", "100", "1000"}


def rule_magic_numbers(ctx: FileContext) -> Iterator[Finding]:
    """Flag *repeated* unnamed numeric literals.

    A single literal is usually harmless; the real "extract a constant" smell is
    the *same* magic number appearing several times, so we only report numbers
    that show up on three or more lines.
    """
    if ctx.is_test:
        return
    occurrences: dict[str, list[int]] = {}
    for number in range(1, len(ctx.lines) + 1):
        code = ctx.code_at(number)
        left = code.split("=")[0].strip() if "=" in code else ""
        if left.isupper() and left:
            continue  # assignment to a named constant
        for token in set(_NUMBER.findall(code)):
            if token in _ALLOWED_NUMBERS:
                continue
            occurrences.setdefault(token, []).append(number)

    found = [
        Finding("magic-number", "Maintainability", INFO, lines[0],
                f"Magic number {token!r} appears on {len(lines)} lines; name it as a constant.")
        for token, lines in occurrences.items()
        if len(lines) >= 3
    ]
    found.sort(key=lambda f: f.line)
    yield from _cap("magic-number", "Maintainability", INFO, found)


def rule_todo_comments(ctx: FileContext) -> Iterator[Finding]:
    pattern = re.compile(r"\b(TODO|FIXME|HACK|XXX|BUG)\b")
    found: list[Finding] = []
    for number, line in enumerate(ctx.lines, start=1):
        match = pattern.search(line)
        if match:
            found.append(Finding("todo-comment", "Comments", INFO, number,
                                 f"Leftover {match.group(1)} marker; resolve or track it."))
    yield from _cap("todo-comment", "Comments", INFO, found)


_DEBUG = {
    "JavaScript": re.compile(r"\bconsole\.(log|debug|info)\b|\bdebugger\b"),
    "TypeScript": re.compile(r"\bconsole\.(log|debug|info)\b|\bdebugger\b"),
    "Python": re.compile(r"(?<![\w.])print\s*\("),
    "Go": re.compile(r"\bfmt\.Print(ln|f)?\b"),
    "Ruby": re.compile(r"(?<![\w.])puts\s|(?<![\w.])p\s"),
}


def rule_debug_statements(ctx: FileContext) -> Iterator[Finding]:
    if ctx.is_test:
        return
    pattern = _DEBUG.get(ctx.language)
    if pattern is None:
        return
    found: list[Finding] = []
    for number in range(1, len(ctx.lines) + 1):
        if pattern.search(ctx.code_at(number)):
            found.append(Finding("debug-statement", "Maintainability", INFO, number,
                                 "Debug print/log left in code; remove or use a logger."))
    yield from _cap("debug-statement", "Maintainability", INFO, found)


def rule_trailing_whitespace(ctx: FileContext) -> Iterator[Finding]:
    found: list[Finding] = []
    for number, line in enumerate(ctx.lines, start=1):
        if line != line.rstrip():
            found.append(Finding("trailing-whitespace", "Formatting", INFO, number,
                                 "Trailing whitespace."))
    yield from _cap("trailing-whitespace", "Formatting", INFO, found)


_CODE_LIKE = re.compile(r"[;{}]\s*$|^\s*(if|for|while|return|def|function|var|let|const|public|private)\b")


def rule_commented_out_code(ctx: FileContext) -> Iterator[Finding]:
    marker = ctx.comment_marker
    found: list[Finding] = []
    for number, line in enumerate(ctx.lines, start=1):
        stripped = line.strip()
        if not stripped.startswith(marker):
            continue
        body = stripped[len(marker):].strip()
        if len(body) > 4 and _CODE_LIKE.search(body):
            found.append(Finding("commented-code", "Comments", INFO, number,
                                 "Looks like commented-out code; delete it (git remembers)."))
    yield from _cap("commented-code", "Comments", INFO, found)


def rule_duplicate_blocks(ctx: FileContext) -> Iterator[Finding]:
    # Work on masked lines so duplicated docstrings/comments/strings don't count
    # as duplicated *code*.
    normalised = [line.strip() for line in ctx.masked_lines]
    seen: dict[str, int] = {}
    found: list[Finding] = []
    next_allowed = 0  # skip windows overlapping an already-reported duplicate
    for start in range(len(normalised) - DUPLICATE_BLOCK + 1):
        window = normalised[start: start + DUPLICATE_BLOCK]
        if not _is_substantial_block(window):
            continue
        key = "\n".join(window)
        if key in seen and start >= next_allowed:
            next_allowed = start + DUPLICATE_BLOCK
            found.append(Finding("duplicate-block", "Maintainability", MAJOR, start + 1,
                                 f"This {DUPLICATE_BLOCK}-line block also appears at "
                                 f"line {seen[key] + 1}; extract a shared function."))
        seen.setdefault(key, start)
    yield from _cap("duplicate-block", "Maintainability", MAJOR, found)


def _is_substantial_block(window: list[str]) -> bool:
    """A block only counts as real duplication if it carries real code.

    Filters out coincidental matches: blank padding, lines that are just
    brackets/punctuation, and repeated import groups.
    """
    if any(not line for line in window):
        return False
    if any(line.startswith(("import ", "from ", "#", "//", "*", "}")) for line in window):
        return False
    meaty = [line for line in window if sum(ch.isalnum() for ch in line) >= 6]
    if len(meaty) < DUPLICATE_BLOCK - 1:
        return False
    total_alnum = sum(ch.isalnum() for line in window for ch in line)
    return total_alnum >= 80


RULES = (
    rule_long_functions,
    rule_too_many_params,
    rule_long_file,
    rule_long_lines,
    rule_deep_nesting,
    rule_high_complexity,
    rule_magic_numbers,
    rule_todo_comments,
    rule_debug_statements,
    rule_trailing_whitespace,
    rule_commented_out_code,
    rule_duplicate_blocks,
)


def analyze_file(path: str, language: str, text: str) -> list[Finding]:
    """Run every rule against one file and return all findings, sorted by line."""
    ctx = FileContext.build(path, language, text)
    findings: list[Finding] = []
    for rule in RULES:
        findings.extend(rule(ctx))
    findings.sort(key=lambda f: (f.line, f.rule))
    return findings


# --------------------------------------------------------------------------
# Small shared helpers
# --------------------------------------------------------------------------

def _indent_width(line: str) -> int:
    """Width of a line's leading whitespace, with tabs expanded to 4."""
    return len(line[: len(line) - len(line.lstrip())].expandtabs(4))


def _nesting_spans(ctx: FileContext, unit: int) -> list[tuple[int, int, int]]:
    """Return ``(base_indent, start_line, end_line)`` regions to measure nesting in.

    Each function is its own region (so class/def indentation is the baseline).
    Languages without function detection fall back to the whole file.
    """
    if ctx.functions:
        return [
            (_indent_width(ctx.lines[fn.start_line - 1]), fn.start_line, fn.end_line)
            for fn in ctx.functions
        ]
    return [(-unit, 1, len(ctx.lines))]


def _detect_indent_unit(lines: list[str]) -> int:
    """Guess the indentation step (2 or 4 spaces) used by a file."""
    counts: dict[int, int] = {}
    for line in lines:
        stripped = line.lstrip()
        if not stripped:
            continue
        indent = len(line[: len(line) - len(stripped)].expandtabs(4))
        if indent:
            counts[indent] = counts.get(indent, 0) + 1
    if not counts:
        return 4
    smallest = min(counts)
    return smallest if smallest in (2, 3, 4, 8) else 4
