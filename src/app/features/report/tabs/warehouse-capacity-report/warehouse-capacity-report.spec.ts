import { TestBed } from '@angular/core/testing';
import { WarehouseCapacityReport } from './warehouse-capacity-report';

describe('WarehouseCapacityReport', () => {
  let component: WarehouseCapacityReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseCapacityReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(WarehouseCapacityReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
