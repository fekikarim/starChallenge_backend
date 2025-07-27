const Utilisateur = require("../models/Utilisateur");
const AuthService = require("../services/authService");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/jwt");
const logger = require("../utils/logger");

/**
 * Contrôleur pour les utilisateurs.
 */
class UtilisateurController {
  /**
   * Gère la connexion d'un utilisateur.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async login(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, motDePasse } = req.body;
    try {
      const utilisateur = await AuthService.verifierLogin(email, motDePasse);
      if (!utilisateur) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect." });
      }
      const payload = {
        utilisateur: {
          id: utilisateur.id,
          role: utilisateur.role,
        },
      };
      const token = jwt.sign(payload, config.secret, {
        expiresIn: config.expiresIn,
      });
      res
        .status(200)
        .json({ message: "Connexion réussie", token, utilisateur });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crée un nouvel utilisateur.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async create(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, nom, email, motDePasse, role } = req.body;
    try {
      const motDePasseHash = await bcrypt.hash(motDePasse, 10);
      const nouvelUtilisateur = new Utilisateur(
        id,
        nom,
        email,
        motDePasseHash,
        role
      );
      await Utilisateur.add(nouvelUtilisateur);
      res
        .status(201)
        .json({
          message: "Utilisateur créé avec succès",
          utilisateur: nouvelUtilisateur,
        });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère tous les utilisateurs.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async getAll(req, res, next) {
    try {
      const utilisateurs = await Utilisateur.getAll(); // Supposons que Utilisateur.getAll() existe
      res.status(200).json(utilisateurs);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère un utilisateur par son ID.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async getById(req, res, next) {
    try {
      const utilisateur = await Utilisateur.getById(req.params.id);
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
      res.status(200).json(utilisateur);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Met à jour un utilisateur.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async update(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Erreur de validation:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Données reçues pour la mise à jour:", {
        id: req.params.id,
        body: {
          ...req.body,
          motDePasse: req.body.motDePasse ? "***" : "non fourni",
        },
      });

      let updates = { ...req.body };

      // Si un mot de passe est fourni, le hasher
      if (updates.motDePasse) {
        console.log("Hachage du mot de passe...");
        try {
          const motDePasseHash = await bcrypt.hash(updates.motDePasse, 10);
          updates.motDePasseHash = motDePasseHash;
          delete updates.motDePasse;
          console.log("Mot de passe hashé avec succès");
        } catch (hashError) {
          console.error("Erreur lors du hachage du mot de passe:", hashError);
          return res.status(500).json({
            message: "Erreur lors du hachage du mot de passe",
            error: hashError.message,
          });
        }
      }

      try {
        console.log("Tentative de mise à jour avec les données:", updates);
        await Utilisateur.update(req.params.id, updates);
        console.log("Utilisateur mis à jour avec succès");
        return res.status(200).json({
          success: true,
          message: "Utilisateur mis à jour avec succès.",
        });
      } catch (updateError) {
        console.error(
          "Erreur lors de la mise à jour dans la base de données:",
          updateError
        );
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la mise à jour dans la base de données",
          error: updateError.message,
        });
      }
    } catch (error) {
      console.error(
        "Erreur inattendue lors de la mise à jour de l'utilisateur:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Erreur inattendue lors de la mise à jour de l'utilisateur",
        error: error.message,
      });
    }
  }

  /**
   * Vérifie si un email est déjà utilisé.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async checkEmail(req, res, next) {
    const { email } = req.query;
    const id = req.params.id; // Sera undefined si pas d'ID dans l'URL

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre email est requis.",
      });
    }

    try {
      const { exists } = await Utilisateur.checkEmailExists(email, id);
      res.status(200).json({
        success: true,
        exists,
        message: exists ? "Cet email est déjà utilisé." : "Email disponible.",
      });
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      next(error);
    }
  }

  /**
   * Supprime un utilisateur.
   * @param {import('express').Request} req - La requête Express.
   * @param {import('express').Response} res - La réponse Express.
   * @param {import('express').NextFunction} next - Le middleware suivant.
   */
  static async delete(req, res, next) {
    const userId = req.params.id;
    const requestingUserId = req.user ? req.user.id : "système";

    logger.info(
      `Tentative de suppression de l'utilisateur avec l'ID: ${userId} par l'utilisateur: ${requestingUserId}`
    );

    if (!userId) {
      const errorMsg = "Tentative de suppression sans ID utilisateur";
      logger.warn(errorMsg);
      return res.status(400).json({
        success: false,
        message: "ID utilisateur manquant",
      });
    }

    try {
      // Vérifier d'abord si l'utilisateur existe
      const user = await Utilisateur.getById(userId);
      if (!user) {
        const errorMsg = `Tentative de suppression d'un utilisateur inexistant: ${userId}`;
        logger.warn(errorMsg);
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Empêcher l'auto-suppression
      if (requestingUserId === userId) {
        const errorMsg = `Tentative d'auto-suppression de l'utilisateur: ${userId}`;
        logger.warn(errorMsg);
        return res.status(400).json({
          success: false,
          message:
            "Vous ne pouvez pas supprimer votre propre compte depuis cette interface.",
        });
      }

      logger.info(`Suppression de l'utilisateur: ${userId} (${user.email})`);

      // Supprimer l'utilisateur
      await Utilisateur.delete(userId);

      logger.info(
        `Utilisateur ${userId} supprimé avec succès par ${requestingUserId}`
      );

      res.status(200).json({
        success: true,
        message: "Utilisateur supprimé avec succès",
      });
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'utilisateur ${userId}`, {
        error: error.message,
        stack: error.stack,
        params: req.params,
        user: requestingUserId,
      });

      // Vérifier si c'est une erreur de contrainte de clé étrangère
      if (
        error.message &&
        error.message.includes("FOREIGN KEY constraint failed")
      ) {
        logger.warn(
          `Tentative de suppression d'un utilisateur référencé: ${userId}`
        );
        return res.status(409).json({
          success: false,
          message:
            "Impossible de supprimer cet utilisateur car il est référencé par d'autres données",
          details:
            "Veuillez d'abord supprimer ou mettre à jour les références à cet utilisateur.",
        });
      }

      // Autres erreurs
      next(error);
    }
  }
}

module.exports = UtilisateurController;
