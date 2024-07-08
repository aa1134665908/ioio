import { TestBed } from '@angular/core/testing';

import { QwenService } from './qwen.service';

describe('QwenService', () => {
  let service: QwenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QwenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
