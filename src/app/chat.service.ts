import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ChatdataService } from './chatdata.service';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://api.deepseek.com/chat/completions';
  private messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();

  constructor(private chatdataService: ChatdataService) { }

  sendMessage(messages: any[], id: string): void {
    const data = {
      "messages": messages,
      "model": "deepseek-chat",
      "max_tokens": 2048,
      "stop": null,
      "stream": true,
    };

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': 'Bearer sk-e7a82dd7b0a4471b8705fea2608fd60e'
    });

    fetch(this.apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
      credentials: 'include'
    }).then(response => {
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        const readStream = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
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
                    this.updateMessage(chunk.choices[0].delta.content, id);
                  }
                } else {
                  reader.cancel();
                }
              }
            });

            readStream();
          });
        };

        readStream();
      } else {
        console.error('Failed to fetch stream:', response.statusText);
      }
    }).catch(error => {
      console.error('Error fetching stream:', error);
    });
  }

  updateMessage(messagePart: string, id: string) {
    console.log('Updating message:', messagePart);
    this.messageSubject.next(this.messageSubject.getValue() + messagePart);
    this.chatdataService.addItem(id, { content: messagePart, type: 'answer' });
  }
  clearMessage() {
    console.log('Clearing message');
    this.messageSubject.next('');
  }
}
