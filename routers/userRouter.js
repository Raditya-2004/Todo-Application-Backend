import express from "express";
import userController from "../controllers/userController.js";

export default (User) => {
  const router = express.Router();

  router.post("/signup", (req, res) => userController.createUser(req, res, User));
  router.post("/login", (req, res) => userController.loginUser(req, res, User));
  router.get("/profile", (req, res) => userController.userProfile(req, res, User));
  router.post("/logout", userController.logoutUser);

  return router;
};
