USE allonscinoche;

-- -----------------------
-- TABLE Adresse
-- -----------------------
CREATE TABLE IF NOT EXISTS Adresse (
    id_adresse      INT AUTO_INCREMENT PRIMARY KEY,
    rue             VARCHAR(255),
    ville           VARCHAR(100),
    numero          VARCHAR(10),
    code_postal     VARCHAR(10)
);

-- -----------------------
-- TABLE Cinema
-- Se situe (Cinema 1,1 → Adresse 0,1)
-- → FK dans Cinema
-- -----------------------
CREATE TABLE IF NOT EXISTS Cinema (
    id_cinema   INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(255) NOT NULL,
    note        DECIMAL(3,1),
    id_adresse  INT,
    FOREIGN KEY (id_adresse) REFERENCES Adresse(id_adresse)
);

-- -----------------------
-- TABLE Programmation
-- -----------------------
CREATE TABLE IF NOT EXISTS Programmation (
    id_programmation INT AUTO_INCREMENT PRIMARY KEY,
    date_debut       DATE NOT NULL,
    date_fin         DATE NOT NULL
);

-- -----------------------
-- TABLE Film
-- -----------------------
CREATE TABLE IF NOT EXISTS Film (
    id_film     INT AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(255) NOT NULL,
    duree       INT,
    langue      VARCHAR(50),
    sous_titres VARCHAR(50),
    age_min     INT,
    synopsis    TEXT
);

-- -----------------------
-- TABLE Acteur
-- -----------------------
CREATE TABLE IF NOT EXISTS Acteur (
    id_acteur INT AUTO_INCREMENT PRIMARY KEY,
    nom       VARCHAR(255) NOT NULL
);

-- -----------------------
-- TABLE Réalisateur
-- -----------------------
CREATE TABLE IF NOT EXISTS Realisateur (
    id_realisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom            VARCHAR(255) NOT NULL
);

-- -----------------------
-- TABLE Séance
-- Avoir (Programmation 1,1 → Séance 1,n)
-- → FK dans Séance
-- -----------------------
CREATE TABLE IF NOT EXISTS Seance (
    id_seance      INT AUTO_INCREMENT PRIMARY KEY,
    jour_semaine   VARCHAR(20),
    heure_debut    TIME,
    id_programmation INT NOT NULL,
    FOREIGN KEY (id_programmation) REFERENCES Programmation(id_programmation)
);

-- -----------------------
-- TABLE Projeter (Cinéma 0,n ↔ Programmation 0,n)
-- Relation n-n
-- -----------------------
CREATE TABLE IF NOT EXISTS Projeter (
    id_cinema        INT,
    id_programmation INT,
    PRIMARY KEY (id_cinema, id_programmation),
    FOREIGN KEY (id_cinema) REFERENCES Cinema(id_cinema),
    FOREIGN KEY (id_programmation) REFERENCES Programmation(id_programmation)
);

-- -----------------------
-- TABLE Programmer (Programmation 0,n ↔ Film 0,n)
-- Relation n-n
-- -----------------------
CREATE TABLE IF NOT EXISTS Programmer (
    id_programmation INT,
    id_film          INT,
    PRIMARY KEY (id_programmation, id_film),
    FOREIGN KEY (id_programmation) REFERENCES Programmation(id_programmation),
    FOREIGN KEY (id_film) REFERENCES Film(id_film)
);

-- -----------------------
-- TABLE Jouer (Film 1,n ↔ Acteur 0,n)
-- Relation n-n
-- -----------------------
CREATE TABLE IF NOT EXISTS Jouer (
    id_film   INT,
    id_acteur INT,
    PRIMARY KEY (id_film, id_acteur),
    FOREIGN KEY (id_film) REFERENCES Film(id_film),
    FOREIGN KEY (id_acteur) REFERENCES Acteur(id_acteur)
);

-- -----------------------
-- TABLE Realiser (Film 1,n ↔ Réalisateur 0,n)
-- Relation n-n
-- -----------------------
CREATE TABLE IF NOT EXISTS Realiser (
    id_film        INT,
    id_realisateur INT,
    PRIMARY KEY (id_film, id_realisateur),
    FOREIGN KEY (id_film) REFERENCES Film(id_film),
    FOREIGN KEY (id_realisateur) REFERENCES Realisateur(id_realisateur)
);
