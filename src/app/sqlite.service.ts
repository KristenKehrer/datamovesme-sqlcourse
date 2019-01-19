import { Injectable } from '@angular/core'
import { DBResult } from './types/dbResult'
import { Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { SqlService } from './sql-service';

declare const SQL: any

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
    return { query, rowSets }
  }

  public async initialize(): Promise<any> {
    const url = this.location.prepareExternalUrl(DB_URL)
    const response = await this.httpClient.get(url, { responseType: 'arraybuffer' })
      .toPromise()
    const arr = new Uint8Array(response)
    this.db = new SQL.Database(arr)
  }

  public async cleanup(): Promise<void> {
    // do nothing for sqlite
  }

  async export(): Promise<any> {
    return this.db.export()
  }
}
