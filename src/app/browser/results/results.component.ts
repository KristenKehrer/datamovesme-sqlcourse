import { Component, OnInit, Input } from '@angular/core'
import { DBResult } from 'src/app/types/dbResult'
import * as _ from 'lodash'

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  _results: DBResult
  message: string

  @Input() set results(results: DBResult) {
    this._results = results

    if (_.get(this._results, 'rowSets') && this._results.rowSets.length === 0) {
      this.message = 'Query returned no results'
    } else {
      this.message = null
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
