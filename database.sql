USE repair_compass;

DROP TABLE IF EXISTS contacts;

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_type ENUM('consult','document') NOT NULL,
    name VARCHAR(100) NOT NULL,
    furigana VARCHAR(100) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(20) DEFAULT NULL,
    region VARCHAR(50) NOT NULL,
    scale VARCHAR(50) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    file_path TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mail (mail),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




