import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'

interface ChoiceItem {
  id: string
  imageUrl: string
  tag: string
}

export default function ChooseOne() {
  const router = useRouter()
  const { roomId } = router.params
  
  const [choices, setChoices] = useState<ChoiceItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [opponentIndex, setOpponentIndex] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [status, setStatus] = useState<'waiting' | 'choosing' | 'revealing' | 'done'>('waiting')

  useEffect(() => {
    fetchChoices()
    const ws = connectWebSocket()
    return () => ws.close()
  }, [])

  useEffect(() => {
    if (status === 'choosing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, status])

  const fetchChoices = async () => {
    try {
      const res = await Taro.request({
        url: `https://api.vibechat.com/v1/interaction/${roomId}/choices`,
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setChoices(res.data.choices)
      setStatus('choosing')
    } catch (err) {
      console.error('获取题目失败:', err)
    }
  }

  const connectWebSocket = () => {
    const ws = Taro.connectSocket({
      url: `wss://ws.vibechat.com/v1/interaction/${roomId}`
    })

    ws.onMessage((res) => {
      const data = JSON.parse(res.data as string)
      if (data.type === 'opponent_choice') {
        setOpponentIndex(data.choiceIndex)
      } else if (data.type === 'reveal') {
        setStatus('revealing')
        setTimeout(() => setStatus('done'), 3000)
      }
    })

    return ws
  }

  const submitChoice = (index: number) => {
    if (selectedIndex !== null) return
    
    setSelectedIndex(index)
    Taro.request({
      url: `https://api.vibechat.com/v1/interaction/${roomId}/choice`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` },
      data: { choiceIndex: index }
    })
  }

  const isMatch = selectedIndex !== null && opponentIndex !== null && selectedIndex === opponentIndex

  return (
    <View className='vibe-container interaction-page'>
      {/* 顶部状态 */}
      <View className='status-bar'>
        <Text className='timer'>{timeLeft}s</Text>
        <View className='progress-bar'>
          <View className='progress-fill' style={{ width: `${(timeLeft / 30) * 100}%` }} />
        </View>
      </View>

      {/* 题目 */}
      <View className='question-section'>
        <Text className='question-label'>此刻选一个</Text>
        <Text className='question-content'>你更喜欢哪一张？</Text>
      </View>

      {/* 图片选择 */}
      <View className='choices-container'>
        {choices.map((choice, index) => (
          <View
            key={choice.id}
            className={`choice-card ${
              selectedIndex === index ? 'selected' : ''
            } ${
              status === 'revealing' && opponentIndex === index ? 'opponent' : ''
            } ${
              status === 'revealing' && isMatch && selectedIndex === index ? 'match' : ''
            }`}
            onClick={() => status === 'choosing' && submitChoice(index)}
          >
            <Image className='choice-image' src={choice.imageUrl} mode='aspectFill' />
            <View className='choice-overlay'>
              <Text className='choice-tag'>{choice.tag}</Text>
            </View>
            {status === 'revealing' && selectedIndex === index && (
              <View className='choice-badge mine'>你</View>
            )}
            {status === 'revealing' && opponentIndex === index && (
              <View className='choice-badge opponent'>TA</View>
            )}
          </View>
        ))}
      </View>

      {/* 结果 */}
      {status === 'done' && (
        <View className='result-section'>
          {isMatch ? (
            <>
              <Text className='result-icon'>🎨</Text>
              <Text className='result-title'>审美同频！</Text>
              <Text className='result-desc'>你们选了同一张图</Text>
            </>
          ) : (
            <>
              <Text className='result-icon'>🌓</Text>
              <Text className='result-title'>不同的选择</Text>
              <Text className='result-desc'>审美差异也是魅力</Text>
            </>
          )}
        </View>
      )}
    </View>
  )
}
