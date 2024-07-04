import { TestBed } from '@angular/core/testing';

import { DeepseekService } from './deepseek.service';

describe('DeepseekService', () => {
  let service: DeepseekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeepseekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
