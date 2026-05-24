import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalBrandComponent } from './external-brand-component';

describe('ExternalBrandComponent', () => {
  let component: ExternalBrandComponent;
  let fixture: ComponentFixture<ExternalBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalBrandComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalBrandComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
