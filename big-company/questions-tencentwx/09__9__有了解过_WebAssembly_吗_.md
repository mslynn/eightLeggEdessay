# 9. 有了解过 WebAssembly 吗？

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
