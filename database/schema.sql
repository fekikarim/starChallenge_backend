-- USERS
CREATE TABLE IF NOT EXISTS Utilisateur (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    motDePasseHash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CHALLENGES
CREATE TABLE IF NOT EXISTS Challenge (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    statut TEXT NOT NULL,
    createurId TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createurId) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- CRITERES
CREATE TABLE IF NOT EXISTS Critere (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    poids REAL NOT NULL,
    challengeId TEXT NOT NULL,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE CASCADE
);

-- PARTICIPANTS
CREATE TABLE IF NOT EXISTS Participant (
    id TEXT PRIMARY KEY,
    utilisateurId TEXT NOT NULL,
    challengeId TEXT NOT NULL,
    scoreTotal REAL DEFAULT 0,
    isValidated TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateurId) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE CASCADE
);

-- GAGNANTS (WINNERS)
CREATE TABLE IF NOT EXISTS Gagnant (
    id TEXT PRIMARY KEY,
    utilisateurId TEXT NOT NULL,
    challengeId TEXT NOT NULL,
    classement INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateurId) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE CASCADE
);

-- PERFORMANCES
CREATE TABLE IF NOT EXISTS Performance (
    id TEXT PRIMARY KEY,
    participantId TEXT NOT NULL,
    valeur REAL NOT NULL,
    rang INTEGER NOT NULL,
    details TEXT,
    critereId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (critereId) REFERENCES Critere(id) ON DELETE CASCADE,
    FOREIGN KEY (participantId) REFERENCES Participant(id) ON DELETE CASCADE
);

-- ETOILES (STARS)
CREATE TABLE IF NOT EXISTS Etoile (
    id TEXT PRIMARY KEY,
    total INTEGER NOT NULL,
    dateAttribution DATE NOT NULL,
    raison TEXT,
        utilisateurId TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateurId) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- PALIERS (LEVELS)
CREATE TABLE IF NOT EXISTS Palier (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    etoilesMin INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RECOMPENSES (REWARDS)
CREATE TABLE IF NOT EXISTS Recompense (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT,
    dateAttribution DATE,
    palierId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (palierId) REFERENCES Palier(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY, 
  action VARCHAR(20) NOT NULL,       
  target VARCHAR(50) NOT NULL,       
  target_id VARCHAR(50) NOT NULL,    
  user_id TEXT,                       
  description TEXT,       
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           
  FOREIGN KEY (user_id) REFERENCES Utilisateur(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);