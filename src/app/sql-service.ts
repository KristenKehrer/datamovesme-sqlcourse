import { DBResult } from './types/dbResult';

export abstract class SqlService {
  abstract initialize(): Promise<void>
  abstract runQuery(query: string): Promise<DBResult>
  abstract cleanup(): Promise<void>
}
