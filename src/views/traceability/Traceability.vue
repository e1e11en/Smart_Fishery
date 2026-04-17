<template>
  <div>
    <el-card>
      <template #header>
        <span><el-icon><Connection /></el-icon> 溯源码查询</span>
      </template>
      <div class="search-area">
        <el-input v-model="searchCode" placeholder="请输入溯源码或批次号" style="width: 300px" clearable />
        <el-button type="primary" @click="searchBatch">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </el-card>

    <!-- 溯源详情 -->
    <el-card style="margin-top: 20px" v-if="batchInfo">
      <div class="trace-detail">
        <h3>溯源信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="批次号">{{ batchInfo.batchId }}</el-descriptions-item>
          <el-descriptions-item label="养殖池塘">{{ batchInfo.pondName }}</el-descriptions-item>
          <el-descriptions-item label="投放日期">{{ batchInfo.stockDate }}</el-descriptions-item>
          <el-descriptions-item label="捕捞日期">{{ batchInfo.harvestDate }}</el-descriptions-item>
          <el-descriptions-item label="总产量(kg)">{{ batchInfo.weight }}</el-descriptions-item>
          <el-descriptions-item label="溯源码图片">
            <el-button link type="primary" @click="showQRCode">查看二维码</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 消费者扫码预览 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <span>消费者扫码页面预览</span>
      </template>
      <div class="consumer-view">
        <h4>闽海兴业 · 三沙湾大黄鱼</h4>
        <p>养殖基地：宁德三沙湾国家级水产种质资源保护区</p>
        <p>养殖方式：仿生态网箱养殖，全程无抗生素</p>
        <p>检测报告：重金属、药残均符合国家标准</p>
        <el-image style="width: 100px; height: 100px" src="https://picsum.photos/id/20/100/100" fit="cover" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { batches, ponds } from '@/api/mock'

const searchCode = ref('')
const batchInfo = ref(null)

onMounted(() => {
  // 默认显示第一个批次
  if (batches.length) {
    const b = batches[0]
    const pond = ponds.find(p => p.id === b.pondId)
    batchInfo.value = { ...b, pondName: pond ? pond.name : '未知' }
  }
})

const searchBatch = () => {
  if (!searchCode.value) {
    ElMessage.warning('请输入溯源码')
    return
  }
  const found = batches.find(b => b.batchId === searchCode.value)
  if (found) {
    const pond = ponds.find(p => p.id === found.pondId)
    batchInfo.value = { ...found, pondName: pond ? pond.name : '未知' }
    ElMessage.success('查询成功')
  } else {
    ElMessage.error('未找到该批次')
    batchInfo.value = null
  }
}

const reset = () => {
  searchCode.value = ''
  batchInfo.value = null
}

const showQRCode = () => {
  ElMessage.info(`溯源码图片链接: ${batchInfo.value?.qrcode}`)
}
</script>

<style scoped>
.search-area {
  display: flex;
  gap: 12px;
  align-items: center;
}
.trace-detail {
  padding: 10px;
}
.consumer-view {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}
</style>