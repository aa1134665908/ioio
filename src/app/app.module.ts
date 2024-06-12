import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { CaptchaLoginComponent } from './login/captcha-login/captcha-login.component';
import { HomeComponent } from './home/home.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { ChatComponent } from './chat/chat.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';



registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CaptchaLoginComponent,
    HomeComponent,
    SideNavComponent,
    UserInfoComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NzToolTipModule,
    BrowserAnimationsModule,
    NzSegmentedModule,
    NzCheckboxModule,
    NzInputModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
