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
  ],
})

// Redirect authenticated users away from auth pages
router.beforeEach((to) => {
  const authPages = ['login', 'signup', 'mfa', 'verify-email']
  const auth = useAuthStore()
  if (authPages.includes(to.name as string) && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
