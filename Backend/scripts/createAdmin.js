const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

const createAdmin = async () => {
    try {
        const username = 'mohammd';
        const email = 'mhmad08@hotmail.com';
        const password = 'admin';
        const firstName = 'Mohammd';
        const lastName = 'Admin';

        console.log('\n🛡️  Creating admin user...\n');
        console.log(`Username: ${username}`);
        console.log(`Email: ${email}`);
        console.log(`Name: ${firstName} ${lastName}\n`);

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            console.log('⚠️  User already exists!\n');
            console.log('Updating to admin role and password...\n');
            
            // Hash the password
            console.log('🔐 Hashing password...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            const result = await db.query(
                'UPDATE users SET role = $1, password_hash = $2 WHERE email = $3 OR username = $4 RETURNING id, username, email, role, created_at',
                ['admin', passwordHash, email, username]
            );

            console.log('✅ Admin user updated successfully!\n');
            console.log('User Details:');
            console.log(`  ID: ${result.rows[0].id}`);
            console.log(`  Username: ${result.rows[0].username}`);
            console.log(`  Email: ${result.rows[0].email}`);
            console.log(`  Role: ${result.rows[0].role}`);
            console.log(`  Updated: ${result.rows[0].created_at}\n`);
            console.log('🎉 You can now login with:');
            console.log(`  Username: ${username}`);
            console.log(`  Password: ${password}\n`);
            return;
        }

        // Hash the password
        console.log('🔐 Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert new admin user
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, username, email, role, created_at',
            [username, email, passwordHash, firstName, lastName, 'admin', false]
        );

        console.log('✅ Admin user created successfully!\n');
        console.log('User Details:');
        console.log(`  ID: ${result.rows[0].id}`);
        console.log(`  Username: ${result.rows[0].username}`);
        console.log(`  Email: ${result.rows[0].email}`);
        console.log(`  Role: ${result.rows[0].role}`);
        console.log(`  Created: ${result.rows[0].created_at}\n`);
        console.log('🎉 You can now login with:');
        console.log(`  Username: ${username}`);
        console.log(`  Password: ${password}\n`);

    } catch (err) {
        console.error('\n❌ Error creating admin user:', err.message);
        process.exit(1);
    }
};

// Run script
createAdmin().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
