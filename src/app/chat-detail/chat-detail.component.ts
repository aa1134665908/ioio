import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ChatdataService } from '../chatdata.service';
import { Observable, Subject, Subscription, filter, of, takeUntil } from 'rxjs';
import { MarkdownService } from 'ngx-markdown';
import { Message } from "../chat-message.interface"
import { KatexService } from '../katex.service';
import { marked } from 'marked';
import { AIManagerService } from '../aimanager.service'

@Component({

  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.less'],

})
export class ChatDetailComponent implements OnInit {
  private observer: MutationObserver | null = null;
  public isUserScrolling: boolean = false;
  public isClickbtn:boolean=false
  content: string = ''
  moduleTitle: string = ''
  private routeSubscription: Subscription = new Subscription(); // 新增的订阅变量
  items$: Observable<Message[]> = of([]);
  copyFeedbackButton: HTMLButtonElement | null = null;

  private ngUnsubscribe = new Subject<void>();
  private lastScrollTop: number = 0;

  textWidth = 0;
  @ViewChild('textareaRef') textareaRef!: ElementRef;

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(() => {
      this.handleRouteChange();
    });

    // 初始化组件
    this.handleRouteChange();

    this.routeSubscription = this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      this.chatDataService.setCurrentId(id); // 将ID发送到服务

