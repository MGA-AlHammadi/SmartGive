const jwt = require('jsonwebtoken');
const verifyToken = require('../../middlewares/authMiddleware');

describe('Auth Middleware - verifyToken', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
        // Vor jedem Test mocken wir Req, Res und Next
        mockRequest = {
            header: jest.fn(),
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
        
        // Simuliere ein JWT Secret für die Tests
        process.env.JWT_SECRET = 'test_secret';
    });

    afterEach(() => {
        jest.clearAllMocks(); // Setze alle Mocks zurück
    });

    it('sollte 403 zurückgeben, wenn kein Token bereitgestellt wird', () => {
        // Simuliere: req.header() gibt nichts (undefined) zurück
        mockRequest.header.mockReturnValue(undefined);

        verifyToken(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Kein Token bereitgestellt, Zugriff verweigert' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('sollte 401 zurückgeben, wenn das Token ungültig ist', () => {
        mockRequest.header.mockReturnValue('Bearer invalid_token_xyz');

        // Mache jwt.verify kaputt, sodass es wirft (Error simuliert ungültiges Token)
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('invalid signature');
        });

        verifyToken(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Ungültiges Token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('sollte next() aufrufen und req.user setzen, wenn das Token gültig ist', () => {
        mockRequest.header.mockReturnValue('Bearer valid_token_123');
        const mockDecodedUser = { id: 1, role: 'ngo' };

        // Simuliere, dass jwt.verify erfolgreich die Benutzerdaten ausliest
        jest.spyOn(jwt, 'verify').mockReturnValue(mockDecodedUser);

        verifyToken(mockRequest, mockResponse, nextFunction);

        expect(jwt.verify).toHaveBeenCalledWith('valid_token_123', 'test_secret');
        expect(mockRequest.user).toEqual(mockDecodedUser);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });
});
