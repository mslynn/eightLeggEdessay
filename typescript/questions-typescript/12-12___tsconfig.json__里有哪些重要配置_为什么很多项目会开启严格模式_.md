# 12. `tsconfig.json` 里有哪些重要配置？为什么很多项目会开启严格模式？

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