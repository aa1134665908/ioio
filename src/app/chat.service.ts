import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';

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
      "frequency_penalty": 0,
      "max_tokens": 2048,
      "presence_penalty": 0,
      "stop": null,
      "stream": false,
      "temperature": 1,
      "top_p": 1,
      "logprobs": false,
      "top_logprobs": null
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer sk-e7a82dd7b0a4471b8705fea2608fd60e'
    });
    
    return this.http.post(this.apiUrl, data, { headers });
  }

  setMessage(message: string) {
    this.messageSubject.next(message);
  }
}