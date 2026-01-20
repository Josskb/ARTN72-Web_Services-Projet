const API_BASE_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

// Fonction helper pour les requêtes
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    ...(options.headers || {})
  };

  // Si on envoie un body, on met le JSON par défaut (sauf si déjà défini)
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // ✅ Bearer token seulement si connecté
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // 204 No Content
  if (response.status === 204) return null;

  // Lecture du body (JSON si possible, sinon texte)
  const contentType = response.headers.get('content-type') || '';
  let body = null;
  let text = '';

  try {
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      text = await response.text();
      body = text ? { message: text } : null;
    }
  } catch (e) {
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      text ||
      `Erreur API (${response.status})`;

    const err = new Error(message);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body;
};

// =======================
// AUTH
// =======================
export const authAPI = {
  login: ({ username, password }) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  me: () => fetchAPI('/auth/me')
};

// =======================
// FILMS
// =======================
export const filmsAPI = {
  getAll: () => fetchAPI('/films'),
  getById: (id) => fetchAPI(`/films/${id}`),

  create: (filmData) =>
    fetchAPI('/films', {
      method: 'POST',
      body: JSON.stringify(filmData)
    }),

  update: (id, filmData) =>
    fetchAPI(`/films/${id}`, {
      method: 'PUT',
      body: JSON.stringify(filmData)
    }),

  delete: (id) =>
    fetchAPI(`/films/${id}`, {
      method: 'DELETE'
    }),

  getProgrammations: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/films/${id}/programmations${queryString ? '?' + queryString : ''}`;
    return fetchAPI(endpoint);
  }
};

// =======================
// PROGRAMMATIONS
// =======================
export const programmationsAPI = {
  getAll: () => fetchAPI('/programmations'),
  getById: (id) => fetchAPI(`/programmations/${id}`),

  create: (programmationData) =>
    fetchAPI('/programmations', {
      method: 'POST',
      body: JSON.stringify(programmationData)
    }),

  update: (id, programmationData) =>
    fetchAPI(`/programmations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(programmationData)
    }),

  delete: (id) =>
    fetchAPI(`/programmations/${id}`, {
      method: 'DELETE'
    }),

  // Optionnel (si ton backend la supporte vraiment)
  createForFilm: (filmId, programmationData) =>
    fetchAPI(`/films/${filmId}/programmations`, {
      method: 'POST',
      body: JSON.stringify(programmationData)
    }),

  // Optionnel (si ton backend la supporte vraiment)
  createBatch: (filmId, batchData) =>
    fetchAPI(`/films/${filmId}/programmations/batch`, {
      method: 'POST',
      body: JSON.stringify(batchData)
    })
};

// =======================
// CINEMAS
// =======================
export const cinemasAPI = {
  getAll: () => fetchAPI('/cinemas'),
  getById: (id) => fetchAPI(`/cinemas/${id}`),

  create: (cinemaData) =>
    fetchAPI('/cinemas', {
      method: 'POST',
      body: JSON.stringify(cinemaData)
    }),

  update: (id, cinemaData) =>
    fetchAPI(`/cinemas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cinemaData)
    }),

  delete: (id) =>
    fetchAPI(`/cinemas/${id}`, {
      method: 'DELETE'
    })
};

// =======================
// FILMS BY CITY
// =======================
export const filmsByCity = {
  getByCity: (villeNom) => fetchAPI(`/villes/${encodeURIComponent(villeNom)}/films`)
};

export default {
  auth: authAPI,
  films: filmsAPI,
  programmations: programmationsAPI,
  cinemas: cinemasAPI,
  filmsByCity
};
