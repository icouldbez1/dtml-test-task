import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePagesTableComponent } from './multiple-pages-table.component';

describe('MultiplePagesTableComponent', () => {
  let component: MultiplePagesTableComponent;
  let fixture: ComponentFixture<MultiplePagesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiplePagesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplePagesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
