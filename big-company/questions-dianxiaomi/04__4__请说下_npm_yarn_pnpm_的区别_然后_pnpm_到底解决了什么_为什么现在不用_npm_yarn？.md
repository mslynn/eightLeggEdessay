# 4. 请说下 npm、yarn、pnpm 的区别，然后 pnpm 到底解决了什么，为什么现在不用 npm、yarn？

**答案：**

npm、yarn、pnpm 都是 JavaScript 生态系统的包管理工具，它们在依赖管理、安装速度、磁盘空间使用等方面有不同的实现方式。

**1. 三者的核心区别**

| 特性 | npm (v2-6) | npm (v7+) | Yarn (v1) | Yarn (v2+/Berry) | pnpm |
|------|-----------|-----------|-----------|------------------|------|
| 依赖安装方式 | 嵌套 node_modules | 嵌套 node_modules | 扁平化 | 插件化 | 硬链接 + 符号链接 |
| 安装速度 | 慢 | 较快 | 快 | 最快 | 最快 |
| 磁盘空间 | 重复安装 | 重复安装 | 去重 | 去重 | 全局去重 |
| 幽灵依赖 | 支持 | 支持 | 支持 | 可配置 | 不支持 |
| 严格模式 | 否 | 是 | 否 | 是 | 是 |
| Monorepo 支持 | 差 | 一般 | 一般 | 好 | 好 |
| Workspace | 否 | 是 | 是 | 是 | 是 |

**2. 依赖管理方式详解**

**npm（v2-6）：嵌套依赖**

```
project/
└── node_modules/
    ├── package-a/
    │   └── node_modules/
    │       └── package-b@1.0.0/
    └── package-c/
        └── node_modules/
            └── package-b@2.0.0/
```

**问题**：
- 磁盘空间浪费
- 路径过长问题（Windows 限制）
- 重复下载相同版本的包

**npm（v7+）：扁平化依赖**

```
project/
└── node_modules/
    ├── package-a/
    ├── package-c/
    └── package-b@2.0.0/  (提升到顶层)
```

**问题**：
- 幽灵依赖（可以访问未声明的依赖）
- 依赖冲突时仍需嵌套

**Yarn（v1）：扁平化依赖 + 缓存**

```
project/
└── node_modules/
    ├── package-a/
    ├── package-c/
    └── package-b@2.0.0/

.yarn/
└── cache/  (全局缓存)
```

**优点**：
- 离线模式
- 并行安装
- 更好的确定性

**pnpm：硬链接 + 符号链接**

```
project/
└── node_modules/
    ├── .pnpm/
    │   ├── package-a@1.0.0/
    │   │   └── node_modules/
    │   │       └── package-b@1.0.0/
    │   └── package-b@1.0.0/
    ├── package-a/  (符号链接 -> .pnmem/package-a@1.0.0)
    └── package-b/  (符号链接 -> .pnmem/package-b@1.0.0)

.pnpm-store/  (全局存储)
```

**优点**：
- 节省磁盘空间（全局唯一）
- 安装速度快
- 无幽灵依赖
- 严格的依赖结构

**3. pnpm 解决的核心问题**

**问题 1：磁盘空间浪费**

```javascript
// npm/yarn: 每个项目都安装一份
project-a/node_modules/lodash/  // 4MB
project-b/node_modules/lodash/  // 4MB
project-c/node_modules/lodash/  // 4MB
// 总计: 12MB

// pnpm: 全局存储，硬链接
.pnpm-store/lodash@4.17.21/  // 4MB (全局唯一)
project-a/node_modules/lodash/  -> 硬链接到全局存储
project-b/node_modules/lodash/  -> 硬链接到全局存储
project-c/node_modules/lodash/  -> 硬链接到全局存储
// 总计: 4MB
```

**问题 2：幽灵依赖**

```javascript
// npm/yarn: 可以访问未声明的依赖
// package.json
{
  "dependencies": {
    "package-a": "^1.0.0"
  }
}

// package-a 的依赖
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// 你的代码可以直接使用 lodash（幽灵依赖）
import _ from 'lodash';  // 能工作，但 package.json 中没有声明

// pnpm: 不允许幽灵依赖
import _ from 'lodash';  // 报错: lodash not found
// 必须显式声明
{
  "dependencies": {
    "package-a": "^1.0.0",
    "lodash": "^4.17.21"  // 必须声明
  }
}
```

**问题 3：安装速度慢**

```javascript
// 性能对比（1000 个依赖）
npm install:     ~60s
yarn install:    ~40s
pnpm install:    ~10s

// 原因：
// 1. pnpm 使用硬链接，无需复制文件
// 2. 更好的缓存机制
// 3. 并行下载和安装
```

**问题 4：项目克隆速度慢**

