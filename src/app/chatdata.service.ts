import { Injectable } from '@angular/core';
import { BehaviorSubject,map } from 'rxjs';

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

  constructor() { }


  private itemsSubject = new BehaviorSubject<GroupedMessages>({});
  items$ = this.itemsSubject.asObservable();

  addItem(id: string, item: Message) {
    const currentItems = this.itemsSubject.value;
    const groupedItems = {
      ...currentItems,
      [id]: [...(currentItems[id] || []), item]
    };
    this.itemsSubject.next(groupedItems);
  }

  resetItems() {
    this.itemsSubject.next({});
  }

  getItemsById(id: string) {
    return this.items$.pipe(
      map(groupedItems => groupedItems[id] || [])
    );
  }

  getIds() {
    return this.items$.pipe(
      map(groupedMessages => Object.keys(groupedMessages))
    );
  }

}
