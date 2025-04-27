const path = require("path");
const node_env = process.env.NODE_ENV || "development";
const envPath = path.resolve(__dirname, `./.env.${node_env}`);
// const envPath = path.resolve(`.env.${node_env}`);
require("dotenv").config({ path: envPath });

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const createError = require('http-errors');

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

const routesIndex = require(path.resolve(
  __dirname,
  "../src/routes/index_routes"
));

app.use(cors());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/", routesIndex);

// catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (req.app.get("env") === "development") {
    console.error(err); // log error
  }

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
