# 11. 请手写实现 Vue 2 的响应式原理（Object.defineProperty），并说明其局限性

**答案：**

```javascript
// 观察者
class Dep {
  constructor() {
    this.subs = [];
  }
  
  addSub(sub) {
    this.subs.push(sub);
  }
  
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

Dep.target = null;

// 监听器
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.cb = cb;
    this.value = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.vm[this.expOrFn];
    Dep.target = null;
    return value;
  }
  
  update() {
    const oldValue = this.value;
    const newValue = this.get();
    if (newValue !== oldValue) {
      this.cb.call(this.vm, newValue, oldValue);
    }
  }
}

// 定义响应式
function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  let childOb = observe(val);
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.addSub(Dep.target);
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

// 观察对象
function observe(value) {
  if (!value || typeof value !== 'object') {
    return;
  }
  
  return new Observer(value);
}

class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    
    if (Array.isArray(value)) {
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  
  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key]);
    });
  }
  
  observeArray(items) {
    items.forEach(item => observe(item));
  }
}
```

**局限性：**

1. 无法检测对象属性的添加或删除
2. 无法检测数组索引和长度的变化
3. 必须遍历对象的每个属性，性能开销大
4. 不支持 Map、Set、WeakMap、WeakSet 等数据结构

---
