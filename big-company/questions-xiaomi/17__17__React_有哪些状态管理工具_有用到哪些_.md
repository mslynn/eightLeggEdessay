# 17. React 有哪些状态管理工具？有用到哪些？

**答案：**

**React 状态管理工具：**

1. **Context API**
   - React 内置，无需额外安装
   - 适合简单的跨组件状态
   - 缺点：更新会导致所有消费者重新渲染

2. **Redux**
   - 最成熟的状态管理方案
   - 单向数据流
   - 中间件支持（redux-thunk、redux-saga）
   - 适合大型应用

3. **MobX**
   - 响应式状态管理
   - 自动追踪依赖
   - 代码简洁

4. **Zustand**
   - 轻量级，API 简单
   - 支持 TypeScript
   - 无需 Provider

5. **Recoil**
   - Facebook 开发
   - 原子状态管理
   - 支持派生状态

6. **Jotai**
   - 原子状态管理（类似 Recoil）
   - 更轻量级
   - 灵活组合

7. **Valtio**
   - 基于 Proxy 的状态管理
   - 类似 MobX 但更简单

**选择建议：**

- **小型项目**：Context API 或 Zustand
- **中型项目**：Zustand 或 Jotai
- **大型项目**：Redux Toolkit 或 MobX
- **需要复杂异步逻辑**：Redux + Redux-Saga
- **需要强类型**：Zustand、Jotai、Recoil

---
