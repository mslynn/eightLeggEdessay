# 腾讯WX面试题集锦（截止 2026 年初）

## 目录
1. [前端基础](#前端基础)
2. [算法题](#算法题)

---

## 前端基础

### 1. Vue 父子组件如何通信

**答案：**

Vue 组件间通信有多种方式：

**1. Props / $emit（最常用）**
```javascript
// 父组件
<template>
  <ChildComponent :message="parentMessage" @child-event="handleChildEvent" />
</template>

<script>
export default {
  data() {
    return {
      parentMessage: 'Hello from parent'
    }
  },
  methods: {
    handleChildEvent(data) {
      console.log('Received from child:', data)
    }
  }
}
</script>

// 子组件
<template>
  <div>{{ message }}</div>
  <button @click="sendToParent">Send to Parent</button>
</template>

<script>
export default {
  props: {
    message: String
  },
  methods: {
    sendToParent() {
      this.$emit('child-event', 'Hello from child')
    }
  }
}
</script>
```

**2. $refs（直接引用）**
```javascript
// 父组件
<template>
  <ChildComponent ref="child" />
  <button @click="callChildMethod">Call Child</button>
</template>

<script>
export default {
  methods: {
    callChildMethod() {
      this.$refs.child.childMethod()
    }
  }
}
</script>
```

**3. $parent / $children（不推荐）**
```javascript
// 子组件访问父组件
this.$parent.parentMethod()

// 父组件访问子组件
this.$children[0].childMethod()
```

**4. Provide / Inject（跨层级）**
```javascript
// 祖先组件
export default {
  provide() {
    return {
      theme: this.theme
    }
  }
}

// 后代组件
export default {
  inject: ['theme']
}
```

**5. $attrs / $listeners（透传）**
```javascript
// 中间组件
<template>
  <GrandChild v-bind="$attrs" v-on="$listeners" />
</template>
```

**6. Vuex（状态管理）**
```javascript
// 任何组件都可以访问
this.$store.commit('updateData', payload)
this.$store.dispatch('fetchData')
```

**7. EventBus（事件总线）**
```javascript
// 创建事件总线
const EventBus = new Vue()

// 发送事件
EventBus.$emit('custom-event', data)

// 监听事件
EventBus.$on('custom-event', (data) => {
  console.log(data)
})
```

---

### 2. webpack 做过哪些优化

**答案：**

**1. 构建速度优化**

```javascript
// webpack.config.js
module.exports = {
  // 缓存
  cache: {
    type: 'filesystem'
  },

  // 缩小构建范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },

  // 多进程构建
  parallelism: os.cpus().length - 1,

  // DLL 预编译
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(__dirname, 'dll', '[name]-manifest.json')
    })
  ]
}
```

**2. 打包体积优化**

```javascript
module.exports = {
  // Tree Shaking
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  },

  // 代码分割
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // 压缩
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },

  // 按需加载
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true
      }
    })
  ]
}
```

**3. 运行时优化**

```javascript
// 路由懒加载
const Home = () => import(/* webpackChunkName: "home" */ './views/Home.vue')

// 组件懒加载
components: {
  HeavyComponent: () => import('./HeavyComponent.vue')
}

// 预加载
const Home = () => import(/* webpackPrefetch: true */ './views/Home.vue')
```

**4. 其他优化**

```javascript
// 图片压缩
module: {
  rules: [
    {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: { progressive: true, quality: 65 },
            optipng: { enabled: false },
            pngquant: { quality: [0.65, 0.9], speed: 4 }
          }
        }
      ]
    }
  ]
}

// 开启 Gzip
const CompressionPlugin = require('compression-webpack-plugin')

plugins: [
  new CompressionPlugin({
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
    minRatio: 0.8
  })
]
```

---

### 3. tree-shaking 原理

**答案：**

**Tree Shaking 是一种通过移除 dead code（无用代码）来优化打包体积的技术。**

**工作原理：**

1. **静态分析**
   - webpack 在构建时会分析所有模块的 import 和 export
   - 标记哪些导出被使用，哪些没有被使用

2. **依赖关系图**
```javascript
// math.js
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

// main.js
import { add } from './math.js'

// webpack 分析：
// - subtract 没有被导入，标记为 dead code
// - add 被导入和使用，标记为 live code
```

3. **移除 Dead Code**
   - 在 production 模式下，webpack 会移除所有标记为 dead code 的导出
   - 通过 TerserPlugin 压缩代码

**Tree Shaking 的要求：**

```javascript
// ✅ 支持的写法（ES6 Module）
export const func1 = () => {}
export function func2() {}

// ❌ 不支持的写法
export default {
  func1: () => {},
  func2: () => {}
}
```

**配置 Side Effects：**

```javascript
// package.json
{
  "sideEffects": false // 所有代码都没有副作用，可以安全 tree-shaking
}

// 或者指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfill.js"
  ]
}
```

**注意事项：**

```javascript
// 有副作用的代码，不能被 tree-shaking
// 原因：虽然 add 没有被直接使用，但它修改了全局变量
let globalVar = 0
export function add() {
  globalVar++
}
```

---

### 4. node 和浏览器事件循环的不同之处

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

### 5. vue 为什么要用虚拟 dom, 优缺点是？

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

### 6. domdiff 如何比较？

**答案：**

**Diff 算法是虚拟 DOM 的核心，用于比较新旧虚拟 DOM 树，找出最小变化。**

**Vue 2 的 Diff 算法：**

```javascript
// 同层比较，时间复杂度 O(n)
function patch(oldVnode, newVnode) {
  // 1. 相同节点，比较子节点
  if (sameVnode(oldVnode, newVnode)) {
    patchVnode(oldVnode, newVnode)
  }
  // 2. 不同节点，替换
  else {
    const newElm = createElm(newVnode)
    const parent = oldVnode.elm.parentNode
    parent.insertBefore(newElm, oldVnode.elm)
    parent.removeChild(oldVnode.elm)
  }
}

function sameVnode(vnode1, vnode2) {
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment
  )
}
```

**列表 Diff 算法（双端比较）：**

```javascript
function updateChildren(oldCh, newCh) {
  let oldStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let newStartIdx = 0
  let newEndIdx = newCh.length - 1

  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 1. 旧开始 vs 新开始
    if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    }
    // 2. 旧结束 vs 新结束
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    }
    // 3. 旧开始 vs 新结束
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode)
      insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    }
    // 4. 旧结束 vs 新开始
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode)
      insertBefore(oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    }
    // 5. 乱序，查找 key
    else {
      const keyMap = createKeyMap(oldCh)
      const idx = keyMap[newStartVnode.key]
      if (idx) {
        const vnodeToMove = oldCh[idx]
        patchVnode(vnodeToMove, newStartVnode)
        oldCh[idx] = undefined
        insertBefore(vnodeToMove.elm, oldStartVnode.elm)
      } else {
        createElm(newStartVnode, insertBefore)
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
}
```

**Vue 3 的 Diff 算法（最长递增子序列）：**

```javascript
function diff(oldChildren, newChildren) {
  // 1. 预处理头部相同
  let i = 0
  while (oldChildren[i] === newChildren[i]) {
    i++
  }

  // 2. 预处理尾部相同
  let oldEnd = oldChildren.length - 1
  let newEnd = newChildren.length - 1
  while (oldChildren[oldEnd] === newChildren[newEnd]) {
    oldEnd--
    newEnd--
  }

  // 3. 处理中间部分
  if (i > oldEnd && i > newEnd) {
    // 全部相同
  } else if (i > oldEnd) {
    // 旧节点已遍历完，添加新节点
    mountChildren(newChildren.slice(i, newEnd + 1))
  } else if (i > newEnd) {
    // 新节点已遍历完，删除旧节点
    unmountChildren(oldChildren.slice(i, oldEnd + 1))
  } else {
    // 计算最长递增子序列
    const keyToNewIndexMap = new Map()
    for (let i = 0; i <= newEnd; i++) {
      keyToNewIndexMap.set(newChildren[i].key, i)
    }

    const seq = longestIncreasingSubsequence(newChildren.slice(i, newEnd + 1))
    patchChildren(oldChildren.slice(i, oldEnd + 1), newChildren.slice(i, newEnd + 1), seq)
  }
}
```

**Key 的重要性：**

```javascript
// ❌ 不使用 key，效率低
<li v-for="item in list">{{ item.name }}</li>

// ✅ 使用 key，效率高
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

---

### 7. 防抖跟节流的原理和应用场景

**答案：**

**防抖（Debounce）和节流（Throttle）是常用的性能优化技术。**

**防抖（Debounce）：**

```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null
  let isInvoked = false

  return function(...args) {
    const context = this

    const later = () => {
      timer = null
      if (!immediate && !isInvoked) {
        fn.apply(context, args)
      }
      isInvoked = false
    }

    const callNow = immediate && !timer

    clearTimeout(timer)
    timer = setTimeout(later, delay)

    if (callNow) {
      isInvoked = true
      fn.apply(context, args)
    }
  }
}

// 使用示例
const debouncedSearch = debounce((keyword) => {
  console.log('搜索:', keyword)
}, 500)

// 连续输入时，只在停止输入 500ms 后执行一次
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value)
})
```

**节流（Throttle）：**

```javascript
function throttle(fn, delay) {
  let lastTime = 0
  let timer = null

  return function(...args) {
    const context = this
    const now = Date.now()

    if (now - lastTime >= delay) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn.apply(context, args)
      lastTime = now
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args)
        lastTime = Date.now()
        timer = null
      }, delay - (now - lastTime))
    }
  }
}

