import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface SettingsState {
  notificationEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  privacyMode: boolean
  distanceVisible: boolean
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    notificationEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    privacyMode: false,
    distanceVisible: true
  })

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    // 同步到服务端
    Taro.request({
      url: 'https://api.vibechat.com/v1/user/settings',
      method: 'PUT',
      header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` },
      data: { [key]: !settings[key] }
    })
  }

  const clearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync()
          Taro.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  }

  const logout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('vibeId')
          Taro.reLaunch({ url: '/pages/index/index' })
        }
      }
    })
  }

  const openPrivacy = () => {
    Taro.navigateTo({ url: '/pages/profile/privacy' })
  }

  const openAbout = () => {
    Taro.showModal({
      title: '关于 VibeChat',
      content: 'VibeChat v1.0.0\n让同频的人，在线下相遇',
      showCancel: false
    })
  }

  const downloadApp = () => {
    Taro.setClipboardData({
      data: 'https://vibechat.com/download',
      success: () => {
        Taro.showToast({ title: '下载链接已复制', icon: 'success' })
      }
    })
  }

  return (
    <View className='vibe-container settings-page'>
      <Text className='page-title'>设置</Text>

      {/* 通知设置 */}
      <View className='settings-group'>
        <Text className='group-title'>通知</Text>
        <View className='setting-item'>
          <View className='setting-left'>
            <Text className='setting-icon'>🔔</Text>
            <Text className='setting-label'>消息通知</Text>
          </View>
          <View 
            className={`toggle ${settings.notificationEnabled ? 'active' : ''}`}
            onClick={() => toggleSetting('notificationEnabled')}
          >
            <View className='toggle-dot' />
          </View>
        </View>
        <View className='setting-item'>
          <View className='setting-left'>
            <Text className='setting-icon'>🔊</Text>
            <Text className='setting-label'>声音</Text>
          </View>
          <View 
            className={`toggle ${settings.soundEnabled ? 'active' : ''}`}
            onClick={() => toggleSetting('soundEnabled')}
          >
            <View className='toggle-dot' />
          </View>
        </View>
        <View className='setting-item'>
          <View className='setting-left'>
            <Text className='setting-icon'>📳</Text>
            <Text className='setting-label'>震动</Text>
          </View>
          <View 
            className={`toggle ${settings.vibrationEnabled ? 'active' : ''}`}
            onClick={() => toggleSetting('vibrationEnabled')}
          >
            <View className='toggle-dot' />
          </View>
        </View>
      </View>

      {/* 隐私设置 */}
      <View className='settings-group'>
        <Text className='group-title'>隐私</Text>
        <View className='setting-item'>
          <View className='setting-left'>
            <Text className='setting-icon'>👻</Text>
            <Text className='setting-label'>隐身模式</Text>
          </View>
          <View 
            className={`toggle ${settings.privacyMode ? 'active' : ''}`}
            onClick={() => toggleSetting('privacyMode')}
          >
            <View className='toggle-dot' />
          </View>
        </View>
        <View className='setting-item'>
          <View className='setting-left'>
            <Text className='setting-icon'>📍</Text>
            <Text className='setting-label'>显示距离</Text>
          </View>
          <View 
            className={`toggle ${settings.distanceVisible ? 'active' : ''}`}
            onClick={() => toggleSetting('distanceVisible')}
          >
            <View className='toggle-dot' />
          </View>
        </View>
      </View>

      {/* 其他 */}
      <View className='settings-group'>
        <Text className='group-title'>其他</Text>
        <View className='setting-item clickable' onClick={clearCache}>
          <View className='setting-left'>
            <Text className='setting-icon'>🗑️</Text>
            <Text className='setting-label'>清除缓存</Text>
          </View>
          <Text className='setting-arrow'>›</Text>
        </View>
        <View className='setting-item clickable' onClick={openPrivacy}>
          <View className='setting-left'>
            <Text className='setting-icon'>🔒</Text>
            <Text className='setting-label'>隐私政策</Text>
          </View>
          <Text className='setting-arrow'>›</Text>
        </View>
        <View className='setting-item clickable' onClick={openAbout}>
          <View className='setting-left'>
            <Text className='setting-icon'>ℹ️</Text>
            <Text className='setting-label'>关于 VibeChat</Text>
          </View>
          <Text className='setting-arrow'>›</Text>
        </View>
      </View>

      {/* 下载 App 提示 */}
      <View className='app-download-card'>
        <Text className='download-icon'>📱</Text>
        <View className='download-info'>
          <Text className='download-title'>下载 VibeChat App</Text>
          <Text className='download-desc'>解锁碰一碰等完整功能</Text>
        </View>
        <Button className='download-btn' onClick={downloadApp}>下载</Button>
      </View>

      {/* 退出登录 */}
      <Button className='logout-btn' onClick={logout}>退出登录</Button>

      <Text className='version-text'>VibeChat v1.0.0</Text>
    </View>
  )
}
