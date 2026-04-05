import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignupView.vue'),
    },
    {
      path: '/mfa',
      name: 'mfa',
      component: () => import('@/views/auth/MfaView.vue'),
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailView.vue'),
    },
    {
      path: '/signup-success',
      name: 'signup-success',
      component: () => import('@/views/auth/SignupSuccessView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdminRole: true },
    },
    {
      path: '/admin/users',
      name: 'manage-users',
      component: () => import('@/views/admin/ManageUsersView.vue'),
      meta: { requiresAuth: true, requiresAdminRole: true },
    },
    {
      path: '/admin/questions',
      name: 'questions',
      component: () => import('@/views/admin/InvestmentProfileQuestionsView.vue'),
      meta: { requiresAuth: true, requiresAdminRole: true },
    },
  ],
})

// Redirect authenticated users away from auth pages; guard protected routes
router.beforeEach((to) => {
  const authPages = ['login', 'signup', 'mfa', 'verify-email', 'signup-success']
  const auth = useAuthStore()
  if (authPages.includes(to.name as string) && auth.isAuthenticated) {
    return { name: 'home' }
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.requiresRole && auth.user?.role !== to.meta.requiresRole) {
    return { name: 'home' }
  }
  if (to.meta.requiresAdminRole && !auth.isAdminRole) {
    return { name: 'home' }
  }
})

export default router
