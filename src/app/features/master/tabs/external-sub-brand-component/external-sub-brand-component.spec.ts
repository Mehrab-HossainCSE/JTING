import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalSubBrandComponent } from './external-sub-brand-component';

describe('ExternalSubBrandComponent', () => {
  let component: ExternalSubBrandComponent;
  let fixture: ComponentFixture<ExternalSubBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalSubBrandComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalSubBrandComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
