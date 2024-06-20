import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { Router, ActivatedRoute } from '@angular/router';
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
  messageContent: string = '';
  moduleTitle: string = ''
  // messages: Message[] = []
  // msgContent: string = ''
  // question: string = ''
  private routeSubscription: Subscription = new Subscription(); // 新增的订阅变量
  selfRouterId: string = ''
  items$: Observable<Message[]> = of([]);

  // ngOnInit(): void {
  //   this.chatService.message$.subscribe(
  //     (messagePart) => {
  //       console.log('Message part received in ChatDetailComponent:', messagePart);
  //       this.messageContent = messagePart;
  //       this.changeDetector.detectChanges();
  //     }
  //   );
  // }


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

  constructor(private chatService: ChatService, private chatComponent: ChatComponent, private changeDetector: ChangeDetectorRef, private chatDataService: ChatdataService, private route: ActivatedRoute,) {
    // this.items$ = this.chatDataService.items$.pipe(
    //   map(groupedMessages => {
    //     const id = this.route.snapshot.params['id'];
    //     return groupedMessages[id] || [];
    //   })
    // );

    // this.items$ = this.route.paramMap.pipe(
    //   map(params => {
    //     const id = params.get('id');
    //     return this.chatDataService.getItemsById(id);
    //   }),
    //   map(items => items || [])
    // );

  }

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


  // addMessage(content: string, type: 'question' | 'answer') {
  //   const message: Message = { content: content, type: type };
  //   this.messages.push(message);
  // }

  // onQuestionReceived(questionContent: string) {
  //   this.addMessage(questionContent, 'question');
  // }

  // onAnswerReceived(answerContent: string) {
  //   this.addMessage(answerContent, 'answer');
  // }

  ngOnDestroy() {
    // console.log('ChatDetailComponent destroyed.');  
    this.routeSubscription.unsubscribe(); // 取消订阅，避免内存泄漏
    this.chatComponent.showChatDetail = false;
  }



  // sendMessage() {
  //   const tempContent = this.content;
  //   // console.log(1111111111111111111111111111111);
  //   this.addItem(tempContent,'question')

  //   this.content = ''
  //   const messages = [
  //     {
  //       "content": "You are ChatGPT, a large language model trained by OpenAI, based on the gpt-4o(omni) architecture.Knowledge cutoff: 2023-10",
  //       "role": "system"
  //     },
  //     {
  //       "content": tempContent,
  //       "role": "user"
  //     }
  //   ];



  //   this.chatService.sendMessage(messages).subscribe(
  //     (response) => {
  //       // const messageId = response.id;

  //       this.content = '';
  //       this.addItem(response.choices[0].message.content,'answer');
  //       // console.log(this.items$);
  //       // console.log(this.route.snapshot.params['id']);

  //       // this.onAnswerReceived(response.choices[0].message.content)
  //       // this.chatService.setMessage(response.choices[0].message.content);
  //       // console.log(response);
  //       // console.log(response.choices[0].message.content);
  //       // 处理响应数据
  //     },
  //     (error) => {
  //       console.error(error);
  //       // 处理错误
  //     }
  //   );
  // }


  sendMessage() {
    // this.chatDataService.resetItems() //暂时用不上。清空数据
    const tempContent = this.content;



    // this.chatDataService.setInputData(this.content)
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
  // messageContent: string='';

  // constructor(private route: ActivatedRoute, private chatComponent: ChatComponent,private chatService: ChatService) { }

  // ngOnInit(): void {
  //   this.route.params.subscribe(params => {
  //     const messageId = params['messageId'];
  //     // 使用 messageId 进行相应的操作
  //   });

  //   this.chatService.message$.subscribe(message => {
  //     this.messageContent = message;
  //   });
  // }

  // ngOnDestroy() {
  //   this.chatComponent.showChatDetail = false;
  // }

}
