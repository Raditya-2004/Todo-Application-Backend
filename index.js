import express from "express";
import { Sequelize, DataTypes } from "sequelize";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import userTable from "./models/userTable.js";
import taskTable from "./models/taskTable.js";
import uploadRoutes from "./routers/uploadRoutes.js";
import userRouter from "./routers/userRouter.js";
import taskRouter from "./routers/taskRouter.js";
import morgan from "morgan";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://todo-application-frontend-x7cb.onrender.com", // React dev server
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Paths for static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/files", express.static(path.join(__dirname, "files"))); // serve uploaded images

// Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }

  // Define models
  const User = userTable(sequelize, DataTypes);
  const Task = taskTable(sequelize, DataTypes);

  // Define relationships
  User.hasMany(Task, { foreignKey: "userId" });
  Task.belongsTo(User, { foreignKey: "userId" });

  // Sync models with DB
  await sequelize.sync();

  // Setup routes after DB is ready
  app.use("/api/upload", uploadRoutes(User));
  app.use("/api/users", userRouter(User));
  app.use("/api/tasks", taskRouter(Task, User));

  // Start server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
