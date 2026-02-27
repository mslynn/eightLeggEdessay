# 18. 微前端中是如何加载子应用的？外链脚本是怎么加载的？有没有用到 Global State？

**答案：**

**子应用加载方式：**

1. **Single-SPA 加载机制**
```javascript
registerApplication({
  name: 'app1',
  app: () => System.import('http://localhost:3001/main.js'),
  activeWhen: '/app1',
  customProps: {}
});
```

2. **qiankun 加载机制**
```javascript
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:7101',
    container: '#subapp-viewport',
    activeRule: '/app1',
  },
]);
```

**外链脚本加载：**

```javascript
// HTML Entry 模式（qiankun）
async function loadApp(app) {
  // 1. 获取 HTML
  const html = await fetch(app.entry).then(res => res.text());
  
  // 2. 解析资源（JS、CSS）
  const { scripts, styles } = parseHTML(html);
  
  // 3. 加载 CSS
  styles.forEach(style => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = style.href;
    document.head.appendChild(link);
  });
  
  // 4. 加载 JS
  for (const script of scripts) {
    if (script.src) {
      await loadScript(script.src);
    } else {
      eval(script.content);
    }
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

**Global State（全局状态管理）：**

```javascript
// 使用 initGlobalState（qiankun）
import { initGlobalState } from 'qiankun';

// 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: { name: 'admin' },
  theme: 'light'
});

// 监听状态变化
onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
});

// 修改状态
setGlobalState({ theme: 'dark' });
```

---

**其他微前端框架：**

### 1. Single-SPA

**特点：**
- 最早的微前端框架
- 专注于应用注册和生命周期管理
- 需要手动管理资源加载
- 灵活性高，但配置复杂

**使用示例：**
```javascript
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: 'app1',
  app: () => System.import('http://localhost:3001/main.js'),
  activeWhen: '/app1',
  customProps: {}
});

start();
```

**优点：**
- 灵活度高
- 社区成熟
- 适合复杂场景

**缺点：**
- 需要手动配置
- 学习曲线陡峭
- 缺少开箱即用的功能

---

### 2. qiankun

**特点：**
- 基于 Single-SPA 封装
- 开箱即用，配置简单
- 支持 HTML Entry
- 内置样式隔离、JS 沙箱
- 完善的文档和社区

**使用示例：**
```javascript
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:7101',
    container: '#subapp-viewport',
    activeRule: '/app1',
  },
]);

start();
```

**优点：**
- 开箱即用
- 完善的沙箱隔离
- 良好的 TypeScript 支持
- 中文文档完善

**缺点：**
- 基于 Single-SPA，继承了其限制
- 某些场景下定制化不够灵活

---

### 3. Micro-App

**特点：**
- 京东出品
- 基于自定义元素
- 支持 Vue、React、Angular 等多种框架
- 支持预加载
- 提供数据通信机制

**使用示例：**
```javascript
import microApp from '@micro-zoe/micro-app';

<micro-app
  name="app1"
  url="http://localhost:3001/"
  iframe
></micro-app>
```

**优点：**
- 使用简单，类似 iframe
- 支持多种框架
- 内置数据通信
- 支持预加载

**缺点：**
- 基于 Web Components，兼容性要求较高
- 相对较新，社区较小

---

### 4. wujie

**特点：**
- 字节跳动出品
- 基于 iframe + WebComponent
- 完美的沙箱隔离
- 支持应用保活
- 性能优秀

**使用示例：**
```javascript
import { setupApp, preloadApp, startApp } from 'wujie';

// 预加载
preloadApp({ name: 'app1', url: 'http://localhost:3001/' });

// 启动应用
startApp({ name: 'app1', url: 'http://localhost:3001/' });
```

**优点：**
- 完美的隔离性
- 支持应用保活（类似 iframe）
- 性能优秀
- 支持子应用嵌套

**缺点：**
- 基于 iframe，某些场景受限
- 相对较新

---

### 5. Module Federation

**特点：**
- Webpack 5 原生支持
- 模块联邦，共享依赖
- 运行时动态加载
- 无需额外的框架

**使用示例：**
```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};

// 使用远程模块
const RemoteButton = React.lazy(() => import('app1/Button'));
```

**优点：**
- Webpack 原生支持
- 灵活的模块共享
- 类型安全
- 无需额外框架

**缺点：**
- 依赖 Webpack 5
- 需要各应用配合
- 不支持样式隔离

---

### 6. Qiankun + Module Federation

**结合使用：**
```javascript
// qiankun 配置 Module Federation 子应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:7101/remoteEntry.js',
    container: '#subapp-viewport',
    activeRule: '/app1',
  },
]);
```

**优点：**
- 结合两者的优势
- 灵活的模块共享
- 完善的隔离机制

---

### 7. 框架对比

| 特性 | Single-SPA | qiankun | Micro-App | wujie | Module Federation |
|------|------------|---------|-----------|-------|-------------------|
| **隔离性** | 手动实现 | CSS/JS 沙箱 | Web Components | iframe 完美隔离 | 手动实现 |
| **配置难度** | 高 | 低 | 低 | 中 | 中 |
| **框架支持** | 所有 | 所有 | Vue/React/Angular | 所有 | 所有 |
| **性能** | 中 | 中 | 中 | 高 | 高 |
| **依赖管理** | 手动 | 手动 | 手动 | 手动 | 自动共享 |
| **成熟度** | 高 | 高 | 中 | 中 | 高 |
| **学习曲线** | 陡峭 | 平缓 | 平缓 | 平缓 | 中等 |

---

### 8. 选择建议

**选择 qiankun：**
- 需要快速上手
- 团队熟悉 Vue/React
- 需要完善的文档和社区支持

**选择 Single-SPA：**
- 需要高度定制化
- 团队有足够的开发能力
- 需要支持多种框架

**选择 wujie：**
- 需要完美的隔离
- 需要应用保活
- 性能要求高

**选择 Module Federation：**
- 项目使用 Webpack 5
- 需要模块级别的共享
- 追求性能优化

**选择 Micro-App：**
- 京东技术栈
- 需要简单的集成方式
- 需要内置的数据通信

---

### 9. 实际应用场景

**场景 1：从单体到微前端迁移**
- 推荐使用 qiankun
- 渐进式改造
- 降低迁移成本

**场景 2：全新的微前端项目**
- 推荐使用 wujie 或 Module Federation
- 从架构层面设计
- 避免历史包袱

**场景 3：多技术栈整合**
- 推荐使用 qiankun 或 Single-SPA
- 灵活支持不同框架
- 便于技术栈迁移

**场景 4：高隔离要求**
- 推荐使用 wujie
- 完美的沙箱隔离
- 应用间互不影响

---