      if (id) {

        this.items$ = this.chatDataService.getItemsById(id);
        this.cdr.detectChanges(); // 触发变更检测
        setTimeout(() => this.wrapCodeBlocks(), 0);
      }
      this.moduleTitle = this.chatDataService.getModelById(this.route.snapshot.params['id'])

    });




    this.chatDataService.streamComplete$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((completedId: string) => {
      if (completedId === this.route.snapshot.params['id']) {
        this.handleStreamComplete();
      }
    });

    // this.chatComponent.isCaptchaVisible === 0 ? this.moduleTitle = 'gpt-3.5-turbo（默认）' : this.moduleTitle = 'gpt-4o'
    // this.scrollToBottom()
    this.setupMarkdownKatex()


  }



  constructor(
    private chatComponent: ChatComponent,
    private chatDataService: ChatdataService,
    private route: ActivatedRoute,
    private markdownService: MarkdownService,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private katexService: KatexService,
    public aimanagerService: AIManagerService,
    private router: Router,
  ) { }

  private currentChatId: string | undefined;

  private handleRouteChange(): void {
    const newId = this.route.snapshot.params['id'];
    console.log('Route changed, new id:', newId);

    if (this.currentChatId && this.currentChatId !== newId) {
      // 只有在切换到不同的聊天时才取消请求
      console.log('Switching to a different chat, cancelling current request');
      this.content=''
      this.cancelRequest();
      this.aimanagerService.isSending = false;
    }

    this.currentChatId = newId;

    // 初始化聊天
    this.moduleTitle = this.chatDataService.getModelById(newId);
  }


  private handleStreamComplete() {
    setTimeout(() => this.wrapCodeBlocks(), 0);
    setTimeout(() => this.setupMarkdownKatex(), 0);
    this.aimanagerService.isSending = false;
    console.log('Stream completed, isSending:', this.aimanagerService.isSending);
    this.isUserScrolling = false;
    this.isClickbtn=false
  }

  ngAfterViewInit() {
    const chatContainer = this.el.nativeElement.querySelector('.main');
    this.observer = new MutationObserver(() => {
      if (!this.isUserScrolling) {
        this.scrollToBottom();
      }
    });

    this.observer.observe(chatContainer, { childList: true, subtree: true });

    // 改进的滚动事件监听器
    chatContainer.addEventListener('scroll', () => {
      // 检查滚动位置是否发生了变化
      if (chatContainer.scrollTop != this.lastScrollTop) {
        // 检查是否不在底部
        const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop === chatContainer.clientHeight;
        if (!isAtBottom) {
          this.isUserScrolling = true;
          this.isClickbtn=false
          console.log('User scrolling detected');
        }
      }
      this.lastScrollTop = chatContainer.scrollTop;
    });
  }


  private wrapCodeBlocks() {
    this.ngZone.run(() => {
      // console.log('Starting wrapCodeBlocks');

      const preElements = this.el.nativeElement.querySelectorAll('pre:not(.wrapped)');
      preElements.forEach((pre: HTMLElement) => {
        const code = pre.querySelector('code');
        if (code) {
          // 标记这个 pre 元素为已处理
          this.renderer.addClass(pre, 'wrapped');

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
          if (pre.parentNode && pre.parentNode instanceof Element && !pre.parentNode.classList.contains('code-block-wrapper')) {
            this.renderer.insertBefore(pre.parentNode, wrapper, pre);
            this.renderer.appendChild(wrapper, header);
            this.renderer.appendChild(wrapper, pre);
          } else if (!pre.parentNode) {
            console.warn('Pre element has no parent node:', pre);
            // 可以在这里添加一些错误处理逻辑
          } else {
            console.warn('Pre element parent is not an Element or already wrapped:', pre);
            // 可以在这里添加一些额外的处理逻辑
          }

        }
      });

      // setTimeout(() => this.scrollToBottom(), 0);
      // this.cdr.detectChanges();
      // console.log('Finished wrapCodeBlocks');
    });
  }

  private setupMarkdownKatex() {
    // console.log('Setting up Markdown and KaTeX');
    const renderer = new marked.Renderer();

    const originalParagraph = renderer.paragraph.bind(renderer);
    const originalText = renderer.text.bind(renderer);

    renderer.paragraph = (text: string) => {
      // console.log('Original paragraph:', text);
      const processedText = this.processKatex(text);
      // console.log('Processed paragraph:', processedText);
      return originalParagraph(processedText);
    };

    renderer.text = (text: string) => {
      // console.log('Original text:', text);
      const processedText = this.processKatex(text);
      // console.log('Processed text:', processedText);
      return originalText(processedText);
    };

    this.markdownService.renderer = renderer;
  }

  private processKatex(text: string): string {
    // console.log('Processing KaTeX for:', text);

    // 处理块级数学公式
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      // console.log('Found block formula:', formula);
      const rendered = this.katexService.renderExpression(formula.trim(), true);
      // console.log('Rendered block formula:', rendered);
      return rendered;
    });

    // 处理行内数学公式
    text = text.replace(/\$(.+?)\$/g, (match, formula) => {
      // console.log('Found inline formula:', formula);
      const rendered = this.katexService.renderExpression(formula.trim(), false);
      // console.log('Rendered inline formula:', rendered);
      return rendered;
    });

    // console.log('After KaTeX processing:', text);
    return text;
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



  deleteMessage(index: number) {
    const currentId = this.route.snapshot.params['id'];
    this.chatDataService.deleteMessage(currentId, index);
  }

  private scrollToBottom(): void {
    try {
      const chatBox = this.el.nativeElement.querySelector('.main');
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) { }
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

    this.cancelRequest()

    // 发出信号以取消所有使用 takeUntil 的订阅
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();



    // 取消特定的订阅（如果还需要的话）
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }


    // 断开 MutationObserver 连接
    if (this.observer) {
      this.observer.disconnect();
    }

    // 重置组件状态
    this.chatComponent.showChatDetail = false;
    console.log('ChatDetailComponent destroyed.');
  }

  cancelRequest() {
    this.aimanagerService.cancelOngoingRequest();
    // this.isSending = false
  }



  sendMessage() {
    const tempContent = this.content;
    this.addItem(tempContent, 'user')
    this.content = ''
    // this.isSending = true

    this.aimanagerService.isSending = true;

    this.aimanagerService.cancelOngoingRequest();

    this.aimanagerService.sendMessage(this.route.snapshot.params['id'], this.moduleTitle);


  }

  trackByFn(index: number, item: Message): number {
    return index;
  }


  addItem(content: string, role: 'user' | 'assistant') {
    const newMessage: Message =
    {
      content: content,
      role: role
    }; // 创建新项
    this.chatDataService.addItem(this.route.snapshot.params['id'], newMessage); // 调用服务的方法添加新项
  }


  scroll_btn(){
    this.scrollToBottom()
    this.isUserScrolling=!this.isUserScrolling
    this.isClickbtn=true

  }

  onMessageInput() {
    if (this.textareaRef) {
      const textarea = this.textareaRef.nativeElement;
      this.textWidth = this.getTextWidth(
        textarea.value,
        getComputedStyle(textarea)
      );
      // console.log('Current text width:', this.textWidth);
    }
  }

  private getTextWidth(text: string, font: CSSStyleDeclaration): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = font.font;
      return context.measureText(text).width;
    }
    return 0;
  }

}
