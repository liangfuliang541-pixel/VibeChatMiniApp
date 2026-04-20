import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import './MatchAnimation.scss'

interface MatchAnimationProps {
  syncRate: number
  onComplete?: () => void
}

export default function MatchAnimation(props: MatchAnimationProps) {
  const { syncRate, onComplete } = props
  const [phase, setPhase] = useState<'pulse' | 'reveal' | 'done'>('pulse')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 1500)
    const t2 = setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const pulseColor = syncRate >= 70 ? '#FF6B8A' : syncRate >= 50 ? '#FFB366' : '#4ECDC4'

  return (
    <View className='match-animation'>
      {phase === 'pulse' && (
        <View className='pulse-container'>
          <View className='pulse-ring' style={{ borderColor: pulseColor }} />
          <View className='pulse-ring delay' style={{ borderColor: pulseColor }} />
          <View className='pulse-core' style={{ backgroundColor: pulseColor }}>
            <Text className='pulse-icon'>💓</Text>
          </View>
        </View>
      )}
      {phase === 'reveal' && (
        <View className='reveal-container'>
          <Text className='reveal-rate' style={{ color: pulseColor }}>{syncRate}%</Text>
          <Text className='reveal-text'>同频共振</Text>
        </View>
      )}
    </View>
  )
}
