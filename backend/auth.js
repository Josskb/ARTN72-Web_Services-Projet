require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_PLEASE';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// ✅ Création token JWT
function generateToken(userRow) {
  // payload minimal : { id, username, role }
  return jwt.sign(
    { id: userRow.id_user, username: userRow.username, role: userRow.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ✅ Table Utilisateur (auto)
async function ensureUserTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS Utilisateur (
      id_user       INT AUTO_INCREMENT PRIMARY KEY,
      username      VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role          ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ✅ Seed admin au démarrage (si aucun ADMIN n’existe)
async function ensureDefaultAdmin() {
  const [admins] = await db.query(
    "SELECT id_user FROM Utilisateur WHERE role = 'ADMIN' LIMIT 1"
  );

  if (admins.length > 0) {
    console.log('✅ ADMIN déjà présent en base.');
    return;
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const hash = await bcrypt.hash(adminPassword, 10);

  await db.query(
    "INSERT INTO Utilisateur (username, password_hash, role) VALUES (?, ?, 'ADMIN')",
    [adminUsername, hash]
  );

  console.log(`✅ ADMIN créé : username="${adminUsername}"`);
}

// ✅ Init global
async function ensureAuthSetup() {
  await ensureUserTable();
  await ensureDefaultAdmin();
}

// ✅ Middleware JWT réel
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "Token d'authentification requis" });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: "Token invalide (format Bearer attendu)" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// ✅ Middleware RBAC ADMIN
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: "Accès refusé : ADMIN requis" });
  }
  next();
}

async function findUserByUsername(username) {
  const [rows] = await db.query(
    'SELECT id_user, username, password_hash, role FROM Utilisateur WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

function toPublicUser(userRow) {
  return { id: userRow.id_user, username: userRow.username, role: userRow.role };
}

module.exports = {
  ensureAuthSetup,
  authenticateToken,
  requireAdmin,
  generateToken,
  findUserByUsername,
  toPublicUser
};
