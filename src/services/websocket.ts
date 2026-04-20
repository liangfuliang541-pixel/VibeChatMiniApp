type MessageHandler = (msg: any) => void

class WebSocketService {
  private ws: any = null
  private roomId: string = ''
  private onMessage: MessageHandler | null = null
  private reconnectCount: number = 0
  private maxReconnect: number = 5
  private heartbeatTimer: any = null

  connect(roomId: string, onMessage: MessageHandler) {
    this.roomId = roomId
    this.onMessage = onMessage

    const token = Taro.getStorageSync('token')
    if (!token) {
      console.error('WebSocket: 未登录')
      return
    }

    Taro.connectSocket({
      url: `wss://ws.vibechat.com/v1/interaction/${roomId}?token=${token}`,
      success: () => {
        console.log('WebSocket: 连接中...')
      },
      fail: (err) => {
        console.error('WebSocket: 连接失败', err)
        this.tryReconnect()
      }
    })

    Taro.onSocketOpen(() => {
      console.log('WebSocket: 已连接')
      this.reconnectCount = 0
      this.startHeartbeat()
    })

    Taro.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        if (data.type === 'pong') return
        this.onMessage?.(data)
      } catch (err) {
        console.error('WebSocket: 消息解析失败', err)
      }
    })

    Taro.onSocketClose(() => {
      console.log('WebSocket: 已断开')
      this.stopHeartbeat()
      this.tryReconnect()
    })

    Taro.onSocketError((err) => {
      console.error('WebSocket: 错误', err)
    })
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendRaw({ type: 'ping' })
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private tryReconnect() {
    if (this.reconnectCount >= this.maxReconnect) {
      console.log('WebSocket: 超过最大重连次数')
      return
    }
    this.reconnectCount++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000)
    console.log(`WebSocket: ${delay}ms 后重连 (${this.reconnectCount}/${this.maxReconnect})`)
    setTimeout(() => {
      this.connect(this.roomId, this.onMessage!)
    }, delay)
  }

  send(msg: any) {
    this.sendRaw({
      type: 'message',
      roomId: this.roomId,
      ...msg
    })
  }

  private sendRaw(data: any) {
    try {
      Taro.sendSocketMessage({
        data: JSON.stringify(data)
      })
    } catch (err) {
      console.error('WebSocket: 发送失败', err)
    }
  }

  disconnect() {
    this.stopHeartbeat()
    try {
      Taro.closeSocket()
    } catch (err) {
      // ignore
    }
    this.ws = null
    this.onMessage = null
    this.reconnectCount = this.maxReconnect // 阻止重连
  }
}

const wsService = new WebSocketService()

export function connectWebSocket(roomId: string, onMessage: MessageHandler) {
  wsService.connect(roomId, onMessage)
}

export function sendMessage(msg: any) {
  wsService.send(msg)
}

export function disconnectWebSocket() {
  wsService.disconnect()
}

export default wsService
