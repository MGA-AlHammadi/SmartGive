const authController = require('../../controllers/authController');
const userService = require('../../services/userService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Wir mocken die Services und externen Bibliotheken, um nicht die echte DB anzusprechen
jest.mock('../../services/userService');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Frischer Setup für jeden Test
        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('sollte 401 zurückgeben, wenn der Benutzer nicht existiert', async () => {
            mockReq.body = { username: 'testuser', password: 'password123' };
            
            // Simuliere: User nicht in der Datenbank gefunden
            userService.getUserByUsername.mockResolvedValue(null);

            await authController.login(mockReq, mockRes);

            expect(userService.getUserByUsername).toHaveBeenCalledWith('testuser');
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Ungültiger Benutzername oder Passwort' });
        });

        it('sollte 401 zurückgeben, wenn das Passwort falsch ist', async () => {
             mockReq.body = { username: 'testuser', password: 'wrongpassword' };
             const mockUser = { id: 1, username: 'testuser', password_hash: 'hashedpassword' };
             
             userService.getUserByUsername.mockResolvedValue(mockUser);
             // Simuliere: bcrypt.compare gibt false zurück (Passwort stimmt nicht überein)
             bcrypt.compare.mockResolvedValue(false);

             await authController.login(mockReq, mockRes);

             expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
             expect(mockRes.status).toHaveBeenCalledWith(401);
             expect(mockRes.json).toHaveBeenCalledWith({ message: 'Ungültiger Benutzername oder Passwort' });
        });

        it('sollte sich erfolgreich einloggen, JWT erstellen und Nutzerdaten zurückgeben', async () => {
            mockReq.body = { username: 'testuser', password: 'correctpassword' };
            const mockUser = { 
                id: 1, 
                username: 'testuser', 
                password_hash: 'hashedpassword',
                first_name: 'Max',
                last_name: 'Mustermann',
                is_company: false
            };
            
            userService.getUserByUsername.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fake_jwt_token_123');
            userService.updateLastLogin.mockResolvedValue();

            await authController.login(mockReq, mockRes);

            expect(jwt.sign).toHaveBeenCalled();
            expect(userService.updateLastLogin).toHaveBeenCalledWith(1);
            
            // Verifiziere das die Antwort den Token und die korrekten User-Daten beinhaltet
            expect(mockRes.json).toHaveBeenCalledWith({
                 message: 'Login erfolgreich',
                 token: 'fake_jwt_token_123',
                 user: expect.objectContaining({
                     id: 1,
                     username: 'testuser',
                     firstName: 'Max',
                     lastName: 'Mustermann',
                     isCompany: false
                 })
            });
            expect(mockRes.status).not.toHaveBeenCalled(); // Default 200, kein expliziter Status nötig
        });
    });

    describe('register', () => {
         it('sollte 400 zurückgeben, wenn ein NGO-Konto keine Stadt oder kein Land angibt', async () => {
              mockReq.body = { 
                  username: 'ngo_user', 
                  password: 'password123',
                  isCompany: true,
                  companyCountry: 'Deutschland' // Fehlende city
              };

              await authController.register(mockReq, mockRes);

              expect(mockRes.status).toHaveBeenCalledWith(400);
              expect(mockRes.json).toHaveBeenCalledWith({ message: 'Für NGO-Konten sind Land und Stadt erforderlich' });
         });

         it('sollte erfolgreich registrieren und das Passwort hashen', async () => {
             mockReq.body = {
                username: 'newuser',
                email: 'test@test.com',
                password: 'plainpassword',
                isCompany: false
             };

             const mockNewUser = {
                 id: 2,
                 username: 'newuser',
                 email: 'test@test.com',
                 is_company: false
             };

             bcrypt.genSalt.mockResolvedValue('fakesalt');
             bcrypt.hash.mockResolvedValue('hashedpassword');
             userService.createUser.mockResolvedValue(mockNewUser);
             jwt.sign.mockReturnValue('new_jwt_token');

             await authController.register(mockReq, mockRes);

             expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'fakesalt');
             expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
                 username: 'newuser',
                 passwordHash: 'hashedpassword',
                 isCompany: false
             }));
             expect(mockRes.status).toHaveBeenCalledWith(201);
         });
    });
});
