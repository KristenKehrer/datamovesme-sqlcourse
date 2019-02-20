import { Component, OnInit, ChangeDetectorRef } from '@angular/core'
import { DBResult } from '../types/dbResult'
import { timer } from 'rxjs'
import { SqliteService } from '../sqlite.service'
import * as _ from 'lodash'
import { HostListener } from '@angular/core'
import { SqlService } from '../sql-service';
import { SqlapiService } from '../sqlapi.service';
import { ActivatedRoute } from '@angular/router';

const QUERY_KEY = 'myquery'

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss'],
})
export class BrowserComponent implements OnInit {

  private sql: SqlService
  dbType: string
  sqlapiAvailable: boolean

  constructor(
    sqlite: SqliteService,
    private sqlapi: SqlapiService,
    private changeDetector: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute) {

    this.sql = sqlapi
    this.activatedRoute.url.subscribe(urlSegments => {
      if (urlSegments.length === 1 && urlSegments[0].path === "mysql") {
        this.sql = sqlapi;
        this.dbType = "mysql"
      } else {
        this.sql = sqlite;
        this.dbType = "sqlite"
      }
    })
  }

  query: string
  error: string
  results: DBResult
  running = false
  sqlReady = false

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
    this.sql.initialize().then(() => this.sqlReady = true)
    if (this.dbType === 'sqlite') {
      this.sqlapi.ping().then(up => this.sqlapiAvailable = up)
    }
  }

  runQuery(query: string): void {
    if (!this.sqlReady) {
      return
    }
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
}
