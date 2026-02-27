# 15. Vue 和 React 有什么区别？React 16、17、18 有什么改动？并说下 Fiber

**答案：**

**Vue 和 React 的主要区别：**

1. **设计理念**
   - Vue：渐进式框架，易学易用，提供完整的解决方案
   - React：函数式思想，只关注视图层，灵活性强

2. **数据绑定**
   - Vue：双向绑定（v-model），自动响应
   - React：单向数据流，需要手动更新

3. **模板语法**
   - Vue：基于 HTML 的模板语法，指令（v-if、v-for）
   - React：JSX，JavaScript 的扩展

4. **组件化**
   - Vue：选项式 API（Options API）或组合式 API（Composition API）
   - React：函数组件 + Hooks

5. **状态管理**
   - Vue：Vuex/Pinia
   - React：Redux、Zustand、Context API

6. **性能优化**
   - Vue：依赖追踪，自动优化
   - React：需要手动优化（useMemo、useCallback）

**React 版本更新：**

**React 16：**
- 引入 Fiber 架构
- 支持 Error Boundaries
- 引入 Portal、Fragment
- 引入 Time Slicing（时间切片）
- 支持自定义 DOM 属性
- 改进 SSR

**React 17：**
- 无新特性，主要是底层改进
- 改进事件委托机制
- 支持 JSX 转换（无需引入 React）
- 改进 Suspense
- 移除部分过期 API

**React 18：**
- 引入并发模式（Concurrent Rendering）
- 自动批处理更新（Automatic Batching）
- 新的 Hooks：useId、useTransition、useDeferredValue
- Suspense 改进
- 新的客户端和服务器渲染 API
- StrictMode 改进

**Fiber 架构：**

Fiber 是 React 16 引入的新的协调算法，解决了以下问题：

1. **问题：React 15 的递归渲染**
   - 一旦开始渲染，无法中断
   - 大量 DOM 操作会阻塞主线程
   - 动画可能卡顿

2. **Fiber 的解决方案**
   - 将渲染工作分解为小单元
   - 可以中断和恢复渲染
   - 优先级调度
   - 时间切片

3. **Fiber 节点结构**
```javascript
const fiberNode = {
  type: 'div',           // 组件类型
  key: null,             // key
  props: {},             // props
  ref: null,             // ref
  
  // Fiber 树结构
  return: null,          // 父 Fiber
  child: null,           // 第一个子 Fiber
  sibling: null,         // 下一个兄弟 Fiber
  
  // 状态
  alternate: null,       // 对应的旧 Fiber（双缓冲）
  effectTag: 'PLACEMENT', // 副作用标记
  nextEffect: null,      // 下一个有副作用的 Fiber
  
  // 调度
  expirationTime: 0,     // 过期时间
  priorityLevel: 0       // 优先级
};
```

4. **Fiber 工作流程**
   - render 阶段：构建 Fiber 树，可中断
   - commit 阶段：提交变更到 DOM，不可中断

---
