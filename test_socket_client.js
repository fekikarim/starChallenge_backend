const { io } = require('socket.io-client');

console.log('🔌 Test Socket.IO Client');
console.log('Tentative de connexion à http://localhost:3000...');

const socket = io('http://localhost:3000', {
    transports: ['polling', 'websocket'],
    timeout: 10000,
    forceNew: true
});

socket.on('connect', () => {
    console.log('✅ Connecté avec succès !');
    console.log('Socket ID:', socket.id);
    
    // Test de souscription à un challenge
    console.log('📡 Souscription au challenge challenge_test_2...');
    socket.emit('subscribe_to_challenge', 'challenge_test_2');
});

socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Déconnecté:', reason);
});

socket.on('subscription_confirmed', (data) => {
    console.log('✅ Souscription confirmée:', data);
});

socket.on('leaderboard_update', (data) => {
    console.log('📊 Mise à jour du classement reçue:', data);
});

socket.on('stats_update', (data) => {
    console.log('📈 Mise à jour des stats reçue:', data);
});

// Timeout après 15 secondes
setTimeout(() => {
    console.log('⏰ Timeout - Fermeture de la connexion');
    socket.disconnect();
    process.exit(0);
}, 15000);
