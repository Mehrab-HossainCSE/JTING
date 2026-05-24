import { TestBed } from '@angular/core/testing';

import { ExternalBranchService } from './external-branch-service';

describe('ExternalBranchService', () => {
  let service: ExternalBranchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalBranchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
