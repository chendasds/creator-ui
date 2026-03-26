<template>
  <div class="dashboard-container">
    <h2 class="page-title">数据看板</h2>
    
    <el-row :gutter="20" class="data-overview" v-loading="loading">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-label">总阅读量</div>
          <div class="data-value highlight">{{ stats.totalViews || 0 }}</div>
          <div class="data-compare">较昨日 <span class="up">+12%</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-label">获得点赞</div>
          <div class="data-value">{{ stats.totalLikes || 0 }}</div>
          <div class="data-compare">较昨日 <span class="up">+5%</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-label">新增粉丝</div>
          <div class="data-value">{{ stats.totalFollowers || 0 }}</div>
          <div class="data-compare">较昨日 <span class="down">-2%</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="data-label">作品总数</div>
          <div class="data-value">{{ stats.artworkCount || 0 }}</div>
          <div class="data-compare">较昨日 <span class="up">+1</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="recent-interaction">
      <template #header>
        <div class="card-header">
          <span>近期互动分析</span>
        </div>
      </template>
      <div ref="chartRef" style="height: 350px; width: 100%;"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const stats = ref({
  totalViews: 0,
  totalLikes: 0,
  totalFollowers: 0,
  artworkCount: 0
})
const loading = ref(false)

const chartRef = ref(null)
let chartInstance = null

const fetchStats = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return
  const user = JSON.parse(userStr)
  
  loading.value = true
  try {
    const res = await request.get(`/artwork/dashboard/stats/${user.id}`)
    if (res.code === 200 && res.data) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const initChart = (data) => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)
  
  const dates = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    dates.push(`${d.getFullYear()}-${month}-${day}`)
  }

  const likeData = dates.map(date => data.find(d => d.date === date)?.likeCount || 0)
  const collectData = dates.map(date => data.find(d => d.date === date)?.collectCount || 0)
  const fanData = dates.map(date => data.find(d => d.date === date)?.fanCount || 0)
  const artworkData = dates.map(date => data.find(d => d.date === date)?.artworkCount || 0)

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['获赞数', '收藏数', '新增粉丝', '新增作品'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      data: dates,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '获赞数', type: 'line', smooth: true,
        itemStyle: { color: '#409eff' }, areaStyle: { color: 'rgba(64, 158, 255, 0.1)' },
        data: likeData
      },
      {
        name: '收藏数', type: 'line', smooth: true,
        itemStyle: { color: '#f56c6c' }, areaStyle: { color: 'rgba(245, 108, 108, 0.1)' },
        data: collectData
      },
      {
        name: '新增粉丝', type: 'line', smooth: true,
        itemStyle: { color: '#67c23a' }, areaStyle: { color: 'rgba(103, 194, 58, 0.1)' },
        data: fanData
      },
      {
        name: '新增作品', type: 'line', smooth: true,
        itemStyle: { color: '#e6a23c' }, areaStyle: { color: 'rgba(230, 162, 60, 0.1)' },
        data: artworkData
      }
    ]
  }
  chartInstance.setOption(option)
}

const fetchTrend = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return
  const user = JSON.parse(userStr)
  try {
    const res = await request.get(`/artwork/dashboard/trend/${user.id}`)
    if (res.code === 200) {
      initChart(res.data || [])
    }
  } catch (error) {
    console.error('获取图表数据失败', error)
  }
}

const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  fetchStats()
  fetchTrend()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
}
.page-title {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 20px;
  color: #303133;
}
.data-overview {
  margin-bottom: 24px;
}
.data-card {
  text-align: center;
  border-radius: 8px;
}
.data-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}
.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}
.data-value.highlight {
  color: #409eff;
}
.data-compare {
  font-size: 12px;
  color: #909399;
}
.data-compare .up {
  color: #f56c6c;
}
.data-compare .down {
  color: #67c23a;
}
.recent-interaction {
  border-radius: 8px;
}
.card-header {
  font-weight: 600;
  font-size: 16px;
}
</style>
