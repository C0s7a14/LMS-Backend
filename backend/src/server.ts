import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import coursesRoutes from "./routes/courseRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import aulaRoutes from "./routes/aulaRoutes.js";
import moduloRoutes from "./routes/moduloRoutes.js";

import { errorMiddleware } from "./middlewares/errorMiddleware.js";

console.log("SERVER CERTO");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API running",
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/test", testRoutes);
app.use("/password", passwordRoutes);
app.use("/devices", deviceRoutes);
app.use("/courses", coursesRoutes);
app.use("/certificates", certificateRoutes);

app.use(moduloRoutes);
app.use(aulaRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});