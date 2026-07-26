const donationService = require('../services/donationService');
const needService = require('../services/needService');
const userService = require('../services/userService');
const activityService = require('../services/activityService');
const reportService = require('../services/reportService');
const { getIO, getSocketIdByUserId } = require('../config/socket');

const mapFilesToUrls = (files = []) => files.slice(0, 5).map((file) => `/uploads/${file.filename}`);

const createDonation = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user || user.isCompany) {
            return res.status(403).json({ message: 'Nur Spender dürfen Spendenangebote erstellen' });
        }

        const {
            ngoNeedId,
            ngoUserId,
            itemName,
            category,
            gender,
            size,
            quantity,
            condition,
            country,
            city,
            notes
        } = req.body;

        let resolvedNgoUserId = ngoUserId || null;

        if (ngoNeedId) {
            const need = await needService.getNeedById(ngoNeedId);
            if (!need) {
                return res.status(404).json({ message: 'Bedarf nicht gefunden' });
            }
            resolvedNgoUserId = need.ngo_user_id;
        }

        const imageUrls = mapFilesToUrls(req.files);

        const donation = await donationService.createDonation({
            donorUserId: req.user.id,
            ngoNeedId: ngoNeedId || null,
            ngoUserId: resolvedNgoUserId,
            itemName,
            category,
            gender,
            size,
            quantity,
            condition,
            country,
            city,
            notes,
            imageUrls
        });

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Spendenangebot erstellt',
            details: `${donation.item_name} wurde als Angebot gesendet.`
        });

        // Echtzeit-Benachrichtigung an die NGO
        if (resolvedNgoUserId) {
            const ngoSocketId = getSocketIdByUserId(resolvedNgoUserId);
            if (ngoSocketId) {
                getIO().to(ngoSocketId).emit('new_donation', {
                    message: `Nue Spende erhalten: ${donation.item_name}`,
                    donation
                });
            }
        }

        res.status(201).json({ message: 'Spendenangebot erstellt', donation });
    } catch (err) {
        console.error('Fehler beim Erstellen der Spende:', err);
        if (err.code === '23503') {
            return res.status(400).json({ message: 'Ungültige Verknüpfung: Bedarf oder NGO existiert nicht' });
        }
        if (err.code === '23514') {
            return res.status(400).json({ message: 'Ungültige Eingabedaten für die Spende' });
        }
        res.status(500).json({ message: err.message || 'Serverfehler' });
    }
};

