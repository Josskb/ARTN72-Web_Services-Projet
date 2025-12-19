const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Simulation d'une base de données en mémoire
let films = [];
let programmations = [];
let nextFilmId = 1;
let nextProgrammationId = 1;

// Middleware d'authentification (simplifié)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  
  // Ici, vous valideriez le token JWT
  // Pour cet exemple, on accepte n'importe quel token
  next();
};

// 1. PUBLIER UN NOUVEAU FILM
app.post('/api/films', authenticateToken, (req, res) => {
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

    // Créer le nouveau film
    const nouveauFilm = {
      id: nextFilmId++,
      titre,
      realisateur,
      genre: genre || [],
      duree,
      synopsis,
      dateSortie,
      classification,
      poster,
      bande_annonce,
      acteurs: acteurs || [],
      dateCreation: new Date().toISOString(),
      statut: 'actif'
    };

    films.push(nouveauFilm);

    res.status(201).json(nouveauFilm);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du film' });
  }
});

// 2. CRÉER UNE PROGRAMMATION POUR UN FILM
app.post('/api/films/:filmId/programmations', authenticateToken, (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const {
      salleId,
      dateHeure,
      tarifs,
      placesDisponibles,
      version,
      qualite,
      typeSeance
    } = req.body;

    // Vérifier que le film existe
    const film = films.find(f => f.id === filmId);
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Validation des données obligatoires
    if (!salleId || !dateHeure) {
      return res.status(400).json({
        error: 'Les champs salleId et dateHeure sont obligatoires'
      });
    }

    // Vérifier les conflits de programmation
    const conflitProgrammation = programmations.find(p => 
      p.salleId === salleId && 
      Math.abs(new Date(p.dateHeure) - new Date(dateHeure)) < 3 * 60 * 60 * 1000 // 3h
    );

    if (conflitProgrammation) {
      return res.status(409).json({
        error: 'Conflit de programmation: la salle est déjà occupée à ce moment'
      });
    }

    // Créer la nouvelle programmation
    const nouvelleProgrammation = {
      id: nextProgrammationId++,
      filmId,
      salleId,
      dateHeure,
      tarifs: tarifs || { normal: 12.50, reduit: 9.50, enfant: 8.00 },
      placesDisponibles: placesDisponibles || 100,
      placesReservees: 0,
      version: version || 'VF',
      qualite: qualite || 'HD',
      typeSeance: typeSeance || 'standard',
      statut: 'programmee',
      dateCreation: new Date().toISOString()
    };

    programmations.push(nouvelleProgrammation);

    res.status(201).json(nouvelleProgrammation);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la programmation' });
  }
});

// 3. CRÉER PLUSIEURS SÉANCES EN UNE FOIS
app.post('/api/films/:filmId/programmations/batch', authenticateToken, (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const { seances, tarifsDefaut } = req.body;

    // Vérifier que le film existe
    const film = films.find(f => f.id === filmId);
    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    const nouvellesProgrammations = [];
    const erreurs = [];

    seances.forEach((seance, index) => {
      // Vérifier les conflits
      const conflitProgrammation = programmations.find(p => 
        p.salleId === seance.salleId && 
        Math.abs(new Date(p.dateHeure) - new Date(seance.dateHeure)) < 3 * 60 * 60 * 1000
      );

      if (conflitProgrammation) {
        erreurs.push({
          index,
          error: `Conflit pour la séance ${index + 1}: salle ${seance.salleId} occupée`
        });
        return;
      }

      const nouvelleProgrammation = {
        id: nextProgrammationId++,
        filmId,
        salleId: seance.salleId,
        dateHeure: seance.dateHeure,
        tarifs: seance.tarifs || tarifsDefaut || { normal: 12.50, reduit: 9.50, enfant: 8.00 },
        placesDisponibles: seance.placesDisponibles || 100,
        placesReservees: 0,
        version: seance.version || 'VF',
        qualite: seance.qualite || 'HD',
        typeSeance: seance.typeSeance || 'standard',
        statut: 'programmee',
        dateCreation: new Date().toISOString()
      };

      programmations.push(nouvelleProgrammation);
      nouvellesProgrammations.push(nouvelleProgrammation);
    });

    if (erreurs.length > 0) {
      return res.status(409).json({
        message: 'Certaines programmations n\'ont pas pu être créées',
        programmationsCreees: nouvellesProgrammations,
        erreurs
      });
    }

    res.status(201).json({
      message: `${nouvellesProgrammations.length} programmations créées avec succès`,
      programmations: nouvellesProgrammations
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création des programmations' });
  }
});

// 4. RÉCUPÉRER TOUS LES FILMS
app.get('/api/films', (req, res) => {
  try {
    let resultats = [...films];

    // Filtres optionnels
    if (req.query.genre) {
      resultats = resultats.filter(film => 
        film.genre.includes(req.query.genre)
      );
    }

    if (req.query.annee) {
      resultats = resultats.filter(film => 
        film.dateSortie && film.dateSortie.startsWith(req.query.annee)
      );
    }

    if (req.query.realisateur) {
      resultats = resultats.filter(film => 
        film.realisateur.toLowerCase().includes(req.query.realisateur.toLowerCase())
      );
    }

    res.json({
      films: resultats,
      total: resultats.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des films' });
  }
});

// 5. RÉCUPÉRER UN FILM SPÉCIFIQUE
app.get('/api/films/:filmId', (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const film = films.find(f => f.id === filmId);

    if (!film) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    res.json(film);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du film' });
  }
});

// 6. RÉCUPÉRER LES PROGRAMMATIONS D'UN FILM
app.get('/api/films/:filmId/programmations', (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    let resultats = programmations.filter(p => p.filmId === filmId);

    // Filtre par date optionnel
    if (req.query.date) {
      const dateRecherchee = new Date(req.query.date);
      resultats = resultats.filter(p => {
        const dateProgrammation = new Date(p.dateHeure);
        return dateProgrammation.toDateString() === dateRecherchee.toDateString();
      });
    }

    res.json({
      programmations: resultats,
      total: resultats.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des programmations' });
  }
});

// 7. MODIFIER UN FILM
app.put('/api/films/:filmId', authenticateToken, (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const filmIndex = films.findIndex(f => f.id === filmId);

    if (filmIndex === -1) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Mettre à jour le film
    films[filmIndex] = {
      ...films[filmIndex],
      ...req.body,
      id: filmId, // Préserver l'ID
      dateModification: new Date().toISOString()
    };

    res.json(films[filmIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la modification du film' });
  }
});

// 8. SUPPRIMER UN FILM
app.delete('/api/films/:filmId', authenticateToken, (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId);
    const filmIndex = films.findIndex(f => f.id === filmId);

    if (filmIndex === -1) {
      return res.status(404).json({ error: 'Film non trouvé' });
    }

    // Supprimer aussi toutes les programmations associées
    programmations = programmations.filter(p => p.filmId !== filmId);
    
    // Supprimer le film
    films.splice(filmIndex, 1);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du film' });
  }
});

// Middleware de gestion des erreurs
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation API: http://localhost:${PORT}/api/films`);
});

module.exports = app;