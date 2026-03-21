# Redux 原理与中间件机制

## 核心概念

Redux 是一个用于 JavaScript 应用的可预测状态容器，它通过单一数据源、纯函数 reducer 和单向数据流来管理应用状态。

**核心特性：**
- 单一数据源：整个应用的状态存储在单个 store 中
- 状态只读：唯一改变状态的方式是触发 action
- 纯函数修改：使用纯函数 reducer 来描述状态如何变化
- 中间件机制：支持异步 action 和日志等扩展功能

## 源码核心实现

### 1. Redux 核心数据结构

```javascript
// Action 类型
type Action<T = any> = {
  type: T;
  [extraProps: string]: any;
};

// Reducer 类型
type Reducer<S = any, A extends Action = Action> = (
  state: S | undefined,
  action: A
) => S;

// Store 类型
type Store<S = any, A extends Action = Action> = {
  dispatch: Dispatch<A>;
  getState: () => S;
  subscribe: (listener: () => void) => () => void;
  replaceReducer: (nextReducer: Reducer<S, A>) => void;
  [$$observable]: () => Observable<S>;
};

// Middleware 类型
type MiddlewareAPI<S = any, A extends Action = Action, D = Dispatch<A>> = {
  getState: () => S;
  dispatch: D;
};

type Middleware<S = any, A extends Action = Action, D = Dispatch<A>> = (
  api: MiddlewareAPI<S, A, D>
) => (next: D) => (action: A) => any;

// StoreEnhancer 类型
type StoreEnhancer<Ext = {}, StateExt = {}> = (
  next: StoreCreator<Ext, StateExt>
) => StoreCreator<Ext, StateExt>;

type StoreCreator<Ext = {}, StateExt = {}> = <
  S = any,
  A extends Action = Action
>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>
) => Store<S & StateExt, A> & Ext;
```

### 2. createStore 实现

```javascript
// createStore - 创建 store
function createStore<S, A extends Action>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>,
  enhancer?: StoreEnhancer<{}, S>
): Store<S, A> {
  // 如果有 enhancer，使用 enhancer 创建 store
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  let currentState = preloadedState as S;
  let currentListeners: Array<() => void> = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  // 确保当前监听器数组
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  // getState - 获取当前状态
  function getState(): S {
    if (isDispatching) {
      throw new Error('Cannot get state while dispatching');
    }
    return currentState as S;
  }

  // subscribe - 订阅状态变化
  function subscribe(listener: () => void): () => void {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function');
    }

    if (isDispatching) {
      throw new Error('Cannot subscribe while dispatching');
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    // 返回取消订阅函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error('Cannot unsubscribe while dispatching');
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  // dispatch - 分发 action
  function dispatch(action: A): A {
    if (!isPlainObject(action)) {
      throw new Error('Actions must be plain objects');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState as S, action);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  // replaceReducer - 替换 reducer
  function replaceReducer<NewState, NewAction extends Action>(
    nextReducer: Reducer<NewState, NewAction>
  ): Store<NewState, NewAction> & Ext {
    currentReducer = (nextReducer as unknown) as Reducer<S, A>;
    dispatch({ type: '@@redux/INIT' } as A);
    return (store as unknown) as Store<NewState, NewAction> & Ext;
  }

  // 初始化 store
  dispatch({ type: '@@redux/INIT' } as A);

  const store = {
    dispatch: dispatch as Dispatch<A>,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable,
  } as Store<S, A> & Ext;

  return store;
}
```

### 3. 中间件机制核心实现

```javascript
// applyMiddleware - 应用中间件
function applyMiddleware<S = any, A extends Action = Action>(
  ...middlewares: Middleware<S, A, any>[]
): StoreEnhancer<{}, S> {
  return (createStore: StoreCreator) => <Ext1, StateExt1>(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>
  ) => {
    const store = createStore(reducer, preloadedState);
    let dispatch: Dispatch<A> = () => {
      throw new Error('Dispatching while constructing your middleware is not allowed');
    };

    const middlewareAPI: MiddlewareAPI<S, A, Dispatch<A>> = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args),
    };

    // 调用每个中间件，传入 middlewareAPI
    const chain = middlewares.map(middleware => middleware(middlewareAPI));

    // 组合中间件：从右到左，形成洋葱模型
    dispatch = compose<Dispatch<A>>(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}

// compose - 函数组合工具
function compose<R>(...funcs: Function[]): (arg: any) => R {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

// 中间件执行流程示例
// 假设有三个中间件：loggerMiddleware, thunkMiddleware, apiMiddleware
// middleware1(middlewareAPI)(middleware2(middlewareAPI)(middleware3(middlewareAPI)(store.dispatch)))

// 执行顺序（洋葱模型）：
// 1. middleware1 开始
// 2. middleware2 开始
// 3. middleware3 开始
// 4. 执行原 dispatch
// 5. middleware3 结束
// 6. middleware2 结束
// 7. middleware1 结束
```

### 4. 常用中间件实现

#### 4.1 Redux Thunk（异步中间件）

