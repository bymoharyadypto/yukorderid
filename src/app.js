if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  // require("dotenv").config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
}

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");

const app = express();

const routesIndex = require(path.resolve(
  __dirname,
  "../src/routes/index_routes"
));

app.use(cors());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", routesIndex);

module.exports = app;
