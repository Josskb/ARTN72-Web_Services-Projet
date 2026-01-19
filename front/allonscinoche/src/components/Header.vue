<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-section">
        <h1 class="logo">🎬 AllonsCinoche</h1>
        <p class="subtitle">Plateforme de gestion cinématographique</p>
      </div>

      <div class="user-section">
        <div class="user-info">
          <span class="user-name">
            {{ isLoggedIn ? `${state.user.username} (${state.user.role})` : 'Visiteur' }}
          </span>

          <button
            v-if="!isLoggedIn"
            class="btn-auth"
            @click="openLogin"
          >
            🔐 Connexion admin
          </button>

          <button
            v-else
            class="btn-auth logout"
            @click="doLogout"
          >
            🚪 Déconnexion
          </button>

          <div class="user-avatar">👤</div>
        </div>
      </div>
    </div>
  </header>

  <!-- ✅ IMPORTANT : le modal est téléporté dans le BODY -->
  <Teleport to="body">
    <div v-if="showLogin" class="modal-backdrop" @click.self="closeLogin">
      <div class="modal">
        <h3 class="modal-title">Connexion</h3>

        <div v-if="loginError" class="modal-error">
          ❌ {{ loginError }}
        </div>

        <div class="modal-form">
          <label>
            Username
            <input v-model="form.username" type="text" placeholder="admin" />
          </label>

          <label>
            Password
            <input v-model="form.password" type="password" placeholder="admin123" />
          </label>

          <div class="modal-actions">
            <button class="btn-modal" @click="submitLogin" :disabled="loading">
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
            <button class="btn-modal secondary" @click="closeLogin" :disabled="loading">
              Annuler
            </button>
          </div>

          <p class="hint">
            ⚠️ Seuls les comptes <strong>ADMIN</strong> ont accès au CRUD.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>


<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuth } from '../services/authStore.js'

const emit = defineEmits(['login-success', 'logout'])

const { state, isLoggedIn, isAdmin, login, logout } = useAuth()

const showLogin = ref(false)
const loading = ref(false)
const loginError = ref(null)

const form = reactive({
  username: '',
  password: ''
})

const openLogin = () => {
  showLogin.value = true
  loginError.value = null
  form.username = ''
  form.password = ''
}

const closeLogin = () => {
  showLogin.value = false
  loginError.value = null
}

const submitLogin = async () => {
  loginError.value = null
  loading.value = true

  try {
    const res = await login(form.username, form.password)

    // ✅ Si admin => on bascule sur dashboard
    if (res.user.role === 'ADMIN') {
      emit('login-success')
    }

    closeLogin()
  } catch (err) {
    loginError.value = err?.body?.error || err.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

const doLogout = () => {
  logout()
  emit('logout')
}
</script>

<style scoped>
/* (Ton style existant est conservé) */
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

.header-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section .logo {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(45deg, #ffd700, #ffed4a, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  margin: 0.125rem 0 0 0;
  font-size: 0.75rem;
  opacity: 0.9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
}

.btn-auth {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: white;
  border-radius: 12px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
}

.btn-auth:hover {
  background: rgba(255, 255, 255, 0.28);
}

.btn-auth.logout {
  background: rgba(255, 120, 120, 0.25);
  border-color: rgba(255, 120, 120, 0.45);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 2rem 1rem;
  overflow-y: auto;

  z-index: 999999; /* ✅ au-dessus de tout */
}

.modal {
  width: 420px;
  max-width: 95vw;

  background: white;
  border-radius: 14px;
  padding: 1.25rem;
  color: #1a202c;

  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);

  max-height: 85vh;
  overflow-y: auto;
}


.modal-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.modal-error {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.modal-form label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.modal-form input {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.6rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-modal {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 800;
  padding: 0.7rem;
  border-radius: 10px;
  cursor: pointer;
}

.btn-modal.secondary {
  background: #edf2f7;
  color: #2d3748;
}

.hint {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #4a5568;
}
</style>
