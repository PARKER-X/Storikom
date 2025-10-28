const uploadForm = document.getElementById('uploadForm');
const uploadStatus = document.getElementById('uploadStatus');
const characterSection = document.getElementById('characterSection');
const characterSelect = document.getElementById('characterSelect');
const rewriteBtn = document.getElementById('rewriteBtn');
const storySection = document.getElementById('storySection');
const storyOutput = document.getElementById('storyOutput');

let extractedText = "";

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('pdfFile').files[0];
    if (!file) return alert('Please select a file.');

    uploadStatus.textContent = "Uploading and extracting characters...";
    
    // Upload the file to backend
    const formData = new FormData();
    formData.append("file", file);

    try {
        const pdfRes = await fetch("/pdf/extract", {
            method: "POST",
            body: formData
        });
        const pdfData = await pdfRes.json();
        extractedText = pdfData.text;

        const charRes = await fetch("/characters/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText })
        });

        const charData = await charRes.json();
        uploadStatus.textContent = "Characters extracted! Choose one below:";
        characterSection.style.display = "block";

        characterSelect.innerHTML = "";
        charData.characters.forEach(char => {
            const option = document.createElement("option");
            option.value = char;
            option.textContent = char;
            characterSelect.appendChild(option);
        });
    } catch (err) {
        uploadStatus.textContent = "Error processing file.";
        console.error(err);
    }
});

rewriteBtn.addEventListener('click', async () => {
    const selectedChar = characterSelect.value;
    if (!selectedChar) return alert("Please select a character.");

    storySection.style.display = "block";
    storyOutput.textContent = "Rewriting book from " + selectedChar + "'s POV...";

    try {
        const rewriteRes = await fetch("/rewrite/character", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                character: selectedChar,
                text: extractedText
            })
        });
        const rewriteData = await rewriteRes.json();
        storyOutput.textContent = rewriteData.rewritten_text;
    } catch (err) {
        storyOutput.textContent = "Error rewriting story.";
        console.error(err);
    }
});
