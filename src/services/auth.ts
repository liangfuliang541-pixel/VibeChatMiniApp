import api from './api'

export interface LoginResult {
  token: string
  vibeId: string
  isNewUser: boolean
  profile: {
    nickname: string
    avatar: string
    city: string
  }
}

export interface ProfileResult {
  vibeId: string
  nickname: string
  avatar: string
  bio: string
  city: string
  trustScore: number
  resonanceCount: number
  frequency: {
    emotion: number
    aesthetic: number
    rhythm: number
    behavior: number
  }
}

class AuthService {
  /** 微信登录 */
  async wechatLogin(): Promise<LoginResult> {
    const { code } = await Taro.login({ timeout: 5000 })
    const res = await api.post<LoginResult>('/auth/wechat-login', { code })
    if (res.data.token) {
      Taro.setStorageSync('token', res.data.token)
      Taro.setStorageSync('vibeId', res.data.vibeId)
    }
    return res.data
  }

  /** 获取用户资料 */
  async getProfile(): Promise<ProfileResult> {
    const res = await api.get<ProfileResult>('/user/profile')
    return res.data
  }

  /** 更新用户资料 */
  async updateProfile(data: Partial<ProfileResult>): Promise<void> {
    await api.put('/user/profile', data)
  }

  /** 检查登录状态 */
  isLoggedIn(): boolean {
    return !!Taro.getStorageSync('token')
  }

  /** 退出登录 */
  logout(): void {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('vibeId')
  }
}

export const authService = new AuthService()
export default authService
