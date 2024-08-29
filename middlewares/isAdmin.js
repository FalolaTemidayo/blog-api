const verifyToken = require("../utilities/verifyToken");
const getTokenFromHeader = require("../utilities/getTokenFromHeader");
const User = require("../Model/User/User");
const appErr = require("../utilities/appErr")

const isAdmin = async (req, res, next) => {
  // GET TOKEN FROM  HEADERS
  const token = getTokenFromHeader(req);

  // VERIFY TOKEN
  const decodedUser = verifyToken(token);

  // SAVE THE USER INTO REQ OBJ
  req.userAuth = decodedUser.id;

  // FIND THE USER IN THE DATABASE
  const user = await User.findById(decodedUser.id)
  
  // CHECK IF USER IS ADMIN
  if(user.isAdmin){
    return next()
  } else{
    return next(appErr("Access Denied, Admin only", 404))
  }

};

module.exports = isAdmin;
