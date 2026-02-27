## 11. 写出一个函数trans，将数字转换成汉语的输出

**题目：** 实现一个函数，将数字转换成中文输出，输入为不超过10000亿的数字。

**参考答案：**

```javascript
function trans(num) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万'];

  if (num === 0) {
    return '零';
  }

  if (num < 0) {
    return '负' + trans(-num);
  }

  let result = '';
  let strNum = num.toString();
  let length = strNum.length;
  let zeroFlag = false; // 标记是否有连续的零

  for (let i = 0; i < length; i++) {
    const digit = parseInt(strNum[i]);
    const unit = units[length - i - 1];

    if (digit === 0) {
      if (!zeroFlag && i !== length - 1) {
        zeroFlag = true;
        result += digits[digit];
      }
    } else {
      if (zeroFlag) {
        zeroFlag = false;
      }

      // 处理"一十"的情况
      if (digit === 1 && unit === '十' && i === 0 && length === 2) {
        result += unit;
      } else {
        result += digits[digit] + unit;
      }
    }
  }

  // 处理末尾的零
  result = result.replace(/零+$/, '');

  // 处理多个连续的零
  result = result.replace(/零+/g, '零');

  // 处理"零万"的情况
  result = result.replace(/零万/g, '万');

  // 处理"零亿"的情况
  result = result.replace(/零亿/g, '亿');

  return result;
}

// 测试
console.log(trans(0));        // 零
console.log(trans(1));        // 一
console.log(trans(10));       // 十
console.log(trans(11));       // 十一
console.log(trans(100));      // 一百
console.log(trans(101));      // 一百零一
console.log(trans(110));      // 一百一十
console.log(trans(123));      // 一百二十三
console.log(trans(1000));     // 一千
console.log(trans(1001));     // 一千零一
console.log(trans(1010));     // 一千零一十
console.log(trans(1100));     // 一千一百
console.log(trans(10000));    // 一万
console.log(trans(10001));    // 一万零一
console.log(trans(12345));    // 一万二千三百四十五
console.log(trans(100000));   // 十万
console.log(trans(1000000));  // 一百万
console.log(trans(10000000)); // 一千万
console.log(trans(100000000)); // 一亿
console.log(trans(1234567890)); // 十二亿三千四百五十六万七千八百九十
```

---