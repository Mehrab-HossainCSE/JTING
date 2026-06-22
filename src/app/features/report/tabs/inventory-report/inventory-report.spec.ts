import { TestBed } from '@angular/core/testing';
import { InventoryReport } from './inventory-report';

describe('InventoryReport', () => {
  let component: InventoryReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(InventoryReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
