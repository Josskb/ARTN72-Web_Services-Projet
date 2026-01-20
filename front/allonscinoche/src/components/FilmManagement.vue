<template>
  <div v-if="!isAdmin" class="access-denied">
    <h2>⛔ Accès refusé</h2>
    <p>Accès refusé : ADMIN requis</p>
  </div>

  <div v-else class="film-management">
    <div class="page-header">
      <h2 class="page-title">🎬 Gestion des Films</h2>
      <button @click="toggleAddForm" class="btn-primary">
        {{ showAddForm ? '❌ Annuler' : '➕ Ajouter un film' }}
      </button>
    </div>

    <!-- Formulaire d'ajout de film -->
    <div v-if="showAddForm" class="add-film-form">
      <h3>Ajouter un nouveau film</h3>
      <form @submit.prevent="addFilm" class="film-form">
        <div class="form-row">
          <div class="form-group">
            <label for="titre">Titre du film *</label>
            <input
              type="text"
              id="titre"
              v-model="newFilm.titre"
              required
              placeholder="Ex: Inception"
            >
          </div>
          <div class="form-group">
            <label for="duree">Durée (minutes) *</label>
            <input
              type="number"
              id="duree"
              v-model="newFilm.duree"
              required
              min="1"
              placeholder="Ex: 148"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="langue">Langue *</label>
            <select id="langue" v-model="newFilm.langue" required>
              <option value="">Sélectionner une langue</option>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Espagnol">Espagnol</option>
              <option value="Italien">Italien</option>
              <option value="Allemand">Allemand</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div class="form-group">
            <label for="sous_titres">Sous-titres</label>
            <select id="sous_titres" v-model="newFilm.sous_titres">
              <option value="Aucun">Aucun</option>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Espagnol">Espagnol</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="age_min">Âge minimum</label>
            <select id="age_min" v-model="newFilm.age_min">
              <option value="0">Tout public</option>
              <option value="10">10 ans et plus</option>
              <option value="12">12 ans et plus</option>
              <option value="16">16 ans et plus</option>
              <option value="18">18 ans et plus</option>
            </select>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="realisateurs">Réalisateur(s) *</label>
          <input
            type="text"
            id="realisateurs"
            v-model="newFilm.realisateurs"
            required
            placeholder="Ex: Christopher Nolan, David Fincher (séparer par des virgules)"
          >
        </div>

        <div class="form-group full-width">
          <label for="acteurs">Acteurs principaux *</label>
          <input
            type="text"
            id="acteurs"
            v-model="newFilm.acteurs"
            required
            placeholder="Ex: Leonardo DiCaprio, Marion Cotillard, Tom Hardy (séparer par des virgules)"
          >
        </div>

        <div class="form-group full-width">
          <label for="synopsis">Synopsis *</label>
          <textarea
            id="synopsis"
            v-model="newFilm.synopsis"
            required
            rows="4"
            placeholder="Décrivez l'histoire du film..."
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">💾 Enregistrer le film</button>
          <button type="button" @click="resetForm" class="btn-secondary">🔄 Réinitialiser</button>
        </div>
      </form>
    </div>

    <!-- Liste des films -->
    <div class="films-list">
      <h3>Films existants</h3>

      <div v-if="loading" class="loading-message">
        <p>⏳ Chargement des films...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <p>❌ {{ error }}</p>
        <button @click="loadFilms" class="btn-retry">🔄 Réessayer</button>
      </div>

      <div v-else-if="films.length === 0" class="no-films">
        <p>Aucun film enregistré pour le moment.</p>
        <p>Cliquez sur "Ajouter un film" pour commencer !</p>
      </div>

      <div v-else class="films-grid">
        <div v-for="film in films" :key="film.id" class="film-card">
          <div class="film-header">
            <h4>{{ film.titre }}</h4>
            <div class="film-actions">
              <button @click="editFilm(film)" class="btn-edit">✏️</button>
              <button @click="deleteFilm(film.id)" class="btn-delete">🗑️</button>
            </div>
          </div>

          <div class="film-details">
            <p><strong>Durée:</strong> {{ film.duree }}</p>
            <p><strong>Réalisateur:</strong> {{ film.realisateur }}</p>
            <p><strong>Genre:</strong> {{ film.genre }}</p>
            <p><strong>Classification:</strong> {{ film.classification }}</p>
            <p v-if="film.acteurs && film.acteurs.length">
              <strong>Acteurs:</strong> {{ film.acteurs.join(', ') }}
            </p>
          </div>

          <div class="film-synopsis" v-if="film.synopsis">
            <strong>Synopsis:</strong>
            <p>{{ film.synopsis }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { filmsAPI } from '../services/api.js'
import { useAuth } from '../services/authStore.js'
const { isAdmin } = useAuth()

const showAddForm = ref(false)
const films = ref([])
const loading = ref(false)
const error = ref(null)
const isEditing = ref(false)
const editingFilmId = ref(null)

const newFilm = reactive({
  titre: '',
  duree: '',
  langue: '',
  sous_titres: 'Aucun',
  age_min: 0,
  realisateurs: '',
  acteurs: '',
  synopsis: ''
})

const toggleAddForm = () => {
  showAddForm.value = !showAddForm.value
  if (!showAddForm.value) {
    resetForm()
    isEditing.value = false
    editingFilmId.value = null
  }
}

onMounted(async () => {
  await loadFilms()
})

const loadFilms = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await filmsAPI.getAll()
    films.value = response.films || []
  } catch (err) {
    error.value = 'Erreur lors du chargement des films: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addFilm = async () => {
  try {
    loading.value = true
    error.value = null

    const realisateurPrincipal = (newFilm.realisateurs || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)[0] || ''

    const acteursArray = (newFilm.acteurs || '')
      .split(',')
      .map(a => a.trim())
      .filter(Boolean)

    const dureeNum = Number(newFilm.duree)
    if (!dureeNum || dureeNum <= 0) {
      alert("La durée doit être un nombre > 0")
      return
    }

    const filmData = {
      titre: newFilm.titre,
      duree: dureeNum,
      realisateur: realisateurPrincipal,
      genre: newFilm.langue,
      synopsis: newFilm.synopsis,
      acteurs: acteursArray,
      classification: `${newFilm.age_min}+`
    }

    if (isEditing.value && editingFilmId.value) {
      await filmsAPI.update(editingFilmId.value, filmData)
      alert('Film modifié avec succès !')
    } else {
      await filmsAPI.create(filmData)
      alert('Film ajouté avec succès !')
    }

    await loadFilms()
    resetForm()
    showAddForm.value = false
    isEditing.value = false
    editingFilmId.value = null
  } catch (err) {
    error.value = "Erreur lors de l'enregistrement du film: " + err.message
    alert('Erreur: ' + err.message)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.keys(newFilm).forEach(key => {
    if (key === 'sous_titres') newFilm[key] = 'Aucun'
    else if (key === 'age_min') newFilm[key] = 0
    else newFilm[key] = ''
  })
}

const editFilm = (film) => {
  isEditing.value = true
  editingFilmId.value = film.id
  showAddForm.value = true

  newFilm.titre = film.titre || ''

  const dureeNum = parseInt((film.duree || '').toString().replace(/\D/g, ''))
  newFilm.duree = isNaN(dureeNum) ? '' : dureeNum

  newFilm.langue = film.genre || ''
  newFilm.realisateurs = film.realisateur || ''

  if (Array.isArray(film.acteurs)) newFilm.acteurs = film.acteurs.join(', ')
  else newFilm.acteurs = film.acteurs || ''

  newFilm.synopsis = film.synopsis || ''

  const ageNum = parseInt((film.classification || '0').toString().replace(/\D/g, ''))
  newFilm.age_min = isNaN(ageNum) ? 0 : ageNum

  newFilm.sous_titres = 'Aucun'

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteFilm = async (filmId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
    try {
      loading.value = true
      await filmsAPI.delete(filmId)
      await loadFilms()
      alert('Film supprimé avec succès !')
    } catch (err) {
      error.value = 'Erreur lors de la suppression: ' + err.message
      alert('Erreur: ' + err.message)
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped>
.access-denied{
  padding: 2rem;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  color: #c53030;
}

.film-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.add-film-form {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.add-film-form h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.film-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn-submit {
  background: #48bb78;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #edf2f7;
  color: #2d3748;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.film-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.film-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.film-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  border: none;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: #edf2f7;
}

.loading-message, .error-message, .no-films {
  padding: 1rem;
  border-radius: 12px;
  background: #f7fafc;
}
</style>