// 使用示例
const throttledScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
}, 200)

// 每 200ms 最多执行一次
window.addEventListener('scroll', throttledScroll)
```

**两者的区别：**

| 特性 | 防抖 | 节流 |
|------|------|------|
| 执行时机 | 停止触发后执行 | 按固定间隔执行 |
| 执行次数 | 一次 | 多次 |
| 时间间隔 | 可变 | 固定 |

**应用场景：**

```javascript
// 1. 防抖应用
// 搜索框输入
searchInput.addEventListener('input', debounce(search, 500))

// 窗口 resize
window.addEventListener('resize', debounce(handleResize, 200))

// 表单验证
form.addEventListener('submit', debounce(validateForm, 300))

// 2. 节流应用
// 滚动事件
window.addEventListener('scroll', throttle(handleScroll, 100))

// 鼠标移动
canvas.addEventListener('mousemove', throttle(draw, 50))

// 按钮点击
button.addEventListener('click', throttle(handleClick, 1000))
```

**RAF 节流：**

```javascript
function throttleRAF(fn) {
  let ticking = false

  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        fn.apply(this, args)
        ticking = false
      })
      ticking = true
    }
  }
}

// 适用于动画
window.addEventListener('scroll', throttleRAF(updateAnimation))
```

---

### 8. 你对闭包的理解，闭包的应用场景

**答案：**

**闭包（Closure）是指函数能够记住并访问其词法作用域，即使函数在其词法作用域之外执行。**

**闭包的原理：**

```javascript
function outer() {
  const a = 10

  function inner() {
    console.log(a) // 可以访问外部函数的变量
  }

  return inner
}

const fn = outer()
fn() // 输出 10
```

**闭包的应用场景：**

**1. 数据私有化**

```javascript
function createCounter() {
  let count = 0

  return {
    increment() {
      count++
      return count
    },
    decrement() {
      count--
      return count
    },
    getCount() {
      return count
    }
  }
}

const counter = createCounter()
console.log(counter.increment()) // 1
console.log(counter.increment()) // 2
console.log(counter.getCount())  // 2
// count 变量无法直接访问，实现了数据私有化
```

**2. 函数柯里化**

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs))
      }
    }
  }
}

function add(a, b, c) {
  return a + b + c
}

const curriedAdd = curry(add)
console.log(curriedAdd(1)(2)(3)) // 6
console.log(curriedAdd(1, 2)(3)) // 6
```

**3. 模块模式**

```javascript
const myModule = (function() {
  const privateVar = 'private'

  function privateMethod() {
    console.log(privateVar)
  }

  return {
    publicMethod() {
      privateMethod()
    },
    getPrivateVar() {
      return privateVar
    }
  }
})()

myModule.publicMethod() // 'private'
console.log(myModule.getPrivateVar()) // 'private'
```

**4. 事件处理**

```javascript
// 保存状态
function setupButtons() {
  for (let i = 0; i < 5; i++) {
    document.getElementById(`btn${i}`).onclick = function() {
      console.log('Button', i) // 每个按钮输出不同的 i
    }
  }
}
```

**5. 防抖和节流**

```javascript
function debounce(fn, delay) {
  let timer = null

  return function(...args) {
    const context = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}
```

**6. 单例模式**

```javascript
function createSingleton() {
  let instance = null

  return {
    getInstance() {
      if (!instance) {
        instance = {
          data: 'singleton'
        }
      }
      return instance
    }
  }
}

const singleton = createSingleton()
const instance1 = singleton.getInstance()
const instance2 = singleton.getInstance()
console.log(instance1 === instance2) // true
```

**闭包的注意事项：**

```javascript
// 1. 内存泄漏
function createLeak() {
  const largeData = new Array(1000000).fill('data')

  return function() {
    console.log('Leak')
  }
}

const leak = createLeak()
// largeData 不会被释放，直到 leak 被销毁

// 2. 解决方案
function createNoLeak() {
  const largeData = new Array(1000000).fill('data')

  return function() {
    console.log('No Leak')
    // 使用完手动释放
    largeData.length = 0
  }
}
```

---

### 9. 有了解过 WebAssembly 吗？

**答案：**

**WebAssembly（简称 WASM）是一种可以在 Web 浏览器中运行的新型代码格式。**

**WebAssembly 的特点：**

1. **高性能**
   - 接近原生性能
   - 比 JavaScript 快 10-100 倍

2. **跨平台**
   - 可以在任何现代浏览器中运行
   - 不依赖特定语言

3. **安全**
   - 在沙箱环境中运行
   - 内存安全

4. **可与 JavaScript 互操作**
   - 可以调用 JavaScript 函数
   - JavaScript 可以调用 WebAssembly 函数

**WebAssembly 的使用场景：**

```javascript
// 1. 视频编解码
// 2. 图像处理
// 3. 3D 渲染
// 4. 游戏
// 5. 密码学
// 6. 科学计算
```

**WebAssembly 的使用方式：**

```javascript
// 1. 加载 WebAssembly 模块
fetch('simple.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes))
  .then(results => {
    const instance = results.instance
    console.log(instance.exports.add(1, 2)) // 3
  })

// 2. 使用 ESM 模块
import { add } from './simple.wasm'
console.log(add(1, 2)) // 3
```

**WebAssembly 的开发流程：**

```c
// 1. 编写 C/C++ 代码
// add.c
int add(int a, int b) {
    return a + b;
}
```

```bash
# 2. 编译为 WebAssembly
emcc add.c -s WASM=1 -o add.wasm

# 3. 生成 JavaScript 绑定
emcc add.c -s WASM=1 -o add.js
```

**WebAssembly 的性能对比：**

```javascript
// JavaScript 版本
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

// WebAssembly 版本（C 编译）
// int fibonacci(int n) {
//     if (n <= 1) return n;
//     return fibonacci(n - 1) + fibonacci(n - 2);
// }

// 性能测试
console.time('JS')
for (let i = 0; i < 1000; i++) {
  fibonacci(30)
}
console.timeEnd('JS') // 约 2000ms

console.time('WASM')
for (let i = 0; i < 1000; i++) {
  wasmExports.fibonacci(30)
}
console.timeEnd('WASM') // 约 200ms
```

**WebAssembly 的局限性：**

1. 不能直接操作 DOM
2. 不能访问浏览器的所有 API
3. 需要额外的编译步骤
4. 文件体积较大

**WebAssembly 的未来：**

1. **WASI（WebAssembly System Interface）**
   - 允许 WebAssembly 访问系统资源
   - 可以在浏览器之外运行

2. **WebAssembly GC**
   - 支持垃圾回收
   - 可以使用高级语言特性

3. **WebAssembly Threads**
   - 支持多线程
   - 提升并行计算能力

---

### 10. 浏览器事件循环

**答案：**

**事件循环（Event Loop）是 JavaScript 实现异步的机制。**

**事件循环的组成：**

```
┌─────────────────────────────────────────────┐
│              Call Stack (调用栈)             │
├─────────────────────────────────────────────┤
│  1. 同步代码                                 │
│  2. setTimeout/setInterval 回调             │
│  3. Promise 回调                            │
│  4. DOM 事件回调                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Web APIs (浏览器 API)             │
├─────────────────────────────────────────────┤
│  1. DOM 操作                                │
│  2. AJAX 请求                               │
│  3. 定时器                                  │
│  4. 事件监听                                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Task Queues (任务队列)            │
├─────────────────────────────────────────────┤
│  Macrotasks (宏任务)                        │
│  1. setTimeout/setInterval                  │
│  2. I/O                                     │
│  3. UI Rendering                            │
│                                             │
│  Microtasks (微任务)                        │
│  1. Promise.then/catch/finally              │
│  2. MutationObserver                        │
│  3. queueMicrotask                          │
└─────────────────────────────────────────────┘
```

**事件循环的执行顺序：**

```javascript
// 1. 执行同步代码
console.log('1')

// 2. 遇到异步任务，放入任务队列
setTimeout(() => {
  console.log('2')
}, 0)

Promise.resolve().then(() => {
  console.log('3')
})

// 3. 继续执行同步代码
console.log('4')

// 输出顺序：1, 4, 3, 2
```

**详细示例：**

```javascript
console.log('1')

setTimeout(() => {
  console.log('2')
  Promise.resolve().then(() => {
    console.log('3')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('4')
  setTimeout(() => {
    console.log('5')
  }, 0)
})

console.log('6')

// 输出：1, 6, 4, 2, 3, 5
```

**执行过程：**

