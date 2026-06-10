import { TestBed } from '@angular/core/testing';

import { PalletSplit } from './pallet-split';

describe('PalletSplit', () => {
  let service: PalletSplit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PalletSplit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
