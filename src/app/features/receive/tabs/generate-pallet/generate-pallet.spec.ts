import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePallet } from './generate-pallet';

describe('GeneratePallet', () => {
  let component: GeneratePallet;
  let fixture: ComponentFixture<GeneratePallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratePallet],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneratePallet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
