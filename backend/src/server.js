const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Task Manager API is running",
  });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});