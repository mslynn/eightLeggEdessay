# 4. 请手写实现 `instanceof`，并说明其工作原理

**答案：**

```javascript
function myInstanceof(left, right) {
  // 获取 right 的原型
  let prototype = right.prototype;
  
  // 获取 left 的原型链
  left = left.__proto__;
  
  // 遍历原型链
  while (true) {
    if (left === null) {
      return false;
    }
    
    if (left === prototype) {
      return true;
    }
    
    left = left.__proto__;
  }
}

// 测试
function Person() {}
const person = new Person();

console.log(myInstanceof(person, Person)); // true
console.log(myInstanceof(person, Object)); // true
console.log(myInstanceof(person, Array)); // false
```

**工作原理：**
`instanceof` 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。

---
