import { Injectable } from '@angular/core';
import { AIService, Message } from './chat-message.interface'
import { map, Subject, take, tap } from 'rxjs';
import { ChatdataService } from './chatdata.service';




@Injectable({
  providedIn: 'root'
})
export class DeepseekService implements AIService {
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private abortController: AbortController | null = null;
  private streamCompleteSubject = new Subject<string>();
  public streamComplete$ = this.streamCompleteSubject.asObservable(); // 公开 streamComplete$

  constructor(
    private chatdataService: ChatdataService,
    

  ) { }

  sendMessage(id: string, model: string = 'deepseek-chat'): void {
    this.chatdataService.getItemsById(id).pipe(
      take(1),
      map(messages => {
        const systemMessage: Message = {
          content: "你是OPENAI研制的一个人工智能助手，名为GPT-4o。你基于GPT-4架构开发，旨在通过自然语言处理技术帮助用户解答问题、提供信息和进行交流。虽然你没有实体或个人意识，但你被设计成能够模拟人类的交流方式，以便更好地服务于用户的需求。知识截止时间：2023-10",
          role: "system"
        };
        return this.trimMessages([systemMessage, ...messages]);
      }),
      tap(trimmedMessages => {
        
        const data = {
          "messages": trimmedMessages,
          "model": model,
          "max_tokens": 2048,
          "stop": null,
          "stream": true,
        };
        console.log('Trimmed messages:', JSON.stringify(data, null, 2));
        const headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': 'Bearer sk-e7a82dd7b0a4471b8705fea2608fd60e'
        });

        this.cancelOngoingRequest();
        this.abortController = new AbortController();

        fetch(this.apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(data),
          credentials: 'include',
          signal: this.abortController.signal
        }).then(response => {
          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            const readStream = (): void => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  this.streamCompleteSubject.next(id);
                  this.abortController = null;
                  return;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                lines.forEach(line => {
                  if (line.startsWith('data:')) {
                    const data = line.substring(5).trim();
                    if (data !== '[DONE]') {
                      const chunk = JSON.parse(data);
                      if (chunk.choices[0].delta.content) {
                        this.chatdataService.updateMessage(chunk.choices[0].delta.content, id);
                      }
                    } else {
                      reader.cancel();
                    }
                  }
                });

                readStream();
              }).catch(error => {
                if (error.name === 'AbortError') {
                  console.log('Fetch aborted');
                } else {
                  console.error('Error in stream:', error);
                }
                this.streamCompleteSubject.next(id);
                this.abortController = null;
              });
            };

            readStream();
          } else {
            console.error('Failed to fetch stream:', response.statusText);
          }
        }).catch(error => {
          console.error('Error fetching stream:', error);
        });
      })
    ).subscribe();
  }

  cancelOngoingRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  trimMessages(messages: Message[], maxTokens: number = 32000): Message[] {
    let totalTokens = 0;
    const trimmedMessages: Message[] = [];

    // 分离系统消息和非系统消息
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system').reverse();


    if (systemMessage) {
      const systemTokens = this.estimateTokens(systemMessage.content);
      trimmedMessages.push(systemMessage);
      totalTokens += systemTokens;
      console.log('System message tokens:', systemTokens);
    }

    // 先添加最新的消息
    // const nonSystemMessages = messages.filter(m => m.role !== 'system').reverse();

    for (let i = 0; i < nonSystemMessages.length; i++) {
      const message = nonSystemMessages[i];
      const messageTokens = this.estimateTokens(message.content);
      console.log(`Message ${nonSystemMessages.length - i} tokens:`, messageTokens);

      if (totalTokens + messageTokens <= maxTokens) {
        trimmedMessages.push(message);
        totalTokens += messageTokens;
      } else {
        console.log(`Stopped at message ${nonSystemMessages.length - i} due to token limit`);
        break;
      }
    }

    console.log('Total tokens in trimmed messages:', totalTokens);
    console.log('Number of messages included:', trimmedMessages.length);

    // 反转消息顺序，使系统消息在前，最新消息在后
    return systemMessage
      ? [systemMessage, ...trimmedMessages.slice(1).reverse()]
      : trimmedMessages.reverse();
  }


  estimateTokens(text: string): number {
    let tokenCount = 0;

    // 匹配中文字符、英文单词、数字和符号
    const regex = /[\u4e00-\u9fa5]|[a-zA-Z]+|\d+|[^\u4e00-\u9fa5a-zA-Z0-9\s]/g;
    const matches = text.match(regex) || [];

    for (const match of matches) {
      if (/[\u4e00-\u9fa5]/.test(match)) {
        // 中文字符
        tokenCount += 0.6 * match.length;
      } else if (/[a-zA-Z]/.test(match)) {
        // 英文单词
        tokenCount += 0.3 * match.length;
      } else {
        // 数字或符号
        tokenCount += 1;
      }
    }

    // 向上取整，确保至少返回 1
    return Math.max(1, Math.ceil(tokenCount));
  }



}