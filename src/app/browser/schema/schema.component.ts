import { Component, OnInit } from '@angular/core'
import { SqliteService } from 'src/app/sqlite.service'
import * as _ from 'lodash'
import * as Bluebird from 'bluebird'

interface SqliteColumn {
  name: string
  type: string
  notNull: boolean
  primaryKey: boolean
}

interface SqliteTable {
  name: string
  rowCount: number
  columns: SqliteColumn[]

  isCollapsed: boolean
}

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss']
})
export class SchemaComponent implements OnInit {

  schema: SqliteTable[]

  constructor(private sql: SqliteService) {
    //this.loadSchema()
    this.schema = []
  }

  private async loadSchema() {
    const tableNames = await this.loadTableNames()
    this.schema = await Bluebird.map(tableNames, async (tableName: string) => {
      const columns = await this.loadTableColumns(tableName)
      const rowCount = await this.loadTableRowCount(tableName)
      return { name: tableName, columns, rowCount, isCollapsed: true }
    })
  }

  private async loadTableNames(): Promise<string[]> {
    const results = await this.sql.runQuery("select name from sqlite_master where type = 'table'")
    return _.map(results.rowSets[0].values, r => r[0])
  }

  private async loadTableRowCount(tableName: string): Promise<number> {
    const rowCountResult = await this.sql.runQuery(`select count(*) from ${tableName}`)
    return _.toNumber(rowCountResult.rowSets[0].values[0])
  }

  private async loadTableColumns(tableName: string): Promise<SqliteColumn[]> {

    const columnsReult = await this.sql.runQuery(`PRAGMA table_info(${tableName})`)
    const rows = columnsReult.rowSets[0].values
    return _.map(rows, row => ({
      name: row[1].toString(),
      type: row[2].toString(),
      notNull: row[3] === 1,
      primaryKey: row[5] === 1
    }))
  }

  ngOnInit() {
  }

}
