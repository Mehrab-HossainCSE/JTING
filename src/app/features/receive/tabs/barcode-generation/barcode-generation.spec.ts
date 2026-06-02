import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeGeneration } from './barcode-generation';

describe('BarcodeGeneration', () => {
  let component: BarcodeGeneration;
  let fixture: ComponentFixture<BarcodeGeneration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeGeneration],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeGeneration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
