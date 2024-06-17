import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router,} from '@angular/router';
import { ChatdataService } from '../chatdata.service';
import { Observable,map } from 'rxjs';


interface Message {
  content: string;
  type: 'question' | 'answer';
}
@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.less'],
  animations: [
    trigger('sideNavAnimation', [
      state('expanded', style({
        width: '260px',
        minWidth: '260px'
      })),
      state('collapsed', style({
        width: '0',
        minWidth: '0'
      })),
      transition('expanded <=> collapsed', animate('0.6s ease'))
    ])
  ]

})
export class UserInfoComponent implements OnInit {
  isSideNavCollapsed: boolean = false;
  ids$: Observable<string[]>;
  
  selectedIndex: number = -1;

  onItemClick(index: number,id: string) {
    this.selectedIndex = index;
    this.router.navigate(['/chat', id]);
  }
  


  constructor(private router:Router,public chatDataService:ChatdataService) { 
    this.ids$=this.chatDataService.getIds();
  }

  ngOnInit(): void {
  }

  toggleSideNav(): void {
    this.isSideNavCollapsed = !this.isSideNavCollapsed;
  }

  new_chat():void{
    this.router.navigate(['/chat'])
  }

  
}
