# 🧼 Clean Code Checker

**[View the project site](https://sadeqisaidmohaddes-star.github.io/clean-code-checker/)**

A small web app that analyses any **GitHub repository** for clean-code issues and
gives it a score and a letter grade. Point it at a repo, get a report listing the
exact files and lines worth fixing.

It uses the **GitHub REST API** to read the code (no `git clone` needed) and is
written in **pure Python 3** — no `pip install`, no third-party dependencies.

## Run it

```bash
cd "clean-code-checker"
python app.py
```

Then open <http://localhost:8000> (it tries to open your browser automatically).

Paste a repository URL — `https://github.com/owner/repo` or just `owner/repo` —
and click **Analyze**.

> Want to use a different port or skip the auto-open browser?
> `PORT=9000 python app.py --no-browser`

## What it checks

| Category        | Rules |
|-----------------|-------|
| Function size   | Long functions, too many parameters |
| File size       | Oversized files that should be split |
| Complexity      | Deep nesting, high cyclomatic complexity |
| Formatting      | Over-long lines, trailing whitespace |
| Comments        | `TODO`/`FIXME` markers, commented-out code |
| Maintainability | Magic numbers, leftover debug prints/logs, duplicated blocks |

Each finding is rated **major / minor / info**. The overall score is `100` minus a
*penalty density* (weighted findings per 1,000 lines), so a big clean repo isn't
punished for its size and a tiny messy one isn't flattered by it.

You can **download** any report as Markdown or JSON from the buttons above the
results.

Function-level checks (length, parameters, complexity) run for languages whose
function bodies the tool can delimit — Python and the C-family / brace languages
(JavaScript, TypeScript, Java, Go, Rust, C#, …). Line-level checks run for every
supported source file.

## Private repos & rate limits

Unauthenticated GitHub API access is limited to 60 requests/hour. The tool keeps
its API usage tiny (file contents come from the raw CDN), but for **private repos**
or **heavy use**, expand *“Add a token”* in the UI and paste a
[personal access token](https://github.com/settings/tokens). The browser sends
the token to the local server in an `Authorization` header, never in the URL.
It is kept only in memory, forwarded to GitHub, and never stored.

## Project layout

```
app.py                 # stdlib HTTP server + routing
cleancode/
  analyzer.py          # orchestration: fetch → scan → score
  github.py            # tiny GitHub REST client
  languages.py         # language detection & file selection
  functions.py         # function-boundary detection
  rules.py             # the clean-code rule set
  scoring.py           # score, grade & breakdowns
  text_utils.py        # comment/string masker
web/                   # single-page front end (HTML/CSS/JS)
tests/                 # stdlib unittest suite (no dependencies)
```

## Tests

The suite uses only the standard library:

```bash
cd "clean-code-checker"
python -m unittest discover -s tests -t .
```

It covers the rule engine, the masker's length-preservation invariant
(including randomized inputs), function detection, scoring, file selection, and
GitHub URL/error handling — with regression tests for every bug found in review.

### Adding a rule

Write a function in `cleancode/rules.py` that takes a `FileContext` and yields
`Finding` objects, then add it to the `RULES` tuple. That's it. (Add a test in
`tests/test_rules.py` while you're there.)
