import Taro from '@tarojs/taro'

const TOKEN_KEY = 'token'
const VIBE_ID_KEY = 'vibeId'
const USER_PROFILE_KEY = 'userProfile'
const SETTINGS_KEY = 'settings'

class StorageService {
  /** Token */
  getToken(): string {
    return Taro.getStorageSync(TOKEN_KEY) || ''
  }

  setToken(token: string): void {
    Taro.setStorageSync(TOKEN_KEY, token)
  }

  removeToken(): void {
    Taro.removeStorageSync(TOKEN_KEY)
  }

  /** Vibe ID */
  getVibeId(): string {
    return Taro.getStorageSync(VIBE_ID_KEY) || ''
  }

  setVibeId(id: string): void {
    Taro.setStorageSync(VIBE_ID_KEY, id)
  }

  /** 用户资料缓存 */
  getUserProfile(): any {
    try {
      const data = Taro.getStorageSync(USER_PROFILE_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  setUserProfile(profile: any): void {
    Taro.setStorageSync(USER_PROFILE_KEY, JSON.stringify(profile))
  }

  /** 设置缓存 */
  getSettings(): any {
    try {
      const data = Taro.getStorageSync(SETTINGS_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  setSettings(settings: any): void {
    Taro.setStorageSync(SETTINGS_KEY, JSON.stringify(settings))
  }

  /** 清除所有数据 */
  clearAll(): void {
    Taro.clearStorageSync()
  }

  /** 仅清除用户数据（保留设置） */
  clearUserData(): void {
    Taro.removeStorageSync(TOKEN_KEY)
    Taro.removeStorageSync(VIBE_ID_KEY)
    Taro.removeStorageSync(USER_PROFILE_KEY)
  }
}

export const storage = new StorageService()
export default storage
