require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const multer = require("multer");
const ObjectId = require("mongodb").ObjectID;
const dbConfig = require('./config/database');

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Passport setup
require("./config/passport")(passport);
app.use(session({
  secret: "resilientbootcamp",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// MongoDB connection
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB (Mongoose)");

  // Load routes **after DB is ready**
  require("./app/routes")(app, passport, db, mongoose, ObjectId, multer);

  // Start server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});