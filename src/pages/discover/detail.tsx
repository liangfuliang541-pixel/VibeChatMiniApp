import { View, Text, Image, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { formatDateTime } from '../../utils/format'
import './index.scss'

interface Activity {
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

export default function ActivityDetail() {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params || {}
    loadDetail(params.id || '')
  }, [])

  const loadDetail = async (id: string) => {
    try {
      const res = await Taro.request({
        url: `https://api.vibechat.com/v1/activities/${id}`,
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setActivity(res.data)
    } catch (err) {
      console.error('加载活动详情失败:', err)
    }
  }

  const joinActivity = async () => {
    if (!activity) return
    try {
      await Taro.request({
        url: `https://api.vibechat.com/v1/activities/${activity.id}/join`,
        method: 'POST',
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setIsJoined(true)
      Taro.showToast({ title: '报名成功', icon: 'success' })
    } catch (err) {
      Taro.showToast({ title: '报名失败', icon: 'none' })
    }
  }

  const openLocation = () => {
    if (!activity) return
    Taro.openLocation({
      latitude: 31.2304,
      longitude: 121.4737,
      name: activity.location,
      address: activity.address
    })
  }

  const shareActivity = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  if (!activity) return null

  const progressPercent = Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
  const isFull = activity.currentParticipants >= activity.maxParticipants

  return (
    <View className='vibe-container detail-page'>
      {/* 封面 */}
      <View className='cover-section'>
        <Image className='cover-image' src={activity.cover} mode='aspectFill' />
        <View className='cover-overlay'>
          <View className='vibe-score-badge'>
            <Text className='score-value'>{activity.vibeScore}%</Text>
            <Text className='score-label'>频率匹配</Text>
          </View>
        </View>
      </View>

      {/* 基本信息 */}
      <View className='info-section'>
        <Text className='activity-title'>{activity.title}</Text>
        <View className='tag-list'>
          {activity.tags.map((tag, idx) => (
            <View key={idx} className='tag-item'>
              <Text className='tag-text'>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 时间地点 */}
      <View className='detail-card'>
        <View className='detail-row' onClick={openLocation}>
          <Text className='detail-icon'>📍</Text>
          <View className='detail-content'>
            <Text className='detail-label'>地点</Text>
            <Text className='detail-value'>{activity.location}</Text>
          </View>
          <Text className='detail-arrow'>›</Text>
        </View>
        <View className='detail-row'>
          <Text className='detail-icon'>🕐</Text>
          <View className='detail-content'>
            <Text className='detail-label'>时间</Text>
            <Text className='detail-value'>{formatDateTime(activity.startTime)}</Text>
          </View>
        </View>
        <View className='detail-row'>
          <Text className='detail-icon'>👥</Text>
          <View className='detail-content'>
            <Text className='detail-label'>人数</Text>
            <Text className='detail-value'>{activity.currentParticipants}/{activity.maxParticipants}人</Text>
          </View>
        </View>
      </View>

      {/* 报名进度 */}
      <View className='progress-card'>
        <Text className='progress-title'>报名进度</Text>
        <View className='progress-bar'>
          <View 
            className='progress-fill' 
            style={{ width: `${progressPercent}%` }}
          />
        </View>
        <Text className='progress-text'>
          {isFull ? '已满员' : `还差${activity.maxParticipants - activity.currentParticipants}人成行`}
        </Text>
      </View>

      {/* 活动详情 */}
      <View className='desc-section'>
        <Text className='section-title'>活动详情</Text>
        <Text className='desc-text'>{activity.description}</Text>
      </View>

      {/* 发起人 */}
      <View className='host-card'>
        <Text className='section-title'>发起人</Text>
        <View className='host-info'>
          <Image className='host-avatar' src={activity.host.avatar || 'https://cdn.vibechat.com/default-avatar.png'} />
          <View className='host-detail'>
            <Text className='host-name'>{activity.host.nickname}</Text>
            <Text className='host-id'>ID: {activity.host.vibeId}</Text>
          </View>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className='bottom-bar'>
        <View className='share-btn' onClick={shareActivity}>
          <Text className='share-icon'>🔗</Text>
        </View>
        <Button 
          className={`join-btn ${isJoined ? 'joined' : ''} ${isFull ? 'full' : ''}`}
          onClick={joinActivity}
          disabled={isJoined || isFull}
        >
          {isJoined ? '已报名' : isFull ? '已满员' : '立即报名'}
        </Button>
      </View>
    </View>
  )
}
