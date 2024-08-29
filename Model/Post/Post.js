const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Post descriptions is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    numViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please Author is required"],
    },
    photo: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

postSchema.pre(/^find/, function (next) {
  // ADD VIEWS COUNT AS VIRTUAL FIELDS
  postSchema.virtual("viewsCount").get(function () {
    const post = this;
    return post.numViews.length;
  });

  // ADD DISLIKES COUNT AS VIRTUAL FIELDS
  postSchema.virtual("DislikeCount").get(function () {
    const post = this;
    return post.dislikes.length;
  });

  // ADD LikeS COUNT AS VIRTUAL FIELDS
  postSchema.virtual("likeCount").get(function () {
    const post = this;
    return post.likes.length;
  });

  // CHECK THE POST LIKED POSTS IN PERCENTAGE
  postSchema.virtual("likePercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const percentage = Math.floor((post.likes.length / total) * 100);
    return `${percentage}%`;
  });

  // CHECK THE POST DISLIKED POSTS IN PERCENTAGE
  postSchema.virtual("dislikePercentage").get(function () {
    const post = this;
    const total = +post.likes.length + +post.dislikes.length;
    const percentage = Math.floor((post.dislikes.length / total) * 100);
    return `${percentage}%`;
  });

  // IF DAY IS LESS THAN 0 RETURN TODAY, IF DAY IS 1 RETURN YESTERDAY ELSE RETRUN DAYS AGE
  postSchema.virtual("daysAgo ").get(function () {
    const post = this;
    const date = new Date(post.createdAt);
    const daysAgo = Math.floor((Date.now() - date) / 86400000);
    return daysAgo === 0
      ? "Today"
      : daysAgo === 1
      ? "Yesterday"
      : `${daysAgo} days ago`;
  });
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
