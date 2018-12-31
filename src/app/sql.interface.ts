import { DBResult } from './types/dbResult';

export interface ISqlService {
  runQuery(query: string): Promise<DBResult>
  export?(): Promise<any>
}
