-- USERS
CREATE TABLE Utilisateur (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    motDePasseHash TEXT NOT NULL,
    role TEXT NOT NULL
);

-- CHALLENGES
CREATE TABLE Challenge (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    statut TEXT NOT NULL,
    createurId TEXT NOT NULL,
    FOREIGN KEY (createurId) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- CRITERES
CREATE TABLE Critere (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    poids REAL NOT NULL,
    challengeId TEXT NOT NULL,
    FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE CASCADE
);

-- PARTICIPANTS
CREATE TABLE Participant (
    id TEXT PRIMARY KEY,
    utilisateurId TEXT NOT NULL,
    challengeId TEXT NOT NULL,
    scoreTotal REAL DEFAULT 0,
    FOREIGN KEY (utilisateurId) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE CASCADE
);

-- GAGNANTS (WINNERS)
CREATE TABLE Gagnant (
    id TEXT PRIMARY KEY,
    utilisateurId TEXT NOT NULL,
    challengeId TEXT NOT NULL,
    classement INTEGER NOT NULL,
    FOREIGN KEY (utilisateurId) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (challengeId) REFERENCES Challenge(id) ON DELETE CASCADE
);

-- PERFORMANCES
CREATE TABLE Performance (
    id TEXT PRIMARY KEY,
    participantId TEXT NOT NULL,
    valeur REAL NOT NULL,
    rang INTEGER NOT NULL,
    details TEXT, -- JSON stored as TEXT
    FOREIGN KEY (participantId) REFERENCES Participant(id) ON DELETE CASCADE
);

-- ETOILES (STARS)
CREATE TABLE Etoile (
    id TEXT PRIMARY KEY,
    total INTEGER NOT NULL,
    dateAttribution DATE NOT NULL,
    raison TEXT,
    utilisateurId TEXT NOT NULL,
    FOREIGN KEY (utilisateurId) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

-- PALIERS (LEVELS)
CREATE TABLE Palier (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    etoilesMin INTEGER NOT NULL,
    description TEXT
);

-- RECOMPENSES (REWARDS)
CREATE TABLE Recompense (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT,
    dateAttribution DATE,
    palierId TEXT,
    FOREIGN KEY (palierId) REFERENCES Palier(id) ON DELETE SET NULL
);
