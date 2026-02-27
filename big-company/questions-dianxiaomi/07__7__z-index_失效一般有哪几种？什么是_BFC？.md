# 7. z-index 失效一般有哪几种？什么是 BFC？

**答案：**

z-index 失效和 BFC（Block Formatting Context，块级格式化上下文）是 CSS 布局中非常重要的概念。

**1. z-index 失效的原因**

z-index 属性只有在元素已定位（position 为 relative、absolute、fixed、sticky）时才会生效。

**原因 1：元素未定位**

```css
/* z-index 不生效 - 因为元素未定位 */
.div1 {
  z-index: 10; /* 无效 */
}

/* 正确做法 */
.div2 {
  position: relative; /* 必须有定位 */
  z-index: 10; /* 生效 */
}
```

**原因 2：父元素的层级问题**

如果两个元素的父元素处于不同的层叠上下文中，子元素的 z-index 只能在各自的层叠上下文内比较。

```css
/* HTML 结构 */
<div class="parent-a">
  <div class="child-a">Child A (z-index: 9999)</div>
</div>

<div class="parent-b">
  <div class="child-b">Child B (z-index: 1)</div>
</div>

/* CSS */
.parent-a {
  position: relative;
  z-index: 1; /* 层级低 */
}

.child-a {
  position: relative;
  z-index: 9999; /* 在 parent-a 的层叠上下文内生效，但 parent-a 层级低 */
}

.parent-b {
  position: relative;
  z-index: 2; /* 层级高 */
}

.child-b {
  position: relative;
  z-index: 1; /* 在 parent-b 的层叠上下文内，但 parent-b 层级高 */
}

/* 结果：child-b 会覆盖 child-a，因为 parent-b 的 z-index 更高 */
```

**原因 3：未创建层叠上下文**

```css
/* 这些属性会创建层叠上下文 */
.element {
  position: relative;
  z-index: auto; /* 不会创建层叠上下文 */
}

.element {
  position: relative;
  z-index: 0; /* 会创建层叠上下文 */
}

/* 其他创建层叠上下文的方式 */
.element {
  position: absolute/fixed/sticky;
  opacity: < 1;
  transform: not none;
  filter: not none;
  mix-blend-mode: not normal;
  isolation: isolate;
  perspective: not none;
}
```

**原因 4：元素不可见**

```css
.hidden {
  display: none; /* 不渲染，z-index 无效 */
  visibility: hidden; /* 不可见，但占据空间，z-index 有效 */
  opacity: 0; /* 不可见，但占据空间，z-index 有效 */
}
```

**2. 层叠上下文**

层叠上下文是 CSS 中的一个三维概念，元素在 z 轴上的排列顺序。

**创建层叠上下文的条件**

```css
/* 1. 根元素 */
html /* 始终创建层叠上下文 */

/* 2. 定位元素 + z-index 不为 auto */
.element {
  position: relative/absolute/fixed/sticky;
  z-index: 0; /* 非 auto 值 */
}

/* 3. opacity 小于 1 */
.element {
  opacity: 0.5;
}

/* 4. transform 不为 none */
.element {
  transform: translateX(10px);
}

/* 5. filter 不为 none */
.element {
  filter: blur(5px);
}

/* 6. mix-blend-mode 不为 normal */
.element {
  mix-blend-mode: multiply;
}

/* 7. isolation 为 isolate */
.element {
  isolation: isolate;
}

/* 8. perspective 不为 none */
.element {
  perspective: 1000px;
}

/* 9. will-change 指定 transform/opacity/filter */
.element {
  will-change: transform;
}

/* 10. contain 为 layout/paint */
.element {
  contain: layout;
}
```

**层叠顺序（从下到上）**

