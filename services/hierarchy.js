const db = require('../database');
const helper = require('../helper'); 
const config = require('../config');


async function addnode(newnode){
// console.log(newnode);
// console.log("hhello");
  let message = '';
  
  const check = await db.query( "SELECT * from `hierarchy_items` WHERE org_unit_id = ?", [newnode.id]);
  if (newnode.hasOwnProperty('parent')&&(newnode.parent!==null)) {
     const check2 = await db.query( "SELECT * from `hierarchy_items` WHERE org_unit_id = ?", [newnode.parent]);
     if  (check2.length!=1) {message='Parent node does not existing';} 
      
  } 
 
  if (check.length>0) {  message='Node already exists';}
  
  if (!newnode.hasOwnProperty('description')) {message='Description Missing'; }
  if (!newnode.hasOwnProperty('id')) {message='ID Missing'; }
  if (!newnode.hasOwnProperty('type')) {message='Type is Missing'; }
  if (newnode.description===null) { newnode.description = "<>";}
 // console.log(newnode.description);
  if (message==='') {
  const result = await db.query(
    `INSERT INTO hierarchy_items 
    (org_unit_id, description, type) 
    VALUES 
    (?, ?, ?)`, 
    [
      newnode.id, newnode.description, newnode.type
    ] 
  );
  if ((newnode.hasOwnProperty('parent'))&&(newnode.parent!==null)) {
  const result2 = await db.query(
    "INSERT INTO hierarchy_relate (org_unit_id, related_id,distance) SELECT ?,related_id,distance+1 from hierarchy_relate where org_unit_id = ? union all select ?,?,0",
     
    [
      newnode.id, newnode.parent,  newnode.id,  newnode.id
    ]
  );
  } else {
   const result2 = await db.query(
    "INSERT INTO hierarchy_relate  (org_unit_id, related_id,distance) VALUES( ?,?,0)",
     
    [
      newnode.id, newnode.id
    ]
  );
  }
//  console.log(result);
   message = 'Error in creating Node';

    if (result.affectedRows) {
    message = 'Node created successfully';
     }
  } //else
 // { //message = "Org Unit exists with this key already";}

  return {message};
}

async function getSingle(id){
     const rows = await db.query(    "SELECT * from `hierarchy_items` WHERE org_unit_id = ?", [id]);
 
  const data = helper.emptyOrRows(rows);
  
  return  data[0] 
  
}

async function getPath(id){
     const rows = await db.query(    "SELECT * FROM `hierarchy_relate` right join hierarchy_items on hierarchy_items.org_unit_id = hierarchy_relate.related_id WHERE hierarchy_relate.org_unit_id  = ?", [id]);
 
  const data = helper.emptyOrRows(rows);
  
  return  data;
  
}

async function getChild(id){
     const rows = await db.query(    "SELECT * FROM `hierarchy_relate` right join hierarchy_items  on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id WHERE hierarchy_relate.related_id = ?", [id]);
 
  const data = helper.emptyOrRows(rows);
  
  return  data;
  
}

//SELECT * FROM `hierarchy_relate` right join hierarchy_items on hierarchy_items.org_unit_id = hierarchy_relate.related_id WHERE hierarchy_relate.org_unit_id = 10012687
//SELECT * FROM `hierarchy_relate` right join hierarchy_items  on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id WHERE hierarchy_relate.related_id =10010601
//SELECT *  FROM `role_person` left join hierarchy_items on hierarchy_items.org_unit_id = role_person.org_unit where role_person.org_unit = 10044052  and (role_person.date_from >= '2021-11-01' and role_person.date_from <= '2021-12-01')

module.exports = {
  addnode,
  getSingle,
  getChild,
  getPath
}