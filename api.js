// ZQ MOD Key System API
// For integration with mobile legends mod

class ZQModAPI {
    constructor() {
        this.keys = JSON.parse(localStorage.getItem('zq_keys') || '[]');
    }
    
    // Verify key (main function for mod)
    verifyKey(key) {
        const keyData = this.keys.find(k => k.key === key.toUpperCase());
        
        if (!keyData) {
            return {
                success: false,
                message: 'Invalid key',
                code: 'KEY_NOT_FOUND'
            };
        }
        
        const now = new Date();
        const expiryDate = new Date(keyData.expiry);
        
        if (expiryDate > now) {
            return {
                success: true,
                message: 'Key is valid',
                username: keyData.username,
                expiry: keyData.expiry,
                remaining_days: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)),
                code: 'KEY_VALID'
            };
        } else {
            return {
                success: false,
                message: 'Key has expired',
                expired_on: keyData.expiry,
                code: 'KEY_EXPIRED'
            };
        }
    }
    
    // Generate key programmatically
    generateKey(username, durationDays = 7) {
        if (!username || username.length < 3) {
            return {
                success: false,
                message: 'Username must be at least 3 characters'
            };
        }
        
        const key = this.generateRandomKey();
        const now = new Date();
        const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
        
        const keyData = {
            key: key,
            username: username,
            created: now.toISOString(),
            expiry: expiry.toISOString(),
            status: 'active'
        };
        
        this.keys.push(keyData);
        localStorage.setItem('zq_keys', JSON.stringify(this.keys));
        
        return {
            success: true,
            message: 'Key generated successfully',
            key: key,
            username: username,
            expiry: expiry.toISOString(),
            duration_days: durationDays
        };
    }
    
    // Get statistics
    getStats() {
        const now = new Date();
        const today = now.toDateString();
        
        let activeCount = 0;
        let expiredCount = 0;
        let todayCount = 0;
        
        this.keys.forEach(key => {
            const expiryDate = new Date(key.expiry);
            if (expiryDate > now) {
                activeCount++;
            } else {
                expiredCount++;
            }
            
            if (new Date(key.created).toDateString() === today) {
                todayCount++;
            }
        });
        
        return {
            total_keys: this.keys.length,
            active_keys: activeCount,
            expired_keys: expiredCount,
            today_keys: todayCount
        };
    }
    
    // Helper function
    generateRandomKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Global API instance
window.ZQ_API = new ZQModAPI();

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZQModAPI;
}
