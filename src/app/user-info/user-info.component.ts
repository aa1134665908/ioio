import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router, } from '@angular/router';
import { ChatdataService } from '../chatdata.service';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';



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
  isMouse: boolean = false
  selectedIndex: number | null = null;
  private idSub: Subscription = new Subscription();
  onItemClick(index: number, id: string) {
    this.selectedIndex = index;
    this.router.navigate(['/chat', id]);
  }



  constructor(private router: Router, public chatDataService: ChatdataService, private cd: ChangeDetectorRef, private modal: NzModalService) {
    this.ids$ = this.chatDataService.getIds();
  }


  isMouseOverIndex: number = -1;

  onMouseEnter(index: number) {
    this.isMouseOverIndex = index;
  }

  onMouseLeave(index: number) {
    this.isMouseOverIndex = -1;
  }
  deleItem(id: string): void {
    this.chatDataService.removeGroupById(id)

  }

  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: '确定清空？',
      nzContent: '清空的对话将移至「最近删除」，你可在系统自动清空「最近删除」前恢复对话',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        console.log('OK')
        this.chatDataService.resetItems();
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }


  resetItems(): void {
    this.chatDataService.resetItems();

  }

  trackByFn(index: number, item: any): number {
    return item.id; // 返回项的唯一标识符
  }

  ngOnInit(): void {
    this.idSub = combineLatest([
      this.chatDataService.getCurrentId(),
      this.ids$
    ]).subscribe(([currentId, ids]) => {
      // console.log('Current ID from Service:', currentId);
      // console.log('IDs from Service:', ids);
      // console.log('Current ID from Service:', currentId); // 日志输出当前ID
      if (currentId === null) {
        this.selectedIndex = null;
      } else {
        const index = ids.indexOf(currentId);
        // console.log('Updated Selected Index:', index); // 日志输出计算的索引
        this.selectedIndex = index !== -1 ? index : null;
      }

      // 确保在变更检测前处理可能的 undefined 情况
      if (this.selectedIndex !== undefined) {
        // console.log('Triggering change detection');
        this.cd.detectChanges(); // 手动触发变更检测
        // console.log('selectedIndex is undefined, skipping change detection');
      }
    });

    // 确保数据初始化
    this.chatDataService.getIds().subscribe(ids => {
      // console.log('Initial IDs:', ids);
    });

    this.chatDataService.getCurrentId().subscribe(currentId => {
      // console.log('Initial Current ID:', currentId);
    });
  }

  ngOnDestroy(): void {
    if (this.idSub) {
      this.idSub.unsubscribe();
    }
  }

  toggleSideNav(): void {
    this.isSideNavCollapsed = !this.isSideNavCollapsed;
  }

  new_chat(): void {
    this.router.navigate(['/chat'])
  }


}
