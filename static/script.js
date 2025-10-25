// Configure if backend runs on another origin (e.g., http://127.0.0.1:8000)
// Leave as empty string to use same origin
const API_BASE = "";

// Elements
const statusEl = document.getElementById("status");

const pdfFileEl = document.getElementById("pdfFile");
const btnUpload = document.getElementById("btnUpload");
const extractedTextEl = document.getElementById("extractedText");

const btnExtractCharacters = document.getElementById("btnExtractCharacters");
const characterListEl = document.getElementById("characterList");
const characterSelectEl = document.getElementById("characterSelect");
const traitsEl = document.getElementById("traits");

const modeToggleEl = document.getElementById("modeToggle");
const customSceneWrap = document.getElementById("customSceneWrap");
const paragraphTools = document.getElementById("paragraphTools");
const rewriteSourceEl = document.getElementById("rewriteSource");

const bookViewEl = document.getElementById("bookView");
const btnSelectAll = document.getElementById("btnSelectAll");
const btnClearAll = document.getElementById("btnClearAll");
const selectedCountEl = document.getElementById("selectedCount");

const btnRewrite = document.getElementById("btnRewrite");
const rewriteOutputEl = document.getElementById("rewriteOutput");
const btnDownload = document.getElementById("btnDownload");

// State
let extractedText = "";
let characters = [];
let paragraphs = []; // [{ id, text, selected }]
let useExtractedMode = true;

// Helpers
function setStatus(message, type = "info") {
  statusEl.textContent = message || "";
  statusEl.className = `status ${type}`;
}
async function parseJSON(resp) {
  const text = await resp.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
function httpError(resp, body) {
  const reason = body?.detail || body?.error || body?.message || body?.raw || resp.statusText;
  throw new Error(`HTTP ${resp.status} • ${reason}`);
}
function updateControls() {
  const hasText = (extractedText || "").trim().length > 0;
  btnExtractCharacters.disabled = !hasText && useExtractedMode;
  btnSelectAll.disabled = paragraphs.length === 0;
  btnClearAll.disabled = paragraphs.length === 0;

  const hasCharacters = characters.length > 0;
  characterSelectEl.disabled = !hasCharacters;

  let sourceOk = false;
  if (useExtractedMode) {
    sourceOk = paragraphs.some(p => p.selected) || hasText;
  } else {
    sourceOk = (rewriteSourceEl.value || "").trim().length > 0;
  }
  btnRewrite.disabled = !hasCharacters || !characterSelectEl.value || !sourceOk;
  btnDownload.disabled = (rewriteOutputEl.value || "").trim().length === 0;
}
function splitIntoParagraphs(text) {
  return text
    .split(/\n{2,}/g) // blank-line separated
    .map(t => t.trim())
    .filter(Boolean);
}
function renderParagraphs() {
  bookViewEl.innerHTML = "";
  paragraphs.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "page-card";

    const header = document.createElement("div");
    header.className = "page-header";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = p.selected;
    checkbox.addEventListener("change", () => {
      p.selected = checkbox.checked;
      countSelected();
      updateControls();
    });

    const label = document.createElement("label");
    label.textContent = `Paragraph ${idx + 1}`;

    header.appendChild(checkbox);
    header.appendChild(label);

    const ta = document.createElement("textarea");
    ta.value = p.text;
    ta.rows = Math.min(10, Math.max(4, Math.ceil(p.text.length / 160)));
    ta.addEventListener("input", () => {
      p.text = ta.value;
    });

    card.appendChild(header);
    card.appendChild(ta);
    bookViewEl.appendChild(card);
  });
  countSelected();
}
function countSelected() {
  const n = paragraphs.filter(p => p.selected).length;
  selectedCountEl.textContent = String(n);
}

// Mode toggle
modeToggleEl.addEventListener("change", () => {
  useExtractedMode = modeToggleEl.checked; // checked => Use Extracted Text
  customSceneWrap.classList.toggle("hidden", useExtractedMode);
  paragraphTools.classList.toggle("hidden", !useExtractedMode);
  updateControls();
});

