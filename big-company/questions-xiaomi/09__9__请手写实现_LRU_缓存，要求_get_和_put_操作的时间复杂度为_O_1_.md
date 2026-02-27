# 9. 请手写实现 LRU 缓存，要求 get 和 put 操作的时间复杂度为 O(1)

**答案：**

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    
    // 删除并重新插入，实现最近使用
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      // 如果已存在，先删除
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项（Map 的第一个元素）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}

// 测试
const lru = new LRUCache(2);

lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1)); // 1
lru.put(3, 3); // key 2 被删除
console.log(lru.get(2)); // -1
lru.put(4, 4); // key 1 被删除
console.log(lru.get(1)); // -1
console.log(lru.get(3)); // 3
console.log(lru.get(4)); // 4
```

---
