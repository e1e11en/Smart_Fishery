<template>
  <div class="production-container">
    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick" class="full-height-tabs">
      <!-- ========== 网箱档案 ========== -->
      <el-tab-pane label="网箱档案" name="ponds" class="tab-pane-full">
        <div class="toolbar">
          <el-input v-model="pondSearch" placeholder="按名称/品种搜索" style="width: 260px" clearable @clear="fetchPonds"
            @keyup.enter="fetchPonds">
            <template #prefix><el-icon>
                <Search />
              </el-icon></template>
          </el-input>
          <el-button type="primary" @click="openPondDialog()"><el-icon>
              <Plus />
            </el-icon> 新增网箱</el-button>
          <el-tag type="info" effect="plain" size="large">核心功能：增删改查/状态管理</el-tag>
        </div>
        <el-table :data="filteredPonds" border stripe v-loading="loading.ponds" style="width: 100%; font-size: 16px"
          :row-style="{ height: '60px' }">
          <el-table-column prop="name" label="池塘名称" min-width="120" />
          <el-table-column prop="area" label="面积(亩)" sortable min-width="100" />
          <el-table-column prop="depth" label="水深(m)" min-width="100" />
          <el-table-column prop="variety" label="养殖品种" min-width="120" />
          <el-table-column prop="fishCount" label="鱼苗数量" sortable min-width="130" />
          <el-table-column prop="stockDate" label="投放日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-switch v-model="row.status" active-value="启用" inactive-value="停用" @change="updatePondStatus(row)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="default" @click="openPondDialog(row)">编辑</el-button>
              <el-button link type="danger" size="default" @click="deletePond(row)">删除</el-button>
              <el-button link type="info" size="default" @click="viewLogs(row.id)">日志</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="pondPage" :page-size="pondPageSize" :total="pondsTotal"
          layout="total, prev, pager, next" class="pagination" />
      </el-tab-pane>

      <!-- ========== 投喂记录 ========== -->
      <el-tab-pane label="投喂记录" name="feed" class="tab-pane-full">
        <div class="toolbar">
          <el-select v-model="feedFilter.pondId" placeholder="选择池塘" clearable style="width: 150px">
            <el-option v-for="p in pondsList" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
          <el-date-picker v-model="feedFilter.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" size="default" style="width: 280px" />
          <el-select v-model="feedFilter.feedType" placeholder="饲料类型" clearable style="width: 130px">
            <el-option label="浮性料" value="浮性料" />
            <el-option label="沉性料" value="沉性料" />
            <el-option label="微粒子料" value="微粒子料" />
          </el-select>
          <el-button type="primary" @click="openFeedDialog()"><el-icon>
              <Plus />
            </el-icon> 新增投喂</el-button>
          <el-button type="danger" plain @click="batchDeleteFeed"
            :disabled="selectedFeedIds.length === 0">批量删除</el-button>
          <el-button type="success" plain @click="exportFeedCSV"><el-icon>
              <Download />
            </el-icon> 导出CSV</el-button>
          <el-tag type="info" effect="plain" size="large">交互说明：多条件筛选/批量操作/导出</el-tag>
        </div>
        <el-table :data="paginatedFeedRecords" border stripe @selection-change="handleFeedSelectionChange"
          v-loading="loading.feed" style="width: 100%; font-size: 16px" :row-style="{ height: '55px' }">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="date" label="日期" width="120" sortable />
          <el-table-column prop="pondName" label="池塘" min-width="140" />
          <el-table-column prop="feedType" label="饲料类型" min-width="120" />
          <el-table-column prop="amount" label="重量(kg)" sortable width="120" />
          <el-table-column prop="operator" label="操作人" min-width="120" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="danger" size="default" @click="deleteFeed(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="feedPage" :page-size="feedPageSize" :total="filteredFeedTotal"
          layout="total, prev, pager, next" class="pagination" />
      </el-tab-pane>

      <!-- ========== 病害处理 ========== -->
      <el-tab-pane label="病害处理" name="disease" class="tab-pane-full">
        <div class="toolbar">
          <el-button type="primary" @click="openDiseaseDialog()"><el-icon>
              <Plus />
            </el-icon> 新增病害记录</el-button>
          <el-tag type="info" effect="plain" size="large">核心功能：治疗进度跟踪/图片上传/统计卡片</el-tag>
        </div>
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="12" :sm="6"><el-card shadow="hover">
              <div class="stat-num">{{ diseaseStats.total }}</div>
              <div>总病害数</div>
            </el-card></el-col>
          <el-col :xs="12" :sm="6"><el-card shadow="hover">
              <div class="stat-num">{{ diseaseStats.treating }}</div>
              <div>治疗中</div>
            </el-card></el-col>
          <el-col :xs="12" :sm="6"><el-card shadow="hover">
              <div class="stat-num">{{ diseaseStats.cured }}</div>
              <div>已治愈</div>
            </el-card></el-col>
          <el-col :xs="12" :sm="6"><el-card shadow="hover">
              <div class="stat-num">{{ diseaseStats.avgTreatDays }}</div>
              <div>平均治疗天数</div>
            </el-card></el-col>
        </el-row>
        <el-table :data="diseaseRecordsList" border stripe v-loading="loading.disease"
          style="width: 100%; font-size: 16px" :row-style="{ height: '60px' }">
          <el-table-column prop="pondName" label="池塘" min-width="140" />
          <el-table-column prop="disease" label="病害名称" min-width="140" />
          <el-table-column prop="occurDate" label="发生日期" width="120" />
          <el-table-column prop="treatDate" label="治疗日期" width="120" />
          <el-table-column prop="status" label="治疗进度" min-width="200">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : undefined"
                :format="() => row.status" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button link type="primary" size="default" @click="viewDiseaseDetail(row)">详情</el-button>
              <el-button link type="primary" size="default" @click="updateProgress(row)">更新进度</el-button>
              <el-button link type="danger" size="default" @click="deleteDisease(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ========== 捕捞与库存 ========== -->
      <el-tab-pane label="捕捞与库存" name="harvest" class="tab-pane-full">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="full-card">
              <template #header>库存占比（按品种）</template>
              <div ref="stockChart" style="height: 360px; width: 100%"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="full-card">
              <template #header>库存预警（低于阈值）</template>
              <el-table :data="lowStockItems" border stripe style="width: 100%; font-size: 15px"
                :row-style="{ height: '55px' }">
                <el-table-column prop="pondName" label="池塘" />
                <el-table-column prop="currentStock" label="当前库存(kg)" sortable />
                <el-table-column prop="threshold" label="预警阈值" />
                <el-table-column label="操作"><template #default><el-button link
                      type="danger">补货提醒</el-button></template></el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="hover" class="full-card" style="margin-top: 20px">
          <template #header>捕捞计划 <el-button type="primary" plain size="default"
              @click="addHarvestPlan">新增计划</el-button></template>
          <el-table :data="harvestPlans" border stripe style="width: 100%; font-size: 15px"
            :row-style="{ height: '55px' }">
            <el-table-column prop="pondName" label="池塘" min-width="150" />
            <el-table-column prop="plannedDate" label="计划日期" width="130" />
            <el-table-column prop="estimatedWeight" label="预估产量(kg)" sortable width="150" />
            <el-table-column prop="status" label="状态" width="110">
              <template #default="{ row }">
                <el-switch v-model="row.status" active-value="已完成" inactive-value="待执行"
                  @change="updatePlanStatus(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100"><template #default><el-button link type="danger"
                  @click="deletePlan">删除</el-button></template></el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 对话框区域 ========== -->
    <!-- 网箱对话框 -->
    <el-dialog v-model="pondDialogVisible" :title="pondForm.id ? '编辑网箱' : '新增网箱'" width="500px">
      <el-form :model="pondForm" label-width="100px" :rules="pondRules" ref="pondFormRef">
        <el-form-item label="池塘名称" prop="name"><el-input v-model="pondForm.name" /></el-form-item>
        <el-form-item label="面积(亩)" prop="area"><el-input-number v-model="pondForm.area" :min="0"
            :step="0.1" /></el-form-item>
        <el-form-item label="水深(m)"><el-input-number v-model="pondForm.depth" :min="0" :step="0.1" /></el-form-item>
        <el-form-item label="养殖品种"><el-input v-model="pondForm.variety" /></el-form-item>
        <el-form-item label="鱼苗数量"><el-input-number v-model="pondForm.fishCount" :min="0" /></el-form-item>
        <el-form-item label="投放日期"><el-date-picker v-model="pondForm.stockDate" type="date"
            value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="pondForm.status" active-value="启用"
            inactive-value="停用" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pondDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePond">确定</el-button>
      </template>
    </el-dialog>

    <!-- 投喂对话框 -->
    <el-dialog v-model="feedDialogVisible" title="新增投喂记录" width="500px">
      <el-form :model="newFeed" label-width="100px">
        <el-form-item label="池塘"><el-select v-model="newFeed.pondId" placeholder="选择池塘"><el-option
              v-for="p in activePonds" :key="p.id" :label="p.name" :value="p.id" /></el-select></el-form-item>
        <el-form-item label="饲料类型"><el-input v-model="newFeed.feedType" /></el-form-item>
        <el-form-item label="重量(kg)"><el-input-number v-model="newFeed.amount" :min="0" /></el-form-item>
        <el-form-item label="操作人"><el-input v-model="newFeed.operator" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addFeed">确定</el-button>
      </template>
    </el-dialog>

    <!-- 病害对话框 -->
    <el-dialog v-model="diseaseDialogVisible" :title="diseaseForm.id ? '编辑病害记录' : '新增病害记录'" width="550px">
      <el-form :model="diseaseForm" label-width="100px">
        <el-form-item label="池塘"><el-select v-model="diseaseForm.pondId"><el-option v-for="p in pondsList" :key="p.id"
              :label="p.name" :value="p.id" /></el-select></el-form-item>
        <el-form-item label="病害名称"><el-input v-model="diseaseForm.disease" /></el-form-item>
        <el-form-item label="发生日期"><el-date-picker v-model="diseaseForm.occurDate" type="date"
            value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="治疗凭证"><el-upload action="#" :auto-upload="false" :show-file-list="true"
            :on-change="handleUpload"><el-button>上传图片</el-button></el-upload></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="diseaseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDisease">确定</el-button>
      </template>
    </el-dialog>

    <!-- 病害详情弹窗 -->
    <el-dialog v-model="diseaseDetailVisible" title="病害治疗详情" width="600px">
      <div v-if="currentDisease">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="池塘">{{ currentDisease.pondName }}</el-descriptions-item>
          <el-descriptions-item label="病害">{{ currentDisease.disease }}</el-descriptions-item>
          <el-descriptions-item label="发生日期">{{ currentDisease.occurDate }}</el-descriptions-item>
          <el-descriptions-item label="治疗日期">{{ currentDisease.treatDate || '未记录' }}</el-descriptions-item>
          <el-descriptions-item label="治疗措施">{{ currentDisease.treatment || '未记录' }}</el-descriptions-item>
          <el-descriptions-item label="治疗进度">{{ currentDisease.progress }}%</el-descriptions-item>
        </el-descriptions>
        <div v-if="currentDisease.imageUrl"><el-image :src="currentDisease.imageUrl"
            style="width: 100%; margin-top: 12px;" /></div>
      </div>
      <template #footer><el-button @click="diseaseDetailVisible = false">关闭</el-button></template>
    </el-dialog>

    <!-- 更新进度对话框 -->
    <el-dialog v-model="progressDialogVisible" title="更新治疗进度" width="400px">
      <el-slider v-model="updateProgressValue" :format-tooltip="(val) => val + '%'" />
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateProgress">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增捕捞计划对话框 -->
    <el-dialog v-model="planDialogVisible" title="新增捕捞计划" width="500px">
      <el-form :model="newPlan" label-width="100px">
        <el-form-item label="池塘"><el-select v-model="newPlan.pondId"><el-option v-for="p in pondsList" :key="p.id"
              :label="p.name" :value="p.id" /></el-select></el-form-item>
        <el-form-item label="计划日期"><el-date-picker v-model="newPlan.plannedDate" type="date"
            value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="预估产量(kg)"><el-input-number v-model="newPlan.estimatedWeight" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="planDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addHarvestPlanConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { ponds, feedRecords, diseaseRecords, mockApi } from '@/api/mock'

