<template>
  <div class="admin-user-container">
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="用户名/昵称" clearable @clear="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px" @change="handleQuery">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never" style="margin-top: 20px">
      <el-table v-loading="loading" :data="userList" border stripe>
        <el-table-column label="头像" width="80" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatarUrl">{{ scope.row.username?.charAt(0) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        
        <el-table-column label="后台权限" width="150" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.role"
              :active-value="2"
              :inactive-value="1"
              active-text="管理"
              inactive-text="普通"
              @change="handleUpdateUser(scope.row, '权限')"
            />
          </template>
        </el-table-column>

        <el-table-column label="账号状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑资料</el-button>
            <el-button link :type="scope.row.status === 1 ? 'danger' : 'success'" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 1 ? '禁用账号' : '启用账号' }}
            </el-button>
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

  <!-- 编辑用户对话框 -->
  <el-dialog v-model="editDialogVisible" title="编辑用户资料" width="500px" destroy-on-close>
    <el-form :model="editForm" label-width="80px">
      <el-form-item label="昵称">
        <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="editForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="editForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="editForm.gender">
          <el-radio :label="0">保密</el-radio>
          <el-radio :label="1">男</el-radio>
          <el-radio :label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="个人简介">
        <el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介" maxlength="200" show-word-limit />
      </el-form-item>
      <el-form-item label="角色">
        <el-radio-group v-model="editForm.role">
          <el-radio :label="1">普通用户</el-radio>
          <el-radio :label="2">管理员</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="editForm.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitEdit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const editDialogVisible = ref(false)
const submitting = ref(false)
const editForm = ref({
  id: null,
  nickname: '',
  email: '',
  phone: '',
  gender: 0,
  bio: '',
  role: 1,
  status: 1
})
const queryParams = ref({
  current: 1,
  size: 10,
  keyword: '',
  status: null
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get('/user/admin/page', { params: queryParams.value })
    if (res.code === 200) {
      userList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载数据失败')
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('数据加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleUpdateUser = async (row, type) => {
  try {
    const res = await request.put('/user/admin/update', {
      id: row.id,
      role: row.role,
      status: row.status
    })
    if (res.code === 200) {
      ElMessage.success(`${type}更新成功`)
    } else {
      loadData()
    }
  } catch (error) {
    loadData()
  }
}

const toggleStatus = (row) => {
  const targetStatus = row.status === 1 ? 0 : 1
  const actionText = targetStatus === 1 ? '启用' : '禁用'
  
  ElMessageBox.confirm(`确定要${actionText}用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: targetStatus === 1 ? 'info' : 'warning'
  }).then(() => {
    row.status = targetStatus
    handleUpdateUser(row, '账号状态')
  }).catch(() => {})
}

const handleQuery = () => {
  queryParams.value.current = 1
  loadData()
}

const resetQuery = () => {
  queryParams.value = { current: 1, size: 10, keyword: '', status: null }
  loadData()
}

const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    nickname: row.nickname || '',
    email: row.email || '',
    phone: row.phone || '',
    gender: row.gender ?? 0,
    bio: row.bio || '',
    role: row.role ?? 1,
    status: row.status ?? 1
  }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  submitting.value = true
  try {
    const res = await request.put('/user/admin/update', editForm.value)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-user-container { padding: 0; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
