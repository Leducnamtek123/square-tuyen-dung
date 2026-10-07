# CLAUDE.md — Clean Code Checker

Guidance for Claude Code (and humans) working in this project. Read this first.

---

## 1. What this is

A **web app that scores any GitHub repository for clean-code quality**. You paste
a repo URL, it pulls the source via the GitHub API, runs a set of clean-code
rules, and renders a graded report (A–F) listing the exact files and lines worth
fixing. Reports can be exported as Markdown or JSON.

It is intentionally **zero-dependency**: pure Python 3 standard library on the
back end, vanilla HTML/CSS/JS on the front end. No `pip install`, no `npm install`,
no build step.

---

## 2. Goals & design principles

1. **Zero friction** — `python app.py` and it runs. No dependencies to install,
   no toolchain to configure. Keep it that way; do not add third-party packages
   without a very strong reason.
2. **High signal, low noise** — a developer should trust every finding. Rules are
   tuned to avoid false positives even at the cost of missing some true ones.
   When adding/changing a rule, re-check calibration (§8) before committing.
3. **Size-neutral scoring** — score is a *penalty density* (per 1,000 lines), so a
   large clean repo isn't punished for its size and a tiny messy one isn't
   flattered. See §6.
4. **Language-aware where it matters** — function-level rules only run for
   languages whose function bodies we can delimit; line-level rules run for all.
5. **Fast & rate-limit-friendly** — file contents come from the raw CDN (unmetered),
   so a full analysis costs only ~2 GitHub API calls. Files are fetched
   concurrently.
6. **The tool should pass its own bar** — the codebase is itself written to be
   clean and is fully tested. Keep it exemplary.

---

## 3. Running & testing

```bash
cd "clean-code-checker"

# Run the web app (opens browser; serves on http://localhost:8000)
python app.py

# Options
PORT=9000 python app.py --no-browser     # custom port, no auto-open

# Run the test suite (stdlib unittest, no dependencies)
python -m unittest discover -s tests -t .
```

In this workspace the app is also registered in `../.claude/launch.json` as
`clean-code-checker` (port 8000) for the preview tooling.

**Verifying changes:** the GitHub API allows only 60 unauthenticated requests/hour.
Heavy iterative testing exhausts it (the UI then shows the rate-limit message —
which is correct behavior). To verify the analysis logic without burning the
quota, call `cleancode.rules.analyze_file(path, language, text)` directly on
in-memory fixtures, or run the unit tests (no network). Use a token for live runs.

---

## 4. Project structure

```
app.py                 # stdlib HTTP server + routing (GET / and /api/analyze)
cleancode/
  __init__.py          # public API: analyze_repo, GitHubError, __version__
  analyzer.py          # orchestration: resolve repo → list files → fetch → scan → score
  github.py            # tiny GitHub REST client (parse_repo, tree, file contents)
  languages.py         # extension→language map, file-selection & skip policy
  functions.py         # function-boundary & parameter detection
  rules.py             # the rule engine: FileContext + RULES + analyze_file
  scoring.py           # SEVERITY_WEIGHT, compute_score, grade_for
  text_utils.py        # mask_comments_and_strings (the shared masker)
web/
  index.html           # single-page UI
  style.css            # dark theme
  app.js               # fetch + render + Markdown/JSON export
tests/                 # unittest suite (one module per source module)
README.md              # user-facing readme
CLAUDE.md              # this file
```

### Data flow

```
app.js  ──GET /api/analyze?repo= + Bearer header──▶  app.py
app.py  ──analyze_repo(reference, token)──────────▶  [analyzer.py]
  parse_repo ▶ get_repo_info ▶ get_tree            [github.py]
  select_code_files (skip vendored/tests, cap)     [languages.py]
  ThreadPoolExecutor: fetch_content + analyze_file [github.py + rules.py]
    FileContext.build → masked_lines + functions   [text_utils.py + functions.py]
    each rule in RULES yields Finding objects       [rules.py]
  compute_score (penalty density → grade)          [scoring.py]
  ◀── JSON report (repo, stats, summary, files) ──  rendered by app.js
```

---

## 5. The rule set (12 rules)

Defined in `cleancode/rules.py` as the `RULES` tuple. Each takes a `FileContext`
and yields `Finding(rule, category, severity, line, message)`. Severities are
`major` / `minor` / `info`. Per-file output is capped at `MAX_PER_RULE` (12).

| Rule | Category | Notes / thresholds |
|------|----------|--------------------|
| `long-function` | Function size | >50 lines minor, >100 major (function-aware langs) |
| `too-many-params` | Function size | >4 minor, >7 major (excludes `self`/`cls`/variadic) |
| `long-file` | File size | >400 lines minor, >800 major |
| `long-line` | Formatting | >120 chars info, >200 minor (tabs expand to 4) |
| `deep-nesting` | Complexity | nesting depth *within a function*; ≥4 minor, ≥6 major |
| `high-complexity` | Complexity | ~branch count per function; >10 minor, >20 major |
| `magic-number` | Maintainability | only numbers repeated on **3+ lines** (info) |
| `todo-comment` | Comments | TODO/FIXME/HACK/XXX/BUG (info) |
| `commented-code` | Comments | comment lines that look like code (info) |
| `debug-statement` | Maintainability | `console.log`/`print(`/etc. (info) |
| `trailing-whitespace` | Formatting | (info) |
| `duplicate-block` | Maintainability | 6+ identical substantial code lines (major) |

