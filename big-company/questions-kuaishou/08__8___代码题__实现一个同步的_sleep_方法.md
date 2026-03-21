# 8. 【代码题】实现一个同步的 sleep 方法

**答案：**

```javascript
// Promise 版本（异步）
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function example() {
  console.log('开始');
  await sleep(1000);
  console.log('1秒后');
}

// 同步版本（仅限 Node.js，不推荐）
function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // 阻塞主线程
  }
}

// 可取消的 sleep
function sleepWithCancel(ms) {
  let timeoutId;
  const promise = new Promise(resolve => {
    timeoutId = setTimeout(resolve, ms);
  });
  
  promise.cancel = () => clearTimeout(timeoutId);
  return promise;
}
```

---