<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="welcome-section">
        <div class="welcome-avatar">
          <el-avatar :size="56" :src="avatarUrl" />
          <div class="welcome-status">
            <el-badge :value="unreadAlertCount" :hidden="unreadAlertCount === 0" type="danger">
              <span class="online-dot"></span>
            </el-badge>
          </div>
        </div>
        <div class="welcome-text">
          <h2>
            <span class="greeting">{{ greeting }}</span>
            <span class="user-name">{{ userName }}</span>
          </h2>
          <p>
            📅 {{ currentDate }}
          </p>
        </div>
      </div>
      <div class="alert-section" @click="showAlerts">
        <div class="alert-icon-wrapper">
          <span style="font-size: 28px;">🔔</span>
          <span v-if="unreadAlertCount > 0" class="alert-badge">{{ unreadAlertCount }}</span>
        </div>
        <div class="alert-info">
          <span class="alert-title">未读预警</span>
          <span class="alert-desc">{{ unreadAlertCount > 0 ? `${unreadAlertCount}条新消息` : '暂无预警' }}</span>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card" :class="`stat-card-${stat.color}`">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper" :style="{ background: stat.gradient }">
              <span class="stat-emoji">{{ stat.iconEmoji }}</span>
            </div>
            <div class="stat-content">
              <div class="stat-value">
                {{ stat.value }}{{ stat.unit }}
                <span class="stat-trend" :class="stat.trend === 'up' ? 'trend-up' : 'trend-down'">
                  <span v-if="stat.trend === 'up'">▲</span>
                  <span v-else>▼</span>
                  {{ Math.abs(stat.trendValue) }}%
                </span>
              </div>
              <div class="stat-label">
                <span>{{ stat.label }}</span>
                <el-tooltip :content="stat.tip" placement="top">
                  <span class="info-icon">❓</span>
                </el-tooltip>
              </div>
              <div class="stat-sub">{{ stat.subValue }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="12" class="charts-row">
      <el-col :span="16">
        <el-card class="chart-card line-chart-card">
          <template #header>
            <div class="chart-header">
              <div class="chart-title">
                <span class="title-icon">📈</span>
                <span style="font-size: 18px; font-weight: 1000;">溶解氧 & 水温 趋势（最近24小时）</span>
              </div>
              <div class="chart-controls">
                <el-radio-group v-model="chartTimeRange" size="default" @change="refreshLineChart">
                  <el-radio-button label="24h">24小时</el-radio-button>
                  <el-radio-button label="12h">12小时</el-radio-button>
                  <el-radio-button label="6h">6小时</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="line-chart-wrapper">
            <div ref="lineChart" class="line-chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card pie-chart-card">
          <template #header>
            <div class="chart-title">
              <span class="title-icon">📊</span>
              <span style="font-size: 18px; font-weight: 1000;">设备在线状态</span>
            </div>
          </template>
          <div class="pie-chart-wrapper">
            <div ref="pieChart" class="pie-chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="table-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="table-header">
              <div class="table-title">
                <span class="title-icon">💧</span>
                <span style="font-size: 18px; font-weight: 1000;">实时水质快报</span>
              </div>
              <div class="table-controls">
                <el-input v-model="searchKeyword" placeholder="搜索池塘名称" prefix-icon="Search" size="default" clearable
                  style="width: 220px" class="search-input" />
                <el-tag type="info" size="default" effect="plain">
                  ⏱️ 自动刷新: {{ refreshCountdown }}s
                </el-tag>
                <el-button size="default" @click="manualRefresh" :icon="RefreshRight" type="primary"
                  plain>手动刷新</el-button>
              </div>
            </div>
          </template>
          <el-table :data="filteredWaterList" stripe style="width: 100%" :size="'large'">
            <el-table-column prop="pondName" label="池塘名称" width="200">
              <template #default="{ row }">
                <div class="pond-cell">
                  <span style="font-size: 16px;">📍</span>
                  <span style="font-size: 15px;">{{ row.pondName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="do" label="溶解氧(mg/L)" sortable width="200">
              <template #default="{ row }">
                <div class="metric-cell" :class="getDoClass(row.do)">
                  <span style="font-size: 16px;">💧</span>
                  <span style="font-size: 15px; font-weight: 500;">{{ row.do }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="ph" label="pH值" sortable width="180">
              <template #default="{ row }">
                <div class="metric-cell">
                  <span style="font-size: 16px;">⚗️</span>
                  <span style="font-size: 15px;">{{ row.ph }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="temp" label="水温(℃)" sortable width="180">
              <template #default="{ row }">
                <div class="metric-cell">
                  <span style="font-size: 16px;">🌡️</span>
                  <span style="font-size: 15px;">{{ row.temp }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="nh3" label="氨氮(mg/L)" sortable width="200">
              <template #default="{ row }">
                <div class="metric-cell">
                  <span style="font-size: 16px;">⚠️</span>
                  <span style="font-size: 15px;">{{ row.nh3 }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="监测时间" width="220">
              <template #default="{ row }">
                <div class="time-cell">
                  <span style="font-size: 14px;">🕐</span>
                  <span style="font-size: 14px;">{{ row.time }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { RefreshRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const userName = ref('张场长')
const avatarUrl = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
const currentDate = ref('')
const greeting = ref('')
const unreadAlertCount = ref(5)

const setGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) greeting.value = '早上好，'
  else if (hour < 18) greeting.value = '下午好，'
  else greeting.value = '晚上好，'
}

const ponds = [
  { id: 1, name: '1号生态塘', area: 5.2, depth: 2.5 },
  { id: 2, name: '2号育苗池', area: 3.8, depth: 1.8 },
  { id: 3, name: '3号成鱼池', area: 6.1, depth: 3.0 },
  { id: 4, name: '4号循环水车间', area: 2.5, depth: 1.5 }
]

const devices = [
  { id: 1, status: '在线' },
  { id: 2, status: '在线' },
  { id: 3, status: '在线' },
  { id: 4, status: '离线' },
  { id: 5, status: '在线' },
  { id: 6, status: '在线' },
  { id: 7, status: '离线' },
  { id: 8, status: '在线' },
  { id: 9, status: '在线' },
  { id: 10, status: '在线' }
]

const stats = ref([
  {
    label: '平均水温',
    value: '24.6',
    unit: '°C',
    subValue: '适宜范围 22-28°C',
    iconEmoji: '🌡️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'purple',
    trend: 'up',
    trendValue: 2.3,
    tip: '较昨日上升2.3%'
  },
  {
    label: '平均溶解氧',
    value: '6.4',
    unit: 'mg/L',
    subValue: '标准值 ≥5.0 mg/L',
    iconEmoji: '💧',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: 'green',
    trend: 'down',
    trendValue: 0.8,
    tip: '较昨日下降0.8%'
  },
  {
    label: '在线设备',
    value: '0',
    unit: '台',
    subValue: '总设备 10 台',
    iconEmoji: '🖥️',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: 'orange',
    trend: 'up',
    trendValue: 5.2,
    tip: '在线率提升5.2%'
  },
  {
    label: '养殖池塘',
    value: '4',
    unit: '个',
    subValue: '总面积 17.6 亩',
    iconEmoji: '🐟',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    color: 'pink',
    trend: 'up',
    trendValue: 0,
    tip: '当前运营中'
  }
])

const waterList = ref([])
const searchKeyword = ref('')
const refreshCountdown = ref(30)
let refreshTimer = null
let countdownTimer = null

const filteredWaterList = computed(() => {
  if (!searchKeyword.value) return waterList.value
  return waterList.value.filter(item =>
    item.pondName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const getDoClass = (value) => {
  const doValue = parseFloat(value)
  if (doValue < 3) return 'do-danger'
  if (doValue < 5) return 'do-warning'
  return 'do-safe'
}

const lineChart = ref()
const pieChart = ref()
let lineChartInstance = null
let pieChartInstance = null
const chartTimeRange = ref('24h')

const generateHistoryData = (hours) => {
  const data = []
  const now = new Date()
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    const hourStr = `${time.getHours().toString().padStart(2, '0')}:00`
    data.push({
      time: hourStr,
      do: (5.2 + Math.random() * 1.8).toFixed(1),
      temp: (22.5 + Math.random() * 3.5).toFixed(1)
    })
  }
  return data
}

let chartData = generateHistoryData(24)

const refreshLineChart = () => {
  if (!lineChartInstance) return

  let hours = 24
  if (chartTimeRange.value === '12h') hours = 12
  if (chartTimeRange.value === '6h') hours = 6

  chartData = generateHistoryData(hours)

  lineChartInstance.setOption({
    xAxis: { data: chartData.map(d => d.time) },
    series: [
      {
        name: '溶解氧(mg/L)',
        data: chartData.map(d => d.do),
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: true
      },
      {
        name: '水温(℃)',
        data: chartData.map(d => d.temp),
        symbol: 'diamond',
        symbolSize: 8,
        showSymbol: true
      }
    ]
  })
}

const refreshWaterData = () => {
  waterList.value = ponds.map(p => ({
    pondName: p.name,
    do: (5 + Math.random() * 2.5).toFixed(1),
    ph: (7 + Math.random() * 1.5).toFixed(1),
    temp: (22 + Math.random() * 4).toFixed(1),
    nh3: (0.1 + Math.random() * 0.5).toFixed(2),
    time: new Date().toLocaleString()
  }))

  const avgTemp = (waterList.value.reduce((sum, w) => sum + parseFloat(w.temp), 0) / waterList.value.length).toFixed(1)
  const avgDo = (waterList.value.reduce((sum, w) => sum + parseFloat(w.do), 0) / waterList.value.length).toFixed(1)

  stats.value[0].value = avgTemp
  stats.value[1].value = avgDo

  const onlineCount = devices.filter(d => d.status === '在线').length
  stats.value[2].value = onlineCount

  stats.value[0].trend = Math.random() > 0.5 ? 'up' : 'down'
  stats.value[0].trendValue = (Math.random() * 3).toFixed(1)
  stats.value[1].trend = Math.random() > 0.5 ? 'up' : 'down'
  stats.value[1].trendValue = (Math.random() * 2).toFixed(1)

  updatePieChart()

  const hasAlert = Math.random() < 0.3
  if (hasAlert && unreadAlertCount.value < 20) {
    unreadAlertCount.value++
    ElNotification({
      title: '⚠️ 水质预警',
      message: `检测到${ponds[Math.floor(Math.random() * ponds.length)].name}溶解氧异常`,
      type: 'warning',
      duration: 5000
    })
  }
}

const manualRefresh = () => {
  refreshWaterData()
  refreshLineChart()
  refreshCountdown.value = 30
  ElMessage.success('数据已刷新')
}

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    refreshWaterData()
  }, 30000)

  countdownTimer = setInterval(() => {
    if (refreshCountdown.value > 1) {
      refreshCountdown.value--
    } else {
      refreshCountdown.value = 30
    }
  }, 1000)
}

const initPieChart = () => {
  if (!pieChart.value) return
  pieChartInstance = echarts.init(pieChart.value)
  updatePieChart()
}

const updatePieChart = () => {
  if (!pieChartInstance) return
  const onlineCount = devices.filter(d => d.status === '在线').length
  pieChartInstance.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {d}% ({c}台)' },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: { fontSize: 13 },
      itemWidth: 25,
      itemHeight: 12
    },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['55%', '50%'],
      data: [
        { name: '在线设备', value: onlineCount, itemStyle: { color: '#67C23A' } },
        { name: '离线设备', value: devices.length - onlineCount, itemStyle: { color: '#F56C6C' } }
      ],
      label: {
        show: true,
        fontSize: 12,
        formatter: '{b}: {d}%',
        position: 'outside'
      },
      labelLine: { length: 8, length2: 6 },
      emphasis: { scale: true }
    }]
  })
}

const initLineChart = () => {
  if (!lineChart.value) return
  lineChartInstance = echarts.init(lineChart.value)
  lineChartInstance.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['溶解氧(mg/L)', '水温(℃)'],
      left: 'right',
      textStyle: { fontSize: 14 },
      itemWidth: 30,
      itemHeight: 14
    },
    grid: {
      containLabel: true,
      left: 60,
      right: 60,
      top: 60,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.time),
      axisLabel: { rotate: 45, fontSize: 11, interval: 2 }
    },
    yAxis: [
      {
        type: 'value',
        name: '溶解氧 (mg/L)',
        min: 3,
        max: 8,
        nameTextStyle: { fontSize: 13, color: '#409EFF', fontWeight: 'bold' },
        axisLabel: { fontSize: 11 }
      },
      {
        type: 'value',
        name: '水温 (℃)',
        min: 18,
        max: 28,
        nameTextStyle: { fontSize: 13, color: '#E6A23C', fontWeight: 'bold' },
        axisLabel: { fontSize: 11 }
      }
    ],
    series: [
      {
        name: '溶解氧(mg/L)',
        type: 'line',
        data: chartData.map(d => d.do),
        smooth: true,
        lineStyle: { color: '#409EFF', width: 3 },
        itemStyle: { color: '#409EFF', borderWidth: 2, borderColor: '#fff' },
        symbol: 'circle',
        symbolSize: 9,
        showSymbol: true,
        areaStyle: { opacity: 0.15, color: '#409EFF' }
      },
      {
        name: '水温(℃)',
        type: 'line',
        data: chartData.map(d => d.temp),
        smooth: true,
        yAxisIndex: 1,
        lineStyle: { color: '#E6A23C', width: 3 },
        itemStyle: { color: '#E6A23C', borderWidth: 2, borderColor: '#fff' },
        symbol: 'diamond',
        symbolSize: 9,
        showSymbol: true,
        areaStyle: { opacity: 0.15, color: '#E6A23C' }
      }
    ]
  })
}

