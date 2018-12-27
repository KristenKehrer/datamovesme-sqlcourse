import { Component, OnInit } from '@angular/core';
import * as mysql from 'mysql'

@Component({
  selector: 'app-test-web-sql',
  templateUrl: './test-web-sql.component.html',
  styleUrls: ['./test-web-sql.component.scss']
})
export class TestWebSqlComponent implements OnInit {

  constructor() {
    const connection = mysql.createConnection({
      host: 'datamovesme-sqlcourse.clnvzv9jjsea.us-east-1.rds.amazonaws.com',
      user: 'pkehrer',
      password: '!stan1eyPOO',
      database: 'datamovesme-sqlcourse'
    })
    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results[0].solution);
    });

    connection.end();


  }

  ngOnInit() {
  }

}
