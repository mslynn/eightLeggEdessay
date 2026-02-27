# 2. 微前端 qiankun：Vue2 主应用 Vue3 子应用、数据共享、路由跳转

**答案：**

qiankun 是一个基于 single-spa 的微前端实现库，它提供了更完善的微前端解决方案，包括沙箱隔离、样式隔离、JS 沙箱等特性。

**1. 基础架构配置**

**主应用（Vue 2）配置：**

```javascript
// main.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import { registerMicroApps, start } from 'qiankun';
import App from './App.vue';
import routes from './router';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

// 注册子应用
registerMicroApps([
  {
    name: 'vue3-subapp',
    entry: '//localhost:3001',
    container: '#subapp-container',
    activeRule: '/vue3',
    props: {
      routerBase: '/vue3',
      data: { token: 'xxx' }
    }
  }
]);

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: true,  // 样式隔离
    experimentalStyleIsolation: true
  },
  prefetch: true,  // 预加载
  singular: false  // 允许多个子应用同时存在
});
```

**子应用（Vue 3）配置：**

```javascript
// main.js
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './router';

let app = null;
let router = null;
let history = null;

// 导出生命周期钩子
export async function bootstrap() {
  console.log('Vue 3 子应用 bootstrap');
}

export async function mount(props) {
  console.log('Vue 3 子应用 mount', props);
  
  // 获取主应用传递的 props
  const { routerBase, data, onGlobalStateChange } = props;
  
  // 创建路由
  history = createWebHistory(routerBase || '/');
  router = createRouter({
    history,
    routes
  });
  
  // 创建应用
  app = createApp(App);
  app.use(router);
  
  // 挂载到主应用提供的容器
  app.mount('#subapp-container');
  
  // 监听全局状态变化
  if (onGlobalStateChange) {
    onGlobalStateChange((state, prev) => {
      console.log('全局状态变化:', state, prev);
    }, true);
  }
}

export async function unmount() {
  console.log('Vue 3 子应用 unmount');
  app.unmount();
  app = null;
  router = null;
  history = null;
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  mount({});
}
```

**子应用配置文件：**

```javascript
// vue.config.js
const { name } = require('./package.json');

module.exports = {
  devServer: {
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*',  // 允许跨域
    }
  },
  
  configureWebpack: {
    output: {
      library: `${name}-[name]`,  // 暴露库
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`,
    }
  }
};
```

**2. 数据共享方案**

**方案 1：使用 qiankun 的全局状态管理**

```javascript
// 主应用
import { initGlobalState } from 'qiankun';

// 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: {
    name: '张三',
    role: 'admin'
  },
  token: 'xxx-xxx-xxx',
  theme: 'light'
});

// 监听状态变化
onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化:', state, prev);
});

// 更新状态
setGlobalState({
  user: {
    name: '李四',
    role: 'user'
  }
});

// 暴露给子应用
registerMicroApps([
  {
    name: 'vue3-subapp',
    entry: '//localhost:3001',
    container: '#subapp-container',
    activeRule: '/vue3',
    props: {
      // 传递状态管理方法
      onGlobalStateChange,
      setGlobalState,
      // 传递初始状态
      initialState: {
        user: { name: '张三', role: 'admin' },
        token: 'xxx-xxx-xxx'
      }
    }
  }
]);
```

```javascript
// 子应用 (Vue 3)
// main.js
export async function mount(props) {
  const { onGlobalStateChange, setGlobalState, initialState } = props;
  
  // 创建全局状态 Store
  const globalStore = {
    state: initialState,
    listeners: [],
    
    // 获取状态
    getState() {
      return this.state;
    },
    
    // 设置状态
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.listeners.forEach(listener => listener(this.state));
      setGlobalState(newState);
    },
    
    // 监听变化
    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }
  };
  
  // 挂载到 Vue 应用
  app.provide('globalStore', globalStore);
  
  // 监听主应用状态变化
  onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化:', state, prev);
    globalStore.state = state;
  }, true);
}
```

```javascript
// 子应用组件中使用
import { inject } from 'vue';

export default {
  setup() {
    const globalStore = inject('globalStore');
    
    // 获取全局状态
    const user = computed(() => globalStore.getState().user);
    
    // 更新全局状态
    const updateUser = (newUser) => {
      globalStore.setState({ user: newUser });
    };
    
    return { user, updateUser };
  }
};
```

**方案 2：使用 Props 传递数据**

```javascript
// 主应用
registerMicroApps([
  {
    name: 'vue3-subapp',
    entry: '//localhost:3001',
    container: '#subapp-container',
    activeRule: '/vue3',
    props: {
      // 静态数据
      apiBaseUrl: 'https://api.example.com',
      
      // 方法
      showToast: (message) => {
        // 调用主应用的 Toast
        Vue.prototype.$message.success(message);
      },
      
      // 数据对象（响应式）
      reactiveData: Vue.observable({
        count: 0,
        user: null
      }),
      
      // 数据更新方法
      updateData: (key, value) => {
        props.reactiveData[key] = value;
      }
    }
  }
]);
```

```javascript
// 子应用
export async function mount(props) {
  const { apiBaseUrl, showToast, reactiveData, updateData } = props;
  
  // 使用 API 配置
  axios.defaults.baseURL = apiBaseUrl;
  
  // 使用主应用的方法
  showToast('子应用已加载');
  
  // 监听数据变化
  watch(() => reactiveData.count, (newVal) => {
    console.log('count 变化:', newVal);
  });
  
  // 更新数据
  updateData('user', { name: '张三' });
}
```

**方案 3：使用 EventBus 或自定义事件**

```javascript
// 创建全局事件总线
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
  
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

const eventBus = new EventBus();

