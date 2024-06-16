import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Message {
  content: string;
  type: 'question' | 'answer';
}

@Injectable({
  providedIn: 'root'
})
export class ChatdataService {

  constructor() { }


  private itemsSubject = new BehaviorSubject<Message[]>([]);
  items$ = this.itemsSubject.asObservable();
  
  addItem(item: Message) {
    const currentItems = this.itemsSubject.value; // 获取当前的项列表
    this.itemsSubject.next([...currentItems, item]); // 添加新项并广播更新
  }
  // private inputData :string=''

  // setInputData(data:string):void{
  //   // console.log('this.inputData111',this.inputData);
    
  //   this.inputData=data
  // }
  // getInputData(): string {
  //   // console.log('this.inputData:22222',this.inputData);
    
  //   return this.inputData;
  // }
}
