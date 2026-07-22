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

        console.log('\n🛡️  Admin-Benutzer wird erstellt...\n');
        console.log(`Benutzername: ${username}`);
        console.log(`E-Mail: ${email}`);
        console.log(`Name: ${firstName} ${lastName}\n`);

        // Überprüfen, ob der Benutzer bereits existiert
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            console.log('⚠️  Benutzer existiert bereits!\n');
            console.log('Aktualisierung auf Admin-Rolle und Passwort...\n');
            
            // Passwort hashen
            console.log('🔐 Passwort wird gehasht...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            const result = await db.query(
                'UPDATE users SET role = $1, password_hash = $2 WHERE email = $3 OR username = $4 RETURNING id, username, email, role, created_at',
                ['admin', passwordHash, email, username]
            );

            console.log('✅ Admin-Benutzer erfolgreich aktualisiert!\n');
            console.log('Benutzerdetails:');
            console.log(`  ID: ${result.rows[0].id}`);
            console.log(`  Benutzername: ${result.rows[0].username}`);
            console.log(`  E-Mail: ${result.rows[0].email}`);
            console.log(`  Rolle: ${result.rows[0].role}`);
            console.log(`  Aktualisiert am: ${result.rows[0].created_at}\n`);
            console.log('🎉 Sie können sich jetzt einloggen mit:');
            console.log(`  Benutzername: ${username}`);
            console.log(`  Passwort: ${password}\n`);
            return;
        }

        // Passwort hashen
        console.log('🔐 Passwort wird gehasht...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Neuen Admin-Benutzer einfügen
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, username, email, role, created_at',
            [username, email, passwordHash, firstName, lastName, 'admin', false]
        );

        console.log('✅ Admin-Benutzer erfolgreich erstellt!\n');
        console.log('Benutzerdetails:');
        console.log(`  ID: ${result.rows[0].id}`);
        console.log(`  Benutzername: ${result.rows[0].username}`);
        console.log(`  E-Mail: ${result.rows[0].email}`);
        console.log(`  Rolle: ${result.rows[0].role}`);
        console.log(`  Erstellt am: ${result.rows[0].created_at}\n`);
        console.log('🎉 Sie können sich jetzt einloggen mit:');
        console.log(`  Benutzername: ${username}`);
        console.log(`  Passwort: ${password}\n`);

    } catch (err) {
        console.error('\n❌ Fehler beim Erstellen des Admin-Benutzers:', err.message);
        process.exit(1);
    }
};

// Skript ausführen
createAdmin().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
