/**
 * 时间格式化
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 1分钟内
  if (diff < 60 * 1000) return '刚刚'
  // 1小时内
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
  // 今天
  if (isSameDay(date, now)) {
    return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`
  }
  // 昨天
  const yesterday = new Date(now.getTime() - 86400000)
  if (isSameDay(date, yesterday)) {
    return `昨天 ${padZero(date.getHours())}:${padZero(date.getMinutes())}`
  }
  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  // 更早
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * 日期时间格式化（活动详情用）
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = padZero(date.getHours())
  const minute = padZero(date.getMinutes())
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 周${weekDay} ${hour}:${minute}`
}

/**
 * 相对时间（消息列表用）
 */
export function relativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 距离格式化
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1)}km`
  return `${Math.round(meters / 1000)}km`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}
