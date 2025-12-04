<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-section">
        <h1 class="logo">🎬 AllonsCinoche</h1>
        <p class="subtitle">Plateforme de gestion cinématographique</p>
      </div>
      <div class="user-section">
        <div class="user-info">
          <span class="user-name">Admin Cinéma</span>
          <div class="user-avatar">👤</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// Composant Header
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="rgba(255,255,255,.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
  opacity: 0.5;
}

.header-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.logo-section .logo {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(45deg, #ffd700, #ffed4a, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0.125rem 0 0 0;
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Optimisation pour grands écrans */
@media (min-width: 1400px) {
  .header-container {
    max-width: 1800px;
    padding: 0 3rem;
  }
  
  .logo {
    font-size: 2rem !important;
  }
  
  .subtitle {
    font-size: 0.8rem;
  }
  
  .user-name {
    font-size: 0.95rem;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
}

@media (max-width: 1024px) {
  .header-container {
    padding: 0 1.5rem;
  }
  
  .logo {
    font-size: 1.5rem !important;
  }
  
  .subtitle {
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 0;
  }
  
  .header-container {
    padding: 0 1rem;
  }
  
  .logo {
    font-size: 1.4rem !important;
  }
  
  .subtitle {
    font-size: 0.65rem;
  }
  
  .user-name {
    display: none;
  }
  
  .user-info {
    padding: 0.375rem 0.75rem;
    gap: 0.5rem;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
}
</style>