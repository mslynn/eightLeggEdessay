# 11. hybrid 开发 js 与原生交互的原理

**答案：**

**Hybrid 开发是指使用 Web 技术（HTML/CSS/JavaScript）开发移动应用，与原生功能进行交互。**

**JS 与原生交互的方式：**

**1. WebView 交互（iOS/Android）**

```javascript
// JavaScript 调用原生
// Android
if (window.AndroidInterface) {
  window.AndroidInterface.callNativeMethod('参数')
}

// iOS
if (window.webkit && window.webkit.messageHandlers) {
  window.webkit.messageHandlers.NativeMethod.postMessage('参数')
}
```

```java
// Android 原生调用 JavaScript
webView.loadUrl("javascript:callJsMethod('参数')")

// 或使用 evaluateJavascript
webView.evaluateJavascript("callJsMethod('参数')", null)
```

```swift
// iOS 原生调用 JavaScript
webView.evaluateJavaScript("callJsMethod('参数')") { result, error in
    print(result)
}
```

**2. Bridge 模式**

```javascript
// JavaScript Bridge
const bridge = {
  callNative(method, params, callback) {
    const message = {
      method,
      params,
      callbackId: generateCallbackId()
    }

    // 保存回调
    callbacks[message.callbackId] = callback

    // 发送消息到原生
    if (window.AndroidBridge) {
      window.AndroidBridge.postMessage(JSON.stringify(message))
    } else if (window.webkit.messageHandlers.NativeBridge) {
      window.webkit.messageHandlers.NativeBridge.postMessage(message)
    }
  },

  // 原生调用 JavaScript
  onNativeMessage(message) {
    const { callbackId, result } = message
    const callback = callbacks[callbackId]
    if (callback) {
      callback(result)
      delete callbacks[callbackId]
    }
  }
}

// 使用
bridge.callNative('getUserInfo', {}, (result) => {
  console.log('用户信息:', result)
})
```

**3. URL Scheme**

```javascript
// JavaScript 使用 URL Scheme 调用原生
function callNativeWithScheme(scheme, params) {
  const url = `${scheme}://action?${Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')}`

  // 创建隐藏的 iframe 触发
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)

  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 100)
}

// 使用
callNativeWithScheme('myapp', {
  action: 'openCamera',
  callback: 'callbackId'
})
```

```java
// Android 拦截 URL Scheme
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("myapp://")) {
            // 解析 URL，调用原生方法
            parseAndHandleUrl(url);
            return true;
        }
        return false;
    }
});
```

**4. JS 注入**

```javascript
// 原生注入 JavaScript 对象
// Android
webView.addJavascriptInterface(new Object() {
    @JavascriptInterface
    public String getDeviceInfo() {
        return "设备信息";
    }
}, "NativeInterface");

// JavaScript 调用
const deviceInfo = window.NativeInterface.getDeviceInfo()
```

**5. 通信协议设计**

```javascript
// 统一的通信协议
const protocol = {
  // 调用原生
  callNative(action, data, options = {}) {
    const message = {
      id: generateId(),
      action,
      data,
      timestamp: Date.now(),
      options
    }

    return new Promise((resolve, reject) => {
      // 保存 Promise
      pendingPromises[message.id] = { resolve, reject }

      // 发送消息
      postMessage(message)
    })
  },

  // 接收原生消息
  onNativeMessage(message) {
    const { id, result, error } = message
    const promise = pendingPromises[id]

    if (promise) {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(result)
      }
      delete pendingPromises[id]
    }
  }
}

// 使用
async function getUserInfo() {
  try {
    const userInfo = await protocol.callNative('getUserInfo', {})
    console.log('用户信息:', userInfo)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
```

**安全注意事项：**

```javascript
// 1. 验证来源
function validateOrigin(origin) {
  const allowedOrigins = ['https://example.com']
  return allowedOrigins.includes(origin)
}

// 2. 数据验证
function validateData(data) {
  if (typeof data !== 'object') {
    throw new Error('Invalid data format')
  }
  // 更多验证...
}

// 3. 防止 XSS
function sanitizeInput(input) {
  return input.replace(/<[^>]*>/g, '')
}
```

---
