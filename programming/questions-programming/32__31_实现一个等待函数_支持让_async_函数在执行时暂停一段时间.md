## 31. 实现一个等待函数，支持让 async 函数在执行时暂停一段时间

**题目：** 实现一个等待函数，让async函数可以暂停指定时间。

**参考答案：**

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用示例
async function example() {
  console.log('Start');

  await sleep(1000);
  console.log('After 1 second');

  await sleep(2000);
  console.log('After another 2 seconds');

  console.log('End');
}

// example();

// 带取消功能的sleep
function sleepCancellable(ms) {
  let timeoutId;
  const promise = new Promise(resolve => {
    timeoutId = setTimeout(resolve, ms);
  });

  const cancel = () => clearTimeout(timeoutId);

  return { promise, cancel };
}

// 使用示例
async function example2() {
  console.log('Start');

  const { promise, cancel } = sleepCancellable(5000);

  // 取消等待
  setTimeout(() => {
    console.log('Canceling sleep...');
    cancel();
  }, 2000);

  await promise;
  console.log('Sleep completed or canceled');
}

// example2();

// 带返回值的sleep
function sleepWithValue(ms, value) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

// 使用示例
async function example3() {
  const result = await sleepWithValue(1000, 'Hello');
  console.log(result); // Hello
}

// example3();
```

---