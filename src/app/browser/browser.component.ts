import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DBResult } from '../types/dbResult';
import * as FileSaver from 'file-saver';
import { timer } from 'rxjs'
import { SqliteService } from '../sqlite.service';
import * as _ from 'lodash'
import { HostListener } from '@angular/core';

const QUERY_KEY = "myquery"
const MAX_RESULTS = 10000

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {

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

  query: string
  error: string
  results: DBResult[]
  running = false

  private db: any

  constructor(
    private sql: SqliteService,
    private changeDetector: ChangeDetectorRef) {
    this.query = this.loadQuery() || "select * from person join pet on person.id = pet.ownerId;"
    timer(0, 1000).subscribe(() => this.saveQuery())
  }

  ngOnInit() {
  }

  runQuery(query: string): void {
    this.running = true
    this.changeDetector.detectChanges()
    setTimeout(() => {
      this.sql.runQuery(query)
        .then(results => {

          if (_.some(results, (r: DBResult) => r.values.length > MAX_RESULTS)) {
            throw new Error(`Query returned more than ${MAX_RESULTS} results!!`)
          }
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

  export() {
    const exported = this.db.export()
    FileSaver.saveAs(new Blob([exported]), "sqlite.db")
  }

  private saveQuery(): void {
    localStorage.setItem(QUERY_KEY, this.query)
  }

  private loadQuery(): string {
    return localStorage.getItem(QUERY_KEY)
  }
}
