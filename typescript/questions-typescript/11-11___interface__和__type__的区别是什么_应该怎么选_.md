# 11. `interface` 和 `type` 的区别是什么？应该怎么选？

**答案：**

```typescript
// interface：更适合描述对象结构
interface User {
  id: number;
  name: string;
}

interface User {
  age?: number; // ✅ 可以声明合并
}

// type：更灵活，适合组合类型
type ID = string | number;

type Admin = User & {
  role: 'admin';
};

type Callback = (value: string) => void;
```

两者都能描述对象，但重点不同：

- `interface` 更适合定义对象、类、公共协议，支持声明合并
- `type` 更适合联合类型、交叉类型、元组、函数类型、条件类型

常见实践是：

- 描述业务实体、组件 props、接口响应结构时优先用 `interface`
- 做类型组合、工具类型封装、复杂别名时优先用 `type`

如果团队没有强约束，核心标准不是“只能二选一”，而是保持统一和可读性。