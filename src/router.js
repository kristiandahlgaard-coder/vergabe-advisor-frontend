import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import AdvisorView from './views/AdvisorView.vue';
import DashboardView from './views/DashboardView.vue';
import CreateVergabeView from './views/CreateVergabeView.vue';
import VergabeDetailView from './views/VergabeDetailView.vue';
import FreigabeWorkflowView from './views/FreigabeWorkflowView.vue';

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
    path: '/create',
    name: 'CreateVergabe',
    component: CreateVergabeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/vergabe/:id',
    name: 'VergabeDetail',
    component: VergabeDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/freigabe-workflow',
    name: 'FreigabeWorkflow',
    component: FreigabeWorkflowView,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/advisor'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/advisor');
  } else {
    next();
  }
});

export default router;
