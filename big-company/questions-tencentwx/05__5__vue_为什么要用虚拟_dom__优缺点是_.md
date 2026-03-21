# 5. vue 为什么要用虚拟 dom, 优缺点是？

**答案：**

**虚拟 DOM（Virtual DOM）是 Vue 和 React 的核心概念。**

**为什么使用虚拟 DOM：**

1. **提升性能**
   - 直接操作 DOM 性能开销大
   - 虚拟 DOM 是 JavaScript 对象，操作速度快
   - 通过 diff 算法找出最小变化，批量更新 DOM

2. **跨平台**
   - 虚拟 DOM 不依赖浏览器 DOM API
   - 可以渲染到不同平台（Web、Weex、小程序）

3. **开发体验**
   - 声明式编程
   - 不需要手动操作 DOM

**优点：**

```javascript
// 1. 性能优化
// 原生 DOM 操作（慢）
const div = document.createElement('div')
div.className = 'container'
document.body.appendChild(div)

// 虚拟 DOM 操作（快）
const vnode = {
  tag: 'div',
  props: { className: 'container' }
}

// 2. 批量更新
// 只在最后更新一次 DOM，而不是每次修改都更新
```

**缺点：**

1. **首次渲染较慢**
   - 需要创建虚拟 DOM 树
   - 对于简单应用，性能提升不明显

2. **内存占用**
   - 需要维护虚拟 DOM 树
   - 内存占用比直接操作 DOM 大

3. **不适合高频更新**
   - 每次更新都需要 diff 算法
   - 对于高频更新（如动画），直接操作 DOM 更好

**性能对比示例：**

```javascript
// 场景 1：首次渲染
// 原生 DOM：快
// 虚拟 DOM：慢（需要创建虚拟 DOM 树）

// 场景 2：局部更新
// 原生 DOM：慢（需要重新渲染整个列表）
// 虚拟 DOM：快（只更新变化的部分）

// 场景 3：高频更新
// 原生 DOM：快（直接更新）
// 虚拟 DOM：慢（每次都需要 diff）
```

**适用场景：**

- ✅ 复杂的单页应用
- ✅ 需要跨平台的应用
- ✅ 大型数据列表
- ❌ 简单的静态页面
- ❌ 高频动画
- ❌ 超高性能要求

---
