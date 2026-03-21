# 6. domdiff 如何比较？

**答案：**

**Diff 算法是虚拟 DOM 的核心，用于比较新旧虚拟 DOM 树，找出最小变化。**

**Vue 2 的 Diff 算法：**

```javascript
// 同层比较，时间复杂度 O(n)
function patch(oldVnode, newVnode) {
  // 1. 相同节点，比较子节点
  if (sameVnode(oldVnode, newVnode)) {
    patchVnode(oldVnode, newVnode)
  }
  // 2. 不同节点，替换
  else {
    const newElm = createElm(newVnode)
    const parent = oldVnode.elm.parentNode
    parent.insertBefore(newElm, oldVnode.elm)
    parent.removeChild(oldVnode.elm)
  }
}

function sameVnode(vnode1, vnode2) {
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment
  )
}
```

**列表 Diff 算法（双端比较）：**

```javascript
function updateChildren(oldCh, newCh) {
  let oldStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let newStartIdx = 0
  let newEndIdx = newCh.length - 1

  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 1. 旧开始 vs 新开始
    if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    }
    // 2. 旧结束 vs 新结束
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    }
    // 3. 旧开始 vs 新结束
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode)
      insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    }
    // 4. 旧结束 vs 新开始
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode)
      insertBefore(oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    }
    // 5. 乱序，查找 key
    else {
      const keyMap = createKeyMap(oldCh)
      const idx = keyMap[newStartVnode.key]
      if (idx) {
        const vnodeToMove = oldCh[idx]
        patchVnode(vnodeToMove, newStartVnode)
        oldCh[idx] = undefined
        insertBefore(vnodeToMove.elm, oldStartVnode.elm)
      } else {
        createElm(newStartVnode, insertBefore)
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }
}
```

**Vue 3 的 Diff 算法（最长递增子序列）：**

```javascript
function diff(oldChildren, newChildren) {
  // 1. 预处理头部相同
  let i = 0
  while (oldChildren[i] === newChildren[i]) {
    i++
  }

  // 2. 预处理尾部相同
  let oldEnd = oldChildren.length - 1
  let newEnd = newChildren.length - 1
  while (oldChildren[oldEnd] === newChildren[newEnd]) {
    oldEnd--
    newEnd--
  }

  // 3. 处理中间部分
  if (i > oldEnd && i > newEnd) {
    // 全部相同
  } else if (i > oldEnd) {
    // 旧节点已遍历完，添加新节点
    mountChildren(newChildren.slice(i, newEnd + 1))
  } else if (i > newEnd) {
    // 新节点已遍历完，删除旧节点
    unmountChildren(oldChildren.slice(i, oldEnd + 1))
  } else {
    // 计算最长递增子序列
    const keyToNewIndexMap = new Map()
    for (let i = 0; i <= newEnd; i++) {
      keyToNewIndexMap.set(newChildren[i].key, i)
    }

    const seq = longestIncreasingSubsequence(newChildren.slice(i, newEnd + 1))
    patchChildren(oldChildren.slice(i, oldEnd + 1), newChildren.slice(i, newEnd + 1), seq)
  }
}
```

**Key 的重要性：**

```javascript
// ❌ 不使用 key，效率低
<li v-for="item in list">{{ item.name }}</li>

// ✅ 使用 key，效率高
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

---
