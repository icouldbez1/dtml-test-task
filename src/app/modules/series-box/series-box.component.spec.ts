import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeriesBoxComponent } from './series-box.component';

describe('HomeComponent', () => {
  let component: SeriesBoxComponent;
  let fixture: ComponentFixture<SeriesBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeriesBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
