import { Injectable } from '@angular/core';
import { SqlService } from './sql-service';
import { HttpClient } from '@angular/common/http';
import { DBResult, RowSet } from './types/dbResult';
import * as _ from 'lodash'
import { TableDefinition } from './browser/schema/schema.component';
import { environment } from '../environments/environment'

interface Connection {
  connectionId: string
}

interface QueryRequest {
  connectionId: string
  query: string
}

interface QueryResponse {
  text: string,
  resultSets: ResultSet[]
}

interface ResultSet {
  query: string,
  status: number,
  result: SqlApiResult
}

interface SqlApiResult {
  columnNames: string[],
  rows: any[][]
}

@Injectable({
  providedIn: 'root'
})
export class SqlapiService extends SqlService {

  private connection: Connection

  constructor(private http: HttpClient) {
    super()
  }

  async initialize(): Promise<void> {
    this.connection = await this.http.post<Connection>(`${environment.sqlapiUrl}/connection`, {}).toPromise()
  }

  async ping(): Promise<boolean> {
    try {
      await this.http.get(`${environment.sqlapiUrl}/livecheck`).toPromise()
      return true
    } catch (error) {
      return false
    }
  }

  async getSchema(): Promise<TableDefinition[]> {
    var schema = await this.http.get<TableDefinition[]>(`${environment.sqlapiUrl}/schema`).toPromise()
    _.each(schema, td => td.isCollapsed = true)
    return schema
  }

  async runQuery(query: string): Promise<DBResult> {
    const request: QueryRequest = { connectionId: this.connection.connectionId, query }
    const response = await this.http.post<QueryResponse>(`${environment.sqlapiUrl}/query`, request).toPromise()

    const resultSets = _.filter(response.resultSets, rs => !_.isNil(_.get(rs, 'result.rows[0]')))

    const result: DBResult = {
      query: response.text,
      rowSets: _.map(resultSets, rs => (<RowSet>{
        columns: rs.result.columnNames,
        values: rs.result.rows
      }))
    }
    console.log(result)
    return result
  }

  async cleanup(): Promise<void> {
    await this.http.delete(`${environment.sqlapiUrl}/connection/${this.connection.connectionId}`)
    this.connection = null;
  }
}
