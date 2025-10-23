import express from "express"
import path from "path";
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();
import connectDb from "./db/index.js";
import userRouter from "./src/Routes/userRoutes.js";
import adminRouter from "./src/Routes/adminRoutes.js";
import { fileURLToPath } from "url";

connectDb()
const app = express();
app.use(express.json())
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")))

// routes
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || "Something went wrong", });
});

const port = process.env.PORT;
app.listen(process.env.PORT, () => {
  console.log(`server is running at this port ${port} `)
})