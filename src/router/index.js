import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const whiteList = ['/login']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: () => import('../layout/Layout.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/HomeView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user')
  const hasLogin = !!userStr

  if (!hasLogin && !whiteList.includes(to.path)) {
    ElMessage.warning('请先登录')
    next('/login')
  } else if (hasLogin && to.path === '/login') {
    next('/home')
  } else {
    next()
  }
})

export default router