```javascript
// redux-thunk 源码实现
function createThunkMiddleware<S = any, A extends Action = Action>(
  extraArgument?: any
): Middleware<S, A, Dispatch<A>> {
  return ({ dispatch, getState }) => (next) => (action) => {
    // 如果 action 是函数，执行它
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    // 否则传递给下一个中间件
    return next(action);
  };
}

const thunk = createThunkMiddleware();

export default thunk;

// 使用示例
// Action Creator
const fetchData = (url) => (dispatch, getState) => {
  dispatch({ type: 'FETCH_START' });

  fetch(url)
    .then(response => response.json())
    .then(data => {
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    })
    .catch(error => {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    });
};

// 使用
store.dispatch(fetchData('/api/data'));
```

#### 4.2 Redux Logger（日志中间件）

```javascript
// redux-logger 简化实现
function createLogger({
  collapsed = true,
  timestamp = true,
  level = 'log',
}: LoggerOptions = {}): Middleware {
  return (store) => (next) => (action) => {
    const prevState = store.getState();
    const startTime = Date.now();

    // 执行下一个中间件
    const result = next(action);

    const nextState = store.getState();
    const deltaTime = Date.now() - startTime;

    // 记录日志
    const time = timestamp ? ` @ ${deltaTime}ms` : '';
    const logLevel = level === 'log' ? console.log : console[level];

    logLevel(
      `%c action ${action.type}${time}`,
      'color: #03A9F4; font-weight: bold'
    );

    if (collapsed) {
      logGroupCollapsed('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState);
      logGroupCollapsed('%c action', 'color: #03A9F4; font-weight: bold', action);
      logGroupCollapsed('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
    } else {
      logLevel('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState);
      logLevel('%c action', 'color: #03A9F4; font-weight: bold', action);
      logLevel('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
    }

    return result;
  };
}

function logGroupCollapsed(...args: any[]) {
  const hasConsole = typeof console !== 'undefined';
  if (hasConsole && console.groupCollapsed) {
    console.groupCollapsed(...args);
    console.groupEnd();
  } else {
    console.log(...args);
  }
}

// 使用示例
const store = createStore(
  rootReducer,
  applyMiddleware(
    createLogger({ collapsed: false })
  )
);
```

#### 4.3 Redux Promise（Promise 中间件）

```javascript
// redux-promise 简化实现
function promiseMiddleware(): Middleware {
  return ({ dispatch }) => (next) => (action) => {
    // 如果 action.payload 是 Promise
    if (isPromise(action.payload)) {
      dispatch({ ...action, type: `${action.type}_PENDING` });

      return action.payload
        .then(result => {
          dispatch({ ...action, payload: result, type: `${action.type}_FULFILLED` });
          return result;
        })
        .catch(error => {
          dispatch({ ...action, payload: error, type: `${action.type}_REJECTED` });
          return Promise.reject(error);
        });
    }

    return next(action);
  };
}

function isPromise(value: any): value is Promise<any> {
  if (value !== null && typeof value === 'object') {
    return value && typeof value.then === 'function';
  }
  return false;
}

// 使用示例
// Action Creator
const fetchData = (url) => ({
  type: 'FETCH_DATA',
  payload: fetch(url).then(response => response.json())
});

// 使用
store.dispatch(fetchData('/api/data'));
```

### 5. 中间件组合与执行流程

```javascript
// 中间件组合示例
const middleware1 = store => next => action => {
  console.log('Middleware 1 - Before');
  const result = next(action);
  console.log('Middleware 1 - After');
  return result;
};

const middleware2 = store => next => action => {
  console.log('Middleware 2 - Before');
  const result = next(action);
  console.log('Middleware 2 - After');
  return result;
};

const middleware3 = store => next => action => {
  console.log('Middleware 3 - Before');
  const result = next(action);
  console.log('Middleware 3 - After');
  return result;
};

// 应用中间件
const store = createStore(
  rootReducer,
  applyMiddleware(middleware1, middleware2, middleware3)
);

// 执行流程（洋葱模型）：
// dispatch({ type: 'TEST' })
// 输出：
// Middleware 1 - Before
// Middleware 2 - Before
// Middleware 3 - Before
// Middleware 3 - After
// Middleware 2 - After
// Middleware 1 - After

// compose 内部实现详解
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  // 从右到左组合
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// 等价于：
// const dispatch = middleware1(middlewareAPI)(
//   middleware2(middlewareAPI)(
//     middleware3(middlewareAPI)(
//       store.dispatch
//     )
//   )
// );
```

### 6. Redux Toolkit 简化实现