```css
/* 1. 根元素的背景和边框 */
/* 2. 负 z-index 的层叠上下文 */
/* 3. 块级盒（非定位）- 按文档流顺序 */
/* 4. 浮动盒 */
/* 5. 行内盒（非定位）- 按文档流顺序 */
/* 6. z-index: 0 或 auto 的定位元素 */
/* 7. 正 z-index 的定位元素 */
```

**3. BFC（Block Formatting Context）**

BFC 是 Web 页面中一个独立的渲染区域，内部元素的布局不会影响外部元素。

**BFC 的触发条件**

```css
/* 1. float 不为 none */
.element {
  float: left/right;
}

/* 2. position 为 absolute 或 fixed */
.element {
  position: absolute/fixed;
}

/* 3. overflow 不为 visible */
.element {
  overflow: hidden/auto/scroll;
}

/* 4. display 为 inline-block/table-cell/table-caption */
.element {
  display: inline-block;
}

/* 5. display 为 flow-root（推荐） */
.element {
  display: flow-root; /* 专门用于创建 BFC */
}

/* 6. display 为 flex/grid 的直接子元素 */
.container {
  display: flex;
}
.container > .child {
  /* 子元素创建 BFC */
}

/* 7. contain 为 layout/paint/content */
.element {
  contain: layout;
}
```

**BFC 的特性**

```css
/* 1. BFC 区域与外部隔离 */
.bfc-container {
  overflow: hidden; /* 创建 BFC */
}
/* 内部元素的布局不会影响外部元素 */

/* 2. BFC 会计算浮动元素的高度 */
.container {
  /* 未创建 BFC */
  /* 高度为 0，因为子元素浮动 */
}

.container.bfc {
  overflow: hidden; /* 创建 BFC */
  /* 高度包含浮动元素 */
}

/* 3. BFC 不会与浮动元素重叠 */
.left {
  float: left;
  width: 200px;
}

.right {
  overflow: hidden; /* 创建 BFC */
  /* 不会与浮动元素重叠 */
}

/* 4. BFC 的元素垂直方向由 margin 决定 */
/* 相邻 BFC 的 margin 不会折叠 */
```

**BFC 的应用场景**

**场景 1：清除浮动**

```css
/* 方法 1：使用 overflow */
.container {
  overflow: hidden; /* 创建 BFC，包含浮动元素 */
}

.float-child {
  float: left;
  width: 200px;
}

/* 方法 2：使用 display: flow-root（推荐） */
.container {
  display: flow-root; /* 专门用于创建 BFC */
}

/* 方法 3：使用伪元素清除浮动 */
.container::after {
  content: "";
  display: table;
  clear: both;
}
```

**场景 2：防止 margin 折叠**

```css
/* 父子元素 margin 折叠 */
.parent {
  margin-top: 20px;
}

.child {
  margin-top: 20px;
  /* 实际 margin 是 20px，不是 40px */
}

/* 使用 BFC 防止折叠 */
.parent {
  display: flow-root; /* 创建 BFC */
  margin-top: 20px;
}

.child {
  margin-top: 20px;
  /* 实际 margin 是 40px */
}

/* 相邻元素 margin 折叠 */
.box1 {
  margin-bottom: 20px;
}

.box2 {
  margin-top: 20px;
  /* 实际 margin 是 20px */
}

/* 使用 BFC 防止折叠 */
.box1 {
  margin-bottom: 20px;
}

.bfc-wrapper {
  display: flow-root; /* 创建 BFC */
}

.box2 {
  margin-top: 20px;
  /* 实际 margin 是 40px */
}
```

**场景 3：实现两栏布局**

```css
/* 左侧固定，右侧自适应 */
.left {
  float: left;
  width: 200px;
}

.right {
  overflow: hidden; /* 创建 BFC */
  /* 不会与浮动元素重叠 */
}

/* 或使用 display: flow-root */
.right {
  display: flow-root;
}
```

**场景 4：防止文字环绕**

