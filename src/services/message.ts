import api from './api'

export interface Conversation {
  roomId: string
  peerVibeId: string
  peerNickname: string
  peerAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface ChatMessage {
  id: string
  fromVibeId: string
  content: string
  type: 'text' | 'image' | 'card'
  createdAt: string
}

class MessageService {
  /** 获取会话列表 */
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get('/messages/conversations')
    return res.data
  }

  /** 获取聊天历史 */
  async getHistory(roomId: string, before?: string, limit: number = 50): Promise<ChatMessage[]> {
    const res = await api.get(`/messages/${roomId}`, { before, limit })
    return res.data
  }

  /** 发送消息 */
  async sendMessage(roomId: string, content: string, type: string = 'text'): Promise<ChatMessage> {
    const res = await api.post(`/messages/${roomId}/send`, { content, type })
    return res.data
  }

  /** 标记已读 */
  async markRead(roomId: string): Promise<void> {
    await api.post(`/messages/${roomId}/read`)
  }

  /** 获取未读数 */
  async getUnreadCount(): Promise<number> {
    const res = await api.get('/messages/unread-count')
    return res.data
  }
}

export const messageService = new MessageService()
export default messageService
