<template>
  <div>
    <!-- 池塘选择卡片 -->
    <el-card>
      <template #header>
        <div class="header-toolbar">
          <span><el-icon><Monitor /></el-icon> 水质实时监测</span>
          <el-select v-model="selectedPond" placeholder="选择池塘" @change="fetchData" style="width: 200px">
            <el-option v-for="pond in ponds" :key="pond.id" :label="pond.name" :value="pond.id" />
          </el-select>
        </div>
      </template>

      <!-- 当前水质指标卡片 -->
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in currentMetrics" :key="item.label">
          <el-card shadow="hover" class="metric-card" :style="{ borderLeftColor: item.color }">
            <div class="metric-value" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="metric-label">{{ item.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 历史趋势图表 -->
      <el-divider content-position="left">历史趋势</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <div ref="doChart" style="height: 320px"></div>
        </el-col>
        <el-col :span="12">
          <div ref="tempChart" style="height: 320px"></div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <div ref="phChart" style="height: 300px"></div>
        </el-col>
      </el-row>

      <!-- 历史数据表格 -->
      <el-divider content-position="left">历史数据记录</el-divider>
      <el-table :data="historyList" border stripe>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="do" label="溶解氧(mg/L)" sortable />
        <el-table-column prop="ph" label="pH" sortable />
        <el-table-column prop="temp" label="水温(℃)" sortable />
        <el-table-column prop="nh3" label="氨氮(mg/L)" sortable />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ponds, currentWaterQuality, waterHistory } from '@/api/mock'

const selectedPond = ref(1)
const pondsList = ref([])
const currentMetrics = reactive({ do: { value: '--', label: '溶解氧(mg/L)', color: '#409EFF' }, ph: { value: '--', label: 'pH', color: '#67C23A' }, temp: { value: '--', label: '水温(℃)', color: '#E6A23C' }, nh3: { value: '--', label: '氨氮(mg/L)', color: '#F56C6C' } })
const historyList = ref([])

const doChart = ref(null)
const tempChart = ref(null)
const phChart = ref(null)

let doChartIns, tempChartIns, phChartIns

const fetchData = async () => {
  const quality = currentWaterQuality[selectedPond.value]
  if (quality) {
    currentMetrics.do.value = quality.do
    currentMetrics.ph.value = quality.ph
    currentMetrics.temp.value = quality.temp
    currentMetrics.nh3.value = quality.nh3
  }

  const history = waterHistory[selectedPond.value]
  if (history) {
    const times = history.times
    const doData = history.do.map(v => parseFloat(v))
    const tempData = history.temp.map(v => parseFloat(v))
    const phData = history.ph.map(v => parseFloat(v))

    historyList.value = times.map((t, idx) => ({
      time: t,
      do: doData[idx],
      ph: phData[idx],
      temp: tempData[idx],
      nh3: (Math.random() * 0.2 + 0.05).toFixed(2)
    }))

    doChartIns?.setOption({ xAxis: { data: times }, series: [{ data: doData }] })
    tempChartIns?.setOption({ xAxis: { data: times }, series: [{ data: tempData }] })
    phChartIns?.setOption({ xAxis: { data: times }, series: [{ data: phData }] })
  }
}

onMounted(async () => {
  pondsList.value = ponds
  selectedPond.value = ponds[0]?.id || 1

  await nextTick()

  doChartIns = echarts.init(doChart.value)
  doChartIns.setOption({ title: { text: '溶解氧变化 (mg/L)' }, tooltip: {}, xAxis: { type: 'category' }, yAxis: { type: 'value' }, series: [{ type: 'line', smooth: true, lineStyle: { color: '#409EFF' }, areaStyle: { opacity: 0.1 } }] })

  tempChartIns = echarts.init(tempChart.value)
  tempChartIns.setOption({ title: { text: '水温变化 (℃)' }, tooltip: {}, xAxis: { type: 'category' }, yAxis: { type: 'value' }, series: [{ type: 'line', smooth: true, lineStyle: { color: '#E6A23C' } }] })

  phChartIns = echarts.init(phChart.value)
  phChartIns.setOption({ title: { text: 'pH变化' }, tooltip: {}, xAxis: { type: 'category' }, yAxis: { type: 'value', min: 6.5, max: 8.5 }, series: [{ type: 'line', smooth: true, lineStyle: { color: '#67C23A' } }] })

  fetchData()
})
</script>

<style scoped>
.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.metric-card {
  text-align: center;
  border-left: 4px solid;
  cursor: pointer;
}
.metric-value {
  font-size: 32px;
  font-weight: bold;
}
.metric-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}
</style>