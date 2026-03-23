<template>
  <div class="user-space-container">
    <el-row :gutter="20">
      <!-- 左侧内容区域 -->
      <el-col :span="16">
        <!-- 用户信息卡片 -->
        <el-card class="profile-header-card" shadow="never">
          <div class="profile-header">
            <el-avatar :size="80" :src="userInfo.avatarUrl">
              {{ userInfo.nickname?.charAt(0) || userInfo.username?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="profile-info">
              <h2 class="profile-name">{{ userInfo.nickname || userInfo.username || '未命名用户' }}</h2>
              <p class="profile-bio">{{ userInfo.bio || '这个人很懒，暂时没有写简介...' }}</p>
            </div>
            <div class="profile-actions">
              <el-button 
                v-if="isMyOwnSpace" 
                type="primary" 
                @click="handleEditProfile"
              >
                编辑资料
              </el-button>
              <el-button 
                v-else 
                :type="isFollowing ? 'default' : 'primary'" 
                :plain="!isFollowing" 
                @click="handleToggleFollow"
              >
                {{ isFollowing ? '已关注' : '+ 关注' }}
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 文章列表卡片 -->
        <el-card class="article-list-card" shadow="never">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="Ta的发布" name="latest" />
          </el-tabs>

          <div class="article-list">
            <el-empty v-if="articleList.length === 0" description="Ta还没有发布过创作" />

            <div v-else class="article-items">
              <div
                v-for="item in articleList"
                :key="item.id"
                class="article-item"
                @click="$router.push('/artwork/' + item.id)"
              >
                <div class="article-content">
                  <h3 class="article-title">{{ item.title }}</h3>
                  <div class="article-meta">
                    <span class="category-link" @click.stop="$router.push({ path: '/home', query: { categoryId: item.categoryId } })">
                      {{ item.categoryName || '未分类' }}
                    </span>
                    <span class="meta-separator">·</span>
                    <span class="time">{{ item.createTime ? item.createTime.split('T')[0] : '刚刚' }}</span>
                  </div>
                  <p class="article-summary">{{ item.description }}</p>
                  <div class="article-tags" v-if="item.tags && item.tags.length" style="margin-bottom: 12px; display: flex; gap: 8px;">
                    <el-tag
                      v-for="tag in item.tags"
                      :key="tag.id"
                      class="modern-tag-small"
                      :style="{ '--hover-color': tag.color || '#409eff' }"
                      disable-transitions
                      size="small"
                    >
                      {{ tag.name }}
                    </el-tag>
                  </div>
                  <div class="article-footer">
                    <span class="footer-item">
                      <el-icon><View /></el-icon>
                      {{ item.viewCount || 0 }}
                    </span>
                    <span class="footer-item">
                      <el-icon><Document /></el-icon>
                      {{ item.wordCount || 0 }} 字
                    </span>
                    <span class="footer-item">
                      <el-icon><ChatDotRound /></el-icon>
                      {{ item.commentCount || 0 }}
                    </span>
                    <span class="footer-item">
                      <el-icon><Pointer /></el-icon>
                      {{ item.likeCount || 0 }}
                    </span>
                  </div>
                </div>
                <div v-if="item.coverUrl" class="article-cover">
                  <img :src="item.coverUrl" :alt="item.title" />
                </div>
              </div>
            </div>

            <div v-if="articleList.length > 0" class="pagination-wrapper">
              <el-pagination
                background
                layout="prev, pager, next, total"
                :current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧侧边栏 -->
      <el-col :span="8">
        <!-- 创作成就卡片 -->
        <el-card class="sidebar-card stats-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Trophy /></el-icon>
              <span>创作成就</span>
            </div>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ publicUserStats.articleCount || 0 }}</div>
              <div class="stat-label">创作数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ publicUserStats.totalViews || 0 }}</div>
              <div class="stat-label">总阅读</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ publicUserStats.totalLikes || 0 }}</div>
              <div class="stat-label">获赞数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ publicUserStats.fanCount || 0 }}</div>
              <div class="stat-label">粉丝数</div>
            </div>
          </div>
        </el-card>

        <!-- 热门标签云卡片 -->
        <el-card class="sidebar-card tags-cloud-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Collection /></el-icon>
              <span>热门标签</span>
            </div>
          </template>
          <div class="tag-cloud">
            <el-tag
              v-for="tag in tagList"
              :key="tag.id"
              class="modern-tag"
              :style="{ '--hover-color': tag.color || '#409eff' }"
              disable-transitions
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Document, ChatDotRound, Pointer, Trophy, Collection } from '@element-plus/icons-vue'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()

// 当前登录用户 ID
const currentUserId = ref(null)

// 目标用户 ID（当前访问的主页作者）
const targetUserId = ref(null)

// 是否已关注该用户
const isFollowing = ref(false)

// 判断是否访问的是自己的主页
const isMyOwnSpace = computed(() => {
  if (!currentUserId.value || !targetUserId.value) return false
  return String(currentUserId.value) === String(targetUserId.value)
})
const userInfo = ref({})
const publicUserStats = ref({
  articleCount: 0,
  totalViews: 0,
  totalLikes: 0,
  fanCount: 0
})
const articleList = ref([])
const tagList = ref([])
const activeTab = ref('latest')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

/**
 * 拉取目标用户信息
 */
