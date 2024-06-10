import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';


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
  
  
  


  constructor() { }

  ngOnInit(): void {
  }

  toggleSideNav(): void {
    this.isSideNavCollapsed = !this.isSideNavCollapsed;
  }
}
