import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface Message {
  id: string
  type: 'system' | 'user'
  content: string
  timestamp: string
  unread: boolean
  avatar?: string
  name?: string
}

export default function Message() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await Taro.request({
        url: 'https://api.vibechat.com/v1/messages',
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setMessages(res.data.messages)
    } catch (err) {
      console.error('获取消息失败:', err)
    }
  }

  const navigateToChat = (id: string) => {
    Taro.navigateTo({ url: `/pages/message/chat?id=${id}` })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <View className='vibe-container message-page'>
      {/* 头部 */}
      <View className='message-header'>
        <Text className='page-title'>消息</Text>
      </View>

      {/* 消息列表 */}
      <ScrollView className='message-list' scrollY>
        {messages.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>💬</Text>
            <Text className='empty-text'>还没有消息</Text>
            <Text className='empty-hint'>去共振，遇见同频的人</Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View 
              key={msg.id}
              className={`message-item ${msg.unread ? 'unread' : ''}`}
              onClick={() => msg.type === 'user' && navigateToChat(msg.id)}
            >
              {msg.type === 'system' ? (
                <View className='system-avatar'>
                  <Text>🔔</Text>
                </View>
              ) : (
                <Image className='user-avatar' src={msg.avatar || ''} />
              )}
              
              <View className='message-content'>
                <View className='message-top'>
                  <Text className='message-name'>
                    {msg.type === 'system' ? '系统通知' : msg.name}
                  </Text>
                  <Text className='message-time'>{formatTime(msg.timestamp)}</Text>
                </View>
                <Text className='message-text'>{msg.content}</Text>
              </View>
              
              {msg.unread && <View className='unread-dot' />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
