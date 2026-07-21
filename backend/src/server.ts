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
import aiCourseRoutes from "./routes/aiCourseRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import aiQuizRoutes from "./routes/aiQuizRoutes.js";
import aiAssessmentRoutes from "./routes/aiAssessmentRoutes.js";
import courseReviewRoutes from "./routes/courseReviewRoutes.js";
import studentHomeRoutes from "./routes/studentHomeRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import aiKnowledgeRoutes from "./routes/aiKnowledgeRoutes.js";
import aiChatRoutes from "./routes/aiChatRoutes.js";
import clientDeviceRoutes from "./routes/clientDeviceRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import adminCourseStatusRoutes from "./routes/adminCourseStatusRoutes.js";
import adminCourseEditRoutes from "./routes/adminCourseEditRoutes.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";
import adminDeviceRoutes from "./routes/adminDeviceRoutes.js";



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
app.use(aiCourseRoutes);
app.use(quizRoutes);
app.use(aiQuizRoutes);
app.use(aiAssessmentRoutes);
app.use(courseReviewRoutes);
app.use(studentHomeRoutes);
app.use(adminDashboardRoutes);
app.use(aiKnowledgeRoutes);
app.use(aiChatRoutes);
app.use(clientDeviceRoutes);
app.use(adminUserRoutes);
app.use(adminCourseStatusRoutes);
app.use(adminCourseEditRoutes);
app.use(adminReportRoutes);
app.use(adminDeviceRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});