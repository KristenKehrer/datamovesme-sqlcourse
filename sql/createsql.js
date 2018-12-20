const _ = require('lodash'),
  path = require('path'),
  fs = require('fs'),
  Bluebird = require('bluebird'),
  sqlite = require('sqlite'),
  { deleteIfExists, isNotANumber, loadCsv } = require('./util')

const INSERT_BATCH_SIZE = 10000
const CSV_DIR = path.join(__dirname, 'csvs')
const SQL_DIR = path.join(__dirname, 'dist_sql')
const DB_PATH = path.join(__dirname, 'sqlcourse.db')

async function run() {
  const csvs = getFiles()
  const db = await createDb()
  deleteIfExists(SQL_DIR)
  fs.mkdirSync(SQL_DIR)
  await Bluebird.map(csvs, async (csvname) => {
    const sqlstring = await csvToSql(csvname)
    fs.writeFileSync(path.join(SQL_DIR, `${csvname.replace('.csv', '.sql')}`), sqlstring)
    runSql(db, sqlstring)
  })
  await db.close()
  console.log('Complete!')
}

function runSql(db, sqlstring) {
  _.each(_.split(sqlstring, ';\n'), sqlstatement => db.exec(sqlstatement))
}

async function createDb() {
  deleteIfExists(DB_PATH)
  const db = await sqlite.open(DB_PATH, { promise: Bluebird })
  db.on('error', error => {
    console.error('Uh oh! Database error!!!!')
    console.error(error)
    process.exit(1)
  })
  return db
}

function getFiles() {
  const dirFiles = fs.readdirSync(CSV_DIR)
  const csvs = _.filter(dirFiles, f => _.endsWith(f, '.csv'))
  return csvs
}

async function getTableSchema(csvName) {
  const csvjson = await loadCsv(path.join(CSV_DIR, csvName))

  const columns = _.map(_.keys(csvjson[0]), columnName => {
    const dataValue = _.find(csvjson, row => !_.isNil(row[columnName]))[columnName]
    if (isNotANumber(dataValue)) {
      return `    ${columnName} TEXT`
    }
    if (_.isInteger(_.toNumber(dataValue))) {
      return `    ${columnName} INTEGER`
    }
    return `    ${columnName} REAL`
  })
  const tableName = csvName.replace('.csv', '')
  const createTable = `CREATE TABLE ${tableName} (
${_.join(columns, ',\n')}
  );`
  const insert = `INSERT INTO ${tableName} VALUES`
  return { createTable, insert }
}


async function csvToSql(csvname) {
  const schema = await getTableSchema(csvname)
  const csvjson = await loadCsv(path.join(CSV_DIR, csvname))
  const chunks = _.chunk(csvjson, INSERT_BATCH_SIZE)
  const statements = [schema.createTable]

  _.each(chunks, rows => {
    statements.push(schema.insert)
    _.each(rows, row => {
      const values = _.map(_.values(row), val => {
        if (val === '') {
          return 'NULL'
        }
        if (isNotANumber(val)) {
          var split = _.split(val, '/')
          if (split.length === 3) {
            return `'${split[2]}-${split[0].length === 1 ? "0" + split[0] : split[0]}-${split[1].length === 1 ? "0" + split[1] : split[1]}'`
          }
          return `'${val.replace("'", "''")}'`
        }
        return val
      })
      statements.push(`(${_.join(values, ', ')}),`)
    })
    const l = statements.length
    statements[l - 1] = statements[l - 1].replace(/.$/, ';')
  })
  return _.join(statements, '\n')
}

run()