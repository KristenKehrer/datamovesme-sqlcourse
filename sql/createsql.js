const _ = require('lodash'),
  csv = require('csvtojson'),
  path = require('path'),
  fs = require('fs'),
  Bluebird = require('bluebird'),
  sqlite = require('sqlite')

const isNotANumber = (val) => _.isNaN(_.toNumber(val))
const loadCsv = name => csv().fromFile(path.join(__dirname, name))

async function run() {
  const csvs = getFiles()
  const db = await createDb()
  await populateDatabase(db, csvs)
  db.close()
  console.log('Complete!')
}

async function createDb() {
  const dbPath = path.join(__dirname, 'sqlcourse.db')
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
  const db = await sqlite.open(dbPath, { promise: Bluebird })
  db.on('error', error => {
    console.error('Uh oh! Database error!!!!')
    console.error(error)
    process.exit(1)
  })
  return db
}

function getFiles() {
  const dirFiles = fs.readdirSync(__dirname)
  const csvs = _.filter(dirFiles, f => _.endsWith(f, '.csv'))
  return csvs
}

async function getTableSchema(csvName) {
  const csvjson = await loadCsv(csvName)

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


async function populateDatabase(db, csvs) {
  let insertStatements

  const runStatement = line => {
    console.log(line.substr(0, 100))
    db.exec(line)
  }

  await Bluebird.map(csvs, async csvpath => {
    const schema = await getTableSchema(csvpath)
    runStatement(schema.createTable)

    const csvjson = await loadCsv(csvpath)
    const chunks = _.chunk(csvjson, 10000)
    _.each(chunks, rows => {
      insertStatements = [schema.insert]
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
        insertStatements.push(`(${_.join(values, ', ')}),`)
      })
      const l = insertStatements.length
      insertStatements[l - 1] = insertStatements[l - 1].replace(/.$/, ';')
      const sqlToRun = _.join(insertStatements, '\n')
      runStatement(sqlToRun)
    })
  })
}

run()