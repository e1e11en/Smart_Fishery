import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'admin'
  },
  actions: {
    login(username, password) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username && password) {
            const token = 'mock-token-' + Date.now()
            const userInfo = { username, role: username === 'admin' ? 'admin' : 'user' }
            this.token = token
            this.userInfo = userInfo
            localStorage.setItem('token', token)
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
            resolve({ token, userInfo })
          } else {
            reject(new Error('用户名或密码错误'))
          }
        }, 500)
      })
    },
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})