// ---------- 数据定义 ----------
const activeTab = ref('ponds')
const loading = reactive({ ponds: false, feed: false, disease: false })
// 网箱
const pondsList = ref([])
const pondSearch = ref('')
const pondPage = ref(1)
const pondPageSize = ref(5)
const pondDialogVisible = ref(false)
const pondFormRef = ref()
const pondForm = reactive({ id: null, name: '', area: 0, depth: 0, variety: '', fishCount: 0, stockDate: '', status: '启用' })
const pondRules = { name: [{ required: true, message: '请输入池塘名称', trigger: 'blur' }] }
// 投喂
const feedRecordsList = ref([])
const feedFilter = reactive({ pondId: null, dateRange: [], feedType: '' })
const feedPage = ref(1)
const feedPageSize = ref(5)
const selectedFeedIds = ref([])
const feedDialogVisible = ref(false)
const newFeed = reactive({ pondId: null, feedType: '', amount: 0, operator: '' })
// 病害
const diseaseRecordsList = ref([])
const diseaseDialogVisible = ref(false)
const diseaseForm = reactive({ id: null, pondId: null, disease: '', occurDate: '', imageUrl: '' })
const diseaseDetailVisible = ref(false)
const currentDisease = ref(null)
const progressDialogVisible = ref(false)
let updateProgressTarget = null
const updateProgressValue = ref(0)
// 捕捞计划
const harvestPlans = ref([])
const planDialogVisible = ref(false)
const newPlan = reactive({ pondId: null, plannedDate: '', estimatedWeight: 0 })
let stockChart = null

