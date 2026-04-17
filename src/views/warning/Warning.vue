<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span><el-icon><Warning /></el-icon> 预警事件列表</span>
          </template>
          <el-table :data="warnings" border stripe>
            <el-table-column prop="type" label="预警类型" />
            <el-table-column prop="level" label="等级">
              <template #default="{ row }">
                <el-tag :type="row.level === '严重' ? 'danger' : (row.level === '紧急' ? 'warning' : 'info')">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="pond" label="区域" />
            <el-table-column prop="value" label="异常值" />
            <el-table-column prop="time" label="发生时间" width="160" />
            <el-table-column prop="status" label="状态" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEmergency(row)">启动应急</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>应急指挥中心</span>
          </template>
          <div class="emergency-actions">
            <el-button type="danger" @click="simulateEmergency('台风')">台风应急演练</el-button>
            <el-button type="warning" @click="simulateEmergency('赤潮')">赤潮应急演练</el-button>
            <el-button type="info" @click="simulateEmergency('缺氧')">缺氧应急演练</el-button>
          </div>
          <el-divider />
          <h4>预设应急流程</h4>
          <ul class="flow-list">
            <li>1. 自动告警 → 2. 通知责任人 → 3. 启动预案 → 4. 执行处置 → 5. 结果反馈</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <!-- 应急事件记录 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>历史应急事件</span>
      </template>
      <el-table :data="emergencyLogs" border stripe>
        <el-table-column prop="event" label="事件类型" />
        <el-table-column prop="time" label="发生时间" />
        <el-table-column prop="response" label="应急响应" />
        <el-table-column prop="result" label="处理结果" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { warningEvents } from '@/api/mock'

const warnings = ref([])
const emergencyLogs = ref([
  { event: '台风“鲇鱼”', time: '2025-04-14', response: '启动二级响应，转移网箱', result: '无损失' },
  { event: '赤潮预警', time: '2025-03-20', response: '暂停投喂，增氧', result: '已控制' }
])

onMounted(() => {
  warnings.value = warningEvents
})

const handleEmergency = (row) => {
  ElMessage.success(`已启动应急响应流程，针对${row.type}`)
}

const simulateEmergency = (type) => {
  ElMessage.info(`模拟${type}应急指挥，应急小组已集结，指令已下达`)
}
</script>

<style scoped>
.emergency-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.flow-list {
  padding-left: 20px;
  color: #666;
}
</style>