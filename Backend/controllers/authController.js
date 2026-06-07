const userService = require('../services/userService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Prüfe, ob der Benutzer existiert über den Service
        const user = await userService.getUserByUsername(username);
        
        if (!user) {
            return res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
        }

        // Passwort abgleichen
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
        }

        // JWT erstellen (Gültig für 1 Stunde)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // Letzten Login aktualisieren über den Service
        await userService.updateLastLogin(user.id);

        res.json({
            message: 'Login erfolgreich',
            token,
            user: {
                id: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                companyName: user.company_name,
                isCompany: user.isCompany
            }
        });

    } catch (err) {
        console.error('Fehler beim Login:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

// Hilfsfunktion zur Registrierung (damit du einen Benutzer anlegen kannst zum Einloggen)
const register = async (req, res) => {
    const { username, email, password, firstName, lastName, companyName, address, companyCountry, companyCity, isCompany } = req.body;

    try {
        if (isCompany && (!companyCountry?.trim() || !companyCity?.trim())) {
            return res.status(400).json({ message: 'Für NGO-Konten sind Land und Stadt erforderlich' });
        }

        const companyAddress = isCompany
            ? `${companyCity.trim()}, ${companyCountry.trim()}`
            : (address || null);

        // Passwort hashen
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Nutzer über den Service erstellen
        const newUser = await userService.createUser({
            username,
            email,
            passwordHash,
            firstName,
            lastName,
            companyName,
            address: companyAddress,
            isCompany
        });

        // JWT erstellen für automatischen Login nach Registrierung
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'Benutzer erfolgreich erstellt', 
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                companyName: newUser.companyName,
                isCompany: newUser.isCompany
            }
        });
    } catch (err) {
        console.error('Fehler bei der Registrierung:', err);
        res.status(500).json({ message: 'Fehler bei der Registrierung (Möglicherweise existiert der Username schon)' });
    }
};

module.exports = { login, register };
