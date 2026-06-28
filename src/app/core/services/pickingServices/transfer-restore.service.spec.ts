import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TransferRestoreService } from './transfer-restore.service';

describe('TransferRestoreService', () => {
  let service: TransferRestoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(TransferRestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
