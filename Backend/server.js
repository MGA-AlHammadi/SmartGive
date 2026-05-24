require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test Route (kann später geschützt werden)
app.get('/', (req, res) => {
    res.send('SmartGive Backend API läuft erfolgreich!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
