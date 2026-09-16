<template>
  <div class="login-container">
    <div class="login-card">
      <h2>🚂 Vergabe-Advisor Login</h2>
      <p class="subtitle">Prokurationsplattform für öffentliche Auftraggeber</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="kristian@tempelhof.de"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            v-model="password"
            type="password"
            id="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="test-users">
        <p><strong>Test-Users:</strong></p>
        <ul>
          <li>kristian@tempelhof.de (Beantragender)</li>
          <li>vergabestelle@tempelhof.de (Freigeber Stufe 1)</li>
          <li>finanzen@tempelhof.de (Freigeber Stufe 2)</li>
          <li>admin@tempelhof.de (Admin)</li>
        </ul>
        <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
          <em>Passwort: Kann noch gesetzt werden (placeholder)</em>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../api.service'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authService.login(email.value, password.value)
    
    // Token speichern
    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    // Zur Advisor-Seite navigieren
    router.push('/advisor')
  } catch (err) {
    error.value = err.response?.data?.error || 'Login fehlgeschlagen'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
  text-align: center;
  font-size: 1.875rem;
  margin-bottom: 0.5rem;
  color: #06b6d4;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #06b6d4;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 1rem;
}

.btn-login:hover:not(:disabled) {
  background: #0891b2;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.test-users {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #0c4a6e;
}

.test-users p {
  margin: 0.5rem 0;
}

.test-users ul {
  list-style: none;
  padding-left: 1rem;
}

.test-users li {
  margin: 0.25rem 0;
}

.test-users li:before {
  content: "→ ";
  font-weight: bold;
}
</style>
