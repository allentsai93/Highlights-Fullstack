var Highlight = require("../models/highlights");
var Comment = require("../models/comment");
// all middleware goes here
var middlewareObj = {};

middlewareObj.checkHighlightOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Highlight.findById(req.params.id, function(err, foundHighlight){
           if(err){
               req.flash("error", "Highlight not found");
               res.redirect("back");
           }  else {
 
            // Added this block, to check if foundHighlight exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
            if (!foundHighlight) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
            // If the upper condition is true this will break out of the middleware and prevent the code below to crash our application
 
            if(foundHighlight.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            } else {
            if (!foundComment) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
            }
                 // does user own comment? check if id on comment matches user id
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "You don't have permission to do that.");
                res.redirect("back");
                 }
            }
        });
        } else {
            req.flash("error", "You need to be logged in to do that.");
            res.redirect("back");
        }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");
}

module.exports = middlewareObj;