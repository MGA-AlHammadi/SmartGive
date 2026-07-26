const messageService = require('../../services/messageService');
const db = require('../../config/db');

/**
 * Unit Tests für den Message Service.
 * Dieses Modul testet die Geschäftslogik für den Nachrichtenversand und die Konversationsverwaltung.
 */
jest.mock('../../config/db');

describe('Message Service Unit Tests', () => {
    
    // Nach jedem Testfall die Mocks zurücksetzen, um Seiteneffekte zu vermeiden
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendMessage', () => {
        it('sollte eine Nachricht erfolgreich in der Datenbank speichern', async () => {
            const mockMessage = {
                id: 100,
                sender_id: 1,
                receiver_id: 2,
                content: 'Hallo, ich interessiere mich für die Spende',
                created_at: '2026-07-26T10:00:00Z',
                is_read: false
            };

            // Simuliere die Antwort der Datenbank für ein erfolgreiches INSERT
            db.query.mockResolvedValue({ rows: [mockMessage] });

            const result = await messageService.sendMessage(1, 2, 'Hallo, ich interessiere mich für die Spende');

            // Verifizieren, ob das SQL-Query mit den richtigen Parametern aufgerufen wurde
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO messages'),
                [1, 2, 'Hallo, ich interessiere mich für die Spende']
            );
            expect(result).toEqual(mockMessage);
        });
    });

    describe('getMessagesBetweenUsers', () => {
        it('sollte den Nachrichtenverlauf zwischen zwei Benutzern abrufen', async () => {
            const mockHistory = [
                { id: 1, sender_id: 1, content: 'Hi', sender_username: 'user1' },
                { id: 2, sender_id: 2, content: 'Hallo', sender_username: 'user2' }
            ];

            // Simuliere die Antwort der Datenbank für ein SELECT mit Service-Joins
            db.query.mockResolvedValue({ rows: mockHistory });

            const result = await messageService.getMessagesBetweenUsers(1, 2);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/SELECT\s+m\.\*,\s+u1\.username/),
                [1, 2]
            );
            expect(result).toHaveLength(2);
            expect(result[0].content).toBe('Hi');
        });
    });

    describe('getUserConversations', () => {
        it('sollte eine Liste aller Konversationen eines Benutzers zurückgeben', async () => {
            const mockConversations = [
                { 
                    other_user_id: 2, 
                    other_username: 'ngo_berlin', 
                    content: 'Letzte Nachricht...', 
                    created_at: '2026-07-26T12:00:00Z' 
                }
            ];

            // Simuliere das komplexe WITH-Query für die Übersicht der Konversationen
            db.query.mockResolvedValue({ rows: mockConversations });

            const result = await messageService.getUserConversations(1);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WITH LastMessages AS'),
                [1]
            );
            expect(result).toEqual(mockConversations);
        });
    });

    describe('markAsRead', () => {
        it('sollte Nachrichten als gelesen markieren', async () => {
            // Simuliere eine erfolgreiche Aktualisierung ohne Rückgabedaten
            db.query.mockResolvedValue({ rowCount: 1 });

            await messageService.markAsRead(1, 2);

            // Verifizieren, ob das UPDATE-Statement korrekt ausgeführt wurde
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE messages SET is_read = TRUE'),
                [1, 2]
            );
        });
    });
});