const fetchUserInfo = async (id) => {
  try {
    const res = await request.get(`/user/${id}`)
    if (res.code === 200) {
      userInfo.value = res.data || {}
    } else {
      userInfo.value = res.data || res || {}
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

/**
 * 拉取目标用户数据面板
 */
const fetchUserStats = async (id) => {
  try {
    const res = await request.get(`/user/public/stats/${id}`)
    if (res.code === 200 && res.data) {
      publicUserStats.value = res.data
    }
  } catch (error) {
    console.error('获取用户统计数据失败:', error)
  }
}

/**
 * 拉取该用户的文章列表 (带上 userId 参数)
 */
const fetchArticles = async (id) => {
  try {
    const res = await request.get('/artwork/feed', {
      params: { current: currentPage.value, size: pageSize.value, userId: id }
    })
    if (res.code === 200 && res.data) {
      articleList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      articleList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取用户文章列表失败:', error)
  }
}

/**
 * 获取标签列表
 */
const fetchTags = async () => {
  try {
    const res = await request.get('/tag/list')
    if (res.code === 200 && res.data) {
      tagList.value = res.data || []
    } else if (Array.isArray(res)) {
      tagList.value = res
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

/**
 * 检查关注状态
 */
const checkFollowStatus = async (id) => {
  if (!localStorage.getItem('token') || isMyOwnSpace.value) return
  try {
    const res = await request.get('/follow/check', { params: { followeeId: id } })
    if (res.code === 200) {
      isFollowing.value = res.data
    }
  } catch (error) {
    console.error('获取关注状态失败:', error)
  }
}

const loadAllData = (id) => {
  if (!id) return
  fetchUserInfo(id)
  fetchUserStats(id)
  fetchArticles(id)
  checkFollowStatus(id)
}

const handleTabChange = () => {
  currentPage.value = 1
  loadAllData(targetUserId.value)
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchArticles(targetUserId.value)
}

/**
 * 编辑个人资料（仅自己主页显示）
 */
const handleEditProfile = () => {
  console.log('点击了编辑资料')
}

/**
 * 关注/取消关注切换（仅他人主页显示）
 */
const handleToggleFollow = async () => {
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const res = await request.post('/follow/toggle', { followeeId: targetUserId.value })
    if (res.code === 200) {
      // 前端局部翻转状态，并根据状态增加或减少粉丝数
      isFollowing.value = !isFollowing.value
      if (isFollowing.value) {
        publicUserStats.value.fanCount += 1
        ElMessage.success('关注成功')
      } else {
        publicUserStats.value.fanCount -= 1
        ElMessage.success('已取消关注')
      }
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

onMounted(() => {
  // 获取当前登录用户 ID
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      currentUserId.value = user.id
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  targetUserId.value = route.params.id
  loadAllData(targetUserId.value)
  fetchTags()
})

// 监听路由变化，解决从 User A 主页跳转到 User B 主页时不刷新的问题
watch(() => route.params.id, (newId) => {
  if (newId) {
    targetUserId.value = newId
    currentPage.value = 1
    loadAllData(newId)
  }
})
</script>

<style scoped>
.user-space-container {
  padding: 0;
}

/* 用户信息卡片样式 */
.profile-header-card {
  border-radius: 12px;
  border: none;
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  gap: 20px;
  align-items: center;
}

.profile-info {
  flex: 1;
}

.profile-name {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #1a1a1a;
}

.profile-bio {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.profile-actions {
  flex-shrink: 0;
}

/* 文章列表卡片样式 */
.article-list-card {
  border-radius: 12px;
  border: none;
}

.article-list {
  min-height: 200px;
}

.pagination-wrapper {
  padding: 24px 0;
  display: flex;
  justify-content: center;
}

/* 文章卡片样式 */
.article-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.article-item:hover {
  background-color: #fafafa;
}

.article-item:last-child {
  border-bottom: none;
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
}

.article-title:hover {
  color: #409eff;
}

.article-meta {
  font-size: 13px;
  color: #8a919f;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-separator {
  color: #d3d6d8;
}

.category-link {
  cursor: pointer;
  transition: color 0.3s;
}

.category-link:hover {
  color: #409eff;
  text-decoration: underline;
}

.category:hover {
  color: #409eff;
  cursor: pointer;
}

.article-summary {
  font-size: 14px;
  color: #505558;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.modern-tag-small {
  background-color: #f4f5f5 !important;
  color: #515767 !important;
  border: none !important;
  border-radius: 4px !important;
  font-size: 12px;
  transition: all 0.3s;
}

.modern-tag-small:hover {
  color: var(--hover-color) !important;
  background-color: #e8eaec !important;
}

.article-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #8a919f;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-cover {
  flex-shrink: 0;
  margin-left: 16px;
}

.article-cover img {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

/* 侧边栏卡片样式 */
.sidebar-card {
  border-radius: 12px;
  border: none;
  margin-bottom: 16px;
}

.sidebar-card :deep(.el-card__header) {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.sidebar-card :deep(.el-card__body) {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.card-header .el-icon {
  font-size: 16px;
  color: #409eff;
}

/* 数据统计卡片 */
.stats-card :deep(.el-card__body) {
  padding: 20px 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8a919f;
}

/* 热门标签云卡片 */
.tags-cloud-card :deep(.el-card__body) {
  padding: 16px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.modern-tag {
  background-color: #f4f5f5 !important;
  color: #515767 !important;
  border: none !important;
  padding: 0 14px;
  height: 30px;
  line-height: 30px;
  border-radius: 6px !important;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.modern-tag:hover {
  color: var(--hover-color) !important;
  background-color: #e8eaec !important;
  transform: translateY(-1px);
}
</style>
