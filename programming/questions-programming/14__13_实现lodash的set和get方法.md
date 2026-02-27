## 13. 实现lodash的set和get方法

**题目：** 实现lodash的set和get方法，用于安全地获取和设置对象的嵌套属性。

**参考答案：**

```javascript
// get方法
function get(obj, path, defaultValue) {
  const keys = Array.isArray(path) ? path : path.split('.');

  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}

// set方法
function set(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split('.');

  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;

  return obj;
}

// 测试
const obj = {
  user: {
    name: 'Alice',
    address: {
      city: 'New York'
    }
  }
};

// get测试
console.log(get(obj, 'user.name')); // Alice
console.log(get(obj, 'user.address.city')); // New York
console.log(get(obj, 'user.age')); // undefined
console.log(get(obj, 'user.age', 0)); // 0
console.log(get(obj, ['user', 'address', 'city'])); // New York

// set测试
set(obj, 'user.age', 25);
console.log(obj.user.age); // 25

set(obj, 'user.address.zip', '10001');
console.log(obj.user.address.zip); // 10001

set(obj, 'user.email.address', 'alice@example.com');
console.log(obj.user.email.address); // alice@example.com

set(obj, ['user', 'phone'], '123-456-7890');
console.log(obj.user.phone); // 123-456-7890
```

---