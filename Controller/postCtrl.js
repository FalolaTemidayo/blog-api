const User = require("../Model/User/User");
// const post = require("../Model/Post/Post");
const Post = require("../Model/Post/Post");
// const category = require("../Model/Category/Category")
const appErr = require("../utilities/appErr.js");

const allUsersPosts = async (req, res) => {
  const posts = await Post.find({})
    .populate("category", "title")
    .populate("user");

  // CHECK IF THE USER IS BLOKED BY THE POST OWNER
  const filterPost = posts.filter((post) => {
    // GET ALL BLOCKED USERS
    const blockedUsers = post.user.blocked;
    const isBlocked = blockedUsers.includes(req.userAuth);

    return !isBlocked;
  });
  // const filteredPost = posts.filter(post => post.user.blocked .filter(id => id === req.userAuth)

  try {
    res.json({
      status: "Success",
      data: filterPost,
    });
  } catch (error) {
    res.json(error.message);
  }
};

// SINGLE USER
const postSingleUser = async (req, res) => {
  try {
    const getNow = await Post.findById(req.params.id);
    res.json({
      status: "success",
      data: getNow,
    });
  } catch (error) {
    res.json(error.message);
  }
};


// CREATE A POST
const createPost = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    // FIND THE USER
    const author = await User.findById(req.userAuth);

    // CHECK IF THE USER IS BLOCKED
    if (author.isBlocked) {
      return next(appErr("Access denied, account blocked", 403));
    }

    // CHECK IF THE TITLE EXISTS
    const existingTitle = await Post.findOne({title});
    if (existingTitle) {
      return next(
        appErr(
          "You cannot create this post with this title, change the Title to continue"
        )
      );
    } else {
      // CREATE THE POST
      const postCreated = await Post.create({
        title,
        description,
        category,
        user: author._id,
      });

      // ASSOCIATE USER TO A POST -Push the post into posts
      author.posts.push(postCreated);
      await author.save();
      res.json({
        status: "Success",
        data: postCreated,
      });
    }
  } catch (error) {
    res.json(error.message);
  }
};

// LIKE POST
const toggleLikePost = async (req, res, next) => {
  try {
    // GET THE POST
    const post = await Post.findById(req.params.id);

    // CHECK IF THE USER HAS ALREADY LIKED THE POST
    const isliked = post.likes.includes(req.userAuth);

    // CHECK IF THE USER HAS ALREADY DISLIKED THE POST
    const isdisliked = post.dislikes.includes(req.userAuth);

    if (isdisliked) {
      return next(
        appErr(
          "You have already disliked this post, undislike to continue",
          403
        )
      );
    } else {
      // UNLIKE THE POST IF THE USER HAS ALREADY LIKED THE POST BEFORE
      if (isliked) {
        post.likes = post.likes.filter(
          (like) => like.toString() !== req.userAuth.toString()
        );
        await post.save();
      } else {
        post.likes.push(req.userAuth);
        await post.save();
      }
      res.json({
        status: "success",
        data: post,
      });
    }
  } catch (error) {
    res.json(error.message);
  }
};

// DISLIKE THE  POST
const toggleDislikePost = async (req, res, next) => {
  try {
    // GET THE POST
    const post = await Post.findById(req.params.id);

    // CHECK IF THE USER HAS ALREADY LIKED THE POST
    const isliked = post.likes.includes(req.userAuth);

    // CHECK IF THE USER HAS ALREADY DISLIKED THE POST
    const isdisliked = post.dislikes.includes(req.userAuth);

    if (isliked) {
      return next(
        appErr("You have already liked this post, unlike to continue", 403)
      );
    } else {
      // UNDISLIKE THE POST IF THE USER HAS ALREADY DISLIKED THE POST BEFORE
      if (isdisliked) {
        post.dislikes = post.dislikes.filter(
          (dislike) => dislike.toString() !== req.userAuth.toString()
        );
        await post.save();
      } else {
        // IF THE USER HAS NOT LIKE THE POST, LIKE THE post
        post.dislikes.push(req.userAuth);
        await post.save();
      }
      res.json({
        status: "success",
        data: post,
      });
    }
  } catch (error) {
    res.json(error.message);
  }
};

// DELETE POST
const postDeleteCtrl = async (req, res, next) => {
  try {
    // Find the post and check if it exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appErr("This post does not exist or it has been deleted"));
    }

    // FIND THE USER TO DELETE THE POST
    const author = await User.findById(req.userAuth);
    if (!author) {
      return next(appErr("User not found"));
    }

    if (post.user._id.toString() === author._id.toString()) {
      await Post.findByIdAndDelete(req.params.id);
      res.json({
        status: "success",
        data: "Post deleted successfully",
      });
    } else {
      return next(
        appErr("You did not create this post so you can not delete it")
      );
    }
  } catch (error) {
    res.json(error.message);
  }
};

// POST DETAILS
const postDetailsCtrl = async (req, res, next) => {
  try {
    // FIND THE POST
    const post = await Post.findById(req.params.id);

    // NUMBER OF VIEWS
    // CHECK IF THE USER VIEWED THE POST
    const isViewed = await post.numViews.includes(req.userAuth);

    if (isViewed) {
      res.json({
        status: "success",
        data: post,
      });
    } else {
      // PUSH INTO numViews
      post.numViews.push(req.userAuth);
      await post.save();
      res.json({
        status: "success",
        data: post,
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// POST UPDATE
const postUpdateCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;
  try {
    // Find the post and check if it exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(appErr("This post does not exist or it has been deleted"));
    }


    

    // CHECK IF THE USER THAT CREATED THE POST IS THE ONE TRYING TO UPDATE IT
    if (post.user._id.toString() === req.userAuth.toString()) {
      const postUpdate = await Post.findByIdAndUpdate(
        req.params.id,
        { title, description, category,  photo: req?.file?.path},
        { new: true }
      );
      await post.save();
      res.json({
        status: "Success",
        data: postUpdate,
      });
    } else {
      return next(
        appErr("You did not create this post so you can not Update it")
      );
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  allUsersPosts,
  postSingleUser,
  createPost,
  toggleLikePost,
  toggleDislikePost,
  postDetailsCtrl,
  postDeleteCtrl,
  postUpdateCtrl,
};
