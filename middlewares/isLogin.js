const verifyToken = require("../utilities/verifyToken");
const getTokenFromHeader = require("../utilities/getTokenFromHeader");

const isLogin = (req, res, next) => {
  // GET TOKEN FROM  HEADERS
  const token = getTokenFromHeader(req);

  // VERIFY TOKEN
  const decodedUser = verifyToken(token);

  // SAVE THE USER INTO REQ OBJ
  req.userAuth = decodedUser.id;
  if (!decodedUser) {
    return res.json({
      msg: "Invalid/Expired token, please login again",
    });
  } else {
    next();
  }
};

module.exports = isLogin;
