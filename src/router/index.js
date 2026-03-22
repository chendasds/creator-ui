import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const whiteList = ['/login', '/profile']

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
      component: () => import('../layout/FrontLayout.vue'),
      redirect: '/home',
      children: [
        {
          path: '/home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: '/artwork/:id',
          component: () => import('../views/ArtworkDetail.vue')
        },
        {
          path: '/publish',
          component: () => import('../views/Publish.vue')
        },
        {
          path: '/profile',
          component: () => import('../views/UserProfile.vue')
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../layout/Layout.vue'),
      redirect: '/admin/dashboard',
      children: [
        {
          path: '/admin/dashboard',
          component: () => import('../views/dashboard/Index.vue')
        },
        {
          path: '/admin/category',
          component: () => import('../views/category/Category.vue')
        },
        {
          path: '/admin/artwork',
          component: () => import('../views/artwork/Artwork.vue')
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
