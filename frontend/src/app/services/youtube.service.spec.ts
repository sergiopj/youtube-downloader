import { TestBed } from '@angular/core/testing';

import { YoutubeServiceService } from './youtube.service';

describe('YoutubeServiceService', () => {
  let service: YoutubeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YoutubeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
