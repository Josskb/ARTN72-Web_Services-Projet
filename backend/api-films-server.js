require('dotenv').config();

const express = require('express');
const db = require('./db');
const app = express();

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const bcrypt = require('bcryptjs');


const {
  ensureAuthSetup,
  authenticateToken,
  requireAdmin,
  generateToken,
  findUserByUsername,
  toPublicUser
} = require('./auth');


/*const express = require('express');
const db = require('./db');
const app = express();
// rajouter par rayan pour admin
const bcrypt = require('bcryptjs');
const {
  ensureAuthSetup,
  authenticateToken,
  requireAdmin,
  generateToken,
  findUserByUsername,
  toPublicUser
} = require('./auth');*/


// Middleware CORS pour permettre les requêtes depuis le frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware
app.use(express.json());

// ===============================
// AUTH ROUTES (JWT)
// ===============================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "username et password requis" });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: toPublicUser(user)
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});



// Middleware d'authentification (simplifié)
/*const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  
  // Ici, vous valideriez le token JWT
  // Pour cet exemple, on accepte n'importe quel token
  next();
};*/

// 1. PUBLIER UN NOUVEAU FILM
app.post('/api/films', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titre,
      realisateur,
      genre,
      duree,
      synopsis,
      dateSortie,
      classification,
      poster,
      bande_annonce,
      acteurs
    } = req.body;

    // Validation des données obligatoires
    if (!titre || !realisateur || !duree) {
      return res.status(400).json({
        error: 'Les champs titre, réalisateur et durée sont obligatoires'
      });
    }

    // Extraire la durée en nombre (enlever "min" si présent)
    const dureeNum = parseInt(duree.toString().replace(/[^0-9]/g, ''));
    
    // Extraire l'âge minimum de la classification
    const ageMin = parseInt(classification?.replace(/[^0-9]/g, '') || '0');

    // Insérer le film dans la base de données
    const [result] = await db.query(
      'INSERT INTO Film (titre, duree, langue, sous_titres, age_min, synopsis) VALUES (?, ?, ?, ?, ?, ?)',
      [titre, dureeNum, genre || 'Français', 'Aucun', ageMin, synopsis || '']
    );

    const filmId = result.insertId;

    // Insérer le réalisateur s'il n'existe pas
    const [realisateurs] = await db.query(
      'SELECT id_realisateur FROM Realisateur WHERE nom = ?',
      [realisateur]
    );

    let realisateurId;
    if (realisateurs.length === 0) {
      const [realisateurResult] = await db.query(
        'INSERT INTO Realisateur (nom) VALUES (?)',
        [realisateur]
      );
      realisateurId = realisateurResult.insertId;
    } else {
      realisateurId = realisateurs[0].id_realisateur;
    }

    // Lier le film au réalisateur
    await db.query(
      'INSERT INTO Realiser (id_film, id_realisateur) VALUES (?, ?)',
      [filmId, realisateurId]
    );

    // Insérer les acteurs si fournis
    if (acteurs && Array.isArray(acteurs) && acteurs.length > 0) {
      for (const acteurNom of acteurs) {
        // Vérifier si l'acteur existe
        const [acteursExistants] = await db.query(
          'SELECT id_acteur FROM Acteur WHERE nom = ?',
          [acteurNom.trim()]
        );

        let acteurId;
        if (acteursExistants.length === 0) {
          const [acteurResult] = await db.query(
            'INSERT INTO Acteur (nom) VALUES (?)',
            [acteurNom.trim()]
          );
          acteurId = acteurResult.insertId;
        } else {
          acteurId = acteursExistants[0].id_acteur;
        }

        // Lier le film à l'acteur
        await db.query(
          'INSERT INTO Jouer (id_film, id_acteur) VALUES (?, ?)',
          [filmId, acteurId]
        );
      }
    }

    // Récupérer le film créé avec toutes ses informations
    const [films] = await db.query(`
      SELECT 
        f.*,
        GROUP_CONCAT(DISTINCT r.nom) as realisateur,
        GROUP_CONCAT(DISTINCT a.nom) as acteurs
      FROM Film f
      LEFT JOIN Realiser rel ON f.id_film = rel.id_film
      LEFT JOIN Realisateur r ON rel.id_realisateur = r.id_realisateur
      LEFT JOIN Jouer j ON f.id_film = j.id_film
      LEFT JOIN Acteur a ON j.id_acteur = a.id_acteur
      WHERE f.id_film = ?
      GROUP BY f.id_film
    `, [filmId]);

    const nouveauFilm = {
      id: films[0].id_film,
      titre: films[0].titre,
      realisateur: films[0].realisateur,
      genre: films[0].langue,
      duree: films[0].duree + 'min',
      synopsis: films[0].synopsis,
      classification: films[0].age_min + '+',
      acteurs: films[0].acteurs ? films[0].acteurs.split(',') : [],
      dateCreation: new Date().toISOString(),
      statut: 'actif'
    };

    res.status(201).json(nouveauFilm);
  } catch (error) {
    console.error('Erreur lors de la création du film:', error);
    res.status(500).json({ error: 'Erreur lors de la création du film' });
  }
});

