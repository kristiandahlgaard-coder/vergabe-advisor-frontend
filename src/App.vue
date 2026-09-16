<template>
  <div id="app" class="app-container">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-left">
        <h1>🚂 Vergabe-Advisor</h1>
      </div>
      <div class="nav-right">
        <router-link to="/advisor">Formular</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('authToken')
})

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f9fafb;
  color: #1f2937;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.navbar h1 {
  font-size: 1.5rem;
  color: #06b6d4;
  font-weight: 700;
}

.nav-right {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-right a {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-right a:hover {
  color: #06b6d4;
}

.nav-right a.router-link-active {
  color: #06b6d4;
  border-bottom: 2px solid #06b6d4;
  padding-bottom: 0.25rem;
}

.btn-logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #dc2626;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-right {
    width: 100%;
    justify-content: space-around;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
