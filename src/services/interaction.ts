import api from './api'

export interface MatchRoom {
  roomId: string
  type: string
  peerVibeId: string
  peerNickname: string
  peerAvatar: string
  status: 'waiting' | 'matched' | 'playing' | 'finished'
}

export interface Question {
  id: string
  type: 'half_sentence' | 'choose_one' | 'heartbeat'
  content: string
  options?: string[]
  images?: string[]
  timeLimit: number
}

export interface InteractionResult {
  roomId: string
  syncRate: number
  dimensionScores: {
    emotion: number
    aesthetic: number
    rhythm: number
    behavior: number
  }
  answers: Array<{
    question: string
    myAnswer: string
    peerAnswer: string
    matched: boolean
  }>
  peerVibeId: string
  peerNickname: string
  peerAvatar: string
}

class InteractionService {
  /** 开始匹配 */
  async startMatch(type: string): Promise<MatchRoom> {
    const res = await api.post<MatchRoom>('/interaction/start', { type }, { showLoading: true, loadingText: '匹配中...' })
    return res.data
  }

  /** 获取当前题目 */
  async getQuestion(roomId: string): Promise<Question> {
    const res = await api.get<Question>(`/interaction/${roomId}/question`)
    return res.data
  }

  /** 提交答案 */
  async submitAnswer(roomId: string, questionId: string, answer: string): Promise<void> {
    await api.post(`/interaction/${roomId}/answer`, { questionId, answer })
  }

  /** 提交心跳节奏 */
  async submitHeartbeat(roomId: string, beats: number[]): Promise<void> {
    await api.post(`/interaction/${roomId}/heartbeat`, { beats })
  }

  /** 获取互动结果 */
  async getResult(roomId: string): Promise<InteractionResult> {
    const res = await api.get<InteractionResult>(`/interaction/${roomId}/result`)
    return res.data
  }

  /** 取消匹配 */
  async cancelMatch(roomId: string): Promise<void> {
    await api.post(`/interaction/${roomId}/cancel`)
  }
}

export const interactionService = new InteractionService()
export default interactionService
