import { TestBed } from '@angular/core/testing';

import { ExternalSubBranchService } from './external-sub-branch-service';

describe('ExternalSubBranchService', () => {
  let service: ExternalSubBranchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalSubBranchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
