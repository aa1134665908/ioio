import { Injectable } from '@angular/core';
const katex = require('katex');

@Injectable({
  providedIn: 'root'
})
export class KatexService {
  renderExpression(expression: string, displayMode: boolean = false): string {
    try {
      const rendered = katex.renderToString(expression, {
        displayMode: displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',  // 输出HTML和MathML
        strict: 'ignore'  // 忽略错误，继续渲染
      });

      // 提取 MathML 部分
      const match = rendered.match(/(<math[\s\S]*?<\/math>)/);
      return match ? match[0] : expression; // 返回 MathML 或原始表达式

    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return expression; // 返回原始表达式，如果渲染失败
    }
  }
}
