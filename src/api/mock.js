import axios from 'axios'

// ---------- 池塘数据 ----------
export const ponds = [
  { id: 1, name: '1号生态塘', area: 5.2, depth: 2.5, fishCount: 28000, stockDate: '2025-01-10', variety: '大黄鱼' },
  { id: 2, name: '2号育苗池', area: 3.8, depth: 1.8, fishCount: 150000, stockDate: '2025-02-20', variety: '大黄鱼苗' },
  { id: 3, name: '3号成鱼池', area: 6.1, depth: 3.0, fishCount: 42000, stockDate: '2024-09-15', variety: '大黄鱼' },
  { id: 4, name: '4号循环水车间', area: 2.5, depth: 1.5, fishCount: 12000, stockDate: '2025-03-01', variety: '大黄鱼' }
]

// ---------- 水质历史数据 ----------
const generateHistory = (pondId) => {
  const times = []
  const doData = []
  const phData = []
  const tempData = []
  for (let i = 0; i < 24; i++) {
    const hour = `${i.toString().padStart(2, '0')}:00`
    times.push(hour)
    doData.push((5.5 + Math.random() * 2).toFixed(1))
    phData.push((7.0 + Math.random() * 0.8).toFixed(1))
    tempData.push((23 + Math.random() * 3).toFixed(1))
  }
  return { times, do: doData, ph: phData, temp: tempData }
}

export const waterHistory = {
  1: generateHistory(1),
  2: generateHistory(2),
  3: generateHistory(3),
  4: generateHistory(4)
}

// 实时水质 (当前时刻)
export const currentWaterQuality = {
  1: { do: 6.2, ph: 7.4, temp: 24.8, nh3: 0.12, time: new Date().toLocaleString() },
  2: { do: 5.9, ph: 7.6, temp: 25.1, nh3: 0.08, time: new Date().toLocaleString() },
  3: { do: 6.5, ph: 7.3, temp: 24.5, nh3: 0.15, time: new Date().toLocaleString() },
  4: { do: 7.0, ph: 7.2, temp: 23.9, nh3: 0.05, time: new Date().toLocaleString() }
}

// 预警规则与历史
export const warningRules = [
  { id: 1, name: '溶解氧下限', metric: 'do', threshold: 3.0, level: '严重', enabled: true },
  { id: 2, name: 'pH上限', metric: 'ph', threshold: 8.5, level: '警告', enabled: true },
  { id: 3, name: '水温上限', metric: 'temp', threshold: 30, level: '警告', enabled: true }
]

export const warningEvents = [
  { id: 1, type: '溶解氧过低', level: '严重', pond: '1号生态塘', value: 2.8, time: '2025-04-15 03:22', status: '已处理', handler: '张场长' },
  { id: 2, type: '台风预警', level: '紧急', pond: '全区域', value: '12级', time: '2025-04-14 17:00', status: '应急响应中', handler: '应急小组' },
  { id: 3, type: 'pH异常', level: '警告', pond: '2号育苗池', value: 8.9, time: '2025-04-13 09:15', status: '已忽略', handler: null }
]

// 生产记录
export const feedRecords = [
  { id: 1, date: '2025-04-15', pondId: 1, feedType: '浮性料', amount: 120, operator: '张三' },
  { id: 2, date: '2025-04-15', pondId: 2, feedType: '微粒子料', amount: 45, operator: '李四' },
  { id: 3, date: '2025-04-14', pondId: 3, feedType: '沉性料', amount: 98, operator: '王五' }
]

export const diseaseRecords = [
  { id: 1, pondId: 1, disease: '烂鳃病', occurDate: '2025-04-01', treatDate: '2025-04-03', status: '已治愈' },
  { id: 2, pondId: 2, disease: '寄生虫', occurDate: '2025-04-10', treatDate: '2025-04-12', status: '治疗中' }
]

// 溯源码批次
export const batches = [
  { batchId: 'HY202504001', pondId: 1, stockDate: '2025-01-10', harvestDate: '2025-04-10', weight: 12500, qrcode: 'https://example.com/qr/001' }
]

// 设备列表
export const devices = [
  { id: 1, name: '溶解氧传感器#01', location: '1号生态塘', type: '水质', status: '在线', lastData: '6.2 mg/L' },
  { id: 2, name: 'pH传感器#01', location: '1号生态塘', type: '水质', status: '在线', lastData: '7.4' },
  { id: 3, name: '智能投喂机#03', location: '2号育苗池', type: '投喂', status: '在线', lastData: '已投喂45kg' },
  { id: 4, name: '水下摄像头', location: '3号成鱼池', type: '视频', status: '离线', lastData: '无信号' }
]

// 用户列表（后台）
export const users = [
  { id: 1, username: 'admin', role: '超级管理员', status: '启用', lastLogin: '2025-04-16' },
  { id: 2, username: 'zhangchang', role: '场长', status: '启用', lastLogin: '2025-04-15' },
  { id: 3, username: 'lisi', role: '技术员', status: '停用', lastLogin: '2025-04-10' }
]

// 模拟 API 函数
export const mockApi = {
  getPonds: () => Promise.resolve(ponds),
  getWaterQuality: (pondId) => Promise.resolve(currentWaterQuality[pondId]),
  getWaterHistory: (pondId) => Promise.resolve(waterHistory[pondId]),
  getWarningEvents: () => Promise.resolve(warningEvents),
  getWarningRules: () => Promise.resolve(warningRules),
  getFeedRecords: () => Promise.resolve(feedRecords),
  getDiseaseRecords: () => Promise.resolve(diseaseRecords),
  getBatches: () => Promise.resolve(batches),
  getDevices: () => Promise.resolve(devices),
  getUsers: () => Promise.resolve(users),
  addFeedRecord: (record) => Promise.resolve({ id: Date.now(), ...record }),
  addDiseaseRecord: (record) => Promise.resolve({ id: Date.now(), ...record }),
  createWarningRule: (rule) => Promise.resolve({ id: Date.now(), ...rule })
}

// axios 拦截器（可选）
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})