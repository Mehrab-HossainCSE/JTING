import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPallet } from './split-pallet';

describe('SplitPallet', () => {
  let component: SplitPallet;
  let fixture: ComponentFixture<SplitPallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPallet],
    }).compileComponents();

    fixture = TestBed.createComponent(SplitPallet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
