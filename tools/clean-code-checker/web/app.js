"use strict";

const form = document.getElementById("analyze-form");
const repoInput = document.getElementById("repo");
const repoLabel = document.getElementById("repo-label");
const tokenInput = document.getElementById("token");
const tokenAccordion = document.getElementById("token-accordion");
const button = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const reportEl = document.getElementById("report");
const modeTabs = document.querySelectorAll(".mode-tab");
const examplesGithub = document.getElementById("examples-github");
const examplesLocal = document.getElementById("examples-local");

const SEVERITIES = ["major", "minor", "info"];

let currentMode = "github";
let lastReport = null;

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setMode(tab.dataset.mode);
  });
});

function setMode(mode) {
  currentMode = mode;
  modeTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });
  if (mode === "local") {
    if (repoLabel) repoLabel.textContent = "Local directory path";
    repoInput.placeholder = "e.g. C:/Users/... or . or ../api";
    if (tokenAccordion) tokenAccordion.hidden = true;
    if (examplesGithub) examplesGithub.hidden = true;
    if (examplesLocal) examplesLocal.hidden = false;
  } else {
    if (repoLabel) repoLabel.textContent = "GitHub repository";
    repoInput.placeholder = "https://github.com/owner/repo  ·  or  owner/repo";
    if (tokenAccordion) tokenAccordion.hidden = false;
    if (examplesGithub) examplesGithub.hidden = false;
    if (examplesLocal) examplesLocal.hidden = true;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = repoInput.value.trim();
  if (!value) return;
  if (currentMode === "local") {
    runLocalAnalysis(value);
  } else {
    runAnalysis(value, tokenInput ? tokenInput.value.trim() : "");
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    repoInput.value = chip.dataset.repo;
    runAnalysis(chip.dataset.repo, tokenInput ? tokenInput.value.trim() : "");
  });
});

document.querySelectorAll(".chip-local").forEach((chip) => {
  chip.addEventListener("click", () => {
    repoInput.value = chip.dataset.path;
    runLocalAnalysis(chip.dataset.path);
  });
});

async function runAnalysis(repo, token) {
  if (!repo) return;
  setBusy(true);
  showLoading(repo, false);
  reportEl.hidden = true;

  try {
    const params = new URLSearchParams({ repo });
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`/api/analyze?${params.toString()}`, { headers });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed (${response.status}).`);
    }
    renderReport(data);
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(false);
  }
}

async function runLocalAnalysis(path) {
  if (!path) return;
  setBusy(true);
  showLoading(path, true);
  reportEl.hidden = true;

  try {
    const params = new URLSearchParams({ path });
    const response = await fetch(`/api/analyze-local?${params.toString()}`);
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Request failed (${response.status}).`);
    }
    renderReport(data);
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(false);
  }
}

function setBusy(busy) {
  button.disabled = busy;
  button.textContent = busy ? "Analyzing…" : "Analyze";
}

function showLoading(target, isLocal) {
  statusEl.hidden = false;
  statusEl.className = "status loading";
  const actionText = isLocal
    ? `Scanning local directory <b>${escapeHtml(target)}</b>…`
    : `Fetching <b>${escapeHtml(target)}</b> and scanning its source files…`;
  statusEl.innerHTML = `<div class="spinner"></div><div>${actionText}</div>`;
}

function showError(message) {
  statusEl.hidden = false;
  statusEl.className = "status error";
  statusEl.textContent = `⚠ ${message}`;
}

function renderReport(data) {
  lastReport = data;
  statusEl.hidden = true;
  reportEl.hidden = false;
  reportEl.innerHTML =
    toolbar() +
    scorecard(data) +
    severityTiles(data.summary.by_severity) +
    categoryBars(data.summary.by_category) +
    fileSection(data.files);
  document.getElementById("export-md").addEventListener("click", exportMarkdown);
  document.getElementById("export-json").addEventListener("click", exportJSON);
  requestAnimationFrame(animateGauge);
}

function toolbar() {
  return `<div class="toolbar">
    <button id="export-md" class="btn-ghost" type="button">⬇ Markdown</button>
    <button id="export-json" class="btn-ghost" type="button">⬇ JSON</button>
  </div>`;
}

/* ---- sections --------------------------------------------------------- */

function scorecard(data) {
  const { repo, stats, summary } = data;
  const langs = Object.entries(stats.languages)
    .slice(0, 4)
    .map(([name, n]) => `${name} (${n})`)
    .join(", ");
  const titleHtml = repo.url
    ? `<a href="${escapeAttr(repo.url)}" target="_blank" rel="noopener">${escapeHtml(repo.full_name)}</a>`
    : `<span>${escapeHtml(repo.full_name)}</span>`;
  const starOrLocal = repo.url
    ? `<span>★ <b>${formatNumber(repo.stars)}</b></span>`
    : `<span>📁 <b>Local Directory</b></span>`;
  return `
  <div class="panel scorecard">
    ${gauge(summary.score, summary.grade)}
    <div class="repo-head">
      <h2>${titleHtml}</h2>
      ${repo.description ? `<p class="desc">${escapeHtml(repo.description)}</p>` : ""}
      <div class="meta">
        ${starOrLocal}
        <span><b>${formatNumber(stats.files_analyzed)}</b> files scanned</span>
        <span><b>${formatNumber(stats.total_loc)}</b> lines of code</span>
        <span><b>${formatNumber(stats.total_findings)}</b> findings</span>
        <span>${escapeHtml(langs)}</span>
      </div>
    </div>
  </div>`;
}

