import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { BrowserComponent } from './browser/browser.component'
import { TestWebSqlComponent } from './test-web-sql/test-web-sql.component';
const routes: Routes = [
  {
    path: '',
    component: BrowserComponent
  },
  {
    path: 'sql-test',
    component: TestWebSqlComponent
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
