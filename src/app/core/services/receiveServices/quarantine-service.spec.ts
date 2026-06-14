import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { QuarantineService } from './quarantine-service';

describe('QuarantineService', () => {
  let service: QuarantineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(QuarantineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