const showAlerts = () => {
  ElNotification({
    title: '预警信息',
    message: `您有 ${unreadAlertCount.value} 条未读预警，请及时处理！`,
    type: 'warning'
  })
}

const setCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[now.getDay()]
  currentDate.value = `${year}年${month}月${day}日 ${weekday}`
}

onMounted(async () => {
  setGreeting()
  setCurrentDate()
  refreshWaterData()
  await nextTick()
  initLineChart()
  initPieChart()
  startAutoRefresh()

  window.addEventListener('resize', () => {
    lineChartInstance?.resize()
    pieChartInstance?.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #eef2f6 100%);
  min-height: 100vh;
  padding: 0;
}

.dashboard-header {
  width: 100%;
  padding: 24px 28px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-row {
  width: 100%;
  margin: 0 !important;
  padding: 24px 28px;
}

.charts-row {
  width: 100%;
  margin: 0 !important;
  padding: 0 28px;
}

.table-row {
  width: 100%;
  margin: 0 !important;
  padding: 24px 28px;
}

.welcome-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-avatar {
  position: relative;
}

.welcome-status {
  position: absolute;
  bottom: 0;
  right: 0;
}

.online-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: #67c23a;
  border-radius: 50%;
  border: 2px solid white;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.greeting {
  font-weight: normal;
  opacity: 0.9;
}

.user-name {
  font-weight: bold;
  margin-left: 6px;
}

.welcome-text p {
  margin: 0;
  opacity: 0.85;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-section {
  display: flex;
  align-items: center;
  gap: 18px;
  cursor: pointer;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  transition: all 0.3s ease;
}

.alert-section:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.02);
}

.alert-icon-wrapper {
  position: relative;
}

.alert-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-info {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-size: 16px;
  font-weight: bold;
}

.alert-desc {
  font-size: 13px;
  opacity: 0.8;
}

.stat-card {
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15);
}

.stat-card-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-card-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card-pink {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px;
  min-height: 140px;
}

.stat-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.stat-emoji {
  font-size: 36px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-trend {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.trend-up {
  color: #90ff90;
}

.trend-down {
  color: #ffb3b3;
}

.stat-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  margin: 10px 0 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  cursor: help;
  opacity: 0.7;
  font-size: 14px;
}

.stat-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-col {
  display: flex;
}

.stat-card {
  width: 100%;
}

.chart-card {
  border-radius: 20px;
  overflow: hidden;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.title-icon {
  font-size: 24px;
}

.line-chart-wrapper {
  width: 100%;
  padding: 0 8px;
}

.line-chart {
  width: 100%;
  height: 450px;
}

.pie-chart-wrapper {
  width: 100%;
  padding: 0 4px;
}

.pie-chart {
  width: 100%;
  height: 450px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.table-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
}

.pond-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.do-safe {
  color: #67c23a;
}

.do-warning {
  color: #e6a23c;
}

.do-danger {
  color: #f56c6c;
}

@media (max-width: 1200px) {
  .stat-value {
    font-size: 26px;
  }

  .stat-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .stat-emoji {
    font-size: 32px;
  }

  .stats-row {
    padding: 20px 20px;
  }

  .table-row {
    padding: 20px 20px;
  }

  .charts-row {
    padding: 0 20px;
  }

  .dashboard-header {
    padding: 20px 24px;
  }
}

@media (max-width: 992px) {
  .stat-value {
    font-size: 22px;
  }

  .stat-card-inner {
    gap: 14px;
    padding: 18px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .line-chart {
    height: 350px;
  }

  .pie-chart {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 20px;
  }

  .stats-row {
    padding: 16px 16px;
  }

  .table-row {
    padding: 16px 16px;
  }

  .charts-row {
    padding: 0 16px;
  }

  .stat-card-inner {
    flex-direction: column;
    text-align: center;
    gap: 14px;
  }

  .stat-value {
    font-size: 24px;
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-controls {
    justify-content: center;
  }

  .stat-sub {
    white-space: normal;
  }

  .welcome-text h2 {
    font-size: 22px;
  }

  .chart-title {
    font-size: 14px;
  }

  .line-chart {
    height: 300px;
  }

  .pie-chart {
    height: 300px;
  }
}
</style>