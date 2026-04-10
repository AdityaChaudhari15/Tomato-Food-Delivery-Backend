import 'dotenv/config'
import mongoose from "mongoose"
import dns from 'node:dns'

// Global cache (important for serverless)
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectWithDnsFallback = async () => {
  const MONGO_URL = process.env.MONGO_URL
  if (!MONGO_URL) {
    throw new Error("Please define the MONGO_URL environment variable")
  }

  const options = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  }

  try {
    return await mongoose.connect(MONGO_URL, options)
  } catch (error) {
    const dnsErrors = ["querySrv", "ENOTFOUND", "ECONNREFUSED", "ENODATA"]
    if (dnsErrors.includes(error.syscall) || dnsErrors.includes(error.code)) {
      console.warn("MongoDB SRV DNS lookup failed; retrying with public DNS servers.")
      dns.setServers(["8.8.8.8", "1.1.1.1"])
      return await mongoose.connect(MONGO_URL, options)
    }
    throw error
  }
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = connectWithDnsFallback().then((mongoose) => {
      console.log("MongoDB Connected")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    console.error("MongoDB Error", error)
    throw error
  }

  return cached.conn
}