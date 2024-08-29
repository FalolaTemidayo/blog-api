const express = require("express");
const isLogin = require("../middlewares/isLogin");

// FUNCTION IMPORT
const {
  createComment,
  deleteCommment,
  getSingleComment,
  updateComment,
  fetchAllCommentCtrl,
  deleteComment,
} = require("../Controller/commentCtrl");
const commentRouter = express.Router();

// CREATE COMMENT
commentRouter.post("/:id", isLogin, createComment);

// SINGLE COMMENT
commentRouter.get("/:id", getSingleComment);


// DELETE COMMENT
commentRouter.delete("/:id", isLogin, deleteComment);

// ALL COMMENTS
commentRouter.get("/", fetchAllCommentCtrl)

module.exports = commentRouter;
