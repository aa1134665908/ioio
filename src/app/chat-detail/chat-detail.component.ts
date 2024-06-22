import {  ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2 } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';
import { ChatdataService } from '../chatdata.service';
import { Observable, map, Subscription, of } from 'rxjs';
import { MarkdownService } from 'ngx-markdown';

interface Message {
  content: string;
  type: 'question' | 'answer';
}

declare var Prism: any;


@Component({

  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.less'],

})
export class ChatDetailComponent implements OnInit {
  private observer: MutationObserver | null = null;
  content: string = ''
  moduleTitle: string = ''
  private routeSubscription: Subscription = new Subscription(); // 新增的订阅变量
  items$: Observable<Message[]> = of([]);
  copyFeedbackButton: HTMLButtonElement | null = null;
  private streamCompleteSubscription: Subscription | undefined;


  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      this.chatDataService.setCurrentId(id); // 将ID发送到服务
      if (id) {
        
        this.items$ = this.chatDataService.getItemsById(id);
        this.cdr.detectChanges(); // 触发变更检测
        setTimeout(() => this.wrapCodeBlocks(), 0); 
      }
    });
    this.streamCompleteSubscription = this.chatService.streamComplete$.subscribe(
      (completedId: string) => {
        if (completedId === this.route.snapshot.params['id']) {
          setTimeout(() => this.wrapCodeBlocks(), 0);
        }
      }
    );
    
    this.chatComponent.isCaptchaVisible === 0 ? this.moduleTitle = 'gpt-3.5-turbo（默认）' : this.moduleTitle = 'gpt-4o'
    setTimeout(() => this.scrollToBottom(), 0);
  
  }

  constructor(
    private chatService: ChatService,
    private chatComponent: ChatComponent,
    private chatDataService: ChatdataService,
    private route: ActivatedRoute,
    private markdownService: MarkdownService,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }


  ngAfterViewInit() {
    const chatContainer = this.el.nativeElement.querySelector('.main');
    this.observer = new MutationObserver(() => {
      this.scrollToBottom();
    });

    this.observer.observe(chatContainer, { childList: true, subtree: true });
  }

  private wrapCodeBlocks() {
    this.ngZone.run(() => {
      console.log('Starting wrapCodeBlocks');
      
      const preElements = this.el.nativeElement.querySelectorAll('pre');
      preElements.forEach((pre: HTMLElement) => {
        const code = pre.querySelector('code');
        if (code) {
          const language = this.getLanguage(code);
          const wrapper = this.renderer.createElement('div');
          this.renderer.addClass(wrapper, 'code-block-wrapper');

          const header = this.renderer.createElement('div');
          this.renderer.addClass(header, 'language-header');

          const languageSpan = this.renderer.createElement('span');
          this.renderer.addClass(languageSpan, 'language-name');
          this.renderer.setProperty(languageSpan, 'textContent', language);

          const copyButton = this.renderer.createElement('button') as HTMLButtonElement;
          this.renderer.addClass(copyButton, 'copy-button');
          this.renderer.setProperty(copyButton, 'textContent', 'Copy code');
          this.renderer.listen(copyButton, 'click', () => this.copyCode(code, copyButton));

          this.renderer.appendChild(header, languageSpan);
          this.renderer.appendChild(header, copyButton);

          this.renderer.insertBefore(pre.parentNode, wrapper, pre);
          this.renderer.appendChild(wrapper, header);
          this.renderer.appendChild(wrapper, pre);
        }
      });

      setTimeout(() => this.scrollToBottom(), 0);
      this.cdr.detectChanges();
      console.log('Finished wrapCodeBlocks');
    });
  }

  private getLanguage(codeElement: HTMLElement): string {
    const classes = codeElement.className.split(' ');
    const langClass = classes.find(cls => cls.startsWith('language-'));
    return langClass ? langClass.replace('language-', '') : 'plaintext';
  }


  private showCopyFeedback() {
    if (this.copyFeedbackButton) {
      const originalText = this.copyFeedbackButton.textContent;
      this.copyFeedbackButton.textContent = '已复制!';
      this.copyFeedbackButton.disabled = true;

      setTimeout(() => {
        if (this.copyFeedbackButton) {
          this.copyFeedbackButton.textContent = originalText;
          this.copyFeedbackButton.disabled = false;
        }
      }, 2000); // 2秒后恢复原状
    }
  }

  private copyCode(codeElement: HTMLElement, button: HTMLButtonElement) {
    const text = codeElement.textContent || '';
    this.copyFeedbackButton = button; // 设置当前激活的按钮
    navigator.clipboard.writeText(text).then(
      () => {
        console.log('Code copied to clipboard');
        this.showCopyFeedback();
      },
      (err) => {
        console.error('Failed to copy code: ', err);
      }
    );
  }


  processMarkdown(content: string): string {
    const parsed = this.markdownService.parse(content);
    setTimeout(() => {
      if (typeof Prism !== 'undefined' && Prism.highlightAll) {
        Prism.highlightAll();
      }
    }, 0);
    return parsed;
  }


  private scrollToBottom(): void {
    try {
      const chatBox = this.el.nativeElement.querySelector('.main');
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch(err) { }
  }
  

  // private updateComponentForNewId(id: string) {
  //   // 更新组件数据
  //   this.items$ = this.chatDataService.items$.pipe(
  //     map(groupedMessages => {
  //       return groupedMessages[id] || [];
  //     })
  //   );
  // }



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
    if (this.observer) {
      this.observer.disconnect();
    }
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
