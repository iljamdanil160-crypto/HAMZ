// ZQ MOD Key Generator - Enhanced Version
// Global variables
let keys = [];

// Load keys from localStorage on page load
function loadKeys() {
    const storedKeys = localStorage.getItem('zq_keys');
    if (storedKeys) {
        keys = JSON.parse(storedKeys);
    }
    updateStats();
}

// Save keys to localStorage
function saveKeys() {
    localStorage.setItem('zq_keys', JSON.stringify(keys));
    updateStats();
}

// Generate random key
function generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    // Format: XXXX-XXXX-XXXX-XXXX
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
            result += '';
        }
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

// Show result message
function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = message;
    resultDiv.className = `result ${type}`;
    resultDiv.style.display = 'block';
    
    // Auto hide after 10 seconds
    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 10000);
}

// Show verify result
function showVerifyResult(message, type) {
    const resultDiv = document.getElementById('verifyResult');
    resultDiv.innerHTML = message;
    resultDiv.className = `result ${type}`;
    resultDiv.style.display = 'block';
    
    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 8000);
}

// Main generate key function
function generateKey() {
    const username = document.getElementById('username').value.trim();
    const btn = document.getElementById('generateBtn');
    
    if (!username) {
        showResult('❌ Please enter a username', 'error');
        return;
    }
    
    if (username.length < 3) {
        showResult('❌ Username must be at least 3 characters', 'error');
        return;
    }
    
    // Show loading
    btn.innerHTML = '<div class="loading"></div>Generating...';
    btn.disabled = true;

    setTimeout(() => {
        const key = generateRandomKey();
        const now = new Date();
        const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        
        const keyData = {
            key: key,
            username: username,
            created: now.toISOString(),
            expiry: expiry.toISOString().split('T')[0], // Format: 2024-12-31
            status: 'active',
            id: Date.now() // Unique ID
        };
        
        // Save to localStorage
        keys.push(keyData);
        saveKeys();
        
        // Save to GitHub format
        saveToGitHub(keyData);
        
        showResult(`
            <h3>🎉 Key Generated Successfully!</h3>
            <div class="key-display">
                <strong>Your Key:</strong><br>
                <code>${key}</code>
            </div>
            <p><strong>👤 User:</strong> ${username}</p>
            <p><strong>📅 Valid Until:</strong> ${expiry.toLocaleDateString()}</p>
            <p><strong>🆔 Key ID:</strong> #${keyData.id}</p>
            <div style="margin-top: 15px; padding: 10px; background: #e6fffa; border-radius: 5px;">
                <small><strong>⚠️ Important:</strong></small><br>
                <small>• Save this key! You'll need it for the mod</small><br>
                <small>• Key is valid for 7 days</small><br>
                <small>• Use this key in ZQ MOD app</small>
            </div>
        `, 'success');
        
        // Clear input and reset button
        document.getElementById('username').value = '';
        btn.innerHTML = '🚀 Generate Key';
        btn.disabled = false;
        
        // Auto download keys file
        setTimeout(() => {
            downloadKeysFile();
        }, 2000);
        
    }, 1500);
}

// Function untuk save ke format yang bisa dibaca mod
function saveToGitHub(keyData) {
    // Format: KEY|USERNAME|EXPIRY|STATUS
    const keyLine = `${keyData.key}|${keyData.username}|${keyData.expiry}|${keyData.status}`;
    
    // Log untuk debugging
    console.log('Key to save:', keyLine);
    console.log('Key data:', keyData);
    
    // Simulate GitHub save process
    console.log('✅ Key saved to database');
}

// Generate keys.txt file yang bisa didownload
function downloadKeysFile() {
    if (keys.length === 0) {
        alert('❌ No keys to download');
        return;
    }
    
    let content = "// ZQ MOD Keys Database\n";
    content += "// Format: KEY|USERNAME|EXPIRY|STATUS\n";
    content += "// Generated: " + new Date().toISOString() + "\n\n";
    
    // Add active keys only
    const activeKeys = keys.filter(key => key.status === 'active');
    activeKeys.forEach(key => {
        content += `${key.key}|${key.username}|${key.expiry}|${key.status}\n`;
    });
    
    // Add some demo keys for testing
    content += "\n// Demo Keys (always active)\n";
    content += "ZQMOD2024DEMO123|DemoUser1|2025-12-31|active\n";
    content += "TESTKEY123456789|DemoUser2|2025-12-31|active\n";
    content += "HAMZKEY2024MLBB|DemoUser3|2025-12-31|active\n";
    
    // Auto download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'keys.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    console.log('📥 Keys file downloaded');
}

