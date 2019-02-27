import { Injectable } from '@angular/core'
import { DBResult, RowSet } from './types/dbResult'
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { SqlService } from './sql-service';
import * as _ from 'lodash'

declare const SQL: any
declare const JSZip: any

const DB_URL = '/assets/sqlcourse.db'

@Injectable({
  providedIn: 'root'
})
export class SqliteService extends SqlService {

  private db: any

  constructor(
    private location: Location,
    private httpClient: HttpClient) {
    super()
  }

  async runQuery(query: string): Promise<DBResult> {
    const rowSets = this.db.exec(query)
    _.each(rowSets, (rs: RowSet) => {
      rs.rowCount = rs.values.length
      rs.values = _.take(rs.values, 20000)
    })
    return { query, rowSets }
  }

  private initializePromise: Promise<any>

  public initialize(): Promise<any> {
    if (!this.initializePromise) {
      this.initializePromise = this.doInitialize()
    }
    return this.initializePromise
  }

  private async doInitialize(): Promise<any> {
    try {
      console.time('download zip')
      const url = this.location.prepareExternalUrl(DB_URL + ".zip")
      const arraybuff = await this.httpClient.get(url, { responseType: 'arraybuffer', headers: { 'Cache-Control': 'no-cache' } })
        .toPromise()
      console.timeEnd('download zip')


      console.time('extract zip')
      const zip = await JSZip.loadAsync(arraybuff)
      const dbfile = await zip.file('sqlcourse.db').async("uint8array")
      console.timeEnd('extract zip')
      console.time('load db')
      this.db = new SQL.Database(dbfile)
      console.timeEnd('load db')
    } catch (error) {
      console.log(error)
    }
  }

  public async cleanup(): Promise<void> {
    // do nothing for sqlite
  }

  async export(): Promise<any> {
    return this.db.export()
  }
}
