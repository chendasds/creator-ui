<template>
  <div class="artwork-detail-container">
    <div class="artwork-detail-content">
      <!-- 大头图 -->
      <div v-if="artwork.coverUrl" class="cover-image">
        <img :src="artwork.coverUrl" :alt="artwork.title" />
      </div>

      <!-- 文章标题 -->
      <h1 class="artwork-title">{{ artwork.title }}</h1>

      <!-- Meta 信息 -->
      <div class="artwork-meta">
        <span class="meta-item">
          <el-icon><User /></el-icon>
          {{ artwork.authorName }}
        </span>
        <span class="meta-separator">·</span>
        <span class="meta-item">
          <el-icon><Collection /></el-icon>
          {{ artwork.categoryName }}
        </span>
        <span class="meta-separator">·</span>
        <span class="meta-item">
          <el-icon><Clock /></el-icon>
          {{ formatDate(artwork.createTime) }}
        </span>
        <span class="meta-separator">·</span>
        <span class="meta-item">
          <el-icon><View /></el-icon>
          {{ artwork.viewCount || 0 }}
        </span>
        <span class="meta-separator">·</span>
        <span class="meta-item">
          <el-icon><Document /></el-icon>
          {{ artwork.wordCount || 0 }} 字
        </span>
      </div>

      <!-- 字数与阅读时长 -->
      <div class="meta-info" style="color: #8a919f; font-size: 14px; margin: 15px 0; display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
        <span>{{ artwork.authorName }}</span>
        <span>{{ artwork.createTime ? artwork.createTime.split('T')[0] : '' }}</span>
        <span>阅读 {{ artwork.viewCount || 0 }}</span>
        <span>全篇约 {{ artwork.wordCount || 0 }} 字，预计阅读 {{ Math.ceil((artwork.wordCount || 0) / 400) || 1 }} 分钟</span>
      </div>

      <!-- 标签云 -->
      <div class="detail-tags" v-if="artwork.tags && artwork.tags.length" style="margin-bottom: 25px; display: flex; gap: 8px;">
        <el-tag
          v-for="tag in artwork.tags"
          :key="tag.id"
          size="small"
          class="modern-tag-detail"
          :style="{ '--hover-color': tag.color || '#409eff' }"
          @click="goToHomeWithTag(tag.id)"
        >
          # {{ tag.name }}
        </el-tag>
      </div>

      <el-divider />

      <!-- 正文内容 -->
      <div class="article-content" v-html="artwork.content"></div>

      <!-- 互动操作区 -->
      <div class="action-bar">
        <div class="action-buttons">
          <el-button
            size="large"
            round
            :type="isLiked ? 'primary' : 'default'"
            :class="{ 'is-active': isLiked }"
            @click="handleToggle(1)"
          >
            <el-icon class="btn-icon" :class="{ 'icon-active': isLiked }"><Pointer /></el-icon>
            赞同 {{ likeCount || '' }}
          </el-button>
          <el-button
            size="large"
            round
            :type="isCollected ? 'warning' : 'default'"
            :class="{ 'is-active': isCollected }"
            @click="handleToggle(2)"
          >
            <el-icon class="btn-icon" :class="{ 'icon-active': isCollected }"><Star /></el-icon>
            收藏 {{ collectCount || '' }}
          </el-button>
        </div>
        <el-divider />
        <h3 class="comment-title">共 {{ totalComments }} 条评论</h3>

        <!-- 主评论发布框 -->
        <div class="comment-form">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
          />
          <div class="form-actions">
            <el-button type="primary" @click="submitComment">发表评论</el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-if="comments.length === 0" class="empty-comments">
            暂无评论，来抢沙发吧
          </div>
          <div v-else>
            <!-- 遍历顶级评论（已组装好的树） -->
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-main">
                <div class="comment-avatar">
                  <img :src="comment.authorAvatar || defaultAvatar" :alt="comment.authorName" />
                </div>
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.authorName || '热心网友' }}</span>
                    <span class="comment-time">{{ formatCommentTime(comment.createTime) }}</span>
                  </div>
                  <div class="comment-content" :class="{ 'text-truncate': !comment.isTextExpanded }">{{ comment.content }}</div>
                  <div v-if="comment.content && comment.content.length > 80" class="expand-btn" @click="comment.isTextExpanded = !comment.isTextExpanded">
                    {{ comment.isTextExpanded ? '收起' : '展开' }}
                  </div>
                  <div class="comment-actions">
                    <span class="action-btn" @click="showReplyInput(comment.id)">回复</span>
                    <span v-if="currentUserId === comment.userId" class="action-btn delete-btn" @click="handleDeleteComment(comment.id)">删除</span>
                  </div>

                  <!-- 回复输入框 -->
                  <div v-if="replyingTo === comment.id" class="reply-form">
                    <el-input
                      v-model="replyContent"
                      type="textarea"
                      :rows="2"
                      :placeholder="`回复 @${comment.authorName || '热心网友'}...`"
                      maxlength="500"
                      show-word-limit
                    />
                    <div class="form-actions">
                      <el-button size="small" @click="cancelReply">取消</el-button>
                      <el-button size="small" type="primary" @click="submitReply(comment.id)">发送</el-button>
                    </div>
                  </div>

                  <!-- 子评论嵌套展示（楼中楼） -->
                  <div v-if="comment.children && comment.children.length > 0" class="comment-children">
                    <div
                      v-for="child in (comment.showAllReplies ? comment.children : comment.children.slice(0, 2))"
                      :key="child.id"
                      class="child-comment-item"
                    >
                      <div class="comment-main">
                        <div class="comment-avatar small">
                          <img :src="child.authorAvatar || defaultAvatar" :alt="child.authorName" />
                        </div>
                        <div class="comment-body">
                          <div class="comment-header">
                            <span class="comment-author">{{ child.authorName || '热心网友' }}</span>
                            <span v-if="child.replyToName" class="reply-arrow">回复</span>
                            <span class="comment-author reply-target">{{ child.replyToName || comment.authorName || '热心网友' }}</span>
                            <span class="comment-time">{{ formatCommentTime(child.createTime) }}</span>
                          </div>
                          <div class="comment-content" :class="{ 'text-truncate': !child.isTextExpanded }">{{ child.content }}</div>
                          <div v-if="child.content && child.content.length > 80" class="expand-btn" @click="child.isTextExpanded = !child.isTextExpanded">
                            {{ child.isTextExpanded ? '收起' : '展开' }}
                          </div>
                          <div class="comment-actions">
                            <span class="action-btn" @click="showReplyInput(child.id)">回复</span>
                            <span v-if="currentUserId === child.userId" class="action-btn delete-btn" @click="handleDeleteComment(child.id)">删除</span>
                          </div>

                          <!-- 子评论的回复输入框 -->
                          <div v-if="replyingTo === child.id" class="reply-form">
                            <el-input
                              v-model="replyContent"
                              type="textarea"
                              :rows="2"
                              :placeholder="`回复 @${child.authorName || '热心网友'}...`"
                              maxlength="500"
                              show-word-limit
                            />
                            <div class="form-actions">
                              <el-button size="small" @click="cancelReply">取消</el-button>
                              <el-button size="small" type="primary" @click="submitReply(child.id)">发送</el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="comment.children && comment.children.length > 2" class="expand-btn" @click="comment.showAllReplies = !comment.showAllReplies">
                      {{ comment.showAllReplies ? '收起回复' : `展开其余 ${comment.children.length - 2} 条回复` }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Collection, Clock, View, Document, Pointer, Star, ChatDotRound } from '@element-plus/icons-vue'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()

