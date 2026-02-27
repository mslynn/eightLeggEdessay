# 13. 请手写实现 React 的 useState 和 useEffect Hook，说明 Hooks 的工作原理

**答案：**

```javascript
// 简化的 Fiber 节点
let wipRoot = null;
let currentRoot = null;
let nextUnitOfWork = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;

// Fiber 节点结构
function createFiber(element, parent) {
  return {
    type: element.type,
    props: element.props,
    dom: null,
    parent: parent,
    child: null,
    sibling: null,
    alternate: null,
    effectTag: 'PLACEMENT'
  };
}

// Hooks
function useState(initial) {
  const oldHook = wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };
  
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  });
  
  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };
  
  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function useEffect(callback, deps) {
  const oldHook = wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  
  const hasChangedDeps = deps 
    ? !oldHook.deps.every((dep, i) => dep === deps[i])
    : true;
  
  if (!oldHook || hasChangedDeps) {
    const effect = {
      callback,
      deps
    };
    wipFiber.hooks.push(effect);
    hookIndex++;
    
    // 简化：直接执行
    callback();
  } else {
    wipFiber.hooks.push(oldHook);
    hookIndex++;
  }
}
```

**Hooks 工作原理：**

1. Hooks 按照调用顺序存储在 Fiber 节点的 hooks 数组中
2. 每次渲染时，通过 hookIndex 确保按顺序访问对应的 hook
3. useState 通过闭包保存状态，setState 触发重新渲染
4. useEffect 通过依赖数组判断是否需要执行

---
