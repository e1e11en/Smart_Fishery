import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Dashboard.vue'), meta: { title: '主功能页', icon: 'Odometer' } },
      { path: 'monitor', name: 'Monitor', component: () => import('@/views/monitor/Monitor.vue'), meta: { title: '环境监测', icon: 'Monitor' } },
      { path: 'production', name: 'Production', component: () => import('@/views/production/Production.vue'), meta: { title: '生产管理', icon: 'Notebook' } },
      { path: 'warning', name: 'Warning', component: () => import('@/views/warning/Warning.vue'), meta: { title: '预警指挥', icon: 'Warning' } },
      { path: 'traceability', name: 'Traceability', component: () => import('@/views/traceability/Traceability.vue'), meta: { title: '产品溯源', icon: 'Connection' } },
      { path: 'brand', name: 'Brand', component: () => import('@/views/brand/Brand.vue'), meta: { title: '品牌展示', icon: 'Star' } },
      { path: 'admin', name: 'Admin', component: () => import('@/views/admin/Admin.vue'), meta: { title: '管理后台', icon: 'Setting', roles: ['admin'] } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router