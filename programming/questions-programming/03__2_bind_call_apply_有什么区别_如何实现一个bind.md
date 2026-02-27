## 2. bind、call、apply 有什么区别？如何实现一个bind?

**题目：** 说明bind、call、apply的区别，并手写实现一个bind方法。

**参考答案：**

**区别：**
- `call`：立即执行函数，参数逐个传递
- `apply`：立即执行函数，参数以数组形式传递
- `bind`：不立即执行，返回一个新函数，可以预设参数

**手写bind：**

```javascript
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function(...newArgs) {
    return fn.apply(context, [...args, ...newArgs]);
  };
};

// 测试
const obj = { name: 'Alice' };
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const boundGreet = greet.myBind(obj, 'Hello');
boundGreet('!'); // Hello, Alice!
```

---