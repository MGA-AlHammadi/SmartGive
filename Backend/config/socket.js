const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*', // In Produktion einschränken
            methods: ['GET', 'POST']
        }
    });

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentifizierung erforderlich'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Ungültiges Token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} verbunden via Socket ${socket.id}`);

        socket.on('disconnect', () => {
            userSockets.delete(userId);
            console.log(`User ${userId} getrennt`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io nicht initialisiert!');
    }
    return io;
};

const getSocketIdByUserId = (userId) => {
    return userSockets.get(userId);
};

module.exports = { initSocket, getIO, getSocketIdByUserId };
