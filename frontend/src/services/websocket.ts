import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'like' | 'comment' | 'new_post' | 'user_online' | 'user_offline' | 'heartbeat'
  data: any
  timestamp: number
  userId?: string
}

// WebSocket连接状态
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting'
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private messageQueue: WebSocketMessage[] = []
  private userStore = useUserStore()
  private postsStore = usePostsStore()

  // 连接WebSocket
  connect() {
    if (this.status === ConnectionStatus.CONNECTING || this.status === ConnectionStatus.CONNECTED) {
      return
    }

    this.status = ConnectionStatus.CONNECTING
    
    try {
      // 使用相对路径，Vite会自动代理到后端
      const wsUrl = `ws://${window.location.host}/ws`
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = this.onOpen.bind(this)
      this.ws.onmessage = this.onMessage.bind(this)
      this.ws.onclose = this.onClose.bind(this)
      this.ws.onerror = this.onError.bind(this)
    } catch (error) {
      console.error('WebSocket连接失败:', error)
      this.status = ConnectionStatus.DISCONNECTED
    }
  }

  // 连接建立
  private onOpen() {
    console.log('WebSocket连接已建立')
    this.status = ConnectionStatus.CONNECTED
    this.reconnectAttempts = 0
    
    // 发送认证消息
    if (this.userStore.isLoggedIn) {
      this.send({
        type: 'auth',
        data: { token: this.userStore.token },
        timestamp: Date.now()
      })
    }
    
    // 开始心跳
    this.startHeartbeat()
    
    // 发送队列中的消息
    this.flushMessageQueue()
  }

  // 接收消息
  private onMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.handleMessage(message)
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }

  // 处理消息
  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'like':
        this.handleLikeMessage(message)
        break
      case 'comment':
        this.handleCommentMessage(message)
        break
      case 'new_post':
        this.handleNewPostMessage(message)
        break
      case 'user_online':
        this.handleUserOnlineMessage(message)
        break
      case 'user_offline':
        this.handleUserOfflineMessage(message)
        break
      case 'heartbeat':
        this.handleHeartbeatMessage(message)
        break
      default:
        console.log('未知消息类型:', message.type)
    }
  }

  // 处理点赞消息
  private handleLikeMessage(message: WebSocketMessage) {
    const { postId, likeCount, isLiked } = message.data
    const post = this.postsStore.posts.find(p => p.id === postId)
    if (post) {
      post.likeCount = likeCount
      post.isLiked = isLiked
    }
  }

  // 处理评论消息
  private handleCommentMessage(message: WebSocketMessage) {
    const { postId, commentCount } = message.data
    const post = this.postsStore.posts.find(p => p.id === postId)
    if (post) {
      post.commentCount = commentCount
    }
  }

  // 处理新帖子消息
  private handleNewPostMessage(message: WebSocketMessage) {
    const newPost = message.data
    // 将新帖子添加到列表开头
    this.postsStore.posts.unshift(newPost)
  }

  // 处理用户上线消息
  private handleUserOnlineMessage(message: WebSocketMessage) {
    console.log('用户上线:', message.data.username)
  }

  // 处理用户下线消息
  private handleUserOfflineMessage(message: WebSocketMessage) {
    console.log('用户下线:', message.data.username)
  }

  // 处理心跳消息
  private handleHeartbeatMessage(message: WebSocketMessage) {
    // 心跳响应，可以用于计算延迟
    const latency = Date.now() - message.timestamp
    console.log('心跳延迟:', latency, 'ms')
  }

  // 连接关闭
  private onClose(event: CloseEvent) {
    console.log('WebSocket连接已关闭:', event.code, event.reason)
    this.status = ConnectionStatus.DISCONNECTED
    this.stopHeartbeat()
    
    // 如果不是正常关闭，尝试重连
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  // 连接错误
  private onError(error: Event) {
    console.error('WebSocket连接错误:', error)
    this.status = ConnectionStatus.DISCONNECTED
  }

  // 发送消息
  send(message: WebSocketMessage) {
    if (this.status === ConnectionStatus.CONNECTED && this.ws) {
      this.ws.send(JSON.stringify(message))
    } else {
      // 如果未连接，将消息加入队列
      this.messageQueue.push(message)
    }
  }

  // 发送点赞消息
  sendLike(postId: string, isLiked: boolean) {
    this.send({
      type: 'like',
      data: { postId, isLiked },
      timestamp: Date.now(),
      userId: this.userStore.currentUser?.id
    })
  }

  // 发送评论消息
  sendComment(postId: string, content: string) {
    this.send({
      type: 'comment',
      data: { postId, content },
      timestamp: Date.now(),
      userId: this.userStore.currentUser?.id
    })
  }

  // 开始心跳
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.send({
        type: 'heartbeat',
        data: {},
        timestamp: Date.now()
      })
    }, 30000) // 每30秒发送一次心跳
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // 安排重连
  private scheduleReconnect() {
    this.status = ConnectionStatus.RECONNECTING
    this.reconnectAttempts++
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`${delay}ms后尝试重连 (第${this.reconnectAttempts}次)`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  // 发送队列中的消息
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }

  // 断开连接
  disconnect() {
    this.status = ConnectionStatus.DISCONNECTED
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close(1000, '用户主动断开')
      this.ws = null
    }
  }

  // 获取连接状态
  getStatus(): ConnectionStatus {
    return this.status
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED
  }
}

// 创建单例实例
export const websocketService = new WebSocketService()

// 导出类型
export type { WebSocketMessage }
