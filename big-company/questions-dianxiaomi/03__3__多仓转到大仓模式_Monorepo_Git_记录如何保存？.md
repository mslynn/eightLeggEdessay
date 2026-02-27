# 3. 多仓转到大仓模式 Monorepo，Git 记录如何保存？

**答案：**

从多个独立仓库（Multi-repo）迁移到单一仓库（Monorepo）是一个常见的架构演进。关键在于如何保留各仓库的 Git 历史记录。

**1. 迁移策略**

**方案 1：使用 git subtree（推荐）**

```bash
# 1. 创建新的 monorepo 仓库
mkdir monorepo
cd monorepo
git init

# 2. 添加各个子仓库
# 添加 repo-a
git subtree add --prefix=packages/repo-a https://github.com/user/repo-a.git main

# 添加 repo-b
git subtree add --prefix=packages/repo-b https://github.com/user/repo-b.git main

# 添加 repo-c
git subtree add --prefix=packages/repo-c https://github.com/user/repo-c.git main

# 3. 提交
git commit -m "Initial monorepo setup with subtree"
```

**方案 2：使用 git filter-branch（更灵活）**

```bash
# 1. 创建新的 monorepo 仓库
mkdir monorepo
cd monorepo
git init

# 2. 添加各个子仓库的历史
# 迁移 repo-a
git remote add repo-a https://github.com/user/repo-a.git
git fetch repo-a
git filter-branch --index-filter '
  git ls-files -s | sed "s-\t\"*-&/packages/repo-a/-" |
  GIT_INDEX_FILE=$GIT_INDEX_FILE.new \
  git update-index --index-info &&
  mv $GIT_INDEX_FILE.new $GIT_INDEX_FILE
' repo-a/main

# 迁移 repo-b
git remote add repo-b https://github.com/user/repo-b.git
git fetch repo-b
git filter-branch --index-filter '
  git ls-files -s | sed "s-\t\"*-&/packages/repo-b/-" |
  GIT_INDEX_FILE=$GIT_INDEX_FILE.new \
  git update-index --index-info &&
  mv $GIT_INDEX_FILE.new $GIT_INDEX_FILE
' repo-b/main

# 3. 清理远程
git remote remove repo-a
git remote remove repo-b

# 4. 提交
git commit -m "Migrate to monorepo"
```

**方案 3：使用 git-filter-repo（推荐，更高效）**

```bash
# 1. 安装 git-filter-repo
pip install git-filter-repo

# 2. 创建新的 monorepo 仓库
mkdir monorepo
cd monorepo
git init

# 3. 迁移各个仓库
# 迁移 repo-a
git remote add repo-a https://github.com/user/repo-a.git
git fetch repo-a
git filter-repo --to-subdirectory-filter packages/repo-a --refs repo-a/main

# 迁移 repo-b
git remote add repo-b https://github.com/user/repo-b.git
git fetch repo-b
git filter-repo --to-subdirectory-filter packages/repo-b --refs repo-b/main

# 4. 合并历史
git filter-repo --force

# 5. 提交
git commit -m "Merge repositories into monorepo"
```

**2. 使用脚本自动化迁移**

```javascript
// migrate-to-monorepo.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  monorepoPath: './monorepo',
  repositories: [
    {
      name: 'repo-a',
      url: 'https://github.com/user/repo-a.git',
      branch: 'main',
      targetDir: 'packages/repo-a'
    },
    {
      name: 'repo-b',
      url: 'https://github.com/user/repo-b.git',
      branch: 'main',
      targetDir: 'packages/repo-b'
    },
    {
      name: 'repo-c',
      url: 'https://github.com/user/repo-c.git',
      branch: 'main',
      targetDir: 'packages/repo-c'
    }
  ]
};

// 创建 monorepo
function createMonorepo() {
  console.log('Creating monorepo...');
  
  if (!fs.existsSync(config.monorepoPath)) {
    fs.mkdirSync(config.monorepoPath, { recursive: true });
  }
  
  process.chdir(config.monorepoPath);
  
  // 初始化 Git 仓库
  execSync('git init', { stdio: 'inherit' });
  execSync('git config user.email "migrate@example.com"', { stdio: 'inherit' });
  execSync('git config user.name "Migration Bot"', { stdio: 'inherit' });
  
  console.log('Monorepo created.');
}

// 添加子仓库
function addRepository(repo) {
  console.log(`Adding ${repo.name}...`);
  
  const { name, url, branch, targetDir } = repo;
  
  // 使用 git subtree
  execSync(
    `git subtree add --prefix=${targetDir} ${url} ${branch}`,
    { stdio: 'inherit' }
  );
  
  console.log(`${repo.name} added to ${targetDir}`);
}

// 主函数
function migrate() {
  console.log('Starting migration to monorepo...\n');
  
  try {
    // 创建 monorepo
    createMonorepo();
    
    // 添加所有仓库
    config.repositories.forEach(repo => {
      addRepository(repo);
    });
    
    // 创建 README
    const readme = `# Monorepo

This is a monorepo containing the following packages:

${config.repositories.map(repo => 
  `- \`${repo.targetDir}\`: ${repo.name}`
).join('\n')}

## Migration

