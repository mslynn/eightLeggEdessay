import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取主文件
const mainFile = path.join(__dirname, '编程题集锦.md');
const content = fs.readFileSync(mainFile, 'utf-8');

// 分割问题
const questions = content.split(/^## /gm).filter(q => q.trim());

// 创建 questions 目录
const questionsDir = path.join(__dirname, 'questions-programming');
if (!fs.existsSync(questionsDir)) {
  fs.mkdirSync(questionsDir, { recursive: true });
}

// 清空旧文件
const oldFiles = fs.readdirSync(questionsDir);
oldFiles.forEach(file => {
  const filePath = path.join(questionsDir, file);
  fs.unlinkSync(filePath);
});

// 生成问题文件
questions.forEach((question, index) => {
  const title = question.split('\n')[0].trim();
  // 替换非字母数字字符为下划线，并将多个连续下划线替换为单个下划线
  let safeTitle = title.replace(/[^\w\u4e00-\u9fa5\-]/g, '_');
  safeTitle = safeTitle.replace(/_+/g, '_');
  // 限制文件名长度，避免过长
  if (safeTitle.length > 50) {
    safeTitle = safeTitle.substring(0, 50);
  }
  // 移除结尾的下划线
  safeTitle = safeTitle.replace(/_$/, '');

  const fileName = `${String(index + 1).padStart(2, '0')}__${safeTitle}.md`;
  const filePath = path.join(questionsDir, fileName);

  const questionContent = `## ${question.trim()}`;
  fs.writeFileSync(filePath, questionContent, 'utf-8');

  console.log(`Created: ${fileName}`);
});

console.log(`Total questions: ${questions.length}`);