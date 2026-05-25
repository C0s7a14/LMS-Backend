import express  from "express";
import cors from "cors";
import dotenv from "dotenv";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.json({ message: "API running"});
});


const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
})