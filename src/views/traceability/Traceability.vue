<template>
  <div class="traceability-container">
    <!-- 查询卡片 -->
    <el-card class="query-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span><el-icon>
              <Connection />
            </el-icon> 溯源码查询</span>
          <el-tag type="info" effect="plain">核心功能：扫码/批次查询/批量生成</el-tag>
        </div>
      </template>
      <div class="query-area">
        <el-input v-model="searchCode" placeholder="请输入溯源码或批次号（如 HY202504001）" style="width: 280px" clearable />
        <el-button type="primary" @click="searchBatch" :loading="searching"><el-icon>
            <Search />
          </el-icon> 查询</el-button>
        <el-button @click="showScanner = true"><el-icon>
            <Camera />
          </el-icon> 模拟扫码</el-button>
        <el-button type="success" @click="generateNewBatch"><el-icon>
            <Plus />
          </el-icon> 生成新溯源码</el-button>
        <el-button type="warning" plain @click="batchGenerate">批量生成（10个）</el-button>
      </div>
      <div v-if="searchHistory.length > 0" class="history-area">
        <span>最近查询：</span>
        <el-tag v-for="h in searchHistory" :key="h" size="small" style="margin-right: 8px; cursor: pointer"
          @click="searchCode = h; searchBatch()">{{ h }}</el-tag>
      </div>
    </el-card>

    <!-- 溯源详情卡片 -->
    <el-card v-if="batchInfo" class="detail-card" shadow="hover">
      <template #header>
        <span>溯源信息 - 批次 {{ batchInfo.batchId }}</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="批次号">{{ batchInfo.batchId }}</el-descriptions-item>
        <el-descriptions-item label="养殖池塘">{{ batchInfo.pondName }}</el-descriptions-item>
        <el-descriptions-item label="投放日期">{{ batchInfo.stockDate }}</el-descriptions-item>
        <el-descriptions-item label="捕捞日期">{{ batchInfo.harvestDate || '未捕捞' }}</el-descriptions-item>
        <el-descriptions-item label="总产量(kg)">{{ batchInfo.weight || '待定' }}</el-descriptions-item>
        <el-descriptions-item label="溯源码图片"><el-button link type="primary"
            @click="showQRCode">查看二维码</el-button></el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">养殖环境展示</el-divider>
      <el-carousel height="220px" indicator-position="outside">
        <el-carousel-item v-for="img in envImages" :key="img">
          <div class="carousel-img" :style="{ backgroundImage: `url(${img})` }"></div>
        </el-carousel-item>
      </el-carousel>
      <el-divider content-position="left">检测报告</el-divider>
      <el-button link type="primary" @click="downloadReport"><el-icon>
          <Download />
        </el-icon> 下载检测报告（PDF模拟）</el-button>
      <div class="honor-tags">
        <el-tag size="small">国家地理标志</el-tag>
        <el-tag size="small" type="success">无公害认证</el-tag>
        <el-tag size="small" type="warning">出口备案基地</el-tag>
      </div>
    </el-card>

    <!-- 消费者扫码预览卡片 -->
    <el-card class="consumer-card" shadow="hover">
      <template #header>
        <span><el-icon>
            <View />
          </el-icon> 消费者扫码页面预览</span>
        <el-tag type="warning" effect="plain">交互说明：扫码后展示养殖全程信息/用户评价</el-tag>
      </template>
      <div class="consumer-view">
        <div class="consumer-header">
          <el-avatar :size="60" src="https://picsum.photos/id/20/100/100" />
          <div>
            <h3>闽海兴业 · 三沙湾大黄鱼</h3>
            <div class="stars"><el-rate v-model="rating" disabled show-score text-color="#ff9900"
                score-template="{value}分" /></div>
          </div>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="养殖基地">宁德三沙湾国家级水产种质资源保护区</el-descriptions-item>
          <el-descriptions-item label="养殖方式">仿生态网箱养殖，全程无抗生素</el-descriptions-item>
          <el-descriptions-item label="检测结果">重金属、药残均符合国家标准</el-descriptions-item>
          <el-descriptions-item label="溯源码">HY202504001（扫码可见）</el-descriptions-item>
        </el-descriptions>
        <!-- 用户评价 -->
        <el-divider content-position="left">用户评价 <el-button link type="primary"
            @click="addComment">写评价</el-button></el-divider>
        <div class="comments">
          <div v-for="(c, idx) in comments" :key="idx" class="comment-item">
            <el-avatar :size="32" :src="c.avatar" />
            <div class="comment-content">
              <div class="comment-user">{{ c.user }} <el-rate v-model="c.rate" disabled size="small" /> <span
                  class="comment-time">{{ c.time }}</span></div>
              <div class="comment-text">{{ c.text }}</div>
              <div class="comment-actions"><el-button link @click="likeComment(c)"><el-icon>
                    <ThumbsUp />
                  </el-icon> {{ c.likes }}</el-button></div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 模拟扫码弹窗 -->
    <el-dialog v-model="showScanner" title="扫码溯源" width="400px" center>
      <div class="scanner-mock">
        <div class="scan-line"></div>
        <p style="margin-top: 20px;">正在模拟扫描...</p>
        <el-button type="primary" @click="mockScan">模拟扫描批次 HY202504001</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { batches, ponds } from '@/api/mock'

