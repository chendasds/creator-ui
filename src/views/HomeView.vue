<template>
  <div class="home">
    <el-button type="success" @click="handleClick">绿色测试按钮</el-button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import request from '@/api/request'

const handleClick = () => {
  console.log('按钮点击')
}

onMounted(async () => {
  try {
    const res = await request.get('/category/list')
    console.log('请求结果:', res)
  } catch (error) {
    console.error('请求失败:', error)
  }
})
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>
