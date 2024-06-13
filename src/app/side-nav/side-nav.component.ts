import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.less']
})
export class SideNavComponent implements OnInit {
  items: { name: string, img: string, hoverImg: string, isOn: boolean }[] = [
    {
      name: 'Chat',
      img: 'assets/chat-off.svg',
      hoverImg: 'assets/chat-on.svg',
      isOn: true
    },
    {
      name: '工具',
      img: 'assets/tools-off.svg',
      hoverImg: 'assets/tools-on.svg',
      isOn: false
    }
  ];

  selectedIndex: number | null = 0;

  toggleState(index: number) {
    if (this.selectedIndex === index) {
      this.items[index].isOn = false;
      this.selectedIndex = null;
    } else {
      if (this.selectedIndex !== null) {
        this.items[this.selectedIndex].isOn = false;
      }
      this.items[index].isOn = true;
      this.selectedIndex = index;
    }
  }

  createMessage(msg:string):void{
    this.message.create('error',msg)
  }

  constructor(private message: NzMessageService) { }

  ngOnInit(): void {
  }

}
