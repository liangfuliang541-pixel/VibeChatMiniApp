import { View, Text } from '@tarojs/components'
import './EmptyState.scss'

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState(props: EmptyStateProps) {
  const { icon = '📭', title = '暂无内容', description, actionText, onAction } = props

  return (
    <View className='empty-state'>
      <Text className='empty-icon'>{icon}</Text>
      <Text className='empty-title'>{title}</Text>
      {description && <Text className='empty-desc'>{description}</Text>}
      {actionText && (
        <View className='empty-action' onClick={onAction}>
          <Text className='action-text'>{actionText}</Text>
        </View>
      )}
    </View>
  )
}
