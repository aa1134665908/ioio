import { Component, OnInit, } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ChatdataService } from '../chatdata.service';
import { Subscription } from 'rxjs';

interface Message {
  content: string;
  type: 'question' | 'answer';
}


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {

  content: string = ""
  showChatDetail = false;
  private routerSub: Subscription = new Subscription();
  isCaptchaVisible: number = 0;

  options = ["GPT-3.5", "GPT-4"]


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

  handleIndexChange(event: any) {
    // console.log(event);
    this.isCaptchaVisible = event
  }


  generateUniqueId(): string {
    const timestamp = new Date().getTime().toString(16); // 获取当前时间戳并转换为16进制字符串
    const randomString = Math.random().toString(16).substring(2, 15); // 生成8位随机的16进制字符串
    // console.log(timestamp, randomString);

    const uniqueId = `${timestamp}${randomString}`; // 拼接时间戳和随机字符串
    return uniqueId.substring(0, 24); // 截取前16位作为最终的唯一标识符
  }




  constructor(private chatService: ChatService, private router: Router, private route: ActivatedRoute, private chatDataService: ChatdataService) { }

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateShowChatDetail();
      }
    });

    // 初始化时检查当前路径
    this.updateShowChatDetail();
  }

  private updateShowChatDetail(): void {
    const childRoute = this.route.snapshot.firstChild;
    if (childRoute) {
      // 这里依据你的子路由路径做判断
      this.showChatDetail = true;
    } else {
      this.showChatDetail = false;
    }
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  addItem(id: string, content: string, type: 'question' | 'answer') {
    const newMessage: Message =
    {
      content: content, // 固定内容
      type: type
    }; // 创建新项
    this.chatDataService.addItem(id, newMessage); // 调用服务的方法添加新项
  }



  sendMessage() {
    const tempContent = this.content;
    const messageId = this.generateUniqueId();
    this.addItem(messageId, tempContent, 'question')
    this.router.navigate([messageId], { relativeTo: this.route });
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
    this.showChatDetail = true;
    this.chatService.clearMessage();
    this.chatService.sendMessage(messages, messageId);
  }
}
