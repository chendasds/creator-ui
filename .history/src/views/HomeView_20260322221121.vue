<template>
  <div class="home-container">
    <el-row :gutter="20">
      <!-- 左侧信息流列表 -->
      <el-col :span="16">
        <el-card class="feed-card" shadow="never">
          <!-- 分类筛选提示 -->
          <div v-if="activeCategoryId" style="margin-bottom: 20px; padding: 15px; background-color: #f0f9eb; color: #67c23a; border-radius: 8px;">
            当前正在浏览特定分类频道。 <el-button type="text" @click="clearCategory">查看全部</el-button>
          </div>

          <el-tabs v-model="activeTab" class="feed-tabs">
            <el-tab-pane label="推荐" name="recommend" />
            <el-tab-pane label="最新发布" name="latest" />
          </el-tabs>

          <div class="article-list">
            <el-empty v-if="articleList.length === 0" description="暂无作品" />
           
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
                    <span class="author">{{ item.authorName || '匿名用户' }}</span>
                    <span class="meta-separator">·</span>
                    <span class="category">{{ item.categoryName || '未分类' }}</span>
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
                      @click.stop="handleTagClick(tag.id)"
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
        <!-- 个人数据统计卡片 -->
        <el-card class="sidebar-card stats-card" shadow="never">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.articleCount }}</div>
              <div class="stat-label">创作数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalViews }}</div>
              <div class="stat-label">总浏览</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.totalLikes }}</div>
              <div class="stat-label">获赞数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.fanCount }}</div>
              <div class="stat-label">粉丝数</div>
            </div>
          </div>
          <el-button type="primary" class="creator-btn" @click="$router.push('/creator')">
            <el-icon><Edit /></el-icon>
            进入chuang'z创作
          </el-button>
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
              :class="{ 'is-active': activeTagId === tag.id }"
              :style="{ '--hover-color': tag.color || '#409eff' }"
              disable-transitions
              @click="handleTagClick(tag.id)"
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </el-card>

        <!-- 热门分类（保留原有） -->
        <el-card class="sidebar-card sidebar-tags" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Grid /></el-icon>
              <span>平台热门分类</span>
            </div>
          </template>
          <div class="tags-wrapper">
            <el-tag
              v-for="tag in hotCategories"
              :key="tag"
              class="category-tag"
              effect="plain"
              round
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Document, ChatDotRound, Pointer, User, Edit, Collection, Grid } from '@element-plus/icons-vue'
import request from '@/api/request'

const route = useRoute()

const activeTab = ref('recommend')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 文章列表数据（真实 API）
const articleList = ref([])

// 标签列表（真实 API）
const tagList = ref([])

// 当前选中的标签 ID
const activeTagId = ref(null)

// 当前选中的分类 ID
const activeCategoryId = ref(null)

const hotCategories = ref([
  '前端开发', '后端技术', '人工智能', '产品设计', 
  '创业故事', '职场成长', '读书笔记', '生活感悟'
])

// 个人数据统计（后端真实数据）
const userStats = ref({
  articleCount: 0,
  totalViews: 0,
  totalLikes: 0,
  fanCount: 0
})

const fetchUserStats = async () => {
  if (!localStorage.getItem('token')) return
  try {
    const res = await request.get('/user/stats')
    if (res.code === 200 && res.data) {
      userStats.value = res.data
    }
  } catch (error) {
    console.log('获取用户统计数据失败，可能未登录')
  }
}

/**
 * 获取文章列表
 */
const fetchArticles = async () => {
  try {
    const res = await request.get('/artwork/feed', {
      params: { current: currentPage.value, size: pageSize.value, tagId: activeTagId.value, categoryId: activeCategoryId.value }
    })
    console.log('首页文章获取结果:', res)
    if (res.code === 200 && res.data) {
      articleList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      articleList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取文章流失败:', error)
  }
}

/**
 * 监听 Tab 切换，重新获取数据
 */
watch(activeTab, () => {
  currentPage.value = 1
  fetchArticles()
})

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchArticles()
}

const handleWrite = () => {
  ElMessage.info('写文章功能开发中')
}

const handleTagClick = (id) => {
  activeTagId.value = activeTagId.value === id ? null : id
  currentPage.value = 1
  fetchArticles()
}

const clearCategory = () => {
  activeCategoryId.value = null
  currentPage.value = 1
  fetchArticles()
}

/**
 * 兼容标签数据结构（可能有 color 字段，也可能只是字符串）
 */
const getTagStyle = (tag) => {
  const name = tag.name || tag
  const color = tag.color || '#909399'
  return {
    backgroundColor: color + '15',
    borderColor: color,
    color: color
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

// 监听路由参数的变化（解决同组件跳转不刷新的问题）
watch(() => route.query, (newQuery) => {
  activeCategoryId.value = newQuery.categoryId ? Number(newQuery.categoryId) : null
  activeTagId.value = newQuery.tagId ? Number(newQuery.tagId) : null
  fetchArticles()
})

onMounted(() => {
  // 拦截路由中的 categoryId 参数
  if (route.query.categoryId) {
    activeCategoryId.value = Number(route.query.categoryId)
  }
  // 拦截路由中的 tagId 参数
  if (route.query.tagId) {
    activeTagId.value = Number(route.query.tagId)
  }
  fetchArticles()
  fetchTags()
  fetchUserStats()
})

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
</script>

<style scoped>
.home-container {
  padding: 0;
}

.feed-card {
  border-radius: 12px;
  border: none;
}

.feed-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.feed-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.feed-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
}

.feed-tabs :deep(.el-tabs__active-bar) {
  background-color: #409eff;
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

.author:hover,
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

/* 文章标签样式 */
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
  cursor: pointer;
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

/* 侧边栏卡片 */
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

/* 个人数据统计卡片 */
.stats-card :deep(.el-card__body) {
  padding: 20px 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.creator-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  border-radius: 20px;
  margin-top: 16px;
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

.modern-tag.is-active {
  color: #ffffff !important;
  background-color: var(--hover-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 热门分类卡片 */
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.category-tag:hover {
  transform: translateY(-1px);
}
</style>
