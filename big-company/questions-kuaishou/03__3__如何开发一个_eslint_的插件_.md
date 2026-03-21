# 3. 如何开发一个 eslint 的插件？

**答案：**

#### 项目结构

```
eslint-plugin-myplugin/
├── lib/
│   ├── index.js
│   └── rules/
│       └── no-console.js
└── package.json
```

#### 基础规则实现

```javascript
// lib/rules/no-console.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '禁止使用 console',
      category: 'Best Practices'
    },
    schema: []
  },
  
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'console') {
          context.report({
            node,
            message: '禁止使用 console，请使用日志库'
          });
        }
      }
    };
  }
};
```

#### 插件入口

```javascript
// lib/index.js
const noConsole = require('./rules/no-console');

module.exports = {
  rules: {
    'no-console': noConsole
  }
};
```

#### 使用插件

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['myplugin'],
  rules: {
    'myplugin/no-console': 'error'
  }
};
```

---