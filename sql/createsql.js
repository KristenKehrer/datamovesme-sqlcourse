const _ = require('lodash'),
  csv = require('csvtojson'),
  path = require('path'),
  fs = require('fs'),
  Bluebird = require('bluebird'),
  sqlite3 = require('sqlite3').verbose()

const csvs = {
  'billedservices.csv': [
    `create table billedservices (
      Order_date TEXT,
      service_completed TEXT,
      Currency TEXT,
      paid INTEGER,
      status TEXT,
      customer_id INTEGER);`,
    'insert into billedservices values'
  ],
  'customer_table.csv': [
    `create table customer (
      Customer_id INTEGER,
      Invoice_Month TEXT,
      august_commission INTEGER,
      Email_Domain_Type TEXT,
      Business_type TEXT,
      First_Conversion_Date TEXT,
      Last_Login_date TEXT,
      Country TEXT,
      State TEXT,
      ZipCode INTEGER,
      Do_Not_Email INTEGER,
      has_facebook INTEGER,
      has_instagram INTEGER,
      has_linkedin INTEGER,
      has_youtube INTEGER,
      has_twitter INTEGER,
      has_pinterest INTEGER,
      Total_Logins INTEGER,
      Ever_visiting_Blog INTEGER,
      Times_Account_Disabled INTEGER,
      Num_Product_Returns INTEGER,
      total_sales INTEGER,
      Multi_user_account TEXT,
      phone INTEGER
  );`,
    'insert into customer values'
  ],
  'salescall.csv': [
    `create table salescall (
      Customer_id INTEGER,
      Call_Opened TEXT,
      Call_Closed TEXT,
      Case_Number INTEGER,
      Resolution TEXT,
      Call_Type TEXT,
      Call_Type_Sub_Category TEXT
    );`,
    'insert into salescall values'],
  'webscrapingdata.csv': [
    `create table webscrapingdata (
      customer_id INTEGER,
      core_scan_errir TEXT,
      is_published INTEGER,
      is_service_business INTEGER,
      word_count INTEGER,
      form_count INTEGER,
      image_count INTEGER,
      has_page_title INTEGER,
      has_meta_desc INTEGER,
      has_cart INTEGER,
      has_email_capture INTEGER,
      uses_wp INTEGER,
      uses_weebly INTEGER,
      uses_ga INTEGER,
      language TEXT,
      page_load_time REAL
    );`,
    'insert into webscrapingdata values'
  ]
}
const dbPath = path.join(__dirname, 'sqlcourse.db')
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
}
const db = new sqlite3.Database(dbPath, () => {
  console.log('created database!')
  createDatabase()
})



const createDatabase = () => {
  let insertStatements

  db.on('error', error => {
    console.log(error)
    console.log(_.join(insertStatements || [], '\r\n'))
    console.log('fuck')
  })

  const allLines = []
  const runStatement = line => {
    console.log(line.substr(0, 200))
    db.exec(line)
    allLines.push(line)
  }


  Bluebird.map(_.take(_.keys(csvs), 10), csvpath => {
    const scripts = csvs[csvpath]
    runStatement(scripts[0])

    return csv().fromFile(path.join(__dirname, csvpath)).then(json => {
      const chunks = _.chunk(json, 10000)
      _.each(chunks, rows => {
        insertStatements = [scripts[1]]
        _.each(rows, row => {
          const values = _.map(_.values(row), val => {
            if (val === '') {
              return 'NULL'
            }
            if (_.isNaN(_.toNumber(val))) { // Not a number
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
        const sqlToRun = _.join(insertStatements, '\r\n')
        runStatement(sqlToRun)
      })

      const filePath = path.join(__dirname, csvpath.replace('.csv', '.sql'))
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      fs.writeFileSync(filePath, _.join(allLines, '\r\n'))

    })
  }).then(() => {
    db.close()
    console.log('done!')
  })
}
