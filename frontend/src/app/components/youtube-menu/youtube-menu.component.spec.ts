import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeMenuComponent } from './youtube-menu.component';

describe('MainMenuComponent', () => {
  let component: YoutubeMenuComponent;
  let fixture: ComponentFixture<YoutubeMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
