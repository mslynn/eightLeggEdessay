# 3. tree-shaking 原理

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
