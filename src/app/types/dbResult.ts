export interface RowSet {
  rowCount: number
  columns: string[]
  values: any[][]
}

export interface DBResult {
  query: string
  rowSets: RowSet[]
}
