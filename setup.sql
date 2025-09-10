CREATE DATABASE IF NOT EXISTS zqmod_keys;
USE zqmod_keys;

CREATE TABLE IF NOT EXISTS user_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    user_key VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
    last_used TIMESTAMP NULL,
    ip_address VARCHAR(45),
    INDEX idx_key (user_key),
    INDEX idx_username (username),
    INDEX idx_status (status)
);

-- Insert admin/demo keys
INSERT INTO user_keys (username, email, user_key, expires_at) VALUES 
('demo', 'demo@zqmod.com', 'ZQMOD2024DEMO123', '2025-12-31 23:59:59'),
('test', 'test@zqmod.com', 'TESTKEY123456789', '2025-12-31 23:59:59');
