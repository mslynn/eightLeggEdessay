# 4. babel 的转换流程是什么样的？babel 包含哪几个部分，核心包有哪些？

**答案：**

#### Babel 转换流程（三阶段）

```javascript
// 1. 解析 (Parsing)
const parser = require('@babel/parser');
const ast = parser.parse(code, {
  sourceType: 'module'
});

// 2. 转换 (Transforming)
const traverse = require('@babel/traverse').default;
traverse(ast, {
  ArrowFunctionExpression(path) {
    // 转换逻辑
  }
});

// 3. 生成 (Generating)
const generate = require('@babel/generator').default;
const output = generate(ast);
console.log(output.code);
```

#### 核心包

1. **@babel/parser**：解析代码为 AST
2. **@babel/traverse**：遍历和修改 AST
3. **@babel/types**：创建和检查 AST 节点
4. **@babel/generator**：从 AST 生成代码
5. **@babel/core**：核心转换功能
6. **@babel/template**：从字符串创建 AST

---