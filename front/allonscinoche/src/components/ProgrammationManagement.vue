<template>
  <div v-if="!isAdmin" class="access-denied">
    <h2>⛔ Accès refusé</h2>
    <p>Accès refusé : ADMIN requis</p>
  </div>

  <div v-else class="...">
    <!-- ton composant actuel -->
  </div>

  <div class="programmation-management">
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
                {{ cinema.nom }} - {{ cinema.ville }}
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
                  <input 
                    type="time" 
                    v-model="seance.heure_debut" 
                    required
                  >
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
import { useAuth } from '../services/authStore.js'
const { isAdmin } = useAuth()

import { ref, reactive, computed, onMounted } from 'vue'
import { filmsAPI, cinemasAPI, programmationsAPI } from '../services/api'

const showAddForm = ref(false)
const programmations = ref([])
const availableFilms = ref([])
const availableCinemas = ref([])
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const editingProgrammationId = ref(null)

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const newProgrammation = reactive({
  film_id: '',
  cinema_id: '',
  date_debut: '',
  date_fin: '',
  seances: [
    {
      jour_semaine: '',
      heure_debut: ''
    }
  ]
})

// Charger les programmations depuis la base de données
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

// Charger les films depuis la base de données
const loadFilms = async () => {
  try {
    const data = await filmsAPI.getAll()
    availableFilms.value = data.films || []
  } catch (err) {
    console.error('Erreur chargement films:', err)
  }
}

// Charger les cinémas depuis la base de données
const loadCinemas = async () => {
  try {
    const data = await cinemasAPI.getAll()
    availableCinemas.value = data.cinemas || []
  } catch (err) {
    console.error('Erreur chargement cinémas:', err)
  }
}

// Charger toutes les données au montage du composant
onMounted(async () => {
  await Promise.all([
    loadProgrammations(),
    loadFilms(),
    loadCinemas()
  ])
})

const addSeance = () => {
  if (newProgrammation.seances.length < 3) {
    newProgrammation.seances.push({
      jour_semaine: '',
      heure_debut: ''
    })
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

    // ✅ Beaucoup de backends imposent EXACTEMENT 3 séances (vu ton UI)
    if (newProgrammation.seances.length !== 3) {
      alert("Tu dois configurer exactement 3 séances (3 jours par semaine).")
      return
    }

    // ✅ Vérif champs
    for (const s of newProgrammation.seances) {
      if (!s.jour_semaine || !s.heure_debut) {
        alert("Chaque séance doit avoir un jour + une heure.")
        return
      }
    }

    // ✅ anti doublons de jours
    const jours = newProgrammation.seances.map(s => s.jour_semaine)
    if (new Set(jours).size !== jours.length) {
      alert("Tu ne peux pas mettre deux fois le même jour.")
      return
    }

    // ✅ Normalise l’heure => "18:30" devient "18:30:00"
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

    console.log("📤 Payload programmation envoyé :", payload)

    // ✅ UPDATE ou CREATE
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
    // ✅ On affiche la VRAIE erreur backend si axios la renvoie
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
  newProgrammation.seances = [
    {
      jour_semaine: '',
      heure_debut: ''
    }
  ]
}

const editProgrammation = (programmation) => {
  isEditing.value = true
  editingProgrammationId.value = programmation.id
  showAddForm.value = true

  newProgrammation.film_id = programmation.film_id
  newProgrammation.cinema_id = programmation.cinema_id
  newProgrammation.date_debut = (programmation.date_debut || '').slice(0, 10)
  newProgrammation.date_fin = (programmation.date_fin || '').slice(0, 10)

  // Pré-remplir les séances
  if (programmation.seances && programmation.seances.length) {
    newProgrammation.seances = programmation.seances.map(s => ({
      jour_semaine: s.jour_semaine || '',
      // "18:30:00" -> "18:30"
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
  return cinema ? `${cinema.nom} (${cinema.ville})` : 'Cinéma inconnu'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
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

.add-programmation-form h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.programmation-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

.form-section h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.help-text {
  margin: 0 0 1rem 0;
  color: #718096;
  font-style: italic;
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
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.seances-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.seance-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.seance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.seance-header h5 {
  margin: 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #e53e3e;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn-remove:hover {
  background-color: #fed7d7;
}

.btn-add-seance {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn-add-seance:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.btn-submit {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-submit:hover,
.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.programmations-list {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.programmations-list h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.no-programmations {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.programmations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.programmation-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.programmation-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.programmation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.programmation-header h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.cinema-name {
  margin: 0;
  color: #718096;
  font-weight: 500;
}

.programmation-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn-edit:hover {
  background-color: #e2e8f0;
}

.btn-delete:hover {
  background-color: #fed7d7;
}

.programmation-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.period-section h5,
.seances-section h5 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.period-section p {
  margin: 0;
  color: #4a5568;
}

.seances-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.seance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.jour {
  font-weight: 600;
  color: #2d3748;
}

.heure {
  color: #4a5568;
  font-family: monospace;
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .programmations-grid {
    grid-template-columns: 1fr;
  }
  
  .add-programmation-form,
  .programmations-list {
    padding: 1rem;
  }
  
  .form-section {
    padding: 1rem;
  }
}
</style>