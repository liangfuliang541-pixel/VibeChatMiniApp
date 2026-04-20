import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // 检查登录状态
    const token = Taro.getStorageSync('token')
    if (!token) {
      // 未登录，获取微信授权
      this.login()
    }
  }

  async login() {
    try {
      const { code } = await Taro.login({
        timeout: 5000
      })
      
      // 调用后端登录接口
      const res = await Taro.request({
        url: 'https://api.vibechat.com/v1/auth/wechat-login',
        method: 'POST',
        data: { code }
      })
      
      if (res.data.token) {
        Taro.setStorageSync('token', res.data.token)
        Taro.setStorageSync('vibeId', res.data.vibeId)
      }
    } catch (err) {
      console.error('登录失败:', err)
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
