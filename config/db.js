const mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  database: "userdb",
  user: "root",
  password: "",
});

connection.connect((error) => {
  if (error) {
    console.log("error");
  } else {
    console.log("Connected to the database");
  }
});

module.exports = connection;
