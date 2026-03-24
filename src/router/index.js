import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

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
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue')
        },
        {
          path: '/user/:id',
          component: () => import('../views/UserSpaceView.vue')
        },
        {
          path: '/category',
          component: () => import('../views/CategoryView.vue')
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

// 全局前置路由守卫：强制登录
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 定义免登录白名单页面
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !token) {
    ElMessage.warning('请先登录系统')
    return next('/login')
  }

  // 已登录用户访问登录页时，跳转到首页
  if (token && to.path === '/login') {
    return next('/home')
  }

  next()
})

export default router
