import express from 'express'
import { connectDB } from './db/db'
import authRouter from './routes/auth.route'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express()
connectDB()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173"
}))
app.use('/api/v1/auth', authRouter)
app.get('/', (req, res)=>{
  res.send("Health Check")
})

export default app
