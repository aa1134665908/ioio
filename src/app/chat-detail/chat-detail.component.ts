import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
 selector: 'app-chat-detail',
 templateUrl: './chat-detail.component.html',
 styleUrls: ['./chat-detail.component.less']
})
export class ChatDetailComponent implements OnInit {

 messageContent: string = '';

 constructor(private chatService: ChatService, private chatComponent: ChatComponent, private changeDetector: ChangeDetectorRef) { }

 ngOnInit(): void {
   this.chatService.message$.subscribe(
     (messagePart) => {
       console.log('Message part received in ChatDetailComponent:', messagePart);
       this.messageContent = messagePart;
       this.changeDetector.detectChanges();
     }
   );
 }

 ngOnDestroy() {
   this.chatComponent.showChatDetail = false;
 }
}
