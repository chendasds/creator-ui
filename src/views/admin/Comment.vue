<template>
  <div class="admin-comment-container">
    <el-card shadow="never" class="toolbar-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="评论内容">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="搜索违规词或水贴内容..." 
            clearable 
            @clear="handleQuery" 
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">过滤违规内容</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="authorName" label="发布者" width="150" show-overflow-tooltip />
        <el-table-column prop="artworkTitle" label="所属作品" width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="评论正文" min-width="300">
          <template #default="scope">
            <span class="comment-text">{{ scope.row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="170" align="center" />
        
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="danger" @click="handleDelete(scope.row)">强制删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = ref({ current: 1, size: 10, keyword: '' })

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/comment/admin/page', { params: queryParams.value })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleQuery = () => { queryParams.value.current = 1; loadData() }
const resetQuery = () => { queryParams.value = { current: 1, size: 10, keyword: '' }; loadData() }

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要强制删除这条评论吗？`, '风控操作确认', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const res = await request.delete(`/comment/admin/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('违规评论已肃清')
      loadData()
    }
  }).catch(() => {})
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-comment-container { padding: 0; }
.toolbar-card { border-bottom: none; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.comment-text {
  color: #303133;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
