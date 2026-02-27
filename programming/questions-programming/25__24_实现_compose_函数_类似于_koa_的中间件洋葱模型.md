## 24. 实现 compose 函数，类似于 koa 的中间件洋葱模型

**题目：** 实现compose函数，支持类似koa的中间件洋葱模型。

**参考答案：**

```javascript
// compose函数
function compose(middlewares) {
  return function(context, next) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;

      const fn = middlewares[i];

      if (i === middlewares.length) {
        fn = next;
      }

      if (!fn) {
        return Promise.resolve();
      }

      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

// 使用示例
const middleware1 = async (ctx, next) => {
  console.log('中间件1 开始');
  ctx.value = 1;
  await next();
  console.log('中间件1 结束, ctx.value =', ctx.value);
};

const middleware2 = async (ctx, next) => {
  console.log('中间件2 开始');
  ctx.value += 2;
  await next();
  console.log('中间件2 结束, ctx.value =', ctx.value);
};

const middleware3 = async (ctx, next) => {
  console.log('中间件3 开始');
  ctx.value += 3;
  await next();
  console.log('中间件3 结束, ctx.value =', ctx.value);
};

const fn = compose([middleware1, middleware2, middleware3]);

const ctx = {};
fn(ctx).then(() => {
  console.log('所有中间件执行完毕, ctx.value =', ctx.value);
});

// 输出顺序：
// 中间件1 开始
// 中间件2 开始
// 中间件3 开始
// 中间件3 结束, ctx.value = 6
// 中间件2 结束, ctx.value = 6
// 中间件1 结束, ctx.value = 6
// 所有中间件执行完毕, ctx.value = 6

// 简化版compose（不处理异步）
function composeSimple(middlewares) {
  return (context, next) => {
    const dispatch = (i) => {
      const fn = middlewares[i] || next;
      if (!fn) return;
      fn(context, () => dispatch(i + 1));
    };
    dispatch(0);
  };
}
```

---