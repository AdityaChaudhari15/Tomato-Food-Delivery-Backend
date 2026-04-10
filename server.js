import 'dotenv/config'
import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"

const app = express()

// middleware
app.use(express.json())
app.use(cors())

// cache DB connection (serverless optimization)
let isConnected = false

const connectDatabase = async () => {
  if (!isConnected) {
    await connectDB()
    isConnected = true
    console.log("DB Connected")
  }
}

// middleware to ensure DB connection before every request
app.use(async (req, res, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

// routes
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

// Serve local uploads only in development for backward compatibility.
// New uploads now use Cloudinary and return full image URLs.
// if (process.env.NODE_ENV !== "production") {
//   app.use("/images", express.static("uploads"))
// }

// test route
app.get("/", (req, res) => {
  res.send("API Working ")
})
// global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({ error: error.message || "Internal Server Error" })
})
// EXPORT instead of listen
export default app