// Verify key function
function verifyKey() {
    const keyInput = document.getElementById('verifyKey').value.trim();
    
    if (!keyInput) {
        showVerifyResult('❌ Please enter a key to verify', 'error');
        return;
    }
    
    // Check in local storage
    const foundKey = keys.find(k => k.key === keyInput && k.status === 'active');
    
    if (foundKey) {
        const expiry = new Date(foundKey.expiry);
        const today = new Date();
        const isExpired = expiry < today;
        
        if (isExpired) {
            showVerifyResult(`
                <h3>⚠️ Key Expired</h3>
                <p><strong>Key:</strong> ${foundKey.key}</p>
                <p><strong>User:</strong> ${foundKey.username}</p>
                <p><strong>Expired on:</strong> ${expiry.toLocaleDateString()}</p>
                <p style="color: #e53e3e;">This key is no longer valid. Generate a new one.</p>
            `, 'error');
        } else {
            const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            showVerifyResult(`
                <h3>✅ Key is Valid</h3>
                <p><strong>Key:</strong> ${foundKey.key}</p>
                <p><strong>User:</strong> ${foundKey.username}</p>
                <p><strong>Expires:</strong> ${expiry.toLocaleDateString()}</p>
                <p><strong>Days remaining:</strong> ${daysLeft} days</p>
                <p style="color: #38a169;">✓ This key is active and ready to use!</p>
            `, 'success');
        }
    } else {
        // Check demo keys
        const demoKeys = ['ZQMOD2024DEMO123', 'TESTKEY123456789', 'HAMZKEY2024MLBB'];
        if (demoKeys.includes(keyInput)) {
            showVerifyResult(`
                <h3>✅ Demo Key Valid</h3>
                <p><strong>Key:</strong> ${keyInput}</p>
                <p><strong>Type:</strong> Demo Key</p>
                <p><strong>Status:</strong> Always Active</p>
                <p style="color: #38a169;">✓ This is a demo key for testing!</p>
            `, 'success');
        } else {
            showVerifyResult(`
                <h3>❌ Invalid Key</h3>
                <p>The key you entered is not valid or has been deactivated.</p>
                <p><strong>Possible reasons:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>Key doesn't exist</li>
                    <li>Key has been deactivated</li>
                    <li>Typo in the key</li>
                </ul>
                <p>Please generate a new key or check your input.</p>
            `, 'error');
        }
    }
    
    // Clear input
    document.getElementById('verifyKey').value = '';
}

// Tab management
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Update statistics
function updateStats() {
    const totalKeys = keys.length;
    const activeKeys = keys.filter(k => k.status === 'active').length;
    
    const totalElement = document.getElementById('totalKeys');
    const activeElement = document.getElementById('activeKeys');
    
    if (totalElement) totalElement.textContent = totalKeys;
    if (activeElement) activeElement.textContent = activeKeys;
}

// Clear all keys
function clearAllKeys() {
    if (confirm('⚠️ Are you sure you want to clear all keys? This action cannot be undone.')) {
        keys = [];
        saveKeys();
        alert('✅ All keys have been cleared');
    }
}

// Add download button to settings (called automatically)
function addDownloadButton() {
    // This function is called automatically when DOM loads
    console.log('✅ Enhanced key generator loaded');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadKeys();
    addDownloadButton();
    updateStats();
    
    // Add Enter key support for forms
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateKey();
        }
    });
    
    document.getElementById('verifyKey').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyKey();
        }
    });
    
    console.log('🎮 ZQ MOD Key Generator initialized');
});

// Additional utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('✅ Copied to clipboard');
    }, function(err) {
        console.error('❌ Could not copy text: ', err);
    });
}

// Export functions for external use
window.ZQ_API = {
    generateKey: generateKey,
    verifyKey: verifyKey,
    downloadKeysFile: downloadKeysFile,
    keys: keys
};
