function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
  }
  
  function emptyOrRows(rows) {
    if (!rows) {
      return [];
    }
    return rows;
  }
  
  //https://www.npmjs.com/package/circular-json if needed again
  
  module.exports = {
    getOffset,
    emptyOrRows
  }