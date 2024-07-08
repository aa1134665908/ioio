import { Observable } from "rxjs";

export interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export interface AIService {
  sendMessage(id: string, model?: string): void;
  cancelOngoingRequest(): void;
  
}