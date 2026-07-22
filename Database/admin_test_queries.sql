-- Admin Panel Test & Demo Skript
-- Ausführung NACHDEM Migration 008 angewendet wurde

-- 1. TEST-ADMIN-BENUTZER ERSTELLEN
-- (Falls noch keiner vorhanden ist)
INSERT INTO users (username, password_hash, first_name, last_name, email, is_company, role)
VALUES (
  'admin_test',
  '$2a$10$...',  -- bcrypt Hash für Passwort 'password123'
  'Test',
  'Admin',
  'admin@smartgive.de',
  false,
  'admin'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 2. VERIFIZIEREN, DASS DER ADMIN-BENUTZER ERSTELLT WURDE
SELECT id, username, email, role, created_at FROM users WHERE role = 'admin';

-- 3. ADMIN-SPEZIFISCHE SPALTEN ÜBERPRÜFEN
SELECT id, username, role, is_verified, is_banned, ban_reason FROM users LIMIT 5;

-- 4. ADMIN-PROTOKOLLTABELLE TESTEN (admin_logs)
SELECT * FROM admin_logs LIMIT 5;

-- 5. CONTENT-MELDUNGSTABELLE TESTEN (content_reports)
SELECT * FROM content_reports LIMIT 5;

-- 6. EXISTIERENDEN BENUTZER ZUM ADMIN BEFÖRDERN
-- Ersetzen Sie die 2 durch die tatsächliche Benutzer-ID
UPDATE users SET role = 'admin' WHERE id = 2;

-- 7. ADMIN ZURÜCK ZUM BENUTZER HERABSTUFEN
-- Ersetzen Sie die 2 durch die tatsächliche Benutzer-ID
UPDATE users SET role = 'user' WHERE id = 2;

-- 8. EINEN BENUTZER SPERREN
-- Ersetzen Sie die 3 durch die tatsächliche Benutzer-ID
UPDATE users 
SET is_banned = true, ban_reason = 'Test: Spam-Aktivität'
WHERE id = 3;

-- 9. EINEN BENUTZER ENTSPERREN
UPDATE users 
SET is_banned = false, ban_reason = NULL
WHERE id = 3;

-- 10. EINE NGO VERIFIZIEREN
-- Ersetzen Sie die 4 durch die tatsächliche NGO-Benutzer-ID (is_company muss true sein)
UPDATE users 
SET is_verified = true
WHERE id = 4 AND is_company = true;

-- 11. AUSSTEHENDE NGOs ANZEIGEN (WARTEND)
SELECT id, username, company_name, email, created_at
FROM users
WHERE is_company = true AND is_verified = false AND is_banned = false
ORDER BY created_at ASC;

-- 12. VERIFIZIERTE NGOs ANZEIGEN
SELECT id, username, company_name, email, created_at
FROM users
WHERE is_company = true AND is_verified = true
ORDER BY created_at ASC;

-- 13. EINE ADMIN-AKTION IM PROTOKOLL SIMULIEREN
INSERT INTO admin_logs (admin_id, action, target_type, target_id, description)
VALUES (
  1,  -- Durch tatsächliche Admin-ID ersetzen
  'TEST_ACTION',
  'user',
  2,  -- Durch tatsächliche Ziel-ID ersetzen
  'Dies ist eine Test-Admin-Aktion'
);

-- 14. ADMIN-PROTOKOLLE ANZEIGEN
SELECT al.id, u.username as admin_name, al.action, al.target_type, al.description, al.created_at
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;

-- 15. EINE CONTENT-MELDUNG SIMULIEREN
INSERT INTO content_reports (reporter_id, content_type, content_id, reason, description, status)
VALUES (
  2,  -- Durch tatsächliche Melder-ID ersetzen
  'donation',
  1,  -- Durch tatsächliche Inhalts-ID ersetzen
  'Spam-Inhalt',
  'Dieser Inhalt scheint Spam zu sein',
  'pending'
);

-- 16. AUSSTEHENDE MELDUNGEN ANZEIGEN
SELECT id, reporter_id, content_type, reason, status, created_at
FROM content_reports
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 17. GET DASHBOARD STATS
SELECT
  (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
  (SELECT COUNT(*) FROM users WHERE is_company = true AND role = 'user') as total_ngos,
  (SELECT COUNT(*) FROM users WHERE is_company = true AND is_verified = true) as verified_ngos,
  (SELECT COUNT(*) FROM users WHERE is_banned = true) as banned_users,
  (SELECT COUNT(*) FROM content_reports WHERE status = 'pending') as pending_reports;

-- 18. CLEANUP TEST DATA (Optional)
-- WARNING: Be careful with deletions!
-- DELETE FROM admin_logs WHERE description LIKE 'Test%';
-- DELETE FROM content_reports WHERE description LIKE 'Test%';
-- DELETE FROM users WHERE username = 'admin_test';

-- 19. DATABASE SCHEMA CHECK
-- Verify all new columns and tables exist:
\d users
\d admin_logs
\d content_reports

-- End of Test Script
-- These queries help verify the admin system is working correctly