// ---------- 计算属性 ----------
const filteredPonds = computed(() => {
  let list = pondsList.value
  if (pondSearch.value) {
    const kw = pondSearch.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.variety.toLowerCase().includes(kw))
  }
  return list.slice((pondPage.value - 1) * pondPageSize.value, pondPage.value * pondPageSize.value)
})
const pondsTotal = computed(() => pondsList.value.length)

const filteredFeedRecords = computed(() => {
  let list = feedRecordsList.value.map(r => {
    const pond = pondsList.value.find(p => p.id === r.pondId)
    return { ...r, pondName: pond ? pond.name : '未知' }
  })
  if (feedFilter.pondId) list = list.filter(r => r.pondId === feedFilter.pondId)
  if (feedFilter.dateRange && feedFilter.dateRange.length === 2) {
    const [start, end] = feedFilter.dateRange
    list = list.filter(r => r.date >= start && r.date <= end)
  }
  if (feedFilter.feedType) list = list.filter(r => r.feedType === feedFilter.feedType)
  return list
})
const filteredFeedTotal = computed(() => filteredFeedRecords.value.length)
const paginatedFeedRecords = computed(() => {
  const start = (feedPage.value - 1) * feedPageSize.value
  return filteredFeedRecords.value.slice(start, start + feedPageSize.value)
})

