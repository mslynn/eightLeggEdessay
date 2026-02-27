# 2. 请手写实现 `call`、`apply`、`bind`，并说明三者的区别

**答案：**

```javascript
// call 实现
Function.prototype.myCall = function(context, ...args) {
  // 处理 context 为 null 或 undefined 的情况
  context = context || window;
  
  // 创建唯一属性名，避免覆盖原有属性
  const fn = Symbol('fn');
  context[fn] = this;
  
  const result = context[fn](...args);
  
  delete context[fn];
  
  return result;
};

// apply 实现
Function.prototype.myApply = function(context, args) {
  context = context || window;
  
  const fn = Symbol('fn');
  context[fn] = this;
  
  const result = context[fn](...(args || []));
  
  delete context[fn];
  
  return result;
};

// bind 实现
Function.prototype.myBind = function(context, ...args) {
  const self = this;
  
  const boundFn = function(...newArgs) {
    // 判断是否作为构造函数调用
    const isNewCall = this instanceof boundFn;
    
    // 构造函数调用时，this 指向新创建的实例
    // 普通函数调用时，this 指向 context
    const ctx = isNewCall ? this : context;
    
    return self.apply(ctx, args.concat(newArgs));
  };
  
  // 维护原型链
  if (this.prototype) {
    boundFn.prototype = Object.create(this.prototype);
  }
  
  return boundFn;
};

// 测试
const obj = { name: 'Bob' };

function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

greet.myCall(obj, 'Hello', '!'); // 'Hello, Bob!'
greet.myApply(obj, ['Hi', '!!']); // 'Hi, Bob!!'

const boundGreet = greet.myBind(obj, 'Hey');
boundGreet('?'); // 'Hey, Bob?'
```

**三者的区别：**

- `call`：立即调用函数，参数逐个传递
- `apply`：立即调用函数，参数以数组形式传递
- `bind`：不立即调用，返回一个新函数，参数可以分批传递

---
