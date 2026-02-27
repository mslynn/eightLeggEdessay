# 5. 请说下 Vue 3 的 ref、reactive、computed 跟 watch，Watch 可以执行异步操作吗？

**答案：**

Vue 3 的响应式系统基于 Proxy API 实现，提供了 ref、reactive、computed、watch 等 API 来管理响应式数据。

**1. ref**

**基本用法**

```javascript
import { ref } from 'vue';

// 创建 ref
const count = ref(0);
const message = ref('Hello');
const user = ref({ name: '张三', age: 18 });

// 访问值（在 JS 中需要 .value）
console.log(count.value);  // 0
console.log(message.value);  // 'Hello'
console.log(user.value.name);  // '张三'

// 修改值
count.value = 1;
message.value = 'World';
user.value.name = '李四';
```

**在组件中使用**

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Message: {{ message }}</p>
    <p>User: {{ user.name }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello');
const user = ref({ name: '张三', age: 18 });

function increment() {
  count.value++;
}
</script>
```

**ref 的实现原理**

```javascript
// 简化的 ref 实现
function ref(value) {
  return createRef(value, false);
}

function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  
  return new RefImpl(rawValue, shallow);
}

class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = undefined;
    this.__v_isRef = true;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : toReactive(value);
  }
  
  get value() {
    trackRefValue(this);  // 收集依赖
    return this._value;
  }
  
  set value(newVal) {
    newVal = this.__v_isShallow ? newVal : toRaw(newVal);
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this.__v_isShallow ? newVal : toReactive(newVal);
      triggerRefValue(this);  // 触发更新
    }
  }
}

// 转换为响应式对象
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
```

**2. reactive**

**基本用法**

```javascript
import { reactive } from 'vue';

// 创建 reactive 对象
const state = reactive({
  count: 0,
  message: 'Hello',
  user: {
    name: '张三',
    age: 18
  }
});

// 访问值（无需 .value）
console.log(state.count);  // 0
console.log(state.message);  // 'Hello'
console.log(state.user.name);  // '张三'

// 修改值
state.count = 1;
state.message = 'World';
state.user.name = '李四';

// 添加新属性
state.newProp = 'new value';

// 删除属性
delete state.newProp;
```

**在组件中使用**

```vue
<template>
  <div>
    <p>Count: {{ state.count }}</p>
    <p>Message: {{ state.message }}</p>
    <p>User: {{ state.user.name }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  message: 'Hello',
  user: {
    name: '张三',
    age: 18
  }
});

function increment() {
  state.count++;
}
</script>
```

**reactive 的实现原理**

```javascript
// 简化的 reactive 实现
function reactive(target) {
  if (isObject(target)) {
    return target;
  }
  
  return createReactiveObject(target, mutableHandlers);
}

function createReactiveObject(target, baseHandlers) {
  const proxy = new Proxy(target, baseHandlers);
  
  // 缓存 proxy
  const reactiveMap = new Map();
  reactiveMap.set(target, proxy);
  
  return proxy;
}

// 响应式处理器
const mutableHandlers = {
  get(target, key, receiver) {
    const result = Reflect.get(target, key, receiver);
    
    // 收集依赖
    track(target, key);
    
    // 嵌套对象需要递归转换
    if (isObject(result)) {
      return reactive(result);
    }
    
    return result;
  },
  
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    
    // 触发更新
    if (hasChanged(value, oldValue)) {
      trigger(target, key);
    }
    
    return result;
  },
  
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const result = Reflect.deleteProperty(target, key);
    
    if (result && hadKey) {
      trigger(target, key);
    }
    
    return result;
  }
};

// 依赖收集
const targetMap = new WeakMap();
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      effect();
    });
  }
}
```

**3. computed**

**基本用法**

```javascript
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);
const tripleCount = computed(() => count.value * 3);

// 只读 computed
console.log(doubleCount.value);  // 0
count.value = 1;
console.log(doubleCount.value);  // 2

// 可写 computed
const firstName = ref('张');
const lastName = ref('三');
const fullName = computed({
  get() {
    return firstName.value + lastName.value;
  },
  set(newValue) {
    const names = newValue.split(' ');
    firstName.value = names[0];
    lastName.value = names[1];
  }
});

console.log(fullName.value);  // '张三'
fullName.value = '李四';
console.log(firstName.value);  // '李'
console.log(lastName.value);  // '四'
```

**在组件中使用**

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double Count: {{ doubleCount }}</p>
    <p>Full Name: {{ fullName }}</p>
    <input v-model="fullName" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

const firstName = ref('张');
const lastName = ref('三');
const fullName = computed({
  get() {
    return firstName.value + lastName.value;
  },
  set(newValue) {
    const names = newValue.split(' ');
    firstName.value = names[0];
    lastName.value = names[1];
  }
});
</script>
```

**computed 的实现原理**

```javascript
// 简化的 computed 实现
function computed(getterOrOptions) {
  let getter;
  let setter;
  
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.warn('Write operation failed: computed value is readonly');
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  
  const cRef = new ComputedRefImpl(getter, setter);
  
  return cRef;
}

class ComputedRefImpl {
  constructor(getter, setter) {
    this._getter = getter;
    this._setter = setter;
    this._value = undefined;
    this._dirty = true;  // 脏检查标记
    this.dep = undefined;
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
  }
  
  get value() {
    // 收集依赖
    trackRefValue(this);
    
    // 脏检查，需要重新计算
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    
    return this._value;
  }
  
  set value(newValue) {
    this._setter(newValue);
  }
}

// 响应式效果
class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
  }
  
  run() {
    if (!this.active) {
      return this.fn();
    }
    
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = null;
    }
  }
  
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
}
```

