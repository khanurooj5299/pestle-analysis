import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListItemObservationComponent } from './list-item-observation.component';

describe('ListItemObservationComponent', () => {
  let component: ListItemObservationComponent;
  let fixture: ComponentFixture<ListItemObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListItemObservationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListItemObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
