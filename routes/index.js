var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Highlight = require("../models/highlights");

// ROUTE ROUTE
router.get("/", function(req, res){
   res.render("landing"); 
});

//================================
// AUTH ROUTES

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

// handle signup logic
router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        avatar: req.body.avator, 
        email: req.body.email
    });
    if(req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }
   User.register(newUser, req.body.password, function(err, user){
      if(err){
        console.log(err);
        return res.render("register", {error: err.message});
      } 
      passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to Highlights!, " + user.username + ".");
         res.redirect("/highlights"); 
      });
   });
});

// show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

// handling login logic app.post("link", middleware, callback)
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/highlights", 
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout(); 
   req.flash("success", "Logged you out!");
   res.redirect("/highlights");
});

// USER PROFILE
router.get("/users/:id", function(req, res){
   User.findById(req.params.id, function(err, foundUser){
      if(err){
          req.flash("error", "User not found!");
          res.redirect("/");
      }
      Highlight.find().where("author.id").equals(foundUser._id).exec(function(err, Highlights){
      if(err){
          req.flash("error", "User not found!");
          res.redirect("/");
      }
      res.render("users/show", {user: foundUser, Highlights: Highlights});
      })
   });
});

module.exports = router;