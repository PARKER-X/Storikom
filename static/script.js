const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const uploadArea = document.getElementById("upload-area");
const fileNameDisplay = document.getElementById("file-name");
const uploadLoading = document.getElementById("upload-loading");

const extractBtn = document.getElementById("extract-btn");
const extractSection = document.getElementById("extract-section");
const characterLoading = document.getElementById("character-loading");
const characterList = document.getElementById("character-list");

const rewriteSection = document.getElementById("rewrite-section");
const selectedCharName = document.getElementById("selected-character-name");
const rewriteBtn = document.getElementById("rewrite-btn");
const rewriteLoading = document.getElementById("rewrite-loading");
const storyOutput = document.getElementById("rewritten-story");

let selectedCharacter = null;
let uploadedFile = null;

// Handle file selection
uploadBtn.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragging");
});
uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragging");
});
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragging");
  const file = e.dataTransfer.files[0];
  handleFileUpload(file);
});
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  handleFileUpload(file);
});

async function handleFileUpload(file) {
  if (!file || file.type !== "application/pdf") {
    alert("Please upload a valid PDF file.");
    return;
  }

  uploadedFile = file;
  fileNameDisplay.textContent = `Selected: ${file.name}`;
  uploadLoading.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    uploadLoading.classList.add("hidden");
    extractSection.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    alert("Failed to upload PDF.");
    uploadLoading.classList.add("hidden");
  }
}

// Extract Characters
extractBtn.addEventListener("click", async () => {
  characterLoading.classList.remove("hidden");
  characterList.innerHTML = "";

  try {
    const response = await fetch("/characters", {
      method: "GET",
    });

    const characters = await response.json();

    characters.forEach((char) => {
      const card = document.createElement("div");
      card.className = "character-card";
      card.textContent = `${char.name}: ${char.description}`;
      card.dataset.name = char.name;
      card.dataset.description = char.description;

      card.addEventListener("click", () => {
        document.querySelectorAll(".character-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedCharacter = {
          name: card.dataset.name,
          description: card.dataset.description,
        };
        rewriteSection.classList.remove("hidden");
        selectedCharName.textContent = `Selected: ${selectedCharacter.name}`;
      });

      characterList.appendChild(card);
    });

  } catch (error) {
    alert("Failed to extract characters.");
    console.error(error);
  } finally {
    characterLoading.classList.add("hidden");
  }
});

// Rewrite Story
rewriteBtn.addEventListener("click", async () => {
  if (!selectedCharacter) return alert("No character selected.");

  rewriteLoading.classList.remove("hidden");
  storyOutput.textContent = "";

  try {
    const response = await fetch("/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedCharacter),
    });

    const data = await response.text();
    storyOutput.textContent = data;
  } catch (error) {
    alert("Failed to rewrite story.");
    console.error(error);
  } finally {
    rewriteLoading.classList.add("hidden");
  }
});
