# 21. 说下 TS 泛型，如何使用？然后说下 unknown

**答案：**

**泛型（Generics）：**

泛型是 TypeScript 提供的一种工具，用于在定义函数、接口或类时，不预先指定具体的类型，而是在使用时指定类型。

**1. 泛型函数**

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(123);
const str = identity('hello');

// 多个泛型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

**2. 泛型接口**

```typescript
interface Box<T> {
  value: T;
  getValue(): T;
}
```

**3. 泛型类**

```typescript
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
}
```

**4. 泛型约束**

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): number {
  console.log(arg.length);
  return arg.length;
}
```

**5. 实用泛型类型**

```typescript
// Partial：所有属性变为可选
type PartialUser = Partial<User>;

// Required：所有属性变为必需
type RequiredUser = Required<PartialUser>;

// Readonly：所有属性变为只读
type ReadonlyUser = Readonly<User>;

// Pick：选择部分属性
type UserBasic = Pick<User, 'id' | 'name'>;

// Omit：排除部分属性
type UserWithoutId = Omit<User, 'id'>;

// Record：创建对象类型
type UserMap = Record<string, User>;
```

**unknown 类型：**

`unknown` 是 TypeScript 3.0 引入的顶层类型，表示"未知的类型"，是 `any` 的类型安全版本。

**特点：**

```typescript
let value: unknown;

value = 123;      // OK
value = 'hello';  // OK

// 但不能直接操作
value.toFixed();  // 错误：Object is of type 'unknown'
```

**类型缩小：**

```typescript
function processValue(value: unknown) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // OK
  } else if (typeof value === 'number') {
    console.log(value.toFixed(2)); // OK
  }
}
```

**unknown vs any：**

- **any**：绕过类型检查，不安全
- **unknown**：强制类型检查，需要类型检查后才能使用

**使用建议：**

优先使用 unknown 而不是 any，确保类型安全。

---
