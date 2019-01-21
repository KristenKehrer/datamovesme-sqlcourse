import { Component, OnInit, Input } from '@angular/core'
import { DBResult, RowSet } from 'src/app/types/dbResult'
import * as _ from 'lodash'
import { ColDef, GridOptions } from 'ag-grid-community'

const MAX_RESULTS = 20000

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  rowData: any[]
  colDefs: ColDef[]
  gridOptions: GridOptions = {
    enableColResize: true
  }
  rowCount: number
  missingRows: number

  constructor() { }

  @Input() set data(data: RowSet) {
    this.rowData = this.makeRowData(data)
    this.colDefs = this.makeColDefs(data)
    this.rowCount = data.rowCount
    if (this.rowCount > data.values.length) {
      this.missingRows = this.rowCount - data.values.length
    }
  }

  @Input() query: string


  private makeColDefs(data: RowSet): ColDef[] {
    const colDefs = _.map(data.columns, (col: string) => {
      return {
        field: col
      }
    })
    return [{ field: 'row', width: 80, cellClass: 'row-number-col' }, ...colDefs]
  }

  private makeRowData(data: RowSet): any[] {
    const gridRows = []
    _.each(data.values, (row: any[], index: number) => {
      const gridRow: any = {}
      _.each(data.columns, (col: string, index: number) => {
        gridRow[col] = row[index]
      })
      gridRow.row = index + 1
      gridRows.push(gridRow)
    })
    return gridRows
  }

  ngOnInit() {
  }

}
