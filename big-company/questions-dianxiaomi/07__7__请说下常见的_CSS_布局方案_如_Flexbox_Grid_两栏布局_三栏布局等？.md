# 7. 请说下常见的 CSS 布局方案，如 Flexbox、Grid、两栏布局、三栏布局等？

**答案：**

CSS 布局是前端开发中的核心技能，不同的布局方案适用于不同的场景。现代 CSS 提供了多种强大的布局技术。

**1. Flexbox 布局**

**基本概念**

Flexbox（弹性盒子）是一维布局模型，适合在行或列方向上分配空间。

```css
.container {
  display: flex;
  
  /* 主轴方向 */
  flex-direction: row; /* row | row-reverse | column | column-reverse */
  
  /* 换行 */
  flex-wrap: nowrap; /* nowrap | wrap | wrap-reverse */
  
  /* 主轴对齐 */
  justify-content: flex-start; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  
  /* 交叉轴对齐 */
  align-items: stretch; /* stretch | flex-start | flex-end | center | baseline */
  
  /* 多行交叉轴对齐 */
  align-content: stretch;
}

.item {
  /* 放大比例 */
  flex-grow: 0;
  
  /* 缩小比例 */
  flex-shrink: 1;
  
  /* 初始大小 */
  flex-basis: auto;
  
  /* 简写 */
  flex: 0 1 auto; /* flex-grow flex-shrink flex-basis */
  
  /* 单独对齐 */
  align-self: auto;
}
```

**常用布局示例**

```css
/* 水平居中 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐，中间自适应 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 垂直居中 */
.vertical-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 等分布局 */
.equal-columns {
  display: flex;
}
.equal-columns > div {
  flex: 1;
}

/* 固定两侧，中间自适应 */
.sticky-layout {
  display: flex;
}
.sticky-layout .left,
.sticky-layout .right {
  flex: 0 0 200px; /* 固定宽度 */
}
.sticky-layout .center {
  flex: 1; /* 占据剩余空间 */
}
```

**2. Grid 布局**

**基本概念**

Grid（网格）是二维布局模型，可以同时控制行和列。

```css
.container {
  display: grid;
  
  /* 列定义 */
  grid-template-columns: 1fr 2fr 1fr; /* 使用 fr 单位 */
  grid-template-columns: 200px 1fr 200px; /* 混合单位 */
  grid-template-columns: repeat(3, 1fr); /* 重复 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 自动适应 */
  
  /* 行定义 */
  grid-template-rows: 100px 1fr 100px;
  
  /* 区域定义 */
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  
  /* 间距 */
  grid-gap: 20px;
  gap: 20px;
  row-gap: 20px;
  column-gap: 20px;
}

.item {
  /* 指定区域 */
  grid-area: header;
  
  /* 指定行列 */
  grid-column: 1 / 3; /* 从第1条线到第3条线 */
  grid-row: 1 / 2;
  
  /* 简写 */
  grid-area: 1 / 1 / 2 / 3;
  
  /* 跨度 */
  grid-column: span 2;
  grid-row: span 2;
  
  /* 对齐 */
  justify-self: start; /* justify-self 和 align-self */
  align-self: center;
}
```

**常用布局示例**

```css
/* 经典的三栏布局 */
.classic-layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* 响应式网格卡片 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 圣杯布局 */
.holy-grail {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

**3. 两栏布局**

**方案 1：Float + BFC**

```css
.container {
  overflow: hidden; /* BFC */
}

.left {
  float: left;
  width: 200px;
  height: 200px;
  background: #f00;
}

.right {
  overflow: hidden; /* BFC */
  height: 200px;
  background: #0f0;
}
```

**方案 2：Flexbox**

```css
.container {
  display: flex;
}

.left {
  width: 200px;
  flex-shrink: 0;
}

.right {
  flex: 1;
}
```

**方案 3：Grid**

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

**方案 4：Absolute**

```css
.container {
  position: relative;
  height: 200px;
}

.left {
  position: absolute;
  left: 0;
  top: 0;
  width: 200px;
  height: 100%;
}

.right {
  position: absolute;
  left: 200px;
  right: 0;
  top: 0;
  height: 100%;
}
```

**4. 三栏布局**

**方案 1：圣杯布局**

```css
.container {
  padding: 0 200px; /* 为左右栏留出空间 */
  overflow: hidden;
}

.center {
  float: left;
  width: 100%;
}

.left {
  position: relative;
  float: left;
  width: 200px;
  margin-left: -100%; /* 移动到最左边 */
  left: -200px; /* 回到正确位置 */
}

.right {
  position: relative;
  float: left;
  width: 200px;
  margin-left: -200px; /* 移动到右边 */
  left: 200px; /* 回到正确位置 */
}
```

**方案 2：双飞翼布局**

```css
.container {
  overflow: hidden;
}

.center-wrap {
  float: left;
  width: 100%;
}

.center {
  margin: 0 200px; /* 为左右栏留出空间 */
}

.left {
  float: left;
  width: 200px;
  margin-left: -100%;
}

.right {
  float: left;
  width: 200px;
  margin-left: -200px;
}
```

**方案 3：Flexbox（推荐）**

```css
.container {
  display: flex;
}

.left,
.right {
  width: 200px;
  flex-shrink: 0;
}

.center {
  flex: 1;
}
```

**方案 4：Grid（最简洁）**

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
```

**5. 垂直水平居中**

**方案 1：Flexbox**

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**方案 2：Grid**

```css
.container {
  display: grid;
  place-items: center;
}
```

**方案 3：Absolute + Transform**

```css
.container {
  position: relative;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**方案 4：Absolute + Margin**

```css
.container {
  position: relative;
}

.center {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 200px;
  height: 200px;
}
```

**6. 响应式布局**

```css
/* 移动优先 */
.container {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}

/* 桌面优先 */
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}

/* 断点管理 */
/* 移动设备 */
@media (max-width: 576px) {
  /* 手机 */
}

/* 平板 */
@media (min-width: 577px) and (max-width: 992px) {
  /* 平板 */
}

/* 桌面 */
@media (min-width: 993px) {
  /* 桌面 */
}

/* 大屏 */
@media (min-width: 1400px) {
  /* 大屏 */
}
```

**7. 实际应用示例**

```css
/* 完整的响应式布局 */
.page-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  min-height: 100vh;
  gap: 0;
}

@media (max-width: 1200px) {
  .page-layout {
    grid-template-columns: 250px 1fr;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";
  }
  
  .aside {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr 1fr 40px;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
  
  .sidebar {
    order: 2;
  }
}

/* 卡片网格 */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

.card-content {
  flex: 1;
  margin-top: 15px;
}

.card-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

**总结：**

1. **Flexbox**：适合一维布局，如导航栏、卡片对齐等
2. **Grid**：适合二维布局，如整个页面布局、网格系统等
3. **两栏/三栏布局**：Flexbox 和 Grid 是现代首选方案
4. **响应式布局**：使用媒体查询 + Flexbox/Grid 实现灵活适配
5. **性能考虑**：Grid 性能通常优于多层嵌套的 Flexbox

---

## 虚拟滚动
