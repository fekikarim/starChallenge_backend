require('dotenv').config(); // Charge les variables d'environnement du fichier .env

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de gestion des erreurs (à ajouter à la fin)
const errorMiddleware = require('./controllers/errorController');

// Routes de l'API
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const critereRoutes = require('./routes/critereRoutes');
const participantRoutes = require('./routes/participantRoutes');
const gagnantRoutes = require('./routes/gagnantRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const etoileRoutes = require('./routes/etoileRoutes');
const palierRoutes = require('./routes/palierRoutes');
const recompenseRoutes = require('./routes/recompenseRoutes');

app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/criteres', critereRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/gagnants', gagnantRoutes);
app.use('/api/performances', performanceRoutes);
app.use('/api/etoiles', etoileRoutes);
app.use('/api/paliers', palierRoutes);
app.use('/api/recompenses', recompenseRoutes);

// Utilisation du middleware de gestion des erreurs
app.use(errorMiddleware);

// Démarrage du serveur
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Serveur démarré sur http://localhost:${port}`);
    });
}

module.exports = app;
