const User = require("../Model/User/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utilities/generateToken");
const appErr = require("../utilities/appErr.js");
const Post = require("../Model/Post/Post.js")
const Comment = require("../Model/Comment/Comment.js")
const Category = require("../Model/Category/Category.js")


// REGISTER USER
const register = async (req, res, next) => {
  const { firstName, lastName, profilePhoto, email, password, isAdmin } =
    req.body;
  try {
    // CHECK IF EMAIL EXISTS
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(appErr("User already exists"));
    }

    // HASH  PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATE THE USER
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isAdmin,
    });
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.json(error.message);
  }
};

// LOGIN USER
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //CHECKING IF EMAIL EXISTS
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Invalid Credentials", 400));
    }

    // CHECK VALID PASSWORD
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );
    if (!isPasswordMatched) {
      return next(appErr("Invalid Password", 400));
    }
    res.json({
      status: "success",
      data: {
        id: userFound._id,
        firstName: userFound.firstName,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// USER PROFILE
const singleUser = async (req, res) => {
  // const { id } = req.params;
  const user = await User.findById(req.userAuth);
  try {
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// ALL USERS
const allUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// UPDATE USER
const update = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: "Update User ",
    });
  } catch (error) {
    res.json(error.message);
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: "User data deleted",
    });
  } catch (error) {
    res.json(error.message);
  }
};

const profilePhotoUploadCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE USER TO BE UPDATED
    const userToUpdate = await User.findById(req.userAuth);
    // 2. CHECK UF USER WAS FOUND
    if (!userToUpdate) {
      return next(appErr("User not found", 403));
    }
    // 3. CHECK IF USER IS BLOCKED
    if (userToUpdate.isBlocked) {
      return next(appErr("Action not allowed, your account is blocked ", 403));
    }
    // 4. CHECK IF USER IS UPDATING THEIR PHOTO
    if (req.file) {
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
      res.json({
        status: "Success",
        data: " You have successfully updated your profile picture",
      });
    }
  } catch (error) {
    next(appErr(error.mess, 500));
  }
};

// USER PROFILE VIEWERS
const whoViewedMyProfileCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE ORIGINAL USER
    const user = await User.findById(req.params.id);

    // 2. FIND THE USER WHO VIEWED THE PROFILE
    const userWhoViewed = await User.findById(req.userAuth);

    // CHECK IF ORIGINAL USER & AND USER WHO VIEWED ARE FOUND
    if (user && userWhoViewed) {
      // 4. CHECK IF USER WHO VIEWED IS ALREADY IN THE VIEWERS PROFILE
      const isUserAlreadyViwed = user.viewers.find(
        (viewer) => viewer.toString() === userWhoViewed._id.toJSON()
      );

      if (isUserAlreadyViwed) {
        return next(appErr("You already viewed this profile"));
      } else {
        // 5. PUSH THE USER WHO VIEWED INTO THE VIEWERS ARRAY
        user.viewers.push(userWhoViewed._id);

        // 6. SAVE THE USER
        await user.save();

        res.json({
          status: "Success",
          msg: "You have already viewed this profile",
          data: user.viewers,
        });
      }
    }
  } catch (error) {
    next(error.message, 500);
  }
};