```
1. 执行 console.log('1')  → 输出 1
2. 遇到 setTimeout，回调放入宏任务队列
3. 遇到 Promise.then，回调放入微任务队列
4. 执行 console.log('6')  → 输出 6
5. 同步代码执行完毕
6. 执行微任务队列
   - 执行 Promise.then → 输出 4
   - 遇到 setTimeout，回调放入宏任务队列
7. 微任务队列为空
8. 执行宏任务队列
   - 执行第一个 setTimeout → 输出 2
   - 遇到 Promise.then，回调放入微任务队列
   - 微任务队列不为空，继续执行微任务
   - 执行 Promise.then → 输出 3
9. 继续执行宏任务队列
   - 执行第二个 setTimeout → 输出 5
```

**async/await 的事件循环：**

```javascript
async function async1() {
  console.log('1')
  await async2()
  console.log('2')
}

async function async2() {
  console.log('3')
}

console.log('4')

setTimeout(() => {
  console.log('5')
}, 0)

async1()

console.log('6')

// 输出：4, 1, 3, 6, 2, 5
```

**执行过程：**

```
1. 执行 console.log('4')  → 输出 4
2. 遇到 setTimeout，回调放入宏任务队列
3. 执行 async1()
   - 执行 console.log('1')  → 输出 1
   - 执行 async2()
     - 执行 console.log('3')  → 输出 3
   - await 后面的代码放入微任务队列
4. 执行 console.log('6')  → 输出 6
5. 同步代码执行完毕
6. 执行微任务队列
   - 执行 console.log('2')  → 输出 2
7. 微任务队列为空
8. 执行宏任务队列
   - 执行 setTimeout → 输出 5
```

**事件循环的重要性：**

1. **避免阻塞**
   - 异步任务不会阻塞主线程
   - 保证页面响应

2. **提升性能**
   - 充分利用 CPU
   - 提高用户体验

3. **实现并发**
   - 同时处理多个任务
   - 不需要多线程

---

### 11. hybrid 开发 js 与原生交互的原理

**答案：**

**Hybrid 开发是指使用 Web 技术（HTML/CSS/JavaScript）开发移动应用，与原生功能进行交互。**

**JS 与原生交互的方式：**

**1. WebView 交互（iOS/Android）**

```javascript
// JavaScript 调用原生
// Android
if (window.AndroidInterface) {
  window.AndroidInterface.callNativeMethod('参数')
}

// iOS
if (window.webkit && window.webkit.messageHandlers) {
  window.webkit.messageHandlers.NativeMethod.postMessage('参数')
}
```

```java
// Android 原生调用 JavaScript
webView.loadUrl("javascript:callJsMethod('参数')")

// 或使用 evaluateJavascript
webView.evaluateJavascript("callJsMethod('参数')", null)
```

```swift
// iOS 原生调用 JavaScript
webView.evaluateJavaScript("callJsMethod('参数')") { result, error in
    print(result)
}
```

**2. Bridge 模式**

```javascript
// JavaScript Bridge
const bridge = {
  callNative(method, params, callback) {
    const message = {
      method,
      params,
      callbackId: generateCallbackId()
    }

    // 保存回调
    callbacks[message.callbackId] = callback

    // 发送消息到原生
    if (window.AndroidBridge) {
      window.AndroidBridge.postMessage(JSON.stringify(message))
    } else if (window.webkit.messageHandlers.NativeBridge) {
      window.webkit.messageHandlers.NativeBridge.postMessage(message)
    }
  },

  // 原生调用 JavaScript
  onNativeMessage(message) {
    const { callbackId, result } = message
    const callback = callbacks[callbackId]
    if (callback) {
      callback(result)
      delete callbacks[callbackId]
    }
  }
}

// 使用
bridge.callNative('getUserInfo', {}, (result) => {
  console.log('用户信息:', result)
})
```

**3. URL Scheme**

```javascript
// JavaScript 使用 URL Scheme 调用原生
function callNativeWithScheme(scheme, params) {
  const url = `${scheme}://action?${Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')}`

  // 创建隐藏的 iframe 触发
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)

  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 100)
}

// 使用
callNativeWithScheme('myapp', {
  action: 'openCamera',
  callback: 'callbackId'
})
```

```java
// Android 拦截 URL Scheme
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("myapp://")) {
            // 解析 URL，调用原生方法
            parseAndHandleUrl(url);
            return true;
        }
        return false;
    }
});
```

**4. JS 注入**

```javascript
// 原生注入 JavaScript 对象
// Android
webView.addJavascriptInterface(new Object() {
    @JavascriptInterface
    public String getDeviceInfo() {
        return "设备信息";
    }
}, "NativeInterface");

// JavaScript 调用
const deviceInfo = window.NativeInterface.getDeviceInfo()
```

**5. 通信协议设计**

```javascript
// 统一的通信协议
const protocol = {
  // 调用原生
  callNative(action, data, options = {}) {
    const message = {
      id: generateId(),
      action,
      data,
      timestamp: Date.now(),
      options
    }

    return new Promise((resolve, reject) => {
      // 保存 Promise
      pendingPromises[message.id] = { resolve, reject }

      // 发送消息
      postMessage(message)
    })
  },

  // 接收原生消息
  onNativeMessage(message) {
    const { id, result, error } = message
    const promise = pendingPromises[id]

    if (promise) {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(result)
      }
      delete pendingPromises[id]
    }
  }
}

