import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

// 互动类型
const INTERACTION_TYPES = [
  {
    id: 'half_sentence',
    name: '接下半句',
    desc: '一句话，测出你们的默契',
    icon: '💭',
    color: '#FFB366'
  },
  {
    id: 'choose_one',
    name: '此刻选一个',
    desc: '两张图，看出你们的审美',
    icon: '🖼️',
    color: '#4ECDC4'
  },
  {
    id: 'heartbeat',
    name: '同频心跳',
    desc: '30秒，感受彼此的频率',
    icon: '💓',
    color: '#FF6B8A'
  }
]

export default function Index() {
  const [vibeId, setVibeId] = useState('')
  const [isMatching, setIsMatching] = useState(false)

  useEffect(() => {
    const vid = Taro.getStorageSync('vibeId')
    setVibeId(vid)
  }, [])

  // 开始匹配
  const startMatching = async (type: string) => {
    setIsMatching(true)
    
    try {
      // 调用匹配 API
      const res = await Taro.request({
        url: `https://api.vibechat.com/v1/interaction/start`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${Taro.getStorageSync('token')}`
        },
        data: { type }
      })

      if (res.data.roomId) {
        // 跳转到对应互动页面
        Taro.navigateTo({
          url: `/pages/interaction/${type.replace('_', '-')}?roomId=${res.data.roomId}`
        })
      }
    } catch (err) {
      Taro.showToast({
        title: '匹配失败，请重试',
        icon: 'none'
      })
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <View className='vibe-container home-page'>
      {/* Logo 区域 */}
      <View className='logo-section'>
        <Text className='logo-text'>VibeChat</Text>
        <Text className='slogan'>先共振，再相遇</Text>
      </View>

      {/* 互动入口 */}
      <View className='interaction-section'>
        <Text className='section-title'>选择一个互动</Text>
        
        {INTERACTION_TYPES.map((item, index) => (
          <View 
            key={item.id}
            className='interaction-card'
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => !isMatching && startMatching(item.id)}
          >
            <View className='card-icon' style={{ backgroundColor: `${item.color}20` }}>
              <Text style={{ fontSize: '48px' }}>{item.icon}</Text>
            </View>
            <View className='card-content'>
              <Text className='card-title'>{item.name}</Text>
              <Text className='card-desc'>{item.desc}</Text>
            </View>
            <View className='card-arrow'>→</View>
          </View>
        ))}
      </View>

      {/* 底部提示 */}
      <View className='bottom-tip'>
        <Text className='tip-text'>每次互动约 30 秒</Text>
        <Text className='tip-text'>找到同频的人，开启对话</Text>
      </View>
    </View>
  )
}
