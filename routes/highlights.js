var express = require("express");
var router = express.Router();
var Highlight = require("../models/highlights");
var middleware = require("../middleware");
// IMAGE UPLOAD
var multer = require('multer');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
 
// INDEX - show all Highlights
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Highlights that match the name of Highlight
        Highlight.find({name: regex}, function(err, allHighlights){
           if(err) {
               console.log(err);
           } else {
               if(allHighlights.length < 1){
                   var noMatch = "No Highlights match that query, please try again."
               }
               res.render("Highlights/index", {Highlights:allHighlights, page:'Highlights', noMatch: noMatch});
           }
        });        
    } else {
    // Get all Highlights from DB
        Highlight.find({}, function(err, allHighlights){
           if(err) {
               console.log(err);
           } else {
               res.render("Highlights/index", {Highlights:allHighlights, page:'Highlights', noMatch: noMatch});
           }
        });
}});
//NEW - show form to create new Highlight
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("Highlights/new", {page: 'newCamp'}); 
});

// CREATE route - add new Highlight to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
      cloudinary.uploader.upload(req.file.path, function(result) {
        req.body.Highlight.image = result.secure_url;
        req.body.Highlight.author = {
            id: req.user._id,
            username: req.user.username
        }      
      Highlight.create(req.body.Highlight, function(err, Highlight) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/highlights/' + Highlight.id);
        console.log(req.body.Highlight)
      });
    });
});

// SHOW - shows more info about one Highlight
router.get("/:id", function(req, res){
    //find the Highlight with provided ID
    Highlight.findById(req.params.id).populate("comments").exec(function(err, foundHighlight){
        if (err) {
            console.log(err);
        } else {
            if (!foundHighlight) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }
           res.render("Highlights/show", {Highlight: foundHighlight}); 
        }
    });
    //render show template with that Highlight
});

//EDIT Highlight ROUTE
router.get("/:id/edit", middleware.checkHighlightOwnership, function(req, res){
    // is user logged in?
    Highlight.findById(req.params.id, function(err, foundHighlight){
        if(err){
            req.flash("error", "Highlight not found.")
        } else {
            if (!foundHighlight) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }            
            res.render("Highlights/edit", {Highlight: foundHighlight}); 
        }
    });
});

// UPDATE Highlight ROUTE
router.put("/:id",middleware.checkHighlightOwnership, function(req, res){
    // find and update the correct Highlight
    Highlight.findByIdAndUpdate(req.params.id, req.body.Highlight, function(err, updatedHighlight){
       if(err){
           res.redirect("/highlights");
       } else {
           //redirect somewhere(show page)
           res.redirect("/highlights/" + req.params.id);
       }
    });
});

// DESTROY Highlight ROUTE
router.delete("/:id", middleware.checkHighlightOwnership, function(req, res){
   Highlight.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/highlights");
       } else {
           res.redirect("/highlights");
       }
   });
});

// replaces text with reg expression, match any characters globally
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");  
};

module.exports = router;