// 主应用注册到全局
window.__MICRO_APP_EVENT_BUS__ = eventBus;

// 子应用使用
window.__MICRO_APP_EVENT_BUS__.on('user-login', (user) => {
  console.log('用户登录:', user);
});

// 子应用触发事件
window.__MICRO_APP_EVENT_BUS__.emit('user-logout');
```

**3. 路由跳转方案**

**方案 1：使用 qiankun 的路由模式**

```javascript
// 主应用路由配置
// router/index.js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/vue3/*',
    name: 'Vue3SubApp',
    component: () => import('@/views/SubAppContainer.vue')
  }
];

// 注册子应用时指定路由规则
registerMicroApps([
  {
    name: 'vue3-subapp',
    entry: '//localhost:3001',
    container: '#subapp-container',
    activeRule: '/vue3',
    props: {
      routerBase: '/vue3'
    }
  }
]);
```

```javascript
// 子应用路由配置
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/vue3/'),  // 使用子应用的 base path
  routes
});

export default router;
```

**方案 2：主应用跳转子应用**

```javascript
// 主应用中跳转到子应用
// 方法 1: 使用 Vue Router
this.$router.push('/vue3/about');

// 方法 2: 使用 qiankun API
import { loadMicroApp } from 'qiankun';

const microApp = loadMicroApp({
  name: 'vue3-subapp',
  entry: '//localhost:3001',
  container: '#subapp-container',
  activeRule: '/vue3'
});

// 手动切换
microApp.mount();

// 方法 3: 使用原生 history API
history.pushState({}, '', '/vue3/about');
```

**方案 3：子应用跳转主应用**

```javascript
// 子应用中跳转到主应用
// 方法 1: 使用父应用的 history API
window.history.pushState({}, '', '/');

// 方法 2: 使用 location
window.location.href = '/';

// 方法 3: 通过 props 传递的导航方法
export async function mount(props) {
  const { navigateToParent } = props;
  
  // 调用父应用的导航方法
  navigateToParent('/');
}
```

**方案 4：子应用间跳转**

```javascript
// 子应用 A 跳转到子应用 B
// 方法 1: 直接修改 URL
window.history.pushState({}, '', '/subapp-b/page1');

// 方法 2: 使用主应用的路由实例（通过 props 传递）
export async function mount(props) {
  const { parentRouter } = props;
  
  // 跳转到其他子应用
  parentRouter.push('/subapp-b/page1');
}
```

**4. 完整示例**

```javascript
// 主应用 main.js
import Vue from 'vue';
import { registerMicroApps, start, initGlobalState } from 'qiankun';

// 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: null,
  token: null,
  theme: 'light'
});

// 监听状态变化
onGlobalStateChange((state, prev) => {
  console.log('[主应用] 状态变化:', state, prev);
  
  // 同步主题
  document.documentElement.setAttribute('data-theme', state.theme);
});

// 注册子应用
registerMicroApps([
  {
    name: 'vue2-subapp',
    entry: '//localhost:3000',
    container: '#subapp-vue2',
    activeRule: '/vue2',
    props: {
      mainRouter: router,
      routerBase: '/vue2',
      globalState: { onGlobalStateChange, setGlobalState }
    }
  },
  {
    name: 'vue3-subapp',
    entry: '//localhost:3001',
    container: '#subapp-vue3',
    activeRule: '/vue3',
    props: {
      mainRouter: router,
      routerBase: '/vue3',
      globalState: { onGlobalStateChange, setGlobalState },
      // 自定义方法
      showNotification: (title, message) => {
        Vue.prototype.$notify({ title, message });
      }
    }
  }
]);

// 启动
start({
  sandbox: {
    strictStyleIsolation: true,
    experimentalStyleIsolation: true
  },
  prefetch: 'all',
  singular: false
});
```

```javascript
// 子应用 Vue 3 main.js
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

let app = null;
let router = null;
let pinia = null;

export async function bootstrap() {
  console.log('[Vue3 子应用] bootstrap');
}

export async function mount(props) {
  console.log('[Vue3 子应用] mount', props);
  
  const { mainRouter, routerBase, globalState, showNotification } = props;
  
  // 创建应用
  app = createApp(App);
  
  // 创建路由
  router = createRouter({
    history: createWebHistory(routerBase),
    routes
  });
  
  // 创建状态管理
  pinia = createPinia();
  
  // 注册全局属性
  app.config.globalProperties.$mainRouter = mainRouter;
  app.config.globalProperties.$showNotification = showNotification;
  
  app.use(router);
  app.use(pinia);
  
  app.mount('#subapp-vue3');
  
  // 监听全局状态
  globalState.onGlobalStateChange((state, prev) => {
    console.log('[Vue3 子应用] 全局状态变化:', state, prev);
  }, true);
}

export async function unmount() {
  console.log('[Vue3 子应用] unmount');
  app.unmount();
  app = null;
  router = null;
  pinia = null;
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  mount({
    mainRouter: null,
    routerBase: '/',
    globalState: null,
    showNotification: () => {}
  });
}
```

**5. 注意事项**

1. **样式隔离**：
   - 使用 `strictStyleIsolation` 隔离样式
   - 使用 CSS Modules 或 Scoped CSS
   - 避免使用全局样式

2. **JS 沙箱**：
   - qiankun 提供了 JS 沙箱隔离
   - 避免修改全局变量
   - 使用快照沙箱或代理沙箱

3. **版本兼容**：
   - Vue 2 和 Vue 3 可以共存
   - 注意路由库的版本兼容性
   - 状态管理方案需要统一

4. **性能优化**：
   - 使用预加载
   - 合理设置缓存策略
   - 避免重复加载资源

---

## Git 版本管理
