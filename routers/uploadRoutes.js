import express from "express";
import uploadController from "../controllers/uploadController.js";

export default (User) => {
  const router = express.Router();

  router.post(
    "/",
    uploadController.uploadMiddleware,
    (req, res) => uploadController.uploadImage(req, res, User)
  );

  return router;
};
