"""Locate function definitions and their spans.

Parsing every language properly is out of scope, so this uses pragmatic
heuristics: indentation for Python and brace-matching for C-style languages.
The brace matcher skips string literals and comments so that braces inside
them never throw the count off.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .languages import BRACE_LANGUAGES
from .text_utils import mask_comments_and_strings


@dataclass
class Function:
    name: str
    start_line: int  # 1-based
    end_line: int  # 1-based, inclusive
    param_count: int

    @property
    def length(self) -> int:
        return self.end_line - self.start_line + 1


# Words that look like function signatures but are really control flow.
_CONTROL_KEYWORDS = {
    "if", "for", "while", "switch", "catch", "do", "else", "return", "with",
    "function", "await", "typeof", "new", "case", "throw", "in", "of",
    "constructor", "super",
}

_PY_DEF = re.compile(r"^(?P<indent>[ \t]*)(?:async\s+)?def\s+(?P<name>\w+)\s*\(")

# Named function / method:  foo(...) {   or   function foo(...) {
_BRACE_NAMED = re.compile(
    r"(?:^|[^.\w$])(?:function\s+)?(?P<name>[A-Za-z_$][\w$]*)\s*"
    r"(?:<[^={};]*>)?\s*\((?P<params>[^{};]*)\)\s*"
    r"(?::\s*[\w$.<>\[\], ]+\s*)?\{"
)
# Arrow function assigned to a name:  const foo = (...) => {
_BRACE_ARROW = re.compile(
    r"(?:const|let|var)\s+(?P<name>[\w$]+)\s*(?::[^=]+)?=\s*(?:async\s+)?"
    r"\((?P<params>[^{};]*)\)\s*(?::[^=]+)?=>\s*\{"
)


def find_functions(language: str, text: str, lines: list[str]) -> list[Function]:
    """Return the functions defined in *text* for the given *language*."""
    if language == "Python":
        return _find_python_functions(lines)
    if language in BRACE_LANGUAGES:
        return _find_brace_functions(text)
    return []


def count_params(param_text: str) -> int:
    """Count parameters in a signature, ignoring nested brackets and ``self``."""
    param_text = param_text.strip()
    if not param_text:
        return 0
    depth = 0
    params: list[str] = []
    current = ""
    for char in param_text:
        if char in "([{<":
            depth += 1
        elif char in ")]}>":
            depth = max(0, depth - 1)
        if char == "," and depth == 0:
            params.append(current)
            current = ""
        else:
            current += char
    params.append(current)

    cleaned = [p.strip() for p in params if p.strip()]
    meaningful = [
        p for p in cleaned
        # Variadic / marker params don't count toward the "too many" smell:
        # *args, **kwargs (Python), ...rest (JS), and bare * or / markers.
        if not p.startswith(("*", "...", "/"))
        and p.split(":")[0].strip() not in ("self", "cls")
    ]
    return len(meaningful)


def _find_python_functions(lines: list[str]) -> list[Function]:
    functions: list[Function] = []
    for index, line in enumerate(lines):
        match = _PY_DEF.match(line)
        if not match:
            continue
        indent = len(match.group("indent").expandtabs(4))
        params = _read_python_params(lines, index)
        end = _python_body_end(lines, index, indent)
        functions.append(Function(match.group("name"), index + 1, end + 1, count_params(params)))
    return functions


def _read_python_params(lines: list[str], def_index: int) -> str:
    """Collect a def's parameter text, even when it spans several lines."""
    buffer = ""
    depth = 0
    started = False
    for line in lines[def_index:]:
        for char in line:
            if char == "(":
                depth += 1
                started = True
                if depth == 1:
                    continue
            elif char == ")":
                depth -= 1
                if depth == 0:
                    return buffer
            if started and depth >= 1:
                buffer += char
        buffer += " "
    return buffer


def _python_body_end(lines: list[str], def_index: int, def_indent: int) -> int:
    last = def_index
    for index in range(def_index + 1, len(lines)):
        line = lines[index]
        if not line.strip():
            continue
        indent = len(line[: len(line) - len(line.lstrip())].expandtabs(4))
        if indent <= def_indent:
            break
        last = index
    return last


def _find_brace_functions(text: str) -> list[Function]:
    # Match signatures and braces on a copy with comments and string literals
    # blanked out (same length, newlines preserved) so neither can be mistaken
    # for code — e.g. ``callback(err)`` inside a JSDoc block.
    masked = mask_comments_and_strings(text)
    functions: list[Function] = []
    line_starts = _line_start_offsets(masked)
    seen_starts: set[int] = set()
    text = masked

    for pattern in (_BRACE_NAMED, _BRACE_ARROW):
        for match in pattern.finditer(text):
            name = match.group("name")
            if name in _CONTROL_KEYWORDS:
                continue
            brace_index = text.find("{", match.start())
            if brace_index == -1:
                continue
            start_line = _line_of(line_starts, match.start("name"))
            if start_line in seen_starts:
                continue
            end_index = _match_brace(text, brace_index)
            if end_index is None:
                continue
            seen_starts.add(start_line)
            functions.append(
                Function(
                    name=name,
                    start_line=start_line,
                    end_line=_line_of(line_starts, end_index),
                    param_count=count_params(match.group("params")),
                )
            )
    functions.sort(key=lambda fn: fn.start_line)
    return functions


def _match_brace(text: str, open_index: int) -> int | None:
    """Return the index of the ``}`` matching the ``{`` at *open_index*.

    String literals and comments are skipped so their braces don't count.
    """
    depth = 0
    index = open_index
    length = len(text)
    while index < length:
        char = text[index]
        nxt = text[index + 1] if index + 1 < length else ""
        if char in "\"'`":
            index = _skip_string(text, index, char)
            continue
        if char == "/" and nxt == "/":
            index = text.find("\n", index)
            if index == -1:
                return None
            continue
        if char == "/" and nxt == "*":
            end = text.find("*/", index + 2)
            if end == -1:
                return None
            index = end + 2
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
        index += 1
    return None


def _skip_string(text: str, index: int, quote: str) -> int:
    index += 1
    length = len(text)
    while index < length:
        char = text[index]
        if char == "\\":
            index = min(index + 2, length)  # never step past EOF
            continue
        if char == quote:
            return index + 1
        index += 1
    return index


def _line_start_offsets(text: str) -> list[int]:
    offsets = [0]
    for index, char in enumerate(text):
        if char == "\n":
            offsets.append(index + 1)
    return offsets


def _line_of(line_starts: list[int], char_index: int) -> int:
    """Map a character offset to a 1-based line number (binary search)."""
    low, high = 0, len(line_starts) - 1
    while low < high:
        mid = (low + high + 1) // 2
        if line_starts[mid] <= char_index:
            low = mid
        else:
            high = mid - 1
    return low + 1
