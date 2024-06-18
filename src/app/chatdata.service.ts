import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

interface Message {
  content: string;
  type: 'question' | 'answer';
}

interface GroupedMessages {
  [id: string]: Message[];
}


@Injectable({
  providedIn: 'root'
})
export class ChatdataService {

  constructor(private router: Router) {
    // console.log('ChatdataService initialized with items:', this.itemsSubject.value);  // 添加日志
  }

  private storageKey = 'chatData';
  private itemsSubject = new BehaviorSubject<GroupedMessages>(this.loadFromLocalStorage());
  private currentIdSubject = new BehaviorSubject<string | null>(null); // 用于保存和广播当前选中的ID
  items$ = this.itemsSubject.asObservable();

  addItem(id: string, item: Message) {
    // console.log('Adding item:', item, 'to id:', id);
    const currentItems = this.itemsSubject.value;
    const groupedItems = {
      ...currentItems,
      [id]: [...(currentItems[id] || []), item]
    };
    // console.log('Current Items after adding:', groupedItems);
    this.itemsSubject.next(groupedItems);
    this.saveToLocalStorage(groupedItems);
  }

resetItems(): void {
 this.itemsSubject.next({});
 localStorage.removeItem(this.storageKey); // 清空本地存储的数据
}

getItemsById(id: string): Observable<Message[]> {
  return this.items$.pipe(
    map(groupedItems => {
      const items = groupedItems[id] || [];
      return items.length > 0 ? items : [{ content: '', type: 'answer' }];
    })
  );
 }

  getIds(): Observable<string[]> {
    return this.items$.pipe(
      map(groupedMessages => {
        console.log('getIds:', Object.keys(groupedMessages));
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
    console.log('getCurrentId:', this.currentIdSubject.value);
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

}
