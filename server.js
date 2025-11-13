import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import flash from "connect-flash";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import multer from "multer";
import pkg from "mongodb";
const { ObjectID: ObjectId } = pkg;
import {url, dbName} from "./config/database.js";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Main async setup
const startServer = async () => {
  const passportConfig = await import("./config/passport.js");
  passportConfig.default(passport);

  app.use(
    session({
      secret: "resilientbootcamp",
      resave: true,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  // MongoDB connection
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  console.log("Connected to MongoDB (Mongoose)");

  const routesModule = await import("./app/routes.js");
  routesModule.default(app, passport, db, mongoose, ObjectId, multer);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();