const diseaseStats = computed(() => {
  const total = diseaseRecordsList.value.length
  const treating = diseaseRecordsList.value.filter(d => d.status === '治疗中').length
  const cured = diseaseRecordsList.value.filter(d => d.status === '已治愈').length
  const avgDays = diseaseRecordsList.value.filter(d => d.treatDate && d.occurDate).reduce((sum, d) => {
    const days = (new Date(d.treatDate) - new Date(d.occurDate)) / (1000 * 3600 * 24)
    return sum + (days > 0 ? days : 0)
  }, 0) / (diseaseRecordsList.value.filter(d => d.treatDate).length || 1)
  return { total, treating, cured, avgTreatDays: avgDays.toFixed(1) }
})

const lowStockItems = computed(() => {
  return [
    { pondName: '1号生态塘', currentStock: 1250, threshold: 1500 },
    { pondName: '3号成鱼池', currentStock: 3200, threshold: 3000 }
  ]
})

const activePonds = computed(() => pondsList.value.filter(p => p.status === '启用'))

// ---------- 网箱操作 ----------
const fetchPonds = async () => {
  loading.ponds = true
  pondsList.value = await mockApi.getPonds()
  loading.ponds = false
}
const openPondDialog = (row = null) => {
  if (row) {
    Object.assign(pondForm, row)
  } else {
    Object.assign(pondForm, { id: null, name: '', area: 0, depth: 0, variety: '', fishCount: 0, stockDate: '', status: '启用' })
  }
  pondDialogVisible.value = true
}
const savePond = async () => {
  await pondFormRef.value?.validate()
  if (pondForm.id) {
    const idx = pondsList.value.findIndex(p => p.id === pondForm.id)
    if (idx !== -1) Object.assign(pondsList.value[idx], pondForm)
    ElMessage.success('更新成功')
  } else {
    const newId = Date.now()
    pondsList.value.push({ ...pondForm, id: newId })
    ElMessage.success('新增成功')
  }
  pondDialogVisible.value = false
}
const deletePond = (row) => {
  ElMessageBox.confirm(`确定删除网箱 ${row.name} 吗？`, '提示', { type: 'warning' }).then(() => {
    const idx = pondsList.value.findIndex(p => p.id === row.id)
    if (idx !== -1) pondsList.value.splice(idx, 1)
    ElMessage.success('删除成功')
  })
}
const updatePondStatus = (row) => {
  ElMessage.success(`网箱 ${row.name} 状态已改为 ${row.status}`)
}
const viewLogs = (pondId) => {
  ElMessage.info(`查看池塘 ${pondId} 的养殖日志（演示）`)
}

