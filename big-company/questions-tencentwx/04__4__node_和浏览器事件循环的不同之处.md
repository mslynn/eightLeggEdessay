# 4. node 和浏览器事件循环的不同之处

**答案：**

**事件循环（Event Loop）是 JavaScript 实现异步的机制，但在 Node.js 和浏览器中有所不同。**

**浏览器事件循环：**

```
┌───────────────────────┐
│     宏任务队列          │
├───────────────────────┤
│ 1. setTimeout         │
│ 2. setInterval        │
│ 3. setImmediate       │
│ 4. I/O                │
└───────────────────────┘
           ↓
┌───────────────────────┐
│  执行所有微任务          │
├───────────────────────┤
│ 1. Promise.then       │
│ 2. MutationObserver   │
│ 3. process.nextTick   │
└───────────────────────┘
           ↓
      UI 渲染
```

**Node.js 事件循环（Node 11+ 之前）：**

```
┌─────────────────────────┐
│      timers 阶段        │  执行 setTimeout / setInterval
├─────────────────────────┤
│  pending callbacks 阶段 │  执行 I/O 回调
├─────────────────────────┤
│  idle, prepare 阶段     │  内部使用
├─────────────────────────┤
│      poll 阶段         │  执行 I/O，获取新的 I/O 事件
├─────────────────────────┤
│       check 阶段       │  执行 setImmediate
├─────────────────────────┤
│  close callbacks 阶段  │  执行 close 事件回调
└─────────────────────────┘
    ↓ 每个阶段结束时执行微任务
```

**Node.js 事件循环（Node 11+ 之后）：**

```
行为与浏览器类似：
- 执行一个宏任务
- 执行所有微任务
- 重复
```

**代码示例对比：**

```javascript
console.log('1')

setTimeout(() => {
  console.log('2')
  Promise.resolve().then(() => console.log('3'))
}, 0)

Promise.resolve().then(() => console.log('4'))

console.log('5')
```

**浏览器输出：**
```
1
5
4
2
3
```

**Node 10 输出：**
```
1
5
4
2
3
```

**Node 11+ 输出：**
```
1
5
4
2
3
```

**主要区别：**

1. **阶段不同**
   - 浏览器：只有宏任务和微任务
   - Node.js：有 6 个阶段，每个阶段结束后执行微任务

2. **微任务执行时机**
   - 浏览器：每个宏任务后执行所有微任务
   - Node.js 11-：每个阶段结束后执行所有微任务
   - Node.js 11+：每个宏任务后执行所有微任务

3. **宏任务优先级**
   - 浏览器：setTimeout > setImmediate
   - Node.js：setImmediate > setTimeout（在 I/O 回调中）

```javascript
// Node.js 中
setImmediate(() => console.log('immediate'))
setTimeout(() => console.log('timeout'))
// 输出：immediate, timeout
```

---