This monorepo was created by merging the following repositories:
${config.repositories.map(repo => 
  `- ${repo.name}: ${repo.url}`
).join('\n')}

All commit histories have been preserved.
`;
    
    fs.writeFileSync(
      path.join(config.monorepoPath, 'README.md'),
      readme
    );
    
    execSync('git add README.md', { stdio: 'inherit' });
    execSync('git commit -m "Add README for monorepo"', { stdio: 'inherit' });
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`Monorepo location: ${path.resolve(config.monorepoPath)}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// 执行迁移
migrate();
```

**3. 保留完整历史的高级方案**

```bash
#!/bin/bash
# migrate-to-monorepo-advanced.sh

MONOREPO_PATH="./monorepo"
PACKAGES_DIR="packages"

# 创建 monorepo
mkdir -p "$MONOREPO_PATH"
cd "$MONOREPO_PATH"
git init

# 创建初始提交
git commit --allow-empty -m "Initial commit"

# 函数：合并仓库
merge_repo() {
  local repo_name=$1
  local repo_url=$2
  local target_dir=$3
  
  echo "Merging $repo_name..."
  
  # 添加远程
  git remote add "$repo_name" "$repo_url"
  
  # 获取远程
  git fetch "$repo_name"
  
  # 创建合并分支
  git branch "$repo_name-merge" "$repo_name/main"
  
  # 重写历史，移动文件到目标目录
  git filter-branch --force --index-filter \
    "git ls-files -s | sed \"s-\t\"*-&$target_dir/-\" |
     GIT_INDEX_FILE=\$GIT_INDEX_FILE.new \
     git update-index --index-info &&
     mv \"\$GIT_INDEX_FILE.new\" \"\$GIT_INDEX_FILE\"" \
    "$repo_name-merge"
  
  # 合并到主分支
  git merge --allow-unrelated-histories "$repo_name-merge" \
    -m "Merge $repo_name into monorepo"
  
  # 清理
  git branch -D "$repo_name-merge"
  git remote remove "$repo_name"
}

# 合并所有仓库
merge_repo "repo-a" "https://github.com/user/repo-a.git" "packages/repo-a"
merge_repo "repo-b" "https://github.com/user/repo-b.git" "packages/repo-b"
merge_repo "repo-c" "https://github.com/user/repo-c.git" "packages/repo-c"

# 清理 filter-branch 备份
rm -rf .git/refs/original/

echo "Migration completed!"
```

**4. 验证历史记录**

```bash
# 验证历史是否完整
cd monorepo

# 查看所有提交历史
git log --all --graph --oneline --decorate

# 查看特定包的历史
git log --all --oneline -- packages/repo-a/

# 查看作者统计
git shortlog -sn --all

# 查看文件历史
git log --follow -- packages/repo-a/src/index.js
```

**5. 处理常见问题**

**问题 1：合并冲突**

```bash
# 如果遇到冲突，解决后继续
git status
# 解决冲突文件
git add .
git commit
```

**问题 2：作者信息丢失**

```bash
# 修复作者信息
git filter-branch --env-filter '
  if [ "$GIT_AUTHOR_EMAIL" = "root@localhost" ]; then
    export GIT_AUTHOR_EMAIL="correct@email.com"
    export GIT_AUTHOR_NAME="Correct Name"
  fi
  if [ "$GIT_COMMITTER_EMAIL" = "root@localhost" ]; then
    export GIT_COMMITTER_EMAIL="correct@email.com"
    export GIT_COMMITTER_NAME="Correct Name"
  fi
' -- --all
```

**问题 3：大文件导致克隆缓慢**

```bash
# 使用 Git LFS
git lfs install
git lfs track "*.psd"
git lfs track "*.zip"
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

**6. 使用工具简化迁移**

**使用 nx 工具**

```bash
# 1. 安装 nx
npm install -g nx

# 2. 创建新的 monorepo
npx create-nx-workspace@latest my-monorepo

# 3. 迁移现有仓库
cd my-monorepo

# 使用 nx 的迁移工具
npx g @nx/workspace:convert-to-monorepo \
  --repo-path=../repo-a \
  --package-name=repo-a \
  --directory=packages/repo-a
```

**使用 Lerna**

```bash
# 1. 安装 Lerna
npm install -g lerna

# 2. 初始化 monorepo
mkdir monorepo
cd monorepo
lerna init

# 3. 迁移各个仓库
# 手动复制各仓库到 packages 目录
# 然后运行：
lerna bootstrap
```

**7. 最佳实践**

1. **迁移前准备**：
   - 备份所有仓库
   - 通知团队成员
   - 规划迁移时间窗口

2. **迁移过程**：
   - 使用自动化脚本
   - 保留完整的 commit 历史
   - 验证迁移结果

3. **迁移后**：
   - 更新 CI/CD 配置
   - 更新文档
   - 培训团队成员

4. **版本管理**：
   - 使用语义化版本
   - 统一发布流程
   - 配置变更日志

**总结：**

从 Multi-repo 迁移到 Monorepo 的关键是保留 Git 历史记录。推荐使用 `git subtree` 或 `git-filter-repo` 工具，它们能够高效地迁移历史并保持完整性。迁移后，可以使用 Lerna、nx、Turborepo 等工具管理 monorepo 的构建、测试和发布流程。

---

## 包管理工具
