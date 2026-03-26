<template>
  <div class="announcement-container">
    <el-card header="全站公告推送">
      <el-alert
        title="注意：点击发送后，全站所有注册用户都将在消息中心收到此条通知，请谨慎操作。"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 20px"
      />
      
      <el-form :model="form" label-position="top">
        <el-form-item label="公告内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容，例如：系统将于今晚 24:00 进行维护..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            立即发布广播
          </el-button>
          <el-button @click="form.content = ''">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

const form = ref({ content: '' })
const loading = ref(false)

const handleSubmit = () => {
  if (!form.value.content.trim()) return ElMessage.warning('内容写点啥吧？')

  ElMessageBox.confirm('确定要向全站用户推送这条消息吗？', '操作确认', {
    confirmButtonText: '确定推送',
    cancelButtonText: '点错了',
    type: 'warning'
  }).then(async () => {
    loading.value = true
    try {
      const res = await request.post('/notification/broadcast', { content: form.value.content })
      if (res.code === 200) {
        ElMessage.success('广播成功！所有人都将收到您的消息')
        form.value.content = ''
      }
    } finally {
      loading.value = false
    }
  })
}
</script>
