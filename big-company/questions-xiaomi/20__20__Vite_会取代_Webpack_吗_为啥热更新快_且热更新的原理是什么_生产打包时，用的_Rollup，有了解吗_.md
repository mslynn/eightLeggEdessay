# 20. Vite 会取代 Webpack 吗？为啥热更新快？且热更新的原理是什么？生产打包时，用的 Rollup，有了解吗？

**答案：**

**Vite 会取代 Webpack 吗？**

不会完全取代，两者各有优势：

| 特性 | Webpack | Vite |
|------|---------|------|
| 启动速度 | 慢（需要打包） | 快（ESM 原生） |
| HMR 速度 | 慢（全量更新） | 快（按需更新） |
| 构建速度 | 较慢 | 快（Rollup） |
| 生态成熟度 | 非常成熟 | 快速发展 |
| 配置复杂度 | 复杂 | 简单 |
| 适用场景 | 大型项目、遗留项目 | 新项目、中小型项目 |

**为什么 Vite 热更新快：**

1. **ESM 原生支持**
```javascript
<script type="module">
  import { createApp } from '/node_modules/vue/dist/vue.esm-browser.js';
  import App from '/src/App.js';
  createApp(App).mount('#app');
</script>
```

2. **按需编译**：只编译当前访问的文件

3. **基于 HTTP 请求**：浏览器请求时才编译

**Vite 热更新原理：**

1. **WebSocket 通信**：客户端与服务器建立 WebSocket 连接
2. **文件监听**：服务器监听文件变化
3. **模块替换**：通过 HMR API 替换模块
4. **DOM 更新**：执行模块替换逻辑，更新 DOM

**生产环境使用 Rollup：**

Vite 生产环境使用 Rollup 打包，因为：

1. **更好的 Tree Shaking**：移除未使用的代码
2. **输出更小**：优化的打包结果
3. **支持 ESM**：输出原生 ES 模块

**Rollup 常用配置：**

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue'],
          'router': ['vue-router']
        }
      }
    },
    minify: 'terser',
    sourcemap: false
  }
};
```

**总结：**

- **开发环境**：Vite 通过 ESM + WebSocket 实现快速热更新
- **生产环境**：Vite 使用 Rollup 实现高效打包
- **不会完全取代**：Webpack 在大型项目和遗留项目中仍有优势
- **趋势**：新项目更倾向于使用 Vite

---