// ---------- 数据 ----------
const searchCode = ref('')
const searching = ref(false)
const batchInfo = ref(null)
const searchHistory = ref([])
const showScanner = ref(false)
const rating = ref(4.8)
const envImages = ref([
  'https://picsum.photos/id/15/800/200',
  'https://picsum.photos/id/26/800/200',
  'https://picsum.photos/id/129/800/200'
])
const comments = ref([
  { user: '张先生', rate: 5, text: '鱼肉很鲜嫩，溯源码扫出来信息很全，吃得放心！', avatar: 'https://picsum.photos/id/64/32/32', likes: 12, time: '2025-04-10' },
  { user: '李女士', rate: 4, text: '包装不错，物流也快，会回购。', avatar: 'https://picsum.photos/id/65/32/32', likes: 5, time: '2025-04-12' }
])

// ---------- 查询功能 ----------
const searchBatch = async () => {
  if (!searchCode.value) {
    ElMessage.warning('请输入溯源码')
    return
  }
  searching.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  const found = batches.find(b => b.batchId === searchCode.value)
  if (found) {
    const pond = ponds.find(p => p.id === found.pondId)
    batchInfo.value = { ...found, pondName: pond ? pond.name : '未知' }
    if (!searchHistory.value.includes(searchCode.value)) {
      searchHistory.value.unshift(searchCode.value)
      if (searchHistory.value.length > 5) searchHistory.value.pop()
    }
    ElMessage.success('查询成功')
  } else {
    ElMessage.error('未找到该批次，请检查溯源码')
    batchInfo.value = null
  }
  searching.value = false
}

// 生成新批次
const generateNewBatch = () => {
  const newId = 'HY' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const newBatch = {
    batchId: newId,
    pondId: 1,
    stockDate: new Date().toISOString().slice(0, 10),
    harvestDate: '',
    weight: 0,
    qrcode: 'https://example.com/qr/' + newId
  }
  batches.unshift(newBatch)
  ElMessage.success(`新批次 ${newId} 已生成，可扫码查询`)
  searchCode.value = newId
  searchBatch()
}

const batchGenerate = () => {
  for (let i = 0; i < 10; i++) {
    const id = 'HY' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + (Math.floor(Math.random() * 10000)).toString().padStart(4, '0')
    batches.unshift({ batchId: id, pondId: 1, stockDate: new Date().toISOString().slice(0, 10), harvestDate: '', weight: 0, qrcode: '' })
  }
  ElMessage.success('已生成10个新批次')
}

const mockScan = () => {
  searchCode.value = 'HY202504001'
  showScanner.value = false
  searchBatch()
}

const showQRCode = () => {
  ElMessage.info(`溯源码图片链接: ${batchInfo.value?.qrcode}`)
}

const downloadReport = () => {
  ElMessage.success('模拟下载检测报告PDF')
}

// 评价操作
const addComment = () => {
  ElMessageBox.prompt('请输入您的评价', '用户评价', {
    confirmButtonText: '提交',
    inputPlaceholder: '说说您的购买体验...'
  }).then(({ value }) => {
    if (value) {
      comments.value.unshift({
        user: '热心消费者',
        rate: 5,
        text: value,
        avatar: 'https://picsum.photos/id/66/32/32',
        likes: 0,
        time: new Date().toISOString().slice(0, 10)
      })
      ElMessage.success('感谢您的评价')
    }
  })
}

const likeComment = (comment) => {
  comment.likes++
  ElMessage.success('点赞成功')
}
</script>

<style scoped>
.traceability-container {
  max-width: 1200px;
  margin: 0 auto;
}

.query-card,
.detail-card,
.consumer-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-area {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.history-area {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.carousel-img {
  height: 100%;
  background-size: cover;
  background-position: center;
}

.honor-tags {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.consumer-view {
  background: linear-gradient(145deg, #f9fafb, #f0f2f5);
  padding: 20px;
  border-radius: 16px;
}

.consumer-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.stars {
  margin-top: 8px;
}

.comments {
  max-height: 350px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.comment-content {
  flex: 1;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.comment-time {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.comment-actions {
  margin-top: 6px;
}

.scanner-mock {
  text-align: center;
  background: #000;
  color: #0f0;
  padding: 40px;
  border-radius: 8px;
  position: relative;
}

.scan-line {
  width: 80%;
  height: 2px;
  background: #0f0;
  animation: scan 2s infinite linear;
  margin: 20px auto;
}

@keyframes scan {
  0% {
    transform: translateY(-50px);
    opacity: 0;
  }

  50% {
    transform: translateY(0);
    opacity: 1;
  }

  100% {
    transform: translateY(50px);
    opacity: 0;
  }
}
</style>