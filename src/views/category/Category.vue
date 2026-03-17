<template>
  <div class="category-container">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        新增分类
      </el-button>
    </div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const tableData = ref([])

const fetchList = async () => {
  try {
    const res = await request.get('/category/list')
    tableData.value = res.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const handleAdd = () => {
  console.log('新增分类')
}

const handleEdit = (row) => {
  console.log('编辑分类', row)
}

const handleDelete = (row) => {
  console.log('删除分类', row)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.category-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>
