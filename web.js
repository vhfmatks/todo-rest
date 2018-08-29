var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var logger = require('morgan');

/* db connect & init */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:', (err) => {
    if (err) { return console.error(err.message); }
    console.log('Connected to the in-memory SQlite database.');
});
db.serialize( () => {
    db.run(`create table tbtodo (id integer primary key autoincrement, todo text,reg_date datetime, chng_date datetime, is_commit char(1) default 'N');`);
    db.run(`create table tbref  (ori_id integer not null, ref_id integer not null)`);
    db.run(`insert into tbtodo (todo, reg_date, chng_date ) values ('집안일', datetime('now','localtime'),  datetime('now','localtime'))`);
    db.run(`insert into tbtodo (todo, reg_date, chng_date ) values ('빨래', datetime('now','localtime'),  datetime('now','localtime'))`);
    db.run(`insert into tbtodo (todo, reg_date, chng_date ) values ('청소', datetime('now','localtime'),  datetime('now','localtime'))`);
    db.run(`insert into tbtodo (todo, reg_date, chng_date ) values ('방청소', datetime('now','localtime'),  datetime('now','localtime'))`);
    db.run(`insert into tbref (ori_id, ref_id) values ( 2, 1 )`);
    db.run(`insert into tbref (ori_id, ref_id) values ( 3, 1 )`);
    db.run(`insert into tbref (ori_id, ref_id) values ( 4, 1 )`);
    db.run(`insert into tbref (ori_id, ref_id) values ( 4, 3 )`);
})

app.use(bodyParser.json());
app.use(cors());
app.use(logger('dev'));

/* rest api  */
require('./src')(app, db);

/* run server */
const PORT =  process.env.PORT || "8001";
app.listen( PORT, '0.0.0.0', ()=>{ 
    console.log("server is running...", PORT);
});
