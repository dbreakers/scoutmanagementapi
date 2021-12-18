const mysql = require('mysql2/promise');
var config = require('./config');
require('dotenv-safe').config();
config.db.user =  process.env.DBUSER;
config.db.password =  process.env.DBPASS;

 

const pool  = mysql.createPool(config.db);
 

async function query(sql, params) {
 
    console.log(sql);
 // const connection = await mysql.createConnection(config.db);
  const [results, ] = await pool.execute(sql, params);
//  connection.end();
//console.log("query function "+JSON.stringify(results));
 
  return results;
}

module.exports = {
  query
}