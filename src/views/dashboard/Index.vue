<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">用户总数</div>
              <div class="stat-value">{{ stats.totalUsers }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">作品总数</div>
              <div class="stat-value">{{ stats.totalArtworks }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日新增</div>
              <div class="stat-value">{{ stats.todayNew }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">待审核</div>
              <div class="stat-value">{{ stats.pendingAudit }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分类占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>七日发文趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { User, Document, TrendCharts, Clock } from '@element-plus/icons-vue'
import request from '@/api/request'

const pieChartRef = ref(null)
const lineChartRef = ref(null)
let pieChart = null
let lineChart = null

const stats = ref({
  totalUsers: 0,
  totalArtworks: 0,
  todayNew: 0,
  pendingAudit: 0
})

const loadStats = async () => {
  try {
    const res = await request.get('/admin/dashboard')
    if (res.code === 200 || res.success === true) {
      const data = res.data || res
      stats.value = {
        totalUsers: data.totalUsers || 0,
        totalArtworks: data.totalArtworks || 0,
        todayNew: data.todayNew || 0,
        pendingAudit: data.pendingAudit || 0
      }

      if (data.categoryRatio) {
        initPieChart(data.categoryRatio)
      }

      if (data.trendData) {
        initLineChart(data.trendData.dates || [], data.trendData.counts || [])
      }
    } else {
      ElMessage.error(res.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const initPieChart = (data) => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  const pieData = data.map(item => ({
    name: item.name,
    value: item.value
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
    series: [
      {
        name: '分类占比',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }
  pieChart.setOption(option)
}

const initLineChart = (dates, counts) => {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#606266'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f2f5'
        }
      }
    },
    series: [
      {
        name: '发文数量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#5470c6' },
            { offset: 1, color: '#91cc75' }
          ])
        },
        itemStyle: {
          color: '#5470c6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
          ])
        },
        data: counts
      }
    ]
  }
  lineChart.setOption(option)
}

const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  loadStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  border-radius: 12px;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.chart-card {
  border-radius: 12px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 350px;
}
</style>
