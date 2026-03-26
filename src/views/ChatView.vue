<template>
  <div class="chat-wrapper">
    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="sidebar-header">近期联系人</div>
        <div class="conversation-list" v-loading="loadingConversations">
          <el-empty v-if="conversations.length === 0" description="暂无联系人" :image-size="60" />
          <div 
            v-for="item in conversations" 
            :key="item.targetUserId"
            class="conversation-item"
            :class="{ 'is-active': activeTargetId === item.targetUserId }"
            @click="selectConversation(item)"
          >
            <el-badge :value="item.unreadCount" :hidden="item.unreadCount === 0" class="avatar-badge">
              <el-avatar :size="40" :src="item.targetUserAvatar">{{ item.targetUserName?.charAt(0) || 'U' }}</el-avatar>
            </el-badge>
            <div class="conv-info">
              <div class="conv-header">
                <span class="conv-name">{{ item.targetUserName }}</span>
                <span class="conv-time">{{ formatTimeSm(item.lastMessageTime) }}</span>
              </div>
              <div class="conv-last-msg">{{ item.lastMessage }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div v-if="!activeTargetId" class="chat-empty">
          <el-icon :size="60" color="#dcdfe6"><ChatDotRound /></el-icon>
          <p>选择一个联系人开始聊天吧</p>
        </div>
        <div v-else class="chat-window">
          <div class="chat-header">
            <span class="target-name" @click="$router.push('/user/' + activeTargetId)" style="cursor: pointer;">
              {{ activeTargetName }}
            </span>
          </div>
          
          <div class="chat-history" ref="chatBox">
            <div v-if="loadingHistory" class="history-loading">加载中...</div>
            <div 
              v-for="msg in messageList" 
              :key="msg.id" 
              class="message-row"
              :class="{ 'is-me': msg.senderId === currentUserId }"
            >
              <div class="msg-time-tip" v-if="showTimeTip(msg)">{{ formatTime(msg.createTime) }}</div>
              <div class="msg-content-wrapper">
                <el-avatar 
                  v-if="msg.senderId !== currentUserId" 
                  :size="36" 
                  :src="msg.senderAvatar" 
                  class="msg-avatar"
                  @click="$router.push('/user/' + msg.senderId)"
                />
                <div class="msg-bubble">{{ msg.content }}</div>
                <el-avatar 
                  v-if="msg.senderId === currentUserId" 
                  :size="36" 
                  :src="currentUserAvatar" 
                  class="msg-avatar is-me"
                />
              </div>
            </div>
          </div>
          
          <div class="chat-input-area">
            <textarea 
              v-model="inputMessage" 
              class="chat-textarea" 
              placeholder="输入消息，按 Enter 发送，Shift + Enter 换行..."
              @keydown.enter.prevent="handleEnter"
            ></textarea>
            <div class="chat-actions">
              <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">发送 (Enter)</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()

const currentUserId = ref(null)
const currentUserAvatar = ref('')
const conversations = ref([])
const messageList = ref([])
const activeTargetId = ref(null)
const activeTargetName = ref('')
const inputMessage = ref('')

const loadingConversations = ref(false)
const loadingHistory = ref(false)
const chatBox = ref(null)
let pollTimer = null
let lastMsgTimeCache = null

const formatTimeSm = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getMonth()+1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.replace('T', ' ').substring(0, 16)
}

const showTimeTip = (msg) => true

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}

const fetchConversations = async () => {
  if (!currentUserId.value) return
  try {
    const res = await request.get(`/chat/conversations/${currentUserId.value}`)
    if (res.code === 200) {
      conversations.value = res.data || []
    }
  } catch (e) {
    console.error('获取会话列表失败', e)
  }
}

