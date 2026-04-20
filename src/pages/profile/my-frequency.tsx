import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface FrequencyProfile {
  emotion: number
  aesthetic: number
  rhythm: number
  behavior: number
  labels: {
    emotion: string
    aesthetic: string
    rhythm: string
    behavior: string
  }
  totalResonance: number
  matchHistory: Array<{
    date: string
    type: string
    syncRate: number
    peerNickname: string
  }>
  vibeType: string
  vibeTypeDesc: string
}

export default function MyFrequency() {
  const [profile, setProfile] = useState<FrequencyProfile | null>(null)

  useEffect(() => {
    loadFrequency()
  }, [])

  const loadFrequency = async () => {
    try {
      const res = await Taro.request({
        url: 'https://api.vibechat.com/v1/user/frequency',
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setProfile(res.data)
    } catch (err) {
      console.error('加载频率数据失败:', err)
    }
  }

  if (!profile) return null

  const dimensions = [
    { key: 'emotion', label: '情绪', icon: '💭', color: '#FFB366' },
    { key: 'aesthetic', label: '审美', icon: '🖼️', color: '#4ECDC4' },
    { key: 'rhythm', label: '节奏', icon: '🎵', color: '#FF6B8A' },
    { key: 'behavior', label: '行为', icon: '⚡', color: '#A78BFA' }
  ]

  return (
    <View className='vibe-container frequency-page'>
      {/* Vibe 类型 */}
      <View className='vibe-type-card'>
        <Text className='vibe-type-name'>{profile.vibeType}</Text>
        <Text className='vibe-type-desc'>{profile.vibeTypeDesc}</Text>
        <Text className='resonance-count'>已共振 {profile.totalResonance} 次</Text>
      </View>

      {/* 四维频率 */}
      <View className='frequency-section'>
        <Text className='section-title'>我的频率</Text>
        {dimensions.map(dim => {
          const value = profile[dim.key]
          const label = profile.labels[dim.key]
          return (
            <View key={dim.key} className='frequency-item'>
              <View className='freq-header'>
                <View className='freq-left'>
                  <Text className='freq-icon'>{dim.icon}</Text>
                  <Text className='freq-label'>{dim.label}</Text>
                </View>
                <Text className='freq-value' style={{ color: dim.color }}>{value}%</Text>
              </View>
              <View className='freq-bar-track'>
                <View className='freq-bar-fill' style={{ width: `${value}%`, background: `linear-gradient(90deg, ${dim.color}88, ${dim.color})` }} />
              </View>
              <Text className='freq-tag'>{label}</Text>
            </View>
          )
        })}
      </View>

      {/* 匹配历史 */}
      <View className='history-section'>
        <Text className='section-title'>共振记录</Text>
        {profile.matchHistory.map((item, idx) => (
          <View key={idx} className='history-item'>
            <View className='history-left'>
              <Text className='history-type'>
                {item.type === 'half_sentence' ? '💭' : item.type === 'choose_one' ? '🖼️' : '💓'}
              </Text>
              <View className='history-info'>
                <Text className='history-peer'>{item.peerNickname}</Text>
                <Text className='history-date'>{item.date}</Text>
              </View>
            </View>
            <Text className='history-sync' style={{
              color: item.syncRate >= 70 ? '#FF6B8A' : item.syncRate >= 50 ? '#FFB366' : '#4ECDC4'
            }}>{item.syncRate}%</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
