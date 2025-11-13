// config/passport.js
import { Strategy as LocalStrategy } from "passport-local";
import User from "../app/models/user.js";

export default function(passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================

  passport.serializeUser(function(user, done) {
    done(null, { _id: user.id, email: user.local.email });
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use(
    "local-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function(req, email, password, done) {
        console.log("here");

        User.findOne({ "local.email": email }, function(err, user) {
          if (err) return done(err);

          if (user) {
            return done(
              null,
              false,
              req.flash("signupMessage", "That email is already in use.")
            );
          } else {
            const newUser = new User();

            console.log("new user being created");

            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.photo = "images/uploads/newuser.jpg";
            newUser.name = "";
            newUser.school = "";

            newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
      }
    )
  );

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function(req, email, password, done) {
        User.findOne({ "local.email": email }, function(err, user) {
          if (err) return done(err);

          if (!user)
            return done(
              null,
              false,
              req.flash("loginMessage", "This username does not exist")
            );

          if (!user.validPassword(password))
            return done(
              null,
              false,
              req.flash("loginMessage", "Incorrect login, try again.")
            );

          return done(null, user);
        });
      }
    )
  );
}
