import { Injectable } from '@angular/core';
import { Lambda } from 'aws-sdk'
import { ISqlService } from './sql.interface';
import { DBResult } from './types/dbResult';
import * as _ from 'lodash'


@Injectable({
  providedIn: 'root'
})
export class MysqlService implements ISqlService {

  private lambda: Lambda
  constructor() {
    this.lambda = new Lambda({
      accessKeyId: 'AKIAJU3M4RYEI6W546WA',
      secretAccessKey: '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',
      region: 'us-east-1'
    })
  }


  async runQuery(query: string): Promise<DBResult> {
    return new Promise<DBResult>((res, rej) => {
      this.lambda.invoke({
        FunctionName: 'datamovesme-sql-dev-runQuery',
        Payload: JSON.stringify({ query })
      }, (err, data) => {
        const response = JSON.parse(<string>data.Payload)
        if (response.errorMessage) {
          return (rej(response))
        }

        let rowSets = response.results
        if (!(rowSets[0] instanceof Array) && _.isNil(_.get(rowSets[0], 'fieldCount'))) {
          rowSets = [rowSets]
        }
        return res(<DBResult>{
          rowSets: _.map(rowSets, rs => {

            if (!_.isNil(_.get(rs, 'fieldCount'))) {
              return {
                columns: ['message'],
                values: [[_.get(rs, 'message')]]
              }
            }
            const columns = _.flatMap(rs[0], table => _.keys(table))
            const values = _.map(rs, row => _.flatMap(row, table => _.values(table)))
            return { columns, values }
          }),
          query: query
        })
      })
    })
  }
}
