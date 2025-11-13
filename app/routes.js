var Review = require("./models/review");

module.exports = function(app, passport, db, mongoose, ObjectId, multer) {
  app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
      return res.redirect("/profile");
    }
    res.render("index.ejs");
  });

  //user login to profile

  app.get("/profile", isLoggedIn, function(req, res) {
    var uId = ObjectId(req.session.passport.user._id);
    db.collection("users")
      .find({
        _id: uId
      })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("profile.ejs", {
          user: req.user,
          userInfo: result
        });
      });
  });

  app.post("/profile", (req, res) => {
    var uId = ObjectId(req.session.passport.user._id);
    db.collection("users").findOneAndUpdate(
      {
        _id: uId
      },
      {
        $set: {
          name: req.body.name,
          school: req.body.school
        }
      },
      {
        sort: {
          _id: -1
        },
        upsert: false
      },
      (err, result) => {
        if (err) return res.send(err);
        res.render("profile.ejs", {
          user: req.user,
          userInfo: result
        });
      }
    );
  });

  app.delete("/userReview", (req, res) => {
    var uId = ObjectId(req.session.passport.user._id);
    let schoolName = req.params.schoolName;
    console.log("Attempting to delete", req.body);
    db.collection("userReview").findOneAndDelete(
      {
        pros_review: req.body.pros_review,
        cons_review: req.body.cons_review,
        userId: ObjectId(req.body.userId),
        schoolId: ObjectId(req.body.schoolId)
      },
      (err, result) => {
        if (err) return res.send(500, err);
        res.send("Message deleted!");
      }
    );
  });

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  //School redirecting start

  // http://localhost:8000/schools/Boston%20Green%20Academy
  app.get("/schools/:schoolName", isLoggedIn, async (req, res) => {
    try {
      const schoolName = req.params.schoolName;
      console.log("Requested school:", schoolName);

      // Find the school
      const schools = await db.collection("schools")
        .find({ "properties.SCH_NAME": schoolName })
        .toArray();

      if (!schools || schools.length === 0) {
        return res.status(404).send("School not found");
      }

      const school = schools[0];

      // Find reviews for the school
      const reviews = await db.collection("userReview")
        .find({ schoolId: school._id })
        .toArray();

      // Compute average rating
      let average;
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        average = Math.floor(total / reviews.length);
      } else {
        average = "School has not been reviewed";
      }

      res.render("School.ejs", {
        user: req.user,
        schoolName: schoolName,
        school: school,
        reviews: reviews,
        average: average,
        // rating: rating
      });

    } catch (err) {
      console.error("Error fetching school:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/schoolSearch", (req, res) => {
    db.collection("profileInfo")
      .save({
        schoolSearch: schoolSearch
      })
      .toArray((err, result) => {
        if (err) return console.log(err);
        console.log(result);
        res.render("School.ejs", {
          schoolSearch: schoolSearch
        });
      });
  });

  app.post("/search", (req, res) => {
    db.collection("schools")
      .find({
        "properties.SCH_NAME": req.body.schoolSearch
      })
      .toArray((err, result) => {
        if (err) return console.log(err);
        console.log(result);
        res.render("School.ejs", {
          schools: result,
          user: req.user,
          reviews: result
        });
      });
  });

  //School redirecting ends

  //user ratings

  //user creates reviews
  app.get("/userReview", isLoggedIn, function(req, res) {
    var schoolId = "";
    db.collection("userReview")
      .find({
        schoolId: schoolId
      })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("School.ejs", {
          review: result
        });
      });
  });

  app.post("/userReview", (req, res) => {
    console.table(req.body);
    const rating = parseInt(req.body.rating);
    let newReview = new Review();
    newReview.reviewerEmail = req.session.passport.user.email;
    newReview.pros_review = req.body.pros_review;
    newReview.cons_review = req.body.cons_review;
    newReview.rating = rating;
    newReview.userId = req.body.userId;
    newReview.schoolId = req.body.schoolId;
    var uId = ObjectId(req.session.passport._id);
    db.collection("userReview").save(newReview, (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect(req.get("referer"));
    });
  });

  // image code starts

  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + ".png");
    }
  });
  var upload = multer({
    storage: storage
  });
  app.post("/up", upload.single("file-to-upload"), (req, res, next) => {
    insertDocuments(db, req, "images/uploads/" + req.file.filename, () => {
      res.redirect("/profile");
    });
  });
  app.post("/up", upload.single("file-to-upload"), (req, res, next) => {
    insertDocuments(db, req, "images/uploads/" + req.file.filename, () => {
      res.redirect("/search");
    });
  });
  var insertDocuments = function(db, req, filePath, callback) {
    var collection = db.collection("users");
    var uId = ObjectId(req.session.passport.user._id);
    collection.findOneAndUpdate(
      {
        _id: uId
      },
      {
        $set: {
          photo: filePath
        }
      },
      {
        sort: {
          _id: -1
        },
        upsert: false
      },
      (err, result) => {
        if (err) return res.send(err);
        callback(result);
      }
    );
  };

  // image code ends

  app.get("/login", function(req, res) {
    res.render("login.ejs", {
      message: req.flash("loginMessage")
    });
  });
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/",
      failureFlash: true
    })
  );
  app.get("/signUp", function(req, res) {
    res.render("signUp.ejs", {
      message: req.flash("signupMessage")
    });
  });
  app.get("/search", function(req, res) {
    res.render("School.ejs", {
      message: req.flash("signupMessage"),
      user: req.user,
      reviews: result
    });
  });
  app.post(
    "/signUp",
    passport.authenticate("local-signup", {
      successRedirect: "/profile",
      failureRedirect: "/",
      failureFlash: true
    })
  );
  app.get("/unlink/local", isLoggedIn, function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect("/profile");
    });
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}
