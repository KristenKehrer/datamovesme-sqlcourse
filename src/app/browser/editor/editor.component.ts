import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash'
import { NgbTabChangeEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';

const QUERY_KEY = 'tabbed-queries'

export interface EditorData {
  title: string
  text: string
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  constructor(private modalService: NgbModal) {
  }

  @Output() queryChanged = new EventEmitter<string>()
  data: EditorData[]
  activeTabId: string
  editingTitle: string

  codemirrorOptions = {
    lineNumbers: true,
    theme: 'solarized',
    mode: 'sql',
    viewportMargin: Infinity
  }

  loadData(): void {
    const dataString = localStorage.getItem(QUERY_KEY)
    const parsed = this.parseQuery(dataString)
    if (parsed) {
      this.data = parsed
    } else {
      this.data = [{ title: 'untitled-1', text: '' }]
    }
    this.activeTabId = this.data[0].title
    this.saveData()
    this.queryChanged.next(this.data[0].text)
  }


  parseQuery(q: string): EditorData[] {
    if (!q) {
      return null
    }
    try {
      const parsed = JSON.parse(q)
      if (!(parsed instanceof Array)) {
        throw new Error()
      }
      if (parsed.length === 0) {
        throw new Error()
      }
      if (!_.every(parsed, (p: any) => 'title' in p && 'text' in p)) {
        throw new Error()
      }
      return parsed
    } catch {
      return null
    }
  }

  saveData(): void {
    localStorage.setItem(QUERY_KEY, JSON.stringify(this.data))
  }

  ngOnInit() {
    this.loadData()
  }

  addTab(event: MouseEvent) {
    let tabNum = 0
    let existingTab
    do {
      tabNum++
      existingTab = _.find(this.data, (t: EditorData) => t.title === `untitled-${tabNum}`)
    } while (!_.isNil(existingTab))
    this.data.push({ title: `untitled-${tabNum}`, text: '' })
    this.activeTabId = _.last(this.data).title
    this.saveData()
    this.queryChanged.next("")
  }

  textChange(data: EditorData, text: string) {
    this.queryChanged.next(text)
    data.text = text
    this.saveData()
  }

  onTabChange(event: NgbTabChangeEvent) {
    this.activeTabId = event.nextId
    this.queryChanged.next(_.find(this.data, ed => ed.title === this.activeTabId).text)
  }

  editTitle(data: EditorData, modalContent) {
    this.editingTitle = data.title
    this.modalService.open(modalContent).result.then(result => {
      if (_.find(this.data, (d: EditorData) => d.title === result && d !== data)) {
        alert('You can\'t have duplicate tab names!')
      } else {
        data.title = result
        this.saveData()
        this.activeTabId = data.title
      }
    }).catch(reason => { })
  }

  closeTab(data: EditorData, event) {
    event.preventDefault()
    this.data = _.filter(this.data, d => d !== data)
    if (this.data.length === 0) {
      this.data.push({ title: 'untitled-1', text: '' })
    }
    this.activeTabId = this.data[0].title
    this.queryChanged.next(this.data[0].text)
    this.saveData()
  }

}
