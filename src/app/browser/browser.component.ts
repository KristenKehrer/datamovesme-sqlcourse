import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { DBResult } from '../types/dbResult'
import * as FileSaver from 'file-saver'
import { timer } from 'rxjs'
import { SqliteService } from '../sqlite.service'
import * as _ from 'lodash'
import { HostListener } from '@angular/core'
import { EditorData } from './editor/editor.component';

const QUERY_KEY = 'myquery'

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {

  constructor(
    private sql: SqliteService,
    private changeDetector: ChangeDetectorRef) {
    this.query = this.loadQuery() || 'select * from customer limit 10;'
    timer(0, 1000).subscribe(() => this.saveQuery())
  }

  query: string
  error: string
  results: DBResult
  running = false

  onQueryChanged(query: string) {
    this.query = query
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Enter' && !event.ctrlKey && event.shiftKey) { // "Shift + Enter"
      this.run()
      event.preventDefault()
    } else if (event.code === 'Enter' && event.ctrlKey) { // "Ctrl + Enter"
      this.runSelected()
      event.preventDefault()
    }
  }

  ngOnInit() {
    //this.run()  // uncomment this and the app will execute the saved query on startup
  }

  runQuery(query: string): void {
    this.running = true
    this.changeDetector.detectChanges()
    setTimeout(() => {
      this.sql.runQuery(query)
        .then(results => {
          this.results = results
          this.error = null
        })
        .catch(e => {
          this.error = `Error: ${e.message}`
          console.log(e)
        })
        .then(() => {
          this.running = false
        })
    }, 1)
  }

  run(): void {
    this.runQuery(this.query)
  }

  runSelected(): void {
    if (window.getSelection) {
      this.runQuery(window.getSelection().toString())
    } else {
      this.run()
    }
  }

  async export() {
    const exported = await this.sql.export()
    FileSaver.saveAs(new Blob([exported]), 'sqlite.db')
  }

  private saveQuery(): void {
    localStorage.setItem(QUERY_KEY, this.query)
  }

  private loadQuery(): string {
    return localStorage.getItem(QUERY_KEY)
  }
}
