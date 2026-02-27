# 10. 请手写实现发布订阅模式（EventEmitter），并说明其与观察者模式的区别

**答案：**

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  // 一次性订阅
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
  
  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return;
    
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
  
  // 触发事件
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
}

// 测试
const emitter = new EventEmitter();

emitter.on('test', (data) => {
  console.log('Test event:', data);
});

emitter.emit('test', 'Hello'); // 'Test event: Hello'
```

**与观察者模式的区别：**

- **发布订阅模式**：发布者和订阅者之间通过调度中心（EventEmitter）通信，彼此不知道对方的存在
- **观察者模式**：观察者和被观察者直接通信，观察者需要注册到被观察者上

---

## 框架原理
