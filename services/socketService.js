const { Server } = require('socket.io');
const ChallengeService = require('./challengeService');

/**
 * Service pour gérer les connexions Socket.IO et les mises à jour en temps réel
 */
class SocketService {
    constructor() {
        this.io = null;
        this.connectedClients = new Map();
        this.challengeSubscriptions = new Map(); // challengeId -> Set of socketIds
    }

    /**
     * Initialise le serveur Socket.IO
     * @param {import('http').Server} server - Le serveur HTTP
     */
    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Permettre toutes les origines pour le développement
                methods: ["GET", "POST"],
                credentials: false // Désactiver les credentials pour éviter les problèmes CORS
            },
            transports: ['polling', 'websocket'], // Polling en premier
            allowEIO3: true, // Compatibilité avec les anciennes versions
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.setupEventHandlers();
        console.log('[SocketService] Socket.IO server initialized');
    }

    /**
     * Configure les gestionnaires d'événements Socket.IO
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`[SocketService] Client connected: ${socket.id}`);
            this.connectedClients.set(socket.id, {
                socketId: socket.id,
                connectedAt: new Date(),
                subscribedChallenges: new Set()
            });

            // Événement de souscription à un challenge
            socket.on('subscribe_challenge', (challengeId) => {
                this.subscribeToChallenge(socket, challengeId);
            });

            // Événement de désouscription d'un challenge
            socket.on('unsubscribe_challenge', (challengeId) => {
                this.unsubscribeFromChallenge(socket, challengeId);
            });

            // Événement de demande de classement
            socket.on('request_leaderboard', async (challengeId) => {
                await this.sendLeaderboardUpdate(challengeId, socket.id);
            });

            // Événement de demande de statistiques
            socket.on('request_stats', async (challengeId) => {
                await this.sendStatsUpdate(challengeId, socket.id);
            });

            // Événement de déconnexion
            socket.on('disconnect', () => {
                this.handleDisconnection(socket);
            });

            // Événement de ping pour maintenir la connexion
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: Date.now() });
            });
        });
    }

    /**
     * Souscrit un client à un challenge
     * @param {import('socket.io').Socket} socket - Le socket du client
     * @param {string} challengeId - L'ID du challenge
     */
    subscribeToChallenge(socket, challengeId) {
        const clientInfo = this.connectedClients.get(socket.id);

        // Vérifier si déjà souscrit pour éviter les doublons
        if (clientInfo && clientInfo.subscribedChallenges.has(challengeId)) {
            console.log(`[SocketService] Client ${socket.id} already subscribed to challenge ${challengeId}`);
            return;
        }

        console.log(`[SocketService] Client ${socket.id} subscribing to challenge ${challengeId}`);

        // Ajouter le client à la liste des souscriptions du challenge
        if (!this.challengeSubscriptions.has(challengeId)) {
            this.challengeSubscriptions.set(challengeId, new Set());
        }
        this.challengeSubscriptions.get(challengeId).add(socket.id);

        // Mettre à jour les informations du client
        if (clientInfo) {
            clientInfo.subscribedChallenges.add(challengeId);
        }

        // Rejoindre la room du challenge
        socket.join(`challenge_${challengeId}`);

        // Envoyer immédiatement le classement actuel (une seule fois)
        setTimeout(() => {
            this.sendLeaderboardUpdate(challengeId, socket.id);
            this.sendStatsUpdate(challengeId, socket.id);
        }, 100);

        socket.emit('subscription_confirmed', { challengeId, status: 'subscribed' });
    }

    /**
     * Désabonne un client d'un challenge
     * @param {import('socket.io').Socket} socket - Le socket du client
     * @param {string} challengeId - L'ID du challenge
     */
    unsubscribeFromChallenge(socket, challengeId) {
        console.log(`[SocketService] Client ${socket.id} unsubscribing from challenge ${challengeId}`);
        
        // Retirer le client de la liste des souscriptions
        if (this.challengeSubscriptions.has(challengeId)) {
            this.challengeSubscriptions.get(challengeId).delete(socket.id);
            
            // Supprimer la liste si elle est vide
            if (this.challengeSubscriptions.get(challengeId).size === 0) {
                this.challengeSubscriptions.delete(challengeId);
            }
        }

        // Mettre à jour les informations du client
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
            clientInfo.subscribedChallenges.delete(challengeId);
        }

        // Quitter la room du challenge
        socket.leave(`challenge_${challengeId}`);

        socket.emit('subscription_confirmed', { challengeId, status: 'unsubscribed' });
    }

    /**
     * Gère la déconnexion d'un client
     * @param {import('socket.io').Socket} socket - Le socket du client
     */
    handleDisconnection(socket) {
        console.log(`[SocketService] Client disconnected: ${socket.id}`);
        
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
            // Désabonner de tous les challenges
            clientInfo.subscribedChallenges.forEach(challengeId => {
                if (this.challengeSubscriptions.has(challengeId)) {
                    this.challengeSubscriptions.get(challengeId).delete(socket.id);
                    
                    if (this.challengeSubscriptions.get(challengeId).size === 0) {
                        this.challengeSubscriptions.delete(challengeId);
                    }
                }
            });
        }

        this.connectedClients.delete(socket.id);
    }

    /**
     * Envoie une mise à jour du classement à un client ou à tous les clients d'un challenge
     * @param {string} challengeId - L'ID du challenge
     * @param {string} [targetSocketId] - ID du socket cible (optionnel)
     */
    async sendLeaderboardUpdate(challengeId, targetSocketId = null) {
        try {
            const classement = await ChallengeService.calculerClassement(challengeId);
            const updateData = {
                challengeId,
                classement,
                timestamp: new Date().toISOString(),
                type: 'leaderboard_update'
            };

            if (targetSocketId) {
                // Envoyer à un client spécifique
                this.io.to(targetSocketId).emit('leaderboard_update', updateData);
            } else {
                // Envoyer à tous les clients souscris au challenge
                this.io.to(`challenge_${challengeId}`).emit('leaderboard_update', updateData);
            }

            console.log(`[SocketService] Leaderboard update sent for challenge ${challengeId}`);
        } catch (error) {
            console.error(`[SocketService] Error sending leaderboard update:`, error);
        }
    }

    /**
     * Envoie une mise à jour des statistiques
     * @param {string} challengeId - L'ID du challenge
     * @param {string} [targetSocketId] - ID du socket cible (optionnel)
     */
    async sendStatsUpdate(challengeId, targetSocketId = null) {
        try {
            const classement = await ChallengeService.calculerClassement(challengeId);
            const stats = {
                totalParticipants: classement.length,
                scoreMax: classement.length > 0 ? classement[0].scoreTotal : 0,
                scoreMin: classement.length > 0 ? classement[classement.length - 1].scoreTotal : 0,
                scoreMoyen: classement.length > 0 
                    ? classement.reduce((sum, p) => sum + p.scoreTotal, 0) / classement.length 
                    : 0,
                derniereMiseAJour: new Date().toISOString()
            };

            const updateData = {
                challengeId,
                statistiques: stats,
                timestamp: new Date().toISOString(),
                type: 'stats_update'
            };

            if (targetSocketId) {
                this.io.to(targetSocketId).emit('stats_update', updateData);
            } else {
                this.io.to(`challenge_${challengeId}`).emit('stats_update', updateData);
            }

            console.log(`[SocketService] Stats update sent for challenge ${challengeId}`);
        } catch (error) {
            console.error(`[SocketService] Error sending stats update:`, error);
        }
    }

    /**
     * Notifie tous les clients d'un changement de performance
     * @param {string} participantId - L'ID du participant
     * @param {string} action - L'action effectuée (create, update, delete)
     */
    async notifyPerformanceChange(participantId, action = 'update') {
        try {
            // Récupérer le challenge du participant
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database('./database/starchallenge.db');
            
            const participant = await new Promise((resolve, reject) => {
                db.get('SELECT challengeId FROM Participant WHERE id = ?', [participantId], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
                db.close();
            });

            if (participant && participant.challengeId) {
                // Envoyer les mises à jour à tous les clients souscris
                await this.sendLeaderboardUpdate(participant.challengeId);
                await this.sendStatsUpdate(participant.challengeId);

                // Envoyer une notification de changement
                this.io.to(`challenge_${participant.challengeId}`).emit('performance_change', {
                    participantId,
                    action,
                    challengeId: participant.challengeId,
                    timestamp: new Date().toISOString()
                });

                console.log(`[SocketService] Performance change notification sent for participant ${participantId}`);
            }
        } catch (error) {
            console.error(`[SocketService] Error notifying performance change:`, error);
        }
    }

    /**
     * Obtient les statistiques de connexion
     */
    getConnectionStats() {
        return {
            connectedClients: this.connectedClients.size,
            challengeSubscriptions: Array.from(this.challengeSubscriptions.entries()).map(([challengeId, sockets]) => ({
                challengeId,
                subscribedClients: sockets.size
            }))
        };
    }
}

// Instance singleton
const socketService = new SocketService();

module.exports = socketService;
