// All Member record actions 

const db = require('../database');
const helper = require('../helper'); 
const config = require('../config');

async function getSingle(id){
 // const offset = helper.getOffset(page, config.listPerPage);
 //  console.log('child process exited with code '+id);
  const rows = await db.query(    "SELECT * from `person` WHERE person_id = ?", [id]);
 //  console.log(JSON.stringify(rows));
  const data = helper.emptyOrRows(rows);
 //  console.log(JSON.stringify(data));
 // const meta = {page};

  return  data[0] 
  
}

async function getMultiple(page=1){
 const offset = helper.getOffset(page, config.listPerPage);
 //  console.log('child process exited with code '+id);
  const rows = await db.query(    "SELECT * from `person` LIMIT ?,?", [offset, config.listPerPage]);
 //  console.log(JSON.stringify(rows));
  const data = helper.emptyOrRows(rows);
 //  console.log(JSON.stringify(data));
 // const meta = {page};

  return  data 
  
}

async function addSingle(newperson){
    
   const result2 = await db.query("INSERT INTO person  (first_name,last_name)  VALUES  (?, ?)", 
    [
      newperson.first_name, newperson.last_name
    ] 
  );
     
      const rows = await db.query(    "SELECT * from `person` WHERE person_id = ?", [result2.insertId]);

  return  [result2,rows[0]];
  
}

module.exports = {
  getSingle,
  getMultiple,
  addSingle
}