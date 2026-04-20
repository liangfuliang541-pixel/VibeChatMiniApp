# VibeChat MiniApp

VibeChat 多端小程序 - Taro 4 + React + TypeScript

## 技术栈

- **Taro 4.x** - 跨端框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **SCSS** - 样式预处理

## 项目结构

```
src/
├── app.tsx              # 应用入口
├── app.config.ts        # 全局配置
├── app.scss             # 全局样式
├── pages/               # 页面
│   ├── index/           # 首页（互动入口）
│   ├── interaction/     # 互动流程
│   │   ├── half-sentence.tsx   # 接下半句
│   │   ├── choose-one.tsx      # 此刻选一个
│   │   ├── heartbeat.tsx       # 同频心跳
│   │   └── result.tsx          # 结果页
│   ├── discover/        # 同城活动
│   ├── message/         # 消息
│   └── profile/         # 我的
├── components/          # 公共组件
├── utils/               # 工具函数
└── services/            # API 服务
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发微信小程序
npm run dev:weapp

# 开发支付宝小程序
npm run dev:alipay

# 开发抖音小程序
npm run dev:tt

# 构建微信小程序
npm run build:weapp

# 构建 H5
npm run build:h5
```

## 设计规范

### 色彩系统

| 变量 | 色值 | 用途 |
|------|------|------|
| $bg-primary | #0A0A0F | 主背景 |
| $bg-secondary | #14141A | 次级背景 |
| $bg-card | #1E1E26 | 卡片背景 |
| $accent-warm | #FFB366 | 暖色强调 |
| $accent-cool | #4ECDC4 | 冷色强调 |
| $accent-heart | #FF6B8A | 心跳强调 |
| $text-primary | #FFFFFF | 主文字 |
| $text-secondary | rgba(255,255,255,0.7) | 次级文字 |
| $text-tertiary | rgba(255,255,255,0.4) | 辅助文字 |

### 字体规范

- 标题: 40-48px, font-weight: 700
- 正文: 28-32px, font-weight: 400
- 辅助: 20-24px, font-weight: 400

## 与后端对接

### API 基础地址

```
https://api.vibechat.com/v1
```

### WebSocket 地址

```
wss://ws.vibechat.com/v1
```

### 主要接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /auth/wechat-login | POST | 微信登录 |
| /interaction/start | POST | 开始匹配 |
| /activities | GET | 获取活动列表 |
| /user/profile | GET | 获取用户资料 |
| /messages | GET | 获取消息列表 |

## 小程序限制处理

| 限制 | 应对方案 |
|------|---------|
| 包体积 < 2MB | 图片放 CDN |
| 蓝牙受限 | 碰一碰引导下载 App |
| 长按手势受限 | 同频心跳改为点击 |
| 后台运行受限 | 服务端推送 |

## 待完成

- [ ] 聊天页面
- [ ] 活动详情页
- [ ] 我的频率页面
- [ ] 设置页面
- [ ] 分享功能
- [ ] 埋点统计
