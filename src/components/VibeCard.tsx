import { View, Text } from '@tarojs/components'
import './VibeCard.scss'

interface VibeCardProps {
  title?: string
  subtitle?: string
  icon?: string
  glow?: boolean
  onClick?: () => void
  children?: any
}

export default function VibeCard(props: VibeCardProps) {
  const { title, subtitle, icon, glow = false, onClick, children } = props

  return (
    <View
      className={`vibe-card-component ${glow ? 'vibe-glow' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {(icon || title) && (
        <View className='card-header'>
          {icon && <Text className='card-icon'>{icon}</Text>}
          <View className='card-titles'>
            {title && <Text className='card-title'>{title}</Text>}
            {subtitle && <Text className='card-subtitle'>{subtitle}</Text>}
          </View>
        </View>
      )}
      {children}
    </View>
  )
}
