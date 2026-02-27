# 22. 用 TypeScript 实现事件分发机制

**答案：**

```typescript
// 事件类型定义
type EventHandler<T = any> = (payload: T) => void;

// 事件分发器类
class EventEmitter<TEvents extends Record<string, any> = Record<string, any>> {
  private events: Map<keyof TEvents, Set<EventHandler>> = new Map();

  // 监听事件
  on<K extends keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[K]>
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  // 一次性监听
  once<K extends keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[K]>
  ): void {
    const onceHandler: EventHandler<TEvents[K]> = (payload) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  // 移除监听
  off<K extends keyof TEvents>(
    event: K,
    handler?: EventHandler<TEvents[K]>
  ): void {
    if (!handler) {
      this.events.delete(event);
    } else {
      this.events.get(event)?.delete(handler);
    }
  }

  // 触发事件
  emit<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]
  ): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      });
    }
  }
}

// 使用示例
interface AppEvents {
  'user:login': { userId: number; username: string };
  'user:logout': { userId: number };
  'data:update': { data: string; timestamp: number };
}

const emitter = new EventEmitter<AppEvents>();

emitter.on('user:login', (payload) => {
  console.log(`用户登录: ${payload.username}`);
});

emitter.emit('user:login', { userId: 1, username: 'Alice' });
```

**特性：**

- 类型安全的事件监听和触发
- 支持一次性监听（once）
- 支持移除监听器
- 错误处理机制

**应用场景：**

- 应用状态管理
- 模块间通信
- 插件系统
- 事件驱动架构

---

## 总结

以上是小米面试中常见的手写题目和场景题，涵盖了：

1. **JavaScript 基础**：`new`、`call/apply/bind`、`Promise`、`instanceof`、深拷贝、防抖节流
2. **算法数据结构**：快速排序、二分查找、LRU 缓存、发布订阅
3. **框架原理**：Vue 响应式、React Hooks、虚拟滚动
4. **场景题**：Vue/React 对比、状态管理、微前端、前端架构、Vite、TypeScript

建议练习掌握这些实现，并理解其背后的原理。
