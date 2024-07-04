import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Message } from "./chat-message.interface"


interface Conversation {
  model: string;
  messages: Message[];
}

interface GroupedMessages {
  [id: string]: Conversation;
}

@Injectable({
  providedIn: 'root'
})
export class ChatdataService {

  constructor(private router: Router) {

  }

  private storageKey = 'chatData';
  private itemsSubject = new BehaviorSubject<GroupedMessages>(this.loadFromLocalStorage());
  private currentIdSubject = new BehaviorSubject<string | null>(null); // 用于保存和广播当前选中的ID
  items$ = this.itemsSubject.asObservable();
  selectedModel: BehaviorSubject<string> = new BehaviorSubject<string>(('deepseek-chat(默认)'))

  

  

  addItem(id: string, item: Message, model?: string) {
    const currentItems = this.itemsSubject.value;

    if (currentItems[id]) {
      // 如果 ID 已存在
      if (item.role === 'assistant') {
        const lastMessage = currentItems[id].messages[currentItems[id].messages.length - 1];
        if (lastMessage.role === 'assistant') {
          // 如果最后一条消息也是 'assistant'，则追加内容
          lastMessage.content += item.content;
        } else {
          // 如果最后一条消息不是 'assistant'，则创建新的 'assistant' 消息
          currentItems[id].messages.push(item);
        }
      } else {
        // 如果消息角色是 'user'，则创建新的条目
        currentItems[id].messages.push(item);
      }
    } else {
      // 如果 ID 不存在，则创建新条目并设置模型
      currentItems[id] = {
        model: model || 'deepseek-chat', // 使用传递的模型或默认模型
        messages: [item]
      };
    }

    this.itemsSubject.next(currentItems);
    this.saveToLocalStorage(currentItems);
  }


  resetItems(): void {
    this.itemsSubject.next({});
    localStorage.removeItem(this.storageKey); // 清空本地存储的数据
  }


  getItemsById(id: string): Observable<Message[]> {
    return this.items$.pipe(
      map(groupedItems => {
        const conversation = groupedItems[id];
        if (conversation && conversation.messages.length > 0) {
          return conversation.messages;
        } else {
          return [{ content: '', role: 'assistant' }];
        }
      })
    );
  }



  getModelById(id: string): string {
  const groupedItems = this.itemsSubject.value;
  const conversation = groupedItems[id];
  if (conversation) {
    return conversation.model;
  } else {
    throw new Error(`Conversation with id ${id} not found`);
  }
}


  deleteMessage(id: string, index: number) {
    const currentItems = this.itemsSubject.value; // 获取所有消息组
    if (currentItems[id]) { // 检查对应的组是否存在
      if (index >= 0 && index < currentItems[id].messages.length) { // 检查索引是否有效
        currentItems[id].messages.splice(index, 1); // 删除组中的特定消息
        this.itemsSubject.next({ ...currentItems }); // 更新消息组
        this.saveToLocalStorage(currentItems); // 同步更新本地存储
      }
    }
  }

  getIds(): Observable<string[]> {
    return this.items$.pipe(
      map(groupedMessages => {

        return Object.keys(groupedMessages);
      })
    );
  }

  // 设置当前ID
  setCurrentId(id: string | null): void {
    if (id && !this.itemsSubject.value[id]) {
      this.router.navigate(['/chat']);
      return;
    }
    this.currentIdSubject.next(id);
  }

  // 获取当前ID
  getCurrentId(): Observable<string | null> {
    // console.log('getCurrentId:', this.currentIdSubject.value);
    return this.currentIdSubject.asObservable();
  }


  private saveToLocalStorage(data: GroupedMessages) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private loadFromLocalStorage(): GroupedMessages {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  removeGroupById(id: string): void {
    const currentItems = this.itemsSubject.value;
    if (currentItems[id]) {
      delete currentItems[id];
      this.itemsSubject.next({ ...currentItems });
      this.saveToLocalStorage(currentItems);
    }
  }

  handleSelectedModel(model: string): void {
    this.selectedModel.next(model)
    console.log(666666, this.selectedModel.value);
  }
  getSelectedModel(): string {
    return this.selectedModel.value
  }

  updateMessage(messagePart: string, id: string) {
   
    this.addItem(id, { content: messagePart, role: 'assistant' });
    
  }



}
