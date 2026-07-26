const validateMiddleware = require('../../middlewares/validateMiddleware');
const { z } = require('zod');

/**
 * Unit Tests für das Validierungs-Middleware (Zod).
 * Prüft, ob Eingabedaten korrekt validiert werden und Fehlerantworten das richtige Format haben.
 */
describe('Validate Middleware Unit Tests', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    // Test-Schema für die Validierung
    const testSchema = z.object({
        email: z.string().email('Ungültige E-Mail'),
        age: z.number().min(18, 'Muss mindestens 18 sein')
    });

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('sollte next() aufrufen, wenn die Daten gültig sind', () => {
        mockReq = {
            body: {
                email: 'test@example.com',
                age: 25
            }
        };

        const middleware = validateMiddleware(testSchema);
        middleware(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('sollte 400 zurückgeben, wenn die Daten ungültig sind (z.B. falsches E-Mail Format)', () => {
        mockReq = {
            body: {
                email: 'invalid-email',
                age: 20
            }
        };

        const middleware = validateMiddleware(testSchema);
        middleware(mockReq, mockRes, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Validierungsfehler',
            errors: expect.arrayContaining([
                expect.objectContaining({ field: 'email', message: 'Ungültige E-Mail' })
            ])
        }));
    });

    it('sollte 400 zurückgeben, wenn ein Feld fehlt oder unter dem Minimum liegt', () => {
        mockReq = {
            body: {
                email: 'test@example.com',
                age: 15 // Zu jung
            }
        };

        const middleware = validateMiddleware(testSchema);
        middleware(mockReq, mockRes, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.arrayContaining([
                expect.objectContaining({ field: 'age', message: 'Muss mindestens 18 sein' })
            ])
        }));
    });
});
