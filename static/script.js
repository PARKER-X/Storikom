'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://127.0.0.1:8000';
  // Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const btnBrowse = document.getElementById('btn-browse');
  const fileNameEl = document.getElementById('file-name');
  const uploadStatus = document.getElementById('upload-status');

  const sectionExtract = document.getElementById('section-extract');
  const btnExtract = document.getElementById('btn-extract');
  const extractStatus = document.getElementById('extract-status');
  const charactersGrid = document.getElementById('characters');

  const sectionRewrite = document.getElementById('section-rewrite');
  const btnRewrite = document.getElementById('btn-rewrite');
  const rewriteStatus = document.getElementById('rewrite-status');
  const outputEl = document.getElementById('output');

  // State
  let uploaded = false;
  let selectedCharacter = null;
  let characters = [];

  // Utilities
  function show(el) { el.classList.remove('hidden'); el.setAttribute('aria-hidden', 'false'); }
  function hide(el) { el.classList.add('hidden'); el.setAttribute('aria-hidden', 'true'); }
  function setLoading(el, text) { el.textContent = text; el.classList.add('loading'); }
  function clearLoading(el) { el.classList.remove('loading'); }
  function setStatus(el, text) { el.textContent = text; }

  function validatePDF(file) { return file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')); }

  // Dropzone behavior
  function handleFiles(files) {
    const file = files[0];
    if (!validatePDF(file)) {
      setStatus(uploadStatus, 'Please select a valid PDF file.');
      return;
    }
    fileNameEl.textContent = file.name;
    uploadFile(file);
  }

  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropzone.classList.add('dragover'); });
  });
  ;['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', e => { const dt = e.dataTransfer; if (dt && dt.files && dt.files.length) handleFiles(dt.files); });
  dropzone.addEventListener('click', () => fileInput.click());
  btnBrowse.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => { if (e.target.files && e.target.files.length) handleFiles(e.target.files); });

  // Upload to /upload
  async function uploadFile(file) {
    try {
      setLoading(uploadStatus, 'Uploading...');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json().catch(() => ({}));
      uploaded = true;
      setStatus(uploadStatus, 'Uploaded successfully');
      clearLoading(uploadStatus);
      show(sectionExtract);
      // Optional: if backend returns characters right away
      if (Array.isArray(data.characters) && data.characters.length) {
        characters = data.characters;
        renderCharacters(characters);
        show(sectionRewrite);
      }
    } catch (err) {
      console.error(err);
      clearLoading(uploadStatus);
      setStatus(uploadStatus, 'Upload failed. Please try again.');
      uploaded = false;
    }
  }

  // Extract characters
  btnExtract.addEventListener('click', async () => {
    if (!uploaded) return;
    charactersGrid.innerHTML = '';
    btnRewrite.disabled = true;
    selectedCharacter = null;
    setLoading(extractStatus, 'Extracting characters...');
    try {
      const res = await fetch(`${API_BASE}/characters`, { method: 'GET' });
      if (!res.ok) throw new Error(`Characters request failed (${res.status})`);
      const data = await res.json();
      characters = Array.isArray(data) ? data : (data.characters || []);
      if (!Array.isArray(characters)) characters = [];
      renderCharacters(characters);
      setStatus(extractStatus, characters.length ? `Found ${characters.length} characters` : 'No characters found');
      clearLoading(extractStatus);
      show(sectionRewrite);
    } catch (err) {
      console.error(err);
      clearLoading(extractStatus);
      setStatus(extractStatus, 'Failed to extract characters.');
    }
  });

  function renderCharacters(list) {
    charactersGrid.innerHTML = '';
    if (!list.length) return;
    list.forEach((ch, idx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card-item';
      card.setAttribute('data-index', String(idx));
      card.innerHTML = `<h3>${escapeHtml(ch.name || 'Unknown')}</h3><p>${escapeHtml(ch.description || '')}</p>`;
      card.addEventListener('click', () => selectCharacter(idx));
      charactersGrid.appendChild(card);
    });
  }

  function selectCharacter(index) {
    const prev = charactersGrid.querySelector('.card-item.selected');
    if (prev) prev.classList.remove('selected');
    const card = charactersGrid.querySelector(`.card-item[data-index="${index}"]`);
    if (card) card.classList.add('selected');
    selectedCharacter = characters[index] || null;
    btnRewrite.disabled = !selectedCharacter;
  }

  // Rewrite
  btnRewrite.addEventListener('click', async () => {
    if (!selectedCharacter) return;
    outputEl.textContent = '';
    setLoading(rewriteStatus, 'Rewriting from POV...');
    try {
      const res = await fetch(`${API_BASE}/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: selectedCharacter })
      });
      if (!res.ok) throw new Error(`Rewrite failed (${res.status})`);
      const data = await res.json().catch(() => ({}));
      const text = data.text || data.result || data.output || '';
      outputEl.textContent = text || 'No rewritten text returned.';
      setStatus(rewriteStatus, 'Done');
      clearLoading(rewriteStatus);
    } catch (err) {
      console.error(err);
      clearLoading(rewriteStatus);
      setStatus(rewriteStatus, 'Failed to rewrite.');
    }
  });

  // Helpers
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
});
