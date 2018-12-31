
const mysql = require('mysql')
const _ = require('lodash')

const CONNECTION_CONFIG = {
  host: 'datamovesme-sqlcourse.clnvzv9jjsea.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'pkehrer',
  password: '!stan1eyPOO',
  database: 'datamovesmesqlcourse'
}

function run(connection, query) {
  return new Promise((res, rej) => {
    connection.query(query, function (error, results, fields) {
      if (error) { return rej(error) }
      res({ results, fields })
    })
  })
}

function connect() {
  const connection = mysql.createConnection(CONNECTION_CONFIG)
  return new Promise((res, rej) => {
    connection.connect((err, ...args) => {
      if (err) { return rej(err) }
      res(connection)
    })
  })
}

module.exports.runQuery = async function (event, context) {
  const connection = await connect()
  const result = await run(connection, event.query)
  connection.end()

  return { results: result.results, fields: result.fields }
}

//module.exports.runQuery().then(r => console.log(JSON.stringify(r, null, 2)))
