<template>
  <div class="creator-container">
    <el-container class="creator-layout">
      <el-aside width="240px" class="creator-aside">
        <div class="aside-header">
          <span>创作中心</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="creator-menu"
          router
        >
          <el-menu-item index="/creator/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>数据看板</span>
          </el-menu-item>
          
          <el-menu-item index="/creator/drafts">
            <el-icon><Document /></el-icon>
            <span>草稿箱</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="creator-main">
        <div class="main-content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { EditPen, Document, DataLine, Management } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => {
  return route.path
})
</script>

<style scoped>
.creator-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
}
.creator-layout {
  width: 1200px;
  max-width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  background-color: transparent;
}
.creator-aside {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  margin-right: 20px;
  height: fit-content;
  min-height: 500px;
}
.aside-header {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}
.creator-menu {
  border-right: none;
}
.creator-main {
  padding: 0;
  background-color: transparent;
}
.main-content-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  min-height: 600px;
  overflow: hidden;
}
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