// 2. CRÉER UNE PROGRAMMATION POUR UN FILM
app.post('/api/films/:filmId/programmations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const {
      cinemaId,
      dateDebut,
      dateFin,
      seances
    } = req.body;

    // Vérifier que le film existe
    const [films] = await db.query('SELECT * FROM Film WHERE id_film = ?', [filmId]);
    if (films.length === 0) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Validation des données obligatoires
    if (!dateDebut || !dateFin) {
      return res.status(400).json({
        error: 'Les champs dateDebut et dateFin sont obligatoires'
      });
    }

    // Créer la programmation
    const [programmationResult] = await db.query(
      'INSERT INTO Programmation (date_debut, date_fin) VALUES (?, ?)',
      [dateDebut, dateFin]
    );

    const programmationId = programmationResult.insertId;

    // Lier la programmation au film
    await db.query(
      'INSERT INTO Programmer (id_programmation, id_film) VALUES (?, ?)',
      [programmationId, filmId]
    );

    // Si un cinéma est spécifié, lier la programmation au cinéma
    if (cinemaId) {
      await db.query(
        'INSERT INTO Projeter (id_cinema, id_programmation) VALUES (?, ?)',
        [cinemaId, programmationId]
      );
    }

    // Créer les séances si fournies
    if (seances && Array.isArray(seances)) {
      for (const seance of seances) {
        await db.query(
          'INSERT INTO Seance (jour_semaine, heure_debut, id_programmation) VALUES (?, ?, ?)',
          [seance.jourSemaine, seance.heureDebut, programmationId]
        );
      }
    }

    // Récupérer la programmation créée
    const [programmations] = await db.query(`
      SELECT 
        p.*,
        f.titre as film_titre,
        c.nom as cinema_nom
      FROM Programmation p
      LEFT JOIN Programmer pr ON p.id_programmation = pr.id_programmation
      LEFT JOIN Film f ON pr.id_film = f.id_film
      LEFT JOIN Projeter pj ON p.id_programmation = pj.id_programmation
      LEFT JOIN Cinema c ON pj.id_cinema = c.id_cinema
      WHERE p.id_programmation = ?
    `, [programmationId]);

    res.status(201).json({
      id: programmationId,
      filmId: filmId,
      cinemaId: cinemaId || null,
      dateDebut: dateDebut,
      dateFin: dateFin,
      statut: 'programmee',
      dateCreation: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la création de la programmation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la programmation' });
  }
});

