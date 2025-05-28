import express from "express";
import taskController from "../controllers/taskController.js";

export default (Task, User) => {
  const router = express.Router();

  router.post("/", (req, res) => taskController.createTask(req, res, Task, User));
  router.get("/", (req, res) => taskController.getTasks(req, res, Task, User));
  router.put("/:id", (req, res) => taskController.updateTask(req, res, Task));
  router.delete("/:id", (req, res) => taskController.deleteTask(req, res, Task));

  return router;
};
