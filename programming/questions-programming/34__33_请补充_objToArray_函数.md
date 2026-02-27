## 33. 请补充 objToArray 函数

**题目：** 实现objToArray函数，将对象转换为数组。

**参考答案：**

```javascript
// 方法1：将对象的键值对转换为数组
function objToArray(obj) {
  return Object.entries(obj);
}

// 方法2：转换为键数组
function objToKeysArray(obj) {
  return Object.keys(obj);
}

// 方法3：转换为值数组
function objToValuesArray(obj) {
  return Object.values(obj);
}

// 方法4：转换为指定格式的数组
function objToArrayCustom(obj, format = 'entries') {
  switch (format) {
    case 'keys':
      return Object.keys(obj);
    case 'values':
      return Object.values(obj);
    case 'entries':
    default:
      return Object.entries(obj);
  }
}

// 测试
const obj = { a: 1, b: 2, c: 3 };

console.log(objToArray(obj));
// [['a', 1], ['b', 2], ['c', 3]]

console.log(objToKeysArray(obj));
// ['a', 'b', 'c']

console.log(objToValuesArray(obj));
// [1, 2, 3]

console.log(objToArrayCustom(obj, 'keys'));
// ['a', 'b', 'c']

console.log(objToArrayCustom(obj, 'values'));
// [1, 2, 3]

console.log(objToArrayCustom(obj, 'entries'));
// [['a', 1], ['b', 2], ['c', 3]]

// 嵌套对象转换为数组
function nestedObjToArray(obj) {
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: typeof value === 'object' && value !== null
      ? nestedObjToArray(value)
      : value
  }));
}

const nestedObj = {
  a: 1,
  b: { c: 2, d: { e: 3 } }
};

console.log(nestedObjToArray(nestedObj));
// [
//   { key: 'a', value: 1 },
//   {
//     key: 'b',
//     value: [
//       { key: 'c', value: 2 },
//       { key: 'd', value: [{ key: 'e', value: 3 }] }
//     ]
//   }
// ]
```

---