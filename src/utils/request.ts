import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.vibechat.com/v1'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  header?: Record<string, string>
}

/**
 * 轻量请求工具 - 服务层的快捷入口
 * 完整版请使用 services/api.ts 的 ApiService
 */
export async function request<T = any>(config: RequestConfig): Promise<T> {
  const token = Taro.getStorageSync('token') || ''
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.header,
  }
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  const res = await Taro.request({
    url: `${BASE_URL}${config.url}`,
    method: config.method || 'GET',
    data: config.data,
    header,
  })

  if (res.statusCode === 401) {
    Taro.removeStorageSync('token')
    Taro.reLaunch({ url: '/pages/index/index' })
    throw new Error('登录已过期')
  }

  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data?.data ?? res.data
  }

  throw new Error(res.data?.message || `请求失败 (${res.statusCode})`)
}

export function get<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'GET', data })
}

export function post<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'POST', data })
}

export function put<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'PUT', data })
}

export function del<T = any>(url: string, data?: any) {
  return request<T>({ url, method: 'DELETE', data })
}
