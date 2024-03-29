const db = require('../database');
const helper = require('../helper'); 
const config = require('../config');


async function addnode(newnode,res){
// console.log(newnode);
// console.log("hhello");
  let message = '';
  let error = 200;
 
  
  if (!newnode.hasOwnProperty('description')) {message='Description Missing'; error=400;}
  if (!newnode.hasOwnProperty('id')) {message='ID Missing'; error=400; }
  if (!newnode.hasOwnProperty('type')) {message='Type is Missing';error=400; }
  if (error==200) {
  const check = await db.query( "SELECT * from `hierarchy_items` WHERE `hier_type`= ? and `org_unit_id` = ?", ["ST",newnode.id]);
  if (newnode.hasOwnProperty('parent')&&(newnode.parent!==null)) {
     const check2 = await db.query( "SELECT * from `hierarchy_items` WHERE `hier_type`= ? and `org_unit_id` = ?", ["ST",newnode.parent]);
     if  (check2.length!=1) {message='Parent node does not exist'; error=400;}     
  } 

 console.log("ID: "+newnode.id);
 console.log(check);
  if (check.length>0) {  message='Node already exists';error=400;}
  if (newnode.description===null) { newnode.description = "<Root>";}
 // console.log(newnode.description);
} 
 if (message==='') {
  const result = await db.query(
    `INSERT INTO hierarchy_items 
    (hier_type,org_unit_id, description, type) 
    VALUES 
    (?,?, ?, ?)`, 
    [
      "ST",newnode.id, newnode.description, newnode.type
    ] 
  );
  if ((newnode.hasOwnProperty('parent'))&&(newnode.parent!==null)) {
  const result2 = await db.query(
    "INSERT INTO hierarchy_relate (hier_type,org_unit_id, related_id,distance) SELECT hier_type,?,related_id,distance+1 from hierarchy_relate where org_unit_id = ? union all select ?,?,?,0",
     
    [
      newnode.id, newnode.parent,  "ST",newnode.id,  newnode.id
    ]
  );
  } else {
   const result2 = await db.query(
    "INSERT INTO hierarchy_relate  (hier_type,org_unit_id, related_id,distance) VALUES(`ST`, ?,?,0)",
     
    [
      newnode.id, newnode.id
    ]
  );
  }
//  console.log(result);
   message = 'Error in creating Node'; error=400;

    if (result.affectedRows) {
    message = 'Node created successfully '+newnode.id; error=200;
     }
  } //else
 // { //message = "Org Unit exists with this key already";}
  return res.status(error).json(message);
 // return {message};
}

async function getSingle(id){
     const rows = await db.query(    "SELECT * from `hierarchy_items` WHERE org_unit_id = ? and hier_type = ?", [id,"ST"]);
 
  const data = helper.emptyOrRows(rows);
  
  return  data[0] 
  
}

async function getPath(id){
     const rows = await db.query(    "SELECT * FROM `hierarchy_relate` right join hierarchy_items on hierarchy_items.hier_type = hierarchy_relate.hier_type and hierarchy_items.org_unit_id = hierarchy_relate.related_id WHERE hierarchy_relate.hier_type=? and hierarchy_relate.org_unit_id  = ?", ["ST",id]);
 
  const data = helper.emptyOrRows(rows);
  
  return  data;
  
}

async function getChild(id){
   //  const rows = await db.query(    "SELECT * FROM `hierarchy_relate` right join hierarchy_items  on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id and hierarchy_items.hier_type = hierarchy_relate.hier_type WHERE hierarchy_relate.related_id = ? and hierarchy_relate.hier_type=?", [id,"ST"]);
   const rows = await db.query ("SELECT hierarchy_relate.org_unit_id,hierarchy_items.description, parent.org_unit_id as parent_org_unit_id, parent.description as parent_description,hierarchy_relate.distance FROM `hierarchy_relate` right join hierarchy_items on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id and hierarchy_items.hier_type = hierarchy_relate.hier_type join `hierarchy_relate` as parent_link on parent_link.org_unit_id = hierarchy_relate.org_unit_id and parent_link.distance = 1 join `hierarchy_items` as parent on parent_link.related_id = parent.org_unit_id WHERE hierarchy_relate.related_id = ? and hierarchy_relate.hier_type=?",[id,"ST"]);
  const data = helper.emptyOrRows(rows);
   
  return  data;
  
}

async function getChildLevel(id,distance){
  //const rows = await db.query(    "SELECT * FROM `hierarchy_relate` right join hierarchy_items  on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id and hierarchy_items.hier_type = hierarchy_relate.hier_type WHERE hierarchy_relate.related_id = ? and hierarchy_relate.hier_type=? and hierarchy_relate.distance=?", [id,"ST",distance]);
  const rows = await db.query ("SELECT hierarchy_relate.org_unit_id,hierarchy_items.description, parent.org_unit_id as parent_org_unit_id, parent.description as parent_description,hierarchy_relate.distance FROM `hierarchy_relate` right join hierarchy_items on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id and hierarchy_items.hier_type = hierarchy_relate.hier_type join `hierarchy_relate` as parent_link on parent_link.org_unit_id = hierarchy_relate.org_unit_id and parent_link.distance = 1 join `hierarchy_items` as parent on parent_link.related_id = parent.org_unit_id WHERE hierarchy_relate.related_id = ? and hierarchy_relate.hier_type=? and hierarchy_relate.distance=?",[id,"ST",distance]);

const data = helper.emptyOrRows(rows);

return  data;

}

async function find(searchterm,page = 1){
  searchterm = "%"+searchterm+"%";
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(    "SELECT a.org_unit_id,a.description,a.type, parent.org_unit_id as parent_id,parent.description as parent_description,parent.type as parent_type FROM `hierarchy_items` as a join hierarchy_relate on a.org_unit_id = hierarchy_relate.org_unit_id join `hierarchy_items` as parent on hierarchy_relate.related_id = parent.org_unit_id WHERE a.description LIKE ? and hierarchy_relate.distance = 1 and a.hier_type='ST' LIMIT ?,?", [searchterm,offset, config.listPerPage]);
  const count = await db.query(    "SELECT count(a.org_unit_id) as c FROM `hierarchy_items` as a join hierarchy_relate on a.org_unit_id = hierarchy_relate.org_unit_id join `hierarchy_items` as parent on hierarchy_relate.related_id = parent.org_unit_id WHERE a.description LIKE ? and hierarchy_relate.distance = 1 and a.hier_type='ST'", [searchterm]);

const data = helper.emptyOrRows(rows);

return  {data: data,count: count[0].c,offset:offset,perpage:config.listPerPage};

}

//SELECT * FROM `hierarchy_relate` right join hierarchy_items on hierarchy_items.org_unit_id = hierarchy_relate.related_id WHERE hierarchy_relate.org_unit_id = 10012687
//SELECT * FROM `hierarchy_relate` right join hierarchy_items  on hierarchy_items.org_unit_id = hierarchy_relate.org_unit_id WHERE hierarchy_relate.related_id =10010601
//SELECT *  FROM `role_person` left join hierarchy_items on hierarchy_items.org_unit_id = role_person.org_unit where role_person.org_unit = 10044052  and (role_person.date_from >= '2021-11-01' and role_person.date_from <= '2021-12-01')

module.exports = {
  addnode,
  getSingle,
  getChild,
  getChildLevel,
  find,
  getPath
}