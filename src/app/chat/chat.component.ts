import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
 selector: 'app-chat',
 templateUrl: './chat.component.html',
 styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {
 content: string = "";
 showChatDetail = false;
 isCaptchaVisible: number = 0;
 options = ["GPT-3.5", "GPT-4"];
 private enterPressCount = 0;
 private messageId: string = '';
 private messageContent: string = '';

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
   console.log(event);
   this.isCaptchaVisible = event
 }

 onMouseEnter(): boolean {
   return true
 }

 onSubmit() {
   console.log(this.content);
 }

 constructor(private chatService: ChatService, private router: Router, private route: ActivatedRoute) { }

 ngOnInit(): void {
 }

 sendMessage() {
   const tempContent = this.content;
   this.content = '';
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
   this.chatService.sendMessage(messages);
 }
}
