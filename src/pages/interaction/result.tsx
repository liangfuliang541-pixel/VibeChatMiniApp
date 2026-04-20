import { View, Text, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface MatchResult {
  roomId: string
  peerVibeId: string
  peerNickname: string
  peerAvatar: string
  syncRate: number
  dimensionScores: {
    emotion: number
    aesthetic: number
    rhythm: number
    behavior: number
  }
  interactionType: string
  answers: Array<{
    question: string
    myAnswer: string
    peerAnswer: string
    matched: boolean
  }>
}

export default function Result() {
  const [result, setResult] = useState<MatchResult | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    // 从页面参数或API获取结果
    loadResult(params.roomId || '')
  }, [])

  const loadResult = async (roomId: string) => {
    try {
      const res = await Taro.request({
        url: `https://api.vibechat.com/v1/interaction/${roomId}/result`,
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setResult(res.data)
      
      // 高同步率展示庆祝动效
      if (res.data.syncRate >= 70) {
        setShowConfetti(true)
      }
    } catch (err) {
      console.error('获取结果失败:', err)
    }
  }

  const startChat = () => {
    if (!result) return
    Taro.navigateTo({
      url: `/pages/message/chat?roomId=${result.roomId}&peerNickname=${result.peerNickname}&peerAvatar=${result.peerAvatar}`
    })
  }

  const backToHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  const shareToFriend = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  if (!result) return null

  const syncLevel = result.syncRate >= 80 ? '超强' : result.syncRate >= 60 ? '同频' : result.syncRate >= 40 ? '有趣' : '探索'
  const syncColor = result.syncRate >= 80 ? '#FF6B8A' : result.syncRate >= 60 ? '#FFB366' : result.syncRate >= 40 ? '#4ECDC4' : '#A78BFA'

  return (
    <View className='vibe-container result-page'>
      {/* 庆祝动效 */}
      {showConfetti && <View className='confetti-overlay' />}

      {/* 同步率圆环 */}
      <View className='sync-circle-wrap'>
        <View className='sync-circle' style={{ borderColor: syncColor }}>
          <Text className='sync-rate' style={{ color: syncColor }}>{result.syncRate}%</Text>
          <Text className='sync-label'>同步率</Text>
        </View>
        <Text className='sync-level' style={{ color: syncColor }}>{syncLevel}共振</Text>
      </View>

      {/* 对方信息 */}
      <View className='peer-card'>
        <View className='peer-avatar-wrap'>
          <Text className='peer-avatar-emoji'>👤</Text>
        </View>
        <Text className='peer-name'>{result.peerNickname}</Text>
        <Text className='peer-id'>ID: {result.peerVibeId}</Text>
      </View>

      {/* 四维雷达 */}
      <View className='dimension-section'>
        <Text className='section-title'>频率对比</Text>
        <View className='dimension-list'>
          {[
            { key: 'emotion', label: '情绪', icon: '💭', value: result.dimensionScores.emotion },
            { key: 'aesthetic', label: '审美', icon: '🖼️', value: result.dimensionScores.aesthetic },
            { key: 'rhythm', label: '节奏', icon: '🎵', value: result.dimensionScores.rhythm },
            { key: 'behavior', label: '行为', icon: '⚡', value: result.dimensionScores.behavior }
          ].map(dim => (
            <View key={dim.key} className='dimension-item'>
              <Text className='dim-icon'>{dim.icon}</Text>
              <Text className='dim-label'>{dim.label}</Text>
              <View className='dim-bar-track'>
                <View className='dim-bar-fill' style={{ width: `${dim.value}%`, backgroundColor: syncColor }} />
              </View>
              <Text className='dim-value'>{dim.value}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 答案回顾 */}
      <View className='answers-section'>
        <Text className='section-title'>答案回顾</Text>
        {result.answers.map((ans, idx) => (
          <View key={idx} className='answer-card'>
            <Text className='answer-question'>{ans.question}</Text>
            <View className='answer-pair'>
              <View className={`answer-item ${ans.matched ? 'matched' : ''}`}>
                <Text className='answer-label'>我</Text>
                <Text className='answer-text'>{ans.myAnswer}</Text>
              </View>
              <View className={`answer-item ${ans.matched ? 'matched' : ''}`}>
                <Text className='answer-label'>TA</Text>
                <Text className='answer-text'>{ans.peerAnswer}</Text>
              </View>
            </View>
            {ans.matched && <Text className='match-badge'>✨ 一致</Text>}
          </View>
        ))}
      </View>

      {/* 操作按钮 */}
      <View className='action-section'>
        <Button className='vibe-btn vibe-btn-primary action-btn' onClick={startChat}>
          💬 开始对话
        </Button>
        <Button className='vibe-btn vibe-btn-secondary action-btn' onClick={shareToFriend}>
          🔗 分享结果
        </Button>
        <Button className='vibe-btn vibe-btn-secondary action-btn' onClick={backToHome}>
          🏠 继续共振
        </Button>
      </View>
    </View>
  )
}
