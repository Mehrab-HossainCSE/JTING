import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkuSearch } from './sku-search';

describe('SkuSearch', () => {
  let component: SkuSearch;
  let fixture: ComponentFixture<SkuSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkuSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(SkuSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
