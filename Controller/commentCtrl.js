const Comment = require("../Model/Comment/Comment");
const appErr = require("../utilities/appErr");
const Post = require("../Model/Post/Post");
const User = require("../Model/User/User");

// CREATE COMMENT
const createComment = async (req, res, next) => {
  const { description } = req.body;
  try {
    // FIND THE POST
    const post = await Post.findById(req.params.id);

    // CREATE THE COMMENT
    const comment = await Comment.create({
      post: post._id,
      description,
      user: req.userAuth,
    });

    // PUSH THE COMMENT TO THE POST
    post.comments.push(comment._id);

    // FIND THE USER
    const user = await User.findById(req.userAuth);

    // PUSH TO USER LISTS
    user.comments.push(comment._id);

    // SAVE THE COMMENT
    await post.save();
    await user.save();
    res.json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// GET COMMENT
const getSingleComment = async (req, res, next) => {
  try {
    const getComment = await Comment.findById(req.params.id);
    res.json({
      status: "success",
      data: getComment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// UPDATE COMMENT


// FETCH ALL COMMENT
const fetchAllCommentCtrl = async (req, res, next) => {
  try {
    const comment = await Comment.find();
    res.json({
      status: "Success",
      data: comment,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// DELETE COMMENT
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return next(appErr("Comment does not exist or it has been deleted", 404));
    }

    if (comment.user.toString() !== req.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this comment", 403));
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "Comment deleted successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};


module.exports = {
  createComment,
  getSingleComment,
  deleteComment,
  fetchAllCommentCtrl,
};
