# 9. 请说下 JavaScript 异步编程的方式，如回调函数、Promise、async/await、事件循环等？

**答案：**

JavaScript 是单线程语言，异步编程是其处理 I/O 操作的核心机制。理解异步编程对于编写高效的 JavaScript 代码至关重要。

**1. 单线程与事件循环**

**JavaScript 执行模型**

```javascript
// JavaScript 是单线程的
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

console.log('3');

// 输出顺序：1 -> 3 -> 2
// 原因：setTimeout 的回调被放入任务队列，等待主线程执行完毕后才执行
```

**事件循环（Event Loop）**

```javascript
// 事件循环的执行顺序
console.log('1');

setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// 输出顺序：1 -> 4 -> 3 -> 2
// 
// 解释：
// 1. console.log('1') - 同步执行
// 2. setTimeout - 宏任务，放入宏任务队列
// 3. Promise.then - 微任务，放入微任务队列
// 4. console.log('4') - 同步执行
// 5. 同步代码执行完毕，检查微任务队列
// 6. 执行 Promise.then -> 输出 3
// 7. 微任务队列为空，执行宏任务队列
// 8. 执行 setTimeout 回调 -> 输出 2
```

**宏任务与微任务**

```javascript
// 宏任务（Macro Task）
// - setTimeout
// - setInterval
// - setImmediate (Node.js)
// - I/O 操作
// - UI 渲染

// 微任务（Micro Task）
// - Promise.then/catch/finally
// - process.nextTick (Node.js)
// - MutationObserver

// 执行顺序示例
console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  Promise.resolve().then(() => {
    console.log('Promise inside Timeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
  setTimeout(() => {
    console.log('Timeout inside Promise');
  }, 0);
});

Promise.resolve().then(() => {
  console.log('Promise 2');
});

console.log('End');

// 输出顺序：
// Start
// End
// Promise 1
// Promise 2
// Timeout 1
// Promise inside Timeout
// Timeout inside Promise
```

**2. 回调函数（Callback）**

**基本用法**

```javascript
// 同步回调
function processArray(arr, callback) {
  const result = arr.map(item => callback(item));
  return result;
}

const doubled = processArray([1, 2, 3], x => x * 2);
console.log(doubled); // [2, 4, 6]

// 异步回调
function fetchData(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function() {
    if (xhr.status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback(new Error('Request failed'));
    }
  };
  xhr.onerror = function() {
    callback(new Error('Network error'));
  };
  xhr.send();
}

fetchData('https://api.example.com/data', (error, data) => {
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
});
```

**回调地狱**

```javascript
// 回调地狱：嵌套过深，难以维护
fetchData(url1, (error1, data1) => {
  if (error1) {
    console.error(error1);
  } else {
    fetchData(url2, (error2, data2) => {
      if (error2) {
        console.error(error2);
      } else {
        fetchData(url3, (error3, data3) => {
          if (error3) {
            console.error(error3);
          } else {
            console.log(data3);
          }
        });
      }
    });
  }
});
```

**3. Promise**

**基本用法**

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    
    if (success) {
      resolve('Operation succeeded');
    } else {
      reject(new Error('Operation failed'));
    }
  }, 1000);
});

// 使用 Promise
promise
  .then(result => {
    console.log(result); // 'Operation succeeded'
    return 'Next step';
  })
  .then(result => {
    console.log(result); // 'Next step'
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('Cleanup');
  });
```

**Promise 链式调用**

```javascript
// 顺序执行
function getUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json());
}

function getPosts(userId) {
  return fetch(`/api/users/${userId}/posts`)
    .then(response => response.json());
}

getUser(1)
  .then(user => {
    console.log('User:', user);
    return getPosts(user.id);
  })
  .then(posts => {
    console.log('Posts:', posts);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

**catch 后面可以跟 then 和 catch**

```javascript
// catch 后面可以继续 then
Promise.reject(new Error('First error'))
  .catch(error => {
    console.error('Catch:', error.message);
    // 返回一个值，下一个 then 会接收到
    return 'Recovery value';
  })
  .then(value => {
    console.log('After catch:', value); // 'Recovery value'
  });

// catch 后面可以再 catch（处理新的错误）
Promise.reject(new Error('First error'))
  .catch(error => {
    console.error('First catch:', error.message);
    // 抛出一个新错误
    throw new Error('New error');
  })
  .catch(error => {
    console.error('Second catch:', error.message); // 'New error'
  });

// 实际应用：错误恢复后继续处理
fetch('/api/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP error');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Request failed:', error);
    // 返回默认数据，让流程继续
    return { fallback: true, data: [] };
  })
  .then(result => {
    // 无论是否出错，这里都会执行
    if (result.fallback) {
      console.log('Using fallback data');
    }
    console.log('Result:', result);
  });

// 多个 catch 串联
Promise.resolve()
  .then(() => {
    throw new Error('Error 1');
  })
  .catch(error => {
    console.log('Catch 1:', error.message);
    // 没有抛出错误，后续 then 会执行
  })
  .then(() => {
    console.log('Continue after catch 1');
    throw new Error('Error 2');
  })
  .catch(error => {
    console.log('Catch 2:', error.message);
    return 'Recovered';
  })
  .then(value => {
    console.log('Final then:', value);
  });

// 输出：
// Catch 1: Error 1
// Continue after catch 1
// Catch 2: Error 2
// Final then: Recovered
```

**重要说明：**

1. **catch 后面可以跟 then**
   - 如果 catch 中没有抛出错误，后续的 then 会正常执行
   - catch 可以返回一个值，该值会传递给下一个 then

2. **catch 后面可以再 catch**
   - 如果 catch 中抛出新错误，后续的 catch 会捕获
   - 可以用于多层错误处理和恢复

3. **finally 的特性**
   - finally 无论成功或失败都会执行
   - finally 后面可以继续跟 then 或 catch
   - finally 的返回值会被忽略（除非抛出错误）

```javascript
Promise.reject(new Error('Error'))
  .catch(error => {
    console.log('Catch:', error.message);
    return 'Value from catch';
  })
  .finally(() => {
    console.log('Finally');
    // finally 的返回值会被忽略
    return 'Value from finally'; // 会被忽略
  })
  .then(value => {
    console.log('After finally:', value); // 'Value from catch'
  });

// 输出：
// Catch: Error
// Finally
// After finally: Value from catch
```

4. **错误处理最佳实践**
   ```javascript
   // 推荐：在链的末尾只使用一个 catch
   promise
     .then(step1)
     .then(step2)
     .then(step3)
     .catch(error => {
       // 统一处理所有错误
       console.error('Error:', error);
     });
   
   // 避免：多个 catch 会导致逻辑混乱
   promise
     .then(step1)
     .catch(error => {
       // 处理特定错误
     })
     .then(step2)
     .catch(error => {
       // 再次处理错误
     });
   ```

**Promise 并行执行**

```javascript
// Promise.all - 所有 Promise 都成功才成功
Promise.all([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
  .then(responses => Promise.all(responses.map(r => r.json())))
  .then(data => {
    const [users, posts, comments] = data;
    console.log(users, posts, comments);
  })
  .catch(error => {
    console.error('One request failed:', error);
  });

// Promise.allSettled - 返回所有 Promise 的结果
Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Request ${index}:`, result.value);
      } else {
        console.error(`Request ${index}:`, result.reason);
      }
    });
  });

