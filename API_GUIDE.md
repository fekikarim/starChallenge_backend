# Guide d'utilisation de l'API STAR Challenge

Ce guide fournit une documentation complète pour l'API RESTful du projet STAR Challenge. Il décrit les endpoints disponibles, les méthodes HTTP, les corps de requête attendus, les réponses possibles et des exemples d'utilisation.

## Table des matières

1.  [Authentification](#1-authentification)
2.  [Utilisateurs](#2-utilisateurs)
3.  [Challenges](#3-challenges)
4.  [Critères](#4-critères)
5.  [Participants](#5-participants)
6.  [Gagnants](#6-gagnants)
7.  [Performances](#7-performances)
8.  [Étoiles](#8-étoiles)
9.  [Paliers](#9-paliers)
10. [Récompenses](#10-récompenses)
11. [Gestion des Erreurs](#11-gestion-des-erreurs)

---

## 1. Authentification

### `POST /api/utilisateurs/login`

Permet à un utilisateur de se connecter et d'obtenir un token JWT pour accéder aux routes protégées.

-   **Description**: Connecte un utilisateur existant.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "email": "test@example.com",
        "motDePasse": "password123"
    }
    ```

-   **Réponses attendues**:
    -   `200 OK`: Connexion réussie.

        ```json
        {
            "message": "Connexion réussie",
            "token": "eyJhbGciOiJIUzI1Ni...",
            "utilisateur": {
                "id": "user1",
                "nom": "Test User",
                "email": "test@example.com",
                "role": "participant"
            }
        }
        ```

    -   `400 Bad Request`: Données de validation manquantes ou invalides.
    -   `401 Unauthorized`: Email ou mot de passe incorrect.

---

## 2. Utilisateurs

### `POST /api/utilisateurs`

Crée un nouvel utilisateur.

-   **Description**: Enregistre un nouvel utilisateur dans le système.
-   **Accès**: Privé (nécessite un token JWT valide)
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "nouvel_id_utilisateur",
        "nom": "Nom Utilisateur",
        "email": "nouvel_email@example.com",
        "motDePasse": "motdepasse",
        "role": "participant"
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Utilisateur créé avec succès.

        ```json
        {
            "message": "Utilisateur créé avec succès",
            "utilisateur": { /* objet utilisateur */ }
        }
        ```

    -   `400 Bad Request`: Données de validation manquantes ou invalides.
    -   `401 Unauthorized`: Token JWT manquant ou invalide.

---

## 3. Challenges

### `POST /api/challenges`

Crée un nouveau challenge.

-   **Description**: Ajoute un nouveau challenge au système.
-   **Accès**: Privé (nécessite un token JWT valide)
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "challenge_id",
        "nom": "Nom du Challenge",
        "dateDebut": "2023-01-01T00:00:00Z",
        "dateFin": "2023-12-31T23:59:59Z",
        "statut": "en cours",
        "createurId": "id_createur"
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Challenge créé avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.
    -   `401 Unauthorized`: Token JWT manquant ou invalide.

### `GET /api/challenges/:id/classement`

Récupère le classement des participants pour un challenge donné.

-   **Description**: Retourne une liste des participants classés par score pour un challenge spécifique.
-   **Accès**: Public
-   **Paramètres de chemin**:
    -   `id`: L'ID du challenge.
-   **Réponses attendues**:
    -   `200 OK`: Liste des participants classés.

        ```json
        [
            { "id": "part1", "utilisateurId": "user1", "challengeId": "chal1", "scoreTotal": 150 },
            // ... autres participants
        ]
        ```

    -   `404 Not Found`: Challenge non trouvé.

### `GET /api/challenges/:id/gagnants`

Détermine et récupère les gagnants d'un challenge.

-   **Description**: Calcule et enregistre les gagnants d'un challenge, puis les retourne.
-   **Accès**: Public
-   **Paramètres de chemin**:
    -   `id`: L'ID du challenge.
-   **Réponses attendues**:
    -   `200 OK`: Liste des gagnants.

        ```json
        [
            { "id": "gagnant1", "utilisateurId": "user1", "challengeId": "chal1", "classement": 1 },
            // ... autres gagnants
        ]
        ```

    -   `404 Not Found`: Challenge non trouvé.

---

## 4. Critères

### `POST /api/criteres`

Crée un nouveau critère.

-   **Description**: Ajoute un nouveau critère d'évaluation pour un challenge.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "critere_id",
        "nom": "Nom du Critère",
        "poids": 1.0,
        "challengeId": "id_challenge"
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Critère créé avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 5. Participants

### `POST /api/participants`

Crée un nouveau participant.

-   **Description**: Enregistre un utilisateur comme participant à un challenge.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "participant_id",
        "utilisateurId": "id_utilisateur",
        "challengeId": "id_challenge",
        "scoreTotal": 0.0
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Participant créé avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 6. Gagnants

### `POST /api/gagnants`

Crée un nouveau gagnant.

-   **Description**: Enregistre un gagnant pour un challenge.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "gagnant_id",
        "utilisateurId": "id_utilisateur",
        "challengeId": "id_challenge",
        "classement": 1
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Gagnant créé avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 7. Performances

### `POST /api/performances`

Crée une nouvelle performance.

-   **Description**: Enregistre une performance pour un participant.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "performance_id",
        "participantId": "id_participant",
        "valeur": 100.5,
        "rang": 1,
        "details": "{}"
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Performance créée avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 8. Étoiles

### `POST /api/etoiles`

Crée une nouvelle étoile.

-   **Description**: Enregistre une étoile attribuée à un utilisateur.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "etoile_id",
        "total": 5,
        "dateAttribution": "2023-01-15T10:00:00Z",
        "raison": "Participation active",
        "utilisateurId": "id_utilisateur"
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Étoile créée avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 9. Paliers

### `POST /api/paliers`

Crée un nouveau palier.

-   **Description**: Enregistre un nouveau palier de récompenses.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "palier_id",
        "nom": "Palier Bronze",
        "etoilesMin": 10,
        "description": "Atteignez 10 étoiles pour ce palier."
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Palier créé avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 10. Récompenses

### `POST /api/recompenses`

Crée une nouvelle récompense.

-   **Description**: Enregistre une nouvelle récompense.
-   **Accès**: Public
-   **Corps de requête (JSON)**:

    ```json
    {
        "id": "recompense_id",
        "type": "Badge",
        "description": "Badge de participation",
        "dateAttribution": "2023-01-15T10:00:00Z",
        "palierId": "id_palier"
    }
    ```

-   **Réponses attendues**:
    -   `201 Created`: Récompense créée avec succès.
    -   `400 Bad Request`: Données de validation manquantes ou invalides.

---

## 11. Gestion des Erreurs

L'API utilise une gestion d'erreurs uniforme avec des codes HTTP pertinents et des messages clairs.

-   **`400 Bad Request`**: Indique que la requête n'a pas pu être comprise en raison d'une syntaxe invalide, de paramètres de requête invalides ou de données de validation manquantes/incorrectes.

    ```json
    {
        "message": "Erreur de validation",
        "errors": [
            { "msg": "Veuillez fournir un email valide", "param": "email", "location": "body" }
        ]
    }
    ```

-   **`401 Unauthorized`**: Indique que l'authentification est requise et a échoué ou n'a pas encore été fournie.

    ```json
    {
        "message": "Aucun token, autorisation refusée."
    }
    ```

-   **`404 Not Found`**: La ressource demandée n'a pas été trouvée.

    ```json
    {
        "message": "Ressource non trouvée."
    }
    ```

-   **`500 Internal Server Error`**: Une erreur inattendue est survenue sur le serveur.

    ```json
    {
        "message": "Une erreur interne est survenue."
    }
    ```
