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
    this.loadData()
    if (this.data.length > 0) {
      this.activeTabId = this.data[0].title
    }
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
    if (dataString) {
      this.data = JSON.parse(dataString)
    } else {
      this.data = []
    }

  }

  saveData(): void {
    localStorage.setItem(QUERY_KEY, JSON.stringify(this.data))
  }

  ngOnInit() {
    if (this.data && this.data.length === 0) {
      this.data.push({ title: 'untitled-1', text: '' })
    }
    this.activeTabId = this.data[0].title
    this.queryChanged.next(this.data[0].text)
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
      data.title = result
      this.saveData()
      this.activeTabId = data.title
    }).catch(reason => { })
  }

  closeTab(data: EditorData, event) {
    event.preventDefault()
    this.data = _.filter(this.data, d => d !== data)
    if (this.data.length === 0) {
      this.data.push({ title: 'untitled-1', text: '' })
    }
    this.activeTabId = this.data[0].title
  }
}