// 使用
async function getUserInfo() {
  try {
    const userInfo = await protocol.callNative('getUserInfo', {})
    console.log('用户信息:', userInfo)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
```

**安全注意事项：**

```javascript
// 1. 验证来源
function validateOrigin(origin) {
  const allowedOrigins = ['https://example.com']
  return allowedOrigins.includes(origin)
}

// 2. 数据验证
function validateData(data) {
  if (typeof data !== 'object') {
    throw new Error('Invalid data format')
  }
  // 更多验证...
}

// 3. 防止 XSS
function sanitizeInput(input) {
  return input.replace(/<[^>]*>/g, '')
}
```

---

### 12. 假设现在有一个 web 版的微信，扫码登录的原理是什么，除了轮询还有其他方式吗？

**答案：**

**扫码登录的原理是使用二维码作为中间介质，建立移动端和 Web 端的连接。**

**扫码登录流程：**

```
1. Web 端生成二维码
   - 包含唯一 ID（uuid）
   - 显示在页面上

2. 用户用手机微信扫描二维码
   - 手机获取二维码中的 ID

3. 手机确认登录
   - 发送确认信息到服务器
   - 包含 ID 和用户凭证

4. Web 端收到确认
   - 建立登录会话
   - 跳转到首页
```

**实现代码：**

```javascript
// 1. 生成二维码
async function generateQRCode() {
  const uuid = generateUUID()
  const qrData = `wx://login?id=${uuid}`

  // 生成二维码图片
  const qrImage = await generateQRImage(qrData)

  // 显示二维码
  document.getElementById('qrcode').src = qrImage

  // 开始轮询
  pollLoginStatus(uuid)
}

// 2. 轮询登录状态
function pollLoginStatus(uuid) {
  const interval = setInterval(async () => {
    try {
      const response = await fetch(`/api/login/status?id=${uuid}`)
      const { status, token } = await response.json()

      switch (status) {
        case 'waiting': // 等待扫描
          console.log('等待扫描')
          break
        case 'scanned': // 已扫描，等待确认
          console.log('已扫描，等待确认')
          break
        case 'confirmed': // 已确认，登录成功
          clearInterval(interval)
          loginSuccess(token)
          break
        case 'expired': // 二维码过期
          clearInterval(interval)
          refreshQRCode()
          break
      }
    } catch (error) {
      console.error('轮询失败:', error)
    }
  }, 2000)
}

// 3. 登录成功处理
function loginSuccess(token) {
  // 保存 token
  localStorage.setItem('token', token)

  // 跳转到首页
  window.location.href = '/home'
}
```

**除了轮询的其他方式：**

**1. WebSocket**

```javascript
// 使用 WebSocket 实时推送
function connectWebSocket(uuid) {
  const ws = new WebSocket(`wss://example.com/login?id=${uuid}`)

  ws.onmessage = (event) => {
    const { status, token } = JSON.parse(event.data)

    switch (status) {
      case 'waiting':
        console.log('等待扫描')
        break
      case 'scanned':
        console.log('已扫描，等待确认')
        break
      case 'confirmed':
        ws.close()
        loginSuccess(token)
        break
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
    // 降级到轮询
    pollLoginStatus(uuid)
  }
}
```

**2. Server-Sent Events (SSE)**

```javascript
// 使用 SSE 实时推送
function connectSSE(uuid) {
  const eventSource = new EventSource(`/api/login/events?id=${uuid}`)

  eventSource.onmessage = (event) => {
    const { status, token } = JSON.parse(event.data)

    switch (status) {
      case 'waiting':
        console.log('等待扫描')
        break
      case 'scanned':
        console.log('已扫描，等待确认')
        break
      case 'confirmed':
        eventSource.close()
        loginSuccess(token)
        break
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE 错误:', error)
    // 降级到轮询
    pollLoginStatus(uuid)
  }
}
```

**3. Long Polling**

```javascript
// 长轮询
async function longPoll(uuid) {
  while (true) {
    try {
      const response = await fetch(`/api/login/status?id=${uuid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const { status, token } = await response.json()

      if (status === 'confirmed') {
        loginSuccess(token)
        break
      }

      if (status === 'expired') {
        refreshQRCode()
        break
      }
    } catch (error) {
      console.error('长轮询失败:', error)
      await sleep(2000)
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

**4. 混合方案**

```javascript
// 优先使用 WebSocket，降级到轮询
async function loginWithQRCode() {
  const uuid = generateUUID()
  const qrImage = await generateQRImage(`wx://login?id=${uuid}`)
  document.getElementById('qrcode').src = qrImage

  try {
    // 优先使用 WebSocket
    await connectWebSocket(uuid)
  } catch (error) {
    console.log('WebSocket 不可用，使用轮询')
    pollLoginStatus(uuid)
  }
}
```

**对比：**

| 方式 | 优点 | 缺点 |
|------|------|------|
| 轮询 | 简单，兼容性好 | 延迟高，资源浪费 |
| WebSocket | 实时，双向通信 | 需要服务器支持 |
| SSE | 实时，简单 | 单向通信 |
| 长轮询 | 减少请求次数 | 占用连接 |

**推荐方案：**

```javascript
// 根据环境选择最佳方案
function chooseStrategy() {
  // 检测 WebSocket 支持
  if (window.WebSocket) {
    return 'websocket'
  }
  // 检测 SSE 支持
  else if (window.EventSource) {
    return 'sse'
  }
  // 降级到轮询
  else {
    return 'polling'
  }
}

const strategy = chooseStrategy()
console.log('使用策略:', strategy)
```

---

### 13. 微信好友上限是 10000，如何保证好友列表渲染的性能？对于大量头像的加载有什么优化手段？

**答案：**

**对于大量数据的渲染和图片加载，需要使用多种优化技术。**

**好友列表渲染优化：**

**1. 虚拟滚动（Virtual Scroll）**

```javascript
class VirtualList {
  constructor(container, itemHeight, items, renderItem) {
    this.container = container
    this.itemHeight = itemHeight
    this.items = items
    this.renderItem = renderItem
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight)
    this.startIndex = 0
    this.endIndex = this.visibleCount

    this.init()
  }

  init() {
    // 创建占位元素
    this.phantom = document.createElement('div')
    this.phantom.style.height = `${this.items.length * this.itemHeight}px`
    this.container.appendChild(this.phantom)

    // 创建内容容器
    this.content = document.createElement('div')
    this.content.style.position = 'absolute'
    this.content.style.top = '0'
    this.content.style.left = '0'
    this.container.appendChild(this.content)

    this.bindEvents()
    this.render()
  }

  bindEvents() {
    this.container.addEventListener('scroll', () => {
      this.updateRange()
      this.render()
    })
  }

  updateRange() {
    const scrollTop = this.container.scrollTop
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = Math.min(
      this.startIndex + this.visibleCount,
      this.items.length
    )
  }

  render() {
    const visibleItems = this.items.slice(this.startIndex, this.endIndex)

    this.content.innerHTML = ''
    this.content.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`

    visibleItems.forEach((item, index) => {
      const actualIndex = this.startIndex + index
      const element = this.renderItem(item, actualIndex)
      element.style.height = `${this.itemHeight}px`
      this.content.appendChild(element)
    })
  }
}

// 使用
const container = document.getElementById('friend-list')
const friends = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `好友 ${i}`,
  avatar: `https://example.com/avatar/${i}.png`
}))

const virtualList = new VirtualList(
  container,
  60, // 每行高度
  friends,
  (friend, index) => {
    const div = document.createElement('div')
    div.className = 'friend-item'
    div.innerHTML = `
      <img src="${friend.avatar}" alt="${friend.name}" loading="lazy">
      <span>${friend.name}</span>
    `
    return div
  }
)
```

**2. 分页加载**

```javascript
class PaginationList {
  constructor(container, pageSize, totalItems, loadPage) {
    this.container = container
    this.pageSize = pageSize
    this.totalItems = totalItems
    this.loadPage = loadPage
    this.currentPage = 0
    this.loading = false

    this.init()
  }

  async init() {
    await this.loadMore()

    // 监听滚动，加载更多
    this.container.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.container
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        this.loadMore()
      }
    })
  }

  async loadMore() {
    if (this.loading) return

    this.loading = true
    const items = await this.loadPage(this.currentPage, this.pageSize)

    items.forEach(item => {
      const element = this.renderItem(item)
      this.container.appendChild(element)
    })

    this.currentPage++
    this.loading = false
  }

  renderItem(item) {
    const div = document.createElement('div')
    div.className = 'friend-item'
    div.innerHTML = `
      <img src="${item.avatar}" alt="${item.name}" loading="lazy">
      <span>${item.name}</span>
    `
    return div
  }
}

// 使用
const paginationList = new PaginationList(
  document.getElementById('friend-list'),
  20, // 每页数量
  10000, // 总数量
  async (page, size) => {
    const response = await fetch(`/api/friends?page=${page}&size=${size}`)
    return response.json()
  }
)
```

**头像加载优化：**

**1. 懒加载**

```javascript
// 使用 Intersection Observer
const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.dataset.src
        img.src = src
        img.removeAttribute('data-src')
        observer.unobserve(img)
      }
    })
  })

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
  })
}

// 使用
<img data-src="avatar.png" alt="Avatar" loading="lazy">
```

**2. 图片预加载**

```javascript
// 预加载即将显示的图片
const preloadImages = (urls) => {
  urls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

// 在滚动时预加载
const container = document.getElementById('friend-list')
container.addEventListener('scroll', () => {
  const { scrollTop, clientHeight } = container
  const preloadIndex = Math.floor((scrollTop + clientHeight + 500) / 60)

  if (preloadIndex < friends.length) {
    preloadImages([
      friends[preloadIndex].avatar,
      friends[preloadIndex + 1].avatar,
      friends[preloadIndex + 2].avatar
    ])
  }
})
```

**3. 图片压缩和裁剪**

```javascript
// 请求不同尺寸的图片
function getAvatarUrl(url, size) {
  const urlObj = new URL(url)
  urlObj.searchParams.set('size', size)
  return urlObj.toString()
}

// 根据设备像素比选择尺寸
function getOptimalSize() {
  const dpr = window.devicePixelRatio || 1
  return dpr > 1 ? 200 : 100
}

// 使用
const size = getOptimalSize()
const avatarUrl = getAvatarUrl(friend.avatar, size)
```

**4. 图片缓存**

```javascript
// 使用 Service Worker 缓存图片
const cacheImages = async (urls) => {
  const cache = await caches.open('avatar-cache')
  await cache.addAll(urls)
}

// 优先从缓存加载
async function loadImage(url) {
  const cache = await caches.open('avatar-cache')
  const cachedResponse = await cache.match(url)

  if (cachedResponse) {
    return cachedResponse
  }

  const response = await fetch(url)
  await cache.put(url, response.clone())
  return response
}
```

**5. 占位符和骨架屏**

```javascript
// 显示骨架屏
function renderSkeleton() {
  return `
    <div class="skeleton-item">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-name"></div>
    </div>
  `
}

// 图片加载失败时的占位符
img.onerror = function() {
  this.src = 'placeholder.png'
}
```

**6. 使用 WebP 格式**

```javascript
// 检测 WebP 支持
function supportsWebP() {
  return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
}

// 使用最佳格式
function getOptimalFormat(url) {
  if (supportsWebP()) {
    return url.replace(/\.(png|jpg|jpeg)$/, '.webp')
  }
  return url
}
```

**综合优化方案：**

```javascript
class OptimizedFriendList {
  constructor(container, friends) {
    this.container = container
    this.friends = friends
    this.visibleCount = 20
    this.renderedCount = 0
    this.loadedImages = new Set()

    this.init()
  }

  init() {
    // 1. 虚拟滚动
    this.setupVirtualScroll()

    // 2. 懒加载
    this.setupLazyLoading()

    // 3. 图片预加载
    this.setupImagePreload()

    // 4. 初始渲染
    this.renderItems(0, this.visibleCount)
  }

  setupVirtualScroll() {
    // 虚拟滚动逻辑
  }

  setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src
          this.loadImage(img, src)
          imageObserver.unobserve(img)
        }
      })
    })

    // 观察所有图片
  }

  setupImagePreload() {
    this.container.addEventListener('scroll', () => {
      const visibleIndex = this.getVisibleIndex()
      this.preloadImages(visibleIndex)
    })
  }

  loadImage(img, src) {
    // 1. 检查缓存
    if (this.loadedImages.has(src)) {
      img.src = src
      return
    }

    // 2. 使用最佳格式
    const optimizedSrc = this.getOptimalFormat(src)

    // 3. 加载图片
    img.src = optimizedSrc

    // 4. 添加到缓存
    this.loadedImages.add(optimizedSrc)
  }

  preloadImages(startIndex) {
    const endIndex = startIndex + 5
    for (let i = startIndex; i < endIndex && i < this.friends.length; i++) {
      const avatarUrl = this.friends[i].avatar
      if (!this.loadedImages.has(avatarUrl)) {
        const img = new Image()
        img.src = this.getOptimalFormat(avatarUrl)
        this.loadedImages.add(avatarUrl)
      }
    }
  }

  getOptimalFormat(url) {
    if (this.supportsWebP()) {
      return url.replace(/\.(png|jpg|jpeg)$/, '.webp')
    }
    return url
  }

  supportsWebP() {
    return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
  }
}
```

---

### 14. 如何在不不用对所有好友都进行一次遍历的情况下找到匹配的人名？

**答案：**

**使用索引和搜索算法可以避免遍历所有数据。**

**1. 建立索引**

```javascript
class FriendIndex {
  constructor(friends) {
    this.friends = friends
    this.nameIndex = new Map()
    this.pinyinIndex = new Map()
    this.buildIndex()
  }

