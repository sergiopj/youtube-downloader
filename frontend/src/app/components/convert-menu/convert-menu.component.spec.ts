import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertMenuComponent } from './convert-menu.component';

describe('ConvertMenuComponent', () => {
  let component: ConvertMenuComponent;
  let fixture: ComponentFixture<ConvertMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
