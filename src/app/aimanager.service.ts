import { Injectable } from '@angular/core';
import { DeepseekService } from './deepseek.service';
import { AIService } from "./chat-message.interface";
import { Observable, Subject } from 'rxjs';
import { QwenService } from './qwen.service'

@Injectable({
  providedIn: 'root'
})
export class AIManagerService implements AIService {

  private modelServices: { [key: string]: AIService };
  private currentModel: string = 'deepseek-chat';
  isSending:boolean=false


  

  constructor(
    private deepseekService: DeepseekService,
    private qwenservice: QwenService,
    // 根据需要注入更多服务
  ) {
    // 确保 DeepseekService 符合 AIService 接口
    this.modelServices = {
      'deepseek-chat': this.deepseekService,
      'deepseek-coder': this.deepseekService,
      'qwen1.5-110b-chat': this.qwenservice,
      'qwen-plus': this.qwenservice,
      // 可以继续添加更多模型和对应的服务
    };
  }

  sendMessage(id: string, model: string = 'deepseek-chat'): void {
    const service = this.modelServices[model];
    this.isSending=true
    if (service) {
      this.currentModel = model;
      try {
        service.sendMessage(id, model);
      } catch (error) {
        console.error(`Error in ${model} service:`, error);
        // 由于接口定义为 void，我们不能返回错误，只能记录它
      }
    } else {
      console.error('Unsupported model:', model);
      // 同样，我们只能记录错误，不能抛出
    }
  }

  cancelOngoingRequest(): void {
    this.isSending=false
    
    const service = this.modelServices[this.currentModel];
    if (service && typeof service.cancelOngoingRequest === 'function') {
      service.cancelOngoingRequest();
    } else {
      console.warn(`Cancel request not supported for model: ${this.currentModel}`);
    }

    
  }

  

  // get streamComplete$(): Observable<string> {
    
  //   const service = this.modelServices[this.currentModel];
  //   if (service) {
      
  //     return service.streamComplete$;
  //   }
    
  //   return new Subject<string>().asObservable(); // 返回一个空的 Observable 以防止错误
  // }


}