  buildIndex() {
    this.friends.forEach((friend, index) => {
      // 建立名字索引
      this.nameIndex.set(friend.name.toLowerCase(), index)

      // 建立拼音索引
      const pinyin = this.convertToPinyin(friend.name)
      pinyin.forEach((py, i) => {
        const prefix = py.substring(0, i + 1)
        if (!this.pinyinIndex.has(prefix)) {
          this.pinyinIndex.set(prefix, new Set())
        }
        this.pinyinIndex.get(prefix).add(index)
      })
    })
  }

  // 转换为拼音（简化版）
  convertToPinyin(name) {
    // 实际实现需要使用拼音库
    return name.split('').map(char => this.getPinyin(char))
  }

  getPinyin(char) {
    // 简化的拼音映射
    const pinyinMap = {
      '张': 'zhang',
      '李': 'li',
      '王': 'wang'
      // ... 更多映射
    }
    return pinyinMap[char] || char
  }

  search(keyword) {
    const results = []

    // 1. 精确匹配
    if (this.nameIndex.has(keyword.toLowerCase())) {
      results.push(this.friends[this.nameIndex.get(keyword.toLowerCase())])
      return results
    }

    // 2. 前缀匹配
    const keywordLower = keyword.toLowerCase()
    for (const [name, index] of this.nameIndex) {
      if (name.startsWith(keywordLower)) {
        results.push(this.friends[index])
      }
    }

    // 3. 拼音匹配
    if (this.pinyinIndex.has(keyword.toLowerCase())) {
      const indices = this.pinyinIndex.get(keyword.toLowerCase())
      indices.forEach(index => {
        results.push(this.friends[index])
      })
    }

    return results
  }
}

// 使用
const friends = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '张伟' }
]

const friendIndex = new FriendIndex(friends)
const results = friendIndex.search('张')
console.log(results) // [{ id: 1, name: '张三' }, { id: 4, name: '张伟' }]
```

**2. 使用 Trie 树**

```javascript
class TrieNode {
  constructor() {
    this.children = new Map()
    this.isEnd = false
    this.indices = new Set()
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  insert(word, index) {
    let node = this.root
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode())
      }
      node = node.children.get(char)
      node.indices.add(index)
    }
    node.isEnd = true
  }

  search(keyword) {
    let node = this.root
    const results = []

    for (const char of keyword.toLowerCase()) {
      if (!node.children.has(char)) {
        return []
      }
      node = node.children.get(char)
    }

    return Array.from(node.indices)
  }

  startsWith(keyword) {
    let node = this.root
    for (const char of keyword.toLowerCase()) {
      if (!node.children.has(char)) {
        return false
      }
      node = node.children.get(char)
    }
    return true
  }
}

class FriendSearch {
  constructor(friends) {
    this.friends = friends
    this.nameTrie = new Trie()
    this.pinyinTrie = new Trie()
    this.buildIndex()
  }

  buildIndex() {
    this.friends.forEach((friend, index) => {
      // 建立名字 Trie
      this.nameTrie.insert(friend.name, index)

      // 建立拼音 Trie
      const pinyin = this.convertToPinyin(friend.name)
      pinyin.forEach(py => {
        this.pinyinTrie.insert(py, index)
      })
    })
  }

  search(keyword) {
    const results = new Set()

    // 1. 名字匹配
    const nameIndices = this.nameTrie.search(keyword)
    nameIndices.forEach(index => results.add(index))

    // 2. 拼音匹配
    const pinyinIndices = this.pinyinTrie.search(keyword)
    pinyinIndices.forEach(index => results.add(index))

    // 3. 前缀匹配
    if (this.nameTrie.startsWith(keyword)) {
      const prefixIndices = this.nameTrie.search(keyword)
      prefixIndices.forEach(index => results.add(index))
    }

    return Array.from(results).map(index => this.friends[index])
  }

  convertToPinyin(name) {
    // 简化的拼音转换
    return name.split('').map(char => this.getPinyin(char))
  }

  getPinyin(char) {
    const pinyinMap = {
      '张': 'zhang',
      '李': 'li',
      '王': 'wang'
    }
    return pinyinMap[char] || char
  }
}

// 使用
const friendSearch = new FriendSearch(friends)
const results = friendSearch.search('zhang')
console.log(results) // [{ id: 1, name: '张三' }, { id: 4, name: '张伟' }]
```

**3. 使用数据库索引**

```javascript
// 使用 IndexedDB
class FriendDB {
  constructor() {
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FriendDB', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        const store = db.createObjectStore('friends', { keyPath: 'id' })
        store.createIndex('name', 'name', { unique: false })
        store.createIndex('pinyin', 'pinyin', { unique: false })
      }
    })
  }

  async addFriends(friends) {
    const transaction = this.db.transaction(['friends'], 'readwrite')
    const store = transaction.objectStore('friends')

    friends.forEach(friend => {
      store.add({
        ...friend,
        pinyin: this.convertToPinyin(friend.name)
      })
    })

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async search(keyword) {
    const transaction = this.db.transaction(['friends'], 'readonly')
    const store = transaction.objectStore('friends')
    const nameIndex = store.index('name')
    const pinyinIndex = store.index('pinyin')

    const results = []

    // 名字搜索
    const nameRequest = nameIndex.openCursor(IDBKeyRange.bound(keyword, keyword + '\uffff'))
    await new Promise((resolve) => {
      nameRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve()
        }
      }
    })

    // 拼音搜索
    const pinyinRequest = pinyinIndex.openCursor(IDBKeyRange.bound(keyword, keyword + '\uffff'))
    await new Promise((resolve) => {
      pinyinRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          if (!results.find(r => r.id === cursor.value.id)) {
            results.push(cursor.value)
          }
          cursor.continue()
        } else {
          resolve()
        }
      }
    })

    return results
  }

  convertToPinyin(name) {
    return name.split('').map(char => this.getPinyin(char)).join('')
  }

  getPinyin(char) {
    const pinyinMap = {
      '张': 'zhang',
      '李': 'li',
      '王': 'wang'
    }
    return pinyinMap[char] || char
  }
}

// 使用
const friendDB = new FriendDB()
await friendDB.init()
await friendDB.addFriends(friends)
const results = await friendDB.search('张')
console.log(results)
```

**4. 使用 Web Worker**

```javascript
// 主线程
const worker = new Worker('search-worker.js')

worker.postMessage({
  type: 'init',
  friends: friends
})

function searchFriends(keyword) {
  return new Promise((resolve) => {
    worker.postMessage({
      type: 'search',
      keyword: keyword
    })

    worker.onmessage = (event) => {
      if (event.data.type === 'searchResult') {
        resolve(event.data.results)
      }
    }
  })
}

// 使用
searchFriends('张').then(results => {
  console.log(results)
})

// search-worker.js
let friends = []
let trie = new Trie()

self.onmessage = (event) => {
  if (event.data.type === 'init') {
    friends = event.data.friends
    friends.forEach((friend, index) => {
      trie.insert(friend.name, index)
    })
  } else if (event.data.type === 'search') {
    const indices = trie.search(event.data.keyword)
    const results = indices.map(index => friends[index])
    self.postMessage({
      type: 'searchResult',
      results: results
    })
  }
}
```

**性能对比：**

| 方法 | 时间复杂度 | 空间复杂度 | 优点 | 缺点 |
|------|------------|------------|------|------|
| 遍历 | O(n) | O(1) | 简单 | 慢 |
| 索引 | O(1) | O(n) | 快 | 占用内存 |
| Trie | O(m) | O(n) | 支持前缀 | 实现复杂 |
| IndexedDB | O(log n) | O(n) | 持久化 | 异步 |

---

### 15. 大文件如何实现断点续传？如何实现秒传？如何判断文件内容是否相同？

**答案：**

**大文件上传需要考虑断点续传、秒传和文件校验。**

**1. 断点续传**

```javascript
class FileUploader {
  constructor(file, chunkSize = 2 * 1024 * 1024) {
    this.file = file
    this.chunkSize = chunkSize
    this.chunks = []
    this.uploadedChunks = new Set()
    this.fileHash = null
  }

