import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTemplate } from './ticket-template';

describe('TicketTemplate', () => {
  let component: TicketTemplate;
  let fixture: ComponentFixture<TicketTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTemplate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
