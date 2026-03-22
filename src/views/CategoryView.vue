<template>
  <div class="category-square">
    <h2 style="margin-bottom: 24px; color: #303133;">分类广场</h2>
    <div class="category-grid">
      <el-card
        v-for="item in categoryList"
        :key="item.id"
        class="category-card"
        shadow="hover"
        @click="goToHomeWithCategory(item.id)"
      >
        <div class="card-content">
          <h3 class="category-name">{{ item.name }}</h3>
          <p class="category-desc">{{ item.description || '暂无简介' }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/request'

const router = useRouter()
const categoryList = ref([])

const fetchCategories = async () => {
  try {
    const res = await request.get('/category/list')
    categoryList.value = res.data || []
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

const goToHomeWithCategory = (id) => {
  router.push({ path: '/', query: { categoryId: id } })
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-square {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.category-card {
  cursor: pointer;
  border-radius: 12px;
  border: none;
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.card-content {
  padding: 4px 0;
}

.category-name {
  font-size: 18px;
  color: #303133;
  margin: 0 0 10px 0;
}

.category-desc {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
  margin: 0;
}
</style>
