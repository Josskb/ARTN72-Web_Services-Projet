# Configuration Backend - AllonsCinoche

## Prérequis

- Node.js installé
- MySQL Server installé et démarré
- Base de données `allonscinoche` créée

## Installation

1. **Installer les dépendances** :
```bash
cd backend
npm install
```

2. **Configurer la base de données** :

Modifiez le fichier `.env` avec vos informations MySQL :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=allonscinoche
PORT=3000
```

3. **Créer la base de données** (si ce n'est pas déjà fait) :

Depuis la racine du projet :
```bash
# Windows
%windir%\system32\cmd.exe < ./init_prj.sh

# Unix/Linux/Mac
./init_prj.sh
```

Ou manuellement :
```bash
mysql -u root -p < bdd/init_db.sql
```

## Lancer le serveur

```bash
node api-films-server.js
```

Le serveur démarre sur `http://localhost:3000`

## Points importants

- **Mot de passe MySQL** : Si votre utilisateur MySQL `root` n'a pas de mot de passe, laissez `DB_PASSWORD=` vide dans le fichier `.env`
- **MySQL démarré** : Vérifiez que MySQL est bien démarré avant de lancer le serveur
- **Base de données** : La base `allonscinoche` doit exister avec les tables créées

## Vérification

Une fois le serveur lancé, vous devriez voir :
```
✅ Connexion à la base de données MySQL réussie
Serveur démarré sur le port 3000
Documentation API: http://localhost:3000/api/films
```

## En cas d'erreur de connexion

Si vous voyez l'erreur :
```
❌ Erreur de connexion à la base de données: Access denied for user 'root'@'localhost'
```

Vérifiez :
1. Que MySQL est démarré
2. Que le mot de passe dans `.env` est correct
3. Que l'utilisateur MySQL a les droits sur la base `allonscinoche`

Pour créer un utilisateur MySQL avec tous les droits :
```sql
CREATE USER 'allonscinoche'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON allonscinoche.* TO 'allonscinoche'@'localhost';
FLUSH PRIVILEGES;
```

Puis mettez à jour le fichier `.env` :
```env
DB_USER=allonscinoche
DB_PASSWORD=votre_mot_de_passe
```