// ---------- 投喂操作 ----------
const fetchFeed = async () => {
  loading.feed = true
  feedRecordsList.value = await mockApi.getFeedRecords()
  loading.feed = false
}
const handleFeedSelectionChange = (selection) => {
  selectedFeedIds.value = selection.map(s => s.id)
}
const deleteFeed = (row) => {
  ElMessageBox.confirm('确定删除该投喂记录？', '提示', { type: 'warning' }).then(() => {
    const idx = feedRecordsList.value.findIndex(f => f.id === row.id)
    if (idx !== -1) feedRecordsList.value.splice(idx, 1)
    ElMessage.success('删除成功')
  })
}
const batchDeleteFeed = () => {
  ElMessageBox.confirm(`确定删除 ${selectedFeedIds.value.length} 条记录？`, '批量删除', { type: 'warning' }).then(() => {
    feedRecordsList.value = feedRecordsList.value.filter(f => !selectedFeedIds.value.includes(f.id))
    selectedFeedIds.value = []
    ElMessage.success('批量删除成功')
  })
}
const openFeedDialog = () => {
  Object.assign(newFeed, { pondId: null, feedType: '', amount: 0, operator: '' })
  feedDialogVisible.value = true
}
const addFeed = () => {
  if (!newFeed.pondId || !newFeed.feedType || newFeed.amount <= 0) {
    ElMessage.warning('请完整填写表单')
    return
  }
  const record = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    ...newFeed,
    operator: newFeed.operator || '当前用户'
  }
  feedRecordsList.value.unshift(record)
  feedDialogVisible.value = false
  ElMessage.success('添加成功')
}
const exportFeedCSV = () => {
  const data = filteredFeedRecords.value.map(r => `${r.date},${r.pondName},${r.feedType},${r.amount},${r.operator}`)
  const csv = '日期,池塘,饲料类型,重量(kg),操作人\n' + data.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '投喂记录.csv'
  link.click()
  ElMessage.success('导出成功')
}

