const express = require("express");
const {
  postSingleUser,

  createPost,
  allUsersPosts,
  toggleLikePost,
  toggleDislikePost,
  postDetailsCtrl,
  postDeleteCtrl,
  postUpdateCtrl,
} = require("../Controller/postCtrl");
const postRouter = express.Router();
const isLogin = require("../middlewares/isLogin");
const storage = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ storage });
// const isAdmin = require("../middlewares/isAdmin");

// SINGLE USER
postRouter.get("/profile/:id", postSingleUser);

// GET ALL POSTS
postRouter.get("/", isLogin, allUsersPosts);

//CREATE POST
postRouter.post("/", isLogin, createPost);

// LIKE A POST
postRouter.get("/like/:id", isLogin, toggleLikePost);

// DISLIKE A POST
postRouter.get("/dislike/:id", isLogin, toggleDislikePost);

// POST DETAILS
postRouter.get("/:id", isLogin, postDetailsCtrl);

// DELETE POST
postRouter.delete("/:id", isLogin, postDeleteCtrl);

// update post
postRouter.put("/update/:id", isLogin, upload.single("photo"), postUpdateCtrl);

module.exports = postRouter;