// 15bis. MODIFIER UNE PROGRAMMATION COMPLÈTE
app.put('/api/programmations/:programmationId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const programmationId = parseInt(req.params.programmationId);
    const { film_id, cinema_id, date_debut, date_fin, seances } = req.body;

    // Validation
    if (!film_id || !cinema_id || !date_debut || !date_fin) {
      return res.status(400).json({
        error: 'Les champs film_id, cinema_id, date_debut et date_fin sont obligatoires'
      });
    }

    // Vérifier que la programmation existe
    const [existProg] = await db.query(
      'SELECT * FROM Programmation WHERE id_programmation = ?',
      [programmationId]
    );
    if (existProg.length === 0) {
      return res.status(404).json({ error: 'Programmation non trouvée' });
    }

    // Vérifier film
    const [films] = await db.query('SELECT * FROM Film WHERE id_film = ?', [film_id]);
    if (films.length === 0) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Vérifier cinéma
    const [cinemas] = await db.query('SELECT * FROM Cinema WHERE id_cinema = ?', [cinema_id]);
    if (cinemas.length === 0) {
      return res.status(404).json({ error: 'Cinéma non trouvé' });
    }

    // Update programmation (dates)
    await db.query(
      'UPDATE Programmation SET date_debut = ?, date_fin = ? WHERE id_programmation = ?',
      [date_debut, date_fin, programmationId]
    );

    // Update relation film (Programmer)
    const [progFilm] = await db.query(
      'SELECT * FROM Programmer WHERE id_programmation = ?',
      [programmationId]
    );

    if (progFilm.length > 0) {
      await db.query(
        'UPDATE Programmer SET id_film = ? WHERE id_programmation = ?',
        [film_id, programmationId]
      );
    } else {
      await db.query(
        'INSERT INTO Programmer (id_programmation, id_film) VALUES (?, ?)',
        [programmationId, film_id]
      );
    }

    // Update relation cinéma (Projeter)
    const [projCinema] = await db.query(
      'SELECT * FROM Projeter WHERE id_programmation = ?',
      [programmationId]
    );

    if (projCinema.length > 0) {
      await db.query(
        'UPDATE Projeter SET id_cinema = ? WHERE id_programmation = ?',
        [cinema_id, programmationId]
      );
    } else {
      await db.query(
        'INSERT INTO Projeter (id_cinema, id_programmation) VALUES (?, ?)',
        [cinema_id, programmationId]
      );
    }

    // Remplacer les séances
    await db.query('DELETE FROM Seance WHERE id_programmation = ?', [programmationId]);

    const createdSeances = [];
    if (seances && Array.isArray(seances)) {
      for (const seance of seances) {
        const [seanceResult] = await db.query(
          'INSERT INTO Seance (jour_semaine, heure_debut, id_programmation) VALUES (?, ?, ?)',
          [seance.jour_semaine, seance.heure_debut, programmationId]
        );

        createdSeances.push({
          id: seanceResult.insertId,
          jour_semaine: seance.jour_semaine,
          heure_debut: seance.heure_debut
        });
      }
    }

    res.json({
      id: programmationId,
      film_id,
      cinema_id,
      date_debut,
      date_fin,
      seances: createdSeances
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la programmation:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la programmation' });
  }
});


// 3. CRÉER PLUSIEURS SÉANCES EN UNE FOIS
app.post(
  '/api/films/:filmId/programmations/batch',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const filmId = Number(req.params.filmId);
      if (!filmId) return res.status(400).json({ error: 'filmId invalide' });

      const items = req.body?.items;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Body invalide : 'items' doit être un tableau non vide" });
      }

      await conn.beginTransaction();

      const created = [];

      for (const it of items) {
        const cinemaId = Number(it.cinema_id);
        const dateDebut = it.date_debut;
        const dateFin = it.date_fin;
        const seances = it.seances;

        if (!cinemaId || !dateDebut || !dateFin) {
          throw new Error("Chaque item doit contenir cinema_id, date_debut, date_fin");
        }
        if (!Array.isArray(seances) || seances.length === 0) {
          throw new Error("Chaque item doit contenir un tableau 'seances' non vide");
        }

        const [filmExists] = await conn.query(`SELECT id FROM film WHERE id = ?`, [filmId]);
        if (filmExists.length === 0) throw new Error(`Film ${filmId} introuvable`);

        const [cinemaExists] = await conn.query(`SELECT id FROM cinema WHERE id = ?`, [cinemaId]);
        if (cinemaExists.length === 0) throw new Error(`Cinéma ${cinemaId} introuvable`);

        const [insProg] = await conn.query(
          `INSERT INTO programmation (film_id, cinema_id, date_debut, date_fin)
           VALUES (?, ?, ?, ?)`,
          [filmId, cinemaId, dateDebut, dateFin]
        );

        const progId = insProg.insertId;

        const values = seances.map(s => {
          if (!s.jour_semaine || !s.heure_debut) {
            throw new Error("Chaque séance doit avoir jour_semaine et heure_debut");
          }
          const time = (typeof s.heure_debut === 'string' && s.heure_debut.length === 5)
            ? `${s.heure_debut}:00`
            : s.heure_debut;
          return [progId, s.jour_semaine, time];
        });

        await conn.query(
          `INSERT INTO seance (programmation_id, jour_semaine, heure_debut)
           VALUES ?`,
          [values]
        );

        created.push({ programmation_id: progId });
      }

      await conn.commit();
      res.status(201).json({ message: 'Batch créé', created });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(400).json({ error: err.message || 'Erreur batch' });
    } finally {
      conn.release();
    }
  }
);


