import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerAuth } from './organizer-auth';

describe('OrganizerAuth', () => {
  let component: OrganizerAuth;
  let fixture: ComponentFixture<OrganizerAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerAuth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerAuth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
