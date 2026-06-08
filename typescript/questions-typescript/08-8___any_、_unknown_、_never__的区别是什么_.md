# 8. `any`、`unknown`、`never` 的区别是什么？

**答案：**

```typescript
// 1. any: 放弃类型检查
let value: any = 'hello';
value = 123;
value.foo.bar(); // ✅ 编译器不报错，但运行时可能出错

// 2. unknown: 类型安全的“任意值”
let result: unknown = 'hello';
result = 123;

if (typeof result === 'string') {
  console.log(result.toUpperCase()); // ✅ 先缩小类型再使用
}

// 3. never: 永远不会有值
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// 4. never 常用于穷尽性检查
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size * shape.size;
    default: {
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
    }
  }
}
```

`any` 适合迁移旧项目时临时兜底，但会绕过类型系统；`unknown` 更安全，适合接口返回值、`catch` 错误等不确定输入；`never` 表示“不可能到达”的分支，常用于穷尽性校验和错误抛出函数。