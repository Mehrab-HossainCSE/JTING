import { TestBed } from '@angular/core/testing';
import { TotalInventoryReport } from './total-inventory-report';

describe('TotalInventoryReport', () => {
  let component: TotalInventoryReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalInventoryReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(TotalInventoryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
