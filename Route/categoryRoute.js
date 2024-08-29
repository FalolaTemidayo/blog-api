const express = require("express");
const isLogin = require("../middlewares/isLogin");
// FUNCTION IMPORT
const {
  createCategoryCtrl,
  fetchCategoryCtrl,
  getSingleCategory,
  deleteCategory,
  updateCategory,
} = require("../Controller/categoryCtrl");

const categoryRouter = express.Router();

categoryRouter.post("/", isLogin, createCategoryCtrl);
categoryRouter.get("/", fetchCategoryCtrl);
categoryRouter.get("/:id", getSingleCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.put("/:id", updateCategory)

module.exports = categoryRouter;