// 4. RÉCUPÉRER TOUS LES FILMS
app.get('/api/films', async (req, res) => {
  try {
    let query = `
      SELECT 
        f.id_film as id,
        f.titre,
        f.duree,
        f.langue,
        f.sous_titres,
        f.age_min,
        f.synopsis,
        GROUP_CONCAT(DISTINCT r.nom) as realisateur,
        GROUP_CONCAT(DISTINCT a.nom) as acteurs
      FROM Film f
      LEFT JOIN Realiser rel ON f.id_film = rel.id_film
      LEFT JOIN Realisateur r ON rel.id_realisateur = r.id_realisateur
      LEFT JOIN Jouer j ON f.id_film = j.id_film
      LEFT JOIN Acteur a ON j.id_acteur = a.id_acteur
      GROUP BY f.id_film
    `;

    const [films] = await db.query(query);

    const resultats = films.map(film => ({
      id: film.id,
      titre: film.titre,
      realisateur: film.realisateur || '',
      genre: film.langue || '',
      duree: film.duree ? film.duree + 'min' : '',
      synopsis: film.synopsis || '',
      classification: film.age_min + '+',
      acteurs: film.acteurs ? film.acteurs.split(',') : [],
      dateCreation: new Date().toISOString(),
      statut: 'actif'
    }));

    console.log(resultats)

    res.json({
      films: resultats,
      total: resultats.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des films' });
  }
});

// 5. RÉCUPÉRER UN FILM SPÉCIFIQUE
app.get('/api/films/:filmId', async (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);

    const [films] = await db.query(`
      SELECT 
        f.id_film as id,
        f.titre,
        f.duree,
        f.langue,
        f.sous_titres,
        f.age_min,
        f.synopsis,
        GROUP_CONCAT(DISTINCT r.nom) as realisateur,
        GROUP_CONCAT(DISTINCT a.nom) as acteurs
      FROM Film f
      LEFT JOIN Realiser rel ON f.id_film = rel.id_film
      LEFT JOIN Realisateur r ON rel.id_realisateur = r.id_realisateur
      LEFT JOIN Jouer j ON f.id_film = j.id_film
      LEFT JOIN Acteur a ON j.id_acteur = a.id_acteur
      WHERE f.id_film = ?
      GROUP BY f.id_film
    `, [filmId]);

    if (films.length === 0) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    const film = {
      id: films[0].id,
      titre: films[0].titre,
      realisateur: films[0].realisateur,
      genre: films[0].langue,
      duree: films[0].duree + 'min',
      synopsis: films[0].synopsis,
      classification: films[0].age_min + '+',
      acteurs: films[0].acteurs ? films[0].acteurs.split(',') : [],
      statut: 'actif'
    };

    res.json(film);
  } catch (error) {
    console.error('Erreur lors de la récupération du film:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du film' });
  }
});

