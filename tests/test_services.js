
const AuthService = require('../services/authService');
const ChallengeService = require('../services/challengeService');
const ParticipantService = require('../services/participantService');
const RecompenseService = require('../services/recompenseService');
const Utilisateur = require('../models/Utilisateur');
const Challenge = require('../models/Challenge');
const Participant = require('../models/Participant');
const Performance = require('../models/Performance');
const Critere = require('../models/Critere');
const bcrypt = require('bcrypt');

async function runTests() {
    console.log("Démarrage des tests de services...");

    // Initialisation de la base de données pour les tests
    const db = new (require('sqlite3').verbose().Database)('./database/starchallenge.db');
    // ... (vous pouvez ajouter ici une initialisation de base de données propre aux tests)

    // Test 1: Authentification
    console.log("\n--- Test d'authentification ---");
    const mdp = 'password123';
    const mdpHash = await bcrypt.hash(mdp, 10);
    const user = new Utilisateur('user1', 'Test User', 'test@example.com', mdpHash, 'participant');
    await Utilisateur.add(user);
    const loggedInUser = await AuthService.verifierLogin('test@example.com', mdp);
    console.log('Utilisateur connecté:', loggedInUser ? loggedInUser.nom : 'Échec de la connexion');

    // Test 2: Logique de Challenge
    console.log("\n--- Test de la logique de challenge ---");
    const challenge = new Challenge('chal1', 'Challenge de Test', new Date(), new Date(), 'en cours', 'user1');
    await Challenge.add(challenge);
    const participant1 = new Participant('part1', 'user1', 'chal1', 0);
    await Participant.add(participant1);
    const critere = new Critere('crit1', 'Critère 1', 1.5, 'chal1');
    await Critere.add(critere);
    const performance = new Performance('perf1', 'part1', 100, 1, JSON.stringify({ critereId: 'crit1' }));
    await Performance.add(performance);

    const score = await ParticipantService.calculerScoreTotal('part1');
    console.log(`Score calculé pour le participant 1: ${score}`);

    const classement = await ChallengeService.calculerClassement('chal1');
    console.log('Classement du challenge:', classement);

    const gagnants = await ChallengeService.determinerGagnants('chal1', 1);
    console.log('Gagnants déterminés:', gagnants);

    // Test 3: Récompenses
    console.log("\n--- Test des récompenses ---");
    await RecompenseService.calculerEtoiles('perf1');
    const recompenses = await RecompenseService.debloquerSiPalierAtteint('user1');
    console.log('Récompenses débloquées:', recompenses);

    console.log("\nTests terminés.");
    db.close();
}

runTests();
