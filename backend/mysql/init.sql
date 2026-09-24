-- Runs on every MySQL start via --init-file (idempotent).
-- Ensures the app's DB user password and schema exist.
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
CREATE DATABASE IF NOT EXISTS freelancehub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
