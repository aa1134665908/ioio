import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptchaLoginComponent } from './captcha-login.component';

describe('CaptchaLoginComponent', () => {
  let component: CaptchaLoginComponent;
  let fixture: ComponentFixture<CaptchaLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaptchaLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptchaLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
