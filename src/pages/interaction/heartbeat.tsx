import { useState, useEffect, useCallback } from 'react'
import { View, Text, Canvas } from '@tarojs/components'
import Taro, { useRouter, createCanvasContext } from '@tarojs/taro'
import './heartbeat.scss'

export default function Heartbeat() {
  const router = useRouter()
  const { roomId } = router.params
  
  const [myRhythm, setMyRhythm] = useState<number[]>([])
  const [opponentRhythm, setOpponentRhythm] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [status, setStatus] = useState<'waiting' | 'tapping' | 'revealing' | 'done'>('waiting')
  const [lastTapTime, setLastTapTime] = useState<number>(0)

  useEffect(() => {
    const ws = connectWebSocket()
    setStatus('tapping')
    return () => ws.close()
  }, [])

  useEffect(() => {
    if (status === 'tapping' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (status === 'tapping' && timeLeft === 0) {
      submitRhythm()
    }
  }, [timeLeft, status])

  // 绘制波形
  useEffect(() => {
    drawWaveform()
  }, [myRhythm, opponentRhythm])

  const connectWebSocket = () => {
    const ws = Taro.connectSocket({
      url: `wss://ws.vibechat.com/v1/interaction/${roomId}`
    })

    ws.onMessage((res) => {
      const data = JSON.parse(res.data as string)
      if (data.type === 'opponent_rhythm') {
        setOpponentRhythm(data.rhythm)
      } else if (data.type === 'reveal') {
        setStatus('revealing')
        setTimeout(() => setStatus('done'), 3000)
      }
    })

    return ws
  }

  const handleTap = () => {
    if (status !== 'tapping') return
    
    const now = Date.now()
    const interval = lastTapTime ? now - lastTapTime : 0
    
    if (interval > 200) { // 防抖
      setMyRhythm(prev => [...prev.slice(-19), interval])
      setLastTapTime(now)
      
      // 震动反馈
      Taro.vibrateShort()
    }
  }

  const submitRhythm = () => {
    Taro.request({
      url: `https://api.vibechat.com/v1/interaction/${roomId}/rhythm`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` },
      data: { rhythm: myRhythm }
    })
  }

  const drawWaveform = () => {
    const ctx = createCanvasContext('waveformCanvas')
    if (!ctx) return

    const width = 300
    const height = 150
    const centerY = height / 2

    ctx.clearRect(0, 0, width, height)

    // 绘制我的波形（暖色）
    if (myRhythm.length > 0) {
      ctx.strokeStyle = '#FFB366'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      myRhythm.forEach((interval, i) => {
        const x = (i / 20) * width
        const amplitude = Math.min(interval / 1000, 1) * 50
        const y = centerY - amplitude
        
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      
      ctx.stroke()
    }

    // 绘制对方波形（冷色）
    if (opponentRhythm.length > 0) {
      ctx.strokeStyle = '#4ECDC4'
      ctx.lineWidth = 3
      ctx.beginPath()
      
      opponentRhythm.forEach((interval, i) => {
        const x = (i / 20) * width
        const amplitude = Math.min(interval / 1000, 1) * 50
        const y = centerY + amplitude
        
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      
      ctx.stroke()
    }

    ctx.draw()
  }

  // 计算同步率
  const calculateSync = () => {
    if (myRhythm.length < 3 || opponentRhythm.length < 3) return 0
    
    const myAvg = myRhythm.reduce((a, b) => a + b, 0) / myRhythm.length
    const oppAvg = opponentRhythm.reduce((a, b) => a + b, 0) / opponentRhythm.length
    const diff = Math.abs(myAvg - oppAvg)
    
    return Math.max(0, 100 - diff / 10)
  }

  const syncRate = calculateSync()
  const isMatch = syncRate > 70

  return (
    <View className='vibe-container heartbeat-page'>
      {/* 顶部状态 */}
      <View className='status-bar'>
        <Text className='timer'>{timeLeft}s</Text>
        <View className='progress-bar'>
          <View className='progress-fill' style={{ width: `${(timeLeft / 30) * 100}%` }} />
        </View>
      </View>

      {/* 标题 */}
      <View className='heartbeat-header'>
        <Text className='heartbeat-label'>同频心跳</Text>
        <Text className='heartbeat-desc'>点击屏幕，打出你的节奏</Text>
      </View>

      {/* 波形可视化 */}
      <View className='waveform-container'>
        <Canvas 
          canvasId='waveformCanvas' 
          className='waveform-canvas'
          style={{ width: '300px', height: '150px' }}
        />
        <View className='waveform-legend'>
          <Text className='legend-item mine'>你</Text>
          <Text className='legend-item opponent'>TA</Text>
        </View>
      </View>

      {/* 点击区域 */}
      {status === 'tapping' && (
        <View className='tap-area' onClick={handleTap}>
          <View className={`tap-button ${myRhythm.length > 0 ? 'active' : ''}`}>
            <Text className='tap-text'>点击</Text>
          </View>
          <Text className='tap-hint'>跟随直觉，打出节奏</Text>
        </View>
      )}

      {/* 结果 */}
      {status === 'done' && (
        <View className='result-section'>
          <Text className='sync-rate'>{Math.round(syncRate)}%</Text>
          <Text className='sync-label'>同步率</Text>
          
          {isMatch ? (
            <>
              <Text className='result-icon'>💓</Text>
              <Text className='result-title'>心跳同频！</Text>
              <Text className='result-desc'>你们的节奏惊人地相似</Text>
            </>
          ) : (
            <>
              <Text className='result-icon'>🎵</Text>
              <Text className='result-title'>不同的节拍</Text>
              <Text className='result-desc'>差异也是一种和谐</Text>
            </>
          )}
        </View>
      )}
    </View>
  )
}
