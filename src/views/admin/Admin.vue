<template>
  <div>
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="users">
        <div style="margin-bottom: 16px">
          <el-button type="primary" @click="dialogUserVisible = true"><el-icon><Plus /></el-icon> 新增用户</el-button>
        </div>
        <el-table :data="users" border stripe>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="role" label="角色" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-switch v-model="row.status" active-value="启用" inactive-value="停用" disabled />
            </template>
          </el-table-column>
          <el-table-column prop="lastLogin" label="最后登录" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="editUser(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteUser(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 设备管理 -->
      <el-tab-pane label="设备管理" name="devices">
        <div style="margin-bottom: 16px">
          <el-button type="primary" @click="dialogDeviceVisible = true"><el-icon><Plus /></el-icon> 添加设备</el-button>
        </div>
        <el-table :data="devices" border stripe>
          <el-table-column prop="name" label="设备名称" />
          <el-table-column prop="location" label="位置" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === '在线' ? 'success' : 'danger'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastData" label="最新数据" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="remoteConfig(row)">远程配置</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 系统日志 -->
      <el-tab-pane label="系统日志" name="logs">
        <el-table :data="logs" border stripe>
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="user" label="用户" />
          <el-table-column prop="action" label="操作" />
          <el-table-column prop="ip" label="IP地址" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增用户对话框 -->
    <el-dialog v-model="dialogUserVisible" title="新增用户" width="500px">
      <el-form :model="newUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="newUser.username" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newUser.role">
            <el-option label="管理员" value="admin" />
            <el-option label="场长" value="manager" />
            <el-option label="技术员" value="tech" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="newUser.password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogUserVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加设备对话框 -->
    <el-dialog v-model="dialogDeviceVisible" title="添加设备" width="500px">
      <el-form :model="newDevice" label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="newDevice.name" />
        </el-form-item>
        <el-form-item label="安装位置">
          <el-input v-model="newDevice.location" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="newDevice.type">
            <el-option label="水质传感器" value="水质" />
            <el-option label="投喂机" value="投喂" />
            <el-option label="摄像头" value="视频" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogDeviceVisible = false">取消</el-button>
        <el-button type="primary" @click="addDevice">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { users as initialUsers, devices as initialDevices } from '@/api/mock'

const activeTab = ref('users')
const users = ref([])
const devices = ref([])
const logs = ref([
  { time: '2025-04-16 08:00:00', user: 'admin', action: '登录系统', ip: '192.168.1.1' },
  { time: '2025-04-16 09:30:00', user: 'admin', action: '修改预警规则', ip: '192.168.1.1' }
])

const dialogUserVisible = ref(false)
const newUser = ref({ username: '', role: 'tech', password: '' })
const dialogDeviceVisible = ref(false)
const newDevice = ref({ name: '', location: '', type: '水质' })

onMounted(() => {
  users.value = [...initialUsers]
  devices.value = [...initialDevices]
})

const editUser = (row) => {
  ElMessage.info(`编辑用户 ${row.username}`)
}
const deleteUser = (row) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗？`, '提示', { type: 'warning' }).then(() => {
    const idx = users.value.findIndex(u => u.id === row.id)
    if (idx !== -1) users.value.splice(idx, 1)
    ElMessage.success('删除成功')
  })
}
const addUser = () => {
  if (!newUser.value.username || !newUser.value.password) {
    ElMessage.warning('请完整填写')
    return
  }
  const user = {
    id: Date.now(),
    username: newUser.value.username,
    role: newUser.value.role,
    status: '启用',
    lastLogin: '-'
  }
  users.value.push(user)
  dialogUserVisible.value = false
  newUser.value = { username: '', role: 'tech', password: '' }
  ElMessage.success('添加成功')
}

const remoteConfig = (row) => {
  ElMessage.info(`远程配置 ${row.name}`)
}
const addDevice = () => {
  if (!newDevice.value.name || !newDevice.value.location) {
    ElMessage.warning('请完整填写')
    return
  }
  const device = {
    id: Date.now(),
    ...newDevice.value,
    status: '离线',
    lastData: '-'
  }
  devices.value.push(device)
  dialogDeviceVisible.value = false
  newDevice.value = { name: '', location: '', type: '水质' }
  ElMessage.success('添加成功')
}
</script>