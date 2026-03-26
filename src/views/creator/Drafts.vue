<template>
  <div class="drafts-container">
    <h2 class="page-title">草稿箱</h2>
    
    <div v-loading="loading" class="draft-list">
      <el-empty v-if="draftList.length === 0 && !loading" description="暂无草稿" />
      
      <el-card 
        v-for="draft in draftList" 
        :key="draft.id" 
        class="draft-card"
        shadow="hover"
      >
        <div class="draft-content">
          <div class="draft-info">
            <h3 class="draft-title">{{ draft.title || '无标题' }}</h3>
            <p class="draft-desc">{{ draft.description || '暂无描述' }}</p>
            <div class="draft-meta">
              <span class="draft-time">{{ formatTime(draft.updateTime || draft.createTime) }}</span>
            </div>
          </div>
          <div class="draft-actions">
            <el-button type="primary" size="small" @click="handleEdit(draft.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(draft.id)">删除</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const router = useRouter()
const draftList = ref([])
const loading = ref(false)

const fetchDrafts = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return
  const user = JSON.parse(userStr)
  
  loading.value = true
  try {
    const res = await request.get(`/draft/list/${user.id}`)
    if (res.code === 200) {
      draftList.value = res.data || []
    }
  } catch (error) {
    console.error('获取草稿失败', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除这篇草稿吗？删除后无法恢复！', '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await request.delete(`/draft/${id}`)
      if (res.code === 200) {
        ElMessage.success('草稿已删除')
        fetchDrafts()
      }
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

const handleEdit = (id) => {
  router.push(`/publish?draftId=${id}`)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchDrafts()
})
</script>

<style scoped>
.drafts-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}
.page-title {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 20px;
  color: #303133;
}
.draft-list {
  min-height: 200px;
}
.draft-card {
  margin-bottom: 16px;
  border-radius: 8px;
}
.draft-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.draft-info {
  flex: 1;
  min-width: 0;
}
.draft-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.draft-desc {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.draft-meta {
  font-size: 12px;
  color: #c0c4cc;
}
.draft-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}
</style>
