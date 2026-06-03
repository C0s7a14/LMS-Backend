import express  from "express";
import cors from "cors";
import dotenv from "dotenv";


import authRoutes from "./routes/authRoutes.js"
import testRoutes from "./routes/testRoutes.js"
import passwordRoutes from "./routes/passwordRoutes.js"
import deviceRoutes from "./routes/deviceRoutes.js";
import coursesRoutes from "./routes/courseRoutes.js"


dotenv.config();
console.log("SERVER CERTO");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.json({ message: "API running"});
});

app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use ("/password", passwordRoutes);
app.use("/devices", deviceRoutes);
app.use("/courses", coursesRoutes)

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
})
