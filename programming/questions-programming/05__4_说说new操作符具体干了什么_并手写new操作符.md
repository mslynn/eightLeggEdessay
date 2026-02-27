## 4. 说说new操作符具体干了什么？并手写new操作符

**题目：** 说明new操作符的作用，并手写实现一个new操作符。

**参考答案：**

**new操作符的作用：**
1. 创建一个新对象
2. 将新对象的原型指向构造函数的prototype
3. 将构造函数的this指向新对象
4. 执行构造函数
5. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象

**手写new：**

```javascript
function myNew(constructor, ...args) {
  // 1. 创建一个新对象
  const obj = {};

  // 2. 将新对象的原型指向构造函数的prototype
  Object.setPrototypeOf(obj, constructor.prototype);

  // 3. 执行构造函数，将this指向新对象
  const result = constructor.apply(obj, args);

  // 4. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const person = myNew(Person, 'Alice', 25);
console.log(person); // Person { name: 'Alice', age: 25 }
```

---