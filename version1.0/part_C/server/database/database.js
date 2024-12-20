//  Database.js -- providing the Table class, for adding, editing and reading table data. 

var path = require('path');
var fs   = require('fs');

class Table {

  constructor(name) {
    this.name = name;
    try {
      this.columns = JSON.parse(fs.readFileSync(`${__dirname}/table_columns/${name}.json`, 'utf8'));
    } catch (err) {
      throw new Error(`The file "\x1b[32m/table_columns/${name}.json\x1b[0m" does not exist or is not proper JSON.`)
    }
    try {
      this.rows = JSON.parse(fs.readFileSync(`${__dirname}/table_rows/${name}.json`, 'utf8'));
    } catch (err) {
      throw new Error(`The file "\x1b[32m/table_rows/${name}.json\x1b[0m" does not exist or is not proper JSON.`)
    }
  }

  //  "query" is an object
  find(query) {
    let query_keys = Object.keys(query);
    let results = [];
    for (let i = 0; i < this.rows.length; i++) {
      let is_result = true;
      for (let j = 0; j < query_keys.length; j++) {
        let key = query_keys[j];
        if (this.rows[i][key] != query[key]) {
          is_result = false;
        }
      }
      if (is_result) {
        results.push(this.rows[i]);
      }
    }
    return results;
  }

  insert(row_data) {
    let response = {
      error: false,
      msg: '',
      id: null
    }
    for (let i = 0; i < this.columns.columns.length; i++) {
      let column_data = this.columns.columns[i];
      if (column_data.unique === true && !(column_data.required === false && !row_data[column_data.snakecase])) {
        for (let j = 0; j < this.rows.length; j++) {
          if (this.rows[j][column_data.snakecase] == row_data[column_data.snakecase]) {
            response.error = true;
            response.msg = `${column_data.name} must be unique.`;
            return response;
          }
        }
      }
      if (column_data.require === true && !row_data[column_data.snakecase]) {
        response.error = true;
        response.msg = `${column_data.name} is required.`;
        return response;
      }
    }
    row_data.id = this.columns.max_id;
    response.id = row_data.id;
    this.columns.max_id++;
    this.rows.push(row_data);
    fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
    fs.writeFileSync(`${__dirname}/table_columns/${this.name}.json`, JSON.stringify(this.columns, null, 2));
    return response;
  }

  delete(id_to_delete) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].id == id_to_delete) {
        this.rows.splice(i, 1);
        fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
        return `Deleted the row with id ${id_to_delete}`;
      }
    }
    return `No row found with id ${id_to_delete}`;
  }
  
}

module.exports = {
  table: function(table_name) {
    return new Table(table_name);
  },
}