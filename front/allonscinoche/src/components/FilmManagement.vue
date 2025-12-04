<template>
  <div class="film-management">
    <div class="page-header">
      <h2 class="page-title">🎬 Gestion des Films</h2>
      <button @click="showAddForm = !showAddForm" class="btn-primary">
        <span v-if="!showAddForm">➕ Ajouter un film</span>
        <span v-else">❌ Annuler</span>
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
      <div v-if="films.length === 0" class="no-films">
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
            <p><strong>Durée:</strong> {{ film.duree }} min</p>
            <p><strong>Langue:</strong> {{ film.langue }}</p>
            <p><strong>Sous-titres:</strong> {{ film.sous_titres }}</p>
            <p><strong>Âge minimum:</strong> {{ film.age_min }} ans</p>
            <p><strong>Réalisateur(s):</strong> {{ film.realisateurs }}</p>
            <p><strong>Acteurs:</strong> {{ film.acteurs }}</p>
          </div>
          <div class="film-synopsis">
            <strong>Synopsis:</strong>
            <p>{{ film.synopsis }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const showAddForm = ref(false)
const films = ref([])

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

const addFilm = () => {
  const film = {
    id: Date.now(),
    ...newFilm
  }
  films.value.push(film)
  resetForm()
  showAddForm.value = false
  alert('Film ajouté avec succès !')
}

const resetForm = () => {
  Object.keys(newFilm).forEach(key => {
    if (key === 'sous_titres') {
      newFilm[key] = 'Aucun'
    } else if (key === 'age_min') {
      newFilm[key] = 0
    } else {
      newFilm[key] = ''
    }
  })
}

const editFilm = (film) => {
  alert(`Édition du film "${film.titre}" - Fonctionnalité à implémenter`)
}

const deleteFilm = (filmId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
    films.value = films.value.filter(f => f.id !== filmId)
    alert('Film supprimé avec succès !')
  }
}
</script>

<style scoped>
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
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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

.films-list {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.films-list h3 {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.no-films {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.film-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.film-actions {
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

.film-details {
  margin-bottom: 1rem;
}

.film-details p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #4a5568;
}

.film-synopsis {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.film-synopsis p {
  margin: 0.5rem 0 0 0;
  color: #4a5568;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .films-grid {
    grid-template-columns: 1fr;
  }
  
  .add-film-form,
  .films-list {
    padding: 1rem;
  }
}
</style>