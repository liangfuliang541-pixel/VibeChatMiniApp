export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/interaction/half-sentence',
    'pages/interaction/choose-one',
    'pages/interaction/heartbeat',
    'pages/interaction/result',
    'pages/discover/index',
    'pages/discover/detail',
    'pages/message/index',
    'pages/message/chat',
    'pages/profile/index',
    'pages/profile/settings',
    'pages/profile/my-frequency'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0A0A0F',
    navigationBarTitleText: 'VibeChat',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0A0A0F'
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#FFB366',
    backgroundColor: '#0A0A0F',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '共振',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/discover/index',
        text: '活动',
        iconPath: 'assets/tabbar/discover.png',
        selectedIconPath: 'assets/tabbar/discover-active.png'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息',
        iconPath: 'assets/tabbar/message.png',
        selectedIconPath: 'assets/tabbar/message-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png'
      }
    ]
  }
})
