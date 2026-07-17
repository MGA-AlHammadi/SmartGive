const db = require('../config/db');
require('dotenv').config();

const checkAdmin = async () => {
    try {
        console.log('\n🔍 Checking admin user in database...\n');
        
        const result = await db.query(
            'SELECT id, username, email, role, password_hash FROM users WHERE email = $1',
            ['mhmad08@hotmail.com']
        );

        if (result.rows.length === 0) {
            console.log('❌ Admin user NOT found in database!');
            process.exit(1);
        }

        const user = result.rows[0];
        console.log('✅ Admin user found:');
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Password Hash exists: ${!!user.password_hash}`);
        console.log(`  Password Hash length: ${user.password_hash ? user.password_hash.length : 0}\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

checkAdmin();
