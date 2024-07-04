import { TestBed } from '@angular/core/testing';

import { AIManagerService } from './aimanager.service';

describe('AIManagerService', () => {
  let service: AIManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AIManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
