-- สร้าง Admin Account เริ่มต้น
-- This will upgrade an existing user to admin role

-- คำแนะนำ (Instructions):
-- 1. สมัครสมาชิกก่อนที่ /auth/sign-up ด้วย email จริง (เช่น Gmail, Yahoo)
--    ⚠️ ห้ามใช้ @example.com หรือ @test.com (Supabase จะไม่ยอมรับ)
--    Register first at /auth/sign-up with a REAL email (Gmail, Yahoo, etc.)
--    ⚠️ DO NOT use @example.com or @test.com (Supabase will reject them)
--
-- 2. แก้ไข 'YOUR_ACTUAL_EMAIL@gmail.com' ด้านล่างเป็น email ที่คุณใช้สมัคร
--    Replace 'YOUR_ACTUAL_EMAIL@gmail.com' below with your actual registered email
--
-- 3. รัน script นี้เพื่อ upgrade account เป็น admin
--    Run this script to upgrade your account to admin

-- Fixed to use auth.users table correctly with profiles join
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'YOUR_ACTUAL_EMAIL@gmail.com'
  LIMIT 1
);

-- ตรวจสอบว่า update สำเร็จหรือไม่ (Verify the update was successful)
SELECT u.email, p.role, p.created_at
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin';
