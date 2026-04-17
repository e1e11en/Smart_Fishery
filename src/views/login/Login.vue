<template>
  <div class="login-container">
    <!-- 动态波浪背景 -->
    <div class="waves-bg">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>

    <!-- 粒子效果 -->
    <div class="particles">
      <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

    <!-- 玻璃态登录卡片 -->
    <el-card class="login-card glass-card">
      <template #header>
        <div class="login-header">
          <h1>智慧渔业管理系统</h1>
          <p>宁德·三沙湾大黄鱼养殖基地</p>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" prefix-icon="User" size="large" clearable
            class="glass-input" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large"
            show-password clearable class="glass-input" />
        </el-form-item>

        <!-- 图形验证码：直接输入 -->
        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <el-input v-model="form.captcha" placeholder="请输入验证码" prefix-icon="Key" size="large" style="flex: 1"
              clearable class="glass-input" maxlength="4" />
            <div class="captcha-code glass-card" @click="refreshCaptcha">
              <span class="captcha-text">{{ captchaCode }}</span>
              <el-icon class="refresh-icon">
                <RefreshRight />
              </el-icon>
            </div>
          </div>
        </el-form-item>

        <!-- 记住密码复选框 -->
        <el-form-item>
          <el-checkbox v-model="form.rememberPassword" size="large">
            记住密码
          </el-checkbox>
        </el-form-item>

        <el-button type="primary" @click="handleLogin" :loading="loading" size="large" style="width:100%"
          class="login-btn">
          登录系统
        </el-button>
      </el-form>

      <!-- 演示账号提示 -->
      <div class="demo-tip">
        <el-icon>
          <InfoFilled />
        </el-icon>
        演示账号：admin / 123456
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { RefreshRight, User, InfoFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

// 登录账号
const VALID_ACCOUNT = {
  username: 'admin',
  password: '123456',
  role: '系统管理员',
  permissions: ['all']
}

// 生成随机验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const captchaCode = ref(generateCaptcha())

// 刷新验证码
const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha()
  form.captcha = '' // 清空输入
}

// 表单数据
const form = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberPassword: false
})

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度应为 2-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码长度应为 3-20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && value.toUpperCase() !== captchaCode.value.toUpperCase()) {
          callback(new Error('验证码错误，请重新输入'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 从 localStorage 读取保存的账号密码
const loadRememberedAccount = () => {
  const saved = localStorage.getItem('smartFisheryAccount')
  if (saved) {
    try {
      const { username, password, remember } = JSON.parse(saved)
      if (remember) {
        form.username = username
        form.password = password
        form.rememberPassword = true
      }
    } catch (e) {
      console.error('读取保存账号失败', e)
    }
  }
}

// 保存账号密码到 localStorage
const saveAccount = () => {
  if (form.rememberPassword) {
    localStorage.setItem('smartFisheryAccount', JSON.stringify({
      username: form.username,
      password: form.password,
      remember: true
    }))
  } else {
    localStorage.removeItem('smartFisheryAccount')
  }
}

// 验证登录账号
const validateAccount = (username, password) => {
  if (username === VALID_ACCOUNT.username && password === VALID_ACCOUNT.password) {
    // 存储用户信息
    localStorage.setItem('userInfo', JSON.stringify({
      username: VALID_ACCOUNT.username,
      role: VALID_ACCOUNT.role,
      permissions: VALID_ACCOUNT.permissions,
      loginTime: new Date().toISOString()
    }))
    return true
  }
  return false
}

// 登录处理
const handleLogin = async () => {
  try {
    await formRef.value.validate()

    // 验证码校验
    if (form.captcha.toUpperCase() !== captchaCode.value.toUpperCase()) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }

    loading.value = true

    // 验证账号密码
    if (validateAccount(form.username, form.password)) {
      // 保存记住密码状态
      saveAccount()

      // 调用 store 登录方法（如果有后端接口）
      try {
        await authStore.login(form.username, form.password)
      } catch (error) {
        console.log('使用演示模式登录')
      }

      ElMessage.success(`欢迎回来，${form.username}！`)

      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error('账号或密码错误，请检查后重新输入')
      refreshCaptcha()
      form.captcha = ''
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '登录失败，请检查输入信息')
    }
  } finally {
    loading.value = false
  }
}

// 获取粒子样式
const getParticleStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${Math.random() * 5 + 5}s`
  }
}

// 组件挂载时加载保存的账号
onMounted(() => {
  loadRememberedAccount()
})
</script>

<style scoped>
.login-container {
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  overflow: hidden;
}

/* 动态波浪背景 */
.waves-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;
  left: 0;
  z-index: 0;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100% 100% 0 0;
  animation: wave 10s infinite linear;
}

.wave1 {
  bottom: 0;
  animation-duration: 8s;
  opacity: 0.6;
}

.wave2 {
  bottom: 20px;
  animation-duration: 12s;
  opacity: 0.4;
  animation-delay: -2s;
}

.wave3 {
  bottom: 40px;
  animation-duration: 16s;
  opacity: 0.2;
  animation-delay: -5s;
}

@keyframes wave {
  0% {
    transform: translateX(0) translateY(0);
  }

  50% {
    transform: translateX(-25%) translateY(-10px);
  }

  100% {
    transform: translateX(-50%) translateY(0);
  }
}

/* 粒子效果 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float 10s infinite ease-in-out;
  pointer-events: none;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }

  50% {
    transform: translateY(-50px) translateX(20px);
    opacity: 0.5;
  }
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.login-card {
  width: 460px;
  text-align: center;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
}

.login-header {
  text-align: center;
  color: #fff;
}

.login-header h1 {
  font-size: 26px;
  margin: 10px 0 5px;
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-header p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  font-size: 14px;
}

/* 玻璃态输入框 */
:deep(.glass-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: none;
}

:deep(.glass-input .el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.glass-input .el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.2);
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.2);
}

:deep(.glass-input .el-input__inner) {
  color: #fff;
}

:deep(.glass-input .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-input__prefix-inner) {
  color: rgba(255, 255, 255, 0.7);
}

/* 验证码样式 */
.captcha-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-code {
  width: 120px;
  height: 42px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  gap: 8px;
  backdrop-filter: blur(5px);
}

.captcha-code:hover {
  transform: scale(1.02);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
}

.captcha-text {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 4px;
  color: white;
  font-family: monospace;
}

.refresh-icon {
  color: white;
  font-size: 16px;
  transition: transform 0.3s ease;
}

.captcha-code:hover .refresh-icon {
  transform: rotate(180deg);
}

/* 复选框样式 */
:deep(.el-checkbox) {
  color: #fff;
}

:deep(.el-checkbox__label) {
  color: #fff;
}

:deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

/* 登录按钮 */
.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 演示提示 */
.demo-tip {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 表单项间距优化 */
:deep(.el-form-item) {
  margin-bottom: 22px;
}

/* 响应式 */
@media (max-width: 576px) {
  .login-card {
    width: 90%;
    margin: 0 20px;
  }

  .login-header h1 {
    font-size: 20px;
  }

  .captcha-code {
    width: 100px;
  }
}
</style>