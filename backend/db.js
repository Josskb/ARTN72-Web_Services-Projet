require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuration de la connexion à la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'allonscinoche',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer un pool de connexions
const pool = mysql.createPool(dbConfig);

// Tester la connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion à la base de données MySQL réussie');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    console.error('Vérifiez que MySQL est démarré et que les informations de connexion sont correctes');
  });

module.exports = pool;
