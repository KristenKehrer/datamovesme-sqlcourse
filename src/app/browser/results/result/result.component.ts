import { Component, OnInit, Input } from '@angular/core';
import { DBResult, RowSet } from 'src/app/types/dbResult';
import * as _ from 'lodash'
import { ColDef } from 'ag-grid-community';

const MAX_RESULTS = 1000000

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  private rowData: any[]
  private colDefs: ColDef[]
  private rowCount: number
  private missingRows: number

  constructor() { }

  @Input() set data(data: RowSet) {
    this.rowData = this.makeRowData(data)
    this.colDefs = this.makeColDefs(data)
    this.rowCount = data.values.length
    if (this.rowCount > MAX_RESULTS) {
      this.missingRows = this.rowCount - MAX_RESULTS
    }
  }

  @Input() query: string


  private makeColDefs(data: RowSet): ColDef[] {
    return _.map(data.columns, (col: string) => {
      return {
        field: col
      }
    })
  }

  private makeRowData(data: RowSet): any[] {
    const gridRows = []
    _.each(_.take(data.values, MAX_RESULTS), (row: any[]) => {
      const gridRow: any = {}
      _.each(data.columns, (col: string, index: number) => {
        gridRow[col] = row[index]
      })
      gridRows.push(gridRow)
    })
    return gridRows
  }

  ngOnInit() {
  }

}
