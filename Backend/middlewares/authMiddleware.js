const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Hole Token aus Header
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ message: 'Kein Token bereitgestellt, Zugriff verweigert' });
    }

    try {
        // Erwartet Format: "Bearer <token>"
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Setze decodierten Payload auf req.user
        next(); // Gehe zur nächsten Middleware/Route
    } catch (err) {
        console.error('Token-Verifizierung fehlgeschlagen:', err.message);
        return res.status(401).json({ message: 'Ungültiges Token' });
    }
};

module.exports = verifyToken;
