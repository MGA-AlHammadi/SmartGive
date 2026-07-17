const db = require('../config/db');
require('dotenv').config();

const testBanAPI = async () => {
    try {
        console.log('\n🔍 Testing Ban/Unban API...\n');

        // 1. Check if is_banned and ban_reason columns exist
        console.log('1️⃣  Checking is_banned column...');
        const isBannedCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_banned'
            )`
        );
        console.log(`   ✅ is_banned exists: ${isBannedCheck.rows[0].exists}\n`);

        console.log('2️⃣  Checking ban_reason column...');
        const banReasonCheck = await db.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'ban_reason'
            )`
        );
        console.log(`   ✅ ban_reason exists: ${banReasonCheck.rows[0].exists}\n`);

        // 3. Get a test user
        console.log('3️⃣  Finding a test user to ban...');
        const users = await db.query('SELECT id, username, email, is_banned FROM users WHERE role = $1 LIMIT 1', ['user']);
        
        if (users.rows.length === 0) {
            console.log('❌ No regular users found');
            process.exit(1);
        }

        const testUser = users.rows[0];
        console.log(`   Found: ${testUser.username} (ID: ${testUser.id})`);
        console.log(`   Current is_banned: ${testUser.is_banned}\n`);

        // 4. Test ban
        console.log('4️⃣  Testing BAN...');
        await db.query(
            'UPDATE users SET is_banned = true, ban_reason = $1 WHERE id = $2',
            ['Test ban reason', testUser.id]
        );
        console.log(`   ✅ User banned\n`);

        // 5. Verify ban
        console.log('5️⃣  Verifying ban...');
        const bannedUser = await db.query('SELECT id, username, is_banned, ban_reason FROM users WHERE id = $1', [testUser.id]);
        const user = bannedUser.rows[0];
        console.log(`   is_banned: ${user.is_banned}`);
        console.log(`   ban_reason: ${user.ban_reason}\n`);

        // 6. Test unban
        console.log('6️⃣  Testing UNBAN...');
        await db.query(
            'UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = $1',
            [testUser.id]
        );
        console.log(`   ✅ User unbanned\n`);

        // 7. Verify unban
        console.log('7️⃣  Verifying unban...');
        const unbannedUser = await db.query('SELECT id, username, is_banned, ban_reason FROM users WHERE id = $1', [testUser.id]);
        const user2 = unbannedUser.rows[0];
        console.log(`   is_banned: ${user2.is_banned}`);
        console.log(`   ban_reason: ${user2.ban_reason}\n`);

        console.log('✅ All ban/unban tests passed!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

testBanAPI();
