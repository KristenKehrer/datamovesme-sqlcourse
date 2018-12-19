import { Component, OnInit, Input } from '@angular/core';
import { DBResult } from 'src/app/types/dbResult';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  _results: DBResult[]
  message: string

  @Input() set results(results: DBResult[]) {
    this._results = results
    console.log(this._results)
    if (this._results && this._results.length === 0) {
      this.message = 'Query returned no results'
    } else {
      this.message = null
    }
  }

  constructor() {

  }

  ngOnInit() {
  }

}
