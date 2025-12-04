USE allonscinoche;

-- ========================================
-- SUPPRESSION DES DONNÉES EXISTANTES
-- ========================================
-- Ordre important : supprimer d'abord les tables avec FK, puis les tables référencées

-- Suppression des tables de liaison (relations N-N)
DELETE FROM Realiser;
DELETE FROM Jouer;
DELETE FROM Programmer;
DELETE FROM Projeter;

-- Suppression des tables avec FK
DELETE FROM Seance;

-- Suppression des tables principales
DELETE FROM Cinema;
DELETE FROM Film;
DELETE FROM Acteur;
DELETE FROM Realisateur;
DELETE FROM Programmation;
DELETE FROM Adresse;

-- Réinitialisation des compteurs AUTO_INCREMENT
ALTER TABLE Realiser AUTO_INCREMENT = 1;
ALTER TABLE Jouer AUTO_INCREMENT = 1;
ALTER TABLE Programmer AUTO_INCREMENT = 1;
ALTER TABLE Projeter AUTO_INCREMENT = 1;
ALTER TABLE Seance AUTO_INCREMENT = 1;
ALTER TABLE Cinema AUTO_INCREMENT = 1;
ALTER TABLE Film AUTO_INCREMENT = 1;
ALTER TABLE Acteur AUTO_INCREMENT = 1;
ALTER TABLE Realisateur AUTO_INCREMENT = 1;
ALTER TABLE Programmation AUTO_INCREMENT = 1;
ALTER TABLE Adresse AUTO_INCREMENT = 1;

-- ========================================
-- INSERTION DES NOUVELLES DONNÉES
-- ========================================

-------------------------
-- 1. INSERT Adresse
-------------------------
INSERT INTO Adresse (rue, ville, numero, code_postal) VALUES
('Avenue des Lumières', 'Paris', '12', '75001'),
('Boulevard du 7ème Art', 'Lyon', '45', '69003'),
('Rue du Cinéma', 'Marseille', '8', '13006'),
('Place de la République', 'Toulouse', '23', '31000'),
('Avenue Jean Jaurès', 'Nantes', '67', '44000'),
('Rue Victor Hugo', 'Bordeaux', '89', '33000'),
('Boulevard Saint-Germain', 'Paris', '156', '75006'),
('Cours Lafayette', 'Lyon', '34', '69006');

-------------------------
-- 2. INSERT Cinéma
-------------------------
INSERT INTO Cinema (nom, note, id_adresse) VALUES
('Cinéma Lumière', 4.5, 1),
('Grand Écran Lyon', 4.2, 2),
('Cinéma Marseille', 4.0, 3),
('Ciné Toulouse', 4.3, 4),
('Atlantis Nantes', 4.1, 5),
('Mégarama Bordeaux', 3.9, 6),
('UGC Odéon', 4.6, 7),
('Pathé Bellecour', 4.4, 8);

-------------------------
-- 3. INSERT Films
-------------------------
INSERT INTO Film (titre, duree, langue, sous_titres, age_min, synopsis) VALUES
('Inception', 148, 'Anglais', 'Français', 12, 'Un voleur introduit dans les rêves pour voler des secrets.'),
('Interstellar', 169, 'Anglais', 'Français', 10, 'Une équipe voyage à travers un trou noir pour sauver les humains.'),
('Amélie Poulain', 122, 'Français', 'Aucun', 0, 'Une jeune femme décide de changer la vie des autres.'),
('Avatar', 162, 'Anglais', 'Français', 10, 'Sur la lune Pandora, un ancien marine paralégique retrouve l''usage de ses jambes grâce à un avatar.'),
('The Matrix', 136, 'Anglais', 'Français', 12, 'Un programmeur découvre que la réalité est une simulation informatique.'),
('Titanic', 195, 'Anglais', 'Français', 10, 'Une histoire d''amour tragique lors du naufrage du Titanic.'),
('Pulp Fiction', 154, 'Anglais', 'Français', 16, 'Plusieurs histoires s''entremêlent dans le Los Angeles criminel.'),
('Le Seigneur des Anneaux', 178, 'Anglais', 'Français', 10, 'Un hobbit doit détruire un anneau magique pour sauver la Terre du Milieu.'),
('Parasite', 132, 'Coréen', 'Français', 12, 'Une famille pauvre s''infiltre dans une famille riche avec des conséquences dramatiques.'),
('La La Land', 128, 'Anglais', 'Français', 0, 'Une histoire d''amour entre un musicien de jazz et une actrice en herbe à Los Angeles.');

-------------------------
-- 4. INSERT Acteurs
-------------------------
INSERT INTO Acteur (nom) VALUES
('Leonardo DiCaprio'),
('Matthew McConaughey'),
('Audrey Tautou'),
('Elliot Page'),
('Anne Hathaway'),
('Sam Worthington'),
('Zoe Saldana'),
('Keanu Reeves'),
('Laurence Fishburne'),
('Kate Winslet'),
('John Travolta'),
('Samuel L. Jackson'),
('Uma Thurman'),
('Elijah Wood'),
('Ian McKellen'),
('Song Kang-ho'),
('Choi Woo-shik'),
('Ryan Gosling'),
('Emma Stone');

-------------------------
-- 5. INSERT Réalisateurs
-------------------------
INSERT INTO Realisateur (nom) VALUES
('Christopher Nolan'),
('Jean-Pierre Jeunet'),
('James Cameron'),
('Lana Wachowski'),
('Lilly Wachowski'),
('Quentin Tarantino'),
('Peter Jackson'),
('Bong Joon-ho'),
('Damien Chazelle');

