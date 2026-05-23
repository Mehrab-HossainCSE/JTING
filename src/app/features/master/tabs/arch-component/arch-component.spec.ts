import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchComponent } from './arch-component';

describe('ArchComponent', () => {
  let component: ArchComponent;
  let fixture: ComponentFixture<ArchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
