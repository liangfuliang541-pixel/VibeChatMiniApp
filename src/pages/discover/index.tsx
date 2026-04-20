import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

interface Activity {
  id: string
  title: string
  coverImage: string
  date: string
  location: string
  price: number
  vibeMatch: number
  tags: string[]
}

export default function Discover() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await Taro.request({
        url: 'https://api.vibechat.com/v1/activities',
        header: { 'Authorization': `Bearer ${Taro.getStorageSync('token')}` }
      })
      setActivities(res.data.activities)
    } catch (err) {
      console.error('获取活动失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const navigateToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/discover/detail?id=${id}` })
  }

  return (
    <View className='vibe-container discover-page'>
      {/* 头部 */}
      <View className='discover-header'>
        <Text className='page-title'>同城活动</Text>
        <Text className='page-subtitle'>和同频的人，做有趣的事</Text>
      </View>

      {/* 活动列表 */}
      <ScrollView 
        className='activity-list' 
        scrollY 
        enableBackToTop
        onScrollToLower={fetchActivities}
      >
        {activities.map((activity, index) => (
          <View 
            key={activity.id}
            className='activity-card'
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigateToDetail(activity.id)}
          >
            <Image 
              className='activity-cover' 
              src={activity.coverImage} 
              mode='aspectFill'
            />
            <View className='activity-content'>
              <View className='activity-tags'>
                {activity.tags.map(tag => (
                  <Text key={tag} className='tag'>{tag}</Text>
                ))}
              </View>
              <Text className='activity-title'>{activity.title}</Text>
              <View className='activity-meta'>
                <Text className='meta-item'>📅 {activity.date}</Text>
                <Text className='meta-item'>📍 {activity.location}</Text>
              </View>
              <View className='activity-footer'>
                <View className='vibe-match'>
                  <Text className='match-label'>频率匹配</Text>
                  <Text className='match-value'>{activity.vibeMatch}%</Text>
                </View>
                <Text className='activity-price'>
                  {activity.price === 0 ? '免费' : `¥${activity.price}`}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {loading && (
          <View className='loading-tip'>加载中...</View>
        )}
      </ScrollView>
    </View>
  )
}