const listMyDonations = async (req, res) => {
    try {
        const donations = await donationService.listMyDonations(req.user.id);
        res.json({ donations });
    } catch (err) {
        console.error('Fehler beim Laden eigener Spenden:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const listReceivedDonations = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user?.isCompany) {
            return res.status(403).json({ message: 'Nur NGOs dürfen empfangene Spenden sehen' });
        }

        const donations = await donationService.listReceivedDonations(req.user.id);
        res.json({ donations });
    } catch (err) {
        console.error('Fehler beim Laden empfangener Spenden:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const generateDonationReport = (req, res) => {
    const donationId = req.params.id;
    console.log(`[PDF] Request für Spende ${donationId} empfangen`);

    donationService.getDonationFullDetails(donationId)
        .then(donation => {
            if (!donation) {
                return res.status(404).json({ message: 'Spende nicht gefunden' });
            }

            const doc = reportService.generateDonationPDF(donation);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=SmartGive_Spende_${donationId}.pdf`);

            doc.pipe(res);
            doc.end();
            console.log(`[PDF] Stream gestartet für ${donationId}`);
        })
        .catch(err => {
            console.error('[PDF] Fehler:', err);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Serverfehler beim PDF' });
            }
        });
};

const updateDonationStatus = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user?.isCompany) {
            return res.status(403).json({ message: 'Nur NGOs dürfen den Spendenstatus ändern' });
        }

        const { status } = req.body;
        const allowedStatuses = ['accepted', 'rejected', 'in_transit', 'delivered', 'cancelled'];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Ungültiger Spendenstatus' });
        }

        const donation = await donationService.getDonationById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Spende nicht gefunden' });
        }

        if (donation.ngo_user_id && donation.ngo_user_id !== req.user.id) {
            return res.status(403).json({ message: 'Kein Zugriff auf diese Spende' });
        }

        const isPublicOffer = !donation.ngo_user_id && !donation.ngo_need_id;
        if (isPublicOffer && status === 'rejected') {
            return res.status(400).json({ message: 'Öffentliche Angebote können nur angenommen werden' });
        }

        const updatedDonation = await donationService.updateDonationStatus(req.params.id, status, req.user.id);

        // Benachrichtigung für die NGO (Akteur)
        await activityService.createActivity({
            userId: req.user.id,
            title: 'Spendenstatus geändert',
            details: `Du hast die Spende "${donation.item_name}" als "${status}" markiert.`
        });

        // Benachrichtigung für den Spender (Besitzer der Spende)
        await activityService.createActivity({
            userId: donation.donor_user_id,
            title: status === 'accepted' ? 'Spende angenommen!' 
                 : (status === 'delivered' ? 'Spende erfolgreich erhalten!' 
                 : (status === 'rejected' ? 'Spende abgelehnt' 
                 : 'Spendenstatus aktualisiert')),
            details: status === 'accepted' 
                ? `Deine Spende "${donation.item_name}" wurde von der NGO akzeptiert.` 
                : (status === 'delivered' 
                    ? `Deine Spende "${donation.item_name}" wurde als erhalten markiert. Herzlichen Dank für deine Unterstützung!`
                    : (status === 'rejected' 
                        ? `Deine Spende "${donation.item_name}" wurde leider abgelehnt.`
                        : `Der Status deiner Spende "${donation.item_name}" wurde auf "${status}" geändert.`))
        });

        res.json({ message: 'Spendenstatus aktualisiert', donation: updatedDonation });
    } catch (err) {
        console.error('Fehler beim Aktualisieren des Spendenstatus:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const updateDonationByOwner = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user || user.isCompany) {
            return res.status(403).json({ message: 'Nur Spender dürfen eigene Spenden bearbeiten' });
        }

        const imageUrls = req.files?.length ? mapFilesToUrls(req.files) : null;

        const updatedDonation = await donationService.updateDonationByOwner(req.params.id, req.user.id, {
            ...req.body,
            imageUrls
        });

        if (!updatedDonation) {
            return res.status(404).json({ message: 'Spende nicht gefunden oder kein Zugriff' });
        }

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Spendenangebot aktualisiert',
            details: `${updatedDonation.item_name} wurde bearbeitet.`
        });

        res.json({ message: 'Spende aktualisiert', donation: updatedDonation });
    } catch (err) {
        console.error('Fehler beim Bearbeiten der Spende:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

const deleteDonationByOwner = async (req, res) => {
    try {
        const user = await userService.getUserById(req.user.id);

        if (!user || user.isCompany) {
            return res.status(403).json({ message: 'Nur Spender dürfen eigene Spenden löschen' });
        }

        const deletedDonation = await donationService.deleteDonationByOwner(req.params.id, req.user.id);
        if (!deletedDonation) {
            return res.status(404).json({ message: 'Spende nicht gefunden oder kein Zugriff' });
        }

        await activityService.createActivity({
            userId: req.user.id,
            title: 'Spendenangebot gelöscht',
            details: 'Ein eigenes Spendenangebot wurde entfernt.'
        });

        res.json({ message: 'Spende gelöscht' });
    } catch (err) {
        console.error('Fehler beim Löschen der Spende:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
};

module.exports = {
    createDonation,
    listMyDonations,
    listReceivedDonations,
    generateDonationReport,
    updateDonationStatus,
    updateDonationByOwner,
    deleteDonationByOwner
};
