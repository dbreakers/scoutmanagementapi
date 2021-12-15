const config = {
    db: { /* don't expose password or any sensitive info, done only for demo */
     connectionLimit : 10,
     host: "localhost",
    user: " ",
    database: " "
    },
    listPerPage:   10,
  };
  
  
  module.exports = config;