// Upload
btnUpload.addEventListener("click", async () => {
  try {
    setStatus("Uploading PDF and extracting text...", "info");
    rewriteOutputEl.value = "";
    const file = pdfFileEl.files?.[0];
    if (!file) { setStatus("Please choose a PDF file.", "warn"); return; }

    const fd = new FormData();
    fd.append("file", file, file.name);

    const resp = await fetch(`${API_BASE}/pdf/upload`, { method: "POST", body: fd });
    const body = await parseJSON(resp);
    if (!resp.ok) httpError(resp, body);

    extractedText = body?.text ?? body?.content ?? body?.data ?? "";
    extractedTextEl.value = extractedText;

    // Prepare paragraph view
    const parts = splitIntoParagraphs(extractedText);
    paragraphs = parts.map((t, i) => ({ id: i + 1, text: t, selected: false }));
    renderParagraphs();

    // Clear state
    characters = [];
    characterListEl.innerHTML = "";
    characterSelectEl.innerHTML = '<option value="" selected>Select a character...</option>';

    setStatus("PDF text extracted successfully.", "success");
  } catch (e) {
    console.error(e);
    setStatus(e.message || "Failed to upload PDF.", "error");
  } finally {
    updateControls();
  }
});

// Extract Characters
btnExtractCharacters.addEventListener("click", async () => {
  try {
    setStatus("Extracting characters...", "info");
    rewriteOutputEl.value = "";

    const text = (extractedText || "").trim();
    if (!text) { setStatus("No text available.", "warn"); return; }

    const resp = await fetch(`${API_BASE}/characters/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const body = await parseJSON(resp);
    if (!resp.ok) httpError(resp, body);

    const list = Array.isArray(body) ? body : body?.characters;
    characters = (list || []).map(c => ({
      name: c?.name ?? String(c?.character ?? "Unknown"),
      description: c?.description ?? ""
    }));

    // Render list and dropdown
    characterListEl.innerHTML = "";
    characterSelectEl.innerHTML = '<option value="" selected>Select a character...</option>';
    characters.forEach((c, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `<div class="li-title">${c.name}</div>${c.description ? `<div class="li-desc">${c.description}</div>` : ""}`;
      characterListEl.appendChild(li);

      const opt = document.createElement("option");
      opt.value = c.name;
      opt.textContent = c.name;
      characterSelectEl.appendChild(opt);
    });

    setStatus(characters.length ? `Found ${characters.length} character(s).` : "No characters found.", characters.length ? "success" : "warn");
  } catch (e) {
    console.error(e);
    setStatus(e.message || "Failed to extract characters.", "error");
  } finally {
    updateControls();
  }
});

characterSelectEl.addEventListener("change", updateControls);

// Paragraph select helpers
btnSelectAll.addEventListener("click", () => {
  paragraphs.forEach(p => (p.selected = true));
  renderParagraphs();
  updateControls();
});
btnClearAll.addEventListener("click", () => {
  paragraphs.forEach(p => (p.selected = false));
  renderParagraphs();
  updateControls();
});

// Rewrite
btnRewrite.addEventListener("click", async () => {
  try {
    setStatus("Rewriting scene...", "info");
    rewriteOutputEl.value = "";

    const character = characterSelectEl.value;
    if (!character) { setStatus("Please select a character.", "warn"); return; }

    const traits = (traitsEl.value || "").trim();

    let text = "";
    if (useExtractedMode) {
      const chosen = paragraphs.filter(p => p.selected).map(p => p.text.trim()).filter(Boolean);
      text = (chosen.length ? chosen.join("\n\n") : (extractedText || "")).trim();
    } else {
      text = (rewriteSourceEl.value || "").trim();
    }
    if (!text) { setStatus("No source text to rewrite.", "warn"); return; }

    const resp = await fetch(`${API_BASE}/rewrite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, traits, text })
    });
    const body = await parseJSON(resp);
    if (!resp.ok) httpError(resp, body);

    // Accept common fields for compatibility
    const output = body?.story ?? body?.rewritten ?? body?.result ?? body?.data ?? body?.text ?? "";
    rewriteOutputEl.value = output || "[No rewrite returned]";
    setStatus("Rewrite complete.", "success");
  } catch (e) {
    console.error(e);
    setStatus(e.message || "Failed to rewrite scene.", "error");
  } finally {
    updateControls();
  }
});

// Download
btnDownload.addEventListener("click", () => {
  const content = (rewriteOutputEl.value || "").trim();
  if (!content) return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const char = characterSelectEl.value || "character";
  a.href = url;
  a.download = `${char}_POV_story.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Initial
useExtractedMode = true; // default: Use Extracted Text
modeToggleEl.checked = true;
customSceneWrap.classList.add("hidden");
paragraphTools.classList.remove("hidden");
updateControls();