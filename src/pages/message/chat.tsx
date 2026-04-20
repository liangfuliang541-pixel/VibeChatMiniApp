import { View, Text, Input, Image } from '@tarojs/components'
import { useState, useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../../services/websocket'
import { formatTime } from '../../utils/format'
import './index.scss'

interface ChatMessage {
  id: string
  fromVibeId: string
  content: string
  type: 'text' | 'image' | 'card'
  createdAt: string
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [roomId, setRoomId] = useState('')
  const [peerNickname, setPeerNickname] = useState('')
  const [peerAvatar, setPeerAvatar] = useState('')
  const myVibeId = Taro.getStorageSync('vibeId')

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    const rid = params.roomId || ''
    const peer = params.peerNickname || '同频伙伴'
    const avatar = params.peerAvatar || ''
    setRoomId(rid)
    setPeerNickname(peer)
    setPeerAvatar(avatar)

    Taro.setNavigationBarTitle({ title: peer })

    // 加载历史消息
    loadHistory(rid)

    // 连接 WebSocket
    if (rid) {
      connectWebSocket(rid, (msg) => {
        setMessages(prev => [...prev, msg])
      })
    }

    return () => {
      disconnectWebSocket()
    }
  }, [])

  const loadHistory = async (rid: string) => {
    try {
      const res = await Taro.request({
        url: `https://api.vibechat.com/v1/messages/${rid}`,
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setMessages(res.data?.messages || [])
    } catch (err) {
      console.error('加载历史消息失败:', err)
    }
  }

  const handleSend = () => {
    if (!inputValue.trim() || !roomId) return

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      fromVibeId: myVibeId,
      content: inputValue.trim(),
      type: 'text',
      createdAt: new Date().toISOString()
    }

    sendMessage(msg)
    setMessages(prev => [...prev, msg])
    setInputValue('')
  }

  const handleImagePick = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      const tempPath = res.tempFilePaths[0]
      // 上传图片
      Taro.uploadFile({
        url: 'https://api.vibechat.com/v1/upload/image',
        filePath: tempPath,
        name: 'image',
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      }).then(uploadRes => {
        const data = JSON.parse(uploadRes.data)
        const msg: ChatMessage = {
          id: `msg_${Date.now()}`,
          fromVibeId: myVibeId,
          content: data.url,
          type: 'image',
          createdAt: new Date().toISOString()
        }
        sendMessage(msg)
        setMessages(prev => [...prev, msg])
      })
    })
  }

  return (
    <View className='chat-page'>
      {/* 消息列表 */}
      <View className='message-list'>
        {messages.map((msg) => (
          <View 
            key={msg.id}
            className={`message-item ${msg.fromVibeId === myVibeId ? 'mine' : 'peer'}`}
          >
            {msg.fromVibeId !== myVibeId && (
              <Image className='msg-avatar' src={peerAvatar || 'https://cdn.vibechat.com/default-avatar.png'} />
            )}
            <View className='msg-bubble'>
              {msg.type === 'image' ? (
                <Image className='msg-image' src={msg.content} mode='widthFix' onClick={() => {
                  Taro.previewImage({ urls: [msg.content], current: msg.content })
                }} />
              ) : (
                <Text className='msg-text'>{msg.content}</Text>
              )}
            </View>
            <Text className='msg-time'>{formatTime(msg.createdAt)}</Text>
          </View>
        ))}

        {messages.length === 0 && (
          <View className='empty-chat'>
            <Text className='empty-icon'>💬</Text>
            <Text className='empty-text'>开始你们的对话吧</Text>
          </View>
        )}
      </View>

      {/* 输入栏 */}
      <View className='input-bar'>
        <View className='input-bar-inner'>
          <View className='img-btn' onClick={handleImagePick}>
            <Text className='img-icon'>📷</Text>
          </View>
          <Input
            className='chat-input'
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder='说点什么...'
            confirmType='send'
            onConfirm={handleSend}
          />
          <View 
            className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
            onClick={handleSend}
          >
            <Text className='send-text'>发送</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
