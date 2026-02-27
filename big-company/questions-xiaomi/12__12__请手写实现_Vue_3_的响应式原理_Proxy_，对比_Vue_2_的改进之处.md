# 12. 请手写实现 Vue 3 的响应式原理（Proxy），对比 Vue 2 的改进之处

**答案：**

```javascript
// 依赖收集
let activeEffect = null;
const targetMap = new WeakMap();

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

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 响应式对象
function reactive(target) {
  if (!isObject(target)) return target;
  
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      
      if (isObject(result)) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    }
  });
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

// ref
function ref(value) {
  return {
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(this, 'value');
      }
    }
  };
}

// effect
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// computed
function computed(getter) {
  let value;
  let dirty = true;
  
  const runner = effect(() => {
    value = getter();
    dirty = false;
  });
  
  return {
    get value() {
      if (dirty) {
        runner();
      }
      return value;
    }
  };
}
```

**Vue 3 相比 Vue 2 的改进：**

1. 使用 Proxy 替代 Object.defineProperty
2. 支持检测对象属性的添加和删除
3. 支持检测数组索引和长度的变化
4. 支持 Map、Set、WeakMap、WeakSet 等数据结构
5. 性能更好，不需要预先遍历所有属性
6. 更好的 TypeScript 支持

---