function gauge(score, grade) {
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const color = gaugeColor(score);
  return `
  <div class="gauge">
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle class="track" cx="75" cy="75" r="${radius}" fill="none" stroke-width="12" />
      <circle class="value" cx="75" cy="75" r="${radius}" fill="none" stroke-width="12"
              stroke="${color}" stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"
              data-target="${circumference * (1 - score / 100)}" />
    </svg>
    <div class="gauge-center">
      <div class="grade" style="color:${color}">${grade}</div>
      <div class="num">${score} / 100</div>
    </div>
  </div>`;
}

function severityTiles(bySeverity) {
  const labels = { major: "Major issues", minor: "Minor issues", info: "Suggestions" };
  const tiles = SEVERITIES.map((sev) => `
    <div class="tile ${sev}">
      <div class="n">${formatNumber(bySeverity[sev] || 0)}</div>
      <div class="l">${labels[sev]}</div>
    </div>`).join("");
  return `<div class="tiles">${tiles}</div>`;
}

function categoryBars(byCategory) {
  const entries = Object.entries(byCategory);
  if (entries.length === 0) return "";
  const max = Math.max(...entries.map(([, n]) => n));
  const rows = entries.map(([cat, n]) => `
    <div class="bar-row">
      <span class="cat">${escapeHtml(cat)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(n / max) * 100}%"></span></span>
      <span class="cnt">${n}</span>
    </div>`).join("");
  return `
  <div>
    <h3 class="section-title">Findings by category</h3>
    <div class="panel bars">${rows}</div>
  </div>`;
}

function fileSection(files) {
  if (!files || files.length === 0) {
    return `<div class="panel clean-banner">✨ No clean-code issues found. Nicely done!</div>`;
  }
  const cards = files.map((file, index) => fileCard(file, index === 0)).join("");
  return `<div>
    <h3 class="section-title">Top files to review</h3>
    <div class="report" style="gap:12px">${cards}</div>
  </div>`;
}

function fileCard(file, open) {
  const counts = countBySeverity(file.findings);
  const pills = SEVERITIES.filter((s) => counts[s])
    .map((s) => `<span class="pill ${s}">${counts[s]} ${s}</span>`)
    .join("");
  const rows = file.findings.map((f) => `
    <div class="finding">
      <span class="ln">L${f.line}</span>
      <span class="sev ${f.severity}">${f.severity}</span>
      <span class="msg">${escapeHtml(f.message)} <span class="rule">${escapeHtml(f.rule)}</span></span>
    </div>`).join("");
  return `
  <details class="panel file" ${open ? "open" : ""}>
    <summary>
      <span class="caret">▶</span>
      <span class="path">${escapeHtml(file.path)}</span>
      <span class="count">${pills}</span>
    </summary>
    <div class="findings">${rows}</div>
  </details>`;
}

/* ---- export ----------------------------------------------------------- */

function exportJSON() {
  if (!lastReport) return;
  downloadFile(`${slug(lastReport)}-clean-code.json`,
    JSON.stringify(lastReport, null, 2), "application/json");
}

function exportMarkdown() {
  if (!lastReport) return;
  downloadFile(`${slug(lastReport)}-clean-code.md`, buildMarkdown(lastReport), "text/markdown");
}

function slug(data) {
  return data.repo.full_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function buildMarkdown(data) {
  const { repo, stats, summary } = data;
  const sev = summary.by_severity;
  const lines = [
    `# Clean Code Report — ${repo.full_name}`,
    "",
    `**Grade: ${summary.grade} (${summary.score} / 100)**`,
    "",
  ];
  if (repo.description) lines.push(`> ${repo.description}`, "");
  if (repo.url) {
    lines.push(`- Repository: ${repo.url}`);
    lines.push(`- Stars: ${formatNumber(repo.stars)}`);
  } else {
    lines.push(`- Target Path: \`${repo.full_name}\``);
  }
  lines.push(
    `- Files analyzed: ${formatNumber(stats.files_analyzed)}`,
    `- Lines of code: ${formatNumber(stats.total_loc)}`,
    `- Findings: ${formatNumber(stats.total_findings)} (${sev.major} major, ${sev.minor} minor, ${sev.info} info)`,
    "",
    "## Findings by category",
    "",
    "| Category | Count |",
    "| --- | --- |",
    ...Object.entries(summary.by_category).map(([c, n]) => `| ${c} | ${n} |`),
    "",
    "## Top files to review",
    "",
  );
  if (!data.files.length) {
    lines.push("No clean-code issues found. ✨");
  } else {
    for (const file of data.files) {
      lines.push(`### \`${file.path}\``, "");
      for (const f of file.findings) {
        lines.push(`- **L${f.line}** _${f.severity}_ — ${f.message} \`${f.rule}\``);
      }
      lines.push("");
    }
  }
  lines.push("", `_Generated by Clean Code Checker on ${repo.full_name}._`);
  return lines.join("\n");
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/* ---- helpers ---------------------------------------------------------- */

function animateGauge() {
  const ring = reportEl.querySelector(".gauge .value");
  if (ring) ring.style.strokeDashoffset = ring.dataset.target;
}

function gaugeColor(score) {
  if (score >= 80) return "#3ddc97";
  if (score >= 60) return "#ffb454";
  return "#ff5c7a";
}

function countBySeverity(findings) {
  return findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}

function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}
