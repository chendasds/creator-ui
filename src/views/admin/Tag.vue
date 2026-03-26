<template>
  <div class="tag-container">
    <el-card shadow="never" class="toolbar-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="标签名称">
          <el-input v-model="queryParams.name" placeholder="请输入标签名称" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="success" @click="handleAdd">新增标签</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="标签名称" align="center">
          <template #default="scope">
            <el-tag :color="scope.row.color || '#409EFF'" style="color: white; border: none;">
              {{ scope.row.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="color" label="颜色代码" width="150" align="center">
          <template #default="scope">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span class="color-dot" :style="{ backgroundColor: scope.row.color || '#409EFF' }"></span>
              {{ scope.row.color || '#409EFF' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center" />
        
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      width="400px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：Java并发" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="form.color" :predefine="predefineColors" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const predefineColors = ref([
  '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1',
  '#1e90ff', '#c71585', '#409EFF', '#67C23A', '#E6A23C'
])

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = ref({
  current: 1,
  size: 10,
  name: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  color: '#409EFF'
})

const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/tag/page', { params: queryParams.value })
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取标签列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.value.current = 1
  loadData()
}
const resetQuery = () => {
  queryParams.value = { current: 1, size: 10, name: '' }
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '', color: '#409EFF' }
  dialogVisible.value = true
}
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { id: row.id, name: row.name, color: row.color || '#409EFF' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const isPut = isEdit.value
      const reqPath = '/tag'
      const res = isPut 
        ? await request.put(reqPath, form.value)
        : await request.post(reqPath, form.value)

      if (res.code === 200) {
        ElMessage.success(isPut ? '编辑成功' : '新增成功')
        dialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await request.delete(`/tag/${row.id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  }).catch(() => {})
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.tag-container { padding: 0; }
.toolbar-card { border-bottom: none; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #e4e7ed;
}
</style>
