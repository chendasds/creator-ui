<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>

      <el-form :model="form" label-width="80px" class="profile-form">
        <!-- 头像区 -->
        <el-form-item label="头像">
          <div class="avatar-section">
            <el-avatar :size="80" :src="avatarUrl">
              {{ form.nickname?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <el-upload
              class="avatar-upload"
              action="/api/file/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button size="small" type="primary">更换头像</el-button>
            </el-upload>
          </div>
        </el-form-item>

        <!-- 昵称区 -->
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
        </el-form-item>

        <!-- 邮箱区 -->
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <!-- 操作区 -->
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="loading">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const form = ref({
  nickname: '',
  email: '',
  avatarUrl: ''
})

const avatarUrl = ref('')
const loading = ref(false)

const token = localStorage.getItem('token')
const uploadHeaders = {
  Authorization: token ? `Bearer ${token}` : ''
}

/**
 * 获取个人资料
 */
const fetchUserProfile = async () => {
  try {
    const res = await request.get('/user/profile')
    if (res.code === 200 && res.data) {
      form.value.nickname = res.data.nickname || ''
      form.value.email = res.data.email || ''
      form.value.avatarUrl = res.data.avatarUrl || ''
      avatarUrl.value = res.data.avatarUrl || ''
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

/**
 * 头像上传成功
 */
const handleAvatarSuccess = (res) => {
  if (res.code === 200) {
    avatarUrl.value = res.data
    form.value.avatarUrl = res.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(res.message || '头像上传失败')
  }
}

/**
 * 头像上传前校验
 */
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

/**
 * 保存修改
 */
const handleSave = async () => {
  if (!form.value.nickname?.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }

  loading.value = true
  try {
    const res = await request.put('/user/profile', {
      nickname: form.value.nickname,
      email: form.value.email,
      avatarUrl: form.value.avatarUrl
    })
    if (res.code === 200) {
      ElMessage.success('个人资料更新成功！')
      // 同步更新本地缓存中的 user 信息
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userObj = JSON.parse(userStr)
        userObj.nickname = form.value.nickname
        userObj.avatarUrl = form.value.avatarUrl
        localStorage.setItem('user', JSON.stringify(userObj))
      }
      // 延迟刷新页面，让用户看到成功提示
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败', error)
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<script>
import request from '@/api/request'
export default {
  name: 'UserProfile'
}
</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 108px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
}

.profile-card {
  width: 100%;
  max-width: 500px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.profile-form {
  padding: 20px 10px 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-upload {
  display: inline-block;
}
</style>