const fetchHistory = async (targetId, isPolling = false) => {
  if (!currentUserId.value || !targetId) return
  if (!isPolling) loadingHistory.value = true
  try {
    const res = await request.get(`/chat/history/${currentUserId.value}/${targetId}`)
    if (res.code === 200) {
      const newMsgs = res.data || []
      messageList.value = newMsgs
      if (newMsgs.length > 0) {
        const latestTime = newMsgs[newMsgs.length - 1].createTime
        if (latestTime !== lastMsgTimeCache) {
          lastMsgTimeCache = latestTime
          scrollToBottom()
          fetchConversations()
        }
      }
      window.dispatchEvent(new Event('chat-read'))
    }
  } catch (e) {
    console.error('获取记录失败', e)
  } finally {
    loadingHistory.value = false
  }
}

const selectConversation = (item) => {
  activeTargetId.value = item.targetUserId
  activeTargetName.value = item.targetUserName
  router.replace({ query: { ...route.query, targetId: item.targetUserId } })
  fetchHistory(item.targetUserId)
}

const handleEnter = (e) => {
  if (e.shiftKey) return
  sendMessage()
}

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || !activeTargetId.value) return
  try {
    const res = await request.post('/chat/send', {
      senderId: currentUserId.value,
      receiverId: activeTargetId.value,
      content: content
    })
    if (res.code === 200) {
      inputMessage.value = ''
      await fetchHistory(activeTargetId.value)
      scrollToBottom()
    }
  } catch (e) {
    ElMessage.error('发送失败')
  }
}

const startPolling = () => {
  pollTimer = setInterval(() => {
    if (activeTargetId.value) {
      fetchHistory(activeTargetId.value, true)
    } else {
      fetchConversations()
    }
  }, 3000)
}

onMounted(async () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    currentUserId.value = user.id
    currentUserAvatar.value = user.avatarUrl
    loadingConversations.value = true
    await fetchConversations()
    loadingConversations.value = false
    
    const queryTargetId = route.query.targetId
    if (queryTargetId) {
      const targetId = Number(queryTargetId)
      activeTargetId.value = targetId
      const existConv = conversations.value.find(c => c.targetUserId === targetId)
      activeTargetName.value = existConv ? existConv.targetUserName : '用户 ' + targetId
      await fetchHistory(targetId)
    }
    startPolling()
  } else {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.chat-wrapper {
  max-width: 1000px;
  margin: 20px auto;
  height: calc(100vh - 120px);
  min-height: 500px;
}
.chat-container {
  display: flex;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  overflow: hidden;
  border: 1px solid #ebeef5;
}
.chat-sidebar {
  width: 280px;
  background-color: #f7f7f7;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f7f7f7;
}
.conversation-list {
  flex: 1;
  overflow-y: auto;
}
.conversation-item {
  display: flex;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.conversation-item:hover {
  background-color: #ebeef5;
}
.conversation-item.is-active {
  background-color: #e1e6f0;
}
.avatar-badge {
  margin-top: 4px;
}
.conv-info {
  margin-left: 12px;
  flex: 1;
  min-width: 0;
}
.conv-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.conv-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-time {
  font-size: 12px;
  color: #909399;
}
.conv-last-msg {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 15px;
}
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chat-header {
  height: 60px;
  line-height: 60px;
  padding: 0 24px;
  font-size: 18px;
  font-weight: 600;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.chat-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.history-loading {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin-bottom: 15px;
}
.message-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.msg-time-tip {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}
.msg-content-wrapper {
  display: flex;
  align-items: flex-start;
}
.message-row.is-me .msg-content-wrapper {
  flex-direction: row-reverse;
}
.msg-avatar {
  cursor: pointer;
  flex-shrink: 0;
}
.msg-avatar.is-me {
  cursor: default;
}
.msg-bubble {
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  margin: 0 12px;
  background-color: #ffffff;
  color: #303133;
}
.message-row.is-me .msg-bubble {
  background-color: #95ec69;
  color: #000000;
}
.chat-input-area {
  height: 160px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.chat-textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 15px 20px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  background-color: transparent;
}
.chat-actions {
  padding: 10px 20px;
  text-align: right;
}
</style>
