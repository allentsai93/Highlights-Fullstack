require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Highlight = require("./models/highlights"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    session = require("express-session"),
    seedDB = require("./seeds");


//requiring routes
var commentRoutes = require("./routes/comments"),
    highlightRoutes = require("./routes/highlights"),
    indexRoutes = require("./routes/index");

//CONFIG -- changed db to _2 for dynamic pricing
mongoose.connect("mongodb://localhost/highlights");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
//USE STYLESHEETS
app.use(express.static(__dirname + "/public"));
//SEED DB WITH DATA
//seedDB();
app.locals.moment = require('moment');
// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Rusty is the cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware that runs for every single route, this one checks if there is a user or not
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   // flash messages
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   // middleware checks out, move on
   next();
});

// tells app to use the 3 route files required
app.use("/", indexRoutes);
app.use("/highlights/:id/comments", commentRoutes);
app.use("/highlights", highlightRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Highlight Server has started!"); 
});