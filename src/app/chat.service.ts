import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject ,BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://api.deepseek.com/chat/completions';
  private messageSubject = new BehaviorSubject<string>('');
  message$ = this.messageSubject.asObservable();
  
  constructor(private http: HttpClient) { }

  sendMessage(messages: any[]): Observable<any> {
    const data = {
      "messages": messages,
      "model": "deepseek-chat",
     
      "max_tokens": 2048,
      
      "stop": null,
      "stream": true,
      
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': 'Bearer sk-e7a82dd7b0a4471b8705fea2608fd60e'
    });
    console.log('Sending message:', messages);
    return this.http.post(this.apiUrl, data, { headers, responseType: 'text' });
  }

  updateMessage(messagePart: string) {
    console.log('Updating message:', messagePart);
    this.messageSubject.next(this.messageSubject.getValue() + messagePart);
  }

  clearMessage() {
    console.log('Clearing message');
    this.messageSubject.next('');
  }
}
