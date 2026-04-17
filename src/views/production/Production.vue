<template>
  <div>
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 网箱档案 -->
      <el-tab-pane label="网箱档案" name="ponds">
        <el-table :data="ponds" border stripe>
          <el-table-column prop="name" label="池塘名称" />
          <el-table-column prop="area" label="面积(亩)" />
          <el-table-column prop="depth" label="水深(m)" />
          <el-table-column prop="variety" label="养殖品种" />
          <el-table-column prop="fishCount" label="鱼苗数量" sortable />
          <el-table-column prop="stockDate" label="投放日期" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewLogs(row.id)">养殖日志</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 投喂记录 -->
      <el-tab-pane label="投喂记录" name="feed">
        <div style="margin-bottom: 16px">
          <el-button type="primary" @click="dialogFeedVisible = true"><el-icon><Plus /></el-icon> 新增投喂记录</el-button>
        </div>
        <el-table :data="feedRecords" border stripe>
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="pondId" label="池塘ID" width="100" />
          <el-table-column prop="feedType" label="饲料类型" />
          <el-table-column prop="amount" label="重量(kg)" sortable />
          <el-table-column prop="operator" label="操作人" />
        </el-table>
      </el-tab-pane>

      <!-- 病害处理 -->
      <el-tab-pane label="病害处理" name="disease">
        <div style="margin-bottom: 16px">
          <el-button type="primary" @click="dialogDiseaseVisible = true"><el-icon><Plus /></el-icon> 新增病害记录</el-button>
        </div>
        <el-table :data="diseaseRecords" border stripe>
          <el-table-column prop="pondId" label="池塘ID" />
          <el-table-column prop="disease" label="病害名称" />
          <el-table-column prop="occurDate" label="发生日期" />
          <el-table-column prop="treatDate" label="治疗日期" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === '已治愈' ? 'success' : 'danger'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 捕捞与库存 -->
      <el-tab-pane label="捕捞与库存" name="harvest">
        <el-card>模拟捕捞计划与库存统计（开发中）</el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增投喂对话框 -->
    <el-dialog v-model="dialogFeedVisible" title="新增投喂记录" width="500px">
      <el-form :model="newFeed" label-width="100px">
        <el-form-item label="池塘">
          <el-select v-model="newFeed.pondId" placeholder="选择池塘">
            <el-option v-for="p in ponds" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="饲料类型">
          <el-input v-model="newFeed.feedType" />
        </el-form-item>
        <el-form-item label="重量(kg)">
          <el-input-number v-model="newFeed.amount" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFeedVisible = false">取消</el-button>
        <el-button type="primary" @click="addFeed">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增病害对话框 -->
    <el-dialog v-model="dialogDiseaseVisible" title="新增病害记录" width="500px">
      <el-form :model="newDisease" label-width="100px">
        <el-form-item label="池塘">
          <el-select v-model="newDisease.pondId" placeholder="选择池塘">
            <el-option v-for="p in ponds" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="病害名称">
          <el-input v-model="newDisease.disease" />
        </el-form-item>
        <el-form-item label="发生日期">
          <el-date-picker v-model="newDisease.occurDate" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogDiseaseVisible = false">取消</el-button>
        <el-button type="primary" @click="addDisease">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ponds, feedRecords, diseaseRecords, mockApi } from '@/api/mock'

const activeTab = ref('ponds')
const pondsList = ref([])
const feedList = ref([])
const diseaseList = ref([])

const dialogFeedVisible = ref(false)
const newFeed = ref({ pondId: '', feedType: '', amount: 0 })
const dialogDiseaseVisible = ref(false)
const newDisease = ref({ pondId: '', disease: '', occurDate: '' })

onMounted(async () => {
  pondsList.value = ponds
  feedList.value = feedRecords
  diseaseList.value = diseaseRecords
})

const viewLogs = (pondId) => {
  ElMessage.info(`查看池塘${pondId}的详细养殖日志`)
}

const addFeed = () => {
  if (!newFeed.value.pondId || !newFeed.value.feedType || newFeed.value.amount <= 0) {
    ElMessage.warning('请完整填写表单')
    return
  }
  const record = {
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    ...newFeed.value,
    operator: '当前用户'
  }
  feedList.value.unshift(record)
  dialogFeedVisible.value = false
  newFeed.value = { pondId: '', feedType: '', amount: 0 }
  ElMessage.success('添加成功')
}

const addDisease = () => {
  if (!newDisease.value.pondId || !newDisease.value.disease || !newDisease.value.occurDate) {
    ElMessage.warning('请完整填写表单')
    return
  }
  const record = {
    id: Date.now(),
    ...newDisease.value,
    occurDate: newDisease.value.occurDate.toISOString().slice(0, 10),
    treatDate: '',
    status: '治疗中'
  }
  diseaseList.value.unshift(record)
  dialogDiseaseVisible.value = false
  newDisease.value = { pondId: '', disease: '', occurDate: '' }
  ElMessage.success('添加成功')
}
</script>