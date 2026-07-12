import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerRegister } from './organizer-register';

describe('OrganizerRegister', () => {
  let component: OrganizerRegister;
  let fixture: ComponentFixture<OrganizerRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
