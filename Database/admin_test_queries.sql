-- Admin Panel Test & Demo Script
-- Run this AFTER migration 008 has been applied

-- 1. CREATE TEST ADMIN USER
-- (If you don't already have one)
INSERT INTO users (username, password_hash, first_name, last_name, email, is_company, role)
VALUES (
  'admin_test',
  '$2a$10$...',  -- bcrypt hash for password 'password123'
  'Test',
  'Admin',
  'admin@smartgive.de',
  false,
  'admin'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 2. VERIFY ADMIN USER WAS CREATED
SELECT id, username, email, role, created_at FROM users WHERE role = 'admin';

-- 3. CHECK ADMIN-SPECIFIC COLUMNS
SELECT id, username, role, is_verified, is_banned, ban_reason FROM users LIMIT 5;

-- 4. TEST ADMIN LOGS TABLE
SELECT * FROM admin_logs LIMIT 5;

-- 5. TEST CONTENT REPORTS TABLE
SELECT * FROM content_reports LIMIT 5;

-- 6. PROMOTE EXISTING USER TO ADMIN
-- Replace 2 with actual user ID
UPDATE users SET role = 'admin' WHERE id = 2;

-- 7. DEMOTE ADMIN BACK TO USER
-- Replace 2 with actual user ID
UPDATE users SET role = 'user' WHERE id = 2;

-- 8. BAN A USER
-- Replace 3 with actual user ID
UPDATE users 
SET is_banned = true, ban_reason = 'Test: Spam activity'
WHERE id = 3;

-- 9. UNBAN A USER
UPDATE users 
SET is_banned = false, ban_reason = NULL
WHERE id = 3;

-- 10. VERIFY AN NGO
-- Replace 4 with actual NGO user ID (where is_company = true)
UPDATE users 
SET is_verified = true
WHERE id = 4 AND is_company = true;

-- 11. VIEW UNVERIFIED NGOs (PENDING)
SELECT id, username, company_name, email, created_at
FROM users
WHERE is_company = true AND is_verified = false AND is_banned = false
ORDER BY created_at ASC;

-- 12. VIEW VERIFIED NGOs
SELECT id, username, company_name, email, created_at
FROM users
WHERE is_company = true AND is_verified = true
ORDER BY created_at ASC;

-- 13. MOCK AN ADMIN ACTION IN LOGS
INSERT INTO admin_logs (admin_id, action, target_type, target_id, description)
VALUES (
  1,  -- Replace with actual admin ID
  'TEST_ACTION',
  'user',
  2,  -- Replace with actual target ID
  'This is a test admin action'
);

-- 14. VIEW ADMIN LOGS
SELECT al.id, u.username as admin_name, al.action, al.target_type, al.description, al.created_at
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;

-- 15. MOCK A CONTENT REPORT
INSERT INTO content_reports (reporter_id, content_type, content_id, reason, description, status)
VALUES (
  2,  -- Replace with actual reporter ID
  'donation',
  1,  -- Replace with actual content ID
  'Spam Content',
  'This content appears to be spam',
  'pending'
);

-- 16. VIEW PENDING REPORTS
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