// 默认头像占位图
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const artwork = ref({
  title: '',
  authorName: '',
  categoryName: '',
  createTime: '',
  viewCount: 0,
  wordCount: 0,
  coverUrl: '',
  content: ''
})

const isLiked = ref(false)
const isCollected = ref(false)
const likeCount = ref(0)
const collectCount = ref(0)

// 评论相关状态
const comments = ref([])
const totalComments = ref(0)
const commentContent = ref('')
const replyingTo = ref(null)  // 当前回复的目标评论ID
const replyContent = ref('')

// 获取当前登录用户 ID
const userStr = localStorage.getItem('user')
const currentUserId = userStr ? JSON.parse(userStr).id : null

/**
 * 点赞/收藏切换
 */
const handleToggle = async (type) => {
  const data = {
    artworkId: route.params.id,
    interactionType: type
  }
  try {
    const res = await request.post('/interaction/toggle', data)
    if (res.code === 200) {
      if (type === 1) {
        isLiked.value = res.data
        if (res.data) {
          likeCount.value++
        } else {
          likeCount.value--
        }
      } else if (type === 2) {
        isCollected.value = res.data
        if (res.data) {
          collectCount.value++
        } else {
          collectCount.value--
        }
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

/**
 * 获取文章详情
 */
const fetchDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('文章ID不存在')
    router.back()
    return
  }

  try {
    const res = await request.get(`/artwork/detail/${id}`)
    if (res.code === 200 || res.success === true) {
      artwork.value = res.data || {}
      isLiked.value = res.data?.isLiked || false
      likeCount.value = res.data?.likeCount || 0
      isCollected.value = res.data?.isCollected || false
      collectCount.value = res.data?.collectCount || 0
    } else {
      ElMessage.error(res.message || '获取文章详情失败')
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  }
}

/**
 * 获取评论列表
 */
const fetchComments = async () => {
  try {
    const res = await request.get('/comment/list', {
      params: { artworkId: route.params.id }
    })
    if (res.code === 200) {
      const rawData = res.data || []
      comments.value = rawData.map(item => ({
        ...item,
        isTextExpanded: false,
        showAllReplies: false
      }))
      totalComments.value = countAllComments(comments.value)
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

/**
 * 递归计算评论总数（含子评论）
 */
const countAllComments = (tree) => {
  let count = 0
  tree.forEach(comment => {
    count++
    if (comment.children && comment.children.length > 0) {
      count += countAllComments(comment.children)
    }
  })
  return count
}

/**
 * 格式化评论时间（相对时间）
 */
const formatCommentTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(dateStr)
}

/**
 * 显示回复输入框
 */
const showReplyInput = (commentId) => {
  replyingTo.value = replyingTo.value === commentId ? null : commentId
  replyContent.value = ''
}

/**
 * 取消回复
 */
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

/**
 * 提交主评论
 */
const submitComment = async () => {
  const content = commentContent.value.trim()
  if (!content) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    const res = await request.post('/comment/add', {
      artworkId: route.params.id,
      content,
      parentId: null
    })
    if (res.code === 200) {
      ElMessage.success('评论发布成功')
      commentContent.value = ''
      fetchComments()
    } else {
      ElMessage.error(res.message || '评论发布失败')
    }
  } catch (error) {
    console.error('评论发布失败:', error)
    ElMessage.error('评论发布失败，请稍后重试')
  }
}

/**
 * 提交回复
 */
const submitReply = async (parentId) => {
  const content = replyContent.value.trim()
  if (!content) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    const res = await request.post('/comment/add', {
      artworkId: route.params.id,
      content,
      parentId
    })
    if (res.code === 200) {
      ElMessage.success('回复发布成功')
      replyContent.value = ''
      replyingTo.value = null
      fetchComments()
    } else {
      ElMessage.error(res.message || '回复发布失败')
    }
  } catch (error) {
    console.error('回复发布失败:', error)
    ElMessage.error('回复发布失败，请稍后重试')
  }
}

/**
 * 删除评论
 */
const handleDeleteComment = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await request.delete('/comment/' + id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchComments()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const goToHomeWithTag = (tagId) => {
  router.push({ path: '/', query: { tagId: tagId } })
}

onMounted(() => {
  fetchDetail()
  fetchComments()
})
</script>

<style scoped>
.artwork-detail-container {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  padding: 40px 20px;
}

.artwork-detail-content {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 40px 48px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 大头图 */
.cover-image {
  margin: -40px -48px 32px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.cover-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

/* 文章标题 */
.artwork-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0 0 20px 0;
  letter-spacing: -0.5px;
}

/* Meta 信息 */
.artwork-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  color: #8a919f;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item .el-icon {
  font-size: 14px;
}

.meta-separator {
  color: #d3d6d8;
}

/* 分割线 */
:deep(.el-divider) {
  margin: 24px 0;
  border-color: #f0f2f5;
}

/* 标签云 */
.modern-tag-detail {
  background-color: #f4f5f5 !important;
  color: #515767 !important;
  border: none !important;
  border-radius: 4px !important;
  cursor: pointer;
  transition: all 0.3s;
}

.modern-tag-detail:hover {
  color: var(--hover-color) !important;
  background-color: #e8eaec !important;
}

/* 正文内容 */
.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #3a3a3a;
}

.article-content :deep(p) {
  margin: 0 0 16px 0;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin: 24px 0 16px;
  font-weight: 600;
  line-height: 1.4;
  color: #1a1a1a;
}

.article-content :deep(h1) { font-size: 24px; }
.article-content :deep(h2) { font-size: 20px; }
.article-content :deep(h3) { font-size: 18px; }

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.article-content :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  color: #e74c3c;
}

.article-content :deep(pre) {
  background: #282c34;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.article-content :deep(pre code) {
  background: transparent;
  color: #abb2bf;
  padding: 0;
}

.article-content :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  border-left: 4px solid #409eff;
  background: #f0f7ff;
  color: #505558;
  border-radius: 0 4px 4px 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin: 8px 0;
}

.article-content :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 12px;
  border: 1px solid #ebeef5;
  text-align: left;
}

