import { TestBed } from '@angular/core/testing';

import { PalleteGenerateService } from './pallete-generate-service';

describe('PalleteGenerateService', () => {
  let service: PalleteGenerateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PalleteGenerateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
