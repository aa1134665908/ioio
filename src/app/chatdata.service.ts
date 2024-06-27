import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Message } from "./chat-message.interface"

// interface Message {
//   content: string;
//   type: 'question' | 'answer';
// }

interface GroupedMessages {
  [id: string]: Message[];
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
  selectedModel:BehaviorSubject<string>=new BehaviorSubject<string>(('GPT-3.5(默认)'))

  addItem(id: string, item: Message) {
  const currentItems = this.itemsSubject.value;
  
  if (currentItems[id]) {
    // If the ID already exists
    if (item.role === 'assistant') {
      const lastMessage = currentItems[id][currentItems[id].length - 1];
      if (lastMessage.role === 'assistant') {
        // If the last message is also an 'assistant', append the content
        lastMessage.content += item.content;
      } else {
        // If the last message is not an 'assistant', create a new 'assistant' message
        currentItems[id].push(item);
      }
    } else {
      // If the message role is 'user', create a new entry
      currentItems[id].push(item);
    }
  } else {
    // If the ID doesn't exist, create a new entry
    currentItems[id] = [item];
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
      const items = groupedItems[id] || [];
      return items.length > 0 ? items : [{ content: '', role: 'assistant' }];
    })
  );
 }

 deleteMessage(id: string, index: number) {
  const currentItems = this.itemsSubject.value; // 获取所有消息组
  if (currentItems[id]) { // 检查对应的组是否存在
    if (index >= 0 && index < currentItems[id].length) { // 检查索引是否有效
      currentItems[id].splice(index, 1); // 删除组中的特定消息
      this.itemsSubject.next({ ...currentItems }); // 更新消息组
      this.saveToLocalStorage(currentItems); // 同步更新本地存储
    }
  }
}

  getIds(): Observable<string[]> {
    return this.items$.pipe(
      map(groupedMessages => {
        // console.log('getIds:', Object.keys(groupedMessages));
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

   handleSelectedModel(model:string):void{
    this.selectedModel.next(model)
    console.log(model);
   }

}
