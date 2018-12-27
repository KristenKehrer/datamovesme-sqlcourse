import { Injectable } from '@angular/core'
import { DBResult } from './types/dbResult'
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'

declare const SQL: any

const DB_URL = '/assets/sqlcourse.db'

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private db: Promise<any>

  constructor(
    private location: Location,
    private httpClient: HttpClient) {
    this.db = this.retrieveDB()
  }

  async runQuery(query: string): Promise<DBResult> {
    const db = await this.db
    const rowSets = db.exec(query)
    return { query, rowSets }
  }

  private async retrieveDB(): Promise<any> {
    const url = this.location.prepareExternalUrl(DB_URL)
    const response = await this.httpClient.get(url, { responseType: 'arraybuffer' })
      .toPromise()
    const arr = new Uint8Array(response)
    return new SQL.Database(arr)
  }

  async export(): Promise<any> {
    const db = await this.db
    return db.export()
  }
}
