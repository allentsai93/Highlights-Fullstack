var express = require("express");
//mergeparams pushes params together
var router = express.Router({mergeParams: true});
var Highlight = require("../models/highlights");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//COMMENTS ROUTES, comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    Highlight.findById(req.params.id, function(err, Highlight){
        if(err){
            console.log(err)
        } else {
            res.render("comments/new", {Highlight: Highlight}); 
        }
    })
});
// comments create
router.post("/", middleware.isLoggedIn, function(req, res){
   //lookup Highlight using ID
   Highlight.findById(req.params.id, function(err, Highlight){
      if(err){
          console.log(err)
          res.redirect("/highlights");
      } else {
        //create new comment
        //connect new comment to Highlight
        //redirect to show page of Highlight
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong :(");
               console.log(err)
           } else {
               // add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               // save comment
               comment.save();
               Highlight.comments.push(comment._id);
               Highlight.save();
               req.flash("success", "Successfully added comment!");
               res.redirect("/highlights/" + Highlight._id);
           }
        });
      }
   });
});
// EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
    if (!foundComment) {
        req.flash("error", "Item not found.");
        return res.redirect("back");
    }          
          res.render("comments/edit", {Highlight_id: req.params.id, comment: foundComment})
      }
   });
});

// UPDATE EDIT COMMENT ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/highlights/" + req.params.id);
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Couldn't delete the comment.");
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted.");
            res.redirect("/highlights/"+req.params.id);
        }
    })
})



module.exports = router;