```javascript
// Redux Toolkit 的 createSlice 简化实现
function createSlice({
  name,
  initialState,
  reducers,
}: CreateSliceOptions): Slice {
  const actionCreators = {};
  const caseReducers = {};

  // 生成 action creators 和 case reducers
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key];
    const type = `${name}/${key}`;

    // 创建 action creator
    actionCreators[key] = (payload: any) => ({ type, payload });

    // 创建 case reducer
    caseReducers[type] = reducer;
  });

  // 创建主 reducer
  function reducer(state = initialState, action: Action) {
    const caseReducer = caseReducers[action.type];
    if (caseReducer) {
      return caseReducer(state, action.payload);
    }
    return state;
  }

  return {
    name,
    reducer,
    actions: actionCreators,
    caseReducers,
  };
}

// 使用示例
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state, action) => {
      state.value += 1;
    },
    decrement: (state, action) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Redux Toolkit 的 configureStore 简化实现
function configureStore({
  reducer,
  middleware = getDefaultMiddleware(),
  devTools = process.env.NODE_ENV !== 'production',
  preloadedState,
}: ConfigureStoreOptions) {
  const enhancers = [];

  // 添加中间件
  if (middleware) {
    enhancers.push(applyMiddleware(...middleware));
  }

  // 开发工具
  if (devTools && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  }

  const storeEnhancer = compose(...enhancers);
  const store = createStore(reducer, preloadedState, storeEnhancer);

  return store;
}
```

## 简化版实现

```javascript
// 简化版 Redux
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];

  const getState = () => state;

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
    return action;
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };

  // 初始化
  dispatch({ type: '@@INIT' });

  return { getState, dispatch, subscribe };
}

// 简化版 applyMiddleware
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    let dispatch = () => {};

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
}

// 简化版 compose
function compose(...funcs) {
  if (funcs.length === 0) return (arg) => arg;
  if (funcs.length === 1) return funcs[0];
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// 简化版 redux-thunk
const thunkMiddleware = ({ dispatch, getState }) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
};

// 使用示例
// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'SET_COUNT':
      return { count: action.payload };
    default:
      return state;
  }
}

// Async Action Creator
function fetchCount(amount) {
  return (dispatch, getState) => {
    console.log('Fetching count...');

    setTimeout(() => {
      const currentCount = getState().count;
      const newCount = currentCount + amount;
      dispatch({ type: 'SET_COUNT', payload: newCount });
    }, 1000);
  };
}

// 创建 store
const store = createStore(
  counterReducer,
  applyMiddleware(thunkMiddleware)
);

// 订阅状态变化
store.subscribe(() => {
  console.log('State:', store.getState());
});

// 分发 action
store.dispatch({ type: 'INCREMENT' }); // State: { count: 1 }
store.dispatch(fetchCount(10)); // Fetching count... (1秒后) State: { count: 11 }
```

## 使用场景

1. **createStore**：创建 Redux store
2. **applyMiddleware**：应用中间件（thunk、logger、promise 等）
3. **redux-thunk**：处理异步 action
4. **redux-logger**：记录 action 和状态变化
5. **redux-promise**：处理 Promise 类型的 action
6. **createSlice**：Redux Toolkit 简化 reducer 和 action 创建
7. **configureStore**：Redux Toolkit 简化 store 创建

## 面试要点

1. **Redux 的三大原则**：
   - 单一数据源
   - 状态只读
   - 纯函数修改状态

2. **中间件的执行流程**：
   - 洋葱模型：从外到内，再从内到外
   - compose 函数从右到左组合中间件
   - 每个中间件接收 store 和 next 函数

3. **redux-thunk 的原理**：
   - 检测 action 是否为函数
   - 如果是函数，执行它并传入 dispatch 和 getState
   - 如果不是，传递给下一个中间件

4. **中间件的应用场景**：
   - 异步操作（thunk、saga、observable）
   - 日志记录（logger）
   - 错误处理（crash reporting）
   - 调试工具（devtools）

5. **Redux Toolkit 的优势**：
   - 简化配置
   - 自动生成 action types
   - 内置 immer 支持不可变更新
   - 内置 thunk 中间件

6. **Redux 的数据流**：
   - View 触发 action
   - Store 接收 action
   - Middleware 处理 action
   - Reducer 计算新状态
   - State 更新触发视图重绘

7. **性能优化**：
   - 使用 reselect 缓存计算结果
   - 使用 redux-toolkit 的 immer 减少不可变操作开销
   - 合理拆分 reducer
   - 使用 middleware 缓存异步请求

8. **常见问题**：
   - 如何处理复杂的异步逻辑？（thunk、saga、observable）
   - 如何避免不必要的重渲染？（connect 的 selector）
   - 如何组织大型应用的 reducer？（模块化、combineReducers）
   - 如何调试 Redux 状态？（redux-devtools、logger）

9. **中间件自定义**：
   - 中间件签名为 store => next => action => {}
   - 可以访问 getState 和 dispatch
   - 必须调用 next(action) 继续传递 action
   - 可以拦截或修改 action

10. **Redux 与 React 的集成**：
    - 使用 react-redux 的 Provider 和 connect
    - 使用 Hooks（useSelector、useDispatch）
    - 使用 Redux Toolkit 的 hooks

11. **中间件的注意事项**：
    - 不要在中间件中修改原 action
    - 中间件应该保持纯净，只做必要处理
    - 异步中间件需要处理错误
    - 注意中间件的执行顺序

12. **Redux 的替代方案**：
    - Zustand：更轻量级
    - Jotai：原子化状态
    - Recoil：Facebook 的状态管理库
    - Context API：简单场景