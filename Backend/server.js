require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const authRoutes = require('./routes/authRoutes');
const needsRoutes = require('./routes/needsRoutes');
const donationsRoutes = require('./routes/donationsRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const http = require('http');
const { initSocket } = require('./config/socket');

const server = http.createServer(app);

// Socket.io initialisieren
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routen
app.use('/api/auth', authRoutes);
app.use('/api/needs', needsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
    if (!err) {
        return next();
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Maximal 5 Bilder erlaubt' });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Jedes Bild darf höchstens 5MB groß sein' });
    }

    if (err.message === 'Nur Bilddateien sind erlaubt') {
        return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Serverfehler' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