-------------------------
-- 6. INSERT Programmation
-------------------------
INSERT INTO Programmation (date_debut, date_fin) VALUES
('2025-02-01', '2025-02-15'),
('2025-03-01', '2025-03-20'),
('2025-04-01', '2025-04-30'),
('2025-05-15', '2025-06-15'),
('2025-07-01', '2025-07-31');

-------------------------
-- 7. INSERT Séances
-------------------------
INSERT INTO Seance (jour_semaine, heure_debut, id_programmation) VALUES
-- Programmation 1 (Février)
('Lundi', '14:00:00', 1),
('Lundi', '20:30:00', 1),
('Mardi', '18:00:00', 1),
('Mercredi', '16:00:00', 1),
('Vendredi', '20:30:00', 1),
('Samedi', '14:00:00', 1),
('Samedi', '18:00:00', 1),
('Dimanche', '16:00:00', 1),

-- Programmation 2 (Mars)
('Lundi', '19:00:00', 2),
('Mercredi', '21:00:00', 2),
('Jeudi', '18:30:00', 2),
('Samedi', '16:00:00', 2),
('Dimanche', '21:00:00', 2),

-- Programmation 3 (Avril)
('Mardi', '20:00:00', 3),
('Mercredi', '18:00:00', 3),
('Vendredi', '21:30:00', 3),
('Samedi', '15:00:00', 3),

-- Programmation 4 (Mai-Juin)
('Lundi', '18:00:00', 4),
('Mercredi', '20:00:00', 4),
('Vendredi', '22:00:00', 4),
('Dimanche', '17:00:00', 4),

-- Programmation 5 (Juillet)
('Mardi', '19:30:00', 5),
('Jeudi', '21:00:00', 5),
('Samedi', '16:30:00', 5),
('Dimanche', '20:00:00', 5);

-------------------------
-- 8. INSERT Projeter : Cinéma ↔ Programmation (N-N)
-------------------------
INSERT INTO Projeter (id_cinema, id_programmation) VALUES
-- Cinéma Lumière (Paris)
(1, 1), (1, 2), (1, 4),
-- Grand Écran Lyon
(2, 1), (2, 3), (2, 5),
-- Cinéma Marseille
(3, 2), (3, 4),
-- Ciné Toulouse
(4, 1), (4, 3), (4, 5),
-- Atlantis Nantes
(5, 2), (5, 4),
-- Mégarama Bordeaux
(6, 1), (6, 3),
-- UGC Odéon (Paris)
(7, 2), (7, 4), (7, 5),
-- Pathé Bellecour (Lyon)
(8, 1), (8, 3), (8, 5);

-------------------------
-- 9. INSERT Programmer : Programmation ↔ Film (N-N)
-------------------------
INSERT INTO Programmer (id_programmation, id_film) VALUES
-- Programmation 1 (Février)
(1, 1), -- Inception
(1, 3), -- Amélie
(1, 5), -- The Matrix

-- Programmation 2 (Mars)
(2, 2), -- Interstellar
(2, 4), -- Avatar
(2, 6), -- Titanic

-- Programmation 3 (Avril)
(3, 7), -- Pulp Fiction
(3, 8), -- Le Seigneur des Anneaux
(3, 1), -- Inception (reprise)

-- Programmation 4 (Mai-Juin)
(4, 9), -- Parasite
(4, 10), -- La La Land
(4, 3), -- Amélie (reprise)

-- Programmation 5 (Juillet)
(5, 4), -- Avatar (reprise)
(5, 5), -- The Matrix (reprise)
(5, 2); -- Interstellar (reprise)

-------------------------
-- 10. INSERT Jouer : Film ↔ Acteur
-------------------------
INSERT INTO Jouer (id_film, id_acteur) VALUES
-- Inception
(1, 1), -- Leonardo DiCaprio
(1, 4), -- Elliot Page

-- Interstellar
(2, 2), -- Matthew McConaughey
(2, 5), -- Anne Hathaway

-- Amélie Poulain
(3, 3), -- Audrey Tautou

-- Avatar
(4, 6), -- Sam Worthington
(4, 7), -- Zoe Saldana

-- The Matrix
(5, 8), -- Keanu Reeves
(5, 9), -- Laurence Fishburne

-- Titanic
(6, 1), -- Leonardo DiCaprio
(6, 10), -- Kate Winslet

-- Pulp Fiction
(7, 11), -- John Travolta
(7, 12), -- Samuel L. Jackson
(7, 13), -- Uma Thurman

-- Le Seigneur des Anneaux
(8, 14), -- Elijah Wood
(8, 15), -- Ian McKellen

-- Parasite
(9, 16), -- Song Kang-ho
(9, 17), -- Choi Woo-shik

-- La La Land
(10, 18), -- Ryan Gosling
(10, 19); -- Emma Stone

-------------------------
-- 11. INSERT Realiser : Film ↔ Réalisateur
-------------------------
INSERT INTO Realiser (id_film, id_realisateur) VALUES
(1, 1), -- Inception → Christopher Nolan
(2, 1), -- Interstellar → Christopher Nolan
(3, 2), -- Amélie → Jean-Pierre Jeunet
(4, 3), -- Avatar → James Cameron
(5, 4), -- The Matrix → Lana Wachowski
(5, 5), -- The Matrix → Lilly Wachowski
(6, 3), -- Titanic → James Cameron
(7, 6), -- Pulp Fiction → Quentin Tarantino
(8, 7), -- Le Seigneur des Anneaux → Peter Jackson
(9, 8), -- Parasite → Bong Joon-ho
(10, 9); -- La La Land → Damien Chazelle
