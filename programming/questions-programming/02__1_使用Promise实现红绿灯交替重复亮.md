## 1. 使用Promise实现红绿灯交替重复亮

**题目：** 使用Promise实现红绿灯交替重复亮灯，红灯3秒，绿灯2秒，黄灯1秒，循环往复。

**参考答案：**

```javascript
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function trafficLight() {
  while (true) {
    console.log('红灯');
    await sleep(3000);
    console.log('绿灯');
    await sleep(2000);
    console.log('黄灯');
    await sleep(1000);
  }
}

// 调用
// trafficLight();
```

---