import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const taskController = {
  createTask: async (req, res, Task, User) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { task } = req.body;
      if (!task) return res.status(400).json({ error: "Task content missing" });

      const newTask = await Task.create({
        task,
        userId: user.id,
      });

      return res.status(201).json(newTask);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  },

  getTasks: async (req, res, Task, User) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: { model: Task }, // default alias is 'Tasks'
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user.Tasks); // ✅ changed from user.Todos to user.Tasks
  } catch (err) {
    console.error("Error in getTasks:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
},

  updateTask: async (req, res, Task) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { id } = req.params;
      const { task } = req.body;

      const existingTask = await Task.findOne({
        where: { id, userId: decoded.id },
      });

      if (!existingTask)
        return res.status(404).json({ error: "Task not found or unauthorized" });

      existingTask.task = task || existingTask.task;
      await existingTask.save();

      return res.status(200).json(existingTask);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  deleteTask: async (req, res, Task) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { id } = req.params;

      const taskToDelete = await Task.findOne({
        where: { id, userId: decoded.id },
      });

      if (!taskToDelete)
        return res.status(404).json({ error: "Task not found or unauthorized" });

      await taskToDelete.destroy();
      return res.status(200).json({ message: "Task deleted" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};

export default taskController;
