/*
 * @Author: dingxiuchen 2745250790@qq.com
 * @Date: 2026-03-17 20:43:23
 * @LastEditors: dingxiuchen 2745250790@qq.com
 * @FilePath: \build-ui\src\api\request.js
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router' // 引入路由，用于 401 踢回登录页

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// ==========================================
// 1. 请求拦截器：出门前带上钥匙 (Token)
// ==========================================
request.interceptors.request.use(
  config => {
    // 从本地存储掏出钥匙
    const token = localStorage.getItem('token')
    if (token) {
      // 按照 JWT 的国际惯例，加上 Bearer 前缀并塞进 Header
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// ==========================================
// 2. 响应拦截器：回家时检查有没有新钥匙
// ==========================================
request.interceptors.response.use(
  response => {
    // 【核心无感续期逻辑】：监听后端发来的 renewal-token
    // 注意：axios 会自动把 header 名字转成全小写，所以这里必须用小写
    const newToken = response.headers['renewal-token']

    if (newToken) {
      console.log('🎉 触发无感续期！接住新 Token:', newToken)
      // 覆盖本地的旧钥匙
      localStorage.setItem('token', newToken)
    }

    // 正常返回业务数据
    return response.data
  },
  error => {
    // 重点错误处理：如果后端返回 401 (未登录或 Token 彻底过期)
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 清理失效的旧数据
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 强制踢回登录页
      router.push('/login')
    } else {
      const message = error.response?.data?.message || error.message || '请求失败'
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

export default request