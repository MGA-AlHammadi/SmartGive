const needService = require('../services/needService');
const userService = require('../services/userService');
const activityService = require('../services/activityService');

const mapFilesToUrls = (files = []) => files.slice(0, 5).map((file) => `/uploads/${file.filename}`);

const createNeed = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user?.isCompany) {
            return res.status(403).json({ message: 'Nur NGOs dürfen Bedarfe erstellen' });
        }

        const {
            title,
            category,
            gender,
            size,
            quantityNeeded,
            country,
            city,
            description,
            neededBy
        } = req.body;

        const parsedQuantityNeeded = Number(quantityNeeded);
        const normalizedNeededBy = neededBy ? String(neededBy).trim() : null;
        const imageUrls = mapFilesToUrls(req.files);

        const need = await needService.createNeed({
            ngoUserId: req.user.id,
            title: title.trim(),
            category: category.trim(),
            gender: gender?.trim() || null,
            size: size?.trim() || null,
            quantityNeeded: parsedQuantityNeeded,
            country: country.trim(),
            city: city.trim(),
            description: description?.trim() || null,
            neededBy: normalizedNeededBy || null,
            imageUrls
        });

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Neuen Bedarf erstellt',
            details: `${need.title} wurde als Bedarf veröffentlicht.`
        });

        res.status(201).json({ message: 'Bedarf erstellt', need });
    } catch (err) {
        console.error('Fehler beim Erstellen des Bedarfs:', err);
        if (err.code === '22P02' || err.code === '22007') {
            return res.status(400).json({ message: 'Ungültige Datums- oder Zahlenwerte im Formular' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ message: 'Ungültiger NGO-Benutzer für diesen Bedarf' });
        }
        if (err.code === '23514') {
            return res.status(400).json({ message: 'Ungültige Eingabedaten für den Bedarf' });
        }
        res.status(500).json({ message: err.message || 'Serverfehler' });
    }
};

const listNeeds = async (req, res) => {
    try {
        const { category, city, country, status } = req.query;
        const needs = await needService.listNeeds({ category, city, country, status });
        res.json({ needs });
    } catch (err) {
        console.error('Fehler beim Laden der Bedarfe:', err);
        if (err.code === '42P01') {
            return res.status(500).json({ message: 'Datenbanktabellen fehlen. Bitte Migration 002 ausführen.' });
        }
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const updateNeed = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user?.isCompany) {
            return res.status(403).json({ message: 'Nur NGOs dürfen Bedarfe ändern' });
        }

        const allowedStatuses = ['active', 'fulfilled', 'closed'];
        if (req.body.status && !allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Ungültiger Bedarf-Status' });
        }

        const imageUrls = req.files?.length ? mapFilesToUrls(req.files) : null;

        const updatedNeed = await needService.updateNeed(req.params.id, req.user.id, {
            ...req.body,
            imageUrls
        });

        if (!updatedNeed) {
            return res.status(404).json({ message: 'Bedarf nicht gefunden oder kein Zugriff' });
        }

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Bedarf aktualisiert',
            details: `${updatedNeed.title} wurde bearbeitet.`
        });

        res.json({ message: 'Bedarf aktualisiert', need: updatedNeed });
    } catch (err) {
        console.error('Fehler beim Aktualisieren des Bedarfs:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const deleteNeed = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user?.isCompany) {
            return res.status(403).json({ message: 'Nur NGOs dürfen Bedarfe löschen' });
        }

        const deleted = await needService.deleteNeed(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Bedarf nicht gefunden oder kein Zugriff' });
        }

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Bedarf gelöscht',
            details: 'Ein Bedarfseintrag wurde entfernt.'
        });

        res.json({ message: 'Bedarf gelöscht' });
    } catch (err) {
        console.error('Fehler beim Löschen des Bedarfs:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

module.exports = {
    createNeed,
    listNeeds,
    updateNeed,
    deleteNeed
};
