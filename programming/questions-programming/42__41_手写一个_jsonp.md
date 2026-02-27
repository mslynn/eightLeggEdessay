## 41. 手写一个 jsonp

**题目：** 实现一个JSONP函数，用于跨域请求。

**参考答案：**

```javascript
const jsonp = ({ url, params, callbackName }) => {
  const generateUrl = () => {
    let dataSrc = '';

    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        dataSrc += `${key}=${params[key]}&`;
      }
    }

    dataSrc += `callback=${callbackName}`;
    return `${url}?${dataSrc}`;
  };

  return new Promise((resolve, reject) => {
    const scriptEle = document.createElement('script');
    scriptEle.src = generateUrl();
    scriptEle.onerror = () => {
      reject(new Error('JSONP request failed'));
      document.body.removeChild(scriptEle);
    };

    window[callbackName] = (data) => {
      resolve(data);
      document.body.removeChild(scriptEle);
      delete window[callbackName];
    };

    document.body.appendChild(scriptEle);
  });
};

// 使用示例
// jsonp({
//   url: 'https://api.example.com/data',
//   params: { id: 123 },
//   callbackName: 'callback'
// })
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

// 更完善的版本，支持超时和清理
function jsonpAdvanced({ url, params = {}, callback = 'callback', timeout = 10000 }) {
  return new Promise((resolve, reject) => {
    // 生成唯一的回调函数名
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 构建查询字符串
    const queryString = Object.entries({
      ...params,
      callback: callbackName
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

    const fullUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;

    // 创建script标签
    const script = document.createElement('script');
    script.src = fullUrl;

    // 设置超时
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timeout'));
    }, timeout);

    // 清理函数
    const cleanup = () => {
      clearTimeout(timer);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window[callbackName];
    };

    // 定义全局回调函数
    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    // 错误处理
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP request failed'));
    };

    // 插入DOM
    document.body.appendChild(script);
  });
}

// 使用示例
// jsonpAdvanced({
//   url: 'https://api.example.com/data',
//   params: { id: 123, name: 'test' },
//   timeout: 5000
// })
//   .then(data => console.log('Success:', data))
//   .catch(error => console.error('Error:', error));
```

---