import { useState, useEffect } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'

interface Question {
  id: string
  content: string
  options: string[]
}

export default function HalfSentence() {
  const router = useRouter()
  const { roomId } = router.params
  
  const [question, setQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [opponentAnswer, setOpponentAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [status, setStatus] = useState<'waiting' | 'answering' | 'revealing' | 'done'>('waiting')

  useEffect(() => {
    // 获取题目
    fetchQuestion()
    
    // 建立 WebSocket 连接
    const ws = connectWebSocket()
    
    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (status === 'answering' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, status])

  const fetchQuestion = async () => {
    try {
      const res = await Taro.request({
        url: `https://api.vibechat.com/v1/interaction/${roomId}/question`,
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setQuestion(res.data)
      setStatus('answering')
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
      
      switch (data.type) {
        case 'opponent_answer':
          setOpponentAnswer(data.optionIndex)
          break
        case 'reveal':
          setStatus('revealing')
          setTimeout(() => setStatus('done'), 3000)
          break
      }
    })

    return ws
  }

  const submitAnswer = (index: number) => {
    if (selectedOption !== null) return
    
    setSelectedOption(index)
    
    // 发送答案
    Taro.request({
      url: `https://api.vibechat.com/v1/interaction/${roomId}/answer`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` },
      data: { optionIndex: index }
    })
  }

  const isMatch = selectedOption !== null && opponentAnswer !== null && selectedOption === opponentAnswer

  return (
    <View className='vibe-container interaction-page'>
      {/* 顶部状态 */}
      <View className='status-bar'>
        <Text className='timer'>{timeLeft}s</Text>
        <View className='progress-bar'>
          <View className='progress-fill' style={{ width: `${(timeLeft / 30) * 100}%` }} />
        </View>
      </View>

      {/* 题目区域 */}
      {question && (
        <View className='question-section'>
          <Text className='question-label'>接下半句</Text>
          <Text className='question-content'>{question.content}</Text>
        </View>
      )}

      {/* 选项区域 */}
      <View className='options-section'>
        {question?.options.map((option, index) => (
          <View
            key={index}
            className={`option-card ${
              selectedOption === index ? 'selected' : ''
            } ${
              status === 'revealing' && opponentAnswer === index ? 'opponent' : ''
            } ${
              status === 'revealing' && isMatch && selectedOption === index ? 'match' : ''
            }`}
            onClick={() => status === 'answering' && submitAnswer(index)}
          >
            <Text className='option-text'>{option}</Text>
            {status === 'revealing' && selectedOption === index && (
              <Text className='option-badge mine'>你</Text>
            )}
            {status === 'revealing' && opponentAnswer === index && (
              <Text className='option-badge opponent'>TA</Text>
            )}
          </View>
        ))}
      </View>

      {/* 结果展示 */}
      {status === 'done' && (
        <View className='result-section'>
          {isMatch ? (
            <View className='result-match'>
              <Text className='result-icon'>✨</Text>
              <Text className='result-title'>你们同频了！</Text>
              <Text className='result-desc'>默契值 +10</Text>
              <Button 
                className='vibe-btn vibe-btn-primary'
                onClick={() => Taro.navigateTo({ url: `/pages/message/chat?roomId=${roomId}` })}
              >
                开始对话
              </Button>
            </View>
          ) : (
            <View className='result-mismatch'>
              <Text className='result-icon'>💫</Text>
              <Text className='result-title'>这次没对上</Text>
              <Text className='result-desc'>下一个可能更同频</Text>
              <Button 
                className='vibe-btn vibe-btn-secondary'
                onClick={() => Taro.navigateBack()}
              >
                再试一次
              </Button>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
