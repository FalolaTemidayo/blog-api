const express = require("express");
const {
  register,
  login,
  allUsers,
  singleUser,
  update,
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
} = require("../Controller/userCtrl");
const isLogin = require("../middlewares/isLogin");
const isAdmin = require("../middlewares/isAdmin");
const userRouter = express.Router();
const multer = require("multer");
const storage = require("../Config/cloudinary");
const upload = multer({storage})

// Register User
userRouter.post("/register", register);

// Login User
userRouter.post("/Login", login);

// All User
userRouter.get("/", allUsers);

// Single User
userRouter.get("/profile/", isLogin, singleUser);

// Update User
userRouter.put("/profile/:id", update);

// Delete User
userRouter.delete("/profile/", isLogin, deleteUserCtrl);

// POST/api/v1/user/profile-photo-upload
userRouter.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
profilePhotoUploadCtrl);

// GET/api/v1/user/profile-viewers/:id
userRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfileCtrl);

// GET/api/v1/user/following/:id
userRouter.get("/following/:id", isLogin, followingCtrl);

// GET/api/v1/user/unfollowing/:id
userRouter.get("/unfollowing/:id", isLogin, unfollowersCtrl);

// GET/api/v1/user/block/:id
userRouter.get("/block/:id", isLogin, blockCtrl);

// GET/api/v1/user/unblock/:id
userRouter.get("/unblock/:id", isLogin, unblockCtrl);

// PUT/api/v1/user/admin-block/:id
userRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl);

// PUT/api/v1/user/admin-block/:id
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnblockUserCtrl);

// UPDATE/api/v1/user//:id 
userRouter.put("/profile/update", isLogin, updateUserCtrl)

//UPDATE/api/v1/user//:id
userRouter.put("/profile/update-password", isLogin, updatePasswordCtrl)




module.exports = userRouter;