// 5.5. RÉCUPÉRER TOUS LES FILMS PROPOSÉS DANS UNE VILLE
app.get('/api/villes/:villeNom/films', async (req, res) => {
  try {
    const villeNom = req.params.villeNom;

    // Récupérer tous les films proposés dans les cinémas de la ville
    const [films] = await db.query(`
      SELECT DISTINCT
        f.id_film as id,
        f.titre,
        f.duree,
        f.langue,
        f.sous_titres,
        f.age_min,
        f.synopsis,
        GROUP_CONCAT(DISTINCT r.nom) as realisateur,
        GROUP_CONCAT(DISTINCT a.nom) as acteurs,
        GROUP_CONCAT(DISTINCT c.nom) as cinemas,
        GROUP_CONCAT(DISTINCT a2.ville) as villes
      FROM Film f
      LEFT JOIN Realiser rel ON f.id_film = rel.id_film
      LEFT JOIN Realisateur r ON rel.id_realisateur = r.id_realisateur
      LEFT JOIN Jouer j ON f.id_film = j.id_film
      LEFT JOIN Acteur a ON j.id_acteur = a.id_acteur
      LEFT JOIN Programmer pr ON f.id_film = pr.id_film
      LEFT JOIN Programmation p ON pr.id_programmation = p.id_programmation
      LEFT JOIN Projeter pj ON p.id_programmation = pj.id_programmation
      LEFT JOIN Cinema c ON pj.id_cinema = c.id_cinema
      LEFT JOIN Adresse a2 ON c.id_adresse = a2.id_adresse
      WHERE a2.ville = ?
      GROUP BY f.id_film
      ORDER BY f.titre
    `, [villeNom]);

    if (films.length === 0) {
      return res.json({
        message: `Aucun film proposé dans la ville de ${villeNom}`,
        films: [],
        total: 0,
        ville: villeNom
      });
    }

    const resultats = films.map(film => ({
      id: film.id,
      titre: film.titre,
      realisateur: film.realisateur || '',
      genre: film.langue || '',
      duree: film.duree ? film.duree + 'min' : '',
      synopsis: film.synopsis || '',
      classification: film.age_min + '+',
      acteurs: film.acteurs ? film.acteurs.split(',').map(a => a.trim()) : [],
      cinemas: film.cinemas ? film.cinemas.split(',').map(c => c.trim()) : [],
      statut: 'actif'
    }));

    res.json({
      ville: villeNom,
      films: resultats,
      total: resultats.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des films par ville:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des films par ville' });
  }
});

// 6. RÉCUPÉRER LES PROGRAMMATIONS D'UN FILM
app.get('/api/films/:filmId/programmations', async (req, res) => {
  try {
    const filmId = Number(req.params.filmId);
    if (!filmId) return res.status(400).json({ error: 'filmId invalide' });

    const [progs] = await pool.query(
      `SELECT id, film_id, cinema_id, date_debut, date_fin
       FROM programmation
       WHERE film_id = ?
       ORDER BY date_debut DESC`,
      [filmId]
    );

    if (progs.length === 0) {
      return res.json({ programmations: [] });
    }

    const progIds = progs.map(p => p.id);

    const [seances] = await pool.query(
      `SELECT id, programmation_id, jour_semaine, heure_debut
       FROM seance
       WHERE programmation_id IN (?)
       ORDER BY FIELD(programmation_id, ${progIds.map(() => '?').join(',')}),
                jour_semaine, heure_debut`,
      [...progIds, ...progIds]
    );

    const seancesByProg = new Map();
    for (const s of seances) {
      if (!seancesByProg.has(s.programmation_id)) seancesByProg.set(s.programmation_id, []);
      seancesByProg.get(s.programmation_id).push({
        id: s.id,
        jour_semaine: s.jour_semaine,
        heure_debut: s.heure_debut
      });
    }

    const result = progs.map(p => ({
      id: p.id,
      film_id: p.film_id,
      cinema_id: p.cinema_id,
      date_debut: p.date_debut,
      date_fin: p.date_fin,
      seances: seancesByProg.get(p.id) || []
    }));

    res.json({ programmations: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// 7. MODIFIER UN FILM
app.put('/api/films/:filmId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const { titre, duree, langue, synopsis, age_min } = req.body;

    // Vérifier que le film existe
    const [films] = await db.query('SELECT * FROM Film WHERE id_film = ?', [filmId]);
    if (films.length === 0) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Extraire la durée en nombre
    const dureeNum = duree ? parseInt(duree.toString().replace(/[^0-9]/g, '')) : films[0].duree;
    const ageMin = age_min !== undefined ? parseInt(age_min.toString().replace(/[^0-9]/g, '')) : films[0].age_min;

    // Mettre à jour le film
    await db.query(
      'UPDATE Film SET titre = ?, duree = ?, langue = ?, synopsis = ?, age_min = ? WHERE id_film = ?',
      [
        titre || films[0].titre,
        dureeNum,
        langue || films[0].langue,
        synopsis || films[0].synopsis,
        ageMin,
        filmId
      ]
    );

    // Récupérer le film mis à jour
    const [updatedFilms] = await db.query(`
      SELECT 
        f.*,
        GROUP_CONCAT(DISTINCT r.nom) as realisateur,
        GROUP_CONCAT(DISTINCT a.nom) as acteurs
      FROM Film f
      LEFT JOIN Realiser rel ON f.id_film = rel.id_film
      LEFT JOIN Realisateur r ON rel.id_realisateur = r.id_realisateur
      LEFT JOIN Jouer j ON f.id_film = j.id_film
      LEFT JOIN Acteur a ON j.id_acteur = a.id_acteur
      WHERE f.id_film = ?
      GROUP BY f.id_film
    `, [filmId]);

    const filmMisAJour = {
      id: updatedFilms[0].id_film,
      titre: updatedFilms[0].titre,
      realisateur: updatedFilms[0].realisateur,
      genre: updatedFilms[0].langue,
      duree: updatedFilms[0].duree + 'min',
      synopsis: updatedFilms[0].synopsis,
      classification: updatedFilms[0].age_min + '+',
      acteurs: updatedFilms[0].acteurs ? updatedFilms[0].acteurs.split(',') : [],
      dateModification: new Date().toISOString()
    };

    res.json(filmMisAJour);
  } catch (error) {
    console.error('Erreur lors de la modification du film:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du film' });
  }
});

// 8. SUPPRIMER UN FILM
app.delete('/api/films/:filmId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);

    // Vérifier que le film existe
    const [films] = await db.query('SELECT * FROM Film WHERE id_film = ?', [filmId]);
    if (films.length === 0) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Supprimer les relations Jouer (acteurs)
    await db.query('DELETE FROM Jouer WHERE id_film = ?', [filmId]);

    // Supprimer les relations Realiser (réalisateurs)
    await db.query('DELETE FROM Realiser WHERE id_film = ?', [filmId]);

    // Supprimer les relations Programmer (programmations)
    await db.query('DELETE FROM Programmer WHERE id_film = ?', [filmId]);

    // Supprimer le film
    await db.query('DELETE FROM Film WHERE id_film = ?', [filmId]);

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du film:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du film' });
  }
});

// ========================================
// ROUTES CINÉMAS
// ========================================

// 9. CRÉER UN NOUVEAU CINÉMA
app.post('/api/cinemas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nom, note, adresse } = req.body;

    // Validation des données obligatoires
    if (!nom || !adresse || !adresse.rue || !adresse.ville || !adresse.code_postal) {
      return res.status(400).json({
        error: 'Les champs nom, rue, ville et code postal sont obligatoires'
      });
    }

    // Créer l'adresse
    const [adresseResult] = await db.query(
      'INSERT INTO Adresse (numero, rue, ville, code_postal) VALUES (?, ?, ?, ?)',
      [adresse.numero || '', adresse.rue, adresse.ville, adresse.code_postal]
    );

    const adresseId = adresseResult.insertId;

    // Créer le cinéma
    const [cinemaResult] = await db.query(
      'INSERT INTO Cinema (nom, note, id_adresse) VALUES (?, ?, ?)',
      [nom, note || null, adresseId]
    );

    const cinemaId = cinemaResult.insertId;

    // Récupérer le cinéma créé avec son adresse
    const [cinemas] = await db.query(`
      SELECT 
        c.id_cinema as id,
        c.nom,
        c.note,
        a.numero,
        a.rue,
        a.ville,
        a.code_postal
      FROM Cinema c
      LEFT JOIN Adresse a ON c.id_adresse = a.id_adresse
      WHERE c.id_cinema = ?
    `, [cinemaId]);

    const nouveauCinema = {
      id: cinemas[0].id,
      nom: cinemas[0].nom,
      note: cinemas[0].note,
      adresse: {
        numero: cinemas[0].numero,
        rue: cinemas[0].rue,
        ville: cinemas[0].ville,
        code_postal: cinemas[0].code_postal
      }
    };

    res.status(201).json(nouveauCinema);
  } catch (error) {
    console.error('Erreur lors de la création du cinéma:', error);
    res.status(500).json({ error: 'Erreur lors de la création du cinéma' });
  }
});

