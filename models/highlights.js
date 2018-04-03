var mongoose = require("mongoose");
//SCHEMA SETUP
var HighlightSchema = new mongoose.Schema({
    //Name Of Campgound
    name: {
        type: String,
        required: true,
    },

    //Image For Highlight
    image: {
        type: String,
        required: true,
    },
    
    //Image For Highlight
    still: {
        type: String,
        required: true,
    },
    
    //Video For Highlight
    video: {
        type: String,
        required: true,
    },

    //highlights Description
    description: {
        type: String,
        required: true,
    },
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
       {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
       }
    ]
});

var Highlight = mongoose.model("Highlight", HighlightSchema);

module.exports = Highlight;