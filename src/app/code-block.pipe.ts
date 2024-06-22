import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codeBlockHeader'
})
export class CodeBlockHeaderPipe implements PipeTransform {
  transform(value: string): string {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    return value.replace(codeBlockRegex, (match, language, code) => {
      language = language || 'plaintext';
      return `<div class="code-block-wrapper">
        <div class="language-header">
          <div class="language-name">${language}</div>
          <button class="copy-button" onclick="copyCode(this)">Copy</button>
        </div>
        ${match}
      </div>`;
    });
  }
}