// 10. RÉCUPÉRER TOUS LES CINÉMAS
app.get('/api/cinemas', async (req, res) => {
  try {
    const [cinemas] = await db.query(`
      SELECT 
        c.id_cinema as id,
        c.nom,
        c.note,
        a.numero,
        a.rue,
        a.ville,
        a.code_postal
      FROM Cinema c
      LEFT JOIN Adresse a ON c.id_adresse = a.id_adresse
      ORDER BY c.nom
    `);

    const resultats = cinemas.map(cinema => ({
      id: cinema.id,
      nom: cinema.nom,
      note: cinema.note,
      adresse: {
        numero: cinema.numero,
        rue: cinema.rue,
        ville: cinema.ville,
        code_postal: cinema.code_postal
      }
    }));

    res.json({
      cinemas: resultats,
      total: resultats.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cinémas:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des cinémas' });
  }
});

// 11. RÉCUPÉRER UN CINÉMA SPÉCIFIQUE
app.get('/api/cinemas/:cinemaId', async (req, res) => {
  try {
    const cinemaId = parseInt(req.params.cinemaId);

    const [cinemas] = await db.query(`
      SELECT 
        c.id_cinema as id,
        c.nom,
        c.note,
        a.numero,
        a.rue,
        a.ville,
        a.code_postal
      FROM Cinema c
      LEFT JOIN Adresse a ON c.id_adresse = a.id_adresse
      WHERE c.id_cinema = ?
    `, [cinemaId]);

    if (cinemas.length === 0) {
      return res.status(404).json({ error: 'Cinéma non trouvé' });
    }

    const cinema = {
      id: cinemas[0].id,
      nom: cinemas[0].nom,
      note: cinemas[0].note,
      adresse: {
        numero: cinemas[0].numero,
        rue: cinemas[0].rue,
        ville: cinemas[0].ville,
        code_postal: cinemas[0].code_postal
      }
    };

    res.json(cinema);
  } catch (error) {
    console.error('Erreur lors de la récupération du cinéma:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du cinéma' });
  }
});

// 12. MODIFIER UN CINÉMA
app.put('/api/cinemas/:cinemaId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cinemaId = parseInt(req.params.cinemaId);
    const { nom, note, adresse } = req.body;

    // Vérifier que le cinéma existe
    const [cinemas] = await db.query('SELECT * FROM Cinema WHERE id_cinema = ?', [cinemaId]);
    if (cinemas.length === 0) {
      return res.status(404).json({ error: 'Cinéma non trouvé' });
    }

    const cinema = cinemas[0];

    // Mettre à jour le cinéma
    await db.query(
      'UPDATE Cinema SET nom = ?, note = ? WHERE id_cinema = ?',
      [nom || cinema.nom, note !== undefined ? note : cinema.note, cinemaId]
    );

    // Mettre à jour l'adresse si fournie
    if (adresse && cinema.id_adresse) {
      await db.query(
        'UPDATE Adresse SET numero = ?, rue = ?, ville = ?, code_postal = ? WHERE id_adresse = ?',
        [
          adresse.numero || '',
          adresse.rue,
          adresse.ville,
          adresse.code_postal,
          cinema.id_adresse
        ]
      );
    }

    // Récupérer le cinéma mis à jour
    const [updatedCinemas] = await db.query(`
      SELECT 
        c.id_cinema as id,
        c.nom,
        c.note,
        a.numero,
        a.rue,
        a.ville,
        a.code_postal
      FROM Cinema c
      LEFT JOIN Adresse a ON c.id_adresse = a.id_adresse
      WHERE c.id_cinema = ?
    `, [cinemaId]);

    const cinemaMisAJour = {
      id: updatedCinemas[0].id,
      nom: updatedCinemas[0].nom,
      note: updatedCinemas[0].note,
      adresse: {
        numero: updatedCinemas[0].numero,
        rue: updatedCinemas[0].rue,
        ville: updatedCinemas[0].ville,
        code_postal: updatedCinemas[0].code_postal
      }
    };

    res.json(cinemaMisAJour);
  } catch (error) {
    console.error('Erreur lors de la modification du cinéma:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du cinéma' });
  }
});

