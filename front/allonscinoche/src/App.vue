<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import Navigation from './components/Navigation.vue'
import FilmManagement from './components/FilmManagement.vue'
import CinemaManagement from './components/CinemaManagement.vue'
import ProgrammationManagement from './components/ProgrammationManagement.vue'
import Dashboard from './components/Dashboard.vue'

const currentView = ref('dashboard')

const setView = (view) => {
  currentView.value = view
}
</script>

<template>
  <div id="app">
    <Header />
    <div class="main-container">
      <Navigation :current-view="currentView" @change-view="setView" />
      <main class="content">
        <Dashboard v-if="currentView === 'dashboard'" />
        <FilmManagement v-else-if="currentView === 'films'" />
        <CinemaManagement v-else-if="currentView === 'cinemas'" />
        <ProgrammationManagement v-else-if="currentView === 'programmations'" />
      </main>
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow-x: hidden;
  padding-top: 70px; /* Espace pour le header fixe */
}

.main-container {
  display: flex;
  min-height: calc(100vh - 70px);
  width: 100vw;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.content {
  flex: 1;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.98);
  margin: 1rem 1rem 1rem 0;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 120px);
  min-width: 0;
  box-sizing: border-box;
}

/* Optimisation pour écrans larges */
@media (min-width: 1200px) {
  #app {
    padding-top: 80px;
  }
  
  .main-container {
    max-width: 100vw;
    width: 100%;
    min-height: calc(100vh - 80px);
  }
  
  .content {
    padding: 2rem;
    margin: 1.5rem 1.5rem 1.5rem 0;
    border-radius: 20px;
    max-height: calc(100vh - 130px);
  }
}

/* Tablettes */
@media (max-width: 1024px) {
  #app {
    padding-top: 65px;
  }
  
  .main-container {
    min-height: calc(100vh - 65px);
  }
  
  .content {
    padding: 1.5rem;
    margin: 1rem 1rem 1rem 0;
    max-height: calc(100vh - 115px);
  }
}

/* Mobile */
@media (max-width: 768px) {
  #app {
    padding-top: 60px;
  }
  
  .main-container {
    flex-direction: column;
    width: 100%;
    min-height: calc(100vh - 60px);
  }
  
  .content {
    margin: 0.5rem;
    padding: 1rem;
    max-height: none;
    border-radius: 10px;
  }
}
</style>