```bash
# npm/yarn: 需要下载所有依赖
git clone repo
npm install  # 需要几分钟

# pnpm: 可以使用 .pnpm-lock.yaml 和内容寻址存储
git clone repo
pnpm install  # 几秒钟（大部分文件已在缓存）
```

**4. pnpm 的实现原理**

**内容寻址存储**

```javascript
// pnpm 的存储结构
.pnpm-store/
├── v3/
│   └── files/  (按内容哈希存储)
│       ├── 00/  (哈希前缀)
│       │   └── 1a2b3c4d.../  (完整哈希)
│       ├── 01/
│       └── ...
```

```javascript
// 硬链接实现
const fs = require('fs');
const path = require('path');

// 创建硬链接
function createHardlink(source, target) {
  try {
    fs.linkSync(source, target);
    console.log('硬链接创建成功');
  } catch (err) {
    console.error('硬链接创建失败:', err);
  }
}

// 创建符号链接
function createSymlink(source, target) {
  try {
    fs.symlinkSync(source, target);
    console.log('符号链接创建成功');
  } catch (err) {
    console.error('符号链接创建失败:', err);
  }
}
```

**5. pnpm 的实际使用**

**基本使用**

```bash
# 安装 pnpm
npm install -g pnpm

# 初始化项目
pnpm init

# 安装依赖
pnpm install
pnpm add lodash
pnpm add -D typescript
pnpm add -g @vue/cli

# 更新依赖
pnpm update
pnpm update lodash

# 移除依赖
pnpm remove lodash

# 运行脚本
pnpm run build
pnpm test
```

**Monorepo 支持**

```json
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```bash
# 安装所有 workspace 的依赖
pnpm install

# 为特定包安装依赖
pnpm --filter package-a add lodash

# 为所有包安装依赖
pnpm -r add lodash

# 运行所有包的脚本
pnpm -r run build
```

**配置文件**

```json
// .npmrc
# 使用淘宝镜像
registry=https://registry.npmmirror.com

# 严格模式（禁止幽灵依赖）
shamefully-hoist=false
strict-peer-dependencies=false

# 保存精确版本
save-exact=true

# 自动安装 peers
auto-install-peers=true
```

**6. 为什么现在选择 pnpm？**

**优势总结**

1. **节省磁盘空间**
   - 相同版本只存储一份
   - 100 个项目节省 90%+ 空间

2. **安装速度快**
   - 硬链接无需复制
   - 并行安装
   - 智能缓存

3. **严格的依赖管理**
   - 无幽灵依赖
   - 避免意外依赖
   - 更好的可维护性

4. **更好的 Monorepo 支持**
   - 原生 workspace 支持
   - 高效的依赖共享
   - 灵活的脚本执行

5. **确定性安装**
   - 锁文件更可靠
   - 跨平台一致性

**性能对比**

```javascript
// 测试场景：10 个项目，每个 1000 个依赖

// 磁盘空间使用
npm:    ~50GB
yarn:   ~45GB
pnpm:   ~5GB  (节省 90%)

// 安装时间
npm:    ~10分钟
yarn:   ~7分钟
pnpm:   ~2分钟

// 克隆后安装时间
npm:    ~10分钟
yarn:   ~7分钟
pnpm:   ~30秒 (大部分已在缓存)
```

**7. 迁移到 pnpm**

```bash
# 从 npm 迁移
rm -rf node_modules package-lock.json
pnpm import  # 自动转换 package-lock.json 到 pnpm-lock.yaml
pnpm install

# 从 yarn 迁移
rm -rf node_modules yarn.lock
pnpm import  # 自动转换 yarn.lock 到 pnpm-lock.yaml
pnpm install
```

**8. 注意事项**

1. **幽灵依赖问题**
   ```javascript
   // 如果项目依赖幽灵依赖，迁移到 pnpm 会报错
   // 解决方法：显式声明所有依赖
   ```

2. **CI/CD 配置**
   ```yaml
   # GitHub Actions
   - name: Setup pnpm
     uses: pnpm/action-setup@v2
     with:
       version: 8
   
   - name: Install dependencies
     run: pnpm install --frozen-lockfile
   ```

3. **Docker 构建**
   ```dockerfile
   FROM node:18-alpine
   RUN npm install -g pnpm
   COPY pnpm-lock.yaml package.json ./
   RUN pnpm install --frozen-lockfile
   COPY . .
   RUN pnpm run build
   ```

**总结：**

pnpm 通过硬链接和符号链接的创新设计，解决了传统包管理工具的磁盘浪费、安装速度慢、幽灵依赖等问题。它特别适合 Monorepo 项目和大型企业级项目。虽然迁移可能需要处理幽灵依赖问题，但长期来看，pnpm 提供了更好的开发体验和资源利用率。

---

## Vue 3 响应式原理
