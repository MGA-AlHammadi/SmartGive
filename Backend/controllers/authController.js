const userService = require('../services/userService');
const activityService = require('../services/activityService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mapUserToResponse = (user) => ({
    id: user.id,
    username: user.username,
    firstName: user.firstName || user.first_name,
    lastName: user.lastName || user.last_name,
    email: user.email,
    companyName: user.companyName || user.company_name,
    companyAddress: user.companyAddress || user.company_address,
    companyCountry: user.companyCountry || user.company_country,
    companyCity: user.companyCity || user.company_city,
    phone: user.phone || null,
    profileDescription: user.profileDescription || user.profile_description || null,
    profilePicture: user.profilePicture || user.profile_picture || null,
    createdAt: user.created_at || null,
    isCompany: user.isCompany ?? user.is_company,
    role: user.role || 'user',
    isVerified: user.isVerified ?? user.is_verified ?? false,
    isBanned: user.isBanned ?? user.is_banned ?? false
});

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Überprüfen, ob der Benutzer per E-Mail existiert
        const user = await userService.getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({ message: 'Ungültige E-Mail oder Passwort' });
        }

        // Passwort vergleichen
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Ungültige E-Mail oder Passwort' });
        }

        // JWT erstellen (Gültigkeit auf 24h verlängert für stabiles Testen)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Letzten Login aktualisieren
        await userService.updateLastLogin(user.id);

        res.json({
            message: 'Login erfolgreich',
            token,
            user: mapUserToResponse(user)
        });

    } catch (err) {
        console.error('Fehler beim Login:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

// Hilfsfunktion zur Registrierung (damit du einen Benutzer anlegen kannst zum Einloggen)
const register = async (req, res) => {
    const { username, email, password, firstName, lastName, companyName, address, companyCountry, companyCity, isCompany } = req.body;

    // Einfache Validierung vorab (Zusätzlich zum Zod Middleware als Backup)
    if (isCompany && (!companyCountry || !companyCity)) {
        return res.status(400).json({ message: 'Für NGO-Konten sind Land und Stadt erforderlich' });
    }

    try {
        const companyAddress = isCompany
            ? `${companyCity?.trim() || ''}, ${companyCountry?.trim() || ''}`
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
            companyCountry: companyCountry?.trim() || null,
            companyCity: companyCity?.trim() || null,
            isCompany
        });

        // JWT erstellen für automatischen Login nach Registrierung (24h)
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'Benutzer erfolgreich erstellt', 
            token,
            user: mapUserToResponse(newUser)
        });
    } catch (err) {
        console.error('Fehler bei der Registrierung:', err);
        res.status(500).json({ message: 'Fehler bei der Registrierung (Möglicherweise existiert der Username schon)' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        res.json({ user: mapUserToResponse(user) });
    } catch (err) {
        console.error('Fehler beim Laden des Profils:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        res.json({ user: mapUserToResponse(user) });
    } catch (err) {
        console.error('Fehler beim Laden des öffentlichen Profils:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const updateMe = async (req, res) => {
    try {
        const existingUser = await userService.getUserById(req.user.id);

        if (!existingUser) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden' });
        }

        const {
            firstName,
            lastName,
            companyName,
            companyCountry,
            companyCity,
            phone,
            profileDescription
        } = req.body;

        if ((companyCountry && !companyCity) || (!companyCountry && companyCity)) {
            return res.status(400).json({ message: 'Land und Stadt müssen zusammen angegeben werden' });
        }

        const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updatedUser = await userService.updateUserProfile(req.user.id, {
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            companyName: companyName?.trim() || null,
            companyCountry: companyCountry?.trim() || null,
            companyCity: companyCity?.trim() || null,
            phone: phone?.trim() || null,
            profileDescription: profileDescription?.trim() || null,
            profilePicture: profilePicture
        });

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Profil aktualisiert',
            details: 'Kontodaten wurden erfolgreich angepasst.'
        });

        res.json({ message: 'Profil aktualisiert', user: mapUserToResponse(updatedUser) });
    } catch (err) {
        console.error('Fehler beim Aktualisieren des Profils:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const listMyActivities = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const activities = await activityService.listUserActivities(req.user.id, limit);
        res.json({ activities });
    } catch (err) {
        console.error('Fehler beim Laden der Aktivitäten:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

module.exports = { login, register, getMe, updateMe, listMyActivities, getUserProfile };
