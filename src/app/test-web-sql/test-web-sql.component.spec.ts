import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestWebSqlComponent } from './test-web-sql.component';

describe('TestWebSqlComponent', () => {
  let component: TestWebSqlComponent;
  let fixture: ComponentFixture<TestWebSqlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestWebSqlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestWebSqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
