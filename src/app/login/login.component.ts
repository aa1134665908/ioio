import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import{CaptchaLoginComponent}from '../login/captcha-login/captcha-login.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  username:string=''
  password:string=''
  isShowingSeeImage = false;
  placeholderText:string='请输入密码'
  isCaptchaVisible: number = 0;

  constructor(private router:Router) { }

  ngOnInit(): void {
  }

  options = ['密码登录', '验证码登录'];
  handleIndexChange(e: number): void {
    console.log(e);
    this.placeholderText = e ? '请输入验证码' : '请输入密码';
    this.isCaptchaVisible = e;
  }


  validateInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.value.trim()) {
      inputElement.classList.add('error');
    } else {
      inputElement.classList.remove('error');
    }
  }

  onSubmit(): void {
    // 表单提交逻辑
    if (!this.username.trim() || !this.password.trim()) {
      alert('Please fill in all fields');
    } else {
      // 执行登录操作
      console.log('Username:', this.username);
      console.log('Password:', this.password);
      this.router.navigate(['/chat'])
    }
  }


}
