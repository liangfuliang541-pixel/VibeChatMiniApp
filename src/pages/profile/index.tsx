import { View, Text, Image, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface UserProfile {
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

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await Taro.request({
        url: 'https://api.vibechat.com/v1/user/profile',
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setProfile(res.data)
    } catch (err) {
      console.error('获取资料失败:', err)
    }
  }

  const logout = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('vibeId')
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  if (!profile) return null

  return (
    <View className='vibe-container profile-page'>
      {/* 用户信息卡片 */}
      <View className='profile-card'>
        <Image className='profile-avatar' src={profile.avatar} />
        <Text className='profile-name'>{profile.nickname}</Text>
        <Text className='profile-id'>ID: {profile.vibeId}</Text>
        <Text className='profile-bio'>{profile.bio || '这个人很懒，什么都没写'}</Text>
        
        <View className='profile-stats'>
          <View className='stat-item'>
            <Text className='stat-value'>{profile.resonanceCount}</Text>
            <Text className='stat-label'>同频次数</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{profile.trustScore}</Text>
            <Text className='stat-label'>信任分</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>{profile.city || '未知'}</Text>
            <Text className='stat-label'>城市</Text>
          </View>
        </View>
      </View>

      {/* 频率图谱 */}
      <View className='frequency-section'>
        <Text className='section-title'>我的频率</Text>
        <View className='frequency-chart'>
          <View className='frequency-bar'>
            <Text className='bar-label'>情绪</Text>
            <View className='bar-track'>
              <View 
                className='bar-fill emotion' 
                style={{ width: `${profile.frequency.emotion}%` }}
              />
            </View>
            <Text className='bar-value'>{profile.frequency.emotion}</Text>
          </View>
          <View className='frequency-bar'>
            <Text className='bar-label'>审美</Text>
            <View className='bar-track'>
              <View 
                className='bar-fill aesthetic' 
                style={{ width: `${profile.frequency.aesthetic}%` }}
              />
            </View>
            <Text className='bar-value'>{profile.frequency.aesthetic}</Text>
          </View>
          <View className='frequency-bar'>
            <Text className='bar-label'>节奏</Text>
            <View className='bar-track'>
              <View 
                className='bar-fill rhythm' 
                style={{ width: `${profile.frequency.rhythm}%` }}
              />
            </View>
            <Text className='bar-value'>{profile.frequency.rhythm}</Text>
          </View>
          <View className='frequency-bar'>
            <Text className='bar-label'>行为</Text>
            <View className='bar-track'>
              <View 
                className='bar-fill behavior' 
                style={{ width: `${profile.frequency.behavior}%` }}
              />
            </View>
            <Text className='bar-value'>{profile.frequency.behavior}</Text>
          </View>
        </View>
      </View>

      {/* 菜单列表 */}
      <View className='menu-section'>
        <View className='menu-item'>
          <Text className='menu-icon'>👥</Text>
          <Text className='menu-text'>我的频率</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-icon'>⭐</Text>
          <Text className='menu-text'>收藏的活动</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-icon'>⚙️</Text>
          <Text className='menu-text'>设置</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
      </View>

      {/* 退出登录 */}
      <Button className='logout-btn' onClick={logout}>
        退出登录
      </Button>
    </View>
  )
}
