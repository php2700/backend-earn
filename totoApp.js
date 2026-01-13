import dotenv from 'dotenv'
dotenv.config();
import express from "express";
import path from "path";
import cors from 'cors';
import connectDb from "./db/index.js";
import userRouter from "./src/Routes/userRoutes.js";
import adminRouter from "./src/Routes/adminRoutes.js";
import { fileURLToPath } from "url";
import crypto from 'crypto'
import Razorpay from 'razorpay';

connectDb()
const app = express();
app.use(express.json())
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")))
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 
// app.use("/uploads", express.static(path.join(__dirname, "public", "uploads"))); 

const razorpayInstance = new Razorpay({
  key_id: 'rzp_test_R7z5O0bqmRXuiH',
  key_secret: 'REOqVok223e2pouMXmoryY3A'
});


app.post('/createOrder', (req, res) => {
  let { amount, currency } = req.body;
  const options = {
    amount: amount * 100,
    currency,
    receipt: `order_rcptid_${Date.now()}`
  };
  razorpayInstance.orders.create(options,
    (err, order) => {
      if (!err) {
        res.json(order)
      }
      else
        res.send(err);
    }
  )
});


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