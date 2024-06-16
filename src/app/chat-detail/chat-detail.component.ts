import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChatComponent } from '../chat/chat.component'
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { ChatdataService } from '../chatdata.service';
import { Observable } from 'rxjs';

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
  messages: Message[] = []
  msgContent: string = ''
  question: string = ''

  items$: Observable<Message[]>;


  constructor(private chatService: ChatService, private chatComponent: ChatComponent, private changeDetector: ChangeDetectorRef, private chatDataService: ChatdataService) {
    this.items$=this.chatDataService.items$
   }

  ngOnInit(): void {

    // this.onQuestionReceived(this.chatDataService.getInputData())
    console.log(this.messages);
    // console.log(111,this.chatComponent.content);

    this.chatService.message$.subscribe(
      (messagePart) => {
        console.log('Message part received in ChatDetailComponent:', messagePart);
        this.onAnswerReceived(messagePart)
        // this.messageContent = messagePart;
        this.changeDetector.detectChanges();
      }
    );
    this.chatComponent.isCaptchaVisible === 0 ? this.moduleTitle = 'gpt-3.5-turbo（默认）' : this.moduleTitle = 'gpt-4o'


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


  addMessage(content: string, type: 'question' | 'answer') {
    const message: Message = { content: content, type: type };
    this.messages.push(message);
  }

  onQuestionReceived(questionContent: string) {
    this.addMessage(questionContent, 'question');
  }

  onAnswerReceived(answerContent: string) {
    this.addMessage(answerContent, 'answer');
  }

  ngOnDestroy() {
    this.chatComponent.showChatDetail = false;
  }


  sendMessage() {
    const tempContent = this.content;
    // console.log(1111111111111111111111111111111);
    this.addItem(tempContent)

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



    this.chatService.sendMessage(messages).subscribe(
      (response) => {
        // const messageId = response.id;

        this.content = ''
        this.onAnswerReceived(response.choices[0].message.content)
        // this.chatService.setMessage(response.choices[0].message.content);
        // console.log(response);
        // console.log(response.choices[0].message.content);
        // 处理响应数据
      },
      (error) => {
        console.error(error);
        // 处理错误
      }
    );
  }


  trackByFn(index: number, item: any): number {
    return item.id; // 返回项的唯一标识符
  }


  addItem(content:string) {
    const newMessage: Message = 
    {
      content: content, // 固定内容
      type: 'question'
    }; // 创建新项
    this.chatDataService.addItem(newMessage); // 调用服务的方法添加新项
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
