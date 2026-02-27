## 8. 说说ajax的原理，以及如何实现？

**题目：** 说明AJAX的原理，并手写实现一个AJAX请求函数。

**参考答案：**

**AJAX原理：**
AJAX（Asynchronous JavaScript and XML）是一种创建交互式网页应用的技术。它允许在不重新加载整个页面的情况下，与服务器交换数据并更新部分网页内容。

核心是通过XMLHttpRequest对象向服务器发送异步请求，获取数据后通过DOM操作更新页面。

**手写AJAX：**

```javascript
function ajax(options) {
  return new Promise((resolve, reject) => {
    const {
      method = 'GET',
      url,
      data = null,
      headers = {},
      timeout = 0
    } = options;

    const xhr = new XMLHttpRequest();

    // 设置超时
    if (timeout > 0) {
      xhr.timeout = timeout;
    }

    // 处理响应
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = xhr.responseText;
            const contentType = xhr.getResponseHeader('Content-Type');

            if (contentType && contentType.includes('application/json')) {
              resolve(JSON.parse(response));
            } else {
              resolve(response);
            }
          } catch (error) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Request failed with status ${xhr.status}`));
        }
      }
    };

    // 处理超时
    xhr.ontimeout = function() {
      reject(new Error('Request timeout'));
    };

    // 处理错误
    xhr.onerror = function() {
      reject(new Error('Network error'));
    };

    // 处理请求中止
    xhr.onabort = function() {
      reject(new Error('Request aborted'));
    };

    // 打开请求
    xhr.open(method, url, true);

    // 设置请求头
    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }

    // 发送请求
    if (method === 'GET' || !data) {
      xhr.send();
    } else if (typeof data === 'object') {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send(data);
    }
  });
}

// 使用示例
// GET请求
ajax({
  method: 'GET',
  url: '/api/users'
})
  .then(data => console.log(data))
  .catch(error => console.error(error));

// POST请求
ajax({
  method: 'POST',
  url: '/api/users',
  data: { name: 'Alice', age: 25 },
  headers: {
    'Authorization': 'Bearer token'
  },
  timeout: 5000
})
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---