import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.vibechat.com/v1'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
}

interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

class ApiService {
  private getToken(): string {
    return Taro.getStorageSync('token') || ''
  }

  private buildHeader(custom?: Record<string, string>): Record<string, string> {
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...custom
    }
    const token = this.getToken()
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    return header
  }

  async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    const { url, method = 'GET', data, header: customHeader, showLoading = false, loadingText = '加载中...' } = options

    if (showLoading) {
      Taro.showLoading({ title: loadingText })
    }

    try {
      const res = await Taro.request({
        url: `${BASE_URL}${url}`,
        method,
        data,
        header: this.buildHeader(customHeader)
      })

      if (showLoading) {
        Taro.hideLoading()
      }

      const statusCode = res.statusCode
      if (statusCode === 200) {
        return res.data
      }

      if (statusCode === 401) {
        // Token 过期，重新登录
        Taro.removeStorageSync('token')
        Taro.reLaunch({ url: '/pages/index/index' })
        throw new Error('登录已过期')
      }

      throw new Error(res.data?.message || '请求失败')
    } catch (err) {
      if (showLoading) {
        Taro.hideLoading()
      }
      throw err
    }
  }

  get<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({ url, method: 'GET', data, ...options })
  }

  post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({ url, method: 'POST', data, ...options })
  }

  put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({ url, method: 'PUT', data, ...options })
  }

  delete<T = any>(url: string, data?: any, options?: Partial<RequestOptions>) {
    return this.request<T>({ url, method: 'DELETE', data, ...options })
  }
}

export const api = new ApiService()
export default api