  // 计算文件哈希
  async calculateHash() {
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer()
      const fileReader = new FileReader()
      let offset = 0

      fileReader.onload = (e) => {
        spark.append(e.target.result)
        offset += e.target.result.byteLength

        if (offset < this.file.size) {
          readNextChunk()
        } else {
          this.fileHash = spark.end()
          resolve(this.fileHash)
        }
      }

      const readNextChunk = () => {
        const slice = this.file.slice(offset, offset + this.chunkSize)
        fileReader.readAsArrayBuffer(slice)
      }

      readNextChunk()
    })
  }

  // 分片文件
  splitFile() {
    const chunks = []
    let offset = 0

    while (offset < this.file.size) {
      chunks.push({
        index: chunks.length,
        offset: offset,
        size: Math.min(this.chunkSize, this.file.size - offset)
      })
      offset += this.chunkSize
    }

    this.chunks = chunks
    return chunks
  }

  // 检查已上传的分片
  async checkUploadedChunks() {
    const response = await fetch('/api/upload/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: this.fileHash,
        total: this.chunks.length
      })
    })

    const { uploaded } = await response.json()
    this.uploadedChunks = new Set(uploaded)
    return uploaded
  }

  // 上传分片
  async uploadChunk(chunk) {
    const formData = new FormData()
    formData.append('file', this.file.slice(chunk.offset, chunk.offset + chunk.size))
    formData.append('hash', this.fileHash)
    formData.append('index', chunk.index)
    formData.append('total', this.chunks.length)

    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    })

    return response.json()
  }

  // 上传所有分片
  async upload() {
    // 1. 计算文件哈希
    await this.calculateHash()

    // 2. 分片文件
    this.splitFile()

    // 3. 检查已上传的分片
    await this.checkUploadedChunks()

    // 4. 上传未上传的分片
    const uploadPromises = []
    for (const chunk of this.chunks) {
      if (!this.uploadedChunks.has(chunk.index)) {
        const promise = this.uploadChunk(chunk).then(() => {
          this.uploadedChunks.add(chunk.index)
          this.onProgress(this.uploadedChunks.size, this.chunks.length)
        })
        uploadPromises.push(promise)
      }
    }

    await Promise.all(uploadPromises)

    // 5. 合并文件
    await this.mergeFile()
  }

  // 合并文件
  async mergeFile() {
    const response = await fetch('/api/upload/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: this.fileHash,
        filename: this.file.name,
        total: this.chunks.length
      })
    })

    return response.json()
  }

  onProgress(uploaded, total) {
    const progress = (uploaded / total) * 100
    console.log(`上传进度: ${progress.toFixed(2)}%`)
  }
}

// 使用
const fileInput = document.getElementById('file-input')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const uploader = new FileUploader(file)
  await uploader.upload()
})
```

**2. 秒传**

```javascript
class FastUploader extends FileUploader {
  async upload() {
    // 1. 计算文件哈希
    await this.calculateHash()

    // 2. 检查文件是否已存在
    const exists = await this.checkFileExists()

    if (exists) {
      console.log('文件已存在，秒传成功！')
      return { success: true, message: '秒传成功' }
    }

    // 3. 文件不存在，正常上传
    return super.upload()
  }

  // 检查文件是否已存在
  async checkFileExists() {
    const response = await fetch('/api/upload/exists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: this.fileHash,
        filename: this.file.name,
        size: this.file.size
      })
    })

    const { exists } = await response.json()
    return exists
  }
}

// 使用
const fastUploader = new FastUploader(file)
await fastUploader.upload()
```

**3. 判断文件内容是否相同**

```javascript
// 方法 1: MD5 哈希
async function calculateMD5(file) {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      spark.append(e.target.result)
      resolve(spark.end())
    }

    fileReader.readAsArrayBuffer(file)
  })
}

// 方法 2: SHA-256 哈希
async function calculateSHA256(file) {
  return new Promise((resolve) => {
    const fileReader = new FileReader()

    fileReader.onload = async (e) => {
      const buffer = e.target.result
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      resolve(hashHex)
    }

    fileReader.readAsArrayBuffer(file)
  })
}

// 方法 3: 文件指纹（采样哈希）
async function calculateFingerprint(file, sampleSize = 1024) {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const buffer = e.target.result

      // 采样头部
      spark.append(buffer.slice(0, sampleSize))

      // 采样中间
      const middleOffset = Math.floor(buffer.byteLength / 2)
      spark.append(buffer.slice(middleOffset, middleOffset + sampleSize))

      // 采样尾部
      spark.append(buffer.slice(-sampleSize))

      resolve(spark.end())
    }

    fileReader.readAsArrayBuffer(file)
  })
}

// 比较文件
async function compareFiles(file1, file2) {
  const hash1 = await calculateMD5(file1)
  const hash2 = await calculateMD5(file2)

  return hash1 === hash2
}

// 使用
const same = await compareFiles(file1, file2)
console.log('文件是否相同:', same)
```

**服务器端实现（Node.js）：**

```javascript
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const upload = multer({ dest: 'uploads/' })

// 检查文件是否存在
app.post('/api/upload/exists', (req, res) => {
  const { hash, filename, size } = req.body
  const filePath = path.join('files', hash, filename)

  if (fs.existsSync(filePath) && fs.statSync(filePath).size === size) {
    res.json({ exists: true })
  } else {
    res.json({ exists: false })
  }
})

// 检查已上传的分片
app.post('/api/upload/check', (req, res) => {
  const { hash, total } = req.body
  const chunkDir = path.join('chunks', hash)

  if (!fs.existsSync(chunkDir)) {
    res.json({ uploaded: [] })
    return
  }

  const uploaded = []
  for (let i = 0; i < total; i++) {
    const chunkPath = path.join(chunkDir, `${i}`)
    if (fs.existsSync(chunkPath)) {
      uploaded.push(i)
    }
  }

  res.json({ uploaded })
})

// 上传分片
app.post('/api/upload/chunk', upload.single('file'), (req, res) => {
  const { hash, index } = req.body
  const chunkDir = path.join('chunks', hash)

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true })
  }

  const chunkPath = path.join(chunkDir, index)
  fs.renameSync(req.file.path, chunkPath)

  res.json({ success: true })
})

// 合并文件
app.post('/api/upload/merge', (req, res) => {
  const { hash, filename, total } = req.body
  const chunkDir = path.join('chunks', hash)
  const fileDir = path.join('files', hash)
  const filePath = path.join(fileDir, filename)

  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }

  const writeStream = fs.createWriteStream(filePath)

  for (let i = 0; i < total; i++) {
    const chunkPath = path.join(chunkDir, `${i}`)
    const chunkData = fs.readFileSync(chunkPath)
    writeStream.write(chunkData)
  }

  writeStream.end()

  // 删除分片
  fs.rmdirSync(chunkDir, { recursive: true })

  res.json({ success: true, url: `/files/${hash}/${filename}` })
})

app.listen(3000)
```

**前端优化：**

```javascript
// 1. 并发控制
class ConcurrencyController {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency
    this.running = 0
    this.queue = []
  }

  async run(fn) {
    if (this.running >= this.maxConcurrency) {
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.running++
    try {
      return await fn()
    } finally {
      this.running--
      if (this.queue.length > 0) {
        const resolve = this.queue.shift()
        resolve()
      }
    }
  }
}

// 2. 上传队列
class UploadQueue {
  constructor(uploader, maxConcurrency = 3) {
    this.uploader = uploader
    this.controller = new ConcurrencyController(maxConcurrency)
  }

  async upload() {
    const chunks = this.uploader.chunks.filter(
      chunk => !this.uploader.uploadedChunks.has(chunk.index)
    )

    const promises = chunks.map(chunk =>
      this.controller.run(() => this.uploader.uploadChunk(chunk))
    )

    await Promise.all(promises)
  }
}

