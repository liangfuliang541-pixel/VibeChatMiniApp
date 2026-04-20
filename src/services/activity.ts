import api from './api'

export interface Activity {
  id: string
  title: string
  cover: string
  description: string
  location: string
  address: string
  startTime: string
  endTime: string
  maxParticipants: number
  currentParticipants: number
  tags: string[]
  vibeScore: number
  host: {
    vibeId: string
    nickname: string
    avatar: string
  }
}

export interface ActivityListParams {
  page?: number
  pageSize?: number
  city?: string
  tag?: string
}

class ActivityService {
  /** 获取活动列表 */
  async getList(params?: ActivityListParams): Promise<{ list: Activity[]; total: number }> {
    const res = await api.get('/activities', params)
    return res.data
  }

  /** 获取活动详情 */
  async getDetail(id: string): Promise<Activity> {
    const res = await api.get(`/activities/${id}`)
    return res.data
  }

  /** 报名活动 */
  async join(id: string): Promise<void> {
    await api.post(`/activities/${id}/join`)
  }

  /** 取消报名 */
  async cancelJoin(id: string): Promise<void> {
    await api.post(`/activities/${id}/cancel`)
  }

  /** 收藏活动 */
  async favorite(id: string): Promise<void> {
    await api.post(`/activities/${id}/favorite`)
  }

  /** 取消收藏 */
  async unfavorite(id: string): Promise<void> {
    await api.delete(`/activities/${id}/favorite`)
  }

  /** 获取收藏列表 */
  async getFavorites(): Promise<Activity[]> {
    const res = await api.get('/activities/favorites')
    return res.data
  }
}

export const activityService = new ActivityService()
export default activityService