```css
/* 图片左浮动，文字环绕 */
.image {
  float: left;
  width: 200px;
}

.text {
  /* 文字会环绕图片 */
}

/* 使用 BFC 防止环绕 */
.image {
  float: left;
  width: 200px;
}

.text {
  overflow: hidden; /* 创建 BFC */
  /* 文字不会环绕图片 */
}
```

**4. 实际应用示例**

```html
<!-- 示例 1：清除浮动 -->
<div class="clearfix">
  <div class="float-left">Left</div>
  <div class="float-right">Right</div>
</div>

<style>
.clearfix {
  display: flow-root; /* 推荐方式 */
}

/* 或使用 overflow */
.clearfix {
  overflow: hidden; /* 可能会裁剪内容 */
}

/* 或使用伪元素 */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
</style>

<!-- 示例 2：两栏布局 -->
<div class="container">
  <div class="sidebar">Sidebar</div>
  <div class="main">Main Content</div>
</div>

<style>
.sidebar {
  float: left;
  width: 200px;
}

.main {
  overflow: hidden; /* 创建 BFC */
  /* 或 display: flow-root */
}
</style>

<!-- 示例 3：z-index 层级控制 -->
<div class="modal-container">
  <div class="modal-backdrop"></div>
  <div class="modal-content">
    <div class="modal-header">
      <div class="close-button">×</div>
    </div>
  </div>
</div>

<style>
.modal-container {
  position: fixed;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-content {
  position: relative;
  z-index: 2; /* 在 backdrop 之上 */
}

.close-button {
  position: relative;
  z-index: 3; /* 在 modal-content 之上 */
}
</style>

<!-- 示例 4：防止 margin 折叠 -->
<div class="card">
  <div class="card-header">Header</div>
  <div class="card-body">Body</div>
</div>

<style>
.card {
  margin-bottom: 20px;
}

.card-header {
  margin-bottom: 10px;
}

.card-body {
  margin-top: 10px;
  /* margin 折叠，实际只有 10px */
}

/* 使用 BFC 防止折叠 */
.card-header {
  margin-bottom: 10px;
}

.bfc-wrapper {
  display: flow-root;
}

.card-body {
  margin-top: 10px;
  /* 不折叠，实际 20px */
}
</style>
```

**5. 最佳实践**

```css
/* 1. 推荐使用 display: flow-root 创建 BFC */
.container {
  display: flow-root; /* 语义清晰，无副作用 */
}

/* 2. 避免使用 overflow: hidden 创建 BFC */
.container {
  overflow: hidden; /* 可能会裁剪内容 */
}

/* 3. z-index 使用规范 */
/* 1. 保持 z-index 简单，避免过大值 */
.element {
  z-index: 10; /* 推荐 */
  z-index: 9999; /* 不推荐 */
}

/* 2. 使用语义化的 z-index 值 */
:root {
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-fixed: 300;
  --z-index-modal-backdrop: 400;
  --z-index-modal: 500;
  --z-index-popover: 600;
  --z-index-tooltip: 700;
}

.modal {
  z-index: var(--z-index-modal);
}

/* 3. 控制层叠上下文的数量 */
.layer {
  isolation: isolate; /* 明确创建层叠上下文 */
}
```

**总结：**

**z-index 失效的原因：**
1. 元素未定位（position 非相对/绝对/固定/粘性）
2. 父元素处于不同的层叠上下文
3. 元素未创建层叠上下文
4. 元素不可见（display: none）

**BFC（块级格式化上下文）：**
1. **触发条件**：float、position、overflow、display 等特定属性值
2. **特性**：独立渲染区域、包含浮动、防止 margin 折叠、不与浮动重叠
3. **应用场景**：清除浮动、防止 margin 折叠、实现自适应布局、防止文字环绕
4. **推荐方法**：使用 `display: flow-root` 创建 BFC

理解 z-index 和 BFC 对于解决复杂的布局问题和层级控制非常重要。

---

## 虚拟滚动
