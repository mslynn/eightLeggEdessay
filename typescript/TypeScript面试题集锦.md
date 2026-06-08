# TypeScript 面试题集锦（截止 2025 年底）

## 目录
1. [TypeScript 基础](#typescript-基础)
2. [类型系统](#类型系统)
3. [泛型](#泛型)
4. [高级类型](#高级类型)
5. [装饰器](#装饰器)
6. [场景题](#场景题)

---

## TypeScript 基础

### 1. TypeScript 和 JavaScript 的区别是什么？

**答案：**

```typescript
// 1. 类型检查
// JavaScript
let name = 'Alice';
name = 42; // ✅ 可以

// TypeScript
let name: string = 'Alice';
name = 42; // ❌ 错误

// 2. 接口
// JavaScript
function greet(user) {
  console.log(`Hello, ${user.name}`);
}

// TypeScript
interface User {
  name: string;
  age?: number;
}

function greet(user: User) {
  console.log(`Hello, ${user.name}`);
}

// 3. 编译时错误
// TypeScript 在编译时捕获错误
let x: number = 10;
x = 'hello'; // ❌ 编译时错误

// JavaScript 在运行时才发现错误
let x = 10;
x = 'hello'; // ✅ 可以，但可能导致运行时错误
```

---

### 2. TypeScript 的基本类型有哪些？

**答案：**

```typescript
// 1. 原始类型
let name: string = 'Alice';
let age: number = 25;
let isStudent: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
let unique: symbol = Symbol('id');
let bigNumber: bigint = 100n;

// 2. 数组
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ['a', 'b', 'c'];

// 3. 元组
let tuple: [string, number] = ['Alice', 25];

// 4. 枚举
enum Color {
  Red,
  Green,
  Blue
}

let color: Color = Color.Red;

// 5. any 和 unknown
let anything: any = 'hello';
anything = 42; // ✅ 可以

let something: unknown = 'hello';
something = 42; // ✅ 可以
// something.toFixed(); // ❌ 错误

// 6. void 和 never
function log(message: string): void {
  console.log(message);
}

function error(message: string): never {
  throw new Error(message);
}

// 7. object
let obj: object = { name: 'Alice' };
let user: { name: string; age: number } = { name: 'Alice', age: 25 };
```

---

## 类型系统

### 3. TypeScript 的类型推断是什么？

**答案：**

```typescript
// 1. 基础类型推断
let name = 'Alice'; // 推断为 string
let age = 25; // 推断为 number

// 2. 最佳通用类型推断
let numbers = [0, 1, null]; // 推断为 (number | null)[]

// 3. 上下文类型推断
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button); // 推断为 MouseEvent
};

// 4. 类型断言
let value: any = 'hello';
let length: number = (value as string).length;
// 或
let length2: number = (<string>value).length;
```

---

## 泛型

### 4. 什么是泛型？如何使用？

**答案：**

```typescript
// 1. 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let result = identity<string>('hello');
let result2 = identity(42); // 类型推断

// 2. 泛型接口
interface Box<T> {
  value: T;
}

let box: Box<string> = { value: 'hello' };

// 3. 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) {
  return x + y;
};

// 4. 泛型约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity({ length: 10, value: 'hello' });
```

---

## 高级类型

### 5. TypeScript 的高级类型有哪些？

**答案：**

```typescript
// 1. 联合类型
type StringOrNumber = string | number;

let value: StringOrNumber = 'hello';
value = 42;

// 2. 交叉类型
interface Person {
  name: string;
}

interface Employee {
  id: number;
}

type PersonEmployee = Person & Employee;

let person: PersonEmployee = {
  name: 'Alice',
  id: 1
};

// 3. 类型别名
type ID = string | number;

let userId: ID = '123';
let userId2: ID = 456;

// 4. 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type Result = NonNullable<string | null>; // string

// 5. 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;

// 6. 索引类型
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n]);
}

interface User {
  name: string;
  age: number;
}

let user: User = { name: 'Alice', age: 25 };
let name = pluck(user, ['name']); // string[]
```

---

## 装饰器

### 6. 什么是装饰器？

**答案：**

```typescript
// 1. 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}

// 2. 方法装饰器
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${key} returned`, result);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// 3. 属性装饰器
function format(target: any, key: string) {
  let value = target[key];
  
  const getter = () => value;
  const setter = (newVal: string) => {
    value = newVal.toUpperCase();
  };
  
  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class Person {
  @format
  name: string;
}

// 4. 参数装饰器
function required(target: any, key: string, index: number) {
  console.log(`Parameter at index ${index} in ${key} is required`);
}

class User {
  greet(@required name: string) {
    console.log(`Hello, ${name}`);
  }
}
```

---

## 场景题

### 7. 实现一个类型安全的深拷贝函数

**答案：**

```typescript
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    
    return clonedObj;
  }
  
  return obj;
}

// 使用
interface User {
  name: string;
  age: number;
  address: {
    city: string;
    country: string;
  };
}

const user: User = {
  name: 'Alice',
  age: 25,
  address: {
    city: 'New York',
    country: 'USA'
  }
};

const clonedUser = deepClone(user);
console.log(clonedUser);
```

---

### 8. `any`、`unknown`、`never` 的区别是什么？

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

---

### 9. `keyof`、`typeof`、`in`、`infer` 分别有什么作用？

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

---

### 10. 常见内置工具类型有哪些？分别适合什么场景？

**答案：**

```typescript
interface User {
  id: number;
  name: string;
  age?: number;
}

// 1. Partial<T>：全部属性变可选
type UserPatch = Partial<User>;

// 2. Required<T>：全部属性变必选
type FullUser = Required<User>;

// 3. Readonly<T>：全部属性只读
type ReadonlyUser = Readonly<User>;

// 4. Pick<T, K>：挑选部分字段
type UserBaseInfo = Pick<User, 'id' | 'name'>;

// 5. Omit<T, K>：排除部分字段
type UserWithoutAge = Omit<User, 'age'>;

// 6. Record<K, T>：构造键值映射
type UserMap = Record<string, User>;

// 7. Exclude<T, U>：从联合类型中排除
type Status = 'success' | 'error' | 'loading';
type FinalStatus = Exclude<Status, 'loading'>;

// 8. Extract<T, U>：提取交集
type CommonStatus = Extract<Status, 'success' | 'pending'>; // 'success'

// 9. NonNullable<T>：去掉 null 和 undefined
type UserName = NonNullable<string | null | undefined>;

// 10. ReturnType<T> / Parameters<T>
function createUser(name: string, age: number) {
  return { name, age };
}

type CreateUserReturn = ReturnType<typeof createUser>;
type CreateUserParams = Parameters<typeof createUser>;
```

业务里最常见的是 `Partial`、`Pick`、`Omit`、`Record`：

- `Partial` 常用于更新接口入参
- `Pick` 常用于列表项、摘要信息
- `Omit` 常用于去掉后端字段或敏感字段
- `Record` 常用于枚举映射、字典表、缓存结构

---

### 11. `interface` 和 `type` 的区别是什么？应该怎么选？

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

---

### 12. `tsconfig.json` 里有哪些重要配置？为什么很多项目会开启严格模式？

**答案：**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

高频配置可以这样理解：

- `target`：输出到哪个 JS 版本
- `module`：模块规范
- `moduleResolution`：模块解析策略
- `strict`：开启一组严格检查
- `noImplicitAny`：禁止隐式 `any`
- `strictNullChecks`：空值必须显式处理
- `baseUrl` + `paths`：路径别名
- `jsx`：前端框架 JSX 编译方式
- `esModuleInterop`：兼容 CommonJS 导入
- `skipLibCheck`：跳过声明文件检查，加快编译

严格模式的价值主要在于：

1. 提前发现空值、类型不匹配、遗漏分支等问题
2. 提升重构安全性，尤其是大型项目
3. 让编辑器提示更准确，团队协作成本更低

面试里可以补一句：`strict` 会让早期开发多写一些类型，但长期能明显减少线上低级错误。

---

## 总结

以上涵盖了 TypeScript 面试中最常问的问题，包括：

1. **TypeScript 基础**（与 JavaScript 的区别、基本类型）
2. **类型系统**（类型推断）
3. **泛型**（泛型函数、接口、类）
4. **高级类型**（联合类型、交叉类型、条件类型）
5. **装饰器**（类装饰器、方法装饰器、属性装饰器）
6. **场景题**（类型安全的深拷贝）
7. **类型安全边界**（`any`、`unknown`、`never`）
8. **类型工具**（`keyof`、`typeof`、`in`、`infer`）
9. **内置工具类型**（`Partial`、`Pick`、`Omit`、`Record` 等）
10. **工程实践**（`interface` vs `type`、`tsconfig` 严格模式）

这些题目覆盖了 TypeScript 的核心概念和实际应用场景。
