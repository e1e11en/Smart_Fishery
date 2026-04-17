<template>
  <el-aside width="260px" class="sidebar">
    <div class="logo">
      <el-icon><Fish /></el-icon>
      <span>智慧渔业 · 渔智云</span>
    </div>
    <el-menu
      :default-active="$route.path"
      router
      background-color="#001529"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      class="sidebar-menu"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon><span>主功能页</span>
      </el-menu-item>
      <el-menu-item index="/monitor">
        <el-icon><Monitor /></el-icon><span>环境监测</span>
      </el-menu-item>
      <el-menu-item index="/production">
        <el-icon><Notebook /></el-icon><span>生产管理</span>
      </el-menu-item>
      <el-menu-item index="/warning">
        <el-icon><Warning /></el-icon><span>预警指挥</span>
      </el-menu-item>
      <el-menu-item index="/traceability">
        <el-icon><Connection /></el-icon><span>产品溯源</span>
      </el-menu-item>
      <el-menu-item index="/brand">
        <el-icon><Star /></el-icon><span>品牌展示</span>
      </el-menu-item>
      <el-menu-item index="/admin" v-if="authStore.isAdmin">
        <el-icon><Setting /></el-icon><span>管理后台</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { useAuthStore } from '@/stores'
const authStore = useAuthStore()
</script>

<style scoped>
.sidebar {
  background-color: #001529;
  color: white;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  border-bottom: 1px solid #0d2538;
  margin-bottom: 10px;
}
.sidebar-menu {
  border-right: none;
}
.el-menu-item {
  height: 50px;
  line-height: 50px;
}
</style>