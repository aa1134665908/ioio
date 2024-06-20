import { TestBed } from '@angular/core/testing';

import { ChatdataService } from './chatdata.service';

describe('ChatdataService', () => {
  let service: ChatdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
