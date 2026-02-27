# 5. 请手写实现深拷贝，需要解决循环引用、Date、RegExp、Map、Set 等特殊情况

**答案：**

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理 Map
  if (obj instanceof Map) {
    const clonedMap = new Map();
    map.set(obj, clonedMap);
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key, map), deepClone(value, map));
    });
    return clonedMap;
  }
  
  // 处理 Set
  if (obj instanceof Set) {
    const clonedSet = new Set();
    map.set(obj, clonedSet);
    obj.forEach(value => {
      clonedSet.add(deepClone(value, map));
    });
    return clonedSet;
  }
  
  // 处理 Array
  if (Array.isArray(obj)) {
    const clonedArray = [];
    map.set(obj, clonedArray);
    for (let i = 0; i < obj.length; i++) {
      clonedArray[i] = deepClone(obj[i], map);
    }
    return clonedArray;
  }
  
  // 处理 Object
  const clonedObj = Object.create(Object.getPrototypeOf(obj));
  map.set(obj, clonedObj);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key], map);
    }
  }
  
  // 处理 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj);
  for (const key of symbolKeys) {
    clonedObj[key] = deepClone(obj[key], map);
  }
  
  return clonedObj;
}

// 测试
const obj = {
  name: 'Alice',
  age: 25,
  hobbies: ['reading', 'coding'],
  date: new Date(),
  reg: /test/g,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  [Symbol('sym')]: 'symbol value'
};

// 循环引用
obj.self = obj;

const cloned = deepClone(obj);
console.log(cloned); // 深拷贝成功
console.log(cloned !== obj); // true
console.log(cloned.self === cloned); // true，循环引用保持
```

---
