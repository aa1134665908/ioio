import { Component, OnInit, } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ChatdataService } from '../chatdata.service';
import { Subscription } from 'rxjs';
import { Message } from "../chat-message.interface"
import { AIManagerService } from '../aimanager.service';

interface SubModel {
  name: string;
  imageUrl?: string
  value: string
  available: boolean
}

interface ModelGroup {
  name: string;
  imageUrl: string;
  subModels: SubModel[];
  title?: string;
  content?: string;
  selectedSubModelIndex?: number | null;

}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {

  modelGroup: ModelGroup[] = [
    {
      name: "ChatGPT",
      imageUrl: "../../assets/icn_gpt3.5_off.png",
      title: '当前地球上公布的 最聪明的 AI 模型 ',

      content: 'ChatGPT 是基于 OpenAI 的 GPT 系列模型开发的对话系统，能够理解和生成自然语言文本，广泛应用于聊天、问答、内容创作等场景，帮助用户解决各种问题并提供信息支持。',
      subModels: [
        { name: "GPT-3.5", imageUrl: '../../assets/icn_gpt3.5_off.png', value: 'GPT-3.5', available: false },
        { name: "GPT-4Turbo", imageUrl: '../../assets/icn_gpt3.5_off.png', value: 'GPT-4Turbo', available: false },
        { name: "GPT-4o", imageUrl: '../../assets/icn_gpt3.5_off.png', value: 'GPT-4o', available: false }
      ],
      selectedSubModelIndex: 0
    },
    {
      name: "Other",
      title: '其他不同能力的模型',
      imageUrl: "../../assets/icn_gpt4_turbo_off.png",
      content: '更多实验性的模型，感受不一样的效果，注意此模式为探索性质，稳定性较弱',
      subModels: [
        { name: "deepseek-chat(默认)", imageUrl: '../../assets/icn_gpt4_turbo_off.png', value: 'deepseek-chat', available: true },
        { name: "deepseek-coder", imageUrl: '../../assets/icn_gpt4_turbo_off.png', value: 'deepseek-coder', available: true },
        { name: "qwen1.5-110b-chat", imageUrl: '../../assets/icn_gpt4_turbo_off.png', value: 'qwen1.5-110b-chat', available: true },
        { name: "qwen-plus", imageUrl: '../../assets/icn_gpt4_turbo_off.png', value: 'qwen-plus', available: true }
      ],
      selectedSubModelIndex: null
    },
    // 你可以在这里添加更多主要模型
  ];
  hoveredIndex: number | null = null;
  isMouseSelect: boolean = false
  isInitialLoad: boolean = false;
  hideDetailsTimeout: any;
  content: string = ""
  showChatDetail = false;
  private routerSub: Subscription = new Subscription();
  isCaptchaVisible: number = 1;
  modelName: string = ''
  isModelAvailable: boolean = true

  private enterPressCount = 0;
  // selectedModelIndex: number=0;

  selectModel(groupIndex: number, subModelIndex: number): void {
    this.modelGroup.forEach((group, index) => {
      if (index !== groupIndex) {
        group.selectedSubModelIndex = null;
      }
    });
    // 设置当前选择的子模型
    this.modelGroup[groupIndex].selectedSubModelIndex = subModelIndex;
    
    
    this.sendSelectedSubModelName(groupIndex)
  }

  modelGroupSelect(index: number): void {
    this.isCaptchaVisible = index;
    this.isInitialLoad = true;
  }

  getImageStyle(index: number): { filter?: string } {
    if (this.isCaptchaVisible === index || this.hoveredIndex === index) {
      if (index === 0) {
        return {
          filter: 'brightness(0) saturate(100%) invert(71%) sepia(17%) saturate(1354%) hue-rotate(137deg) brightness(89%) contrast(90%)'
        };
      } else if (index === 1) {
        return {
          filter: 'brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(1854%) hue-rotate(247deg) brightness(115%) contrast(88%)'
        };
      }
    }
    return {}; // 不应用滤镜
  }

  getTextStyle(index: number): { color?: string } {
    if (this.isCaptchaVisible === index || this.hoveredIndex === index) {
      return { color: 'black' };
    }
    return {}; // 默认颜色
  }

  onMouseEnter(index: number): void {
    this.modelGroupSelect(index)
    this.hoveredIndex = index;
    console.log(this.modelGroup[this.hoveredIndex].name);
    
    this.isMouseSelect = true;
    this.clearHideDetailsTimeout();
  }

  scheduleHideDetails(): void {
    this.hideDetailsTimeout = setTimeout(() => {
      this.hoveredIndex = null;
      // this.isCaptchaVisible = -1;
      this.isInitialLoad = false
    }, 300); // 延迟300毫秒
  }

  clearHideDetailsTimeout(): void {
    
    
    if (this.hideDetailsTimeout) {
      clearTimeout(this.hideDetailsTimeout);
      this.hideDetailsTimeout = null;
    }
  }

  sendSelectedSubModelName(groupIndex: number) {
    // 获取当前选择的模型
    const selectedModel = this.modelGroup[groupIndex];

    // 检查 selectedSubModelIndex 是否有效
    if (typeof selectedModel.selectedSubModelIndex === 'number') {
      // 获取当前选择的子模型
      const selectedSubModel = selectedModel.subModels[selectedModel.selectedSubModelIndex];

      // 获取当前选择的子模型的名称
      const selectedSubModelName = selectedSubModel.value;

      // 调用服务函数，并传递当前选择的子模型名称
      this.chatDataService.handleSelectedModel(selectedSubModelName)

      this.modelName = this.chatDataService.getSelectedModel()
      this.isModelAvailable=selectedSubModel.available
    }
    else {
      console.log('模型选择错误', selectedModel);

    }
  }


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




  constructor(

    private router: Router,
    private route: ActivatedRoute,
    private chatDataService: ChatdataService,
    private aimanagerService: AIManagerService
  ) { }

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        
        this.updateShowChatDetail();
      }
    });
    
    // 初始化时检查当前路径
    this.updateShowChatDetail();
    this.selectModel(1, 0)

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

  addItem(id: string, content: string, role: 'user' | 'assistant') {
    const newMessage: Message =
    {
      content: content, // 固定内容
      role: role
    }; // 创建新项
    this.chatDataService.addItem(id, newMessage, this.chatDataService.getSelectedModel()); // 调用服务的方法添加新项
  }



  sendMessage() {
    const tempContent = this.content;
    const messageId = this.generateUniqueId();
    this.addItem(messageId, tempContent, 'user')
    
    this.router.navigate([messageId], { relativeTo: this.route });
    this.content = ''
    this.showChatDetail = true;
    this.aimanagerService.isSending = true;
    
    // this.aimanagerService.cancelOngoingRequest();
    this.aimanagerService.sendMessage(messageId, this.chatDataService.getSelectedModel());

  }
}