// FOLLOWERS AND FOLLOWING
const followingCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE USER TO FOLLOW
    const userToFollow = await User.findById(req.params.id);

    // 2. FIND THE USER WHO IS FOLLOWING
    const userWhoFollowed = await User.findById(req.userAuth);

    // 3 CHECK IF USER WHO FOLLOWED AND USER ARE FOUND
    if (userToFollow && userWhoFollowed) {
      // 4. CHECK IF userWhoFollowed IS ALREADY IN THE USER'S FOLLOWERS ARRAY
      const isUserAlreadyFollowed = userToFollow.followers.find(
        (follower) => follower.toString() === userWhoFollowed._id.toString()
      );
      if (isUserAlreadyFollowed) {
        return next(appErr("You are already following this user"));
      } else {
        // 5. PUSH userWhoFollowed IN TO THE USER'S FOLLOWERS ARRAY
        userToFollow.followers.push(userWhoFollowed._id);

        // 6. PUSH userToFollow TO THE userToFollowed following array
        userWhoFollowed.following.push(userToFollow._id);

        // 7. save
        await userWhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "Success",
          data: "You are now following this user",
          followers: userToFollow.followers,
          following: userWhoFollowed.following,
        });
      }
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// UNFOLLOWING
const unfollowersCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE USER TO FOLLOW
    const userToUnfollow = await User.findById(req.params.id);

    // 2. FIND THE USER WHO IS FOLLOWING
    const userWhoUnfollowed = await User.findById(req.userAuth);

    // 3. CHECK IF THE USERS ARE FOUND
    if (userToUnfollow && userWhoUnfollowed) {
      // 4. CHECK IF THE USER IS ALREADY A FOLLOWER
      const isUserFollowing = userToUnfollow.following.find(
        (follower) => follower.toString() === userWhoUnfollowed._id.toString()
      );

      // 5.  DELETE FROM THE USER'S FOLLOWERS LIST
      if (!isUserFollowing) {
        return next(appErr("You are not following this user"));
      } else {
        userToUnfollow.followers = userToUnfollow.followers.filter(
          (follower) => follower.toString() !== userWhoUnfollowed._id.toString()
        );
        userWhoUnfollowed.following = userWhoUnfollowed.following.filter(
          (followed) => followed.toString() !== userToUnfollow._id.toString()
        );

        // 7. SAVE
        await userWhoUnfollowed.save();
        await userToUnfollow.save();
        res.json({
          status: "Success",
          data: "You are no longer following this user",
          userToUnfollow: userToUnfollow.followers,
          userWhoUnfollowed: userWhoUnfollowed.following,
        });
      }
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// BLOCK USER
const blockCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE USER TO BLOCK
    const userToBlock = await User.findById(req.params.id);

    // 2. FIND THE USER WHO IS BLOCKING
    const userWhoBlocked = await User.findById(req.userAuth);

    // 3 CHECK IF USERTOBLOCK AND USER ARE FOUND
    if (userToBlock && userWhoBlocked) {
      // 4. CHECK IF userToBlock IS ALREADY IN THE userWhoBlocked'S BLOCKED ARRAY
      const isUserAlreadyBlocked = userWhoBlocked.blocked.find(
        (block) => block.toString() === userToBlock._id.toString()
      );
      if (isUserAlreadyBlocked) {
        return next(appErr("You already blocked this user"));
      } else {
        // 5. PUSH userToBlock in to the userWhoBlocked's BLOCKED ARRAY
        userWhoBlocked.blocked.push(userToBlock._id);
      }

      // 6. SAVE
      await userWhoBlocked.save();
      res.json({
        status: "Success",
        data: "You've blocked this user",
        userWhoBlocked: userWhoBlocked.blocked,
      });
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// UNBLOCK USER
const unblockCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE USER TO UNBLOCK
    const userToUnblock = await User.findById(req.params.id);
    // 2. FIND THE USER WHO'S UNBLOCKING
    const userWhoUnblocked = await User.findById(req.userAuth);

    // 3. CHECK IF BOTH USERS ARE FOUND
    if (userToUnblock && userWhoUnblocked) {
      // 4. CHECK IF THE USER IS REALLY BLOCKED
      const isUserBlocked = userWhoUnblocked.blocked.find(
        (unblock) => unblock.toString() === userToUnblock._id.toString()
      );

      // 5. REMOVING THE userToUnblock FROM THE userWhoUnblocked's BLOCKED ARRAY
      if (isUserBlocked) {
        userWhoUnblocked.blocked = userWhoUnblocked.blocked.filter(
          (unblock) => unblock.toString() !== userToUnblock._id.toString()
        );
        await userWhoUnblocked.save();
        res.json({
          status: "Success",
          data: "You've unblocked this user",
          userWhoUnblocked: userWhoUnblocked.blocked,
        });
      } else {
        return next(appErr("You did not block this user"));
      }
    } else {
      return next(appErr("User not found"));
    }
  } catch (error) {
    next(appErr(error.message));
  }
};

// AMDIN BLOCK
const adminBlockUserCtrl = async (req, res, next) => {
  try {
    // FIND THE USER TO BLOCK
    const userToBeBlocked = await User.findById(req.params.id);
    if (!userToBeBlocked) {
      return next(appErr("User not Found", 404));
    }
    // CHANGE THE isBlocked TO TRUE
    userToBeBlocked.isBlocked = true;
    await userToBeBlocked.isBlocked.save();

    res.json({
      status: "success",
      data: " You have successfully blocked this user",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// AMDIN BLOCK
const adminUnblockUserCtrl = async (req, res, next) => {
  try {
    // FIND THE USER TO UnbLOCK
    const userToBeUnblocked = await User.findById(req.params.id);
    if (!userToBeUnblocked) {
      return next(appErr("User not Found", 404));
    }
    // CHANGE THE isBlocked TO FALSE
    userToBeUnblocked.isBlocked = false;
    await userToBeUnblocked.save();

    res.json({
      status: "success",
      data: " You have successfully Unblocked this user",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// UPDATE USER
const updateUserCtrl = async (req, res, next) => {
  const { email, firstName, lastName } = req.body;
  try {
    // CHECK IF EMAIL
    if (email) {
      const emailFound = await User.findOne({ email: email });
      if (emailFound) {
        return next(appErr("Email is already taken", 400));
      }
    }
    // UPDATE THE USER
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      { lastName, firstName, email },
      { new: true, runValidators: true }
    );
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.json(error.message);
  }
};

const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;
  try {
    // CHECK IF USER IS UPDATING PASSWORD
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // UPDATE USER
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          password: hashedPassword,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      res.json({
        status: "Success",
        data: "Password updated  successfully",
      });
    } else {
      return next(appErr("Please provide password field"));
    }
  } catch (error) {
    res.json(error.message);
  }
};



// DELETE USER
const deleteUserCtrl = async (req, res, next) => {
  try {
    // 1. FIND THE USER TO BE DELETED
   await User.findByIdAndDelete(req.userAuth);

    // 2. FIND ALL POSTS BY THE USER TO BE DELETED
    await Post.deleteMany({user: req.userAuth});

    // 3. DELETE ALL COMMENTS OF THE USER
    await Comment.deleteMany({user: req.userAuth});

    // 4. DELETE ALL CATEGORIES OF THE USER
    await Category.deleteMany({user: req.userAuth});

    // 5. DELETE USER
    // await userToDelete.delete();
    res.json({
      status:"success",
      data: "Your account has been deleted",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};


module.exports = {
  register,
  login,
  singleUser,
  allUsers,
  update,
  deleteUser,
  profilePhotoUploadCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  unfollowersCtrl,
  blockCtrl,
  unblockCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updateUserCtrl,
  updatePasswordCtrl,
  deleteUserCtrl,
};
