import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerEvents } from './organizer-events';

describe('OrganizerEvents', () => {
  let component: OrganizerEvents;
  let fixture: ComponentFixture<OrganizerEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
