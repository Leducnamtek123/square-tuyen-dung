"""Shared text utilities for masking comments and string literals.

Several rules and the function detector need to look at *code only* — ignoring
the contents of comments and strings (including Python docstrings and JS
template literals). Masking replaces those contents with spaces while preserving
length and newline positions, so character offsets and line numbers stay valid.
"""

from __future__ import annotations


def mask_comments_and_strings(text: str) -> str:
    """Return *text* with comment and string-literal contents blanked to spaces.

    Handles ``//`` and ``/* */`` comments and ``'`` / ``"`` / `` ` `` strings.
    Python triple-quoted strings fall out naturally as a run of single-quoted
    spans, so their prose is blanked too. Same length and newlines as the input.
    """
    out: list[str] = []
    index = 0
    length = len(text)
    while index < length:
        char = text[index]
        nxt = text[index + 1] if index + 1 < length else ""
        if char in "\"'`":
            index = _mask_string(text, index, char, out)
        elif char == "/" and nxt == "/":
            while index < length and text[index] != "\n":
                out.append(" ")
                index += 1
        elif char == "/" and nxt == "*":
            out.append("  ")
            index += 2
            while index < length and text[index:index + 2] != "*/":
                out.append("\n" if text[index] == "\n" else " ")
                index += 1
            if index < length:  # only consume the closing */ if it exists
                out.append("  ")
                index += 2
        else:
            out.append(char)
            index += 1
    return "".join(out)


def _mask_string(text: str, index: int, quote: str, out: list[str]) -> int:
    out.append(" ")
    index += 1
    length = len(text)
    while index < length:
        char = text[index]
        if char == "\\":
            # Consume the backslash and (if present) the char it escapes, one at
            # a time, so length is preserved and an escaped newline stays a
            # newline. A backslash at EOF consumes only itself.
            out.append(" ")
            index += 1
            if index < length:
                out.append("\n" if text[index] == "\n" else " ")
                index += 1
            continue
        if char == "\n":  # keep newlines for multi-line / template strings
            out.append("\n")
            index += 1
            continue
        out.append(" ")
        index += 1
        if char == quote:
            break
    return index