**4. watch**

**基本用法**

```javascript
import { ref, reactive, watch } from 'vue';

const count = ref(0);
const state = reactive({
  name: '张三',
  age: 18
});

// 监听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count changed: ${oldValue} -> ${newValue}`);
});

// 监听 reactive 对象
watch(
  () => state.age,
  (newValue, oldValue) => {
    console.log(`age changed: ${oldValue} -> ${newValue}`);
  }
);

// 监听多个源
watch(
  [count, () => state.age],
  ([newCount, newAge], [oldCount, oldAge]) => {
    console.log(`changed: count ${oldCount} -> ${newCount}, age ${oldAge} -> ${newAge}`);
  }
);

// 立即执行
watch(
  count,
  (newValue) => {
    console.log(`count: ${newValue}`);
  },
  { immediate: true }
);

// 深度监听
watch(
  state,
  (newValue, oldValue) => {
    console.log('state changed');
  },
  { deep: true }
);

// 一次性监听
const stopWatch = watch(count, (newValue) => {
  console.log(`count: ${newValue}`);
});

// 停止监听
stopWatch();
```

**watch 可以执行异步操作吗？**

**可以！watch 支持异步操作。**

```javascript
import { ref, watch } from 'vue';

const userId = ref(1);

// watch 中的异步操作
watch(
  userId,
  async (newUserId, oldUserId) => {
    console.log(`User ID changed: ${oldUserId} -> ${newUserId}`);
    
    try {
      // 异步获取用户数据
      const response = await fetch(`https://api.example.com/users/${newUserId}`);
      const user = await response.json();
      
      console.log('User data:', user);
      // 更新用户数据
      // userData.value = user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }
);

// 防抖的异步 watch
import { debounce } from 'lodash-es';

const searchQuery = ref('');

watch(
  searchQuery,
  debounce(async (query) => {
    if (!query) return;
    
    try {
      // 异步搜索
      const response = await fetch(`https://api.example.com/search?q=${query}`);
      const results = await response.json();
      
      console.log('Search results:', results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, 500)
);

// 带取消功能的异步 watch
watch(
  userId,
  async (newUserId, oldUserId, onCleanup) => {
    let cancelled = false;
    
    // 清理函数
    onCleanup(() => {
      cancelled = true;
      console.log('Cleanup previous request');
    });
    
    try {
      const response = await fetch(`https://api.example.com/users/${newUserId}`);
      
      // 如果已取消，不处理结果
      if (cancelled) {
        console.log('Request cancelled');
        return;
      }
      
      const user = await response.json();
      console.log('User data:', user);
    } catch (error) {
      if (!cancelled) {
        console.error('Failed to fetch user:', error);
      }
    }
  }
);

// watchEffect（自动追踪依赖）
import { watchEffect } from 'vue';

const count = ref(0);
const doubled = ref(0);

watchEffect(() => {
  doubled.value = count.value * 2;
  console.log(`count: ${count.value}, doubled: ${doubled.value}`);
});

count.value = 1;  // 自动触发
count.value = 2;  // 自动触发
```

**watch 的实现原理**

```javascript
// 简化的 watch 实现
function watch(source, cb, options = {}) {
  const { immediate, deep } = options;
  
  let getter;
  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;  // reactive 默认深度监听
  } else if (isFunction(source)) {
    getter = source;
  } else if (isArray(source)) {
    getter = () => source.map(s => (isRef(s) ? s.value : s));
  }
  
  let oldValue;
  let cleanup;
  
  const onCleanup = (fn) => {
    cleanup = fn;
  };
  
  const job = () => {
    if (cleanup) {
      cleanup();
    }
    
    const newValue = effect.run();
    
    if (immediate || hasChanged(newValue, oldValue)) {
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    }
  };
  
  const scheduler = () => {
    job();
  };
  
  const effect = new ReactiveEffect(getter, scheduler);
  
  if (immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
  
  const stop = () => {
    effect.stop();
  };
  
  return stop;
}

// watchEffect 实现
function watchEffect(effect, options = {}) {
  const runner = new ReactiveEffect(effect, () => {
    flush();
  });
  
  const flush = () => {
    runner.run();
  };
  
  if (options.flush === 'post') {
    queuePostFlushCb(flush);
  } else {
    flush();
  }
  
  const stop = () => {
    runner.stop();
  };
  
  return stop;
}
```

**5. 实际应用示例**

```vue
<template>
  <div>
    <input v-model="searchQuery" placeholder="Search..." />
    <ul v-if="results.length > 0">
      <li v-for="item in results" :key="item.id">{{ item.name }}</li>
    </ul>
    <p v-if="loading">Loading...</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { debounce } from 'lodash-es';

const searchQuery = ref('');
const results = ref([]);
const loading = ref(false);
const error = ref(null);

// 防抖搜索
watch(
  searchQuery,
  debounce(async (query) => {
    if (!query.trim()) {
      results.value = [];
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      results.value = data.results;
    } catch (err) {
      error.value = 'Failed to search';
      results.value = [];
    } finally {
      loading.value = false;
    }
  }, 500)
);

// 计算属性
const hasResults = computed(() => results.value.length > 0);
</script>
```

**总结：**

1. **ref**：用于包装基本类型和对象，需要通过 `.value` 访问
2. **reactive**：用于创建响应式对象，直接访问属性
3. **computed**：计算属性，基于其他响应式数据计算，有缓存
4. **watch**：监听数据变化，支持异步操作，可以执行 API 请求、防抖等异步任务

**watch 完全支持异步操作**，这是它的一个重要特性，可以用于处理数据验证、API 请求、防抖等场景。

---

## 前端性能优化
