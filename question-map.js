// 所有面试题映射文件
// 生成时间：2026-02-27

const questionMap = {
  "javascript": {
    name: "JavaScript",
    dir: "javascript/questions",
    questions: []
  },
  "react": {
    name: "React",
    dir: "react/questions",
    questions: []
  },
  "vue2": {
    name: "Vue2",
    dir: "vue2/questions-vue2",
    questions: [
      { filename: "01-1__Vue2_的双向绑定原理是什么_.md", title: "Vue2 的双向绑定原理是什么？" },
      { filename: "02-2__Vue2_的虚拟_DOM_和_Diff_算法原理是什么_.md", title: "Vue2 的虚拟 DOM 和 Diff 算法原理是什么？" },
      { filename: "03-3__Vue2_的模板编译原理是什么_.md", title: "Vue2 的模板编译原理是什么？" },
      { filename: "04-4__Vue2_的依赖收集机制是什么_.md", title: "Vue2 的依赖收集机制是什么？" },
      { filename: "05-5__Vue2_的响应式系统有哪些限制_.md", title: "Vue2 的响应式系统有哪些限制？" },
      { filename: "06-6__Vue2_的_computed_和_watch_的区别是什么_.md", title: "Vue2 的 computed 和 watch 的区别是什么？" },
      { filename: "07-7__Vue2_组件通信有哪些方式_.md", title: "Vue2 组件通信有哪些方式？" },
      { filename: "08-8__Vue2_的生命周期有哪些_各个阶段的作用是什么_.md", title: "Vue2 的生命周期有哪些？各个阶段的作用是什么？" },
      { filename: "09-9__Vue2_的常用指令有哪些_.md", title: "Vue2 的常用指令有哪些？" },
      { filename: "10-10__自定义指令如何实现_.md", title: "自定义指令如何实现？" },
      { filename: "11-11__Vue_Router_的核心概念有哪些_.md", title: "Vue Router 的核心概念有哪些？" },
      { filename: "12-12__Vuex_的核心概念有哪些_.md", title: "Vuex 的核心概念有哪些？" },
      { filename: "13-13__Vue2_性能优化有哪些方法_.md", title: "Vue2 性能优化有哪些方法？" },
      { filename: "14-14__Vue2_常见面试题汇总.md", title: "Vue2 常见面试题汇总" }
    ]
  },
  "vue3": {
    name: "Vue3",
    dir: "vue3/questions-vue3",
    questions: []
  },
  "es6": {
    name: "ES6",
    dir: "es6/questions-es6",
    questions: []
  },
  "css": {
    name: "CSS",
    dir: "css/questions-css",
    questions: []
  },
  "html": {
    name: "HTML",
    dir: "html/questions-html",
    questions: []
  },
  "typescript": {
    name: "TypeScript",
    dir: "typescript/questions-typescript",
    questions: []
  },
  "http": {
    name: "HTTP",
    dir: "http/questions-http",
    questions: []
  },
  "git": {
    name: "Git",
    dir: "git/questions-git",
    questions: []
  },
  "node": {
    name: "Node.js",
    dir: "node/questions-node",
    questions: []
  },
  "design-patterns": {
    name: "设计模式",
    dir: "design-patterns/questions-design-patterns",
    questions: []
  },
  "miniprogram": {
    name: "小程序",
    dir: "miniprogram/questions-miniprogram",
    questions: []
  },
  "algorithm": {
    name: "算法",
    dir: "algorithm/questions-algorithm",
    questions: []
  },
  "programming": {
    name: "编程题",
    dir: "programming/questions-programming",
    questions: []
  },
  "lowcode": {
    name: "低代码",
    dir: "lowcode/questions-lowcode",
    questions: []
  },
  "ali": {
    name: "阿里巴巴",
    dir: "big-company/questions-ali",
    questions: []
  },
  "baidu": {
    name: "百度",
    dir: "big-company/questions-baidu",
    questions: []
  },
  "jd": {
    name: "京东",
    dir: "big-company/questions-jd",
    questions: []
  },
  "pdd": {
    name: "拼多多",
    dir: "big-company/questions-pdd",
    questions: []
  },
  "tencent": {
    name: "腾讯",
    dir: "big-company/questions-tencent",
    questions: []
  },
  "zhihu": {
    name: "知乎",
    dir: "big-company/questions-zhihu",
    questions: []
  },
  "bytedance": {
    name: "字节跳动",
    dir: "big-company/questions-bytedance",
    questions: []
  },
  "futu": {
    name: "富途",
    dir: "big-company/questions-futu",
    questions: []
  },
  "gaotu": {
    name: "高途",
    dir: "big-company/questions-gaotu",
    questions: []
  },
  "dianxiaomi": {
    name: "店小秘",
    dir: "big-company/questions-dianxiaomi",
    questions: []
  },
  "xiaomi": {
    name: "小米",
    dir: "big-company/questions-xiaomi",
    questions: []
  },
  "engineering": {
    name: "工程化",
    dir: "scenarios/questions-engineering",
    questions: []
  },
  "performance": {
    name: "性能优化",
    dir: "scenarios/questions-performance",
    questions: []
  },
  "qiankun": {
    name: "微前端",
    dir: "scenarios/questions-qiankun",
    questions: []
  },
  "vite": {
    name: "Vite",
    dir: "vite/questions-vite",
    questions: []
  },
  "webpack": {
    name: "Webpack",
    dir: "webpack/questions-webpack",
    questions: []
  }
};

// 输出统计信息
console.log('=== 面试题映射统计 ===');
let totalQuestions = 0;
Object.keys(questionMap).forEach(key => {
  const count = questionMap[key].questions.length;
  totalQuestions += count;
  console.log(`${key} (${questionMap[key].name}): ${count} 题`);
});
console.log(`\n总计: ${totalQuestions} 题`);