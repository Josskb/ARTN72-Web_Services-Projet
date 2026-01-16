<template>
  <div class="films-by-city">
    <div class="page-header">
      <h1 class="page-title">🎬 Films par Ville</h1>
    </div>

    <!-- Formulaire de recherche -->
    <div class="search-section">
      <div class="search-card">
        <h3>Rechercher les films dans une ville</h3>
        <div class="search-form">
          <div class="form-group">
            <label for="cityInput">Nom de la ville</label>
            <input
              id="cityInput"
              v-model="searchCity"
              type="text"
              placeholder="Ex: Paris, Lyon, Marseille..."
              @keyup.enter="searchFilms"
              class="city-input"
            />
          </div>
          <button 
            @click="searchFilms"
            :disabled="!searchCity || loading"
            class="btn-search"
          >
            {{ loading ? 'Recherche en cours...' : '🔍 Rechercher' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
      <button @click="error = null" class="btn-close">✕</button>
    </div>

    <!-- Résultats de la recherche -->
    <div v-if="searchPerformed" class="results-section">
      <div v-if="loading" class="loading-message">
        ⏳ Chargement des films...
      </div>

      <div v-else-if="films.length === 0" class="no-results">
        <p>Aucun film trouvé dans <strong>{{ lastSearchCity }}</strong></p>
        <p class="hint">Essayez une autre ville ou vérifiez l'orthographe</p>
      </div>

      <div v-else class="results-content">
        <div class="results-header">
          <h2>{{ films.length }} film(s) trouvé(s) dans <strong>{{ lastSearchCity }}</strong></h2>
        </div>

        <div class="films-grid">
          <div 
            v-for="film in films" 
            :key="film.id"
            class="film-card"
          >
            <div class="film-header">
              <h4>{{ film.titre }}</h4>
              <span class="classification">{{ film.classification }}</span>
            </div>

            <div class="film-details">
              <div class="detail-row">
                <span class="label">Réalisateur:</span>
                <span class="value">{{ film.realisateur || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Durée:</span>
                <span class="value">{{ film.duree || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Genre:</span>
                <span class="value">{{ film.genre || 'N/A' }}</span>
              </div>

              <div v-if="film.acteurs && film.acteurs.length > 0" class="detail-row">
                <span class="label">Acteurs:</span>
                <span class="value">{{ film.acteurs.join(', ') }}</span>
              </div>

              <div v-if="film.synopsis" class="synopsis-section">
                <p class="synopsis-label">Synopsis:</p>
                <p class="synopsis-text">{{ film.synopsis }}</p>
              </div>

              <div v-if="film.cinemas && film.cinemas.length > 0" class="cinemas-section">
                <p class="cinemas-label">Cinémas proposant ce film:</p>
                <div class="cinemas-list">
                  <span v-for="(cinema, idx) in film.cinemas" :key="idx" class="cinema-tag">
                    {{ cinema }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message initial -->
    <div v-if="!searchPerformed" class="initial-message">
      <div class="welcome-card">
        <h2>Bienvenue!</h2>
        <p>Utilisez la barre de recherche ci-dessus pour découvrir tous les films proposés dans une ville spécifique.</p>
        <div class="example-cities">
          <p class="example-label">Exemples de villes:</p>
          <div class="city-suggestions">
            <button 
              v-for="city in suggestedCities"
              :key="city"
              @click="quickSearch(city)"
              class="city-suggestion-btn"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { filmsByCity } from '../services/api.js'

const searchCity = ref('')
const films = ref([])
const loading = ref(false)
const error = ref(null)
const searchPerformed = ref(false)
const lastSearchCity = ref('')

const suggestedCities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux']

const searchFilms = async () => {
  if (!searchCity.value.trim()) {
    error.value = 'Veuillez entrer le nom d\'une ville'
    return
  }

  try {
    loading.value = true
    error.value = null
    searchPerformed.value = true
    lastSearchCity.value = searchCity.value

    const response = await filmsByCity.getByCity(searchCity.value)
    films.value = response.films || []
  } catch (err) {
    error.value = 'Erreur lors de la récupération des films: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

const quickSearch = (city) => {
  searchCity.value = city
  searchFilms()
}
</script>

<style scoped>
.films-by-city {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.search-section {
  margin-bottom: 2rem;
}

.search-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.search-card h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.search-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
}

.city-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.city-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-search {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-search:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fed7d7;
  border: 2px solid #fc8181;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #c53030;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  color: #c53030;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
}

.results-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.loading-message {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #4299e1;
}

.no-results {
  text-align: center;
  padding: 3rem;
}

.no-results p {
  font-size: 1.1rem;
  color: #4a5568;
  margin: 0.5rem 0;
}

.no-results .hint {
  color: #718096;
  font-size: 1rem;
  font-style: italic;
}

.results-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.results-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.film-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.film-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.film-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.film-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.2rem;
  flex: 1;
}

.classification {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.film-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #2d3748;
  min-width: 80px;
}

.value {
  color: #4a5568;
  flex: 1;
}

.synopsis-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #cbd5e0;
}

.synopsis-label {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.synopsis-text {
  margin: 0;
  color: #4a5568;
  line-height: 1.5;
  font-size: 0.9rem;
}

.cinemas-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #cbd5e0;
}

.cinemas-label {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.cinemas-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cinema-tag {
  background: #edf2f7;
  color: #2d3748;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #cbd5e0;
}

.initial-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  max-width: 600px;
  text-align: center;
}

.welcome-card h2 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.75rem;
}

.welcome-card p {
  margin: 0 0 1.5rem 0;
  color: #4a5568;
  line-height: 1.6;
}

.example-label {
  margin: 1rem 0 0.75rem 0;
  color: #2d3748;
  font-weight: 600;
}

.city-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.city-suggestion-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.city-suggestion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-search {
    width: 100%;
  }

  .films-grid {
    grid-template-columns: 1fr;
  }

  .film-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .classification {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .search-card,
  .results-section {
    padding: 1.5rem;
  }
}
</style>