// Promise.race - 返回第一个完成的 Promise
Promise.race([
  fetch('/api/fast'),
  fetch('/api/slow')
])
  .then(response => {
    console.log('First response:', response);
  });

// Promise.any - 返回第一个成功的 Promise
Promise.any([
  Promise.reject(new Error('Failed 1')),
  Promise.reject(new Error('Failed 2')),
  Promise.resolve('Success')
])
  .then(result => {
    console.log(result); // 'Success'
  })
  .catch(error => {
    console.error('All failed:', error);
  });
```

**4. async/await**

**基本用法**

```javascript
// async 函数返回 Promise
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}

// 使用
fetchData().then(data => {
  console.log(data);
});

// 等价于
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json());
}
```

**错误处理**

```javascript
// try-catch
async function getData() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error; // 重新抛出错误
  }
}

// 多个 await
async function getMultipleData() {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**并发控制**

```javascript
// 限制并发数
async function fetchAll(urls, maxConcurrent = 5) {
  const results = [];
  const executing = [];
  
  for (const url of urls) {
    const promise = fetch(url).then(r => r.json());
    results.push(promise);
    
    const executingPromise = promise.then(() => {
      executing.splice(executing.indexOf(promise), 1);
    });
    executing.push(executingPromise);
    
    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// 使用
const urls = [
  '/api/users/1',
  '/api/users/2',
  '/api/users/3',
  '/api/users/4',
  '/api/users/5',
  '/api/users/6',
  '/api/users/7',
  '/api/users/8',
  '/api/users/9',
  '/api/users/10'
];

fetchAll(urls, 3).then(results => {
  console.log(results);
});
```

**5. 实际应用示例**

**串行请求**

```javascript
// 使用 async/await
async function getUserWithPosts(userId) {
  try {
    // 1. 获取用户信息
    const userResponse = await fetch(`/api/users/${userId}`);
    const user = await userResponse.json();
    
    // 2. 获取用户的文章
    const postsResponse = await fetch(`/api/users/${userId}/posts`);
    const posts = await postsResponse.json();
    
    // 3. 获取每篇文章的评论
    const postsWithComments = await Promise.all(
      posts.map(async post => {
        const commentsResponse = await fetch(`/api/posts/${post.id}/comments`);
        const comments = await commentsResponse.json();
        return { ...post, comments };
      })
    );
    
    return {
      user,
      posts: postsWithComments
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**并行请求**

```javascript
async function fetchDashboardData() {
  try {
    // 并行请求多个接口
    const [
      users,
      posts,
      comments,
      statistics
    ] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json()),
      fetch('/api/statistics').then(r => r.json())
    ]);
    
    return { users, posts, comments, statistics };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

**重试机制**

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, error.message);
      
      // 指数退避
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }
  
  throw lastError;
}

// 使用
fetchWithRetry('/api/data', {}, 3)
  .then(data => console.log(data))
  .catch(error => console.error('All retries failed:', error));
```

**超时控制**

```javascript
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

// 使用
fetchWithTimeout('/api/data', {}, 3000)
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**6. 异步迭代器**

```javascript
// 异步生成器
async function* fetchPaginatedData(url) {
  let nextPage = url;
  
  while (nextPage) {
    const response = await fetch(nextPage);
    const data = await response.json();
    
    yield data.items;
    
    nextPage = data.nextPage;
  }
}

// 使用
async function processAllData() {
  for await (const items of fetchPaginatedData('/api/data')) {
    console.log('Processing:', items);
    // 处理每页数据
  }
}
```

**总结：**

1. **回调函数**：最基础的异步方式，但容易产生回调地狱
2. **Promise**：提供了链式调用，更好的错误处理
3. **async/await**：基于 Promise 的语法糖，代码更易读
4. **事件循环**：理解 JavaScript 异步执行机制的基础
5. **最佳实践**：
   - 优先使用 async/await
   - 并行请求使用 Promise.all
   - 合理使用错误处理
   - 注意并发控制和超时控制
