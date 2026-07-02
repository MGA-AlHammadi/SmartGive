const PDFDocument = require('pdfkit');

/**
 * Generiert ein PDF-Dokument als Stream.
 * @param {Object} donation - Die Spendendaten inklusive NGO- und Spendernamen.
 * @returns {PDFDocument} - Das PDFKit Dokument.
 */
const generateDonationPDF = (donation) => {
    const doc = new PDFDocument({ margin: 50, autoFirstPage: true });

    // Handle errors on the stream
    doc.on('error', (err) => {
        console.error('PDFKit error:', err);
    });

    try {
        // Header
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('SmartGive - Spendenbestätigung', { align: 'center' })
            .moveDown();

        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, 90)
            .lineTo(550, 90)
            .stroke();

        doc.moveDown(2);

        // Spender Information
        doc
            .fontSize(12)
            .fillColor('#000000')
            .text('Spender:', { continued: true })
            .font('Helvetica-Bold')
            .text(` ${donation.donor_first_name} ${donation.donor_last_name}`)
            .font('Helvetica')
            .moveDown(0.5);

        // NGO Information
        doc
            .text('Begünstigte NGO:', { continued: true })
            .font('Helvetica-Bold')
            .text(` ${donation.ngo_name || 'Allgemeine Spende'}`)
            .font('Helvetica')
            .moveDown(2);

        // Spendendetails
        doc
            .fontSize(16)
            .text('Details der Spende', { underline: true })
            .moveDown();

        doc
            .fontSize(12)
            .text(`Bezeichnung: ${donation.item_name || 'Keine Angabe'}`)
            .text(`Kategorie: ${donation.category || 'Keine Angabe'}`)
            .text(`Menge: ${donation.quantity || 0}`)
            .text(`Zustand: ${donation.condition === 'new' ? 'Neu' : donation.condition === 'like_new' ? 'Wie neu' : donation.condition === 'good' ? 'Gut' : donation.condition === 'acceptable' ? 'Akzeptabel' : 'Keine Angabe'}`)
            .moveDown();

        if (donation.need_title) {
            doc.text(`Zugeordneter Bedarf: ${donation.need_title}`).moveDown();
        }

        doc
            .text(`Ort: ${donation.city || 'Unbekannt'}, ${donation.country || 'Unbekannt'}`)
            .text(`Datum der Erstellung: ${donation.created_at ? new Date(donation.created_at).toLocaleDateString('de-DE') : 'Unbekannt'}`);

        if (donation.delivered_at) {
            doc.text(`Datum der Zustellung: ${new Date(donation.delivered_at).toLocaleDateString('de-DE')}`);
        }

        doc.moveDown(2);

        // Footer / Dankeschön
        doc
            .fillColor('#2d6a4f')
            .fontSize(14)
            .text('Vielen Dank für deine großzügige Spende!', { align: 'center' })
            .moveDown();

        doc
            .fillColor('#444444')
            .fontSize(10)
            .text('Dies ist eine automatisch generierte Bestätigung von SmartGive.', { align: 'center' });

        // Wir rufen hier doc.end() NICHT auf, sondern lassen es den Controller machen
        return doc;
    } catch (pdfErr) {
        console.error('Error during PDF generation logic:', pdfErr);
        // Im Fehlerfall trotzdem das Dokument zurückgeben, damit der Stream nicht hängt
        return doc;
    }
};

module.exports = {
    generateDonationPDF
};
