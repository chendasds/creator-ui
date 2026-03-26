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
          path: '/user/:id',
          component: () => import('../views/UserSpaceView.vue')
        },
        {
          path: '/category',
          component: () => import('../views/CategoryView.vue')
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue')
        },
        {
          path: '/creator',
          name: 'Creator',
          component: () => import('../views/creator/CreatorLayout.vue'),
          redirect: '/creator/dashboard',
          meta: { title: '创作者中心' },
          children: [
            {
              path: 'dashboard',
              name: 'CreatorDashboard',
              component: () => import('../views/creator/Dashboard.vue'),
              meta: { title: '数据看板' }
            },
            {
              path: 'drafts',
              name: 'CreatorDrafts',
              component: () => import('../views/creator/Drafts.vue'),
              meta: { title: '草稿箱' }
            }
          ]
        },
        {
          path: '/publish',
          name: 'Publish',
          component: () => import('../views/Publish.vue'),
          meta: { title: '发布作品' }
        },
        {
          path: '/message',
          name: 'Message',
          component: () => import('../views/MessageView.vue'),
          meta: { title: '消息中心' }
        },
        {
          path: '/chat',
          name: 'Chat',
          component: () => import('../views/ChatView.vue'),
          meta: { title: '私信大厅' }
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
        },
        {
          path: '/admin/user',
          name: 'AdminUser',
          component: () => import('../views/user/User.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/admin/announcement',
          component: () => import('../views/admin/Announcement.vue')
        },
        {
          path: '/admin/tag',
          component: () => import('../views/admin/Tag.vue')
        },
        {
          path: '/admin/comment',
          component: () => import('../views/admin/Comment.vue')
        }
      ]
    }
  ]
})

// 全局前置路由守卫：强制登录与权限拦截
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')

  // 定义免登录白名单页面
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)

  // 1. 基础登录拦截
  if (authRequired && !token) {
    ElMessage.warning('请先登录系统')
    return next('/login')
  }

  // 2. 已登录用户访问登录页时，跳转到首页
  if (token && to.path === '/login') {
    return next('/home')
  }

  // 3. 管理员后台越权拦截
  // 如果目标路径是后台（以 /admin 开头），需要检查角色是否为 2（管理员）
  if (to.path.startsWith('/admin')) {
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        // 如果 role 不是 2，说明是普通用户企图越权
        if (user.role !== 2) {
          ElMessage.error('越权访问：您不是管理员，无法进入后台')
          return next('/home') // 将其踢回前台首页
        }
      } catch (e) {
        // 防止 JSON 解析错误
        console.error('用户信息解析失败', e)
        return next('/login')
      }
    } else {
      // 没拿到用户信息，也踢出去
      return next('/login')
    }
  }

  next()
})

export default router
