const reportService = require('../../services/reportService');

// PDFKit wird gemockt, damit kein echtes PDF-Binary erstellt wird
jest.mock('pdfkit', () => {
    const EventEmitter = require('events');

    const mockDoc = {
        ...EventEmitter.prototype,
        fillColor: jest.fn().mockReturnThis(),
        fontSize: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        strokeColor: jest.fn().mockReturnThis(),
        lineWidth: jest.fn().mockReturnThis(),
        moveTo: jest.fn().mockReturnThis(),
        lineTo: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        pipe: jest.fn().mockReturnThis(),
        end: jest.fn(),
        on: jest.fn().mockReturnThis(),
    };

    return jest.fn(() => mockDoc);
});

describe('reportService - generateDonationPDF', () => {
    const baseDonation = {
        donor_first_name: 'Max',
        donor_last_name: 'Mustermann',
        ngo_name: 'Hilfswerk Berlin',
        item_name: 'Winterjacke',
        category: 'Oberteil',
        quantity: 2,
        condition: 'good',
        country: 'Deutschland',
        city: 'Berlin',
        need_title: 'Jacken für den Winter',
        created_at: '2026-06-30T12:00:00.000Z',
        delivered_at: null
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('sollte ein PDFDocument-Objekt zurückgeben', () => {
        const doc = reportService.generateDonationPDF(baseDonation);
        expect(doc).toBeDefined();
    });

    it('sollte den Spendernamen korrekt in das PDF schreiben', () => {
        const doc = reportService.generateDonationPDF(baseDonation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Max Mustermann');
    });

    it('sollte den NGO-Namen korrekt in das PDF schreiben', () => {
        const doc = reportService.generateDonationPDF(baseDonation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Hilfswerk Berlin');
    });

    it('sollte "Allgemeine Spende" ausgeben, wenn kein NGO-Name vorhanden ist', () => {
        const donation = { ...baseDonation, ngo_name: null };
        reportService.generateDonationPDF(donation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Allgemeine Spende');
    });

    it('sollte den Artikelnamen und die Menge ausgeben', () => {
        const doc = reportService.generateDonationPDF(baseDonation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Winterjacke');
        expect(allTextCalls).toContain('2');
    });

    it('sollte "Keine Angabe" ausgeben, wenn item_name fehlt', () => {
        const donation = { ...baseDonation, item_name: null };
        reportService.generateDonationPDF(donation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Keine Angabe');
    });

    it('sollte den Zustand "Gut" korrekt übersetzen', () => {
        reportService.generateDonationPDF(baseDonation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Gut');
    });

    it('sollte den Zustand "Neu" korrekt übersetzen', () => {
        const donation = { ...baseDonation, condition: 'new' };
        reportService.generateDonationPDF(donation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Neu');
    });

    it('sollte das Zustellungsdatum ausgeben, wenn vorhanden', () => {
        const donation = { ...baseDonation, delivered_at: '2026-07-01T10:00:00.000Z' };
        reportService.generateDonationPDF(donation);
        const PDFDocument = require('pdfkit');
        const instance = PDFDocument.mock.results[0].value;

        const allTextCalls = instance.text.mock.calls.map(call => call[0]).join(' ');
        expect(allTextCalls).toContain('Zustellung');
    });

    it('sollte auch ohne created_at kein Absturz auftreten', () => {
        const donation = { ...baseDonation, created_at: null };
        expect(() => reportService.generateDonationPDF(donation)).not.toThrow();
    });

    it('sollte auch ohne city und country kein Absturz auftreten', () => {
        const donation = { ...baseDonation, city: null, country: null };
        expect(() => reportService.generateDonationPDF(donation)).not.toThrow();
    });
});
