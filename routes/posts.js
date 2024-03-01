const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth } = require("../middleware/auth");

//Post Routes
//Since linked from server js treat each path as:
//post/:id, post/createPost, post/likePost/:id, post/deletePost/:id
router.get("/:id", ensureAuth, postsController.getPost);


//Enables user to create an exportable excel file from MULTIPLE pdf statements
router.post("/parsePDFs", upload.array("files[]",5), postsController.parsePDFs);
 
//Enables user to create an exportable excel file from a SINGLE pdf statement
//router.post("/parsePDF", upload.single("file"), postsController.parsePDF);

 
//Enables user to create post w/ cloudinary for media uploads
router.post("/createPost", upload.single("file"), postsController.createPost);

//Enables user to like post. In controller, uses POST model to update likes by 1
router.put("/likePost/:id", postsController.likePost);

//Enables user to delete post. In controller, uses POST model to delete post from MongoDB collection
router.delete("/deletePost/:id", postsController.deletePost);

module.exports = router;
