// Homepage JavaScript - Handles PDF upload and redirects to story page

const uploadForm = document.getElementById('uploadForm');
const uploadStatus = document.getElementById('uploadStatus');
const uploadBtn = document.getElementById('uploadBtn');
const dropZone = document.getElementById('dropZone');
const pdfFile = document.getElementById('pdfFile');
const fileSelected = document.getElementById('fileSelected');
const fileName = document.getElementById('fileName');
const dropZoneContent = dropZone.querySelector('.drop-zone-content');

let extractedText = "";

// Smooth scroll to upload section
function scrollToUpload() {
    document.getElementById('upload').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// File drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#6366f1';
    dropZone.style.background = 'rgba(99, 102, 241, 0.15)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '';
    dropZone.style.background = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        pdfFile.files = files;
        handleFileSelect(files[0]);
    }
});

pdfFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (file.type !== 'application/pdf') {
        showStatus(uploadStatus, 'Please select a PDF file.', 'error');
        return;
    }
    
    fileName.textContent = file.name;
    dropZoneContent.style.display = 'none';
    fileSelected.style.display = 'flex';
}

function clearFile() {
    pdfFile.value = '';
    dropZoneContent.style.display = 'block';
    fileSelected.style.display = 'none';
    uploadStatus.textContent = '';
    uploadStatus.className = 'status-message';
}

// Form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = pdfFile.files[0];
    
    if (!file) {
        showStatus(uploadStatus, 'Please select a PDF file.', 'error');
        return;
    }

    // Update UI
    uploadBtn.disabled = true;
    uploadBtn.querySelector('.btn-text').style.display = 'none';
    uploadBtn.querySelector('.btn-loader').style.display = 'flex';
    showStatus(uploadStatus, 'Uploading and extracting text...', 'loading');
    
    const formData = new FormData();
    formData.append("file", file);

    try {
<<<<<<< HEAD
        const response = await fetch("/pdf/extract", {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            extractedText = data.text;
            showStatus(uploadStatus, '✅ Text extracted successfully! Redirecting...', 'success');
            
            // Store text in sessionStorage and redirect
            sessionStorage.setItem('extractedText', extractedText);
            sessionStorage.setItem('fileName', file.name);
            
            // Small delay for user feedback
            setTimeout(() => {
                window.location.href = '/story';
            }, 1500);
        } else {
            showStatus(uploadStatus, `❌ Error: ${data.error || 'Failed to extract text'}`, 'error');
            resetUploadButton();
        }
    } catch (err) {
        showStatus(uploadStatus, '❌ Error uploading file. Please try again.', 'error');
        console.error(err);
        resetUploadButton();
    }
});

function showStatus(element, message, type = 'info') {
    element.textContent = message;
    element.className = `status-message ${type}`;
}

function resetUploadButton() {
    uploadBtn.disabled = false;
    uploadBtn.querySelector('.btn-text').style.display = 'inline';
    uploadBtn.querySelector('.btn-loader').style.display = 'none';
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and steps
document.querySelectorAll('.feature-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
=======
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
>>>>>>> 4d03f41741da3cd494cf3ba79950082f672c4a98
});
