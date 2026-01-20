<template>
  <div v-if="!isAdmin" class="access-denied">
    <h2>⛔ Accès refusé</h2>
    <p>Accès refusé : ADMIN requis</p>
  </div>

  <div v-else class="programmation-management">
    <div v-if="error" class="error-message">⚠️ {{ error }}</div>
    <div v-if="loading" class="loading">Chargement...</div>

    <div class="page-header">
      <h2 class="page-title">📅 Gestion des Programmations</h2>
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        <span v-if="!showAddForm">➕ Créer une programmation</span>
        <span v-else>❌ Annuler</span>
      </button>
    </div>

    <!-- Formulaire d'ajout de programmation -->
    <div v-if="showAddForm" class="add-programmation-form">
      <h3>Créer une nouvelle programmation</h3>
      <form @submit.prevent="addProgrammation" class="programmation-form">

        <!-- Sélection du film -->
        <div class="form-section">
          <h4>🎬 Film</h4>
          <div class="form-group">
            <label for="film">Sélectionner un film *</label>
            <select id="film" v-model="newProgrammation.film_id" required>
              <option value="">Choisir un film</option>
              <option v-for="film in availableFilms" :key="film.id" :value="film.id">
                {{ film.titre }} ({{ film.duree }}min)
              </option>
            </select>
          </div>
        </div>

        <!-- Sélection du cinéma -->
        <div class="form-section">
          <h4>🏢 Cinéma</h4>
          <div class="form-group">
            <label for="cinema">Sélectionner un cinéma *</label>
            <select id="cinema" v-model="newProgrammation.cinema_id" required>
              <option value="">Choisir un cinéma</option>
              <option v-for="cinema in availableCinemas" :key="cinema.id" :value="cinema.id">
                {{ cinema.nom }} - {{ cinema.adresse?.ville || 'Ville inconnue' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Période de programmation -->
        <div class="form-section">
          <h4>📅 Période de programmation</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="date_debut">Date de début *</label>
              <input
                type="date"
                id="date_debut"
                v-model="newProgrammation.date_debut"
                required
                :min="today"
              >
            </div>
            <div class="form-group">
              <label for="date_fin">Date de fin *</label>
              <input
                type="date"
                id="date_fin"
                v-model="newProgrammation.date_fin"
                required
                :min="newProgrammation.date_debut || today"
              >
            </div>
          </div>
        </div>

        <!-- Configuration des séances -->
        <div class="form-section">
          <h4>🕐 Séances (3 jours par semaine)</h4>
          <p class="help-text">Configurez les séances pour 3 jours de la semaine</p>

          <div class="seances-config">
            <div v-for="(seance, index) in newProgrammation.seances" :key="index" class="seance-item">
              <div class="seance-header">
                <h5>Séance {{ index + 1 }}</h5>
                <button
                  type="button"
                  @click="removeSeance(index)"
                  class="btn-remove"
                  v-if="newProgrammation.seances.length > 1"
                >
                  🗑️
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Jour de la semaine *</label>
                  <select v-model="seance.jour_semaine" required>
                    <option value="">Sélectionner un jour</option>
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                    <option value="Dimanche">Dimanche</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Heure de début *</label>
                  <input type="time" v-model="seance.heure_debut" required>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addSeance"
              class="btn-add-seance"
              v-if="newProgrammation.seances.length < 3"
            >
              ➕ Ajouter une séance
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">💾 Créer la programmation</button>
          <button type="button" @click="resetForm" class="btn-secondary">🔄 Réinitialiser</button>
        </div>
      </form>
    </div>

    <!-- Liste des programmations -->
    <div class="programmations-list">
      <h3>Programmations existantes</h3>
      <div v-if="programmations.length === 0" class="no-programmations">
        <p>Aucune programmation créée pour le moment.</p>
        <p>Cliquez sur "Créer une programmation" pour commencer !</p>
      </div>

      <div v-else class="programmations-grid">
        <div v-for="programmation in programmations" :key="programmation.id" class="programmation-card">
          <div class="programmation-header">
            <div>
              <h4>{{ getFilmTitle(programmation.film_id) }}</h4>
              <p class="cinema-name">{{ getCinemaName(programmation.cinema_id) }}</p>
            </div>
            <div class="programmation-actions">
              <button @click="editProgrammation(programmation)" class="btn-edit">✏️</button>
              <button @click="deleteProgrammation(programmation.id)" class="btn-delete">🗑️</button>
            </div>
          </div>

          <div class="programmation-details">
            <div class="period-section">
              <h5>📅 Période</h5>
              <p>Du {{ formatDate(programmation.date_debut) }} au {{ formatDate(programmation.date_fin) }}</p>
            </div>

            <div class="seances-section">
              <h5>🕐 Séances</h5>
              <div class="seances-list">
                <div v-for="seance in programmation.seances" :key="seance.id" class="seance-info">
                  <span class="jour">{{ seance.jour_semaine }}</span>
                  <span class="heure">{{ seance.heure_debut }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { filmsAPI, cinemasAPI, programmationsAPI } from '../services/api.js'
import { useAuth } from '../services/authStore.js'
const { isAdmin } = useAuth()

const showAddForm = ref(false)
const programmations = ref([])
const availableFilms = ref([])
const availableCinemas = ref([])
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const editingProgrammationId = ref(null)

const today = computed(() => new Date().toISOString().split('T')[0])

const newProgrammation = reactive({
  film_id: '',
  cinema_id: '',
  date_debut: '',
  date_fin: '',
  seances: [{ jour_semaine: '', heure_debut: '' }]
})

const loadProgrammations = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await programmationsAPI.getAll()
    programmations.value = data.programmations || []
  } catch (err) {
    error.value = 'Erreur lors du chargement des programmations: ' + err.message
    console.error('Erreur chargement programmations:', err)
  } finally {
    loading.value = false
  }
}

const loadFilms = async () => {
  try {
    const data = await filmsAPI.getAll()
    availableFilms.value = data.films || []
  } catch (err) {
    console.error('Erreur chargement films:', err)
  }
}

const loadCinemas = async () => {
  try {
    const data = await cinemasAPI.getAll()
    availableCinemas.value = data.cinemas || []
  } catch (err) {
    console.error('Erreur chargement cinémas:', err)
  }
}

onMounted(async () => {
  await Promise.all([loadProgrammations(), loadFilms(), loadCinemas()])
})

const addSeance = () => {
  if (newProgrammation.seances.length < 3) {
    newProgrammation.seances.push({ jour_semaine: '', heure_debut: '' })
  }
}

const removeSeance = (index) => {
  if (newProgrammation.seances.length > 1) {
    newProgrammation.seances.splice(index, 1)
  }
}

const addProgrammation = async () => {
  try {
    loading.value = true
    error.value = ''

    if (newProgrammation.seances.length !== 3) {
      alert("Tu dois configurer exactement 3 séances (3 jours par semaine).")
      return
    }

    for (const s of newProgrammation.seances) {
      if (!s.jour_semaine || !s.heure_debut) {
        alert("Chaque séance doit avoir un jour + une heure.")
        return
      }
    }

    const jours = newProgrammation.seances.map(s => s.jour_semaine)
    if (new Set(jours).size !== jours.length) {
      alert("Tu ne peux pas mettre deux fois le même jour.")
      return
    }

    const normalizeTime = (t) => (t && t.length === 5 ? `${t}:00` : t)

    const payload = {
      film_id: Number(newProgrammation.film_id),
      cinema_id: Number(newProgrammation.cinema_id),
      date_debut: newProgrammation.date_debut,
      date_fin: newProgrammation.date_fin,
      seances: newProgrammation.seances.map(s => ({
        jour_semaine: s.jour_semaine,
        heure_debut: normalizeTime(s.heure_debut)
      }))
    }

    if (isEditing.value && editingProgrammationId.value) {
      await programmationsAPI.update(editingProgrammationId.value, payload)
      alert("Programmation modifiée avec succès !")
    } else {
      await programmationsAPI.create(payload)
      alert("Programmation créée avec succès !")
    }

    await loadProgrammations()
    resetForm()
    showAddForm.value = false
    isEditing.value = false
    editingProgrammationId.value = null
  } catch (err) {
    const backendMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      JSON.stringify(err?.response?.data || "")

    console.error("❌ Erreur backend programmation :", err?.response || err)
    error.value = `Erreur lors de l’enregistrement : ${backendMsg || err.message}`
    alert(error.value)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  newProgrammation.film_id = ''
  newProgrammation.cinema_id = ''
  newProgrammation.date_debut = ''
  newProgrammation.date_fin = ''
  newProgrammation.seances = [{ jour_semaine: '', heure_debut: '' }]
}

const editProgrammation = (programmation) => {
  isEditing.value = true
  editingProgrammationId.value = programmation.id
  showAddForm.value = true

  newProgrammation.film_id = programmation.film_id
  newProgrammation.cinema_id = programmation.cinema_id
  newProgrammation.date_debut = (programmation.date_debut || '').slice(0, 10)
  newProgrammation.date_fin = (programmation.date_fin || '').slice(0, 10)

  if (programmation.seances && programmation.seances.length) {
    newProgrammation.seances = programmation.seances.map(s => ({
      jour_semaine: s.jour_semaine || '',
      heure_debut: (s.heure_debut || '').slice(0, 5)
    }))
  } else {
    newProgrammation.seances = [{ jour_semaine: '', heure_debut: '' }]
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteProgrammation = async (programmationId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette programmation ?')) {
    try {
      loading.value = true
      error.value = ''
      await programmationsAPI.delete(programmationId)
      await loadProgrammations()
      alert('Programmation supprimée avec succès !')
    } catch (err) {
      error.value = 'Erreur lors de la suppression de la programmation: ' + err.message
      console.error('Erreur suppression programmation:', err)
      alert('Erreur lors de la suppression. Vérifiez la console.')
    } finally {
      loading.value = false
    }
  }
}

const getFilmTitle = (filmId) => {
  const film = availableFilms.value.find(f => f.id === filmId)
  return film ? film.titre : 'Film inconnu'
}

const getCinemaName = (cinemaId) => {
  const cinema = availableCinemas.value.find(c => c.id === cinemaId)
  const ville = cinema?.adresse?.ville || 'Ville inconnue'
  return cinema ? `${cinema.nom} (${ville})` : 'Cinéma inconnu'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
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

.programmation-management {
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

.add-programmation-form {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
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

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.error-message {
  padding: 1rem;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  color: #c53030;
  margin-bottom: 1rem;
}
</style>
