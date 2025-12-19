<template>
  <div class="cinema-management">
    <div class="page-header">
      <h2 class="page-title">🏢 Gestion des Cinémas</h2>
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        <span v-if="!showAddForm">➕ Ajouter un cinéma</span>
        <span v-else>❌ Annuler</span>
      </button>
    </div>

    <!-- Formulaire d'ajout de cinéma -->
    <div v-if="showAddForm" class="add-cinema-form">
      <h3>Ajouter un nouveau cinéma</h3>
      <form @submit.prevent="addCinema" class="cinema-form">
        <div class="form-row">
          <div class="form-group">
            <label for="nom">Nom du cinéma *</label>
            <input 
              type="text" 
              id="nom" 
              v-model="newCinema.nom" 
              required 
              placeholder="Ex: Cinéma Lumière"
            >
          </div>
          <div class="form-group">
            <label for="note">Note (sur 5)</label>
            <input 
              type="number" 
              id="note" 
              v-model="newCinema.note" 
              min="0" 
              max="5" 
              step="0.1"
              placeholder="Ex: 4.5"
            >
          </div>
        </div>

        <div class="form-section">
          <h4>📍 Adresse</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="numero">Numéro</label>
              <input 
                type="text" 
                id="numero" 
                v-model="newCinema.adresse.numero" 
                placeholder="Ex: 12"
              >
            </div>
            <div class="form-group">
              <label for="rue">Rue *</label>
              <input 
                type="text" 
                id="rue" 
                v-model="newCinema.adresse.rue" 
                required 
                placeholder="Ex: Avenue des Lumières"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="ville">Ville *</label>
              <input 
                type="text" 
                id="ville" 
                v-model="newCinema.adresse.ville" 
                required 
                placeholder="Ex: Paris"
              >
            </div>
            <div class="form-group">
              <label for="code_postal">Code postal *</label>
              <input 
                type="text" 
                id="code_postal" 
                v-model="newCinema.adresse.code_postal" 
                required 
                pattern="[0-9]{5}"
                placeholder="Ex: 75001"
              >
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">💾 Enregistrer le cinéma</button>
          <button type="button" @click="resetForm" class="btn-secondary">🔄 Réinitialiser</button>
        </div>
      </form>
    </div>

    <!-- Liste des cinémas -->
    <div class="cinemas-list">
      <h3>Cinémas existants</h3>
      
      <!-- Message de chargement -->
      <div v-if="loading" class="loading-message">
        <p>⏳ Chargement des cinémas...</p>
      </div>
      
      <!-- Message d'erreur -->
      <div v-else-if="error" class="error-message">
        <p>❌ {{ error }}</p>
        <button @click="loadCinemas" class="btn-retry">🔄 Réessayer</button>
      </div>
      
      <div v-else-if="cinemas.length === 0" class="no-cinemas">
        <p>Aucun cinéma enregistré pour le moment.</p>
        <p>Cliquez sur "Ajouter un cinéma" pour commencer !</p>
      </div>
      <div v-else class="cinemas-grid">
        <div v-for="cinema in cinemas" :key="cinema.id" class="cinema-card">
          <div class="cinema-header">
            <div>
              <h4>{{ cinema.nom }}</h4>
              <div class="cinema-rating">
                <span class="stars">⭐</span>
                <span class="note">{{ cinema.note || 'Non noté' }}</span>
              </div>
            </div>
            <div class="cinema-actions">
              <button @click="editCinema(cinema)" class="btn-edit">✏️</button>
              <button @click="deleteCinema(cinema.id)" class="btn-delete">🗑️</button>
            </div>
          </div>
          
          <div class="cinema-details">
            <div class="address-section">
              <h5>📍 Adresse</h5>
              <p>{{ formatAddress(cinema.adresse) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { cinemasAPI } from '../services/api.js'

const showAddForm = ref(false)
const cinemas = ref([])
const loading = ref(false)
const error = ref(null)

const newCinema = reactive({
  nom: '',
  note: '',
  adresse: {
    numero: '',
    rue: '',
    ville: '',
    code_postal: ''
  }
})

// Charger les cinémas au montage du composant
onMounted(async () => {
  await loadCinemas()
})

const loadCinemas = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await cinemasAPI.getAll()
    cinemas.value = response.cinemas || []
  } catch (err) {
    error.value = 'Erreur lors du chargement des cinémas: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

const addCinema = async () => {
  try {
    loading.value = true
    error.value = null
    
    const cinemaData = {
      nom: newCinema.nom,
      note: newCinema.note ? parseFloat(newCinema.note) : null,
      adresse: {
        numero: newCinema.adresse.numero,
        rue: newCinema.adresse.rue,
        ville: newCinema.adresse.ville,
        code_postal: newCinema.adresse.code_postal
      }
    }
    
    await cinemasAPI.create(cinemaData)
    
    // Recharger la liste des cinémas
    await loadCinemas()
    
    resetForm()
    showAddForm.value = false
    alert('Cinéma ajouté avec succès !')
  } catch (err) {
    error.value = 'Erreur lors de l\'ajout du cinéma: ' + err.message
    alert('Erreur: ' + err.message)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  newCinema.nom = ''
  newCinema.note = ''
  newCinema.adresse.numero = ''
  newCinema.adresse.rue = ''
  newCinema.adresse.ville = ''
  newCinema.adresse.code_postal = ''
}

const editCinema = (cinema) => {
  alert(`Édition du cinéma "${cinema.nom}" - Fonctionnalité à implémenter`)
}

const deleteCinema = async (cinemaId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce cinéma ?')) {
    try {
      loading.value = true
      await cinemasAPI.delete(cinemaId)
      await loadCinemas()
      alert('Cinéma supprimé avec succès !')
    } catch (err) {
      error.value = 'Erreur lors de la suppression: ' + err.message
      alert('Erreur: ' + err.message)
    } finally {
      loading.value = false
    }
  }
}

const formatAddress = (adresse) => {
  if (!adresse) return ''
  const parts = []
  if (adresse.numero) parts.push(adresse.numero)
  if (adresse.rue) parts.push(adresse.rue)
  if (adresse.ville) parts.push(adresse.ville)
  if (adresse.code_postal) parts.push(adresse.code_postal)
  return parts.join(', ')
}
</script>

<style scoped>
.cinema-management {
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

.add-cinema-form {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.add-cinema-form h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.cinema-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.cinemas-list {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.cinemas-list h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.no-cinemas {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.cinemas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.cinema-card {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.cinema-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.cinema-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.cinema-header h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.cinema-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stars {
  font-size: 1.1rem;
}

.note {
  font-weight: 600;
  color: #2d3748;
}

.cinema-actions {
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

.cinema-details {
  margin-top: 1rem;
}

.address-section h5 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.address-section p {
  margin: 0;
  color: #4a5568;
  line-height: 1.5;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.loading-message {
  color: #4299e1;
}

.error-message {
  color: #e53e3e;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-retry:hover {
  background-color: #3182ce;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .cinemas-grid {
    grid-template-columns: 1fr;
  }
  
  .add-cinema-form,
  .cinemas-list {
    padding: 1rem;
  }
  
  .form-section {
    padding: 1rem;
  }
}
</style>