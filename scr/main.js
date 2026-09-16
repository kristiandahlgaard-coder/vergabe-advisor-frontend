import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Views
import LoginView from './views/LoginView.vue'
import AdvisorView from './views/AdvisorView.vue'
import DashboardView from './views/DashboardView.vue'

// Router
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/advisor',
    name: 'Advisor',
    component: AdvisorView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/advisor'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/advisor')
  } else {
    next()
  }
})

// App
const app = createApp(App)
app.use(router)
app.mount('#app')
