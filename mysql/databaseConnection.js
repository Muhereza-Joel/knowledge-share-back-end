const mysql = require("mysql");

const pool = mysql.createPool({
  host: "ks-db.chg2u22ew259.eu-north-1.rds.amazonaws.com",
  user: "root",
  password: "12345678",
  database: "ks-db",
});

module.exports = pool;
