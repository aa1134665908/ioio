import { Component, OnInit, } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {
  content:string=""
  isCaptchaVisible: number = 0;

  options=["GPT-3.5","GPT-4"]
 


  handleIndexChange(event: any) {
    console.log(event);
    this.isCaptchaVisible=event
  }

  onMouseEnter():boolean{
    return true
  }

  onSubmit(){
    console.log(this.content);
    
  }

  constructor() { }

  ngOnInit(): void {
  }

}
