const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const userRouter = require("./Route/userRoute");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const postRouter = require("./Route/postRoutes");
const categoryRouter = require("./Route/categoryRoute");
const commentRouter = require("./Route/commentRoute");

require("./Config/dbConnect");
const app = express();

//MIDDLE WARE
app.use(express.json());
const userAuth = {
  isLogin: true,
  isAdmin: true,
};

app.use((req, res, next) => {
  if (userAuth.isLogin && userAuth.isAdmin) {
    next();
  } else {
    return res.json({
      msg: "Invalid Login Credentials",
    });
  }
});
// Routes
// User

app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/category", categoryRouter);

// ERROR HANDLERS MIDDLEWARE
app.use(globalErrorHandler);

// 404 ERRORS
app.use("*", (req, res) => {
  res.status(404).json({
    message: ` ${req.originalUrl} - Route not found `,
  });
});

// Listen to server

const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`server is running on ${PORT}`));

