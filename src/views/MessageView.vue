<template>
  <div class="message-container">
    <el-card class="message-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">消息中心</span>
          <el-button type="primary" link @click="handleReadAll" :disabled="unreadCount === 0">
            全部标记为已读
          </el-button>
        </div>
      </template>

      <div v-if="loading" v-loading="true" style="height: 200px;"></div>
      <el-empty v-else-if="notificationList.length === 0" description="暂无消息通知~" />
      
      <div v-else class="notification-list">
        <div 
          v-for="item in notificationList" 
          :key="item.id" 
          class="msg-card-item"
          :class="{ 'is-unread': item.isRead === 0 }"
          @click="handleItemClick(item)"
        >
          <el-avatar 
            :size="46" 
            :src="item.senderAvatar" 
            class="sender-avatar"
            @click.stop="$router.push('/user/' + item.senderId)"
          >
            {{ item.senderName?.charAt(0) || 'U' }}
          </el-avatar>
          
          <div class="notification-content">
            <div class="notification-header">
              <span class="sender-name" @click.stop="$router.push('/user/' + item.senderId)">
                {{ item.senderName }}
              </span>
              <span class="action-text">{{ getActionText(item.type) }}</span>
              <span v-if="item.targetTitle" class="target-title" @click.stop="goToTarget(item)">
                《{{ item.targetTitle }}》
              </span>
            </div>
            
            <div v-if="(item.type === 3 || item.type === 5) && item.content" class="quote-content">
              {{ item.content }}
            </div>
            
            <div class="notification-time">{{ formatTime(item.createTime) }}</div>
          </div>
          
          <div v-if="item.isRead === 0" class="unread-dot"></div>
          <el-button
            class="delete-btn"
            type="danger"
            link
            :icon="Delete"
            @click.stop="handleDelete(item.id)"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const router = useRouter()
const notificationList = ref([])
const loading = ref(false)
const currentUserId = ref(null)

const unreadCount = computed(() => {
  return notificationList.value.filter(item => item.isRead === 0).length
})

const getActionText = (type) => {
  const map = {
    1: '赞了你的作品',
    2: '收藏了你的作品',
    3: '评论了你的作品',
    4: '关注了你',
    5: '发来一条系统通知'
  }
  return map[type] || '与你产生了互动'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ').substring(0, 16)
}

const goToTarget = (item) => {
  if ([1, 2, 3].includes(item.type) && item.targetId) {
    router.push('/artwork/' + item.targetId)
  }
}

const handleItemClick = (item) => {
  if ([1, 2, 3].includes(item.type) && item.targetId) {
    router.push('/artwork/' + item.targetId)
  } else if (item.type === 4 && item.senderId) {
    router.push('/user/' + item.senderId)
  }
}

const fetchNotifications = async () => {
  if (!currentUserId.value) return
  loading.value = true
  try {
    const res = await request.get(`/notification/list/${currentUserId.value}`)
    if (res.code === 200) {
      notificationList.value = res.data || []
    }
  } catch (error) {
    console.error('获取消息失败', error)
  } finally {
    loading.value = false
  }
}

const handleReadAll = async () => {
  try {
    const res = await request.put(`/notification/readAll/${currentUserId.value}`)
    if (res.code === 200) {
      ElMessage.success('已全部标记为已读')
      fetchNotifications()
      window.dispatchEvent(new Event('unread-cleared'))
    }
  } catch (error) {
    console.error('操作失败', error)
  }
}

const handleDelete = async (id) => {
  try {
    const res = await request.delete(`/notification/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchNotifications()
      window.dispatchEvent(new Event('update-notification-count'))
    }
  } catch (error) {
    console.error('删除失败', error)
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    currentUserId.value = user.id
    fetchNotifications()
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})
</script>

<style scoped>
.message-container {
  max-width: 800px;
  margin: 20px auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header .title {
  font-size: 18px;
  font-weight: 600;
}
.notification-list {
  display: flex;
  flex-direction: column;
}

/* ！！！全新类名：强行生效卡片样式 ！！！ */
.msg-card-item {
  display: flex;
  padding: 16px 20px;
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  background-color: #ffffff;
  cursor: pointer !important; /* 小手指针 */
}

/* 悬浮上浮阴影 */
.msg-card-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #e4e7ed;
}

/* 未读状态底色 */
.msg-card-item.is-unread {
  background-color: #f0f7ff;
  border-color: #c6e2ff;
}

/* 未读状态悬浮 */
.msg-card-item.is-unread:hover {
  background-color: #e6f2ff !important;
  border-color: #b3d8ff !important;
}

.msg-card-item:last-child {
  margin-bottom: 0;
}

.sender-avatar {
  cursor: pointer;
  flex-shrink: 0;
}
.notification-content {
  margin-left: 16px;
  flex: 1;
  min-width: 0;
}
.notification-header {
  margin-bottom: 8px;
  font-size: 15px;
  color: #303133;
}
.sender-name {
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  margin-right: 8px;
}
.sender-name:hover {
  color: #409eff;
}
.action-text {
  color: #606266;
  margin-right: 8px;
}
.target-title {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}
.target-title:hover {
  text-decoration: underline;
}
.quote-content {
  padding: 10px 14px;
  background-color: #f8f9fa;
  border-radius: 6px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  border-left: 3px solid #dcdfe6;
}
.notification-time {
  font-size: 13px;
  color: #909399;
}
.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  position: absolute;
  right: 10px;
  top: 15px;
  transform: none;
}
.delete-btn {
  display: none;
  position: absolute;
  right: 20px;
  bottom: 16px;
  padding: 0;
}
.msg-card-item:hover .delete-btn {
  display: inline-flex;
}
</style>