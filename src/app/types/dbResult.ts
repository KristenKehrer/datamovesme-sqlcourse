export interface RowSet {
  columns: string[]
  values: any[][]
}

export interface DBResult {
  query: string
  rowSets: RowSet[]
}
