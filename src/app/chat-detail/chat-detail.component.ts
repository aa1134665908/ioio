import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { ChatdataService } from '../chatdata.service';
import { Observable, map, Subscription, of } from 'rxjs';

interface Message {
  content: string;
  type: 'question' | 'answer';
}

@Component({

  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.less'],

})
export class ChatDetailComponent implements OnInit {

  content: string = ''
  moduleTitle: string = ''
  private routeSubscription: Subscription = new Subscription(); // 新增的订阅变量
  items$: Observable<Message[]> = of([]);


  ngOnInit(): void {

    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      this.chatDataService.setCurrentId(id); // 将ID发送到服务
      if (id) {
        this.items$ = this.chatDataService.getItemsById(id);
      }
    });
    this.chatComponent.isCaptchaVisible === 0 ? this.moduleTitle = 'gpt-3.5-turbo（默认）' : this.moduleTitle = 'gpt-4o'
  }

  constructor(private chatService: ChatService, private chatComponent: ChatComponent, private changeDetector: ChangeDetectorRef, private chatDataService: ChatdataService, private route: ActivatedRoute,) { }

  private updateComponentForNewId(id: string) {
    // 更新组件数据
    this.items$ = this.chatDataService.items$.pipe(
      map(groupedMessages => {
        return groupedMessages[id] || [];
      })
    );
  }



  private enterPressCount = 0;
  onEnterPress(event: Event, textareaRef: HTMLTextAreaElement) {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.shiftKey) {
      // 如果按下了 Shift 键,则允许换行
      return;
    }

    // 阻止默认的换行行为
    event.preventDefault();

    this.enterPressCount++;
    if (this.enterPressCount === 2) {
      // 执行你想要的函数
      this.sendMessage();
      // 重置计数器
      this.enterPressCount = 0;
    }
  }


  ngOnDestroy() {
    // console.log('ChatDetailComponent destroyed.');  
    this.routeSubscription.unsubscribe(); // 取消订阅，避免内存泄漏
    this.chatComponent.showChatDetail = false;
  }




  sendMessage() {
    const tempContent = this.content;
    this.addItem(tempContent, 'question')
    this.content = ''
    const messages = [
      {
        "content": "You are ChatGPT, a large language model trained by OpenAI, based on the gpt-4o(omni) architecture.Knowledge cutoff: 2023-10",
        "role": "system"
      },
      {
        "content": tempContent,
        "role": "user"
      }
    ];


    this.chatService.clearMessage();
    this.chatService.sendMessage(messages, this.route.snapshot.params['id']);

  }

  trackByFn(index: number, item: any): number {
    return item.id; // 返回项的唯一标识符
  }


  addItem(content: string, type: 'question' | 'answer') {
    const newMessage: Message =
    {
      content: content,
      type: type
    }; // 创建新项
    this.chatDataService.addItem(this.route.snapshot.params['id'], newMessage); // 调用服务的方法添加新项
  }


}
