# 9. `keyof`、`typeof`、`in`、`infer` 分别有什么作用？

**答案：**

```typescript
// 1. keyof：获取对象类型的键联合
interface User {
  id: number;
  name: string;
  active: boolean;
}

type UserKeys = keyof User; // 'id' | 'name' | 'active'

// 2. typeof：获取变量或函数的类型
const user = {
  id: 1,
  name: 'Alice'
};

type UserType = typeof user;

// 3. in：常用于映射类型
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

// 4. infer：在条件类型中“推断”内部类型
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

function fetchUser() {
  return { id: 1, name: 'Alice' };
}

type FetchUserResult = ReturnTypeOf<typeof fetchUser>;
```

面试里如果被追问，可以这样总结：

- `keyof`：从类型里取 key
- `typeof`：从值里拿类型
- `in`：遍历联合类型生成新类型
- `infer`：在条件类型中提取子类型

它们通常一起出现在工具类型、类型体操和业务公共类型封装中。