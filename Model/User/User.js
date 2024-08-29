const mongoose = require("mongoose");
const Post = require("../Post/Post");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      require: [true, "Last Name is required"],
    },
    profilePhoto: {
      type: String,
    },
    email: {
      type: String,
      require: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // plan: [
    //   {
    //     type: String,
    //     enum: ["Free", "Premium", "Pro"],
    //     default: "Free",
    //   },
    // ],
    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

//GET FULLNAME
userSchema.virtual("fullname").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

//GET INITIALS
userSchema.virtual("Initials").get(function () {
  return `${this.firstName[0]}${this.lastName[0]}`;
});

//POST COUNT
userSchema.virtual("Postcount").get(function () {
  return this.posts.length;
});

//  FOLLOWERS COUNT
userSchema.virtual("Followers Count").get(function () {
  return {
    followers: this.followers.length,
    following: this.following.length,
  };
});

// VIEWERS COUNT
userSchema.virtual("Viewers Count").get(function () {
  return this.viewers.length;
});

// BLOCKED COUNT
userSchema.virtual("Blocked Count").get(function () {
  return this.isBlocked.length;
});

userSchema.pre("findOne", async function (next) {
  // GET THE USER
  const userId = this._conditions._id;

  // FIND THE POST CREATED BY THE USER
  const posts = await Post.find({ user: userId });

  // GET THE LAST POST CREATED BY THE USER
  const lastPost = posts[posts.length - 1];

  //GET THE LAST POST DATE
  const lastPostDate = new Date(lastPost?.createdAt);

  // GET LAST POST IN A STRING FORMAT
  const lastPostDateStr = lastPostDate.toDateString();

  // ADD VIRTUAL To THE SCHEMA
  userSchema.virtual("lastPostDate").get(function () {
    return lastPostDateStr;
  });

  // CHECK IF USER IS INACTIVE FOR 30 DAYS
  // GET CURRENT DATE
  const currentDate = new Date();

  // GET THE DIFFERENCE BETWEEN LAST POST AND RETURN LESS THAN IN DAYS
  const diff = currentDate - lastPostDate;

  // GET THE DIFFERENCE BETWEEN IN DAYS AND RETURN LESS THAN IN DAYS
  const diffInDays = diff / (1000 * 3600 * 24);

  if (diffInDays > 30) {
    // ADD VIRTUAL isInActive to the schema to check if a user is inActive for 30days
    userSchema.virtual("isInactive").get(function () {
      return true;
    });

    // FIND THE USER BY ID AND UPDATE
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
  } else {
    userSchema.virtual("isInactive").get(function () {
      return false;
    });
    // FIND THE USER BY ID AND UPDATE
    await User.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
  }
  // -------- LAST ACTIVE DATE ------
  // CONVERT TO DAYS AGO, FOR EXAMPLE 1 DAY AGO
  const daysAgo = Math.floor(diffInDays);
  // ADD VIRTUALS LAST ACTIVE IN DAYS TO THE SCHEMA
  userSchema.virtual("lastActive").get(function () {
    // CHECK IF dayAgo IS LESS THAN 0
    if (daysAgo <= 0) {
      return "Today";
    }
    // CHECK IF daysAgo is equal to 1
    if (daysAgo === 1) {
      return " Yesterday";
    }
    // CHECK IF daysAgo is greater than 1
    if (daysAgo > 1) {
      return `${daysAgo} days ago`;
    }
  });
  const numberOfPosts = posts.length;
  // CHECK  IF THE NUMBER OF POSTS IS LESS THAN 10
  if (numberOfPosts < 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Bronze",
      },
      {
        new: true,
      }
    );
  }
  // CHECK IF THE NUMBER OF POSTS IS GREATER THAN 10
  if (numberOfPosts > 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Silver",
      },
      {
        new: true,
      }
    );
  }
  // CHECK IF THE NUMBER OF POSTS IS GREATER THAN 20
  if (numberOfPosts > 10) {
    await User.findByIdAndUpdate(
      userId,
      {
        userAward: "Gold",
      },
      {
        new: true,
      }
    );
  }

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
