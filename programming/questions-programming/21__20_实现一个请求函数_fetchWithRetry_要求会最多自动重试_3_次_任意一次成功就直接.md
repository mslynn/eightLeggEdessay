## 20. 实现一个请求函数：fetchWithRetry，要求会最多自动重试 3 次，任意一次成功就直接返回

**题目：** 实现一个带重试机制的请求函数，最多重试3次。

**参考答案：**

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed:`, error.message);

      // 如果不是最后一次重试，等待一段时间再重试
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 指数退避：1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 所有重试都失败
  throw lastError;
}

// 使用示例
async function testFetchWithRetry() {
  try {
    // 测试成功的请求
    const response = await fetchWithRetry('https://api.example.com/data');
    const data = await response.json();
    console.log('Success:', data);

    // 测试失败的请求（会重试3次）
    // const response2 = await fetchWithRetry('https://invalid-url.example.com');
  } catch (error) {
    console.error('All retries failed:', error.message);
  }
}

// testFetchWithRetry();

// 更完善的版本，支持自定义重试条件
async function fetchWithRetryAdvanced(
  url,
  options = {},
  { maxRetries = 3, retryCondition = null, retryDelay = 1000 } = {}
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      // 检查是否需要重试
      const shouldRetry = retryCondition
        ? await retryCondition(response, i)
        : !response.ok;

      if (!shouldRetry) {
        return response;
      }

      throw new Error(`Request failed with status: ${response.status}`);

    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed:`, error.message);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError;
}

// 使用示例
async function testAdvanced() {
  try {
    const response = await fetchWithRetryAdvanced(
      'https://api.example.com/data',
      {},
      {
        maxRetries: 5,
        retryCondition: async (response, attempt) => {
          // 只在5xx错误时重试
          return response.status >= 500;
        },
        retryDelay: 2000
      }
    );
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('All retries failed:', error.message);
  }
}
```

---