.article-content :deep(th) {
  background: #fafafa;
  font-weight: 600;
}

/* 互动操作区 */
.action-bar {
  margin-top: 40px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.action-buttons .el-button {
  min-width: 120px;
  padding: 12px 24px;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-buttons .el-button .el-icon {
  margin-right: 6px;
  font-size: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-buttons .el-button.is-active {
  transform: scale(1.02);
}

.action-buttons .el-button:hover .btn-icon {
  transform: scale(1.15);
}

.btn-icon.icon-active {
  transform: scale(1.1);
  animation: pulse 0.4s ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

.comment-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  margin: 16px 0 0 0;
}

/* ===================== 评论区域样式 ===================== */

/* 评论发布框 */
.comment-form {
  margin-top: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.comment-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  resize: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

/* 评论列表 */
.comment-list {
  margin-top: 24px;
}

.empty-comments {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

/* 单条评论 */
.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-avatar.small img {
  width: 32px;
  height: 32px;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

.comment-actions {
  margin-top: 8px;
}

.action-btn {
  font-size: 12px;
  color: #909399;
  cursor: pointer;
  margin-right: 16px;
  transition: color 0.2s;
}

.text-truncate {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-btn {
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
  margin-top: 5px;
}

.expand-btn:hover {
  color: #66b1ff;
}

.action-btn:hover {
  color: #409eff;
}

.action-btn.delete-btn {
  color: #f56c6c;
}

.action-btn.delete-btn:hover {
  color: #e64040;
}

/* 回复输入框 */
.reply-form {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafc;
  border-radius: 6px;
}

.reply-form :deep(.el-textarea__inner) {
  border-radius: 6px;
  resize: none;
}

.reply-form .form-actions {
  margin-top: 10px;
}

/* 子评论嵌套（楼中楼） */
.comment-children {
  margin-top: 12px;
  margin-left: 40px;
  padding: 10px;
  background-color: #f9fafc;
  border-radius: 4px;
}

.child-comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.child-comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.child-comment-item:first-child {
  padding-top: 0;
}

/* 回复箭头样式 */
.reply-arrow {
  font-size: 12px;
  color: #909399;
  margin: 0 4px;
}

.reply-target {
  color: #409eff;
  font-weight: 500;
}
</style>
