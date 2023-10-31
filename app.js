const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
const router = require("./routes/index");

var app = express();

app.use(bodyParser.json());

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello World For Get");
});

var port = 3001;

app.listen(port, () => {
  console.log("the server is running at port no. 3001");
});