// 13. SUPPRIMER UN CINÉMA
app.delete('/api/cinemas/:cinemaId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cinemaId = parseInt(req.params.cinemaId);

    // Vérifier que le cinéma existe
    const [cinemas] = await db.query('SELECT * FROM Cinema WHERE id_cinema = ?', [cinemaId]);
    if (cinemas.length === 0) {
      return res.status(404).json({ error: 'Cinéma non trouvé' });
    }

    const cinema = cinemas[0];

    // Supprimer les relations Projeter (programmations)
    await db.query('DELETE FROM Projeter WHERE id_cinema = ?', [cinemaId]);

    // Supprimer le cinéma
    await db.query('DELETE FROM Cinema WHERE id_cinema = ?', [cinemaId]);

    // Supprimer l'adresse associée
    if (cinema.id_adresse) {
      await db.query('DELETE FROM Adresse WHERE id_adresse = ?', [cinema.id_adresse]);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du cinéma:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du cinéma' });
  }
});

// ========================================
// ROUTES PROGRAMMATIONS
// ========================================

// 14. RÉCUPÉRER TOUTES LES PROGRAMMATIONS
app.get('/api/programmations', async (req, res) => {
  try {
    const [programmations] = await db.query(`
      SELECT 
        p.id_programmation as id,
        p.date_debut,
        p.date_fin,
        GROUP_CONCAT(DISTINCT f.id_film) as film_id,
        GROUP_CONCAT(DISTINCT f.titre) as film_titre,
        GROUP_CONCAT(DISTINCT c.id_cinema) as cinema_id,
        GROUP_CONCAT(DISTINCT c.nom) as cinema_nom
      FROM Programmation p
      LEFT JOIN Programmer pr ON p.id_programmation = pr.id_programmation
      LEFT JOIN Film f ON pr.id_film = f.id_film
      LEFT JOIN Projeter pj ON p.id_programmation = pj.id_programmation
      LEFT JOIN Cinema c ON pj.id_cinema = c.id_cinema
      GROUP BY p.id_programmation
      ORDER BY p.date_debut DESC
    `);

    // Récupérer les séances pour chaque programmation
    const resultats = await Promise.all(programmations.map(async (prog) => {
      const [seances] = await db.query(`
        SELECT 
          id_seance as id,
          jour_semaine,
          heure_debut
        FROM Seance
        WHERE id_programmation = ?
        ORDER BY FIELD(jour_semaine, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche')
      `, [prog.id]);

      return {
        id: prog.id,
        film_id: prog.film_id ? parseInt(prog.film_id) : null,
        film_titre: prog.film_titre || '',
        cinema_id: prog.cinema_id ? parseInt(prog.cinema_id) : null,
        cinema_nom: prog.cinema_nom || '',
        date_debut: prog.date_debut,
        date_fin: prog.date_fin,
        seances: seances.map(s => ({
          id: s.id,
          jour_semaine: s.jour_semaine,
          heure_debut: s.heure_debut
        }))
      };
    }));

    res.json({
      programmations: resultats,
      total: resultats.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des programmations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des programmations' });
  }
});

// 15. CRÉER UNE PROGRAMMATION COMPLÈTE
app.post('/api/programmations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { film_id, cinema_id, date_debut, date_fin, seances } = req.body;

    // Validation
    if (!film_id || !cinema_id || !date_debut || !date_fin) {
      return res.status(400).json({
        error: 'Les champs film_id, cinema_id, date_debut et date_fin sont obligatoires'
      });
    }

    // Vérifier que le film existe
    const [films] = await db.query('SELECT * FROM Film WHERE id_film = ?', [film_id]);
    if (films.length === 0) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Vérifier que le cinéma existe
    const [cinemas] = await db.query('SELECT * FROM Cinema WHERE id_cinema = ?', [cinema_id]);
    if (cinemas.length === 0) {
      return res.status(404).json({ error: 'Cinéma non trouvé' });
    }

    // Créer la programmation
    const [programmationResult] = await db.query(
      'INSERT INTO Programmation (date_debut, date_fin) VALUES (?, ?)',
      [date_debut, date_fin]
    );

    const programmationId = programmationResult.insertId;

    // Lier au film
    await db.query(
      'INSERT INTO Programmer (id_programmation, id_film) VALUES (?, ?)',
      [programmationId, film_id]
    );

    // Lier au cinéma
    await db.query(
      'INSERT INTO Projeter (id_cinema, id_programmation) VALUES (?, ?)',
      [cinema_id, programmationId]
    );

    // Créer les séances
    const createdSeances = [];
    if (seances && Array.isArray(seances)) {
      for (const seance of seances) {
        const [seanceResult] = await db.query(
          'INSERT INTO Seance (jour_semaine, heure_debut, id_programmation) VALUES (?, ?, ?)',
          [seance.jour_semaine, seance.heure_debut, programmationId]
        );
        createdSeances.push({
          id: seanceResult.insertId,
          jour_semaine: seance.jour_semaine,
          heure_debut: seance.heure_debut
        });
      }
    }

    res.status(201).json({
      id: programmationId,
      film_id: film_id,
      cinema_id: cinema_id,
      date_debut: date_debut,
      date_fin: date_fin,
      seances: createdSeances
    });
  } catch (error) {
    console.error('Erreur lors de la création de la programmation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la programmation' });
  }
});

// 16. SUPPRIMER UNE PROGRAMMATION
app.delete('/api/programmations/:programmationId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const programmationId = parseInt(req.params.programmationId);

    // Vérifier que la programmation existe
    const [programmations] = await db.query('SELECT * FROM Programmation WHERE id_programmation = ?', [programmationId]);
    if (programmations.length === 0) {
      return res.status(404).json({ error: 'Programmation non trouvée' });
    }

    // Supprimer les séances
    await db.query('DELETE FROM Seance WHERE id_programmation = ?', [programmationId]);

    // Supprimer les relations
    await db.query('DELETE FROM Programmer WHERE id_programmation = ?', [programmationId]);
    await db.query('DELETE FROM Projeter WHERE id_programmation = ?', [programmationId]);

    // Supprimer la programmation
    await db.query('DELETE FROM Programmation WHERE id_programmation = ?', [programmationId]);

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la programmation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la programmation' });
  }
});

// Middleware de gestion des erreurs
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
/*const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation API: http://localhost:${PORT}/api/films`);
});*/

const PORT = process.env.PORT || 3000;

ensureAuthSetup()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`Login admin: POST http://localhost:${PORT}/api/auth/login`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur init auth:', err);
    process.exit(1);
  });

module.exports = app;