// 3. 错误重试
async function uploadWithRetry(uploader, chunk, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploader.uploadChunk(chunk)
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

## 算法题

### 16. 二叉树路径和

**答案：**

**题目：** 有一个二叉树，每个节点的值是一个整数。写一个函数，判断这棵树中是否存在从根到叶子节点的一个路径，这个路径上所有节点之和为某一个值。存在返回 1，否则返回 0。

```javascript
// 定义二叉树节点
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

// 方法 1: 递归
function hasPathSum(root, targetSum) {
  if (!root) return 0

  // 叶子节点，检查是否等于剩余和
  if (!root.left && !root.right) {
    return root.val === targetSum ? 1 : 0
  }

  // 递归检查左右子树
  const remainingSum = targetSum - root.val
  return Math.max(
    hasPathSum(root.left, remainingSum),
    hasPathSum(root.right, remainingSum)
  )
}

// 方法 2: 递归（更简洁）
function hasPathSum2(root, targetSum) {
  if (!root) return 0

  targetSum -= root.val

  if (!root.left && !root.right) {
    return targetSum === 0 ? 1 : 0
  }

  return hasPathSum2(root.left, targetSum) || hasPathSum2(root.right, targetSum)
}

// 方法 3: 迭代（DFS）
function hasPathSumIterative(root, targetSum) {
  if (!root) return 0

  const stack = [[root, targetSum]]

  while (stack.length > 0) {
    const [node, remainingSum] = stack.pop()
    remainingSum -= node.val

    if (!node.left && !node.right && remainingSum === 0) {
      return 1
    }

    if (node.right) {
      stack.push([node.right, remainingSum])
    }
    if (node.left) {
      stack.push([node.left, remainingSum])
    }
  }

  return 0
}

// 测试
const root = new TreeNode(5,
  new TreeNode(4,
    new TreeNode(11,
      new TreeNode(7),
      new TreeNode(2)
    )
  ),
  new TreeNode(8,
    new TreeNode(13),
    new TreeNode(4,
      null,
      new TreeNode(1)
    )
  )
)

console.log(hasPathSum(root, 22))  // 1 (5 -> 4 -> 11 -> 2)
console.log(hasPathSum(root, 26))  // 1 (5 -> 8 -> 13)
console.log(hasPathSum(root, 18))  // 1 (5 -> 8 -> 4 -> 1)
console.log(hasPathSum(root, 100)) // 0
```

**复杂度分析：**

- 时间复杂度：O(n)，其中 n 是节点数
- 空间复杂度：O(h)，其中 h 是树的高度

---

### 17. 三数之和

**答案：**

**题目：** 给定一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c，使得 a + b + c = 0？找出所有满足条件且不重复的三元组。

```javascript
// 方法 1: 排序 + 双指针
function threeSum(nums) {
  const result = []
  nums.sort((a, b) => a - b)

  for (let i = 0; i < nums.length - 2; i++) {
    // 跳过重复元素
    if (i > 0 && nums[i] === nums[i - 1]) continue

    let left = i + 1
    let right = nums.length - 1

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right]

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]])

        // 跳过重复元素
        while (left < right && nums[left] === nums[left + 1]) left++
        while (left < right && nums[right] === nums[right - 1]) right--

        left++
        right--
      } else if (sum < 0) {
        left++
      } else {
        right--
      }
    }
  }

  return result
}

// 方法 2: 哈希表
function threeSumHash(nums) {
  const result = []
  nums.sort((a, b) => a - b)

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue

    const target = -nums[i]
    const seen = new Set()

    for (let j = i + 1; j < nums.length; j++) {
      const complement = target - nums[j]

      if (seen.has(complement)) {
        result.push([nums[i], complement, nums[j]])

        // 跳过重复元素
        while (j < nums.length - 1 && nums[j] === nums[j + 1]) j++
      }

      seen.add(nums[j])
    }
  }

  return result
}

// 测试
const nums1 = [-1, 0, 1, 2, -1, -4]
console.log(threeSum(nums1))
// 输出: [[-1, -1, 2], [-1, 0, 1]]

const nums2 = [0, 0, 0, 0]
console.log(threeSum(nums2))
// 输出: [[0, 0, 0]]

const nums3 = []
console.log(threeSum(nums3))
// 输出: []
```

**复杂度分析：**

- 时间复杂度：O(n²)
- 空间复杂度：O(1)

---

### 18. 找出重复数字

**答案：**

**题目：** 数组 a[N]，存放了数字 1 至 N - 1，其中某个数字重复一次。写一个函数，找出被重复的数字。时间复杂度必须为 O(N)，空间复杂度不能是 O[N]。

```javascript
// 方法 1: 哈希表（不符合空间复杂度要求）
function findDuplicateHash(nums) {
  const seen = new Set()
  for (const num of nums) {
    if (seen.has(num)) {
      return num
    }
    seen.add(num)
  }
  return -1
}

// 方法 2: 排序（不符合时间复杂度要求）
function findDuplicateSort(nums) {
  nums.sort((a, b) => a - b)
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) {
      return nums[i]
    }
  }
  return -1
}

// 方法 3: 数学方法（满足要求）
function findDuplicateMath(nums) {
  const n = nums.length - 1
  const expectedSum = (n * (n + 1)) / 2
  const actualSum = nums.reduce((sum, num) => sum + num, 0)
  return actualSum - expectedSum
}

// 方法 4: 位运算（满足要求）
function findDuplicateBit(nums) {
  let result = 0
  for (let i = 0; i < nums.length; i++) {
    result ^= i ^ nums[i]
  }
  return result
}

// 方法 5: 原地修改（满足要求）
function findDuplicateInPlace(nums) {
  for (let i = 0; i < nums.length; i++) {
    const index = Math.abs(nums[i]) - 1

    if (nums[index] < 0) {
      return Math.abs(nums[i])
    }

    nums[index] = -nums[index]
  }
  return -1
}

// 方法 6: 快慢指针（满足要求）
function findDuplicateFloyd(nums) {
  let slow = nums[0]
  let fast = nums[0]

  // 找到相遇点
  do {
    slow = nums[slow]
    fast = nums[nums[fast]]
  } while (slow !== fast)

  // 找到入口点
  slow = nums[0]
  while (slow !== fast) {
    slow = nums[slow]
    fast = nums[fast]
  }

  return slow
}

// 测试
const nums = [1, 3, 4, 2, 2]
console.log(findDuplicateMath(nums))    // 2
console.log(findDuplicateBit(nums))     // 2
console.log(findDuplicateInPlace([...nums]))  // 2
console.log(findDuplicateFloyd(nums))   // 2
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

### 19. 最长递增序列

**答案：**

**题目：** 从一个整数数组中，找出位置连续的最长递增序列。

```javascript
// 方法 1: 动态规划
function findLongestIncreasingSequence(nums) {
  if (nums.length === 0) return []

  let maxLength = 1
  let maxStart = 0
  let currentLength = 1
  let currentStart = 0

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) {
      currentLength++
    } else {
      if (currentLength > maxLength) {
        maxLength = currentLength
        maxStart = currentStart
      }
      currentLength = 1
      currentStart = i
    }
  }

  // 检查最后一个序列
  if (currentLength > maxLength) {
    maxLength = currentLength
    maxStart = currentStart
  }

  return nums.slice(maxStart, maxStart + maxLength)
}

// 方法 2: 滑动窗口
function findLongestIncreasingSequenceWindow(nums) {
  if (nums.length === 0) return []

  let left = 0
  let maxLength = 1
  let maxStart = 0

  for (let right = 1; right < nums.length; right++) {
    if (nums[right] <= nums[right - 1]) {
      left = right
    }

    if (right - left + 1 > maxLength) {
      maxLength = right - left + 1
      maxStart = left
    }
  }

  return nums.slice(maxStart, maxStart + maxLength)
}

// 方法 3: 返回所有最长递增序列
function findAllLongestIncreasingSequences(nums) {
  if (nums.length === 0) return []

  const sequences = []
  let currentSequence = [nums[0]]
  let maxLength = 1

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) {
      currentSequence.push(nums[i])
    } else {
      if (currentSequence.length > maxLength) {
        maxLength = currentSequence.length
        sequences.length = 0
        sequences.push([...currentSequence])
      } else if (currentSequence.length === maxLength) {
        sequences.push([...currentSequence])
      }
      currentSequence = [nums[i]]
    }
  }

  // 检查最后一个序列
  if (currentSequence.length > maxLength) {
    maxLength = currentSequence.length
    sequences.length = 0
    sequences.push([...currentSequence])
  } else if (currentSequence.length === maxLength) {
    sequences.push([...currentSequence])
  }

  return sequences
}

// 测试
const nums1 = [1, 2, 3, 2, 3, 4, 5, 1]
console.log(findLongestIncreasingSequence(nums1))
// 输出: [2, 3, 4, 5]

const nums2 = [5, 4, 3, 2, 1]
console.log(findLongestIncreasingSequence(nums2))
// 输出: [5]

const nums3 = [1, 2, 3, 4, 5]
console.log(findLongestIncreasingSequence(nums3))
// 输出: [1, 2, 3, 4, 5]

console.log(findAllLongestIncreasingSequences([1, 2, 3, 1, 2, 3, 4]))
// 输出: [[1, 2, 3, 4]]
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

### 20. 反转数组

**答案：**

**题目：** 反转数组，在原数组反转（不使用 arr.reverse 方法）。

