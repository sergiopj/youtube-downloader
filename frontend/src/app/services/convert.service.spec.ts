import { TestBed } from '@angular/core/testing';

import { ConvertServiceService } from './convert.service';

describe('ConvertServiceService', () => {
  let service: ConvertServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
