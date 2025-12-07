// Story Page JavaScript - Handles character selection, rewriting, and chat

// Global state
let extractedText = "";
let characters = [];
let selectedCharacter = null;
let chatHistory = [];

// DOM Elements
const charactersList = document.getElementById('charactersList');
const selectedCharacterInfo = document.getElementById('selectedCharacterInfo');
const rewriteBtn = document.getElementById('rewriteBtn');
const rewriteProgress = document.getElementById('rewriteProgress');
const storyOutput = document.getElementById('storyOutput');
const chatSidebar = document.getElementById('chatSidebar');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatCharacterName = document.getElementById('chatCharacterName');

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Get extracted text from sessionStorage
    extractedText = sessionStorage.getItem('extractedText');
    const fileName = sessionStorage.getItem('fileName');
    
    if (!extractedText) {
        // No text found, redirect to homepage
        window.location.href = '/';
        return;
    }
    
    // Update story title
    if (fileName) {
        document.getElementById('storyTitle').textContent = fileName.replace('.pdf', '');
    }
    
    // Extract characters
    await extractCharacters();
});

// Extract Characters
async function extractCharacters() {
    if (!extractedText) return;

    charactersList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Extracting characters...</p></div>';

    try {
        const response = await fetch("/characters/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: extractedText })
        });

        const data = await response.json();
        
        if (data.success && data.characters && data.characters.length > 0) {
            characters = data.characters;
            displayCharacters(data.characters);
            document.getElementById('characterCount').textContent = `${data.characters.length} found`;
        } else {
            charactersList.innerHTML = '<div class="loading-state"><p>No characters found. Try uploading a different novel.</p></div>';
        }
    } catch (err) {
        charactersList.innerHTML = '<div class="loading-state"><p>Error extracting characters. Please try again.</p></div>';
        console.error(err);
    }
}

// Display Characters
function displayCharacters(chars) {
    charactersList.innerHTML = '';
    
    chars.forEach(char => {
        const charCard = document.createElement('div');
        charCard.className = 'character-card';
        charCard.innerHTML = `
            <h3>${escapeHtml(char.name)}</h3>
            <p>${escapeHtml(char.description || 'No description available')}</p>
        `;
        
        charCard.addEventListener('click', () => {
            selectCharacter(char);
        });
        
        charactersList.appendChild(charCard);
    });
}

// Select Character
function selectCharacter(char) {
    selectedCharacter = char;
    
    // Update UI
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Show selected character info
    document.getElementById('badgeText').textContent = char.name;
    selectedCharacterInfo.style.display = 'inline-flex';
    
    // Show rewrite button
    rewriteBtn.style.display = 'block';
    
    // Show chat button
    chatToggleBtn.style.display = 'flex';
    chatCharacterName.textContent = char.name;
    
    // Initialize chat
    initializeChat();
    
    // Clear previous story output
    storyOutput.innerHTML = '<div class="welcome-state"><div class="welcome-icon">✍️</div><h3>Ready to Rewrite</h3><p>Click "Rewrite from POV" to generate the story from ' + escapeHtml(char.name) + '\'s perspective.</p></div>';
}

// Rewrite Story
rewriteBtn.addEventListener('click', async () => {
    if (!selectedCharacter || !extractedText) {
        alert("Please select a character first.");
        return;
    }

    rewriteBtn.disabled = true;
    rewriteProgress.style.display = 'flex';
    storyOutput.innerHTML = '<div class="welcome-message">Rewriting story from ' + escapeHtml(selectedCharacter.name) + "'s POV... This may take a while...</div>";

    try {
        const response = await fetch("/rewrite/character", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: extractedText,
                character_name: selectedCharacter.name,
                traits: selectedCharacter.description || ""
            })
        });

        const data = await response.json();
        
        if (data.success) {
            storyOutput.innerHTML = `<div class="rewritten-content">${formatText(data.rewritten_text)}</div>`;
        } else {
            storyOutput.innerHTML = '<div class="welcome-message" style="color: var(--error);">❌ Error: ' + (data.error || 'Failed to rewrite story') + '</div>';
        }
    } catch (err) {
        storyOutput.innerHTML = '<div class="welcome-message" style="color: var(--error);">❌ Error rewriting story. Please try again.</div>';
        console.error(err);
    } finally {
        rewriteBtn.disabled = false;
        rewriteProgress.style.display = 'none';
    }
});

// Initialize Chat
function initializeChat() {
    chatHistory = [];
    chatMessages.innerHTML = `
        <div class="chat-message system">
            <p>You are now chatting with <strong>${escapeHtml(selectedCharacter.name)}</strong>.</p>
        </div>
    `;
}

// Toggle Chat Sidebar
function toggleChat() {
    if (!selectedCharacter) {
        alert("Please select a character first.");
        return;
    }
    
    chatSidebar.classList.toggle('open');
}

// Send Chat Message
sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || !selectedCharacter) return;

    // Add user message to chat
    addChatMessage('user', message);
    chatInput.value = '';
    sendChatBtn.disabled = true;

    // Show typing indicator
    const typingId = addChatMessage('character', '...', true);

    try {
        const response = await fetch("/chat/character", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                character_name: selectedCharacter.name,
                character_description: selectedCharacter.description || ""
            })
        });

        const data = await response.json();
        
        // Remove typing indicator
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        
        if (data.success) {
            addChatMessage('character', data.response);
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: data.response });
        } else {
            addChatMessage('character', `Error: ${data.error || 'Failed to get response'}`);
        }
    } catch (err) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        addChatMessage('character', 'Error: Could not connect to server.');
        console.error(err);
    } finally {
        sendChatBtn.disabled = false;
    }
}

// Add Chat Message
function addChatMessage(role, content, isTyping = false) {
    const messageDiv = document.createElement('div');
    const id = 'msg_' + Date.now() + '_' + Math.random();
    messageDiv.id = id;
    messageDiv.className = `chat-message ${role}`;
    
    if (isTyping) {
        messageDiv.innerHTML = '<p class="typing">...</p>';
    } else {
        messageDiv.innerHTML = `<p>${formatText(content)}</p>`;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return id;
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatText(text) {
    if (!text) return '';
    // Convert newlines to <br> and escape HTML
    return escapeHtml(text).replace(/\n/g, '<br>');
}