**Critical invariant — always analyse code, never comments/strings.** Number/keyword
rules must read from `ctx.code_at(n)` or `ctx.masked_lines`, NOT `ctx.lines`.
`masked_lines` is produced by `mask_comments_and_strings`, which blanks the
*contents* of comments and string literals while preserving length and newline
positions (so it stays index-aligned with `ctx.lines`). Reading raw lines
re-introduces the false positives that were specifically fixed (numbers inside
strings, branch keywords inside comments). The masker handles escaped quotes,
triple-quoted/template strings, and unterminated comments/strings at EOF — there
are randomized invariant tests for this in `tests/test_masker.py`; keep them green.

---

## 6. Scoring model (`scoring.py`)

- `SEVERITY_WEIGHT = {major: 6.0, minor: 2.0, info: 0.4}` — **single source of
  truth**. `analyzer._weight` imports this; never re-hardcode it.
- `penalty = Σ weight(finding)`; `density = penalty / (LOC / 1000)`.
- `score = clamp(0, 100, round(100 - density, 1))`.
- Grades: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, else F.

LOC counts non-blank lines only.

---

## 7. File selection & limits (`languages.py`, `analyzer.py`)

- **Excluded by default:** test files (`is_test_path`), and vendored/generated/
  illustrative directories (`node_modules`, `dist`, `vendor`, `examples`,
  `benchmarks`, `fixtures`, …). All matching is **case-insensitive**.
- Minified/bundled/lockfiles skipped via filename markers (`.min.`, `.bundle.`, …).
- `MAX_FILES = 400` (largest-first), `MAX_FILE_BYTES = 400_000`, `MAX_WORKERS = 8`,
  `TOP_FILES = 15` (only the worst files appear in the report `files` list).
- Supported languages: Python, JavaScript, TypeScript, Java, Kotlin, Swift, Go,
  Rust, Ruby, PHP, C, C++, C#, Scala, Dart, Vue, Svelte. Function-level rules run
  for Python + the brace languages (`FUNCTION_AWARE_LANGUAGES`).

---

## 8. Calibration (do not regress)

Reference grades for well-known repos (clean code should land high; param-heavy
or oversized code lower):

| Repo | Expected |
|------|----------|
| `sindresorhus/slugify` | A (~95) |
| `psf/requests` · `expressjs/express` · `pallets/flask` | B (~83–85) |
| `pallets/click` | C (~77) |

After changing any rule, threshold, or weight, re-run these and confirm the
spread still holds. A change that pushes a well-regarded repo to D/F is almost
certainly over-firing.

---

## 9. Conventions for changes

- **Add a rule:** write `rule_x(ctx: FileContext) -> Iterator[Finding]` in
  `rules.py`, append it to `RULES`, use `ctx.code_at`/`ctx.masked_lines` (not raw
  lines) for any number/keyword scan, cap noisy output with `_cap(...)`, and add a
  test in `tests/test_rules.py` (fires + does-not-fire + any regression case).
- **Network failures must degrade gracefully** — a single file that fails to fetch
  or parse is skipped (see `_scan_one` / `_scan_files`); never let one file abort
  the whole run. Translate GitHub errors to `GitHubError` with a user-facing message.
- **Never leak stack traces to the HTTP client** (`app.py` catches and returns a
  generic 500; details go to stderr).
- **Keep it dependency-free.** If you think you need a package, reconsider.
- **Run the tests** before declaring done: `python -m unittest discover -s tests -t .`

---

## 10. Roadmap

Near-term, high-value (roughly in priority order):

- [ ] **Token via env var** — read `GITHUB_TOKEN` as a fallback so heavy/local use
      isn't capped at 60 req/hr without typing a token each time.
- [ ] **Result caching** — cache reports per `(repo, default-branch SHA)` to avoid
      re-analysing unchanged repos and to soften the rate limit.
- [ ] **More rules** (low-noise only): mixed tabs/spaces in one file, bare
      `except:` / swallowed errors, over-long parameter lines, empty `catch`/`except`.
- [ ] **Config file** — let a repo or the user override thresholds/weights
      (`.cleancoderc` style) instead of editing `rules.py`.
- [ ] **Per-file score & sortable report** — show a score per file and let the UI
      sort/filter by severity, rule, or path.

Later / larger:

- [ ] **CLI** sharing the `cleancode` core (`clean-check <repo> [--json]`) for CI.
- [ ] **Function-level detection for more languages** (Ruby, Vue, Svelte).
- [ ] **Score badge** generation (SVG) for READMEs.
- [ ] **Trend tracking** — store historical scores to show whether a repo is
      getting cleaner over time.
- [ ] **Local-path mode** — analyse a folder on disk, not just GitHub.

When you pick up a roadmap item, check the box and add tests.

---

## 11. Known constraints

- **Rate limit:** 60 GitHub API requests/hour unauthenticated (5,000 with a token).
  The tool spends ~2 per analysis; file contents are free via the raw CDN.
- **Heuristic parsing:** function detection is regex/indentation-based, not a real
  parser. It is deliberately conservative; exotic syntax may be missed rather than
  mis-reported. This is an accepted trade-off for staying dependency-free.
- **Truncated trees:** very large repos return a truncated file tree from GitHub;
  the tool analyses what it received.
