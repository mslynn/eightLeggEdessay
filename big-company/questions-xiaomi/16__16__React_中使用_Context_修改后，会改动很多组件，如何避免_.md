# 16. React 中使用 Context 修改后，会改动很多组件，如何避免？

**答案：**

**问题：**
Context 更新会导致所有消费该 Context 的组件重新渲染，即使组件只使用了 Context 的一部分数据。

**解决方案：**

1. **拆分 Context**
```javascript
// 不好的做法
const AppContext = React.createContext({
  user: null,
  theme: 'light',
  settings: {}
});

// 好的做法：拆分为多个 Context
const UserContext = React.createContext(null);
const ThemeContext = React.createContext('light');
const SettingsContext = React.createContext({});

// 子组件只订阅需要的 Context
function UserProfile() {
  const user = useContext(UserContext);
  return <div>{user.name}</div>;
}
```

2. **使用 memo 和 useMemo**
```javascript
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* 渲染逻辑 */}</div>;
});

function ParentComponent() {
  const { user, theme } = useContext(AppContext);
  
  const processedData = useMemo(() => {
    return expensiveOperation(user);
  }, [user]); // 只在 user 变化时重新计算
  
  return <ExpensiveComponent data={processedData} />;
}
```

3. **使用选择器模式**
```javascript
function useContextSelector(context, selector) {
  const value = useContext(context);
  return useMemo(() => selector(value), [value, selector]);
}

// 使用
function UserName() {
  const name = useContextSelector(UserContext, user => user.name);
  return <div>{name}</div>;
}
```

4. **使用第三方库**
```javascript
// 使用 zustand（推荐）
import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
}));

// 订阅特定值
const userName = useStore(state => state.user.name);
const theme = useStore(state => state.theme);

// 只在 user.name 变化时重新渲染
```

---