```javascript
// 方法 1: 双指针
function reverseArray(arr) {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]]
    left++
    right--
  }

  return arr
}

// 方法 2: 交换
function reverseArraySwap(arr) {
  for (let i = 0; i < Math.floor(arr.length / 2); i++) {
    const temp = arr[i]
    arr[i] = arr[arr.length - 1 - i]
    arr[arr.length - 1 - i] = temp
  }

  return arr
}

// 方法 3: 递归
function reverseArrayRecursive(arr, left = 0, right = arr.length - 1) {
  if (left >= right) {
    return arr
  }

  [arr[left], arr[right]] = [arr[right], arr[left]]

  return reverseArrayRecursive(arr, left + 1, right - 1)
}

// 方法 4: ES6 解构
function reverseArrayES6(arr) {
  const n = arr.length
  for (let i = 0; i < Math.floor(n / 2); i++) {
    [arr[i], arr[n - 1 - i]] = [arr[n - 1 - i], arr[i]]
  }

  return arr
}

// 测试
const arr1 = [1, 2, 3, 4, 5]
console.log(reverseArray([...arr1]))  // [5, 4, 3, 2, 1]
console.log(reverseArraySwap([...arr1]))  // [5, 4, 3, 2, 1]
console.log(reverseArrayRecursive([...arr1]))  // [5, 4, 3, 2, 1]
console.log(reverseArrayES6([...arr1]))  // [5, 4, 3, 2, 1]

const arr2 = ['a', 'b', 'c', 'd']
console.log(reverseArray([...arr2]))  // ['d', 'c', 'b', 'a']
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(1)

---

### 21. 括号闭合

**答案：**

**题目：** 给定一个字符串，编写一段代码测试该段字符串的括号是否完全闭合。

```javascript
// 方法 1: 栈
function isValidParentheses(s) {
  const stack = []
  const pairs = {
    '(': ')',
    '[': ']',
    '{': '}'
  }

  for (const char of s) {
    if (pairs[char]) {
      stack.push(char)
    } else if (Object.values(pairs).includes(char)) {
      const top = stack.pop()
      if (pairs[top] !== char) {
        return false
      }
    }
  }

  return stack.length === 0
}

// 方法 2: 使用 Map
function isValidParenthesesMap(s) {
  const stack = []
  const map = new Map([
    ['(', ')'],
    ['[', ']'],
    ['{', '}']
  ])

  for (const char of s) {
    if (map.has(char)) {
      stack.push(char)
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.length === 0 || map.get(stack.pop()) !== char) {
        return false
      }
    }
  }

  return stack.length === 0
}

// 方法 3: 计数器（只适用于一种括号）
function isValidSingleParentheses(s) {
  let count = 0

  for (const char of s) {
    if (char === '(') {
      count++
    } else if (char === ')') {
      count--
    }

    if (count < 0) {
      return false
    }
  }

  return count === 0
}

// 测试
console.log(isValidParentheses("()"))        // true
console.log(isValidParentheses("()[]{}"))    // true
console.log(isValidParentheses("(]"))        // false
console.log(isValidParentheses("([)]"))      // false
console.log(isValidParentheses("{[]}"))      // true
console.log(isValidParentheses("(((())))"))  // true
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(n)

---

### 22. 洗牌算法

**答案：**

**题目：** 洗牌算法：对 52 张牌洗牌，要求尽量洗乱，而且原牌不能在原位置上重复。

```javascript
// 方法 1: Fisher-Yates 洗牌算法
function shuffle(array) {
  const arr = [...array]

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

// 方法 2: 错位排列洗牌（确保没有牌在原位置）
function derangementShuffle(array) {
  const arr = [...array]
  const indices = arr.map((_, i) => i)

  // Fisher-Yates 洗牌索引
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  // 确保没有元素在原位置
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] === i) {
      // 找到可以交换的索引
      let swapIndex = (i + 1) % indices.length
      while (swapIndex === i || indices[swapIndex] === swapIndex) {
        swapIndex = (swapIndex + 1) % indices.length
      }
      ;[indices[i], indices[swapIndex]] = [indices[swapIndex], indices[i]]
    }
  }

  // 根据索引重新排列
  return indices.map(index => array[index])
}

// 方法 3: Sattolo 洗牌（保证每个元素都移动）
function sattoloShuffle(array) {
  const arr = [...array]

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

// 测试
const cards = Array.from({ length: 52 }, (_, i) => i + 1)

console.log('Fisher-Yates:', shuffle(cards))
console.log('Derangement:', derangementShuffle(cards))
console.log('Sattolo:', sattoloShuffle(cards))

// 验证没有牌在原位置
function validateDerangement(original, shuffled) {
  for (let i = 0; i < original.length; i++) {
    if (original[i] === shuffled[i]) {
      return false
    }
  }
  return true
}

const shuffled = derangementShuffle(cards)
console.log('验证错位排列:', validateDerangement(cards, shuffled))
```

**复杂度分析：**

- 时间复杂度：O(n)
- 空间复杂度：O(n)

---

### 23. 贝叶斯定理

**答案：**

**题目：** 某城市有两种颜色的出租车：蓝色和绿色（市场有例为为 15∶85）。一辆出租车夜间肇事逃逸，有一位目击证人，这位目击者认定肇事出租车是蓝色的。但是他的"目击的可信度"如何呢？公安人员在相同环境下对该目击者进行"蓝绿"测试得到：80% 的情况下识别正确，20% 的情况不正确。请问可以算出在有目击证人情况下肇事车辆是蓝色的概率为多少？

```javascript
// 贝叶斯定理公式：
// P(A|B) = P(B|A) * P(A) / P(B)

// 定义事件：
// - A: 出租车是蓝色的
// - B: 目击者说是蓝色的

// 已知条件：
// - P(A) = 15% = 0.15 (蓝色出租车的比例)
// - P(¬A) = 85% = 0.85 (绿色出租车的比例)
// - P(B|A) = 80% = 0.8 (蓝色出租车识别为蓝色的概率)
// - P(B|¬A) = 20% = 0.2 (绿色出租车识别为蓝色的概率)

// 计算：
// P(B) = P(B|A) * P(A) + P(B|¬A) * P(¬A)
//      = 0.8 * 0.15 + 0.2 * 0.85
//      = 0.12 + 0.17
//      = 0.29

// P(A|B) = P(B|A) * P(A) / P(B)
//        = 0.8 * 0.15 / 0.29
//        = 0.12 / 0.29
//        ≈ 0.4138
//        ≈ 41.38%

function bayesianProbability() {
  const P_A = 0.15          // 蓝色出租车的比例
  const P_not_A = 0.85      // 绿色出租车的比例
  const P_B_given_A = 0.8   // 蓝色出租车识别为蓝色的概率
  const P_B_given_not_A = 0.2 // 绿色出租车识别为蓝色的概率

  // 计算目击者说蓝色的总概率
  const P_B = P_B_given_A * P_A + P_B_given_not_A * P_not_A

  // 计算在有目击证人情况下，肇事车辆是蓝色的概率
  const P_A_given_B = P_B_given_A * P_A / P_B

  return {
    'P(A)': P_A,
    'P(¬A)': P_not_A,
    'P(B|A)': P_B_given_A,
    'P(B|¬A)': P_B_given_not_A,
    'P(B)': P_B,
    'P(A|B)': P_A_given_B,
    '百分比': (P_A_given_B * 100).toFixed(2) + '%'
  }
}

// 测试
const result = bayesianProbability()
console.log(result)
// 输出: { P(A|B): 0.4137931034482759, 百分比: '41.38%' }

// 通用贝叶斯定理函数
function bayesTheorem(prior, sensitivity, falsePositiveRate) {
  // prior: P(A) - 先验概率
  // sensitivity: P(B|A) - 真阳性率
  // falsePositiveRate: P(B|¬A) - 假阳性率

  const priorNot = 1 - prior
  const evidence = sensitivity * prior + falsePositiveRate * priorNot
  const posterior = sensitivity * prior / evidence

  return {
    '先验概率 P(A)': prior,
    '真阳性率 P(B|A)': sensitivity,
    '假阳性率 P(B|¬A)': falsePositiveRate,
    '证据 P(B)': evidence,
    '后验概率 P(A|B)': posterior,
    '百分比': (posterior * 100).toFixed(2) + '%'
  }
}

// 更直观的解释
function explainBayes() {
  console.log('贝叶斯定理解释：')
  console.log('假设有 100 辆出租车：')
  console.log('- 15 辆是蓝色')
  console.log('- 85 辆是绿色')
  console.log()
  console.log('目击者识别：')
  console.log('- 蓝色出租车：80% 正确识别为蓝色，20% 识别为绿色')
  console.log('- 绿色出租车：80% 正确识别为绿色，20% 识别为蓝色')
  console.log()
  console.log('计算：')
  console.log('- 蓝色出租车识别为蓝色：15 * 0.8 = 12 辆')
  console.log('- 绿色出租车识别为蓝色：85 * 0.2 = 17 辆')
  console.log('- 总共识别为蓝色：12 + 17 = 29 辆')
  console.log('- 其中真正是蓝色的：12 辆')
  console.log('- 概率：12 / 29 ≈ 41.38%')
  console.log()
  console.log('结论：即使目击者说是蓝色，出租车实际上是蓝色的概率只有 41.38%！')
}

explainBayes()
```

**数学推导：**

```
P(蓝色|目击者说蓝色) = P(目击者说蓝色|蓝色) * P(蓝色) / P(目击者说蓝色)

其中：
P(目击者说蓝色) = P(目击者说蓝色|蓝色) * P(蓝色) + P(目击者说蓝色|绿色) * P(绿色)
                  = 0.8 * 0.15 + 0.2 * 0.85
                  = 0.12 + 0.17
                  = 0.29

因此：
P(蓝色|目击者说蓝色) = 0.8 * 0.15 / 0.29
                    = 0.12 / 0.29
                    ≈ 0.4138
```

---

**题目总数**: 23
**最后更新**: 2026/3/19