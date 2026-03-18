<template>
  <div class="artwork-container">
    <el-form :model="queryParams" class="search-form" inline>
      <el-form-item label="作品标题">
        <el-input v-model="queryParams.title" placeholder="请输入作品标题" clearable />
      </el-form-item>
      <el-form-item label="所属分类">
        <el-select v-model="queryParams.categoryId" placeholder="请选择分类" style="width: 160px" clearable>
          <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" style="width: 160px"  clearable>
          <el-option label="待审核" :value="0" />
          <el-option label="已发布" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="title" label="作品标题" min-width="150" />
      <el-table-column prop="authorName" label="作者" width="120" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'warning'">
            {{ scope.row.status === 1 ? '已发布' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="showDetail(scope.row)">
            详情
          </el-button>
          <el-button v-if="scope.row.status === 0" link type="success" size="small" @click="handleAudit(scope.row, 1)">
            通过
          </el-button>
          <el-button v-if="scope.row.status === 1" link type="danger" size="small" @click="handleAudit(scope.row, 0)">
            下架
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="queryParams.current"
      v-model:page-size="queryParams.size"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="loadData"
      @current-change="loadData"
    />

    <el-dialog v-model="detailVisible" title="作品详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="作品标题">{{ currentDetail.title }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentDetail.authorName }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ currentDetail.categoryName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentDetail.status === 1 ? 'success' : 'warning'">
            {{ currentDetail.status === 1 ? '已发布' : '待审核' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="浏览量">{{ currentDetail.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="字数">{{ currentDetail.wordCount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ currentDetail.description || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const tableData = ref([])
const loading = ref(false)
const categoryList = ref([])
const detailVisible = ref(false)
const currentDetail = ref({})

const queryParams = ref({
  current: 1,
  size: 10,
  title: '',
  categoryId: null,
  status: null
})

const total = ref(0)

const loadCategories = async () => {
  try {
    const res = await request.get('/category/list')
    categoryList.value = res.data || res || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/artwork/admin/page', {
      params: queryParams.value
    })
    if (res.code === 200 || res.success === true) {
      tableData.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取作品列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.value = {
    current: 1,
    size: 10,
    title: '',
    categoryId: null,
    status: null
  }
  loadData()
}

const showDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
}

const handleAudit = (row, targetStatus) => {
  const action = targetStatus === 1 ? '通过' : '下架'
  const message = targetStatus === 1
    ? `确定要通过作品《${row.title}》的审核吗？`
    : `确定要强制下架作品《${row.title}》吗？`

  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // ✅ 修复点：第二个参数传 null（清空Body），第三个参数用 params 把数据拼接到 URL 上
      // ✅ 修复点：参数名严格改为 targetStatus，与后端保持 100% 一致
      const res = await request.put('/artwork/admin/audit', null, {
        params: {
          id: row.id,
          targetStatus: targetStatus
        }
      })
      
      if (res.code === 200 || res.success === true) {
        ElMessage.success(`${action}成功`)
        loadData() // 重新加载表格，状态标签会瞬间变色！
      } else {
        ElMessage.error(res.message || `${action}失败`)
      }
    } catch (error) {
      console.error(`${action}失败:`, error)
      ElMessage.error(error.response?.data?.message || `${action}失败`)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<style scoped>
.artwork-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
