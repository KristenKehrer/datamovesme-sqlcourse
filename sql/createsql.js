const _ = require('lodash'),
  path = require('path'),
  fs = require('fs'),
  Bluebird = require('bluebird'),
  sqlite3 = require('sqlite3'),
  { deleteIfExists, isNotANumber, loadCsv } = require('./util')

const INSERT_BATCH_SIZE = 10000
const CSV_DIR = path.join(__dirname, 'csvs')
const SQL_DIR = path.join(__dirname, 'dist_sql')
const DB_PATH = path.join(__dirname, 'sqlcourse.db')

// const pks = {
//   billedservices: []
// }

async function run() {
  const csvs = getCsvFiles()
  const db = await createSqliteDb()
  deleteIfExists(SQL_DIR)
  fs.mkdirSync(SQL_DIR)
  await Bluebird.map(csvs, async (csvname) => {
    const sqlstring = await csvToSql(csvname)
    fs.writeFileSync(path.join(SQL_DIR, `${csvname.replace('.csv', '.sql')}`), sqlstring)
    await runSql(db, sqlstring)
  })

  await runSql(db, `
create table deduped_customer_table as
select * from customer
group by customer_id
having count(customer_id) > 1
order by customer_id;


insert into deduped_customer_table
select * from customer
group by customer_id
having count(customer_id) = 1;

create table deduped_salescall as
select * from salescall
group by customer_id
having count(customer_id) > 1
order by customer_id;


insert into deduped_salescall
select * from salescall
group by customer_id
having count(customer_id) = 1;

create table deduped_billedservices as
select * from billedservices
group by customer_id
having count(customer_id) > 1
order by customer_id;

insert into deduped_billedservices
select * from billedservices
group by customer_id
having count(customer_id) = 1;`)
  await db.close()
  console.log('Complete!')
}


async function runSql(db, sqlstring) {
  await Bluebird.map(_.split(sqlstring, ';\n'), stmt => new Bluebird((res, rej) => {
    db.exec(stmt, function (err) {
      if (err) { rej(err) }
      res()
    })
  }))
}

function createSqliteDb() {
  deleteIfExists(DB_PATH)
  return new Bluebird((res, rej) => {
    const db = new sqlite3.Database(DB_PATH, err => {
      if (err) {
        rej(err)
      }
      res(db)
    })
  })
}

function getCsvFiles() {
  const dirFiles = fs.readdirSync(CSV_DIR)
  const csvs = _.filter(dirFiles, f => _.endsWith(f, '.csv'))
  return csvs
}

async function getTableSchema(csvName) {
  const csvjson = await loadCsv(path.join(CSV_DIR, csvName))
  const columns = _.map(_.keys(csvjson[0]), columnName => {
    sqlColName = columnName.replace(' ', '')
    const pkString = columnName.toLowerCase() === 'customer_idXXXX' ? ' PRIMARY KEY' : ''
    const dataValue = _.find(csvjson, row => !_.isNil(row[columnName]))[columnName]
    if (isNotANumber(dataValue)) {
      return `    ${sqlColName} TEXT${pkString}`
    }
    if (_.isInteger(_.toNumber(dataValue))) {
      return `    ${sqlColName} INTEGER${pkString}`
    }
    return `    ${sqlColName} REAL${pkString}`
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
  const statements = [schema.createTable, schema.indices]

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

run().catch(error => {
  console.log("*** ERROR ***")
  console.log(error.toString())
  process.exit(1)
})
