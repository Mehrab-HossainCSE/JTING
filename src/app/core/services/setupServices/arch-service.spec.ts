import { TestBed } from '@angular/core/testing';

import { ArchService } from './arch-service';

describe('ArchService', () => {
  let service: ArchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
