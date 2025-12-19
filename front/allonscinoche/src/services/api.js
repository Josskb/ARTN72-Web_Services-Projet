// Configuration de l'API
const API_BASE_URL = 'http://localhost:3000/api';
const API_TOKEN = 'demo-token-123'; // Token par défaut pour le développement

// Fonction helper pour les requêtes
const fetchAPI = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur API');
    }

    // Pour les requêtes DELETE qui retournent 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// API Films
export const filmsAPI = {
  // Récupérer tous les films
  getAll: () => fetchAPI('/films'),
  
  // Récupérer un film spécifique
  getById: (id) => fetchAPI(`/films/${id}`),
  
  // Créer un nouveau film
  create: (filmData) => fetchAPI('/films', {
    method: 'POST',
    body: JSON.stringify(filmData)
  }),
  
  // Modifier un film
  update: (id, filmData) => fetchAPI(`/films/${id}`, {
    method: 'PUT',
    body: JSON.stringify(filmData)
  }),
  
  // Supprimer un film
  delete: (id) => fetchAPI(`/films/${id}`, {
    method: 'DELETE'
  }),
  
  // Récupérer les programmations d'un film
  getProgrammations: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/films/${id}/programmations${queryString ? '?' + queryString : ''}`;
    return fetchAPI(endpoint);
  }
};

// API Programmations
export const programmationsAPI = {
  // Récupérer toutes les programmations
  getAll: () => fetchAPI('/programmations'),
  
  // Créer une programmation complète
  create: (programmationData) => fetchAPI('/programmations', {
    method: 'POST',
    body: JSON.stringify(programmationData)
  }),
  
  // Supprimer une programmation
  delete: (id) => fetchAPI(`/programmations/${id}`, {
    method: 'DELETE'
  }),
  
  // Créer une programmation pour un film (ancienne méthode)
  createForFilm: (filmId, programmationData) => fetchAPI(`/films/${filmId}/programmations`, {
    method: 'POST',
    body: JSON.stringify(programmationData)
  }),
  
  // Créer plusieurs programmations en batch
  createBatch: (filmId, batchData) => fetchAPI(`/films/${filmId}/programmations/batch`, {
    method: 'POST',
    body: JSON.stringify(batchData)
  })
};

// API Cinémas
export const cinemasAPI = {
  // Récupérer tous les cinémas
  getAll: () => fetchAPI('/cinemas'),
  
  // Récupérer un cinéma spécifique
  getById: (id) => fetchAPI(`/cinemas/${id}`),
  
  // Créer un nouveau cinéma
  create: (cinemaData) => fetchAPI('/cinemas', {
    method: 'POST',
    body: JSON.stringify(cinemaData)
  }),
  
  // Modifier un cinéma
  update: (id, cinemaData) => fetchAPI(`/cinemas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cinemaData)
  }),
  
  // Supprimer un cinéma
  delete: (id) => fetchAPI(`/cinemas/${id}`, {
    method: 'DELETE'
  })
};

export default {
  films: filmsAPI,
  programmations: programmationsAPI,
  cinemas: cinemasAPI
};
