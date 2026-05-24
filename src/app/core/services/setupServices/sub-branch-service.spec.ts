import { TestBed } from '@angular/core/testing';

import { SubBranchService } from './sub-branch-service';

describe('SubBranchService', () => {
  let service: SubBranchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubBranchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
