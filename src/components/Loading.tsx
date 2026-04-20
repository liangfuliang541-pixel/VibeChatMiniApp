import { View, Text } from '@tarojs/components'
import './Loading.scss'

interface LoadingProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
}

export default function Loading(props: LoadingProps) {
  const { text = '加载中...', size = 'medium' } = props

  const dotSize = size === 'small' ? '12px' : size === 'large' ? '24px' : '16px'

  return (
    <View className='loading-component'>
      <View className='loading-dots'>
        <View className='dot' style={{ width: dotSize, height: dotSize, animationDelay: '0s' }} />
        <View className='dot' style={{ width: dotSize, height: dotSize, animationDelay: '0.2s' }} />
        <View className='dot' style={{ width: dotSize, height: dotSize, animationDelay: '0.4s' }} />
      </View>
      {text && <Text className='loading-text'>{text}</Text>}
    </View>
  )
}
