<template>
  <div class="front-layout">
    <header class="front-header">
      <div class="header-container">
        <div class="header-left">
          <router-link to="/home" class="logo-link">
            <span class="logo-text">创作平台</span>
          </router-link>
          <nav class="nav-links">
            <span class="nav-item" @click="$router.push('/')">首页</span>
            <span class="nav-item" @click="$router.push({ path: '/', query: { feedType: 'follow' } })">关注</span>
            <span class="nav-item" @click="handleNavClick('category')">分类</span>
          </nav>
        </div>

        <div class="header-center">
          <el-input
            v-model="searchText"
            placeholder="搜索作品、作者..."
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon @click="handleSearch" style="cursor: pointer;"><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="header-right">
          <div class="header-actions">
            <div class="header-action-item" @click="handleNavClick('message')">
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
                <el-icon :size="22" color="#606266"><Bell /></el-icon>
              </el-badge>
            </div>
            <div class="header-action-item" @click="$router.push('/chat')" title="私信大厅">
              <el-badge :value="chatUnreadCount" :hidden="chatUnreadCount === 0" :max="99">
                <el-icon :size="22" color="#606266"><ChatDotRound /></el-icon>
              </el-badge>
            </div>
          </div>
          <el-button type="primary" round @click="handleWrite">
            创作分享
          </el-button>

          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-trigger">
              <el-avatar :size="36" :src="userInfo?.avatarUrl">
                {{ userInfo?.nickname?.charAt(0)?.toUpperCase() || userInfo?.username?.charAt(0)?.toUpperCase() || 'U' }}
              </el-avatar>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item v-if="userInfo?.role === 2" command="admin">
                  <el-icon><Setting /></el-icon>
                  进入管理后台
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  账号设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" style="color: #f56c6c;">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Search, User, Setting, SwitchButton, Bell, ChatDotRound } from '@element-plus/icons-vue'
import request from '@/api/request'

const router = useRouter()
const userInfo = ref(null)
const searchText = ref('')
const unreadCount = ref(0)
const chatUnreadCount = ref(0)

const fetchUnreadCount = async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    try {
      const res = await request.get(`/notification/unreadCount/${user.id}`)
      if (res.code === 200) {
        unreadCount.value = res.data || 0
      }
    } catch (e) {
      console.error('获取未读消息数失败', e)
    }
  }
}

const fetchChatUnreadCount = async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    try {
      const res = await request.get(`/chat/unreadCount/${user.id}`)
      if (res.code === 200) {
        chatUnreadCount.value = res.data || 0
      }
    } catch (e) {
      console.error('获取私信未读数失败', e)
    }
  }
}

const handleSearch = () => {
  if (!searchText.value.trim()) return
  router.push({ path: '/', query: { keyword: searchText.value.trim() } })
  searchText.value = ''
}

const handleWrite = () => {
  router.push('/publish')
}

const handleNavClick = (type) => {
  switch (type) {
    case 'follow':
      ElMessage.info('关注功能开发中')
      break
    case 'category':
      router.push('/category')
      break
    case 'message':
      router.push('/message')
      break
    case 'chat':
      ElMessage.info('私信功能开发中')
      break
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      const myUserId = userInfo.value?.id
      if (myUserId) {
        router.push(`/user/${myUserId}`)
      } else {
        ElMessage.error('未获取到用户信息，请重新登录')
        router.push('/login')
      }
      break
    case 'settings':
      router.push('/settings')
      break
    case 'admin':
      router.push('/admin/dashboard')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        ElMessage.success('已退出登录')
        router.push('/login')
      }).catch(() => {})
      break
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      userInfo.value = JSON.parse(userStr)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  fetchUnreadCount()
  fetchChatUnreadCount()
  window.addEventListener('unread-cleared', () => { unreadCount.value = 0 })
  window.addEventListener('chat-read', fetchChatUnreadCount)
  window.addEventListener('update-notification-count', fetchUnreadCount)
})
onUnmounted(() => {
  window.removeEventListener('unread-cleared', () => { unreadCount.value = 0 })
  window.removeEventListener('chat-read', fetchChatUnreadCount)
  window.removeEventListener('update-notification-count', fetchUnreadCount)
})
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.front-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo-link {
  text-decoration: none;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #409eff;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  font-size: 15px;
  color: #606266;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.nav-link.router-link-active {
  color: #409eff;
  font-weight: 500;
}

.nav-item {
  padding: 8px 16px;
  font-size: 15px;
  color: #606266;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-right: 8px;
  border-right: 1px solid #e4e7ed;
}

.action-item {
  cursor: pointer;
  line-height: 1;
}

.action-text {
  font-size: 15px;
  color: #606266;
  transition: color 0.2s;
}

.action-text:hover {
  color: #409eff;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.user-trigger:hover {
  background-color: #f5f7fa;
}

.arrow-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.2s;
}

.user-trigger:hover .arrow-icon {
  transform: rotate(180deg);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>
