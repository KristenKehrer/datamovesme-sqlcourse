const { runQuery } = require('./runQuery')

runQuery({ query: 'select * from person p1 join person on p1.id = person.id' })
  .then(response => {
    console.log(JSON.stringify(response.results, null, 2))
  })
