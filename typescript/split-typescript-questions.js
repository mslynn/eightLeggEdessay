import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主文件
const mainFile = path.join(__dirname, 'TypeScript面试题集锦.md');
const rawContent = fs.readFileSync(mainFile, 'utf-8');
const content = rawContent.replace(/\r\n/g, '\n');

function toSafeTitle(title) {
  return title
    .replace(/[\/\\:*?"<>|？`]/g, '_')
    .replace(/\s+/g, '_');
}

// 查找所有问题标题及其在文档中的位置
const questionPattern = /###\s+(\d+)\.\s+(.+?)\r?\n/g;
const questions = [];
let match;

while ((match = questionPattern.exec(content)) !== null) {
  questions.push({
    number: Number(match[1]),
    title: match[2].trim(),
    start: match.index
  });
}

console.log(`找到 ${questions.length} 个问题`);

// 创建问题文件夹
const questionsDir = path.join(__dirname, 'questions-typescript');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir);
}

// 拆分每个问题
questions.forEach((question, index) => {
  const questionNumber = question.number;
  const safeTitle = toSafeTitle(question.title);
  const fileName = `${String(questionNumber).padStart(2, '0')}-${questionNumber}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);

  const end = index < questions.length - 1 ? questions[index + 1].start : content.indexOf('\n## 总结');
  const questionBlock = content.slice(question.start, end === -1 ? content.length : end).trim();
  const answerPrefix = `### ${questionNumber}. ${question.title}\n\n**答案：**`;

  if (!questionBlock.startsWith(answerPrefix)) {
    console.log(`警告：问题 ${questionNumber} 的格式不符合预期`);
    return;
  }

  let answerContent = questionBlock.slice(answerPrefix.length).trim();
  answerContent = answerContent.replace(/\n+---\s*$/, '').trim();

  const questionContent = `# ${questionNumber}. ${question.title}\n\n**答案：**\n\n${answerContent}`;

  fs.writeFileSync(filePath, questionContent, 'utf-8');
  console.log(`创建文件: ${fileName}`);
});

// 创建索引文件
const indexContent = `# TypeScript 面试题集锦（截止 2025 年底）

## 目录

${questions.map((q) => `${q.number}. [${q.number}. ${q.title}](./questions-typescript/${String(q.number).padStart(2, '0')}-${q.number}__${toSafeTitle(q.title)}.md)`).join('\n')}

---

## 问题列表

${questions.map((q) => `
### ${q.number}. ${q.title}

[查看详细答案](./questions-typescript/${String(q.number).padStart(2, '0')}-${q.number}__${toSafeTitle(q.title)}.md)`).join('\n')}
`;

fs.writeFileSync(path.join(__dirname, 'index.md'), indexContent, 'utf-8');
console.log('创建文件: index.md');

console.log(`完成！共创建 ${questions.length} 个问题文件和 1 个索引文件`);
