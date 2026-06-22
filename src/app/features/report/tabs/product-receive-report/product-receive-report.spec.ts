import { TestBed } from '@angular/core/testing';
import { ProductReceiveReport } from './product-receive-report';

describe('ProductReceiveReport', () => {
  let component: ProductReceiveReport;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductReceiveReport]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductReceiveReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
