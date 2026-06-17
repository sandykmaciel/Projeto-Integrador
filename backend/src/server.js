const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/projects.routes");
const userRoutes = require("./routes/users.routes");
const historyRoutes = require("./routes/history.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const { startNotificationWorker } = require("./services/notificationWorker");
const dashboardRoutes = require("./routes/dashboard.routes");
const tasksRoutes = require("./routes/tasks.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Task Manager API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", tasksRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startNotificationWorker();
});