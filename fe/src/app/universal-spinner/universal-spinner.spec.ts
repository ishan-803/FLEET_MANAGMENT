import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalSpinner } from './universal-spinner';

describe('UniversalSpinner', () => {
  let component: UniversalSpinner;
  let fixture: ComponentFixture<UniversalSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversalSpinner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniversalSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
