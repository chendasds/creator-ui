<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="layout-aside">
      <el-menu
        :default-active="$route.path"
        router
        class="layout-menu"
      >
        <el-menu-item index="/dashboard">
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/artwork">
          <span>作品管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <h1>创作平台 Creation Platform</h1>
        </div>
        <div class="header-right">
          <span class="username">欢迎, {{ userInfo?.username || '用户' }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userInfo = ref(null)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      userInfo.value = JSON.parse(userStr)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-aside {
  background-color: #304156;
}

.layout-menu {
  border-right: none;
  background-color: #304156;
}

.layout-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.layout-menu :deep(.el-menu-item:hover) {
  background-color: #263445;
  color: #409eff;
}

.layout-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: #fff;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  color: #606266;
  font-size: 14px;
}

.layout-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