// ---------- 病害操作 ----------
const fetchDisease = async () => {
  loading.disease = true
  const raw = await mockApi.getDiseaseRecords()
  diseaseRecordsList.value = raw.map(d => {
    const pond = pondsList.value.find(p => p.id === d.pondId)
    return { ...d, pondName: pond ? pond.name : '未知', progress: d.status === '已治愈' ? 100 : d.status === '治疗中' ? 60 : 20 }
  })
  loading.disease = false
}
const openDiseaseDialog = (row = null) => {
  if (row) {
    Object.assign(diseaseForm, row)
  } else {
    Object.assign(diseaseForm, { id: null, pondId: null, disease: '', occurDate: '', imageUrl: '' })
  }
  diseaseDialogVisible.value = true
}
const handleUpload = (file) => {
  diseaseForm.imageUrl = URL.createObjectURL(file.raw)
  ElMessage.success('图片已上传（模拟）')
}
const saveDisease = () => {
  if (!diseaseForm.pondId || !diseaseForm.disease || !diseaseForm.occurDate) {
    ElMessage.warning('请完整填写')
    return
  }
  if (diseaseForm.id) {
    const idx = diseaseRecordsList.value.findIndex(d => d.id === diseaseForm.id)
    if (idx !== -1) Object.assign(diseaseRecordsList.value[idx], diseaseForm)
    ElMessage.success('更新成功')
  } else {
    const newId = Date.now()
    diseaseRecordsList.value.unshift({
      ...diseaseForm,
      id: newId,
      treatDate: '',
      status: '治疗中',
      progress: 20,
      pondName: pondsList.value.find(p => p.id === diseaseForm.pondId)?.name || '未知'
    })
    ElMessage.success('添加成功')
  }
  diseaseDialogVisible.value = false
}
const deleteDisease = (row) => {
  ElMessageBox.confirm('确定删除该病害记录？', '提示', { type: 'warning' }).then(() => {
    const idx = diseaseRecordsList.value.findIndex(d => d.id === row.id)
    if (idx !== -1) diseaseRecordsList.value.splice(idx, 1)
    ElMessage.success('删除成功')
  })
}
const viewDiseaseDetail = (row) => {
  currentDisease.value = row
  diseaseDetailVisible.value = true
}
const updateProgress = (row) => {
  updateProgressTarget = row
  updateProgressValue.value = row.progress
  progressDialogVisible.value = true
}
const confirmUpdateProgress = () => {
  if (updateProgressTarget) {
    updateProgressTarget.progress = updateProgressValue.value
    updateProgressTarget.status = updateProgressValue.value === 100 ? '已治愈' : (updateProgressValue.value > 0 ? '治疗中' : '未处理')
    if (updateProgressValue.value === 100 && !updateProgressTarget.treatDate) {
      updateProgressTarget.treatDate = new Date().toISOString().slice(0, 10)
    }
    ElMessage.success('进度已更新')
  }
  progressDialogVisible.value = false
}

// ---------- 捕捞与库存 ----------
const initStockChart = () => {
  const chartDom = document.getElementById('stockChart')
  if (!chartDom) return
  if (stockChart) stockChart.dispose()
  stockChart = echarts.init(chartDom)
  stockChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [{
      type: 'pie', radius: '50%', data: [
        { name: '1号生态塘', value: 12500 },
        { name: '2号育苗池', value: 3200 },
        { name: '3号成鱼池', value: 21000 },
        { name: '4号循环水车间', value: 8000 }
      ], emphasis: { scale: true }
    }]
  })
}
const addHarvestPlan = () => {
  Object.assign(newPlan, { pondId: null, plannedDate: '', estimatedWeight: 0 })
  planDialogVisible.value = true
}
const addHarvestPlanConfirm = () => {
  if (!newPlan.pondId || !newPlan.plannedDate || newPlan.estimatedWeight <= 0) {
    ElMessage.warning('请完整填写')
    return
  }
  const pond = pondsList.value.find(p => p.id === newPlan.pondId)
  harvestPlans.value.push({
    pondName: pond ? pond.name : '未知',
    plannedDate: newPlan.plannedDate,
    estimatedWeight: newPlan.estimatedWeight,
    status: '待执行'
  })
  planDialogVisible.value = false
  ElMessage.success('新增计划成功')
}
const updatePlanStatus = (row) => {
  ElMessage.success(`计划已标记为 ${row.status}`)
}
const deletePlan = (row) => {
  const idx = harvestPlans.value.findIndex(p => p === row)
  if (idx !== -1) harvestPlans.value.splice(idx, 1)
  ElMessage.success('已删除')
}

const handleTabClick = (tab) => {
  if (tab.paneName === 'harvest') {
    setTimeout(() => initStockChart(), 100)
  }
}

// ---------- 初始化 ----------
onMounted(async () => {
  await fetchPonds()
  await fetchFeed()
  await fetchDisease()
  harvestPlans.value = [
    { pondName: '1号生态塘', plannedDate: '2025-04-25', estimatedWeight: 12500, status: '待执行' },
    { pondName: '3号成鱼池', plannedDate: '2025-04-28', estimatedWeight: 21000, status: '待执行' }
  ]
})
</script>

<style scoped>
.production-container {
  width: 100%;
  height: 100%;
  padding: 0;
}

.full-height-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.full-height-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.tab-pane-full {
  height: 100%;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-num {
  font-size: 32px;
  font-weight: bold;
  color: #1f7b6e;
  line-height: 1.2;
}

.full-card {
  height: 100%;
}

.el-table {
  font-size: 15px;
}

.el-table .el-table__cell {
  padding: 12px 0;
}

.el-tag--large {
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
  font-size: 14px;
}
</style>