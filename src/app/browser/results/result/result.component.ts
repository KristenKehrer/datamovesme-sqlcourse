import { Component, OnInit, Input } from '@angular/core'
import { DBResult, RowSet } from 'src/app/types/dbResult'
import * as _ from 'lodash'
import { ColDef, GridOptions, ValueGetterParams } from 'ag-grid-community'

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
    this.rowCount = data.values.length
    if (this.rowCount > MAX_RESULTS) {
      this.missingRows = this.rowCount - MAX_RESULTS
    }
  }

  @Input() query: string


  private makeColDefs(data: RowSet): ColDef[] {
    const colDefs = _.map(data.columns, (col: string, index: number) => {
      return {
        headerName: col,
        valueGetter: (params: ValueGetterParams) => params.data.rowData[index]
      }
    })
    return [{ headerName: 'row', field: 'rowIndex', width: 80, cellClass: 'row-number-col' }, ...colDefs]
  }

  private makeRowData(data: RowSet): any[] {
    return _.map(_.take(data.values, MAX_RESULTS), (row: any[], index: number) => {
      return {
        rowData: row,
        rowIndex: index + 1
      }
    })
  }

  ngOnInit() {
  }

}
