const db = require('../database');
const helper = require('../helper'); 
const config = require('../config');

var
  // should be a not so common char
  // possibly one JSON does not encode
  // possibly one encodeURIComponent does not encode
  // right now this char is '~' but this might change in the future
  specialChar = '~',
  safeSpecialChar = '\\x' + (
    '0' + specialChar.charCodeAt(0).toString(16)
  ).slice(-2),
  escapedSafeSpecialChar = '\\' + safeSpecialChar,
  specialCharRG = new RegExp(safeSpecialChar, 'g'),
  safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),

  safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),

  indexOf = [].indexOf || function(v){
    for(var i=this.length;i--&&this[i]!==v;);
    return i;
  },
  $String = String  // there's no way to drop warnings in JSHint
                    // about new String ... well, I need that here!
                    // faked, and happy linter!
;

function generateReplacer(value, replacer, resolve) {
  var
    doNotIgnore = false,
    inspect = !!replacer,
    path = [],
    all  = [value],
    seen = [value],
    mapp = [resolve ? specialChar : '[Circular]'],
    last = value,
    lvl  = 1,
    i, fn
  ;
  if (inspect) {
    fn = typeof replacer === 'object' ?
      function (key, value) {
        return key !== '' && indexOf.call(replacer, key) < 0 ? void 0 : value;
      } :
      replacer;
  }
  return function(key, value) {
    // the replacer has rights to decide
    // if a new object should be returned
    // or if there's some key to drop
    // let's call it here rather than "too late"
    if (inspect) value = fn.call(this, key, value);

    // first pass should be ignored, since it's just the initial object
    if (doNotIgnore) {
      if (last !== this) {
        i = lvl - indexOf.call(all, this) - 1;
        lvl -= i;
        all.splice(lvl, all.length);
        path.splice(lvl - 1, path.length);
        last = this;
      }
      // console.log(lvl, key, path);
      if (typeof value === 'object' && value) {
    	// if object isn't referring to parent object, add to the
        // object path stack. Otherwise it is already there.
        if (indexOf.call(all, value) < 0) {
          all.push(last = value);
        }
        lvl = all.length;
        i = indexOf.call(seen, value);
        if (i < 0) {
          i = seen.push(value) - 1;
          if (resolve) {
            // key cannot contain specialChar but could be not a string
            path.push(('' + key).replace(specialCharRG, safeSpecialChar));
            mapp[i] = specialChar + path.join(specialChar);
          } else {
            mapp[i] = mapp[0];
          }
        } else {
          value = mapp[i];
        }
      } else {
        if (typeof value === 'string' && resolve) {
          // ensure no special char involved on deserialization
          // in this case only first char is important
          // no need to replace all value (better performance)
          value = value .replace(safeSpecialChar, escapedSafeSpecialChar)
                        .replace(specialChar, safeSpecialChar);
        }
      }
    } else {
      doNotIgnore = true;
    }
    return value;
  };
}

function retrieveFromPath(current, keys) {
  for(var i = 0, length = keys.length; i < length; current = current[
    // keys should be normalized back here
    keys[i++].replace(safeSpecialCharRG, specialChar)
  ]);
  return current;
}

function generateReviver(reviver) {
  return function(key, value) {
    var isString = typeof value === 'string';
    if (isString && value.charAt(0) === specialChar) {
      return new $String(value.slice(1));
    }
    if (key === '') value = regenerate(value, value, {});
    // again, only one needed, do not use the RegExp for this replacement
    // only keys need the RegExp
    if (isString) value = value .replace(safeStartWithSpecialCharRG, '$1' + specialChar)
                                .replace(escapedSafeSpecialChar, safeSpecialChar);
    return reviver ? reviver.call(this, key, value) : value;
  };
}

function regenerateArray(root, current, retrieve) {
  for (var i = 0, length = current.length; i < length; i++) {
    current[i] = regenerate(root, current[i], retrieve);
  }
  return current;
}

function regenerateObject(root, current, retrieve) {
  for (var key in current) {
    if (current.hasOwnProperty(key)) {
      current[key] = regenerate(root, current[key], retrieve);
    }
  }
  return current;
}

function regenerate(root, current, retrieve) {
  return current instanceof Array ?
    // fast Array reconstruction
    regenerateArray(root, current, retrieve) :
    (
      current instanceof $String ?
        (
          // root is an empty string
          current.length ?
            (
              retrieve.hasOwnProperty(current) ?
                retrieve[current] :
                retrieve[current] = retrieveFromPath(
                  root, current.split(specialChar)
                )
            ) :
            root
        ) :
        (
          current instanceof Object ?
            // dedicated Object parser
            regenerateObject(root, current, retrieve) :
            // value as it is
            current
        )
    )
  ;
}

var CircularJSON = {
  stringify: function stringify(value, replacer, space, doNotResolve) {
    return CircularJSON.parser.stringify(
      value,
      generateReplacer(value, replacer, !doNotResolve),
      space
    );
  },
  parse: function parse(text, reviver) {
    return CircularJSON.parser.parse(
      text,
      generateReviver(reviver)
    );
  },
  // A parser should be an API 1:1 compatible with JSON
  // it should expose stringify and parse methods.
  // The default parser is the native JSON.
  parser: JSON
};
 



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