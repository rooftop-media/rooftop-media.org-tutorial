//  Database.js -- providing the Table class, for adding, editing and reading table data. 

var path = require('path');
var fs   = require('fs');

class Table {

  constructor(name) {
    this.name = name;
    this.columns = JSON.parse(fs.readFileSync(`${__dirname}/table_columns/${name}.json`, 'utf8'));
    this.rows = JSON.parse(fs.readFileSync(`${__dirname}/table_rows/${name}.json`, 'utf8'));
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
    row_data.id = this.columns.max_id;
    this.columns.max_id++;
    this.rows.push(row_data);
    fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
    fs.writeFileSync(`${__dirname}/table_columns/${this.name}.json`, JSON.stringify(this.columns, null, 2));
    return row_data.id;
  }

  update(id, update) {
    //  Look for row to update...
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].id == id) {
        let update_keys = Object.keys(update);
        for (let j = 0; j < update_keys.length; j++) {
          if (update_keys[j] != 'id') {
            this.rows[i][update_keys[j]] = update[update_keys[j]];
          }
        }
        fs.writeFileSync(`${__dirname}/table_rows/${this.name}.json`, JSON.stringify(this.rows, null, 2));
        return this.rows[i];
      }
    }
    return null;
  }
  
  delete(id_to_delete) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].id == id_to_delete) {
        this.rows.splice(i, 1);
        return ``;
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