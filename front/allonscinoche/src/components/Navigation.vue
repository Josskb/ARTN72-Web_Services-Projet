<template>
  <nav class="navigation">
    <ul class="nav-menu">
      <li class="nav-item">
        <button 
          @click="$emit('change-view', 'dashboard')"
          :class="{ active: currentView === 'dashboard' }"
          class="nav-button"
        >
          📊 Tableau de bord
        </button>
      </li>
      <li class="nav-item">
        <button 
          @click="$emit('change-view', 'films')"
          :class="{ active: currentView === 'films' }"
          class="nav-button"
        >
          🎬 Gestion des Films
        </button>
      </li>
      <li class="nav-item">
        <button 
          @click="$emit('change-view', 'cinemas')"
          :class="{ active: currentView === 'cinemas' }"
          class="nav-button"
        >
          🏢 Gestion des Cinémas
        </button>
      </li>
      <li class="nav-item">
        <button 
          @click="$emit('change-view', 'programmations')"
          :class="{ active: currentView === 'programmations' }"
          class="nav-button"
        >
          📅 Programmations
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  currentView: {
    type: String,
    required: true
  }
})

defineEmits(['change-view'])
</script>

<style scoped>
.navigation {
  width: 240px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
  padding: 1.5rem 0.75rem;
  backdrop-filter: blur(15px);
  border-radius: 15px 0 0 15px;
  margin: 1rem 0 1rem 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow: hidden;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  margin-bottom: 0;
}

.nav-button {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.nav-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  border-color: transparent;
  transform: translateX(3px);
}

/* Optimisation pour grands écrans */
@media (min-width: 1200px) {
  .navigation {
    width: 260px;
    padding: 1.75rem 1rem;
    margin: 1.5rem 0 1.5rem 1.5rem;
    border-radius: 20px 0 0 20px;
  }
  
  .nav-button {
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
    gap: 0.75rem;
  }
}

@media (max-width: 1024px) {
  .navigation {
    width: 220px;
    padding: 1.25rem 0.75rem;
  }
  
  .nav-button {
    padding: 0.75rem 0.875rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .navigation {
    width: 100%;
    flex-shrink: 1;
    padding: 1rem;
    margin: 0.5rem;
    border-radius: 10px;
  }
  
  .nav-menu {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.5rem;
  }
  
  .nav-button {
    font-size: 0.8rem;
    padding: 0.75rem 0.5rem;
    justify-content: center;
    text-align: center;
  }
  
  .nav-button:hover,
  .nav-button.active {
    transform: none;
  }
}
</style>