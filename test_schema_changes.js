const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Modèles
const Critere = require('./models/Critere');
const Participant = require('./models/Participant');
const Performance = require('./models/Performance');

console.log('🧪 Test des changements de schéma de base de données\n');

async function testCritereModel() {
    console.log('📋 Test du modèle Critere avec le champ "type"...');
    
    try {
        // Test de création d'un critère avec type
        const testCritere = new Critere(
            'TEST_CRIT_001',
            'Critère de test',
            10.5,
            'TEST_CHALLENGE_001',
            'quantitatif'
        );
        
        console.log('✅ Création d\'un critère avec type:', testCritere);
        
        // Test d'ajout en base (simulation)
        console.log('   - ID:', testCritere.id);
        console.log('   - Nom:', testCritere.nom);
        console.log('   - Poids:', testCritere.poids);
        console.log('   - Challenge ID:', testCritere.challengeId);
        console.log('   - Type:', testCritere.type);
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors du test du modèle Critere:', error.message);
        return false;
    }
}

async function testParticipantModel() {
    console.log('\n👤 Test du modèle Participant avec le champ "isValidated"...');
    
    try {
        // Test de création d'un participant avec isValidated
        const testParticipant = new Participant(
            'TEST_PART_001',
            'TEST_USER_001',
            'TEST_CHALLENGE_001',
            85.5,
            'validated'
        );
        
        console.log('✅ Création d\'un participant avec statut de validation:', testParticipant);
        
        console.log('   - ID:', testParticipant.id);
        console.log('   - Utilisateur ID:', testParticipant.utilisateurId);
        console.log('   - Challenge ID:', testParticipant.challengeId);
        console.log('   - Score Total:', testParticipant.scoreTotal);
        console.log('   - Statut de validation:', testParticipant.isValidated);
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors du test du modèle Participant:', error.message);
        return false;
    }
}

async function testPerformanceModel() {
    console.log('\n🏆 Test du modèle Performance avec le champ "critereId"...');
    
    try {
        // Test de création d'une performance avec critereId
        const testPerformance = new Performance(
            'TEST_PERF_001',
            'TEST_PART_001',
            92.5,
            1,
            JSON.stringify({ details: 'Performance excellente' }),
            'TEST_CRIT_001'
        );
        
        console.log('✅ Création d\'une performance avec critereId:', testPerformance);
        
        console.log('   - ID:', testPerformance.id);
        console.log('   - Participant ID:', testPerformance.participantId);
        console.log('   - Valeur:', testPerformance.valeur);
        console.log('   - Rang:', testPerformance.rang);
        console.log('   - Détails:', testPerformance.details);
        console.log('   - Critère ID:', testPerformance.critereId);
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors du test du modèle Performance:', error.message);
        return false;
    }
}

async function testDatabaseSchema() {
    console.log('\n🗄️  Test de la structure de la base de données...');
    
    return new Promise((resolve) => {
        const db = new sqlite3.Database('./database/starchallenge.db');
        
        // Vérifier la structure de la table Critere
        db.get("PRAGMA table_info(Critere)", (err, row) => {
            if (err) {
                console.error('❌ Erreur lors de la vérification de la table Critere:', err.message);
                resolve(false);
                return;
            }
            
            // Vérifier que la colonne type existe
            db.all("PRAGMA table_info(Critere)", (err, rows) => {
                if (err) {
                    console.error('❌ Erreur:', err.message);
                    resolve(false);
                    return;
                }
                
                const hasTypeColumn = rows.some(row => row.name === 'type');
                console.log('✅ Colonne "type" dans Critere:', hasTypeColumn ? 'Présente' : 'Absente');
                
                // Vérifier la table Participant
                db.all("PRAGMA table_info(Participant)", (err, rows) => {
                    if (err) {
                        console.error('❌ Erreur:', err.message);
                        resolve(false);
                        return;
                    }
                    
                    const hasIsValidatedColumn = rows.some(row => row.name === 'isValidated');
                    console.log('✅ Colonne "isValidated" dans Participant:', hasIsValidatedColumn ? 'Présente' : 'Absente');
                    
                    // Vérifier la table Performance
                    db.all("PRAGMA table_info(Performance)", (err, rows) => {
                        if (err) {
                            console.error('❌ Erreur:', err.message);
                            resolve(false);
                            return;
                        }
                        
                        const hasCritereIdColumn = rows.some(row => row.name === 'critereId');
                        console.log('✅ Colonne "critereId" dans Performance:', hasCritereIdColumn ? 'Présente' : 'Absente');
                        
                        db.close();
                        resolve(hasTypeColumn && hasIsValidatedColumn && hasCritereIdColumn);
                    });
                });
            });
        });
    });
}

async function runTests() {
    console.log('🚀 Démarrage des tests...\n');
    
    const results = [];
    
    // Test des modèles
    results.push(await testCritereModel());
    results.push(await testParticipantModel());
    results.push(await testPerformanceModel());
    
    // Test de la base de données
    results.push(await testDatabaseSchema());
    
    // Résumé
    console.log('\n📊 Résumé des tests:');
    const passedTests = results.filter(result => result === true).length;
    const totalTests = results.length;
    
    console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 Tous les tests sont passés avec succès !');
        console.log('\n✨ Les changements de schéma ont été appliqués correctement:');
        console.log('   - Critere.type: Champ ajouté pour le type de critère');
        console.log('   - Participant.isValidated: Champ ajouté pour le statut de validation');
        console.log('   - Performance.critereId: Champ ajouté pour la référence au critère');
    } else {
        console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    }
}

// Exécuter les tests
runTests().catch(console.error);
